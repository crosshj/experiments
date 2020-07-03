/* doing the same thing as workbox here? */

const cacheName = 'v0.3.1';

self.addEventListener('install', installHandler);
self.addEventListener('activate', activateHandler);
self.addEventListener('fetch', fetchHandler);
self.addEventListener('message', messageHandler);
self.addEventListener('sync', syncHandler);
self.addEventListener('push', pushHandler);

const cacheList = [];

function installHandler(event){
	console.log('service worker install event');
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(cacheList.map(x => '.'+x));
    })
  );
}

function activateHandler(event){
	console.log('service worker activate event');
}

function fetchHandler(event){
	// if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
	// 	debugger;
	// 	return;
	// }
	if(event.request.url.includes('/browser-sync/')){
		return fetch(event.request);
	}
	//console.log('service worker fetch event');
	if(
		!event.request.url.includes('/bartok/') &&
		!event.request.url.includes('/shared/')
	){
		return;
	}
	const split = event.request.url.split('/bartok/');
	const resource = "/" + split[split.length-1];
	// if(!cacheList.includes(resource)){
	// 	return;
	// }
	event.respondWith(
		caches.match(event.request)
	);
}

function messageHandler(event){
	/*
		all events should be sent through here

		an event handler can be registered here

		handlers can be listed (for service map)
	*/
	const { data } = event;
	const { bootstrap } = data || {};

	if(bootstrap){
		(async () => {
			console.log('booting');
			const modules = await bootstrapHandler(bootstrap);

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
		})();
		return;
	}
	console.log('service worker message event');
	console.log({ data });
}

function syncHandler(event){
	console.log('service worker sync event');
}

function pushHandler(event){
	console.log('service worker push event');
}

// ----

async function bootstrapHandler({ manifest }){
	//console.log({ manifest});
	const _manifest = await (await fetch(manifest)).json();
	const { modules } = _manifest || {};
	if(!modules || !Array.isArray(modules)){
		console.error('Unable to find modules in service manifest');
		return;
	}
	//should only register modules that are not in cache
	await Promise.all(modules.map(registerModule));
	return modules;
}
async function registerModule(module){
	if(module.includes && module.includes('NOTE:')){
		return;
	}
	const { source, include, route, handler, resources } = module;
	if(!route && !resources){
		console.error('module must be registered with a route or array of resources!');
		return;
	}

	if(resources){
		await Promise.all(resources.map(async resourceUrl => {
			const response = await fetch(resourceUrl);
			return await caches.open(cacheName)
				.then(function(cache) {
					cache.put(resourceUrl, response);
				});
		}));
	}

	if(include){
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
			.then(function(cache) {
				cache.put(route, _source);
			});
	}

	/*
	if source is defined, service worker will respond to matching routes with this
	(which means this is pretty much a script? resource being registered)
	should fetch this resource and add to cache & DB
	*/
	//console.log({ source, route, handler });
	if(source){
		const _source = await fetch(source);
		return caches.open(cacheName)
			.then(function(cache) {
				cache.put(route, _source);
			});
	}


	/*
	if handler is defined, matching routes will be handled by this function
	(optionally, the handler could listen to messages - not sure how that works right now)
	should instantiate this function and add it to handlers, but also add to DB
	*/

}