import { attach } from '../Listeners.mjs';

let tempHash, tempStrLen;

const templatesListener = ({ updateTemplates }) => (event) => {
	const { detail } = event;
	const { op, operation, id:serviceId, result } = detail;

	const readAllServices = op === "read" && result.length > 1;
	const readOneService = op === "read" && result.length === 1;

	const isPersist = op === "persist";
	const isUpdate = op === "update";

	const isUpdateRequest = operation === "update";
	const isPersistRequest = operation === "persist";


	// readAllServices and isPersist might be useful for service level templates
	if(readAllServices || isUpdateRequest || isPersist || isPersistRequest){
		return;
	}

	if(!readOneService && !isUpdate){
		return console.error('templates listener error reading templates');
	}

	const { code, id, name, tree } = result[0];
	const templatesTree = tree[name]['.templates'];

	const templates = Object.keys(templatesTree)
		.map(k =>
			code.find(c => c.name === k)
		);
	const hashCode = s => {
		let h = 0;
		for(var i=0, len=s.length; i<len; i++){
			h = Math.imul(31,h) + s.charCodeAt(i)|0;
		}
		return h;
	};
	const templateString = JSON.stringify(templates);
	let templateHash;

	// new
	if(!tempStrLen || !tempHash){
		tempHash = hashCode(templateString);
		tempStrLen = templateString.length;
		updateTemplates(templates);
		return;
	}

	if(templateString.length === tempStrLen){
		templateHash = hashCode(templateString);
		if(templateHash === tempHash){
			return;
		}
	} else {
		templateHash = hashCode(templateString);
	}

	//console.log({ tempHash, templateHash, tempStrLen, tsLen: templateString.length})

	tempHash = templateHash;
	tempStrLen = templateString.length;
	updateTemplates(templates);
}

function attachListeners({
	updateTemplates
}){
	attach({
		name: 'Templates',
		eventName: 'operations',
		listener: templatesListener({ updateTemplates })
	});
	attach({
		name: 'Templates',
		eventName: 'operationDone',
		listener: templatesListener({ updateTemplates })
	});
}

export {
	attachListeners
};
