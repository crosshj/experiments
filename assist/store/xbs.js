import * as LZUTF8 from "https://unpkg.com/lzutf8@0.6.3/build/production/lzutf8.js"
const { decompress, compress } = LZUTF8;
//import { decompress, compress } from 'https://cdn.skypack.dev/lzutf8/';

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

const concatUint8Arrays = (firstArr = new Uint8Array(), secondArr = new Uint8Array()) => {
	const totalLength = firstArr.length + secondArr.length;
	const result = new Uint8Array(totalLength);
	result.set(firstArr, 0);
	result.set(secondArr, firstArr.length);
	return result;
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

const encryptData = async function(data, password, syncId){
	const keyData = toByteArray( await getPassHash(password, syncId));
	const iv = crypto.getRandomValues(new Uint8Array(16));
	const algo = { name: "AES-GCM", iv };
	const key = await crypto.subtle
		.importKey('raw', keyData, algo, false, ['encrypt'])
	const compressedData = compress(JSON.stringify(data));
	const encryptedData = await crypto.subtle.encrypt(algo, key, compressedData);
	const combinedData = concatUint8Arrays(iv, new Uint8Array(encryptedData));
	return fromByteArray(combinedData);
};

export async function updateBM({ syncId, password, data }){
	const bookmarks = await encryptData(data, password, syncId);
	console.log({ data, bookmarks })
	const opts = {
		method: 'put',
		headers,
		body: JSON.stringify({ bookmarks })
	};
	const results = await fetch(base + '/bookmarks/' + syncId, opts)
		.then(x => x.json());
	return results;
};

export async function getBM(id, password) {
	try {
		const opts = { headers };
		const results = await fetch(base + '/bookmarks/' + id, opts)
			.then(x => x.json());
		if(!results?.bookmarks) return;
		const decoded = await decryptData(results.bookmarks, password, id);
		return JSON.parse(decoded);
	} catch(e){
		console.log(e);
	}
};