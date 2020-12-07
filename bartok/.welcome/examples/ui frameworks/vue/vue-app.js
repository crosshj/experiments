(function(){
	if(typeof Vue === 'undefined') return;

	var app = new Vue({ 
		el: '#app',
		data: {
				message: 'Hello Vue!'
		}
	});
})()