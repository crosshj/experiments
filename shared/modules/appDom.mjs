import Loading from '../../shared/modules/loading.mjs';

let config = {};

function getHtml(callback) {
	fetch('./app.html')
		.then(r => r.text())
		.then(htmlText => {
			let domText = htmlText;
			domText = domText.replace(/{{title}}/g, config.title || 'template');
			document.body.innerHTML += domText;
			callback();
		})
}

function AppDom(callback) {
	document.title = config.title || document.title;
	Loading((loadingError, loading) => {
		getHtml((domError, dom) => {
			callback(null, {
				loading, dom,
				error: {
					loading: loadingError,
					dom: domError
				}
			});
		});
	});
}

AppDom.config = (_config) => {
	config = _config;
};

export default AppDom;
