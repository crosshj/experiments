const deps =[
  './shared.styl'
];

(async () => {

  await appendUrls(deps);

  function aileen(){
    (new Array(10))
      .fill()
      .forEach(x =>
      console.info('Pete the ween and Zoe the B*')
    );
  }

  await prism('javascript', aileen.toString())
  aileen()

  var Harrison = [];

  for (var i = 1; i < 20; i += 4) {
    Harrison.push(i);
  }

  var Pete = [];

  for (var z = 0; z < 45; z += 3) {
    Pete.push(z);
  }

  function replacer(i, val) {
    if(Array.isArray(val)){
      return '['+val.join(', ')+']'
    }
    return val
  }
  await prism("json", JSON.stringify({Harrison, Pete}, replacer, 2))

  
})();
