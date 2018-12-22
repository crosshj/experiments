/*

! [GR]*️MiMi
aHR0cHM6Ly9wcm9maWxlLmxpbmUtc2Nkbi5uZXQvMGg1cWR5aERabmFsNVpBRUFvRkFVVkNXVkZaRE11TG13V0lXVjNQUzVRWTI0a015MEtaREl0T244R01qcHhZQ1VMTVdGMVBYVlROVDE5L2xhcmdl

*/




const {
    readPvp, pullAndSave, killCache
} = require('../persist_stats');

const express = require('express');
const app = express();
const port = 3000;

function rangerVisible(ranger){
    //console.log({ name: ranger[0] })
    const lowerEvos = [
        "Pink Champagne Cony",
        "Maya",
        "Sit Back & Sea Pico",
        "Bow Choco",
        "Gladiator Moon"
    ];
    const neverOver = (amount, data) => !data.find(x => Number(x.y) >= amount);
    return !(
        lowerEvos.includes(ranger[0]) ||
        neverOver(20, ranger[1])
    );
}

function isAvailable(ranger){
    const notAvailable = [
        "Perfect Edgeworth",
        "Eternal Wanderer Ryu",
        "Blue Jade Chun-Li",
        "Righteous Phoenix",
        "Mysterious Godot",
        "Spirit Medium Maya",
        "Fashionista Choco"
    ];
    return !notAvailable.includes(ranger[0]);
}

function rangerToChart(ranger){
    const chartRanger = {
        type: "line",
        name: ranger[0],
        markerSize: 3,
        axisYType: "secondary",
        xValueFormatString: "YYYY-MM-DD HH:mm",
        //yValueFormatString: "#,##0",
        showInLegend: true,
        visible: rangerVisible(ranger),
        dataPoints: ranger[1]
    };
    if(!isAvailable(ranger)){
        chartRanger.lineColor = '#555';
        chartRanger.color = '#555';
    }
    return chartRanger;
}

function recordToRangers(data = []){
    // console.log(data);
    const dates = data.map(x => x.createdDate);
    const rangers = Object.entries(data
        .reduce((all, one) => [
            ...all,
            ...one.top.map(x =>
                    ({...x, date: one.createdDate })
                )
            ], [])
        .reduce((all, one) => {
            if(!all[one.name.trim()]){
                all[one.name.trim()] = [];
            }
            all[one.name.trim()].push({
                y: one.count,
                x: one.date
            })
            return all;
        }, {}));

        return rangers.map(rangerToChart);
}

app.get('/data', (req, res) => {
    readPvp((err, d) => {
        const r = recordToRangers(d);
        res.json({ err, d, r });
        //res.json({ err, data })
    });
});

var inprogress = false;
app.post('/pull', (req, res) => {
    if(inprogress){
        res.json({ err: 'pull already in progress'});
        return;
    }
    inprogress = true;
    //TODO: should not kill cache if within will-not-write window
    //TODO: should (conditionally) kill cache in persist stats module
    //SEE: writePvp for willWrite logic
    killCache();
    // res.json({});

    pullAndSave((err, d) => {
        // if(err){
        //     return res.json({ err, d });
        // }
        const r = recordToRangers(d);
        inprogress = false;

        if(err){
            res.status(400);
        }
        res.json({ err, d, r });
    })
});

app.get('/*', function(req, res){
    var path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: __dirname + '/../client'});
});

app.listen(port, () => console.log(`Stats server at http://localhost:${port}!`))