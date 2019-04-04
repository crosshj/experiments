const simple = {
    boxes:  [{
        label: 'omphale',
        x: 50,
        y: 10,
        height: 40,
        color: '#487974',
        nodes: [null, null, null, null, null, {
                label: 'fifth'
            }]
    }, {
        label: 'जो है सो है',
        x: 170,
        y: 10,
        width: 100,
        height: 40,
        color: '#ACBF60',
        nodes: [null, {
            label: 'second'
        }],
        handle: `
            ack()
        `
    }],
    wires: [{
        start: (units) => units.getNode('omphale', 'fifth'),
        end: (units) => units.getNode('जो है सो है', 'second'),
        selected: true
    }]
};


var boxes = simple.boxes || [{
    label: 'shadrach',
    x: 10,
    y: 10,
    width: 100,
    height: 80,
    color: '#487974',
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
    }],
    handle: `
        ack()
    `
}, {
    label: 'abednego',
    x: 220,
    y: 10,
    color: '#E6BC5C',
    nodes: [{
        label: 'first'
    }, null, null, {
        label: 'second'
    }, null],
    start: `
        send(null, *)
    `,
    handle: `
        ack()
        send(null, *)
    `
}, {
    label: 'romulus',
    x: 127,
    y: 100,
    color: '#978311',
    nodes: [null, {
        label: 'first'
    }, null, {
            label: 'second'
        }, {
            label: 'third'
        }, null, null, {
            label: 'fourth'
        }, null
    ],
    handle: `
        ack()
        send(null, *)
    `
}, {
    label: 'remus',
    x: 220,
    y: 100,
    color: '#754780',
    nodes: [null, null, {
        label: 'first'
    }, {
            label: 'second'
        }, null, null, null, {
            label: 'fourth'
        }, null]
}, {
    label: 'morozko',
    x: 10,
    y: 140,
    height: 65,
    color: '#215d7d',
    nodes: [
        { label: 'first' },
        { label: 'second' },
        { label: 'third' },
        { label: 'fourth' },
        { label: 'fifth' },
        { label: 'sixth' },
        { label: 'seventh' },
        { label: 'eighth' }
    ]
}, {
    label: 'masamune',
    x: 10,
    y: 100,
    height: 25,
    width: 100,
    color: '#604063',
    nodes: [null, null, null, {
        label: 'first'
    }, null, {
            label: 'second'
        }, null, {
            label: 'third'
        }]
}];
boxes.forEach(b => b.x += 70);

var wires = simple.wires || [{
    start: (units) => units.getNode('shadrach', 'second'),
    end: (units) => units.getNode('meshach', 'first'),
    selected: true
}, {
    start: (units) => units.getNode('meshach', 'fourth'),
    end: (units) => units.getNode('abednego', 'first')
}, {
    start: (units) => units.getNode('abednego', 'second'),
    end: (units) => units.getNode('romulus', 'fourth')
}, {
    start: (units) => units.getNode('abednego', 'second'),
    end: (units) => units.getNode('remus', 'fourth')
}, {
    start: (units) => units.getNode('romulus', 'third'),
    end: (units) => units.getNode('remus', 'first')
}, {
    start: (units) => units.getNode('romulus', 'second'),
    end: (units) => units.getNode('morozko', 'sixth')
}, {
    start: (units) => units.getNode('remus', 'second'),
    end: (units) => units.getNode('morozko', 'seventh')
}, {
    start: (units) => units.getNode('romulus', 'first'),
    end: (units) => units.getNode('masamune', 'second')
}];
