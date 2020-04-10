const cacheName = 'v0.3';

self.addEventListener('install', installHandler);
self.addEventListener('activate', activateHandler);
self.addEventListener('fetch', fetchHandler);
self.addEventListener('message', messageHandler);
self.addEventListener('sync', syncHandler);
self.addEventListener('push', pushHandler);

const cacheList = [
	'/',
	'/index.html',
	'/bartok-logo.png'
]

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
	//console.log('service worker fetch event');
	if(!event.request.url.includes('/bartok/')){
		return;
	}
	const split = event.request.url.split('/bartok/');
	const resource = "/" + split[split.length-1];
	if(!cacheList.includes(resource)){
		return;
	}
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
	console.log('service worker message event');
	console.log({ data });
}

function syncHandler(event){
	console.log('service worker sync event');
}

function pushHandler(event){
	console.log('service worker push event');
}