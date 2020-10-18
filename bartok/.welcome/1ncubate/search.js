/*

todo:

- make sure results match VS Code's results
  - return multiple results per line
- verify loss of speed is only in building index, not search
  - provide a search box and change searches on the fly
  - measure time to search
- update a document and search again based on that update
- integrate with service request handler
- integrate with client


*/
const deps = [
  '../shared.styl',
  'https://www.unpkg.com/flexsearch@0.6.32/dist/flexsearch.min.js'
];

const unique = arr => Array.from(new Set(arr));

(async () => {
  const searchTerm = "default";

  await appendUrls(deps)
  const exampleService = (await (await fetch('../../service/read/779')).json()).result[0];

  const t0 = performance.now();
  var index = new FlexSearch({
      encode: "icase",
      tokenize: "full",
      threshold: 1,
      resolution: 3,
      //depth: 3,
      async: true,
      worker: 5,
      cache: true
  });

  for(var i=0; i < exampleService.code.length; i++){
    const theDoc = exampleService.code[i];
    await index.add(i, theDoc.code);
  }
  const t1 = performance.now();
  console.log(`Indexing took ${Number(t1 - t0).toFixed(2)} milliseconds.`);
  
  const search = (term, opts={}) => new Promise((resolve, reject) => index.search(term, opts, resolve));
  const res = await search(searchTerm, { limit: false, page: 0+"", suggest: false });

  const t2 = performance.now();
  console.log(`Search took ${Number(t2 - t1).toFixed(2)} milliseconds.`);

  const getMatches = (theDoc, searchTerm) => {
    let matches = theDoc.code.split('\n')
      .map((x, i) => ({
        lineNumber: i,
        colNumber: x.toLowerCase().indexOf(searchTerm.toLowerCase()),
        lineText: x,
        docName: theDoc.name
      }))
      .filter(x => x.colNumber !== -1);
    return matches;
  };
  console.info(JSON.stringify(res,null,2))
  let allMatches = [];
  if(Array.isArray(res) && typeof res[0] === 'object'){
    for(var k=0; k<res.length; k++){
      for(var m=0; m<res[k].result.length; m++){
        const theDoc = exampleService.code[res[k].result[m]];
        allMatches = [...allMatches, ...getMatches(theDoc, searchTerm)];
      }
    }
  } else {
    for(var j=0; j<res.length; j++){
      const theDoc = exampleService.code[j];
      allMatches = [...allMatches, ...getMatches(theDoc, searchTerm)];
    }
  }

  const totalFiles = unique(allMatches.map(x=>x.docName));
  console.info(`Searching for "${searchTerm}": ${allMatches.length} results in ${totalFiles.length} files`);
  console.info(JSON.stringify(totalFiles,null,2))
  console.info(JSON.stringify(allMatches,null,2))
  
})()
