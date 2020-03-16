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
	const serviceFilePath = `${dirname}/${name}.service`;
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

const readServices = async ({ manager, arguments }) => {
	//console.log({ arguments });
	if(arguments[0].id){
		return manager.services
			.filter(x => x.id === Number(arguments[0].id))
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
	console.log({ arguments });
};

function handle({ name, db, manager }) {
	return async function () {
		if(name === 'read'){
			return await readServices({ manager, arguments });
		}
		if(name === 'update'){
			return await updateService({ manager, arguments });
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