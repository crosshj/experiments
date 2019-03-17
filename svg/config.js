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
    x: 127,
    y: 10,
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
    x: 220,
    y: 10,
    color: '#E6BC5C',
    nodes: [{
        label: 'first'
    }, null, null, {
        label: 'second'
    }, null]
}, {
    label: 'yin',
    x: 180,
    y: 100,
    color: '#9e9e9e',
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
    x: 270,
    y: 100,
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
    x: 270,
    y: 200,
    color: '#FC5A8D',
    nodes: [null, {
        label: 'first'
    }, null, null, null, null, null, {
            label: 'third'
        }]
}, {
    label: 'masamune',
    x: 10,
    y: 120,
    height: 25,
    width: 100,
    color: '#732E6C',
    nodes: [null, null, null, {
        label: 'first'
    }, null, {
            label: 'second'
        }, null, {
            label: 'third'
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
    end: (units) => units.getNode('masamune', 'third')
}, {
    start: (units) => units.getNode('masamune', 'first'),
    end: (units) => units.getNode('yin', 'first')
}];
