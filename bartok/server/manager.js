const { persistServices } = require("./manager/persist");

const { instanceKill } = require("./manager/instanceKill");

const { createServices } = require("./manager/serviceCreate");
const { readServices } = require("./manager/serviceRead");
const { updateService } = require("./manager/serviceUpdate");
const { deleteService } = require("./manager/serviceDelete");

const { initService } = require("./manager/instanceInit");

/*

communicate between children without going through parent:
https://stackoverflow.com/a/47501318

*/

const initManager = async ({ db }) => {
	const manager = {
		services: await db.read()
	};

	//console.log(manager.services.filter(x => x.name === 'bartokv0.2').map(x => x.toJSON()));
	manager.services = manager.services.map(initService);

	function exitHandler(options, exitCode) {
		instanceKill(manager.services);
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

// REFACTOR: this is redundant
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
			return await persistServices({ db, manager, arguments });
		}
		process.stdout.write(name + ' -');
		return arguments;
	}
}

// REFACTOR: this is redundant
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