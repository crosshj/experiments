/*

graph trends of pvp over time
https://canvasjs.com/javascript-charts/custom-legend-chart/
https://canvasjs.com/javascript-charts/spline-chart-legends/
https://canvasjs.com/javascript-charts/multi-series-spline-area-chart/

http://nodesimplified.com/top-5-best-open-source-javascript-chart-library/

https://hackernoon.com/creating-stunning-charts-with-vue-js-and-chart-js-28af584adc0a


ITERATE:

- normalize:
  - usage numbers should be percentage of total rangers used
  - combine ranger evolution series into one ranger

- track gear:
  - what is popular gear
  - what gear is popular for ranger

*/

var columnify = require('columnify')
var fetch = require('./data');

const {
  quickSave,
  clone,
  logNice,
  propsMap,
  safeAccess
} = require('./utilities');


function formattedResults(rangers, translateWords, data) {
  var options = { minWidth: 10 };

  var safeRangers = rangers.filter(x => x.unitCode[0] === 'u' &&
    x.unitCategoryType !== 'INT' &&
    translateWords['en-UNIT'][x.unitNameCode] &&
    x.created);

  function topByProp(p, number, full) {
    var sortDesc = (prop) => safeRangers.sort((a, b) => b[prop] - a[prop]);
    var initHPsorted = sortDesc(p);
    var initialHpTop = [];
    (new Array(number)).fill().forEach((_a, i) => {
      var x = initHPsorted[i];
      var min = {
        name: translateWords['en-UNIT'][x.unitNameCode],
        [p]: x[p]
      };
      initialHpTop.push(!full
        ? min
        : Object.assign({}, x, min));
    });
    return initialHpTop;
  }
  const lister = (long, prop) => {
    return `
Top Rangers by ${long}
-----------------------------------------
${columnify(topByProp(prop, 30), { config: { [prop]: { align: 'right' } } })}`;
  };
  // https://gist.github.com/jonlabelle/5375315
  function lowerCase(str) {
    return str.toLowerCase();
  }
  function upperCase(str) {
    return str.toUpperCase();
  }
  function unCamelCase(str) {
    str = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
    str = str.toLowerCase(); //add space between camelCase text
    return str;
  }
  function properCase(str) {
    return lowerCase(str).replace(/^\w|\s\w/g, upperCase);
  }
  const camelBreak = (str) => properCase(unCamelCase(str));
  const stats = [
    'initialHp',
    'hpIncreaseAmount',
    'initialAttack',
    'attackRange',
    'attackDelay',
    'movingSpeed',
    'productionSpeed',
    'summonEnergy',
    'criticalProbability'
  ].map(x => {
    return lister(camelBreak(x), x);
  }).join('\n');
  //console.log(JSON.stringify(fow[0], null, '\t'));
  console.log(Object.keys(topByProp('initialAttack', 3, true)[0]).join(', '));
  return `
<pre>

Most Used Rangers
-----------------------------------------
${columnify(data, options)}

${stats}

</pre>
`;
}

function getAllTeamMembers(pvp){
  const all = pvp.playerInfo.reduce((all, item) => {
    if (!item.playerUnitPvPTeams && !item.playerUnitTeams) {
      return all;
    }
    const team1 = item.playerUnitPvPTeams['1'] || [];
    team1.forEach((i) => {
      all.push(i);
    });
    const team2 = item.playerUnitPvPTeams['1'] || [];
    team2.forEach((i) => {
      all.push(i);
    });
    return all;
  }, []);
  return all;
}

function topRangers(pvp, translateWords) {

  var allTeamMembers = getAllTeamMembers(pvp);

  var membersByRanger = allTeamMembers.reduce((all, i) => {
    if (!all[i.unitCode]) {
      all[i.unitCode] = [];
    }
    all[i.unitCode].push(i);
    return all;
  }, {});

  var rangersWithCount = Object.keys(membersByRanger)
    .sort(function (a, b) {
      return membersByRanger[b].length - membersByRanger[a].length;
    })
    .map(x => {
      var obj = {};
      //console.log(translateWords['en-UNIT'][x + '_nm'])
      //console.log(Object.keys(translateWords));
      obj.name = translateWords['en-UNIT'][x + '_nm'];

      var levels = membersByRanger[x].map(y => y.unitLevel);
      var average = levels.reduce((all, i) => all + i) / levels.length;

      //obj.levels = levels;
      obj.average = average.toFixed(2);
      obj.count = levels.length
      return obj;
    });

  //console.log(rangersWithCount.length);
  return { rangers: rangersWithCount };
}

const uniqueWithCapture = (collection, uniquePropName, words) => {
  const results = collection.reduce((all, one) => {
    const propValue = safeAccess(() => one[uniquePropName]);
    if(!propValue){
      console.trace('propValue should not be null');
      // logNice(one);
      return all;
    }
    //console.log(propValue);
    if(!all[propValue]){
      all[propValue] = [];
    }
    all[propValue].push(one);
    return all;
  }, {});
  //console.log(Object.keys(results));

  const topUser = (gearUses) => {
    const uses = gearUses
      .reduce((all, one) => {
        const name = words['en-UNIT'][one.unitCode + '_nm'];
        if(!all[name]){
          all[name] = 0;
        }
        all[name]++;
        return all;
      }, {});
    const topUser = Object.entries(uses)
      .sort((a, b) => b[1] - a[1]);
    //return `${topUser[0][0]} - ${topUser[0][1]}`;
    //return [ topUser[0], topUser[1], topUser[2] ];
    return topUser; //.slice(0,5);
  };

  const interim = Object.entries(results)
    .map(x => {
      const key = x[0];
      const value = x[1];
      const output = {
        [uniquePropName]: key,
        length: value.length,
        top: topUser(value)
      };
      return output;
    })
    .sort((a,b) => b.length - a.length);

  // NOTE: called interim because would prefer to flatten props
  return interim;
}

function uniqueGear(gearOfType, words){
  const uniqueGearOfType = [
    gearOfType[0],
    uniqueWithCapture(gearOfType[1], 'itemCode', words),
  ];
  return uniqueGearOfType;
}

function translateAllGearName(gearOfType, translateWords){
  const translateGearName = (gear, words) => {
    const translated = (item) => ({
      ...item,
      ...{
        name: (words['en-EQUIP'][item.itemCode + '_nm'] || '')
          .replace(']', '] ')
          .replace('\\n', ' ')
          .replace(/[ ]{2,}/g, ' ')
          .replace(' \'', '\'')
          .replace('- ', '')
      }
    });
    return gear.map(translated);
    //return gear.map(translated).map(({ length, top, name}) => ({ length, top, name}));
  };
  const transGearOfType = [
    gearOfType[0],
    translateGearName(gearOfType[1], translateWords),
  ];
  return transGearOfType;
}

function topGear(pvp, translateWords){
  var allTeamMembers = getAllTeamMembers(pvp);

  var allGear = allTeamMembers
    .map(x => {
      const unitCode = x.unitCode;
      var equipMap = clone(x.equipMap);
      if( !equipMap ){
        return undefined;
      }
      if(equipMap.WEAPON) {
        equipMap.WEAPON.unitCode = unitCode;
      }
      if(equipMap.ACC){
        equipMap.ACC.unitCode = unitCode;
      }
      if(equipMap.ARMOR){
        equipMap.ARMOR.unitCode = unitCode;
      }
      return equipMap;
    })
    .filter(x => !!x);
  //console.log(allTeamMembers[0]);

  var allWeapon = allGear.map(x => x.WEAPON)
    .filter(x => !!x);
  var allAcc = allGear.map(x => x.ACC)
    .filter(x => !!x);
  var allArmor = allGear.map(x => x.ARMOR)
    .filter(x => !!x);

  const unique = propsMap({allWeapon, allAcc, allArmor}, (x) => uniqueGear(x, translateWords));
  const uniqueTranslated = propsMap(unique, (x) => translateAllGearName(x, translateWords));
  //console.log(unique);

  //console.log(uniqueTranslated.allAcc[0]);

  return uniqueTranslated;
}

const flattenGearType = (gearType) => {
  return gearType.reduce((all, one) => {
    one.top.forEach(t => {
      all.push({
        name: one.name,
        ranger: t[0],
        count: t[1]
      })
    });
    return all;
  }, []);
};

const addGearToRangers = (rangers, gear) => {

  const weaponsFlat = flattenGearType(gear.allWeapon);
  const accFlat = flattenGearType(gear.allAcc);
  const armorFlat = flattenGearType(gear.allArmor);
  //console.log(armorFlat[0]);
  rangers.forEach(r => {
    r.topWeapons = weaponsFlat
      .filter(x => x.ranger === r.name)
      .map(({ name, count }) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    r.topAcc = accFlat
      .filter(x => x.ranger === r.name)
      .map(({ name, count }) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    r.topArmor = armorFlat
      .filter(x => x.ranger === r.name)
      .map(({ name, count }) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });
  return rangers;
}

function rangersOfInterest(rangers){
  const interested = [
    'Gold Champagne Cony',
    'Edward Elric',
    'Starlit Sea Pico',
    'Ace Soldier Moon',
    'Shish Kebab Brown',
    'Super Hero Moon',
    'Mermaid Cony',
    'Paladin Moon',
    'Goddess Jessica',
    'Judo Team Captain Rachel'
  ].map(x => x.toLowerCase());

  return rangers
    .filter(r => interested.includes(
      r.name.toLowerCase()
    ));
}

function mostUsed({
  pvp, rangers, translateWords, dataOnly, full
}) {
  let { rangers: _rangers } = topRangers(pvp, translateWords);
  const gear = topGear(pvp, translateWords);

  _rangers = addGearToRangers(_rangers, gear);

  if (dataOnly && !full) {
    return _rangers;
  }

  if (dataOnly && full) {
    quickSave(rangersOfInterest(_rangers), './.rangersWithGear.json');
    return {
      rangers: _rangers,
      gear: {
        weapons: gear.allWeapon,
        acc: gear.allAcc,
        armor: gear.allArmor
      }
    }
  }

  return formattedResults(rangers, translateWords, _rangers);
}

const getMostUsed = (callback, { dataOnly, full } = {}) => {
  fetch((err, {
    pvp, rangers, translateWords
  } = {}) => {
    callback(err, mostUsed({
      pvp, rangers, translateWords, dataOnly, full
    })
    )
  });
};

module.exports = getMostUsed;

if (!module.parent) {
  const dataOnly = true;
  const full = true;
  getMostUsed(
    (err, data) => {
      // console.log(
      //   dataOnly
      //     ? JSON.stringify({ err, data }, null, '\t')
      //     : err || data
      // );
    },
    { dataOnly, full }
  );
}

