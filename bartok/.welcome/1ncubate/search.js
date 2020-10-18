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
  'https://www.unpkg.com/flexsearch@0.6.32/dist/flexsearch.min.js'
];

(async () => {
  const searchTerm = "code";

  await appendUrls(deps)
  const exampleService = (await (await fetch('../../service/read/779')).json()).result[0];

  var index = new FlexSearch({
      encode: "icase",
      tokenize: "reverse",
      //threshold: 8,
      //resolution: 9,
      //depth: 1,
      async: true,
      worker: 1,
      cache: false
  });

  for(var i=0; i < exampleService.code.length; i++){
    const theDoc = exampleService.code[i];
    await index.add(i, theDoc.code);
  }

  const search = (term, opts={}) => new Promise((resolve, reject) => index.search(term, opts, resolve));
  const res = await search(searchTerm, { limit: false, page: 0+"", suggest: false });

  const getMatches = (theDoc, searchTerm) => {
    let matches = theDoc.code.split('\n')
      .map((x, i) => ({ lineNumber: i, text:x }))
      .filter(x => x.text.toLowerCase().includes(searchTerm));
    if(matches.length > 0){
      console.info(theDoc.name + '\n\n' + JSON.stringify(matches, null, 2))
    } else {
      console.info(theDoc.name + '\n\n ( false positive? )' )
    }
    return matches;
  };
  if(Array.isArray(res)){
    for(var k=0; k<res.length; k++){
      console.log(`Results#: ${k}`);
      for(var m=0; m<res[k].result.length; m++){
        const theDoc = exampleService.code[res[k].result[m]];
        getMatches(theDoc, searchTerm);
      }
    }
    return;
  }
  for(var j=0; j<res.length; j++){
    const theDoc = exampleService.code[j];
    getMatches(theDoc, searchTerm);
  }

})()
