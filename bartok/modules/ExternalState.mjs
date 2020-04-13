const defaultTree = {
	"LOCAL": {
		"index.js": {}
	}
};

const defaultCode = [{
	name: "index.js",
	code: "/*\n\nCould not find a server!\n\nWorking in Local Storage mode!\n\n*/"
}];

const defaultServices = [{
	id: 999,
	name: 'LOCAL',
	tree: defaultTree,
	code: defaultCode
}];

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
			saveServiceToLS(lsServices, {
				id: id+"",
				name,
				code: [{
					name: "index.js",
					code:
`const serviceName = '${name}';
const send = (message) => {
	if (process.send) {
		process.send(\`\${serviceName}: \${message}\`);
	} else {
		console.log(message);
	}
};

process.on('message', parentMsg => {
	const _message = parentMsg + ' PONG.';
	send(_message);
});
`
				}, {
					name: "package.json",
					code: JSON.stringify({
						name,
						main: "index.js",
						description: "",
						template: "",
						port: ""
					}, null, '\t')
				}],
				tree: {
					[name]: {
						"index.js": {},
						"package.json": {}
					}
				}
			});
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