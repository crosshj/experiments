
function triggerEvent(name){
	const done = () => {
		//console.log(`done: ${name}`);
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

// TODO: use this pattern instead
// const triggers = {
// 	'searchProject': attachTrigger({
// 		name: 'Hot Keys',
// 		eventName: 'searchProject',
// 		type: 'raw'
// 	}),
// 	'update': attachTrigger({
// 		name: 'Hot Keys',
// 		eventName: 'update',
// 		type: 'raw'
// 	})
// };

// https://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c

function HotKeys(){
	const useCapture = true;
	document.addEventListener('keydown', function(event) {
		if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
			triggerEvent("searchProject");
			event.preventDefault();
			return false;
		}
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
			triggerEvent("update");
			event.preventDefault();
			return false;
		}
		if (event.ctrlKey && event.which === 9) {
			// this will only work with electron
			triggerEvent("nextTab");
			event.preventDefault();
			return false;
		}
	}, useCapture);

}

export default HotKeys;