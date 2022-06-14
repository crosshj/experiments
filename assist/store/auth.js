const auth0Url = "https://cdn.auth0.com/js/auth0-spa-js/1.7/auth0-spa-js.production.js"

//const delay = time => new Promise(r=>setTimeout(r, time));
//const fetchJSON = (url, opts) => fetch(url, opts).then(x => x.json());

const appendScript = (url) => new Promise((resolve, reject) => {
	const script = document.createElement('script');
	script.crossOrigin = "anonymous";
	script.onload = resolve;
	script.src = url;
	document.head.appendChild(script);
});
const jwtDecode = (token) => {
	try {
		return JSON.parse(atob(token.split('.')[1]));
	} catch (e){}
};

/*
relies on Auth0 Action executing on post-login

exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://fiug.dev';
  const metadata = event.user.app_metadata;

  api.idToken.setCustomClaim(`${namespace}/metadata`, metadata);
  api.accessToken.setCustomClaim(`${namespace}/metadata`, metadata);

  //api.user.setAppMetadata("didAnExpensiveTask", true);
};

https://auth0.com/blog/adding-custom-claims-to-id-token-with-auth0-actions/
*/

export async function readMetadata(){
	await appendScript(auth0Url);
	window.auth0Client = await createAuth0Client({
		domain: 'crosshj.auth0.com',
		client_id: 'LJ3RP61zaDixMQXCYMXAR54ahWHImW3p',
		redirect_uri: document.location.href
	});
	let token;
	const opts = {
		audience: 'https://crosshj.auth0.com/api/v2/',
		scope: ''
	};
	try {
		token = await auth0Client.getTokenSilently(opts);
		token && console.log('got token silently');
	} catch(e){}
	try {
		!token && console.log('get token with popup');
		token =	token || await auth0Client.getTokenWithPopup(opts);
	} catch(e){}

	const decoded = jwtDecode(token);
	const metadata = decoded['https://fiug.dev/metadata'];
	return metadata;
};
