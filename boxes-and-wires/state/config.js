function base64Encode( stringInput ) {
    // READ MORE: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    var normalizedInput = encodeURIComponent( stringInput )
        .replace(
            /%([0-9A-F]{2})/g,
            function toSolidBytes( $0, hex ) {
                return( String.fromCharCode( "0x" + hex ) );
            }
        );
    return btoa( normalizedInput );
}

const dataURIPayload = {
    value: Math.floor(Math.random()*100) + '-' + Math.random().toString(36).substring(2, 15)
};

const apis = {
    ghibli: 'https://ghibliapi.herokuapp.com/films/?limit=1',
    bored: 'http://www.boredapi.com/api/activity/',
    countRegister: 'https://api.countapi.xyz/hit/boxesandwires/visits',
    countGet: 'https://api.countapi.xyz/get/boxesandwires/visits',
    dataURI: 'data:application/json;charset=utf-8;base64,' + base64Encode(JSON.stringify(dataURIPayload))
};
const api = 'countRegister';
const exampleExpression = false && `
    fetch(${api}Url)
    map(${api}Map, ${api}Url, "${api}Map")
    send(${api}MapValue, 2)
    send(${api}MapValue, 1)
`;

//TODO: ^^^ this will go away when engine is fully working

const simple = {
    boxes:  [{
        label: 'ομφαλός',
        info: 'omphalos - navel',
        class: 'greek',
        x: 30,
        y: 60,
        width: 110,
        height: 40,
        // NOTE: leads to bad situations
        // start: `
        //     fetch("${apis.dataURI}")
        //     send(fetch.0.value, ('unit:जो है वही है'))
        //     send(fetch.0.value, ('unit:גליטש'))
        // `,
        start: `
            fetch("${apis.dataURI}")
            send(fetch.0.value, ('unit:जो है वही है'))
        `,
        handle: exampleExpression || `
            ack()
            send(ack.0.message, ('unit:जो है वही है'))
        `,
        nodes: [null, null, null, null, { label: 'fourth'}, null, {
                label: 'sixth'
            }]
    }, {
        label: 'जो है वही है',
        info: 'jo hai vahee hai - it is what it is',
        class: 'hindi',
        x: 205,
        y: 110,
        width: 100,
        height: 40,
        nodes: [null, {
            label: 'second'
        },,,,,,{ label: 'seventh'}],
        handle: `
            ack()
            send(ack.0.message, ('unit:גליטש'))
        `
    }, {
        label: 'גליטש',
        info: 'glitch',
        class: 'yiddish',
        x: 205,
        y: 10,
        width: 100,
        height: 40,
        nodes: [,{
            label: 'second'
        },,{ label: 'fourth'}],
        handle: `
            ack()
            send(ack.0.message, ('unit:ομφαλός'))
        `
    }],
    wires: [{
        start: (units) => units.getNode('ομφαλός', 'sixth'),
        end: (units) => units.getNode('जो है वही है', 'second')
    }, {
        start: (units) => units.getNode('जो है वही है', 'seventh'),
        end: (units) => units.getNode('גליטש', 'fourth'),
    }, {
        start: (units) => units.getNode('גליטש', 'second'),
        end: (units) => units.getNode('ομφαλός', 'fourth')
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
