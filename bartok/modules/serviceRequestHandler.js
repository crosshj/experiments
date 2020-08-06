
function exampleReact() {
    return `
// (p)react hooks
function useStore() {
  let [value, setValue] = useState(1);

  const add = useCallback(
    () => setValue(value+2),
    [value]
  );

  return { value, add };
}

const Style = () => (
<style dangerouslySetInnerHTML={{__html: \`
  body { display: flex; font-size: 3em; }
  body > * { margin: auto; }
  #clicker {
    cursor: pointer;
    background: url("data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cpath d='m11.61724,2.39725c0,0.78044 -0.39092,1.94771 -0.92661,2.95967c0.00514,0.00382 0.01027,0.00764 0.01538,0.01151c0.73296,-0.83424 0.95997,-2.34561 2.82973,-2.46949c1.86977,-0.12388 4.76668,5.72251 1.72228,6.863c-0.72347,0.27102 -0.16185,0.31797 -1.28384,0.14343c0.99502,0.4928 0.39169,0.19741 0.83213,0.81656c1.90904,2.68368 -4.33675,7.09457 -6.24582,4.41089c-0.44902,-0.63121 -0.30316,-0.19483 -0.45163,-1.33693l-0.00042,0.00003l-0.00624,0c-0.1,1 0.1,0.65 -0.4,1.3c-1.9,2.7 -7.9,-2.6 -6,-5.3c0.4,-0.6 0.9,-0.2 1.9,-0.7c-1.1,0.2 -1.4,-0.1 -2,-0.3c-3,-1.1 -0.3,-6.7 2.7,-5.6c0.7,0.3 0.8,0 1.5,1l0,0c-0.5,-1 -0.6,-0.9 -0.6,-1.7c0,-3.3 6.5,-3.2 6.5,0z' fill='%238f0047' stroke-miterlimit='23' stroke-width='0' transform='rotate(118.8 8.3,8)'/%3E%3C/svg%3E") 50% no-repeat;
    text-align: center;
    padding: 45px;
    padding-top: 150px;
    user-select: none;
    height: 200px;
    width: 280px;
    background-color: #002e00;
  }
  #clicker p { margin-top: 2px; margin-left: -50px }
  #clicker * { filter: drop-shadow(3px 13px 4px #006600); }
\`}} />);


//(p)react
const App = () => {
  const { value, add } = useStore();

  return (
    <div onClick={add} id="clicker" title="just click the flower already...">
      <Style />
      <span>kiliki aʻu</span>
      <p>{value}</p>
    </div>
  );
};`;
}
const defaultCode = (_name) => [{
    name: "index.js",
    code:
        `const serviceName = '${_name}';

const send = (message) => {
	const serviceMessage = \`\${serviceName}: \${message}\`;
	(process.send || console.log)
		.call(null, \`\${serviceName}: \${message}\`);
};

process.on('message', parentMsg => {
	const _message = parentMsg + ' PONG.';
	send(_message);
});
`
}, {
    name: "package.json",
    code: JSON.stringify({
        name: _name,
        main: "react-example.jsx",
        description: "",
        template: "",
        port: ""
    }, null, '\t')
}, {
    name: 'react-example.jsx',
    code: exampleReact()
}];
const defaultTree = (_name) => ({
    [_name]: {
        "index.js": {},
        "package.json": {},
        "react-example.jsx": {}
    }
});
const defaultServices = () => [{
    id: 1,
    name: 'API Server',
    tree: defaultTree('API Server'),
    code: defaultCode('API Server')
}, {
    id: 10,
    name: 'UI Service',
    tree: defaultTree('UI Service'),
    code: defaultCode('UI Service')
}, {
    id: 777,
    name: 'welcome',
    tree: [{
        welcome: {
            "service.json": {}
        }
    }],
    code: [{
        name: "service.json",
        code: JSON.stringify({
            id: 777,
            type: "frontend",
            persist: "filesystem",
            path: ".welcome",
            version: 0.4,
            tree: null,
            code: null
        }, null, 2)
    }]
}];
const dummyService = (_id, _name) => ({
    id: _id + "",
    name: _name,
    code: defaultCode(_name),
    tree: defaultTree(_name)
});

async function getFileContents({ filename, store, cache }) {
    const cachedFile = await store.getItem(filename);
    let contents;

    // https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
    if (cachedFile && cache !== 'reload') {
        return cachedFile;
    }
    const storeAsBlob = [
        "image/", "audio/", "video/", "wasm"
    ];
    const storeAsBlobBlacklist = [
        'image/svg'
    ];
    const fileNameBlacklist = [
        '.ts' // mistaken as video/mp2t
    ];
    const fetched = await fetch(filename);
    const contentType = fetched.headers.get('Content-Type');

    contents =
        storeAsBlob.find(x => contentType.includes(x)) &&
        !storeAsBlobBlacklist.find(x => contentType.includes(x)) &&
        !fileNameBlacklist.find(x => filename.includes(x))
            ? await fetched.blob()
            : await fetched.text();
    store.setItem(filename, contents);

    return contents;
}

//TODO: this is intense, but save a more granular approach for future
async function fileSystemTricks({ result, store, cache }) {
    if (!result.result[0].code.find) {
        const parsed = JSON.parse(result.result[0].code);
        result.result[0].code = parsed.files;
        result.result[0].tree = parsed.tree;
        console.log('will weird things ever stop happening?');
        return;
    }
    const serviceJSONFile = result.result[0].code.find(item => item.name === 'service.json');
    if (serviceJSONFile && !serviceJSONFile.code) {
        //console.log('service.json without code');
        const filename = `./.${result.result[0].name}/service.json`;
        serviceJSONFile.code = await getFileContents({ filename, store, cache });
    }
    if (serviceJSONFile) {
        //console.log('service.json without tree');
        let serviceJSON = JSON.parse(serviceJSONFile.code);
        if (!serviceJSON.tree) {
            const filename = `./${serviceJSON.path}/service.json`;
            serviceJSONFile.code = await getFileContents({ filename, store, cache });
            serviceJSON = JSON.parse(serviceJSONFile.code);
        }
        result.result[0].code = serviceJSON.files;
        result.result[0].tree = {
            [result.result[0].name]: serviceJSON.tree
        }
    }
    const len = result.result[0].code.length;
    for (var i = 0; i < len; i++) {
        const item = result.result[0].code[i];
        if (!item.code && item.path) {
            const filename = './' + item.path;
            item.code = await getFileContents({ filename, store, cache });
        }
    }
}

let lsServices = [];

// FOR NOW: instead of importing path-to-regex
// go here https://forbeslindesay.github.io/express-route-tester/
// enter path expression; include regex for base path, eg. (.*)/.welcome/:path?
// get the regex and add it to this
const pathToRegex = {
    '/service/create/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/create(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/service/read/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/read(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/service/update/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/update(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/service/delete/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/delete(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/manage/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/manage(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/monitor/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/monitor(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/persist/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/persist(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/.welcome/:path?': (() => {
        // NOTE: this is actually the regex for (.*)/.welcome/(.*)
        const regex = new RegExp(
            /^((?:.*))\/\.welcome\/((?:.*))(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                path: (regex.exec(url)[2]||"").split('?')[0],
                query: (regex.exec(url)[2]||"").split('?')[1]
            })
        }
    })()
};

const genericPath = (pathString) => {
    const name = pathString.replace('/:path?','').replace('/', '');
    const regex = new RegExp(
        `^((?:.*))\/${name}\/((?:.*))(?:\/(?=$))?$`, 'i'
    );
    return {
        match: url => regex.test(url),
        params: url => ({
            path: (regex.exec(url)[2]||"").split('?')[0],
            query: (regex.exec(url)[2]||"").split('?')[1]
        })
    }
};

const fakeExpress = () => {
    const handlers = [];
    const generic = (method) => (pathString, handler) => {
        const path = pathToRegex[pathString];
        let alternatePath;
        if (!path) {
            alternatePath = genericPath(pathString);
            //console.log({ alternatePath });
        }
        const foundHandler = handlers.find(x => x.pathString === pathString && x.method === method);
        if(foundHandler){
            console.log(`Overwriting handler for ${method} : ${pathString}`);
            foundHandler.handler = handler;
            return;
        }
        handlers.push({
            ...(path || alternatePath),
            pathString,
            method,
            handler
        });
    };
    const find = (url) => {
        const found = handlers.find(x => x.match(url));
        if (!found) {
            return;
        }
        return {
            exec: async (event) => {
                return await found.handler(found.params(url), event);
            }
        };
    };
    const app = {
        get: generic('get'),
        post: generic('post'),
        find
    };
    return app;
};


const flattenTree = (tree) => {
    const results = [];
    const recurse = (branch, parent = '/') => {
        const leaves = Object.keys(branch);
        leaves.map(key => {
            const children = Object.keys(branch[key]);
            if(!children || !children.length){
                results.push({
                    name: key,
                    code: parent + key,
                    path: parent + key
                });
            } else {
                recurse(branch[key], `${parent}${key}/`);
            }
        });
    };
    recurse(tree);
    return results;
};

async function getCodeFromStorageUsingTree(tree, store){
    // flatten the tree (include path)
    // pass back array of  { name: filename, code: path, path }
    const files = flattenTree(tree);

    // UI should call network(sw) for file
    // BUT for now, will bundle entire filesystem with its contents
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        file.code = await store.getItem('.' + file.path);
        // OMG, live it up in text-only world... for now (templates code expects text format)
        file.code = typeof file.code === "object"
            ? JSON.stringify(file.code, null, 2)
            : file.code;
    }

    return files; // aka code array
}

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


//TODO: need service worker handlers so they can be dynamically added by this handler

// TODO: what if this handler needs things to be stored when it is first loaded?

*/

class TemplateEngine {
    templates=[];

    add (name, template){
        const newTemp = {
            extensions: [],
            body: template,
            tokens: ['{{template_value}}', '{{markdown}}', '{{template_input}}'],
            matcher: () => false //TODO: matchers are not currently implemented
        };
        newTemp.extensions.push(name.split('.').shift());
        newTemp.convert = (contents) => {
            let xfrmed = newTemp.body + '';
            newTemp.tokens.forEach(t => {
                xfrmed = xfrmed.replace(new RegExp(t, 'g'), contents);
                //xfrmed = xfrmed.replace(t, contents);
            });
            return xfrmed;
        };

        this.templates.push(newTemp);
    }

    convert(filename, contents){
        if(!this.templates.length) return false;
        const ext = filename.split('.').pop();
        const foundTemplate = this.templates.find(x => x.extensions.includes(ext));
        if(!foundTemplate) return;
        return foundTemplate.convert(contents);
    }
}

(() => {
    console.warn('Service Request Handler - init');

    var driverOrder = [
        localforage.INDEXEDDB,
        localforage.WEBSQL,
        localforage.LOCALSTORAGE,
    ];
    const store = localforage
        .createInstance({
            driver: driverOrder,
            name: 'serviceRequest',
            version: 1.0,
            storeName: 'files', // Should be alphanumeric, with underscores.
            description: 'contents of files'
        });

    const metaStore = localforage
        .createInstance({
            driver: driverOrder,
            name: 'serviceRequest',
            version: 1.0,
            storeName: 'meta', // Should be alphanumeric, with underscores.
            description: 'directory stucture, service type, etc'
        });
    //console.log({ driver: store.driver() })

    const expressHandler = async (base, msg) => {
        console.log(`registering fake express handler for ${base}`);
        const templates = new TemplateEngine();

        const templatesFromStorage = [];
        await store
            .iterate((value, key) => {
                if(key.indexOf(`./${base}/.templates`) !== 0) return;
                templatesFromStorage.push({ value, key });
            });

        templatesFromStorage.forEach(t => {
            const { value, key } = t;
            const name = key.split('/').pop();
            templates.add(name, value);
        })


        return async (params, event) => {
            const { path, query } = params;
            const filename = path.split('/').pop();
            const previewMode = (params.query||'').includes('preview');
            let xformedFile;

            const file = await store.getItem(`./${base}/${path}`);
            let fileJSONString;
            try {
                if(typeof file !== 'string'){
                    fileJSONString = file
                        ? JSON.stringify(file, null, 2)
                        : '';
                } else {
                    fileJSONString = file;
                }
            } catch(e){}

            if(previewMode){
                xformedFile = templates.convert(filename, fileJSONString);
            }
            // console.log({
            //     path,
            //     storeLoc: `./${base}/${path}`,
            //     xformedFile: xformedFile || 'not supported',
            //     msg,
            //     fileType: typeof file
            // });

            // most likely a blob
            if(file && file.type && file.size){
                return file;
            }

            //TODO: need to know file type so that it can be returned properly
            return xformedFile || fileJSONString || file;
        };
    };

    const addServiceHandler = async ({ name, msg }) => {
        const route = `/${name}/(.*)`;
        const handler = "./modules/serviceRequestHandler.js";
        const foundHandler = handlers.find(x => x.handlerName === handler);

        const foundExactHandler = foundHandler && handlers
            .find(x =>
                x.handlerName === handler && x.routePattern === route
            );
		if(foundExactHandler){
			console.log(`handler was already installed for ${foundExactHandler.routePattern} (boot)`);
			return;
        } else {
            handlers.push({
                type: foundHandler.type,
                routePattern: route,
                route: new RegExp(route),
                handler: foundHandler.handler,
                handlerName: handler,
                handlerText: foundHandler.handlerText
            });
        }
        // question: if handler is found in SW state, should store be updated?
        await handlerStore.setItem(route, {
            type,
            route,
			handlerName: handler,
			handlerText: foundHandler.handlerText
        });

        // question: if handler is found in SW state, should serviceRequestHandler state be updated?
        const expHandler = await expressHandler(name, msg);
        app.get(`/${name}/:path?`, expHandler);
    };



    let app = fakeExpress();
    app.post('/service/create/:id?', async (params, event) => {
        // event.request.arrayBuffer()
        // event.request.blob()
        // event.request.json()
        // event.request.text()
        // event.request.formData()

        const { name } = (await event.request.json()) || {};
        const { id } = params;
        if(!id){
            return JSON.stringify({ params, event, error: 'id required for service create!' }, null, 2);
        }
        if(!name){
            return JSON.stringify({ params, event, error: 'name required for service create!' }, null, 2);
        }
        console.log('/service/create/:id? triggered');
        //return JSON.stringify({ params, event }, null, 2);

        // create the service in store
        await metaStore.setItem(id, {
            name,
            id,
            tree: {
                [name]: {
                    '.templates': {
                        'json.html': {}
                    },
                    "package.json": {}
                }
            }
        });
        store.setItem(`./${name}/package.json`, {
            main: 'package.json',
            comment: 'this is an example package.json'
        });
        store.setItem(`./${name}/.templates/json.html`, `
        <html>
            <p>basic json template output</p>
            <pre>{{template_value}}</pre>
        </html>
        `);

        // make service available from service worker (via handler)
        await addServiceHandler({ name, msg: 'served from fresh baked' });

        // return current service
        const services = defaultServices();

        return JSON.stringify({
            result: {
                services: [ services.filter(x => Number(x.id) === 777) ]
            }
        }, null, 2);
    });
    app.get('/service/read/:id?', async (params, event) => {
        //also, what if not "file service"?
        //also, what if "offline"?

        //THIS ENDPOINT SHOULD BE (but is not now) AS DUMB AS:
        // - if id passed, return that id from DB
        // - if no id passed (or * passed), return all services from DB

        const cacheHeader = event.request.headers.get('x-cache');

        if(Number(params.id) === 0){
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            let tree = {};
            const code = [];

            for(var i=0, len=keys.length; i<len; i++){
                const request = keys[i];
                const split = request.url.split(/(\/bartok\/|\/shared\/)/);
                split.shift();
                const pathSplit = split.join('').split('/').filter(x=>!!x);
                let current = tree;
                for(var j=0, jlen=pathSplit.length; j<jlen; j++){
                    const leafName = pathSplit[j];
                    if(!leafName){
                        continue;
                    }
                    current[leafName] = current[leafName] || {};
                    current = current[leafName];
                }

                let name = (pathSplit[pathSplit.length-1]||"").replace("/", "");
                const _code = await (await cache.match(request)).text();
                code.push({ name, code: _code });
            }

            const name = 'fugue ui';

            tree = { ...tree.bartok, ...tree };
            delete tree.bartok;

            const bartokCode = {
                result: [{
                    id: 0,
                    name,
                    tree: { [name]: tree },
                    code
                }]
            }
            return JSON.stringify(bartokCode, null, 2);
        }

        const defaults = defaultServices();


        //if not id, return all services
        if (!params.id || params.id === '*') {
            //TODO: include Fuig Service here, too!!!
            const savedServices = [];
            await metaStore
                .iterate((value, key) => {
                    savedServices.push(value);
                });

            //TODO: may not want to return all code!!!
            for(var i=0, len=savedServices.length; i<len; i++){
                const service = savedServices[i];
                const code = await getCodeFromStorageUsingTree(service.tree, store);
                service.code = code;
            }
            //console.log({ defaults, savedServices });

            const allServices = [...defaults, ...savedServices]
                .sort((a, b) => Number(a.id) - Number(b.id));

            return JSON.stringify({
                result: allServices
            }, null, 2);
        }

        // if id, return that service
        // (currently doesn't do anything since app uses localStorage version of this)
        await store.setItem('lastService', params.id);

        const foundService = await metaStore.getItem(params.id);

        if(foundService){
            foundService.code = await getCodeFromStorageUsingTree(foundService.tree, store);
            return JSON.stringify({
                result: [ foundService ]
            }, null, 2);
        }

        //TODO (AND WANRING): get this from store instead!!!
        // currently will only return fake/default services
        const lsServices = defaultServices() || [];
        const result = {
            result: params.id === '*' || !params.id
                ? lsServices
                : lsServices.filter(x => Number(x.id) === Number(params.id))
        };
        await fileSystemTricks({ result, store, cache: cacheHeader });
        return  JSON.stringify(result, null, 2)
        //const foo = await store.getItem("foo");

    });
    app.post('/service/update/:id?', async (params, event) => {
        console.log('/service/update/:id? triggered');
        return JSON.stringify({ params, event }, null, 2);
    });
    app.post('/service/delete/:id?', (params, event) => {
        console.log('/service/delete/:id? triggered');
        return JSON.stringify({ params, event }, null, 2);
    });



    app.get('/manage/:id?', async (params, event) => {
        console.log('/manage/:id? triggered');
        return JSON.stringify({ params, event }, null, 2);
    });
    app.get('/monitor/:id?', async (params, event) => {
        console.log('/monitor/:id? triggered');
        return JSON.stringify({ params, event }, null, 2);
    });
    app.get('/persist/:id?', async (params, event) => {
        console.log('/persist/:id? triggered');
        return JSON.stringify({ params, event }, null, 2);
    });



    // THIS SHOULD BE REGISTERED BY DEFAULT
    // app.get('/.welcome/:path?', async (params, event) => {
    //     /*
    //     TODO: this route should instead be created dynamically instead of defined in this service
    //     based on reading services & determining which are "file system services"
    //     */
    //    console.log({ params })

    //    /*
    //     TODO:
    //     expect something like this:

    //     http://localhost:3000/bartok/.welcome/Readme.md?preview=true&edit=true
    //     should render document using a template and include editor to the left

    //     http://localhost:3000/bartok/.welcome/Readme.md?preview=true
    //     should preview document, no editing

    //     http://localhost:3000/bartok/.welcome/Readme.md?edit=true
    //     should allow editing and saving of document, no preview
    //    */

    //    return await (await fetch(event.request.url)).text();
    // });

    // NOTE: this is what happens when service request singleton is called into being
    (async () => {
        const restoreToExpress = [
            { name: '.welcome' }
        ];
        await metaStore
            .iterate((value, key) => {
                const { name } = value;
                restoreToExpress.push({ name });
            });
        for(let i=0, len=restoreToExpress.length; i<len; i++){
            const {name} = restoreToExpress[i];
            await addServiceHandler({ name, msg: 'served from reconstituded' });
        }
        // TODO: should also add routes/paths/handlers to SW which have been created but are not there already
        // could run in to problems with this ^^^ because those may be in the process of being added
    })();

    async function serviceAPIRequestHandler(event) {
        console.warn('Service Request Handler - usage');

        const serviceAPIMatch = app.find(event.request.url);
        if (!serviceAPIMatch) {
            return fetch(event.request.url);
        }
        //TODO: should console log path here so it's known what handler is being used
        event.respondWith(
            (async () => {
                const file = await serviceAPIMatch.exec(event);
                let response;

                if(file && file.type){ //most likely a blob
                    response = new Response(file, {headers:{'Content-Type': file.type }});
                    return response;
                }

                if(event.request.url.includes('.mjs')){
                    response = new Response(file, {headers:{'Content-Type': 'text/javascript' }});
                    return response;
                }

                if(event.request.url.includes('.svg')){
                    response = new Response(file, {headers:{'Content-Type': 'image/svg' }});
                    return response;
                }

                if(event.request.url.includes('preview')){
                    response = new Response(file, {headers:{'Content-Type': 'text/html'}});
                } else {
                    response = new Response(file);
                }
                return response;
            })()
        );
        // should be able to interact with instantiated services as well,
        // ie. all '.welcome' files should be available
        // each instantiated service should have its own store
    }

    return serviceAPIRequestHandler;
})();
