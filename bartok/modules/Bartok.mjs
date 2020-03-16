async function bartok(){
	const operations = [{
			url: ''
		}, {
			url: 'service/create',
			config: {
				method: 'POST',
				name: 'test-service',
				body: {
					name: 'test-service'
				}
			}
		}, {
			url: 'service/read'
		}, {
			url: 'service/update',
			config: {
				method: 'POST',
				name: 'test-service'
			}
		}, {
			url: 'service/delete',
			config: {
				method: 'POST',
				name: 'test-service'
			}
		}, {
			url: 'manage'
		}, {
			url: 'monitor'
		}, {
			url: 'persist'
	}];

	operations.forEach(x => {
		x.url = `http://localhost:3080/${x.url}`;
		if(x.config && x.config.body){
			x.config.body = JSON.stringify(x.config.body);
		}
	});


	for(var i=0, len= operations.length; i<len; i++){
		const operation = operations[i];
		const response = await fetch(operation.url, operation.config);
		const data = await response.json();
		console.log({ operation, data });
	}

}

export default bartok;
