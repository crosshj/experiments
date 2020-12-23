const deps =[
	'./shared.styl'
];

(async () => {

	await appendUrls(deps);

	const settle = [
		//250, // grocery (already paid)
		50, // uber eats KFC
		66, // dominoes
		55, // uber eats
		80, // kids allowance this week and prior
		100, // shoes/clothes
		30, // uber to/from shoes/clothes
	].reduce((a,b) => a+b, 0);
	console.log(JSON.stringify({ settle }))
	// total ~381

	function aileen(){
		(new Array(3))
			.fill()
			.forEach(x => {
				//console.info('Pete the ween and Zoe the B*')
			});
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


	for(var d=1; d< 5; d++){
		console.info(d)
	}

})();
