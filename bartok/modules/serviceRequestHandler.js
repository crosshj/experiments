/*

this should do the job of ExternalState.mjs:

- serve files from cache first, then from network
- serve files for offline (cache)

- cache updates to be pushed later

*/

/*

this module should not take dependencies for granted

for example:
fetch, cache, DB, storage - these should be passed in

*/
(() => {
    let count = 0;
    async function serviceAPIRequestHandler(event){
        //console.log(count++);
        //console.log(self);
        //console.log(event.request.url);
        //console.log('serviceAPIRequestHandler');

        // should be doing something interesting here
        // like indexDB, or some kind of caching

        return fetch(event.request.url);
    }

    return serviceAPIRequestHandler;
})();
