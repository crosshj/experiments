let childProcess;
function createNodeInstance(serviceFilePath, id, name, args=[]){
	childProcess = childProcess || require('child_process');

	const options = {
		slient: true,
	};
	const instance = childProcess.fork(serviceFilePath, args, options);

	instance.on('message', message => {
		console.log(`CHILD ${id} : ${message}`);
	});
	instance.send('PING.');

	return instance;
}

// https://pm2.keymetrics.io/docs/usage/pm2-api/
let pm2;
function createPM2Instance(serviceFilePath, id, name, args){
	pm2 = pm2 || require('pm2');

	if(id !== 8){
		return {
			kill: () => {
				//console.trace();
				console.log(`OMG TODO KILL - PM2: ${id} ${name}`);
				// find the process using service name and pm2 list
				// pm2.delete(process, errback)
			}
		};
	}

	console.log({ serviceFilePath: serviceFilePath });

	const instance = {
		kill: () => {
			//console.trace();
			// pm2.list()
			console.log({ death: instance.apps})

			console.log(`OMG TODO KILL - PM2: ${id} ${name}`);
			// find the process using service name and pm2 list
			// pm2.delete(process, errback)
			instance.apps.map(a => pm2.delete(a.pm_id, (err) => {
				err && console.log(err)
				!err && console.log('killed')
			}));
		}
	};


	const noDaemonMode = true;
	const options = {
		name: name.replace(/\s/g, '_'),
		script: serviceFilePath,
		interpreter: 'node',
		//script: 'index.js',
		//cwd: serviceFilePath.replace('manager/../', '').replace('/Library/Repos/experiments/bartok', '').replace('index.js', ''),
		exec_mode : 'cluster',        // Allows your app to be clustered
		instances : 2,                // Optional: Scales your app by 4
		//max_memory_restart : '100M'   // Optional: Restarts your app if it reaches 100Mo
	};
	const errCallback = (err, apps) => {
		console.log({ apps })
		instance.apps = apps;
		console.log(JSON.stringify({ err }, null, 2));
		console.log(`PM2: ${id} ${name}`);
		pm2.disconnect();   // Disconnects from PM2
		if (err) throw err
	};
	pm2.connect(noDaemonMode, function(err) {
		if (err) {
			console.error(err);
			process.exit(2);
			return;
		}

		pm2.start(options, errCallback);
	});



	return instance;
}



const usePM2 = false;
function createInstance(serviceFilePath, id, name, args){
	if(usePM2){
		return createPM2Instance(serviceFilePath, id, name, args);
	}
	return createNodeInstance(serviceFilePath, id, name, args);
}

module.exports = {
	createInstance
};
