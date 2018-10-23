
var async = require('async');
var request = require('request')
var cachedRequest = require('cached-request')(request)
var cacheDirectory = "./.cache";
cachedRequest.setCacheDirectory(cacheDirectory);

const ONE_HOUR = 60 /*minutes*/ * 60 /*seconds*/ * 1000 /*milliseconds*/;
cachedRequest.setValue('ttl', ONE_HOUR);

var pvp, rangers, translateWords;

function tryParse(input){
  var output;
  try {
    output = JSON.parse(input);
  } catch(e) { /* do nothing */ }
  return output;
}

function requestUrl(url, callback){
  var options = { url };
  cachedRequest(options, (e,a,t) => callback(e, tryParse(t)) );
}

function fetch(callback){
  const urls = [
    'https://rangers.lerico.net/api/getPvps',
    'https://rangers.lerico.net/api/getRangersBasics',
    'https://rangers.lerico.net/api/translate/en/UNIT'
  ];
  async.map(urls, requestUrl, function(err, results) {
      if(err) {
        return callback(err);
      }
      pvp = results[0];
      rangers = results[1];
      if(!results[2]['en-UNIT']){
        translateWords = {
          'en-UNIT': results[2]
        };
      } else {
        translateWords = results[2];
      }
      callback(undefined, { pvp, rangers, translateWords });
  });
}

module.exports = fetch;

if(!module.parent){
  fetch((err, data) => {
    console.log(err || {
      pvp: data.pvp.top100.length,
      rangers: data.rangers.length,
      words: Object.keys(
        data.translateWords['en-UNIT']
      ).length
    })
  });
}
