const deps =[
	'./shared.styl'
];

(async () => {

	await appendUrls(deps);

	const settle = [
		250, // grocery
		41, // lil caesars
		178, // jollibee
		121, // hotel
		65, // korean food
		20, // hexagonal table
	].reduce((a,b) => a+b, 0);
	console.log(settle)
	// total ~675

	function aileen(){
		(new Array(3))
			.fill()
			.forEach(x =>
			console.info('Pete the ween and Zoe the B*')
		);
	}

	await prism('javascript', aileen.toString())
	aileen()

	var Harrison = [];

	for (var i = 1; i < 3; i += 4) {
		Harrison.push(i);
	}

	var Pete = [];

	for (var z = 0; z < 45; z += 3) {
		Pete.push(z);
	}

	function replacer(i, val) {
		if(Array.isArray(val)){
			return '['+val.join(', ')+']'
		}
		return val
	}
	await prism("json", JSON.stringify({Harrison, Pete}, replacer, 2))


})();
