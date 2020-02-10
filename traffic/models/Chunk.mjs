function Chunk(chunkdef) {
	this.init(chunkdef);
}

Chunk.prototype = {
	init: function (chunkdef) {
		Object.keys(chunkdef).forEach(key => {
			this[key] = chunkdef[key];
		});
	}
};

export default Chunk;
