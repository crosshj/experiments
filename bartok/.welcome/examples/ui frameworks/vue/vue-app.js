/*
	https://vuejs.org/v2/guide/
*/
(function(){
	if(typeof Vue === 'undefined') return;

	var app = new Vue({ 
		el: '#app',
		data: {
				message: 'Hello Vue!'
		}
	});
})()