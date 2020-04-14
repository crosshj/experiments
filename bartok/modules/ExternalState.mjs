const defaultCode = (_name) => [{
	name: "index.js",
	code:
`const serviceName = '${_name}';

const send = (message) => {
	const serviceMessage = \`\${serviceName}: \${message}\`;
	(process.send || console.log)
		.call(null, \`\${serviceName}: \${message}\`);
};

process.on('message', parentMsg => {
	const _message = parentMsg + ' PONG.';
	send(_message);
});
`
}, {
	name: "package.json",
	code: JSON.stringify({
		name: _name,
		main: "index.js",
		description: "",
		template: "",
		port: ""
	}, null, '\t')
}];

const defaultTree = (_name) => ({
	[_name]: {
		"index.js": {},
		"package.json": {}
	}
});



const defaultServices = [{
	id: 1,
	name: 'API Server',
	tree: defaultTree('API Server'),
	code: defaultCode('API Server')
}, {
	id: 10,
	name: 'UI Service',
	tree: defaultTree('UI Service'),
	code: defaultCode('UI Service')
}, {
	id: 90,
	name: 'Local Storage Service',
	tree: defaultTree('Local Storage Service'),
	code: defaultCode('Local Storage Service')
}];

const dummyService = (_id, _name) => ({
	id: _id+"",
	name: _name,
	code: defaultCode(_name),
	tree: defaultTree(_name)
});

const getServicesFromLS = () => {
	try{
		return JSON.parse(localStorage.getItem('localServices'));
	} catch(e){
		return;
	}
};

const saveServiceToLS = (currentServices=[], service) => {
	try{
		const serviceToUpdate = currentServices.find(x => Number(x.id) === Number(service.id));
		if(!serviceToUpdate){
			currentServices.push(service);
		} else {
			serviceToUpdate.name = service.name;
			serviceToUpdate.id = service.id;
			serviceToUpdate.code = JSON.parse(service.code).files;
			serviceToUpdate.tree = JSON.parse(service.code).tree;
		}
		localStorage.setItem('localServices', JSON.stringify(currentServices));
	} catch(e){
		return;
	}
};

let lsServices = [];

async function externalStateRequest(op){
	//debugger
	//console.log(op.name);

	let result;
	try {
		const response = await fetch(op.url, op.config);
		result = await response.json();
	} catch (e) {
		lsServices = getServicesFromLS() || defaultServices;

		if(op.name === "update"){
			if(!op.config || !op.config.body){
				console.error("when updating, should have an operation body");
				return;
			}
			let serviceToUpdate;
			try {
				serviceToUpdate = JSON.parse(op.config.body);
			}catch(e){}

			if(!serviceToUpdate){
				console.error("when updating, operation body should be service to update");
				return;
			}
			if(!serviceToUpdate.name || !serviceToUpdate.id){
				console.error("service to update is malformed!");
				return;
			}
			debugger
			saveServiceToLS(lsServices, serviceToUpdate);
			lsServices = getServicesFromLS() || [];
			//console.log(JSON.stringify(op, null, 2));
		}

		if(op.name === "create"){
			const { id, name, code } = JSON.parse(op.config.body);

			saveServiceToLS(lsServices, dummyService(id, name));
			lsServices = getServicesFromLS() || [];
			debugger
		}

		if(op.name === "delete"){
			const { id } = JSON.parse(op.config.body);
			lsServices = getServicesFromLS() || [];
			lsServices = lsServices
				.filter(x => Number(x.id) !== Number(id));
			localStorage.setItem('localServices', JSON.stringify(lsServices));
		}

		var readId = op.name === "read" && op.url.split('read/')[1];
		if(readId){
			return {
				result: lsServices.filter(x => Number(x.id) === Number(readId))
			};
		}

		result = {
			result: lsServices //.sort((a, b) => Number(a.id)-Number(b.id))
		};
	}
	return result;
}

export { externalStateRequest };