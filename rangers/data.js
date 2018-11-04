
var async = require('async');
const fs = require('fs');
var request = require('request')
var cachedRequest = require('cached-request')(request)
var cacheDirectory = "./.cache";
cachedRequest.setCacheDirectory(cacheDirectory);

const ONE_HOUR = 60 /*minutes*/ * 60 /*seconds*/ * 1000 /*milliseconds*/;
cachedRequest.setValue('ttl', ONE_HOUR);

const HARD_CACHE_JSON = './.cache/hardCache.json';
const hardCache = ensureRequireJSON(HARD_CACHE_JSON) || {};

const logNice = (item) => {
  console.log(JSON.stringify(item, null, '\t'));
};

function ensureRequireJSON(path){
  let json;
  try {
    json = require(path);
  } catch(e) {
    fs.openSync(path, 'w');
  }
  return json;
};

function tryParse(input){
  var output;
  try {
    output = JSON.parse(input);
  } catch(e) { /* do nothing */ }
  return output;
}

let cachedRequests = 0;
let fetchedRequests = 0;
function requestUrl(url, callback){
  if(hardCache[url]){
    //console.log(`CACHED: ${url}`);
    cachedRequests++;
    return callback(undefined, hardCache[url]);
  }
  //console.log(`FETCH: ${url}`)
  fetchedRequests++;
  var options = { url };
  cachedRequest(options, (e,a,t) => {
    const results = tryParse(t);
    if(results){
      hardCache[url] = results;
      fs.writeFileSync(
        HARD_CACHE_JSON,
        JSON.stringify(hardCache, null, '\t')
      );
    }
    callback(e, results)
  });
}

//NOTE: this is needed in order to track top gear usage
function getPlayerInfo(item, callback){
  // https://rangers.lerico.net/api/getPlayer/u610d9edfeaf01bdb67f66a4a1d02317f
  const playerId = item;
  const playerUrl = `https://rangers.lerico.net/api/getPlayer/${playerId}`;
  requestUrl(playerUrl, callback);
}

function quickSave(data, path){
  fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
}

function overlayFullPlayerInfo(pvp, allPlayerInfo){
  const mapped = JSON.parse(JSON.stringify(pvp));
  //console.log(Object.keys(pvp));
  // console.log(JSON.stringify(pvp.playerInfo[1].playerUnitPvPTeams, null, '\t'));
  // console.log(JSON.stringify({
  //   error,
  //   result: allPlayerInfo[0].playerUnitPvPTeams
  // }, null, '\t'));
  // logNice({
  //   original: mapped.playerInfo[1],
  //   updated: allPlayerInfo[1]
  // }, './.foo.json');
  pvp.playerInfo = allPlayerInfo;
  return pvp;
}

function getAllPlayerInfo(pvp, callback){
  // all players in series, get player info and add to pvp
  const allPlayerIds = pvp.playerInfo.map(x => x.mid);
  async.mapSeries(allPlayerIds, getPlayerInfo, (error, results) => {
    const overlayed = overlayFullPlayerInfo(pvp, results);
    callback(null, overlayed);
  });
}

function getTranslateWords(array){
  const allWords = array.reduce((all, one) => {
    var words = {};
    const tag = `en-${one.tag}`;
    if(!one.results[tag]){
      words = {
        [tag]: one.results
      };
    } else {
      words = one.results;
    }
    return {...all, ...words };
  }, {})
  return allWords;
}

function fetch(callback){
  const urls = [
    'https://rangers.lerico.net/api/getPvps',
    'https://rangers.lerico.net/api/getRangersBasics',
    'https://rangers.lerico.net/api/translate/en/UNIT',
    'https://rangers.lerico.net/api/v2/stages/advent',
    'https://rangers.lerico.net/api/v2/stages/normal',
    'https://rangers.lerico.net/api/v2/stages/special',
    'https://rangers.lerico.net/api/getEquipments',
    'https://rangers.lerico.net/api/getEquipmentAttrs',
    'https://rangers.lerico.net/api/getSkills',
    'https://rangers.lerico.net/api/translate/en/SKILL',
    'https://rangers.lerico.net/api/translate/en/PROPERTIES',
    'https://rangers.lerico.net/api/translate/en/EQUIP',
    'https://rangers.lerico.net/api/translate/en/CUSTOM_SHORTFORM',
    'https://rangers.lerico.net/api/translate/en/CUSTOM',
  ];
  async.map(urls, requestUrl, function(err, results) {
      if(err) {
        return callback(err);
      }
      const pvp = results[0];
      const rangers = results[1];

      const stages = {
        advent: results[3],
        normal: results[4],
        special: results[5],
      };
      const gear = results[6];
      const gearAttrs = results[7];
      const skills = results[8];

      const words = Object.entries({
        UNIT: results[2],
        SKILL: results[9],
        PROPERTIES: results[10],
        EQUIP: results[11],
        CUSTOM_SHORTFORM: results[12],
        CUSTOM: results[13]
      })
        .map(x => ({
          tag: x[0],
          results: x[1]
        }));

      const translateWords = getTranslateWords(words);

      getAllPlayerInfo(pvp, (e, p) => {
        if(e){
          return callback(e);
        }
        callback(undefined, {
          pvp:p, rangers, translateWords, stages, gear, gearAttrs, skills
        });
      });
  });
}

module.exports = fetch;

if(!module.parent){
  fetch((err, data) => {
    const {
      pvp, rangers, translateWords, stages, gear, gearAttrs
    } = data;

    console.log(err || {
      pvp: pvp.top100.length,
      rangers: rangers.length,
      words: Object.keys(
        translateWords['en-UNIT']
      ).length,
      advent: stages.advent.length,
      normal: stages.normal.length,
      special: stages.special.length,
      gear: gear.length,
      gearAttrs: gearAttrs.length,
      cachedRequests,
      fetchedRequests
    })
  });
}
