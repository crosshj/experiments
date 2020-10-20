/* doing the same thing as workbox here? */

const cacheName = 'v0.3.1';

importScripts('/shared/vendor/localforage.min.js');
importScripts('/shared/vendor/json5v-2.0.0.min.js');

self.addEventListener('install', installHandler);
self.addEventListener('activate', activateHandler);
self.addEventListener('fetch', asyncFetchHandler);
self.addEventListener('foreignfetch', asyncFetchHandler);
self.addEventListener('message', messageHandler);
self.addEventListener('sync', syncHandler);
self.addEventListener('push', pushHandler);


const handlers = [];
const driverOrder = [
	localforage.INDEXEDDB,
	localforage.WEBSQL,
	localforage.LOCALSTORAGE,
];
let handlerStore;
function getHandlerStore(){
	return handlerStore || localforage.createInstance({
		driver: driverOrder,
		name: 'serviceWorker',
		version: 1.0,
		storeName: 'handlerStore',
		description: 'used after app has booted when service worker is updated'
	});
}
handlerStore = getHandlerStore();

const activateHandlers = async () => {
	handlerStore = getHandlerStore();

	return await handlerStore
		.iterate((value, key) => {
			const {
				type, route, handlerName, handlerText
			} = value;
			const foundHandler = handlers.find(x => x.handlerName === handlerName);
			const foundExactHandler = foundHandler && handlers.find(x =>
				x.handlerName === handlerName && x.routePattern === route
			);
			if(foundExactHandler){
				console.log(`handler was already installed for ${foundExactHandler.routePattern}`);
				return;
			}
			let handlerFunction;
			if (!foundHandler) {
				handlerFunction = eval(handlerText);
			}
			console.log(`handler installed for ${route} (from indexDB handlerStore)`);
			handlers.push({
				type,
				routePattern: route,
				route: type === "fetch"
					? new RegExp(route)
					: route,
				handler: handlerFunction || foundHandler.handler,
				handlerName, handlerText
			});
		});
}

async function installHandler(event) {
	console.log('service worker install event');
	return self.skipWaiting();
}

function activateHandler(event) {
	console.log('service worker activate event');
	event.waitUntil(
		(async () => {
			await self.clients.claim()
			return await activateHandlers();
		})()
	);
	// cause clients to reload?
	//self.clients.matchAll({ type: 'window' })
	// 	.then(clients => {
	// 		for (const client of clients) {
	// 			client.navigate(client.url);
	// 		}
	// 	});
}

function asyncFetchHandler(event){
	if (
		event.request.url.includes('https://crosshj.auth0.com') ||
		event.request.url.includes('index.bootstrap') ||
		event.request.url.includes('localhost:3333')
	) {
		return;
	}
	if (
		event.request.url.includes('browser-sync/socket.io') ||
		event.request.url.includes('browser-sync/browser-sync-client') ||
		event.request.url.includes('?browsersync=') // this is how css gets injected
	) {
		return;
	}
	// do not use or update cache
	if (event.request.cache === 'no-store' ||
		(
			event.request.headers.get('pragma') === 'no-cache' &&
			event.request.headers.get('cache-control') === 'no-cache'
		)
	) {
		return;
	}

	// if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
	// 	debugger;
	// 	return;
	// }

	// if (
	// 	!event.request.url.includes('/bartok/') &&
	// 	!event.request.url.includes('/shared/')
	// ) {
	// 	return;
	// }

	if(event.request.url.includes('unpkg')){
		console.error(`NOT AVAILABLE OFFLINE: ${event.request.url}`);
		return;
	}

	if(event.request.url.includes('https://webtorrent.io/torrents/')){
		return;
	}

	event.respondWith(async function() {
		if(!handlers.length){
			await activateHandlers();
		}
		const res = await fetchHandler(event);
		// if(!res){
		// 	return new Response('error handling this request!  see service-worker.js', {headers:{'Content-Type': 'text/html'}});
		// }
		return res;
  }());
}

function fetchHandler(event) {
	const routeHandlerBlacklist = [
		'//(.*)'
	];

	const safeHandlers = handlers
		.filter(x => !routeHandlerBlacklist.includes(x.routePattern));
	const foundHandler = safeHandlers
		.find(x => {
			return x.type === "fetch" && x.route.test(event.request.url);
		});
	if (foundHandler) {
		//console.log(foundHandler)
		return foundHandler.handler(event);
	}
	return caches.match(event.request);
}

function messageHandler(event) {
	/*
		all events should be sent through here

		an event handler can be registered here

		handlers can be listed (for service map)
	*/
	const { data } = event;
	const { bootstrap } = data || {};

	if (bootstrap) {
		(async () => {
			try {
				console.log('booting');
				const bootstrapMessageEach = (module) => {
					const client = event.source;
					if (!client) {
						console.error('failed to notify client on boot complete');
						return;
					}
					client.postMessage({ module, msg: 'module-loaded' });
				};
				const modules = await bootstrapHandler(bootstrap, bootstrapMessageEach);

				const client = event.source;
				if (!client) {
					console.error('failed to notify client on boot complete');
					return;
				}
				client.postMessage({
					modules: modules.filter(x => {
						return !x.includes || !x.includes('NOTE:')
					}),
					msg: "boot complete"
				});
			} catch (e) {
				console.log(e);
				const client = event.source;
				if (!client) {
					console.error('failed to notify client on boot complete');
					return;
				}
				client.postMessage({
					msg: "boot error - you offline?"
				});
			}
		})();
		return;
	}
	console.log('service worker message event');
	console.log({ data });
}

function syncHandler(event) {
	console.log('service worker sync event');
}

function pushHandler(event) {
	console.log('service worker push event');
}

// ----

async function bootstrapHandler({ manifest }, bootstrapMessageEach) {
	//console.log({ manifest});
	const manifestResponse = await fetch(manifest);
	const _manifest = JSON5.parse(await manifestResponse.text());
	const _source = new Response(
		JSON.stringify(_manifest, null, 2), {
			status: manifestResponse.status,
			statusText: manifestResponse.statusText,
			headers: manifestResponse.headers
	});
	await caches.open(cacheName)
		.then(function (cache) {
			cache.put(manifest, _source);
		});

	const { modules } = _manifest || {};
	if (!modules || !Array.isArray(modules)) {
		console.error('Unable to find modules in service manifest');
		return;
	}
	//should only register modules that are not in cache
	//await Promise.all(modules.map(registerModule));
	for (var i = 0, len = modules.length; i < len; i++) {
		await registerModule(modules[i]);
		bootstrapMessageEach(modules[i])
	}
	return modules;
}
async function registerModule(module) {
try {
	if (module.includes && module.includes('NOTE:')) {
		return;
	}
	const { source, include, route, handler, resources, type } = module;
	if (!route && !resources) {
		console.error('module must be registered with a route or array of resources!');
		return;
	}

	/*
	if handler is defined, matching routes will be handled by this function
	(optionally, the handler could listen to messages - not sure how that works right now)
	should instantiate this function and add it to handlers, but also add to DB
	*/
	if (handler) {
		const foundHandler = handlers.find(x => x.handlerName === handler);
		let handlerFunction, handlerText;
		if (!foundHandler || !foundHandler.handler) {
			handlerText = await (await fetch(handler)).text();
			handlerFunction = eval(handlerText);
		}
		const foundExactHandler = foundHandler && handlers.find(x =>
			x.handlerName === handler && x.routePattern === route
		);
		if(foundExactHandler){
			console.log(`handler was already installed for ${foundExactHandler.routePattern} (boot)`);
			return;
		}
		await handlerStore.setItem(route, {
			type, route,
			handlerName: handler,
			handlerText: handlerText || foundHandler.handlerText
		});
		console.log(`handler installed for ${route} (boot)`);
		handlers.push({
			type,
			routePattern: route,
			route: type === "fetch"
				? new RegExp(route)
				: route,
			handler: handlerFunction || foundHandler.handler,
			handlerName: handler,
			handlerText: handlerText || foundHandler.handlerText
		});
		return;
	}

	if (resources) {
		await Promise.all(resources.map(async resourceUrl => {
			const opts = {};
			if(resourceUrl.includes('.htm')){
				opts.headers = opts.headers || {};
				opts.headers['Accept'] = opts.headers['Accept'] || '';
				opts.headers['Accept'] = 'text/html,' + opts.headers['Accept'];
			}
			const response = await fetch(resourceUrl, opts);

			return await caches.open(cacheName)
				.then(function (cache) {
					cache.put(resourceUrl, response);
				});
		}));
	}

	if (include) {
		const response = await fetch(source);
		const extra = [];
		await Promise.all(include.map(async x => {
			const text = await (await fetch(x)).text();
			extra.push(`\n\n/*\n\n${x}\n\n*/ \n ${text}`);
		}));

		let modified =
			`/* ${source} */\n ${await response.text()}`
			+ extra.join('');

		const _source = new Response(modified, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers
		});
		return await caches.open(cacheName)
			.then(function (cache) {
				cache.put(route, _source);
			});
	}

	/*
	if source is defined, service worker will respond to matching routes with this
	(which means this is pretty much a script? resource being registered)
	should fetch this resource and add to cache & DB
	*/
	//console.log({ source, route, handler });
	if (source) {
		const _source = await fetch(source);
		return caches.open(cacheName)
			.then(function (cache) {
				cache.put(route, _source);
			});
	}
} catch(e){
	console.error('failed to register module');
	console.log(module);
	console.log(e);
}
}