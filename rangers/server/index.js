const { readPvp } = require('../persist_stats');

const express = require('express');
const app = express();
const port = 3000;

const data = [{
    type: "line",
    name: "Sweden",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        {
            x: new Date(2000, 00), y: 47.5
        },
        { x: new Date(2005, 00), y: 84.8 },
        { x: new Date(2009, 00), y: 91 },
        { x: new Date(2010, 00), y: 90 },
        { x: new Date(2011, 00), y: 92.8 },
        { x: new Date(2012, 00), y: 93.2 },
        { x: new Date(2013, 00), y: 94.8 },
        { x: new Date(2014, 00), y: 92.5 }
    ]
},
{
    type: "line",
    name: "UK",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        { x: new Date(2000, 00), y: 26.8 },
        { x: new Date(2005, 00), y: 70 },
        { x: new Date(2009, 00), y: 83.6 },
        { x: new Date(2010, 00), y: 85 },
        { x: new Date(2011, 00), y: 85.4 },
        { x: new Date(2012, 00), y: 87.5 },
        { x: new Date(2013, 00), y: 89.8 },
        { x: new Date(2014, 00), y: 91.6 }
    ]
},
{
    type: "line",
    name: "UAE",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        { x: new Date(2000, 00), y: 23.6 },
        { x: new Date(2005, 00), y: 40 },
        { x: new Date(2009, 00), y: 64 },
        { x: new Date(2010, 00), y: 68 },
        { x: new Date(2011, 00), y: 78 },
        { x: new Date(2012, 00), y: 85 },
        { x: new Date(2013, 00), y: 86 },
        { x: new Date(2014, 00), y: 90.4 }
    ]
},
{
    type: "line",
    showInLegend: true,
    name: "USA",
    markerSize: 3,
    axisYType: "secondary",
    yValueFormatString: "#,##0.0\"%\"",
    xValueFormatString: "YYYY",
    dataPoints: [
        // { x: new Date(2000, 00), y: 43.1 },
        { x: new Date(2005, 00), y: 68 },
        { x: new Date(2009, 00), y: 71 },
        { x: new Date(2010, 00), y: 71.7 },
        { x: new Date(2011, 00), y: 69.7 },
        { x: new Date(2012, 00), y: 79.3 },
        { x: new Date(2013, 00), y: 84.2 },
        { x: new Date(2014, 00), y: 87 }
    ]
},
{
    type: "line",
    name: "Switzerland",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        { x: new Date(2000, 00), y: 47.1 },
        { x: new Date(2005, 00), y: 70.1 },
        { x: new Date(2009, 00), y: 81.3 },
        { x: new Date(2010, 00), y: 83.9 },
        { x: new Date(2011, 00), y: 85.2 },
        { x: new Date(2012, 00), y: 85.2 },
        { x: new Date(2013, 00), y: 86.7 },
        { x: new Date(2014, 00), y: 87 }
    ]
},
{
    type: "line",
    name: "Honk Kong",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        { x: new Date(2000, 00), y: 27.8 },
        { x: new Date(2005, 00), y: 56.9 },
        { x: new Date(2009, 00), y: 69.4 },
        { x: new Date(2010, 00), y: 72 },
        { x: new Date(2011, 00), y: 72.2 },
        { x: new Date(2012, 00), y: 72.9 },
        { x: new Date(2013, 00), y: 74.2 },
        { x: new Date(2014, 00), y: 74.6 }
    ]
},
{
    type: "line",
    name: "Russia",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        { x: new Date(2000, 00), y: 2 },
        { x: new Date(2005, 00), y: 15.2 },
        { x: new Date(2009, 00), y: 29 },
        { x: new Date(2010, 00), y: 43 },
        { x: new Date(2011, 00), y: 49 },
        { x: new Date(2012, 00), y: 63.8 },
        { x: new Date(2013, 00), y: 61.4 },
        { x: new Date(2014, 00), y: 70.5 }
    ]
},
{
    type: "line",
    name: "Ukraine",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        { x: new Date(2000, 00), y: .7 },
        { x: new Date(2005, 00), y: 3.7 },
        { x: new Date(2009, 00), y: 17.9 },
        { x: new Date(2010, 00), y: 23.3 },
        { x: new Date(2011, 00), y: 28.7 },
        { x: new Date(2012, 00), y: 35.3 },
        { x: new Date(2013, 00), y: 41.8 },
        { x: new Date(2014, 00), y: 43.4 }
    ]
},
{
    type: "line",
    name: "India",
    markerSize: 3,
    axisYType: "secondary",
    xValueFormatString: "YYYY",
    yValueFormatString: "#,##0.0\"%\"",
    showInLegend: true,
    dataPoints: [
        { x: new Date(2000, 00), y: .5 },
        { x: new Date(2005, 00), y: 2.4 },
        { x: new Date(2009, 00), y: 5.1 },
        { x: new Date(2010, 00), y: 7.5 },
        { x: new Date(2011, 00), y: 10.1 },
        { x: new Date(2012, 00), y: 12.6 },
        { x: new Date(2013, 00), y: 15.1 },
        { x: new Date(2014, 00), y: 18 }
    ]
}];

function rangerToChart(ranger){
    const chartRanger = {
        type: "line",
        name: ranger[0],
        markerSize: 3,
        axisYType: "secondary",
        //xValueFormatString: "YYYY",
        //yValueFormatString: "#,##0",
        showInLegend: true,
        dataPoints: ranger[1]
    };
    return chartRanger;
}

function recordToRangers(data){
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
        res.json({ data, d, r });
        //res.json({ err, data })
    });
})

app.get('/*', function(req, res){
    var path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: __dirname + '/../client'});
});

app.listen(port, () => console.log(`Stats server on port ${port}!`))