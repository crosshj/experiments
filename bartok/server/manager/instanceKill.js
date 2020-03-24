const fs = require('fs');

const dirname = `${__dirname}/../__services`;

var deleteFolderRecursive = function (path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

function instanceKill(services) {
	// TODO: should also delete file(s) for service
	// next is a bad way to do that
	if(services.length > 1){
		deleteFolderRecursive(dirname);
	}
	services.forEach(s => s.instance.kill());
}

exports.instanceKill = instanceKill;
