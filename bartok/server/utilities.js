// REFACTOR: this is redundant - add to manager.js
function handler(handlerfns, name){
	return async (req, res) => {
		let result;
		try {
			result = await handlerfns[name](req.params, req.body);
		}catch(e){
			console.log(e)
			process.stdout.write(name + ' - ');
		}
		res.json({ message: name, result });
	}
}

var cors = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};

module.exports = {
	handler, cors
};
