import { decompress } from 'https://cdn.skypack.dev/lzutf8/';
import { toByteArray, fromByteArray } from 'https://cdn.skypack.dev/base64-js/';

const base = 'https://api.xbrowsersync.org'; // see https://www.xbrowsersync.org/#services
const headers = { 'content-type': 'application/json' };

const getPassHash = async (password, salt) => {
	const encoder = new TextEncoder("utf-8");
	const encodedSalt = encoder.encode(salt);
	const keyData = encoder.encode(password);
	const importedKey = await crypto.subtle
		.importKey("raw", keyData, {
			name: "PBKDF2"
		}, false, [ "deriveKey" ]);
	const derivedKey = await crypto.subtle.deriveKey({
			name: "PBKDF2",
			salt: encodedSalt,
			iterations: 25e4,
			hash: "SHA-256"
		}, importedKey, {
			name: "AES-GCM",
			length: 256
		}, true, [ "encrypt", "decrypt" ]);
	const exportedKey = await crypto.subtle.exportKey("raw", derivedKey);
	const base64Key = fromByteArray(new Uint8Array(exportedKey));
	return base64Key;
};

const decryptData = async function(encryptedData, password, syncId) {
	if (!encryptedData) return;
	const keyData = toByteArray( await getPassHash(password, syncId));
	const encryptedBytes = toByteArray(encryptedData);
	const iv = encryptedBytes.slice(0, 16);
	const encryptedDataBytes = encryptedBytes.slice(16).buffer;
	const algo = { name: "AES-GCM", iv };
	const key = await crypto.subtle
		.importKey("raw", keyData, algo, false, [ "decrypt" ]);
	const decryptedBytes = await crypto.subtle
		.decrypt(algo, key, encryptedDataBytes);
	const decryptedData = decompress(new Uint8Array(decryptedBytes));
	return decryptedData;
};

export async function createBM() {
	const opts = {
		method: 'post',
		headers,
		body: JSON.stringify({ version: "1.1.13" })
	};
	const { id } = await fetch(base + '/bookmarks', opts)
		.then(x => x.json());
	return id;
};


/*
TODO: add one bookmark
[
  {
    "title": "[xbs] Other",
    "children": [
      {
        "title": "Hacker News",
        "url": "https://news.ycombinator.com/",
        "description": "desc",
        "id": 2
      },
      {
        "title": "How to inspect network traffic from Chrome extensions",
        "url": "https://stackoverflow.com/questions/50673373/how-to-inspect-network-traffic-from-chrome-extensions",
        "description": "I have a third party chrome extension which sends some requests to a website and gets some data.\nI want to analyse network traffic for those requests.\nI tried using Chrome debugger, but that did no...",
        "id": 3
      }
    ],
    "id": 1
  }
]
*/

export async function updateBM(id, bookmarks){
	const opts = {
		method: 'put',
		headers,
		body: JSON.stringify({ bookmarks })
	};
	const results = await fetch(base + '/bookmarks/' + id, opts)
		.then(x => x.json());
	return results;
};

export async function getBM(id, password) {
	try {
		const opts = { headers };
		const results = await fetch(base + '/bookmarks/' + id, opts)
			.then(x => x.json());
		const decoded = await decryptData(results?.bookmarks, password, id);
		return JSON.parse(decoded);
	} catch(e){}
};