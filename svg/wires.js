/*
    NOTES:
    - move towards greater objective-orientation in code

    ISSUES:

    TODO:
    - wires: CRUD
    - boxes: CRUD
    - group: CRUD
    - game loop
    - wires: animation and indicators (arrows)
    - boxes: collision detection
    - page: zoom/pan with memory
    X creation of scene from json
    X highlighting/hovering links

    ISSUES:
    - second new link creation fails
    - moving nodes and wires over other nodes and wires causes attachments to displace
    - dragging wire should have z-index higher than units
    - hovering node should also highlight node helper (and vice versa)
    - link create/drag should work when started at node helper

    RESOURCES:
    - path tool - https://codepen.io/thebabydino/full/EKLNvZ
    - path info - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

*/

const getTranslateX = node => {
    const transform = node.getAttribute('transform');
    const splitChar = transform.includes(',') ? ',' : ' ';
    if(!transform.split(splitChar)[0]){
        debugger;
    }
    return Number(transform.split(splitChar)[0].split('(')[1]);
};
const getTranslateY = node => {
    const transform = node.getAttribute('transform');
    const splitChar = transform.includes(',') ? ',' : ' ';
    if(!transform.split(splitChar)[1]){
        debugger;
    }
    return Number(transform.split(splitChar)[1].split(')')[0]);
};

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

    link.startOriginalOffsetX = getTranslateX(link.start(units).parentNode);
    link.startOriginalOffsetY = getTranslateY(link.start(units).parentNode);
    link.endOriginalOffsetX = getTranslateX(link.end(units).parentNode);
    link.endOriginalOffsetY = getTranslateY(link.end(units).parentNode);

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
    const label = Math.random().toString(26).replace('0.', '');
    link.label = label;
    link.element.setAttribute('data-label', label);
    link.element.querySelector('path').setAttribute('d', newPathD);
    // if(link.temporary){
    //     debugger;
    // }
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
    unit.temporary && unitElement.setAttribute('data-temporary', true);
    unitElement.setAttribute('data-label', unit.label);
    unitElement.setAttribute('class', 'box draggable-group');
    unitElement.setAttribute('transform', `translate(${unit.x} , ${unit.y})`);
    const style = unit.color
        ? `fill:${unit.color}`
        : '';
    const overlayStyle = unit.color
        ? `fill:${overlayColor(unit.color)}`
        : '';
    //const rect = `<rect x="10" y="1" width="${width}" height="${height}" rx="5" ry="5"></rect>`;
    const rect = `<rect x="10" y="1" style="${style}" width="${width}" height="${height}" rx="0" ry="0"></rect>`;
    var unitElementHTML = unit.temporary
        ? ''
        : `
            ${rect}
            <text x="${width / 2 - unit.label.length * 2}" y="${height / 2 + 4}" style="${overlayStyle}" class="heavy">${unit.label}</text>
        `;
    const nodeRadius = 3;
    const offSet = 10;
    const insetNode = nodeRadius;
    const insetNodeLeft = insetNode + offSet;
    const canvas = document.querySelector('#canvas');
    unit.element = unitElement;

    if(unit.temporary){
        unitElement.innerHTML = `
            <circle class="node dragging" cx="0" cy="0" r="3"></circle>
        `;
        canvas.appendChild(unitElement);
        return;
    }

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
    unit.nodes.forEach(n => {
        if (!n) {
            return;
        }
        n.element = unitElement.querySelector(`circle[data-label="${n.label}"]`);
        n.globalPosition = () => ({
            x: Number(n.element.getAttribute('cx')) + getTranslateX(n.element.parentNode),
            y: Number(n.element.getAttribute('cy')) + getTranslateY(n.element.parentNode),
        });
    });

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

        //console.log({ direction: n.direction })
    });

    helpers.innerHTML = helpersHTML;

    //const linksGroup = document.querySelector('#canvas #links');

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

    // const startParentTransform = link.start.parentNode.getAttribute('transform');
    // const endParentTransform = link.end.parentNode.getAttribute('transform');
    const startCoords = {
        x: getTranslateX(link.start.parentNode) + Number(link.start.getAttribute('cx')),
        y: getTranslateY(link.start.parentNode) + Number(link.start.getAttribute('cy'))
    };
    const endCoords = {
        x: getTranslateX(link.end.parentNode) + Number(link.end.getAttribute('cx')),
        y: getTranslateY(link.end.parentNode) + Number(link.end.getAttribute('cy'))
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

// --------------------------------------------------------------
function getMousePosition(svg, evt) {
    var CTM = svg.getScreenCTM();
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function initialiseUnitDragging(svg, selectedElement, evt) {
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

function initialiseWireDragging(evt){
    console.log('wire drag start');
    const mousePos = getMousePosition(this.svg, evt);
    const label = Math.random().toString(26).replace('0.', '');
    const tempUnit = {
        x: mousePos.x,
        y: mousePos.y,
        label,
        width: 1,
        height: 1,
        temporary: true,
        nodes: [{
            label: 'first'
        }]
    };
    this.units.push(tempUnit);
    drawUnit(tempUnit);
    const tempEnd = tempUnit.element.querySelector('circle');
    const tempLink = {
        start: () => evt.target,
        end: () => tempEnd
    };

    tempLink.temporary = true;
    drawLink(tempLink, this.units);
    this.links.push(tempLink);
    this.selectedElement = tempUnit.element;
    const initD = initialiseUnitDragging(this.svg, this.selectedElement, evt);
    this.transform = initD.transform;
    this.offset = initD.offset;

    this.draggedUnit = tempUnit;
    this.draggedLink = tempLink;
}

function startDrag(evt) {
    if(this.selectedElement){
        return;
    }
    const nodeDrag = {
        test: () => evt.target.classList.contains('node'),
        start: () => {
            initialiseWireDragging.bind(this)(evt);
        }
    };
    const groupDrag = {
        test: () => evt.target.parentNode.classList.contains('draggable-group'),
        start: () => {
            this.selectedElement = evt.target.parentNode;
            const initD = initialiseUnitDragging(this.svg, this.selectedElement, evt);
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
    evt.stopPropagation();
    evt.preventDefault();
}

function drag(evt) {
    if (!this.selectedElement) {
        return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var coord = getMousePosition(this.svg, evt);
    this.transform.setTranslate(coord.x - this.offset.x, coord.y - this.offset.y);
    updateConnectedLinks(this.links, this.units, evt, coord.x - this.offset.x, coord.y - this.offset.y);
}

function distanceNodes(node1, node2){
    var a = node1.x - node2.x;
    var b = node1.y - node2.y;

    var c = Math.sqrt( a*a + b*b );
    return c;
}

function endDrag(evt) {
    if(!this.selectedElement){
        return;
    }
    const dragged = {
        element: this.selectedElement,
        link: this.draggedLink,
        unit: this.draggedUnit,
        temporary: this.selectedElement.dataset.temporary
    };
    if(dragged.temporary){
        const mousePos = getMousePosition(this.svg, evt);
        const allNodes = this.units
            .filter(x => x.label !== this.draggedUnit.label)
            .reduce((all, one) => { return all.concat(one.nodes)}, [])
            .filter(x => !!x)
            .map(n => ({
                element: n.element,
                x: n.globalPosition().x,
                y: n.globalPosition().y,
                distance: distanceNodes({
                    x: mousePos.x,
                    y: mousePos.y,
                }, {
                    x: n.globalPosition().x,
                    y: n.globalPosition().y,
                })
            }))
            .filter(n => n.distance < 10)
            .sort((a, b) => a.distance - b.distance);
        if(allNodes.length){
            const parentLabel = allNodes[0].element.parentElement.dataset.label;
            const nodeLabel = allNodes[0].element.dataset.label;
            this.draggedLink.end = (units) => units.getNode(parentLabel, nodeLabel);
            const newLink = {
                start: this.draggedLink.start,
                end: (units) => units.getNode(parentLabel, nodeLabel)
            };
            this.links.push(newLink);
            drawLink(newLink, this.units);
        }
        this.links = this.links.filter(l => !l.temporary);
        dragged.link.element.parentNode.removeChild(dragged.link.element)
        dragged.element.parentNode.removeChild(dragged.element)
    }
    this.selectedElement = undefined;
    evt.preventDefault();
    evt.stopPropagation();
}

function makeDraggable(state) {
    var svg = state.svg;

    const startDragHandler = startDrag.bind(state);
    svg.addEventListener('mousedown', startDragHandler);
    svg.addEventListener('touchstart', startDragHandler, { passive: false });

    const dragHandler = drag.bind(state);
    svg.addEventListener('touchmove', dragHandler, { passive: false });
    svg.addEventListener('mousemove', dragHandler);

    const endDragHandler = endDrag.bind(state);
    svg.addEventListener('mouseup', endDragHandler);
    svg.addEventListener('mouseleave', endDragHandler);
    svg.addEventListener('touchend', endDragHandler);
    svg.addEventListener('touchleave', endDragHandler);
    svg.addEventListener('touchcancel', endDragHandler);
}

function bringToTop(targetElement){
    // put the element at the bottom of its parent
    let parent = targetElement.parentNode;
    parent.appendChild(targetElement);
}

function hoverStart(event){
    if(this.selectedElement){
        return;
    }
    if(event.target.tagName === 'path' && !event.target.classList.contains('helper-segment')){
        //TODO: cache hovered or make elements easier to use when building link?
        const linkLabel = event.target.parentNode.getAttribute('data-label');
        const link = (this.links.filter(x => x.label === linkLabel) || [])[0];
        const start = link.start(this.units);
        const end = link.end(this.units);
        const getNodeIndex = (el) => Array.from(el.parentNode.querySelectorAll('circle')).indexOf(el);
        const getNodeHelpers = el => Array.from(el.parentNode.querySelectorAll('.helpers path'));
        const getHelper = el => (getNodeHelpers(el)||[])[getNodeIndex(el)];
        const startHelper = getHelper(start);
        const endHelper = getHelper(end);
        bringToTop(link.element);
        this.hovered = [link.element, end, start, endHelper, startHelper];
        this.hovered.forEach(el => el.classList.add('hovered'));
    }
}

function hoverEnd(event){
    if(this.hovered){
        this.hovered.forEach(el => el.classList.remove('hovered'));
        this.hovered = undefined;
    }
}

function addLinkEffects(state) {
    var svg = state.svg;
    const hoverStartHandler = hoverStart.bind(state);
    const hoverEndHandler = hoverEnd.bind(state);
    svg.addEventListener("mouseover", hoverStartHandler);
    svg.addEventListener('mouseout', hoverEndHandler);
    svg.addEventListener('mouseleave', hoverEndHandler);
}

// --------------------------------------------------------------
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
    const state = {
        svg: event.target,
        units, links,
        hovered: undefined,
        draggedUnit: undefined,
        draggedLink: undefined,
        selectedLinks: [],
        selectedElement: undefined,
        offset: undefined,
        transform: undefined
    };

    makeDraggable(state);
    addLinkEffects(state);
}