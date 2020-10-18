/*

worker:
https://github.com/bvaughn/js-worker-search


unsure about worker:
https://lucaongaro.eu/blog/2019/01/30/minisearch-client-side-fulltext-search-engine.html
https://www.npmjs.com/package/flexsearch
http://elasticlunr.com/
https://pouchdb.com/
https://lunrjs.com/

wasm
https://github.com/tinysearch/tinysearch


*/
const deps = [
  '../shared.styl',
  //'https://www.unpkg.com/js-worker-search@1.4.1/dist/js-worker-search.js'
];



function WebWorker(fn) {
    const fnString = `(${fn.toString().trim()})()`;
    const worker = new Worker(URL.createObjectURL(new Blob([fnString])));
    const wrapped = function(args, cb){
        worker.onmessage = function (e){
            cb(e.data);
        }
        worker.postMessage(args);
    };
    wrapped.close = worker.terminate;
    wrapped.worker = worker;
    wrapped.message = (fnName, args) => new Promise((resolve, reject) => {
      worker.onmessage = resolve;
      worker.postMessage({ fnName, args });
    });
    return wrapped;
}

function SearchWorker(){
  function searchWorkerSrc(){
    self.window = self;
    //lame faking of modules system for js-worker-search
    self.window.module = {
      set exports(m) { this.modules.push(m); },
      modules: []
    };
    self.importScripts('https://www.unpkg.com/js-worker-search@1.4.1/dist/js-worker-search.js');

    const SearchApi = window.module.modules[0].default;
    const INDEX_MODES = window.module.modules[0].INDEX_MODES;
    const searchApi = new SearchApi();

    onmessage = function(e) {
      const { fnName, args } = e.data;
      const handler = {
        index: async () => {
          await searchApi.indexDocument(args.name, args.code);
          postMessage({ result: `${args.name} indexed` })
        },
        search: async () => {
          const result = await searchApi.search(args);
          postMessage({ result })
        }
      }[fnName];
      if(!handler) return postMessage({ error: `function: ${fnName} not found` });
      handler();
    }
  };

  const worker = WebWorker(searchWorkerSrc);
  const DELAY = 3000;
  worker.index = (doc) => new Promise(async (resolve, reject) => {
    const { data: { result } } = await worker.message('index', doc);
    setTimeout(() => {
      resolve(result);
    }, DELAY);
  });
  worker.search = async (term) => {
    const { data: { result } } = await worker.message('search', term);
    return result;
  }
  return worker;
}

(async () => {
  await appendUrls(deps)
  const exampleService = (await (await fetch('../../service/read/779')).json()).result[0];

  const searchWork = SearchWorker();
  
  for(var i=0; i < exampleService.code.length-5; i++){
    const theDoc = exampleService.code[i];
    console.log(theDoc.name)
    //await searchWork.index(theDoc);
  }
  
  
  //const indexResult = await searchWork.index(exampleService.code[0]);
  //console.log(indexResult);
  //const searchResult = await searchWork.search('the');
  //console.log(searchResult);
  /*
  console.info(Object.keys(exampleService));
  const SearchApi = window.module.modules[0].default;
  const INDEX_MODES = window.module.modules[0].INDEX_MODES;
  const searchApi = new SearchApi({
    indexMode: INDEX_MODES.PREFIXES
  });
  for(var i=0; i < exampleService.code.length; i++){
    const theDoc = exampleService.code[i];
    console.info(theDoc.name);
    await searchApi.indexDocument(theDoc.name, theDoc.code);
  }
  const result = await searchApi.search('editor');
  console.log('result=')
  console.info(JSON.stringify(result, null, 2))
  */
})()
