var request = require('request');

function rangerBasics(){
	var rangerBasicsUrl = 'https://rangers.lerico.net/api/getRangersBasics';
	request(rangerBasicsUrl, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body)
	  }
	})
}

rangerBasics()
