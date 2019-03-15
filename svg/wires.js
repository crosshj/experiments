function getNodeDirection(node) {
    const el = node;
    const cx = Number(el.getAttribute('cx'));
    const cy = Number(el.getAttribute('cy'));
    const rect = el.parentNode.querySelector('rect');
    const width = Number(rect.getAttribute('width'));
    const height = Number(rect.getAttribute('height'));

    if (cx >= width) { return 'east'; }
    if (cy + 5 >= height) { return 'south'; }
    if (cx - 15 <= 0) { return 'west'; }
    return 'north';
}

function getLinkDirections(link) {
    const dirs = {
        start: '',
        end: ''
    };
    Object.keys(dirs).forEach(cap => {
        const el = link[cap];
        const direction = el.getAttribute('data-direction');
        if (cap === 'start') {
            dirs.start = direction;
            return;
        }

        dirs.end = direction;
    });
    return dirs;
}

function drawLink(link, units) {
    // const linkStart = link.start(units).parentNode.getAttribute('data-label') + ':' +
    //     link.start.getAttribute('data-label');
    // const linkEnd = link.end(units).parentNode.getAttribute('data-label') + ':' +
    //     link.end.getAttribute('data-label');

    // console.log(
    //   `start: ${linkStart}` + '\n' +
    //   `end: ${linkEnd}`
    // );

    var linkElement = link.element;
    if (!linkElement) {
        linkElement = link.element = createLinkElement({
            start: link.start(units),
            end: link.end(units)
        });
    }
    link.originalPathD = link.originalPathD || linkElement.querySelector('path')
        .getAttribute('d')
        .replace(/\n/g, ' ')
        .replace(/ +(?= )/g, '');
    link.startOriginalOffsetX = link.start(units).parentNode
        .getAttribute('transform').match(/[0-9]+/g)[0];
    link.startOriginalOffsetY = link.start(units).parentNode
        .getAttribute('transform').match(/[0-9]+/g)[1];
    link.endOriginalOffsetX = link.end(units).parentNode
        .getAttribute('transform').match(/[0-9]+/g)[0];
    link.endOriginalOffsetY = link.end(units).parentNode
        .getAttribute('transform').match(/[0-9]+/g)[1];

    link.startOffsetX = Number(link.startOriginalOffsetX);
    link.startOffsetY = Number(link.startOriginalOffsetY)
    link.endOffsetX = Number(link.endOriginalOffsetX);
    link.endOffsetY = Number(link.endOriginalOffsetY);

    const pathD = link.originalPathD;
    const pathObj = pathDToObj(pathD);

    const controlPoints = calculateControls(pathObj);
    pathObj.c1 = controlPoints.c1;
    pathObj.c2 = controlPoints.c2;

    link.originalPathD = objToPathD(pathObj);
    const directions = getLinkDirections({
        start: link.start(units),
        end: link.end(units)
    });
    link.directions = directions;
    const newPathD = objToPathD(pathObj, link.directions);
    link.element.querySelector('path').setAttribute('d', newPathD)
}

//https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/
function overlayColor(color) {
    //if only first half of color is defined, repeat it
    if (color.length < 5) {
        color += color.slice(1);
    }
    return (color.replace('#', '0x')) > (0xffffff / 2) ? '#111' : '#eee';
}

function drawUnit(unit) {
    const width = Number(unit.width || 76);
    const height = unit.height || 76;

    const namespaceURI = document.getElementById('canvas').namespaceURI;
    const unitElement = document.createElementNS(namespaceURI, "g");
    unitElement.setAttribute('data-label', unit.label);
    unitElement.setAttribute('class', 'box draggable-group');
    unitElement.setAttribute('transform', `translate(${unit.x}, ${unit.y})`);
    const style = unit.color ? `fill:${unit.color}` : '';
    const overlayStyle = unit.color ? `fill:${overlayColor(unit.color)}` : '';
    //const rect = `<rect x="10" y="1" width="${width}" height="${height}" rx="5" ry="5"></rect>`;
    const rect = `<rect x="10" y="1" style="${style}" width="${width}" height="${height}" rx="0" ry="0"></rect>`;
    var unitElementHTML = `
${rect}
<text x="${width / 2 - unit.label.length * 2}" y="${height / 2 + 4}" style="${overlayStyle}" class="heavy">${unit.label}</text>
`;
    const nodeRadius = 3;
    const offSet = 10;
    const insetNode = nodeRadius;
    const insetNodeLeft = insetNode + offSet;

    var positions = [{
        x: insetNodeLeft, y: offSet //top-left
    }, {
        x: insetNodeLeft, y: height / 2 //middle-left
    }, {
        x: insetNodeLeft, y: height - offSet //bottom-left
    }, {
        x: offSet + width / 2, y: height - insetNode + 1 //bottom-middle
    }, {
        x: width - insetNode + offSet, y: offSet //top-right
    }, {
        x: width - insetNode + offSet, y: height / 2 //middle-right
    }, {
        x: width - insetNode + offSet, y: height - offSet //bottom-right
    }, {
        x: offSet + width / 2, y: offSet / 2 - 1 //top-middle
    }];

    unit.nodes.forEach(n => {
        if (!n) {
            positions.shift();
            return;
        }
        const pos = positions.shift();
        unitElementHTML += `
    <circle data-label="${n.label}" class="node" cx="${pos.x}" cy="${pos.y}" r="${nodeRadius}"></circle>
`;
    });
    unitElementHTML += '<g class="helpers"></g>'
    unitElement.innerHTML = unitElementHTML;

    const helpers = unitElement.querySelector('.helpers');
    var helpersHTML = '';
    unit.nodes.forEach(n => {
        if (!n) {
            return;
        }
        const el = unitElement.querySelector(`circle[data-label="${n.label}"]`);
        const direction = getNodeDirection(el);
        el.setAttribute('data-direction', getNodeDirection(el));
        const cx = Number(el.getAttribute('cx'));
        const cy = Number(el.getAttribute('cy'));
        const offset = 4;
        const segment = {
            'north': `M ${cx} ${cy} L ${cx} ${cy - offset}`,
            'east': `M ${cx} ${cy} L ${cx + offset} ${cy}`,
            'south': `M ${cx} ${cy} L ${cx} ${cy + offset}`,
            'west': `M ${cx} ${cy} L ${cx - offset} ${cy}`
        };
        helpersHTML += `
    <path class="helper-segment" d="${segment[direction]}"></path>
`;

        //TODO: add a small, white path for overlap
        //console.log({ direction: n.direction })
    });

    helpers.innerHTML = helpersHTML;

    const canvas = document.querySelector('#canvas');
    const linksGroup = document.querySelector('#canvas #links');

    unit.element = unitElement;
    canvas.appendChild(unitElement);
    //canvas.insertBefore(unitElement, linksGroup);
}

function calculateControls(p) {
    const xDifference = p.c3.x - p.m.x;
    const yDifference = p.c3.y - p.m.y;

    const xMult = xDifference < 0
        ? -2
        : 0.5;
    const yMult = 0;

    const yCurve = Math.abs(xDifference) < 20
        ? 150 * (Math.abs(xDifference) / 20)
        : 100;
    const yOffset = xDifference < 0
        ? yDifference < 0 ? -yCurve : yCurve
        : 0

    // const xMult = xDifference < 0
    //   ? - Math.abs(xDifference / 5 )
    //   : 0 //1 - Math.abs(xDifference) / Math.abs(yDifference);
    // const yMult = yDifference < 0
    //   ? - Math.abs(yDifference / 5 )
    //   : 0 //1 - Math.abs(yDifference) / Math.abs(xDifference);

    const controls = {
        c1: {
            x: p.m.x + (xDifference * xMult),
            y: p.m.y + (yDifference * yMult) + yOffset
        },
        c2: {
            x: p.c3.x - (xDifference * xMult),
            y: p.c3.y - (yDifference * yMult) - yOffset
        }
    };


    // console.log({
    //   xDifference, yDifference
    // });

    return controls;
}

function drawControls({ namespaceURI, link, linkElement, pathObj }) {
    if (!link.controlLine1) {
        link.controlLine1 = document.createElementNS(namespaceURI, "line");
        link.controlLine1.classList.add('control');
        linkElement.appendChild(link.controlLine1);
    }
    if (!link.controlLine2) {
        link.controlLine2 = document.createElementNS(namespaceURI, "line");
        link.controlLine2.classList.add('control');
        linkElement.appendChild(link.controlLine2);
    }
    if (!link.controlLine3) {
        link.controlLine3 = document.createElementNS(namespaceURI, "line");
        link.controlLine3.classList.add('control');
        linkElement.appendChild(link.controlLine3);
    }
    const controlCircleRadius = 3;
    if (!link.controlCircle1) {
        link.controlCircle1 = document.createElementNS(namespaceURI, "circle");
        link.controlCircle1.classList.add('control-circle');
        link.controlCircle1.setAttribute('r', controlCircleRadius);
        linkElement.appendChild(link.controlCircle1);
    }
    if (!link.controlCircle2) {
        link.controlCircle2 = document.createElementNS(namespaceURI, "circle");
        link.controlCircle2.classList.add('control-circle');
        link.controlCircle2.setAttribute('r', controlCircleRadius);
        linkElement.appendChild(link.controlCircle2);
    }

    link.controlCircle1.setAttribute('cx', pathObj.c1.x);
    link.controlCircle1.setAttribute('cy', pathObj.c1.y);
    link.controlCircle2.setAttribute('cx', pathObj.c2.x);
    link.controlCircle2.setAttribute('cy', pathObj.c2.y);

    link.controlLine1.setAttribute('x1', pathObj.m.x);
    link.controlLine1.setAttribute('y1', pathObj.m.y);
    link.controlLine1.setAttribute('x2', pathObj.c1.x);
    link.controlLine1.setAttribute('y2', pathObj.c1.y);

    link.controlLine2.classList.add('control');
    link.controlLine2.setAttribute('x1', pathObj.c1.x);
    link.controlLine2.setAttribute('y1', pathObj.c1.y);
    link.controlLine2.setAttribute('x2', pathObj.c2.x);
    link.controlLine2.setAttribute('y2', pathObj.c2.y);

    link.controlLine3.classList.add('control');
    link.controlLine3.setAttribute('x1', pathObj.c2.x);
    link.controlLine3.setAttribute('y1', pathObj.c2.y);
    link.controlLine3.setAttribute('x2', pathObj.c3.x);
    link.controlLine3.setAttribute('y2', pathObj.c3.y);
}

function createLinkElement(link) {
    const namespaceURI = document.getElementById('canvas').namespaceURI;
    const linkElement = document.createElementNS(namespaceURI, "g");
    linkElement.classList.add('link');

    const linkPath = document.createElementNS(namespaceURI, "path");

    const startParentTransform = link.start.parentNode.getAttribute('transform');
    const endParentTransform = link.end.parentNode.getAttribute('transform');
    const startCoords = {
        x: Number(startParentTransform.match(/[0-9]+/g)[0]) + Number(link.start.getAttribute('cx')),
        y: Number(startParentTransform.match(/[0-9]+/g)[1]) + Number(link.start.getAttribute('cy'))
    };
    const endCoords = {
        x: Number(endParentTransform.match(/[0-9]+/g)[0]) + Number(link.end.getAttribute('cx')),
        y: Number(endParentTransform.match(/[0-9]+/g)[1]) + Number(link.end.getAttribute('cy'))
    };
    const pathObj = {
        m: startCoords,
        c3: endCoords
    };
    const controls = calculateControls(pathObj);
    pathObj.c1 = controls.c1;
    pathObj.c2 = controls.c2;
    const originalPathD = objToPathD(pathObj);
    linkPath.setAttribute('d', originalPathD)

    linkElement.appendChild(linkPath);

    drawControls({ namespaceURI, link, linkElement, pathObj });

    const linksGroup = document.querySelector('#canvas #links');
    linksGroup.appendChild(linkElement);

    return linkElement;
}

function pathDToObj(pathD) {
    const matches = pathD
        .split(' ')
        .map(Number)
        .filter(x => !isNaN(x));
    return {
        m: {
            x: matches[0],
            y: matches[1]
        },
        c1: {
            x: matches[2],
            y: matches[3]
        },
        c2: {
            x: matches[4],
            y: matches[5]
        },
        c3: {
            x: matches[6],
            y: matches[7]
        }
    };
}

function objToPathD(o, directions) {
    var start = `M ${o.m.x} ${o.m.y}`;
    var end = `${o.c3.x} ${o.c3.y}`;
    if (!directions) {
        return `${start} C ${o.c1.x} ${o.c1.y} ${o.c2.x} ${o.c2.y} ${end}`;
    }

    const offset = 7;
    const segmentsStart = {
        'north': `L ${o.m.x} ${o.m.y - offset}`,
        'east': `L ${o.m.x + offset} ${o.m.y}`,
        'south': `L ${o.m.x} ${o.m.y + offset}`,
        'west': `L ${o.m.x - offset} ${o.m.y}`
    };
    if (directions.start && segmentsStart[directions.start]) {
        start += ` ${segmentsStart[directions.start]}`;
    }
    const segmentsEnd = {
        'north': `${o.c3.x} ${o.c3.y - offset} L ${o.c3.x} ${o.c3.y}`,
        'east': `${o.c3.x + offset} ${o.c3.y} L ${o.c3.x} ${o.c3.y}`,
        'south': `${o.c3.x} ${o.c3.y + offset} L ${o.c3.x} ${o.c3.y}`,
        'west': `${o.c3.x - offset} ${o.c3.y} L ${o.c3.x} ${o.c3.y}`
    };
    if (directions.end && segmentsEnd[directions.end]) {
        end = segmentsEnd[directions.end];
        //end = `${o.c3.x} ${o.c3.y}`;
    }

    return `${start} L ${end}`;
}

function updateConnectedLinks(links, units, event, x, y) {
    //console.log('updateConnectedLinks');
    const target = event.target.parentNode;
    links.forEach(link => {
        const containsStart = target.classList.contains('box') && target.contains(link.start(units));
        const containsEnd = target.classList.contains('box') && target.contains(link.end(units));
        if (!containsStart && !containsEnd) {
            return;
        }

        const pathD = link.originalPathD;
        const pathObj = pathDToObj(pathD);

        if (containsStart) {
            link.startOffsetX = x;
            link.startOffsetY = y;
        }
        if (containsEnd) {
            link.endOffsetX = x;
            link.endOffsetY = y;
        }

        pathObj.m.x += (link.startOffsetX - link.startOriginalOffsetX);
        pathObj.m.y += (link.startOffsetY - link.startOriginalOffsetY);
        pathObj.c3.x += (link.endOffsetX - link.endOriginalOffsetX);
        pathObj.c3.y += (link.endOffsetY - link.endOriginalOffsetY);

        const controlPoints = calculateControls(pathObj);
        pathObj.c1 = controlPoints.c1;
        pathObj.c2 = controlPoints.c2;

        drawControls({ link, linkElement: link.element, pathObj })

        const newPathD = objToPathD(pathObj, link.directions);
        link.element.querySelector('path').setAttribute('d', newPathD);
        //console.log(newPathString);
    });
}

function getMousePosition(svg, evt) {
    var CTM = svg.getScreenCTM();
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function initialiseDragging(svg, selectedElement, evt) {
    offset = getMousePosition(svg, evt);

    // Make sure the first transform on the element is a translate transform
    var transforms = selectedElement.transform.baseVal;

    if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
        // Create an transform that translates by (0, 0)
        var translate = svg.createSVGTransform();
        translate.setTranslate(0, 0);
        selectedElement.transform.baseVal.insertItemBefore(translate, 0);
    }

    // Get initial translation
    transform = transforms.getItem(0);
    offset.x -= transform.matrix.e;
    offset.y -= transform.matrix.f;
    return { transform, offset };
}

function startDrag(evt) {
    const nodeDrag = {
        test: () => evt.target.classList.contains('node'),
        start: () => {
            console.log('wire drag start');
            evt.stopPropagation();
            evt.preventDefault();
        }
    };
    const groupDrag = {
        test: () => evt.target.parentNode.classList.contains('draggable-group'),
        start: () => {
            this.selectedElement = evt.target.parentNode;
            const initD = initialiseDragging(this.svg, this.selectedElement, evt);
            this.transform = initD.transform;
            this.offset = initD.offset;
        }
    };

    const result = [
        nodeDrag, groupDrag
    ].filter(x => {
        try {
            return x.test();
        } catch (e) {
            return false;
        }
    })[0];

    result && result.start();
}

function drag(evt) {
    if (!this.selectedElement) {
        return;
    }
    evt.preventDefault();
    var coord = getMousePosition(this.svg, evt);
    this.transform.setTranslate(coord.x - this.offset.x, coord.y - this.offset.y);
    updateConnectedLinks(this.links, this.units, evt, coord.x - this.offset.x, coord.y - this.offset.y);
}

function endDrag(evt) {
    this.selectedElement = undefined;
}

function makeDraggable(evt, units, links) {
    var svg = evt.target;
    const state = {
        svg, units, links,
        selectedElement: undefined,
        offset: undefined,
        transform: undefined
    };

    svg.addEventListener('mousedown', startDrag.bind(state));
    svg.addEventListener('mousemove', drag.bind(state));
    svg.addEventListener('mouseup', endDrag.bind(state));
    svg.addEventListener('mouseleave', endDrag.bind(state));
    svg.addEventListener('touchstart', startDrag.bind(state), { passive: false });
    svg.addEventListener('touchmove', drag.bind(state), { passive: false });
    svg.addEventListener('touchend', endDrag.bind(state));
    svg.addEventListener('touchleave', endDrag.bind(state));
    svg.addEventListener('touchcancel', endDrag.bind(state));
}

function initScene(evt, units, links){
    units.forEach(drawUnit);
    units.getNode = (label, nodeLabel) => {
        const unitElement = (units.find(x => x.label === label) || {}).element;
        if (!unitElement) {
            return;
        }
        return unitElement.querySelector(`circle[data-label="${nodeLabel}"]`);
    };

    links.forEach((link) => drawLink(link, units));
    makeDraggable(evt, units, links);
}