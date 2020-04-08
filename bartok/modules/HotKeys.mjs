
function triggerEvent(name){
	const done = () => {
		console.log(`done: ${name}`);
		if(name === "update"){
			triggerEvent("persist");
		}
	};
	const body = {
		// name: (document.body.querySelector('#service_name')||{}).value,
		// id: (document.body.querySelector('#service_id')||{}).value,
		code: (window.Editor||{ getValue: ()=>{}}).getValue()
	};

	const event = new CustomEvent('operations', {
		bubbles: true,
		detail: {
			operation: name,
			done,
			body
		}
	});
	document.body.dispatchEvent(event);

}

function HotKeys(){

	document.addEventListener('keydown', function(event) {
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			triggerEvent("update");
			event.preventDefault();
			return false;
		}
	});

}

export default HotKeys;