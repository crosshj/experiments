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

const initService = (serviceDef) => {
	const { id, name } = serviceDef;

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
	const serviceFilePath = `${dirname}/${name}.service`;
	if (!fs.existsSync(dirname)) {
		fs.mkdirSync(dirname);
	}
	fs.writeFileSync(serviceFilePath, code);

	const options = {
		stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
		slient:true,
		detached:true
	};

	service = childProcess.fork(serviceFilePath, [], options)
	service.on('message', message => {
		console.log(`CHILD ${id} : ${message}`);
	});
	service.send('PING.')
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


function handle({ name, db, manager }) {
	return function () {
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