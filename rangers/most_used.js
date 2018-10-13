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
  var columns = columnify(data, options)

  //console.log('this');

  return `
<pre>
Most Used Rangers
-----------------------------------------
${columns}
</pre>
`;
  //console.log(JSON.stringify(fow[0], null, '\t'));
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
