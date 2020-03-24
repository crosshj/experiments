/*

TODO: if service is set to auto-persist, save to DB as well

*/

const { initService } = require("./instanceInit");

const createServices = async ({ manager, arguments }) => {
	const { id, code, name } = arguments[1];
	const service = {};
	// console.log({ service });
	// console.log({ arguments });
	service.id = id;
	service.name = name;
	service.code = code;
	const newService = initService(service);
	manager.services.push(newService);
	const { id: _id, code: _code, name: _name } = newService;
	return [{
		id: _id,
		code: _code,
		name: _name
	}];
};

exports.createServices = createServices;
