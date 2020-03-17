// https://www.codementor.io/@teodeleanu/how-to-use-sequelize-orm-in-your-express-application-u5d78po6f

let Service;

class Persistence {
	constructor(){

	}

	async init(){
		const db = require('./db').init();
		Service = db.Service;
		// creates/overwrites(if force is true)
		await Service.sync({ force: false });
		return this;
	}

	async create(service={}){
		try {
			if(!service.name){
				service.name = `${Math.random()}`;
			}
			//process.stdout.write('create - ')
			console.log();

			 // creates/overwrites(if force is true)
			//await Service.sync({ force: true });
			const newService = await Service.create(service);
			return newService;
		} catch(e){
			console.log(e.toString().split('\n')[0]);
			return;
		}
	}

	async read(id){
		try {
			//process.stdout.write('read - ')
			console.log();
			let services;
			if(id){
				let service = await Service.findOne({where: {id}})
				services = [ service ];
			} else {
				services = await Service.findAll({});
			}
			//console.log({ services })
			return services;
		} catch(e){
			console.log(e.toString().split('\n')[0]);
			return;
		}
	}

	async update(){
		process.stdout.write('update - ')
	}

	async delete(){
		process.stdout.write('delete - ')
	}
}

async function init(config = {}){
	const persist = new Persistence(config);
	const instance = await persist.init();
	return instance;
}

module.exports = { init };