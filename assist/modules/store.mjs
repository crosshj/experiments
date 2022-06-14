import { readMetadata } from '../store/auth.js';
import { createBM, getBM, updateBM } from '../store/xbs.js';


async function storeModule(){
	const authRes = await readMetadata();
	const password = authRes?.password;
	const syncId = authRes?.syncId || await createBM();
	const marks = await getBM(syncId, password);

	document.querySelectorAll('store-section').forEach((el) => {
		el.innerHTML = `
<style>
	.store-section pre { white-space: pre-wrap; }
</style>

<pre>
- login if not logged in
- new bookmarks if none exist
- when new, syncId/password saved to auth0
</pre>

<pre>` +
JSON.stringify(marks, null, 2) + 
`</pre>`.trim();

		el.classList.remove('loading');
		setTimeout(() => el.classList.remove('transition'), 500)
	})
};

export default storeModule;