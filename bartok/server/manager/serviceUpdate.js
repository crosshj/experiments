const { initService } = require("./instanceInit");

const updateService = async ({ manager, arguments }) => {
	const { id, code, name } = arguments[1];
	const service = manager.services.find(x => x.id === Number(id));
	// console.log({ service });
	// console.log({ arguments });
	service.name = name || service.name;
	service.code = code || service.code;
	service.instance.kill(); // maybe better to send a kill message and confirm death
	const updatedService = initService(service);
	const { id: _id, code: _code, name: _name, tree: _tree } = updatedService;

	// console.log({
	// 	_tree, _code
	// })
	return [{
		id: _id,
		code: _code,
		name: _name,
		tree: _tree
	}];
};

exports.updateService = updateService;
