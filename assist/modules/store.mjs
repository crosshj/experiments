import { readMetadata, logout, login } from '../store/auth.js';
import { createBM, getBM, updateBM } from '../store/xbs.js';
window.logout = logout;
window.login = login;

async function storeModule(){
	const authRes = await readMetadata();
	const { password, syncId, nickname="", email="" } = authRes;
	const loggedIn = password && syncId;
	const marks = loggedIn && await getBM(syncId, password);

	document.querySelectorAll('store-section').forEach((el) => {
		loggedIn && (el.innerHTML = `
<button onclick="logout()">log out</button>
<style>
	store-section pre { white-space: pre-wrap; }
</style>
<pre>
user: ${nickname}
email: ${email}
bookmarks: ${JSON.stringify(marks, null, 2)}
</pre>
		`.trim());

		!loggedIn && (el.innerHTML = `
<button onclick="login()">log in</button>
		`.trim());

		el.innerHTML += `
<pre>
todo:
- new bookmarks if none exist
- when new, syncId/password saved to auth0
</pre>
<a href="./store/xBrowserSync.html">pop this out</a>
		`.trim();

		el.classList.remove('loading');
		setTimeout(() => el.classList.remove('transition'), 500)
	})
};

export default storeModule;