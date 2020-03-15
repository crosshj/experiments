async function bartok(){
	const operations = [
		'',
		'service/create', 'service/read', 'service/update', 'service/delete',
		'manage', 'monitor', 'persist'
	];

	for(var i=0, len= operations.length; i<len; i++){
		const operation = operations[i];
		const serverUrl = `http://localhost:3080/${operation}`;
		let response = await fetch(serverUrl);
		let data = await response.json();
		console.log({ operation, data });
	}

}

export default bartok;
