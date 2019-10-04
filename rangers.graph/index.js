const rangersGraph = {
    rangers: [
        'rangers',
        'performance'
    ],
    gear: [
        'performance',
        'gear'
    ],
    performance: [
        'pvp',
        'specialStage',
        'eventStage',
        'infiniTower',
        'world',
        'mission'
    ],
    gacha: [
        'rangers',
        'gear'
    ],
    friendPoints: [
        'gacha'
    ],
    feathers: [
        'performance'
    ],
    eventTickets: ['eventStage'],
    gold: ['rangers', 'gear', 'lab'],
    rubies: ['gacha', 'feathers', 'performance'],
    materials: [
        'gold', 'rangers', 'lab'
    ],
    gems: ['leonards'],
    leonards: ['rangers'],
    pvp: ['rubies', 'gems'],
    advent: ['rangers', 'materials', 'gold'],
    specialStage: ['rangers', 'materials', 'gold', 'leonards', 'eventTickets'],
    eventStage: ['rangers', 'gold', 'gear'],
    infiniTower: ['leonards', 'gold'],
    world: ['rangers', 'gold', 'eventTickets'],
    mission: ['feathers'],
    lab: ['materials', 'rangers', 'leonards', 'gems', 'feathers']

};

const groups = [
    {
        data: {'id': 'resources'},
        classes: 'group'
    },
    {
        data: {'id': 'stages'},
        classes: 'group'
    }
];

const resourceList = [
    'rangers',
    'feathers',
    'gear',
    'gold',
    'gems',
    'leonards',
    'rubies',
    'materials',
    'lab',
    'gacha',
    'performance',
    'friendPoints',
    'eventTickets'
];

// https://stackoverflow.com/questions/29466257/edges-reflecting-weight-in-cytoscape
const graphToCyto = (graph) => {
    const elements = groups;
    Object.keys(graph).forEach(source => {
        //nodes
        elements.push({
            data: {
                id: source,
                width: 1,
                weight: graph[source].length,
                parent: resourceList.includes(source)
                    ? 'resources'
                    : 'stages'
            },
        });
        //edges
        graph[source].forEach(target => {
            elements.push({
                data: {
                    id: `${source}-${target}`,
                    source, target
                },
                classes: resourceList.includes(target)
                    ? 'gain'
                    : 'loss'
            });
        });
    });
    return elements;
};

const graphStyle = [ // the stylesheet for the graph
    {
        selector: 'node',
        style: {
            'background-color': 'mapData(weight, 1, 10, green, blue)',
            content: 'data(id)',
            //label: 'data(id)',
            color: '#ccc',
            width: 'label',
            height: 'label',
            shape: 'round-rectangle',
            padding: 5,
            // 'border-width': 5,
            // 'border-color': '#ccc',
            'text-valign': 'center'
        }
    }, {
        selector: 'edge',
        style: {
            'width': 1,
            'curve-style': 'bezier',
            'line-color': 'white',
            'target-arrow-color': 'white',
            'target-arrow-shape': 'triangle'
        }
    },
    {
        selector: '.group',
        style: {
            'background-opacity': 0,
            'border-opacity': 0,
            label: ''
        }
    },
    {
        selector: '.gain',
        style: {
            'line-color': 'green',
            'target-arrow-color': 'green',
        }
    },
    {
        selector: '.loss',
        style: {
            'line-color': 'red',
            'target-arrow-color': 'red',
        }
    },
    // {
    //     selector: '[weight>=4]',
    //     style: {
    //         'background-color': 'red',
    //     }
    // }
];

const elements = graphToCyto(rangersGraph);
console.log({ elements });
var cy = cytoscape({
    container: document.getElementById('cy'),
    elements,
    style: graphStyle,

    layout: {
        name: 'circle',
    },

    // layout: {
    //     name: 'preset',
    // },

    // layout: {
    //     name: 'cose',
    //     idealEdgeLength: 100,
    //     nodeOverlap: 20,
    //     refresh: 20,
    //     fit: true,
    //     padding: 30,
    //     randomize: false,
    //     componentSpacing: 100,
    //     nodeRepulsion: 400000,
    //     edgeElasticity: 100,
    //     nestingFactor: 5,
    //     gravity: 80,
    //     numIter: 1000,
    //     initialTemp: 200,
    //     coolingFactor: 0.95,
    //     minTemp: 1.0
    // },

    // layout: {
    //     name: 'cola'
    // }
});
