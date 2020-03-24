const childProcess = require('child_process');
const fs = require('fs');

const dirname = `${__dirname}/../__services`;

function isDirSync(aPath) {
  try {
    return fs.statSync(aPath).isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
}


const createV0Service = function(service){
	const { id, name } = service;
	const defaultCode = `
		process.on('message', parentMsg => {
			const _message = '${name} : ' + parentMsg + ' PONG.';
			if (process.send) {
				process.send(_message);
			} else {
				console.log(_message);
			}
		});
	`;

	service.code = service.code || defaultCode;
	const serviceFilePath = `${dirname}/.${name}.service`;
	if (!fs.existsSync(dirname)) {
		fs.mkdirSync(dirname);
	}
	fs.writeFileSync(serviceFilePath, service.code);
	return serviceFilePath;
};


const createTree = (path, tree, files) => {
	//console.log({ path, tree, files });
	const thisName = path.split('/')[path.split('/').length-1];
	const thisFile = files.find(x => x.name === thisName);

	const keys = Object.keys(tree);

	// is a file or empty dir
	if(!keys.length){
		//console.log({ path, keys })
		thisFile && fs.writeFileSync(path, thisFile.code);
		return;
	}

	//otherwise, it's a directory
	if (!fs.existsSync(path)) {
		//console.log(`created: ${path}`);
		fs.mkdirSync(path);
	}
	for(var i=0, len=keys.length; i < len; i++){
		const _path = path + '/' + keys[i];
		createTree(_path, tree[keys[i]], files);
	}
};

const createV1Service = function(service, codeObject){
	const { name } = service;

	if(!service.tree){
		service.code = codeObject.files || codeObject.code;
		service.tree = codeObject.tree;
	}

	//console.log(JSON.stringify({ codeObject, service }, null, 2));

	const serviceFilePath = `${dirname}/.${name}.service`;
	if (!fs.existsSync(dirname)) {
		//console.log(`created: ${dirname}`)
		fs.mkdirSync(dirname);
	}
	const serviceFilePathDir = isDirSync(serviceFilePath);
	if(fs.existsSync(serviceFilePath) && !serviceFilePathDir){
		fs.unlinkSync(serviceFilePath)
	}

	if (!fs.existsSync(serviceFilePath)) {
		//console.log(`created: ${serviceFilePath}`)
		fs.mkdirSync(serviceFilePath);
	}
	if(!codeObject.files){
		//console.log(JSON.stringify(codeObject))
	}
	createTree(serviceFilePath, service.tree[name], codeObject.files || service.code);
	service.code = codeObject.files || service.code;

	return serviceFilePath + '/index.js'; //TODO: this might not be the entry point
};


const initService = (service) => {
	const { id, name } = service;

	let codeObject;
	try{
		codeObject = JSON.parse(service.code);
	}catch(e){
		// console.log('Parsing service code failed');
		// console.log(e);
	}

	const serviceFilePath = codeObject
		? createV1Service(service, codeObject)
		: createV0Service(service);

	const options = {
		slient: true,
	};
	service.instance = childProcess.fork(serviceFilePath, [], options);
	service.instance.on('message', message => {
		console.log(`CHILD ${id} : ${message}`);
	});
	service.instance.send('PING.');

	// service.id === 11 && console.log(JSON.stringify({
	// 	code: service.code, tree: service.tree
	// }, null, 2));

	return service;
};

module.exports = {
	initService
};
