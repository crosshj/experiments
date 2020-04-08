import { attachListeners } from './events/operations.mjs';

function getOperations(updateAfter, readAfter) {
	const operations = [{
		url: ''
	}, {
		name: 'create',
		url: 'service/create',
		config: {
			method: 'POST',
			name: 'test-service',
			body: {
				name: 'test-service'
			}
		},
		after: updateAfter
	}, {
		name: 'read',
		url: 'service/read/{id}',
		after: readAfter
	}, {
		name: 'update',
		url: 'service/update',
		config: {
			method: 'POST'
		},
		after: updateAfter
	}, {
		name: 'delete',
		url: 'service/delete',
		config: {
			method: 'POST'
		},
	}, {
		name: 'manage',
		url: 'manage'
	}, {
		name: 'monitor',
		url: 'monitor'
	}, {
		name: 'persist',
		url: 'persist'
	}];
	operations.forEach(x => {
		x.url = `http://localhost:3080/${x.url}`;
		if (x.config && x.config.body) {
			x.config.body = JSON.stringify(x.config.body);
		}
	});
	return operations;
}

function getReadAfter(List, inlineEditor, getCodeFromService) {
	return ({ result = {} } = {}) => {
		const services = result.result;
		if (services.length && !services[0].code) {
			result.listOne = true;
		}
		if (services.length > 1 || result.listOne) {
			document.querySelector('#project-splitter')
				.style.display = "none";
			List({ services });
		}
		else {
			document.querySelector('#project-splitter')
				.style.display = "";
			const service = services[0];
			if (!service) {
				return inlineEditor({ code: "", name: "", id: "", filename: "" });
			}
			const { code, name, id, filename } = getCodeFromService(services[0]);
			inlineEditor({ code, name, id, filename });
		}
	};
}

function getUpdateAfter(getCodeFromService, inlineEditor) {
	return ({ result }) => {
		const services = result.result;
		const { code, name, id, filename } = getCodeFromService(services[0]);
		inlineEditor({ code, name, id, filename });
	};
}

async function performOperation(operation, eventData = {}, externalStateRequest) {
	const { body = {}, after } = eventData;
	if (operation.name !== "read") {
		body.id = body.id === 0
			? body.id
			: body.id || (currentService || {}).id;
	}
	let { id } = body;
	if(id === "*"){
		id = '';
	}
	const op = JSON.parse(JSON.stringify(operation));
	op.after = after || operation.after;
	op.url = op.url.replace('{id}', id || '');
	op.config = op.config || {};
	op.config.headers = {
		...{
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}, ...((op.config || {}).headers || {})
	};
	if (op.config.method !== "POST") {
		delete op.config.body;
	}

	//, externalStateRequest
	const result = await externalStateRequest(op);

	if (op.after) {
		op.after({ result });
	}
	const event = new CustomEvent('operationDone', {
		bubbles: true,
		detail: {
			op: operation.name,
			id,
			result: result.result
		}
	});
	document.body.dispatchEvent(event);
	//console.log({ operation, data });
}

const operationsListener = async (
	e, {
		operations, managementOp, performOperation, externalStateRequest,
		getCurrentFile, getCurrentService
	}) => {
	const currentFile = getCurrentFile();
	const currentService = getCurrentService();

	// console.log(e.detail);
	const manageOp = managementOp(e, currentService, currentFile);
	let eventOp = (manageOp || {}).operation || e.detail.operation;
	if (eventOp === 'cancel') {
		const foundOp = operations.find(x => x.name === 'read');
		performOperation(foundOp, { body: { id: '' } }, externalStateRequest);
		return;
	}
	// this updates project with current editor window's code
	if (eventOp === 'update') {
		// console.log(JSON.stringify({ currentService}, null, 2));
		const files = JSON.parse(JSON.stringify(currentService.code));
		(files.find(x => x.name === currentFile) || {})
			.code = e.detail.body.code;
		e.detail.body.code = JSON.stringify({
			tree: currentService.tree,
			files
		});
	}
	if (eventOp === 'updateProject') {
		// console.log(JSON.stringify({ currentService}, null, 2));
		const files = JSON.parse(JSON.stringify(currentService.code));
		e.detail.body.code = JSON.stringify({
			tree: currentService.tree,
			files
		});
		e.detail.body.id = currentService.id;
		e.detail.body.name = currentService.name;
		eventOp = "update";
	}
	const foundOp = operations.find(x => x.name === eventOp);
	if (!foundOp) {
		console.error('Could not find operation!');
		console.error({ eventOp, manageOp });
		e.detail.done && e.detail.done('ERROR\n');
		return;
	}
	foundOp.config = foundOp.config || {};
	//foundOp.config.body = foundOp.config.body ? JSON.parse(foundOp.config.body) : undefined;
	if (foundOp.name !== "read") {
		e.detail.body.id = e.detail.body.id === 0
			? e.detail.body.id
			: e.detail.body.id || (currentService || {}).id;
	}
	e.detail.body.id = e.detail.body.id || currentService.id;
	e.detail.body.name = e.detail.body.name || currentService.name;
	foundOp.config.body = JSON.stringify(e.detail.body);
	await performOperation(foundOp, e.detail, externalStateRequest);
	e.detail.done && e.detail.done('DONE\n');
};

async function Operations({
	getCodeFromService, managementOp, externalStateRequest,
	getCurrentFile, getCurrentService,
	inlineEditor, List
}) {
	const readAfter = getReadAfter(List, inlineEditor, getCodeFromService);
	const updateAfter = getUpdateAfter(getCodeFromService, inlineEditor);
	const operations = getOperations(updateAfter, readAfter);

	// handles operation events, mainly service events
	document.body.addEventListener(
		'operations',
		(e) => operationsListener(e, {
			operations, managementOp, performOperation, externalStateRequest,
			getCurrentFile, getCurrentService
		}),
		false);

	// handles only file/folder management ops fired using new event pattern
	// will modify state, will fire events
	attachListeners({
		managementOp, performOperation, externalStateRequest,
		getCurrentFile, getCurrentService,
		operations
	});

	//TODO: this should go away at some point!!!
	const foundOp = operations.find(x => x.name === 'read');
	await performOperation(foundOp, { body: { id: 999 } }, externalStateRequest);
}

export default Operations;


