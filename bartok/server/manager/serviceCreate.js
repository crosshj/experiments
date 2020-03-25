/*

TODO: if service is set to auto-persist, save to DB as well

*/

const { initService } = require("./instanceInit");

const createServices = async ({ db, manager, arguments }) => {
	const { id, name } = arguments[1];
	const service = db.Service.build({
		id: Number(id),
		name,
		code: JSON.stringify({
			code: [{
				name: "index.js",
				code: `/*\n${name}\n\n*/\n\n\n\n\n\n\n`
			},{
				name: "package.json",
				code: JSON.stringify({
					name,
					description: "",
					template: "",
					port: ""
				}, null, 2)
			}],
			tree: {
				[name]: {
					"index.js": {},
					"package.json": {}
				}
			}
		})
	});
	// console.log({ service });
	// console.log({ arguments });
	const newService = initService(service);
	manager.services.push(newService);
	const { id: _id, code: _code, name: _name, tree: _tree } = newService;
	return [{
		id: _id,
		code: _code,
		name: _name,
		tree: _tree
	}];
};

exports.createServices = createServices;
