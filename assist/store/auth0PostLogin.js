/*

the following is executed on auth0 after a user logs in

*/

const fetch = require('node-fetch');

// for alternates, see https://www.xbrowsersync.org/#services
const base = 'https://api.xbrowsersync.org';
const headers = { 'content-type': 'application/json' };

function getRandomToken(len){
	return Array.from(
		Array(len),
		() => Math.floor(Math.random() * 36).toString(36)
	).join('');
}

async function createBM() {
	try {
		const opts = {
			method: 'post',
			headers,
			body: JSON.stringify({
				version: "1.1.13"
			})
		};
		const { id } = await fetch(base + '/bookmarks', opts)
			.then(x => x.json());
		return id;
	} catch(e){}
};

exports.onExecutePostLogin = async (event, api) => {
	const namespace = 'https://fiug.dev';
	const metadata = event.user.app_metadata;

	if(!metadata.syncId){
		const syncId = await createBM();
		metadata.syncId = syncId;
		api.user.setAppMetadata("syncId", syncId);
	}
	if(!metadata.password){
		const password = getRandomToken(32);
		metadata.password = password;
		api.user.setAppMetadata("password", password);
	}

	api.idToken.setCustomClaim(`${namespace}/metadata`, metadata);
	api.accessToken.setCustomClaim(`${namespace}/metadata`, metadata);
};
