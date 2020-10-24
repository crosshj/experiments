let mimeTypes;
const xfrmMimes = (() => {
    let cache;
    return (m={}) => {
        cache = cache || Object.entries(m).map(([contentType, rest])=>({ contentType, extensions:[], ...rest}));
        return cache;
    }
})();
const getMime = filename => xfrmMimes(mimeTypes).find(m => m.extensions.includes(filename.split('.').pop()));

const safe = (fn) => {
    try {
        return fn();
    } catch(e){
        console.error('possible issue: '+fn.toString());
        return;
    }
}

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
                if(!branch[key]){ debugger; }
                recurse(branch[key], `${parent}${key}/`);
            }
        });
    };
    recurse(tree);
    return results;
};

const treeInsertFile = (path, tree) => {
    const splitPath = path.split('/')
        .filter(x => !!x && x !== '.');
    const newTree = JSON.parse(JSON.stringify(tree));
    let currentPointer = newTree;
    splitPath.forEach(x => {
        currentPointer[x] = currentPointer[x] || {};
        currentPointer = currentPointer[x];
    });
    return newTree;
}


const unique = (array, fn) => {
    const result = [];
    const map = new Map();
    for (const item of array) {
        if( map.has(fn(item)) ) continue;
        map.set(fn(item), true);
        result.push(item);
    }
    return result;
};

const fetchJSON = async (url, opts) => await (await fetch(url, opts)).json();

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

const NO_PREVIEW = `
<!-- NO_PREVIEW -->
<html>
	<style>
		.no-preview {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 1.5em;
			color: #666;
		}
		body {
			margin: 0px;
			margin-top: 40px;
			height: calc(100vh - 40px);
			overflow: hidden;
			color: #ccc;
			font-family: sans-serif;
		}
	</style>
	<body>
		<pre>
			<div class="no-preview">No preview available.</div>
			</pre>
	</body>
</html>
`;

async function fetchFileContents(filename) {
    const storeAsBlob = [
        "image/", "audio/", "video/", "wasm", "application/zip"
    ];
    const storeAsBlobBlacklist = [
        'image/svg', 'image/x-portable-pixmap'
    ];
    const fileNameBlacklist = [
        '.ts' // mistaken as video/mp2t
    ];
    const fetched = await fetch(filename);
    const contentType = fetched.headers.get('Content-Type');

    let _contents =
        storeAsBlob.find(x => contentType.includes(x)) &&
            !storeAsBlobBlacklist.find(x => contentType.includes(x)) &&
            !fileNameBlacklist.find(x => filename.includes(x))
            ? await fetched.blob()
            : await fetched.text();
    return _contents;
}

async function getFileContents({ filename, store, cache, storagePath }) {
    const cachedFile = await store.getItem(filename);
    let contents;

    // https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
    if (cachedFile && cache !== 'reload') {
        return cachedFile;
    }
    contents = await fetchFileContents(filename);
    if(storagePath){
        store.setItem('.' + storagePath.replace('/welcome/', '/.welcome/'), contents);
    } else {
        store.setItem(filename, contents);
    }

    return contents;
}

//TODO: this is intense, but save a more granular approach for future
async function fileSystemTricks({ result, store, cache, metaStore }) {
    if (!safe(() => result.result[0].code.find)) {
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
    const len = safe(() => result.result[0].code.length);
    const flat = flattenTree(safe(() => result.result[0].tree));

    for (var i = 0; i < len; i++) {
        const item = result.result[0].code[i];
        if (!item.code && item.path) {
            const filename = './' + item.path;
            const storagePath = (flat.find(x => x.name === item.name)||{}).path;
            item.code = await getFileContents({ filename, store, cache, storagePath });
        }
    }

    if(!result.result[0].name){
        console.error('cannot set meta store item without name');
        return;
    }
    await metaStore.setItem(result.result[0].id+'', {
        name: result.result[0].name,
        id: result.result[0].id,
        tree: result.result[0].tree
    });
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
    '/service/change': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/change(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
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
    '/service/provider/test/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/provider\/test(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/service/provider/create': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/provider\/create(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/service/provider/read/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/provider\/read(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/service/provider/update/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/provider\/update(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
        );
        return {
            match: url => regex.test(url),
            params: url => ({
                id: regex.exec(url)[2]
            })
        }
    })(),
    '/service/provider/delete/:id?': (() => {
        const regex = new RegExp(
            /^((?:.*))\/service\/provider\/delete(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
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

    update(name, contents){
        const ext = name.split('.').shift();
        const matchingTemplates = this.templates.filter(t=>t.extensions.includes(ext));
        matchingTemplates.forEach(m => m.body = contents);
        if(!matchingTemplates.length){
            this.add(name, contents);
        }
    }

    getTemplate(filename='', contents=''){
        const ext = filename.split('.').pop();
        const extMatch = this.templates.find(x => x.extensions.includes(ext));
        if(extMatch) return extMatch;

        const jsonMatch = (() => {
            if(!filename.includes('.json')){ return; }
            if(!contents.includes('file-type')){ return; }
            try {
              const parsed = JSON.parse(contents);
              const fileType = parsed['file-type'];
              if(!fileType) return;
              const _jsonMatch = this.templates
                .find(x => x.extensions.includes(fileType));
              return _jsonMatch;
            } catch(e){
              console.error(e);
              return;
            }
        })();
        return jsonMatch;
    }

    convert(filename, contents){
        if(filename.includes('.htm')){
            return contents;
        }
        if(!this.templates.length) return false;
        const foundTemplate = this.getTemplate(filename, contents);
        if(!foundTemplate) return;
        return foundTemplate.convert(contents);
    }
}

const fakeExpress = ({ store, handlerStore, metaStore }) => {
    const expressHandler = async (base, msg) => {
        console.log(`registering fake express handler for ${base}`);
        const templates = new TemplateEngine();

        const templatesFromStorage = [];
        await store
            .iterate((value, key) => {
                if(!key.includes(`/.templates/`)) return;
                templatesFromStorage.push({ value, key });
            });

        templatesFromStorage.forEach(t => {
            const { value, key } = t;
            const name = key.split('/').pop();
            templates.add(name, value);
        })


        return async (params, event) => {
            const { path, query } = params;
            const cleanPath = decodeURI(path.replace('/::preview::/', ''));
            const previewMode = path.includes('/::preview::/');
            const templateUrl = path.includes('.templates/');

            const filename = previewMode
                ? cleanPath.split('/').pop()
                : path.split('/').pop();
            let xformedFile;

            const file = await store.getItem(`./${base}/${cleanPath}`);
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

            // NOTE: would rather update template when saved, but templates not available then
            // for now, this will do
            if(templateUrl){
                templates.update(filename, file);
            }

            if(previewMode && !xformedFile){
                return NO_PREVIEW;
            }

            // most likely a blob
            if(file && file.type && file.size){
                //xformedFile because there may be a template for blob type file
                return xformedFile || file;
            }

            //TODO: need to know file type so that it can be returned properly
            return xformedFile || fileJSONString || file;
        };
    };

    // be careful!  handlers could be a variable in parent(service worker) scope
    const _handlers = [];
    const generic = (method) => (pathString, handler) => {
        const path = pathToRegex[pathString];
        let alternatePath;
        if (!path) {
            alternatePath = genericPath(pathString);
            //console.log({ alternatePath });
        }
        const foundHandler = _handlers.find(x => x.pathString === pathString && x.method === method);
        if(foundHandler){
            console.log(`Overwriting handler for ${method} : ${pathString}`);
            foundHandler.handler = handler;
            return;
        }
        _handlers.push({
            ...(path || alternatePath),
            pathString,
            method,
            handler
        });
    };


    const addServiceHandler = async ({ name, msg }) => {
        const route = `/${name}/(.*)`;
        const handler = "./modules/serviceRequestHandler.js";

        // handlers here are service worker handlers
        const foundHandler = handlers.find(x => x.handlerName === handler);
        const foundExactHandler = foundHandler && handlers
            .find(x =>
                x.handlerName === handler && x.routePattern === route
            );
		if(foundExactHandler){
			console.log(`sw handler was already installed for ${foundExactHandler.routePattern} (boot)`);
        } else {
            handlers.push({
                type: foundHandler.type,
                routePattern: route,
                route: new RegExp(route),
                handler: foundHandler.handler,
                handlerName: handler,
                handlerText: foundHandler.handlerText
            });
            // question: if handler is found in SW state, should store be updated?
            await handlerStore.setItem(route, {
                type,
                route,
                handlerName: handler,
                handlerText: foundHandler.handlerText
            });
        }

        // question: if handler is found in SW state, should serviceRequestHandler state be updated?
        const expHandler = await expressHandler(name, msg);
        generic('get')(`/${name}/:path?`, expHandler);
        // ^^^ this should add handler to epxress _handlers
    };
    const restorePrevious = async ({ metaStore }) => {
        const restoreToExpress = [];
        await metaStore
            .iterate((value, key) => {
                let { name } = value;
                if(name === "welcome"){
                    name = '.welcome'
                }
                restoreToExpress.push({ name });
            });
        for(let i=0, len=restoreToExpress.length; i<len; i++){
            const {name} = restoreToExpress[i];
            await addServiceHandler({ name, msg: 'served from reconstituded' });
        }
        // TODO: should also add routes/paths/handlers to SW which have been created but are not there already
        // could run in to problems with this ^^^ because those may be in the process of being added
    };



    const find = async (url) => {
        let found = _handlers.find(x => x.match(url));
        if (!found) {
            await restorePrevious({ metaStore });
            found = _handlers.find(x => x.match(url));

            if(!found){
                return;
            }
        }
        return {
            exec: async (event) => {
                return await found.handler(found.params(url), event);
            }
        };
    };

    const app = {
        addServiceHandler,
        get: generic('get'),
        post: generic('post'),
        find
    };
    return app;
};

async function getCodeFromStorageUsingTree(tree, store, serviceName){
    // flatten the tree (include path)
    // pass back array of  { name: filename, code: path, path }
    const files = flattenTree(tree);

    const allFilesFromService = {};
    await store.iterate((value, key) => {
        if(key.startsWith(`./${serviceName}/`)){
            allFilesFromService[key] = {
                key,
                code: value,
                untracked: true
            };
        }
    })

    // UI should call network(sw) for file
    // BUT for now, will bundle entire filesystem with its contents
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        let storedFile;
        if(file.path.includes('/welcome/')){
            storedFile = allFilesFromService['.' + file.path.replace('/welcome/', '/.welcome/')];
        } else {
            storedFile = allFilesFromService['.' + file.path];
        }
        file.code = storedFile ? storedFile.code : '';
        storedFile && (storedFile.untracked = false);

        // OMG, live it up in text-only world... for now (templates code expects text format)
        file.code = file.size
            ? null
            : file.code;
    }

    const untracked = Object.entries(allFilesFromService)
        .map(([, value]) => value)
        .filter(x => x.untracked === true)
        .map((x) => ({
            ...x,
            name: x.key.split('/').pop(),
            path: x.key
        }));

    return [ ...files, ...untracked ]; // aka code array
}

// this makes a service from UI look like files got from storage
function getCodeAsStorage(tree, files, serviceName){
    const flat = flattenTree(tree);
    for (let index = 0; index < flat.length; index++) {
        const file = flat[index];
        flat[index] = {
            key: file.path,
            value: files.find(x => x.name === file.path.split('/').pop())
        };
    }
    const untracked = files.filter(x => x.untracked)
        .map((file, i) => ({
            key: `/${serviceName}/${file.name}`,
            value: {
                code: file.code,
                name: file.name,
                path: `/${serviceName}/`
            }
        }));
    return [...flat, ...untracked];
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
class ProviderManager {
    constructor(store) {
        this.store = store;
    }
    async create(provider){
        return await this.store
            .setItem(provider.id+'', provider);
    }
    async read(id){
        if(!id){
            return await this.store.keys();
        }
        return await this.store
            .getItem(id);
    }
    async update(id, updates){
        const provider = await this.read(id);
        if(updates.id && updates.id !== id){
            await this.delete(id);
        }
        return await this.store
            .setItem(
                (updates.id || provider.id)+'',
                {...provider, ...updates}
            );
    }
    async delete(id){
        return await this.store
            .removeItem(id);
    }
}

const providerFileChange = async ({ path, code, parent, metaStore, serviceName, deleteFile }) => {
    const foundParent = parent || await metaStore
        .iterate((value, key) => {
            if(value.name === serviceName){
                return value;
            }
        });
    if(!foundParent || !foundParent.providerUrl) throw new Error('file not saved to provider: service not associated with a provider');
    const { providerUrl, providerRoot } = foundParent;
    const pathWithoutParent = path.replace('./' + (serviceName || foundParent.name), '' );
    const filePostUrl = `${providerUrl}file/${providerRoot}${pathWithoutParent}`;

    const filePostRes = await fetchJSON(filePostUrl, {
        method: deleteFile ? 'DELETE' : 'POST',
        body: deleteFile ? undefined : code
    });
    if(filePostRes.error) throw new Error(filePostRes.error)
    return filePostRes;
};

(() => {
    console.warn('Service Request Handler - init');
    (async () => {
        mimeTypes = await fetchJSON('https://cdn.jsdelivr.net/npm/mime-db@1.45.0/db.json');
    })();

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
    const providerStore = localforage
        .createInstance({
            driver: driverOrder,
            name: 'serviceRequest',
            version: 1.0,
            storeName: 'provider',
            description: 'services which connect browser ui to outside world'
        });
    const providerManager = new ProviderManager(providerStore);

    // handlerStore comes from SW context
    let app = fakeExpress({ store, handlerStore, metaStore });

    const providerUpdateServiceJson = async ({ service, metaStore, fileStore }) => {
        const serviceJsonFile = service.code.find(x => x.path.includes('/service.json'));
        if(!serviceJsonFile) return;
        const serviceJson = JSON.parse(serviceJsonFile.code);

        const { code, ...serviceOther } = service;
        const { providerUrl, providerRoot } = service;

        serviceJson.tree = service.tree[service.name];
        serviceJson.files = service.code
            .map(x => ({
                name: x.name,
                path: x.path.replace('./', '')
            }))
            .sort((a,b) => {
                if(a.name.toLowerCase() > b.name.toLowerCase()){ return 1; }
                if(a.name.toLowerCase() < b.name.toLowerCase()){ return -1; }
                return 0;
            });
        const pathWithoutParent = serviceJsonFile.path.replace('./' + service.name, '' );
        const filePostUrl = `${providerUrl}file/${providerRoot}${pathWithoutParent}`;

        serviceJsonFile.code = JSON.stringify(serviceJson, null, 2);
        if(!serviceOther.name){
            console.error('cannot set meta store item without service name');
            return;
        }
        await metaStore.setItem(service.id + '', serviceOther);
        await fileStore.setItem(serviceJsonFile.path, serviceJsonFile.code);
        await fetch(filePostUrl, {
            method: 'post',
            body: serviceJsonFile.code
        });
    };

    const providerCreateServiceHandler = async (event) => {
        console.warn('providerCreateServiceHandler');
        try {
            const body = await event.request.json();
            const { providerType, providerUrl } = body;
            const isSupported = ['basic-bartok-provider'].includes(providerType);
            if(!isSupported){
                return JSON.stringify({
                    error: `Unsupported provider type: ${providerType}`
                }, null, 2);
            }
            const provider = await providerManager.read(providerUrl);
            if(!provider){
                return JSON.stringify({
                    error: `Provider does not exist: ${providerUrl}`
                }, null, 2);
            }
            const treeUrl = (providerUrl + '/tree/').replace('//tree/', '/tree/');
            const fileUrl = (providerUrl + '/file/').replace('//file/', '/file/');
            const allServices = [];
            await metaStore
                .iterate((value, key) => {
                    allServices.push(value);
                });

            const baseRes = await fetch(treeUrl);
            if(baseRes.status !== 200){
                return JSON.stringify({
                    error: `Failed to connect to provider at: ${providerUrl}`
                },null,2);
            }
            const {
                files: providerFiles,
                root: providerRoot,
                tree: providerTree
            } = await baseRes.json();
            const providerRootName = providerRoot.split('/').pop();

            const foundService = allServices.find(x => x.name === providerRootName);
            const id = foundService
                ? foundService.id
                : allServices
                    .reduce((all, one) => {
                        return Number(one.id) >= all
                            ? Number(one.id) + 1
                            : all
                        }, 1
                    );

            const service = {
                name: providerRootName,
                id,
                providerRoot,
                providerUrl,
                tree: providerTree
            };
            if(!service.name){
                console.error('cannot set meta store item without service name');
                return;
            }
            await metaStore.setItem(id+'', service);
            service.code = [];
            for (let f = 0; f < providerFiles.length; f++) {
                const filePath = providerFiles[f];
                const fileContents = await fetchFileContents(`${fileUrl}${providerRoot}/${filePath}`);
                store.setItem(`./${providerRootName}/${filePath}`, fileContents);
                service.code.push({
                    name: filePath.split('/').pop(),
                    path: `./${providerRootName}/${filePath}`,
                    code: typeof fileContents === 'string' ? fileContents : ''
                });
            }
            await providerUpdateServiceJson({
                service, metaStore, fileStore: store
            });

            await app.addServiceHandler({
                name: providerRootName,
                msg: 'served from fresh baked'
            });
            return JSON.stringify({
                result: {
                    services: [ service ]
                }
            }, null, 2);
        } catch(e) {
            console.error(e);
            return JSON.stringify({
                error: e
            },null,2);
        }
    };

    app.post('/service/create/:id?', async (params, event) => {
        // event.request.arrayBuffer()
        // event.request.blob()
        // event.request.json()
        // event.request.text()
        // event.request.formData()
        const { id } = params;

        if(id === "provider"){
            return await providerCreateServiceHandler(event);
        }
        const { name } = (await event.request.json()) || {};

        if(!id){
            return JSON.stringify({ params, event, error: 'id required for service create!' }, null, 2);
        }
        if(!name){
            return JSON.stringify({ params, event, error: 'name required for service create!' }, null, 2);
        }
        console.log('/service/create/:id? triggered');
        //return JSON.stringify({ params, event }, null, 2);

        // create the service in store
        await metaStore.setItem(id+'', {
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
        await app.addServiceHandler({ name, msg: 'served from fresh baked' });

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
                const code = await getCodeFromStorageUsingTree(service.tree, store, service.name);
                service.code = code;
            }
            //console.log({ defaults, savedServices });

            const allServices = [...defaults, ...savedServices]
                .sort((a, b) => Number(a.id) - Number(b.id))
                .map(x => ({ id: x.id, name: x.name }));

            return JSON.stringify({
                result: unique(allServices, x => Number(x.id))
            }, null, 2);
        }

        // if id, return that service
        // (currently doesn't do anything since app uses localStorage version of this)
        await store.setItem('lastService', params.id);

        const foundService = await metaStore.getItem(params.id);

        if(foundService){
            foundService.code = await getCodeFromStorageUsingTree(foundService.tree, store, foundService.name);
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
        await fileSystemTricks({ result, store, metaStore, cache: cacheHeader });
        return  JSON.stringify(result, null, 2)
        //const foo = await store.getItem("foo");

    });


    app.post('/service/change', async (params, event) => {
        let jsonData;
        try {
            const clonedRequest = event.request.clone();
            jsonData = await clonedRequest.json();
        } catch(e) {}

        let fileData;
        try {
            if(!jsonData){
                const formData = await event.request.formData();
                jsonData = JSON.parse(formData.get('json'));
                fileData = formData.get('file');
            }
        } catch(e) {}

        try {
            let { path, code, command, service } = jsonData;
            if(fileData){ code = fileData || ''; }

            await store.setItem(path, code);

            if(command === 'upsert'){
                const serviceToUpdate = await metaStore.iterate((value, key) => {
                    if(value.name === service ) return value;
                    return;
                });
                serviceToUpdate.tree = treeInsertFile(path, serviceToUpdate.tree);
                await metaStore.setItem(serviceToUpdate.id+'', serviceToUpdate);
            }

            const metaData = () => ''; //TODO
            return JSON.stringify({ result: {
                path,
                code: fileData ? metaData(fileData) : code
            }}, null,2)
        } catch(error) {
            return JSON.stringify({ error }, null, 2);
        }
    });

    app.post('/service/update/:id?', async (params, event) => {
        try {
            const { id } = params;
            const body = await event.request.json();
            const { name } = body;

            const preExistingService = (await metaStore.getItem(id+'')) || {};
            const parsedCode = !Array.isArray(body.code) && safe(() => JSON.parse(body.code));
            if(parsedCode && parsedCode.tree){
                body.tree = parsedCode.tree;
                body.code = parsedCode.files;
            }
            const service = {
                ...preExistingService,
                ...{
                    name, tree: body.tree
                }
            };
            if(!service.name){
                console.error('cannot set meta store item without name');
                return;
            }
            await metaStore.setItem(id+'', service);

            const storageFiles = await getCodeFromStorageUsingTree(body.tree, store, service.name);
            const updateAsStore = getCodeAsStorage(body.tree, body.code, service.name);

            const allServiceFiles = [];
            await store
                .iterate((value, key) => {
                    if(( new RegExp( name === 'welcome'
                            ? '^./.welcome/'
                            : '^./' + name + '/')
                        ).test(key)
                    ){
                        const path = key.replace('./', '/').replace('/.welcome/', '/welcome/');
                        allServiceFiles.push({ key, value, path });
                    }
                });

            const filesToUpdate = [];
            const filesToDelete = [];
            const binaryFiles = [];

            // update or create all files in update
            for (let i = 0; i < updateAsStore.length; i++) {
                const file = updateAsStore[i];
                const storageFile = storageFiles.find(x => x.path === file.key);
                if(file.key.includes('/.keep')){
                    continue;
                }
                if(file && (!storageFile || !storageFile.code)){
                    filesToUpdate.push(file);
                    continue;
                }
                if(typeof storageFile.code !== 'string'){
                    binaryFiles.push(file);
                    continue;
                }
                if(file.value && file.value.code === storageFile.code){
                    continue;
                }
                filesToUpdate.push(file);
            }

            // TOFO: binary files
            console.warn(`may need to update binary files!`);
            console.log(binaryFiles.map(x => x.key ));

            // delete any storage files that are not in service
            for (let i = 0; i < allServiceFiles.length; i++) {
                const serviceFile = allServiceFiles[i];
                if(serviceFile.key.includes('/.keep')){
                    continue;
                }
                const found = updateAsStore.find(x =>
                    x.key === serviceFile.path ||
                    ('.' +x.key) === serviceFile.key
                );
                if(found) continue;
                filesToDelete.push(serviceFile.key);
            }

            // update files
            for (let i = 0; i < filesToUpdate.length; i++) {
                const update = filesToUpdate[i];
                let code;
                try { code = update.value.code.code } catch(e) {}
                try { code = code || update.value.code } catch(e) {}
                try { code = code || '\n\n' } catch(e) {}

                await store.setItem(
                    '.' + update.key.replace('/welcome/', '/.welcome/'),
                    code
                );
                await providerFileChange({ path: '.' + update.key,  code, parent: service });
            }
            // delete files
            for (let i = 0; i < filesToDelete.length; i++) {
                const key = filesToDelete[i];
                await store.removeItem(key);
                await providerFileChange({ path: key,  parent: service, deleteFile: true });
            }

            return JSON.stringify({
                result: [ body ]
            }, null, 2);
        } catch(e){
            console.error(e);
            return JSON.stringify({ error: e }, null, 2);;
        }
    });
    app.post('/service/delete/:id?', (params, event) => {
        console.log('/service/delete/:id? triggered');
        return JSON.stringify({ params, event }, null, 2);
    });


    app.post('/service/provider/test/:id?', async (params, event) => {
        try {
            const body = await event.request.json();
            const { providerType, providerUrl } = body;
            const isSupported = ['basic-bartok-provider'].includes(providerType);
            if(!isSupported){
                return JSON.stringify({
                    error: `Unsupported provider type: ${providerType}`
                },null,2);
            }
            const fileUrl = (providerUrl + '/file/').replace('//file/', '/file/');
            const treeUrl = (providerUrl + '/tree/').replace('//tree/', '/tree/');
            try {
                const baseRes = await fetch(providerUrl);
                if(baseRes.status !== 200){
                    return JSON.stringify({
                        error: `Failed to connect to provider at: ${providerUrl}`
                    },null,2);
                }
            } catch(e) {
                return JSON.stringify({
                    error: `Failed to connect to provider at: ${providerUrl}`
                },null,2);
            }
            try {
                const fileRes = await fetch(fileUrl);
                if(fileRes.status !== 200){
                    return JSON.stringify({
                        error: `Failed to connect to provider at: ${fileUrl}`
                    },null,2);
                }
            } catch(e) {
                return JSON.stringify({
                    error: `Failed to connect to provider at: ${fileUrl}`
                },null,2);
            }
            try {
                const treeRes = await fetch(treeUrl);
                if(treeRes.status !== 200){
                    return JSON.stringify({
                        error: `Failed to connect to provider at: ${treeUrl}`
                    },null,2);
                }
            } catch(e) {
                return JSON.stringify({
                    error: `Failed to connect to provider at: ${treeUrl}`
                },null,2);
            }
            return JSON.stringify({
                success: true
            },null,2);
        } catch(e){
            return JSON.stringify({
                error: e
            },null,2);
        }
    });
    app.post('/service/provider/create', async (params, event) => {
        try {
            const body = await event.request.json();
            const { providerType, providerUrl } = body;
            const isSupported = ['basic-bartok-provider'].includes(providerType);
            if(!isSupported){
                return JSON.stringify({
                    error: `Unsupported provider type: ${providerType}`
                }, null, 2);
            }
            const provider = await providerManager.create({
                id: providerUrl,
                url: providerUrl
            });
            return JSON.stringify({
                success: true,
                provider
            }, null, 2);
        } catch(e) {
            return JSON.stringify({
                error: e
            }, null, 2);
        }
    });
    app.post('/service/provider/read/:id?', async (params, event) => {
        console.error('not implemented: provider read.  Should return one or all saved provider details.');
        return JSON.stringify({ error: 'not implemented: provider read.  Should return one or all saved provider details.' });
    });
    app.post('/service/provider/update/:id?', async (params, event) => {
        console.error('not implemented: provider update.  Should update provider details.');
        return JSON.stringify({ error: 'not implemented: provider update.  Should update provider details.' });
    });
    app.post('/service/provider/delete/:id?', async (params, event) => {
        console.error('not implemented: provider delete.  Should delete saved provider.');
        return JSON.stringify({ error: 'not implemented: provider delete.  Should delete saved provider.' });
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

    async function serviceAPIRequestHandler(event) {
        //console.warn('Service Request Handler - usage');
        //console.log(event.request.url);

        const serviceAPIMatch = await app.find(event.request.url);

        const res = serviceAPIMatch
            ? await serviceAPIMatch.exec(event)
            : 'no match in service request listener!';
        let response;

        // if(res && res.type){ //most likely a blob
        //     response = new Response(res, {headers:{'Content-Type': res.type }});
        //     return response;
        // }

        if(event.request.url.includes('/::preview::/')){
            response = new Response(res, {headers:{'Content-Type': 'text/html'}});
            return response;
        }

        let { contentType } = getMime(event.request.url) || {};
        if(!contentType && serviceAPIMatch && !res.type){
            ;({ contentType } = getMime('.json'));
        }

        if(contentType){
            response = new Response(res, {headers:{ 'Content-Type': contentType || res.type }});
            return response;
        }

        return new Response(res);

        // should be able to interact with instantiated services as well,
        // ie. all '.welcome' files should be available
        // each instantiated service should have its own store
    }

    return serviceAPIRequestHandler;
})();
