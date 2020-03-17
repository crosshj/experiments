/*

communicate between children without going through parent:
https://stackoverflow.com/a/47501318



*/


const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const dirname = `${__dirname}/__services`;

var deleteFolderRecursive = function (path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

const initService = (service) => {
	const { id, name } = service;

	// TODO: consider cleaner handling of workers
	// https://www.npmjs.com/package/adios

	// TODO: be safer, better & wrap this code
	// jailed - https://github.com/asvd/jailed
	// filtrex - https://github.com/crosshj/experiments/blob/gh-pages/svg/engine-src/expressionEngine.js
	const code = `
		process.on('message', parentMsg => {
			const _message = '${name} : ' + parentMsg + ' PONG.';
			if (process.send) {
				process.send(_message);
			} else {
				console.log(_message);
			}
		});
	`;
	service.code = service.code || code;
	const serviceFilePath = `${dirname}/.${name}.service`;
	if (!fs.existsSync(dirname)) {
		fs.mkdirSync(dirname);
	}
	fs.writeFileSync(serviceFilePath, service.code);

	const options = {
		slient:true,
		//detached:true
	};

	service.instance = childProcess.fork(serviceFilePath, [], options)
	service.instance.on('message', message => {
		console.log(`CHILD ${id} : ${message}`);
	});
	service.instance.send('PING.')
	return service;
};

const initManager = async ({ db }) => {
	const manager = {
		services: await db.read()
	};
	manager.services = manager.services.map(initService);
	//console.log(manager.services);

	function exitHandler(options, exitCode) {
		//also kill all services in manager.services?
		deleteFolderRecursive(dirname);
		manager.services.forEach(s => s.instance.kill());
		//if (options.cleanup) console.log('clean');
		//if (exitCode || exitCode === 0) console.log(exitCode);
		if (options.exit) process.exit(exitCode);
	}


	//do something when app is closing
	process.on('exit', exitHandler.bind(null, { cleanup: true }));

	//catches ctrl+c event
	process.on('SIGINT', exitHandler.bind(null, { exit: true }));

	// catches "kill pid" (for example: nodemon restart)
	process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
	process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

	//catches uncaught exceptions
	process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

	return manager;
};

const createServices = async ({ manager, arguments }) => {
	const { id, code, name } = arguments[1];
	const service = {};
	// console.log({ service });
	// console.log({ arguments });
	service.id = id;
	service.name = name;
	service.code = code;

	const newService = initService(service);
	manager.services.push(newService);
	const { id: _id, code: _code, name: _name } = newService;
	return [ { id: _id, code: _code, name: _name } ];
};

const readServices = async ({ manager, arguments }) => {
	//console.log({ arguments });
	if(arguments[0].id){
		return manager.services
			.filter(x => Number(x.id) === Number(arguments[0].id))
			.map(x => {
				const { id: _id, code, name } = x;
				return { id: _id, code, name };
			});
	}
	// filter on id if passed
	return manager.services.map(x => {
		const { id: _id, name } = x;
		return { id: _id, name };
	});
};

const updateService = async ({ manager, arguments }) => {
	const { id, code, name } = arguments[1];
	const service = manager.services.find(x => x.id === Number(id));
	// console.log({ service });
	// console.log({ arguments });
	service.name = name || service.name;
	service.code = code || service.code;

	service.instance.kill(); // maybe better to send a kill message and confirm death
	const updatedService = initService(service);
	const { id: _id, code: _code, name: _name } = updatedService;
	return [ { id: _id, code: _code, name: _name } ];
};

const deleteService = async ({ manager, arguments }) => {
	const { id, code, name } = arguments[1];
	const service = manager.services.find(x => Number(x.id) === Number(id));
	service.instance && service.instance.kill(); // maybe better to send a kill message and confirm death

	manager.services = manager.services.filter(x => x.id !== Number(id));
	return manager.services;
};

const persistServices = async ({ db, manager, arguments }) => {
	const dbServices = await db.read();
	for(var i=0, len = manager.services.length; i<len; i++){
		const service = manager.services[i];
		if(!dbServices.find(d => Number(d.id) === Number(service.id))){
			await db.create({
				name: service.name,
				code: service.code,
				id: service.id
			});
		} else {
			await service.save();
		}
	}
	for(var i=0, len = dbServices.length; i<len; i++){
		const dbService = dbServices[i];
		if(!manager.services.find(m => Number(m.id) === Number(dbService.id))){
			await dbService.destroy();
		}
	}

	return manager.services.map(x => {
		const { id: _id, name } = x;
		return { id: _id, name };
	});
};

function handle({ name, db, manager }) {
	return async function () {
		if(name === 'create'){
			return await createServices({ manager, arguments });
		}
		if(name === 'read'){
			return await readServices({ manager, arguments });
		}
		if(name === 'update'){
			return await updateService({ manager, arguments });
		}
		if(name === 'delete'){
			return await deleteService({ manager, arguments });
		}
		if(name === 'persist'){
			console.log('persist');
			return await persistServices({ db, manager, arguments });
		}
		process.stdout.write(name + ' -');
		return arguments;
	}
}
const initHandlers = ({ db, manager }) => ({
	create: handle({ name: 'create', db, manager }),
	read: handle({ name: 'read', db, manager }),
	update: handle({ name: 'update', db, manager }),
	delete: handle({ name: 'delete', db, manager }),
	manage: handle({ name: 'manage', db, manager }),
	monitor: handle({ name: 'monitor', db, manager }),
	persist: handle({ name: 'persist', db, manager })
});

async function init({ db }) {
	const manager = await initManager({ db });
	return initHandlers({ db, manager })
}

module.exports = { init };