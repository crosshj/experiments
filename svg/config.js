var boxes = [{
    label: 'shadrach',
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    color: '#50BFE6',
    nodes: [null, null, {
        label: 'first'
    }, null, null, null, null, {
            label: 'second'
        }]
}, {
    label: 'meshach',
    x: 140,
    y: 125,
    color: '#ACBF60',
    nodes: [{
        label: 'first'
    }, null, {
        label: 'second'
    }, {
        label: 'third'
    }, null, {
        label: 'fourth'
    }]
}, {
    label: 'abednego',
    x: 300,
    y: 50,
    color: '#E6BC5C',
    nodes: [{
        label: 'first'
    }, null, null, {
        label: 'second'
    }, null]
}, {
    label: 'yin',
    x: 250,
    y: 230,
    color: '#253529',
    nodes: [null, {
        label: 'first'
    }, null, {
            label: 'second'
        }, {
            label: 'third'
        }, null, null, {
            label: 'fourth'
        }, null]
}, {
    label: 'yang',
    x: 350,
    y: 230,
    color: '#FEBAAD',
    nodes: [null, null, {
        label: 'first'
    }, {
            label: 'second'
        }, null, null, null, {
            label: 'fourth'
        }, null]
}, {
    label: 'santa',
    x: 300,
    y: 400,
    color: '#FC5A8D',
    nodes: [null, {
        label: 'first'
    }, null, null, null, null, null, {
            label: 'third'
        }]
}, {
    label: 'masamune',
    x: 73,
    y: 330,
    height: 25,
    width: 100,
    color: '#732E6C',
    nodes: [null, null, null, {
        label: 'third'
    }, null, {
            label: 'first'
        }, null, {
            label: 'second'
        }]
}];

var wires = [{
    start: (units) => units.getNode('shadrach', 'second'),
    end: (units) => units.getNode('meshach', 'first')
}, {
    start: (units) => units.getNode('shadrach', 'first'),
    end: (units) => units.getNode('meshach', 'second'),
}, {
    start: (units) => units.getNode('meshach', 'fourth'),
    end: (units) => units.getNode('abednego', 'first')
}, {
    start: (units) => units.getNode('abednego', 'second'),
    end: (units) => units.getNode('yin', 'fourth')
}, {
    start: (units) => units.getNode('abednego', 'second'),
    end: (units) => units.getNode('yang', 'fourth')
}, {
    start: (units) => units.getNode('yin', 'third'),
    end: (units) => units.getNode('yang', 'first')
}, {
    start: (units) => units.getNode('yin', 'second'),
    end: (units) => units.getNode('santa', 'third')
}, {
    start: (units) => units.getNode('yang', 'second'),
    end: (units) => units.getNode('santa', 'third')
}, {
    start: (units) => units.getNode('santa', 'first'),
    end: (units) => units.getNode('masamune', 'second')
}, {
    start: (units) => units.getNode('masamune', 'third'),
    end: (units) => units.getNode('yin', 'first')
}];
