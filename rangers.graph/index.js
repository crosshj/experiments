const rangersGraph = {
    rangers: [
        'pvp',
        'specialStage',
        'eventStage',
        'infiniTower',
        'world',
        'mission',
        'gold',
        'rangers'
    ],
    feathers: [
        'pvp',
        'specialStage',
        'eventStage',
        'infiniTower',
        'world',
        'mission'
    ],
    gear: [
        'pvp',
        'specialStage',
        'eventStage',
        'infiniTower',
        'world',
        'mission',
        'gold',
        'gear'
    ],
    gold: ['rangers', 'gear'],
    rubies: ['rangers', 'feathers'],
    materials: [
        'gold', 'rangers', 'gems'
    ],
    gems: ['leonards'],
    leonards: ['rangers'],
    pvp: ['rubies', 'gems'],
    specialStage: [],
    eventStage: ['rangers'],
    infiniTower: ['leonards', 'gold'],
    world: ['rangers', 'gold'],
    mission: ['feathers'],
    lab: ['materials', 'rangers', 'leonards', 'gems']

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
    'materials'
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
                }
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
            'line-color': '#ccc',
            'target-arrow-color': 'red',
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
    // {
    //     selector: '[weight>=4]',
    //     style: {
    //         'background-color': 'red',
    //     }
    // }
];

const elements = graphToCyto(rangersGraph);
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
