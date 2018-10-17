var columnify = require('columnify')
var fetch = require('./data');

function mostUsed({
  pvp, rangers, translateWords
}) {
  var foo = pvp.playerInfo.reduce((all, item) => {
    if (!item.playerUnitPvPTeams && !item.playerUnitTeams){
      return all;
    }
    const team1 =
      item.playerUnitPvPTeams['1'] ||
      item.playerUnitTeams['1'] ||
      [];
    team1.forEach((i) => {
      all.push(i);
    });

    const team2 = item.playerUnitPvPTeams['1'] ||
      item.playerUnitTeams['2'] ||
      [];
    team2.forEach((i) => {
      all.push(i);
    });

    return all;

  }, []);

  var fee = foo.reduce((all, i) => {
    if (!all[i.unitCode]) {
      all[i.unitCode] = [];
    }
    all[i.unitCode].push(i);

    return all;
  }, {});

  var fow = Object.keys(fee).sort(function (a, b) {
    return fee[b].length - fee[a].length;
  }).map(x => {
    var obj = {};
    //console.log(translateWords['en-UNIT'][x + '_nm'])
    obj.name = translateWords['en-UNIT'][x + '_nm'];
    obj.levels = fee[x];
    return obj;
  });

  var data = [];
  var options = { minWidth: 10 };
  fow
    //.filter((x, i) => i < 30)
    .forEach(x => {
      var levels = x.levels.map(y => y.unitLevel);
      var average = levels.reduce((all, i) => all + i) / levels.length

      data.push({ name: x.name, average: average.toFixed(2), count: levels.length })
      //console.log(x.name, ' :\t\t', average.toFixed(2))
    });


  var safeRangers = rangers.filter(x =>
    x.unitCode[0] === 'u' &&
    x.unitCategoryType !== 'INT' &&
    translateWords['en-UNIT'][x.unitNameCode] &&
    x.created
  );

  function topByProp(p, number, full) {
    var sortDesc = (prop) => safeRangers.sort((a,b) => b[prop] - a[prop]);
    var initHPsorted = sortDesc(p);
    var initialHpTop = [];
    (new Array(number)).fill().forEach((a, i) => {
      var x = initHPsorted[i];
      var min = {
        name: translateWords['en-UNIT'][x.unitNameCode],
        [p]: x[p]
      };
      initialHpTop.push(!full
        ? min
        : Object.assign({}, x, min)
      );
    });
    return initialHpTop;
  }

  //console.log(JSON.stringify(fow[0], null, '\t'));
  console.log(Object.keys(topByProp('initialAttack', 3, true)[0]).join(', '));

  const lister = (long, prop) => {
    return `
Top Rangers by ${long}
-----------------------------------------
${columnify(topByProp(prop, 30),
  {config: {[prop]: {align: 'right'}}}
)}`;
  };

  return `
<pre>

Most Used Rangers
-----------------------------------------
${columnify(data, options)}

${lister('Initial HP', 'initialHp')}

${lister('HP increase Amount', 'hpIncreaseAmount')}

${lister('Initial Attack', 'initialAttack')}

${lister('Attack Range', 'attackRange')}

${lister('Attack Delay', 'attackDelay')}

${lister('Moving Speed', 'movingSpeed')}

${lister('Production Speed', 'productionSpeed')}

${lister('Summon Energy', 'summonEnergy')}

${lister('Critical Probability', 'criticalProbability')}

</pre>
`;
}

const getMostUsed = (callback) => {
  fetch((err, {
    pvp, rangers, translateWords
  } = {}) => {
    callback( err, mostUsed({
        pvp, rangers, translateWords
      })
    )
  });
};

module.exports = getMostUsed;

if (!module.parent) {
    getMostUsed((err, data) => console.log(err || data));
}
