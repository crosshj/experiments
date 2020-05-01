// NOTE: for now, code is a bundle of tree + files
const getFiles = (name, _code={}) => {
	if(_code.code && _code.tree){
		return {
			code: _code.code,
			tree: _code.tree
		};
	}
	let _tree = {
		[name]: {
			"index.js": {},
			"package.json": {}
		}
	};
	let _files = [{
		name: "index.js",
		code: _code
	}, {
		name: "package.json",
		code: JSON.stringify({ name }, null, 2)
	}];
	try {
		const { tree, files } = JSON.parse(_code);
		_tree = tree;
		_files = files;
	}
	catch (e) {
		//console.log('error parsing file bundle from service code');
		//console.log(e);
	}
	return {
		code: _files,
		tree: _tree
	};
};

const readServices = async ({ manager, arguments }) => {
	//console.log({ arguments });
	if (arguments[0].id) {
		return manager.services
			.filter(x => Number(x.id) === Number(arguments[0].id))
			.map(x => {
				// if(!x.code){
				// 	console.log(JSON.stringify(x, null, 2))
				// }
				const { id: _id, name } = x;
				let tree, code;
				if(x.code && x.tree){
					({ tree, code } = x);
				} else {
					({ tree, code } = getFiles(name, x.code));
				}
				return {
					id: _id,
					tree,
					code,
					name
				};
			});
	}
	// filter on id if passed
	return manager.services.map(x => {
		const { id: _id, name } = x;
		return {
			id: _id,
			name
		};
	});
};
exports.readServices = readServices;
