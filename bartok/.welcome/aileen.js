const deps =[
	'./shared.styl'
];

(async () => {

	await appendUrls(deps);

	const settle = [
		43, //uber eats
		28, //2 rides uber - target walmart
		8, //BP drinks
		46, //firehouse
		10, //uber unkown
		13, //starbucks
		40, //kids allowance 11/13
		40, //kids allowance 11/20
		250, //grocery 11/20
		195, // philippines
		300, // clothes
	].reduce((a,b) => a+b, 0);
	console.log(settle)
	// total ~975

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
