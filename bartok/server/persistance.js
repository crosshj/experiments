class Persistence {
	constructor(){

	}

	async init(){
		delete this.init;
		return this;
	}

	async create(){
		console.log('create')
	}

	async read(){
		console.log('read')
	}

	async update(){
		console.log('update')
	}

	async delete(){
		console.log('delete')
	}
}

async function init(config = {}){
	const persist = new Persistence(config);
	const instance = await persist.init();
	return instance;
}

module.exports = { init };