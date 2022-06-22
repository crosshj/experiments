//docs: https://auth0.github.io/auth0-spa-js/
import Auth0Client from 'https://cdn.skypack.dev/@auth0/auth0-spa-js';
import jwtDecode from "https://cdn.skypack.dev/jwt-decode";

const opts = {
	audience: 'https://crosshj.auth0.com/api/v2/',
	//audience: 'https://fiug.dev/metadata',
	scope: [
		"openid",
		"profile",
		//"offline_access",
		"name",
		"given_name",
		"family_name",
		"nickname",
		"email",
		"email_verified",
		"picture",
		"created_at",
		"identities",
		"phone",
		"address"
	].join(" ")
};

let _client;
const auth0Client = async () => {
	_client = _client || await new Auth0Client({
		domain: 'crosshj.auth0.com',
		client_id: 'LJ3RP61zaDixMQXCYMXAR54ahWHImW3p',
		redirect_uri: document.location.href
	});
	return _client
};

const appendScript = (url) => new Promise((resolve, reject) => {
	const script = document.createElement('script');
	script.crossOrigin = "anonymous";
	script.onload = resolve;
	script.src = url;
	document.head.appendChild(script);
});

/*
https://auth0.com/blog/adding-custom-claims-to-id-token-with-auth0-actions/

see also: https://crosshj.auth0.com/.well-known/openid-configuration
*/

export async function readMetadata(){
	const client = await auth0Client();
	let tokenResponse;
	try {
		tokenResponse = await client.getTokenSilently({
			...opts,
			detailedResponse: true,
		});
		tokenResponse && console.log('got tokenResponse silently');
	} catch(e){}
	// if(!tokenResponse){
	// 	try {
	// 		await client.getTokenWithPopup(opts);
	// 		tokenResponse = await client.getTokenSilently(opts);
	// 		tokenResponse && console.log('got tokenResponse with popup');
	// 	} catch(e){}
	// }
	if(!tokenResponse || !tokenResponse.id_token) return;
	const { id_token: token } = tokenResponse;
	const decoded = jwtDecode(token);
	if(!decoded) return;
	const metadata = decoded['https://fiug.dev/metadata'];
	const { picture, email, nickname } = decoded;
	return { picture, nickname, email, ...metadata };
};

export async function login(){
	const client = await auth0Client();
	await client.loginWithPopup(opts);
	document.location.reload();
}

export async function logout(){
	const client = await auth0Client();
	await client.logout({
		returnTo: document.location.href
	});
}
