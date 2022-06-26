/*
    NOTES:
    - move towards greater object-orientation in code (message-passing-type OO)

    ROADMAP:
    - ANIMATION
        Show what's happening in the system by indicating activity.
    - ORGANIZATION / MECHANICS
        Enable greater complexity of models by grouping and allowing creation of more items.
    - STATE
        Show changes to system by animating/manipulating state of system over time.  This could go at least two directions: create UI elements which affect state or integrate with Redux Dev Tools.
    - CONNECTED
        Model should be attached to something specific: functions, network calls.  This is the life and breath of a visual model like this.
    - SHARE
        Exporting an animated GIF would make this tool incredibly useful for one of its main goals: illustrating complex systems visually.  Also, sharing, saving, and manipulating configuration JSON directly woulld be of great use.

    TODO/TASKS:
    - wires: CRUD
        - wire create on mobile is awkward / broken
        - update/delete needs wire selection
    - boxes: CRUD
        - update/delete needs box/unit selection
    - group: CRUD
        - needs box/units selection
    - game loop
        - difference between event-driven and game loop?
            https://hero.handmade.network/forums/code-discussion/t/1113-event_driven_vs_game_loop
            https://stackoverflow.com/questions/2565677/why-is-a-main-game-loop-necessary-for-developing-a-game
    - wires:  indicators (arrows) - svg marker kinda sucks, imho - may skip this
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end
    - boxes: collision detection
    - page: zoom/pan with memory
    - auto-arrange scene
    - snap to grid
    - export animated GIF
    - export/import source configuration
    - sequence/history as part of configuration object
    - HTML element (or canvas) overlayed on unit/box for better stylng?
        https://stackoverflow.com/questions/5882716/html5-canvas-vs-svg-vs-div
    - history slider
    - integrate state with redux dev tools
    - nodes: animate node and helper in sync with wire animation
    - animation: should pause when dragging boxes/wires
    X wires: animation
        https://css-tricks.com/svg-line-animation-works/
    X creation of scene from json
    X highlighting/hovering links

    ISSUES:
    - link click (selection) does not select node and helpers
    - link terminal should change direction when close to node
        ^^^ direction should be rendered on the fly, not part of state
    - dragging wire should have z-index higher than units (fixed by transparent on drag feature?)
    - link create/drag should work when started at node helper
    X hovering node should also highlight node helper (and vice versa)
    X only use transparent mode when node or group(unit) dragging
    X new state pattern breaks dragging / hovering
      X hovering fails
      X dragging new link fails
      X many functions fail
      X functionality fails
      X updating units causes duplicate
    X dragging unit (and its links?) should be on top (and transparent)
    X second new link creation fails
    X moving unit quickly (or over other items) or dragging new wire sometimes causes connected links to displace
        ^^^ probably should only update moving part of link

    RESOURCES:
    - path tool - https://codepen.io/thebabydino/full/EKLNvZ
    - path info - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

*/

const withAnimFrame = (fn) => (arg) => window.requestAnimationFrame(() => fn(arg));

const oppositeDirection = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east'
};

const setStyle = (id, rules) => {
  var css = document.getElementById(id);
  if (!css) {
    css = document.createElement('style');
    css.type = 'text/css';
    css.id = id;
    document.getElementsByTagName("head")[0].appendChild(css);
  }
  if (css.styleSheet) {
    css.styleSheet.cssText = rules;
  } else {
    css.appendChild(document.createTextNode(rules));
  }
};

const removeStyle = (id) => {
  var sSheet = document.getElementById(id);
  if (sSheet) {
    sSheet.parentNode.removeChild(sSheet);
  }
};

const tryParse = text => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return undefined;
  }
};

//https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/
function overlayColor(color) {
  //if only first half of color is defined, repeat it
  if (color.length < 5) {
    color += color.slice(1);
  }
  return (color.replace('#', '0x')) > (0xffffff / 2) ? '#111' : '#eee';
}

const getTranslateX = node => {
  const transform = node.getAttribute('transform');
  const splitChar = transform.includes(',') ? ',' : ' ';
  if (!transform.split(splitChar)[0]) {
    debugger;
  }
  return Number(transform.split(splitChar)[0].split('(')[1]);
};
const getTranslateY = node => {
  const transform = node.getAttribute('transform');
  const splitChar = transform.includes(',') ? ',' : ' ';
  if (!transform.split(splitChar)[1]) {
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

// -----------------------------------------------------------------------------

function animateLink(link, callback, reverse) {
  //TODO: also animate node and helper
  //NOTE: would be nice if link wire, node, and helpers could be treated as one
  const linkQuery = `.link[data-label="${link.label}"]`;
  const linkElement = document.querySelector(linkQuery);
  const linkPath = document.querySelector(`${linkQuery} path`);

  const namespaceURI = document.getElementById('canvas').namespaceURI;
  const animatedPath = document.createElementNS(namespaceURI, 'path');
  animatedPath.classList.add('animated');
  animatedPath.setAttribute('d', linkPath.getAttribute('d'));
  linkElement.appendChild(animatedPath);

  const linkLength = linkPath.getTotalLength();
  const dashLength = 1;
  const duration = linkLength / 100 * 2.5;
  const style = `
        ${linkQuery} path.animated {
            /* stroke: #fff9; */
            stroke-linecap: round;
            stroke-width: 7px;
            stroke-dasharray: ${dashLength} ${linkLength};
            animation-name: dash-${link.label};
            animation-duration: ${duration}s; /* or: Xms */
            animation-iteration-count: 1;
            animation-direction: ${reverse ? 'reverse' : 'normal'}; /* or: normal */
            animation-timing-function: linear; /* or: ease, ease-in, ease-in-out, linear, cubic-bezier(x1, y1, x2, y2) */
            animation-fill-mode: both; /* or: backwards, both, none */
            animation-delay: 0s; /* or: Xms */
        }

        @keyframes dash-${link.label} {
            from {
                stroke-dashoffset: ${dashLength};
            }
            to {
                stroke-dashoffset: ${-linkLength};
            }
        }
    `;
  //console.log({ linkLength, dashLength, duration});
  //console.log(`-- START: ${link.label}`);
  var isPaused;
  const timeoutDone = () => {
    if (isPaused) {
      return;
    }
    //console.log(`-- END  : ${link.label}`);
    callback && callback();
  };
  setTimeout(timeoutDone, duration * 1000);
  setStyle('linkAnimation', style)

  function pause() {
    if (isPaused) {
      return;
    }
    isPaused = true;
    animatedPath.style.animationPlayState = 'paused';
    animatedPath.style.webkitAnimationPlayState = 'paused';
  }
  function resume() {
    if (!isPaused) {
      return;
    }
    isPaused = false;
    setTimeout(timeoutDone, duration * 1000);
    animatedPath.style.animationPlayState = 'running';
    animatedPath.style.webkitAnimationPlayState = 'running';
  }
  function pauseHard() {
    isPaused = true;
    callback('reset');
    removeAnimation();
  }
  function resumeHard() {
    removeAnimation();
    callback('reset');
    setTimeout(() => animateLink(link, callback), 500);
  }
  return { pause, resume, pauseHard, resumeHard };
}

function removeAnimation() {
  Array.from(document.querySelectorAll('path.animated')).forEach(path => {
    path.parentNode.removeChild(path);
  });
  removeStyle('linkAnimation');
}

// -----------------------------------------------------------------------------
function createLinkElement(link) {
  const namespaceURI = document.getElementById('canvas').namespaceURI;
  const linkElement = document.createElementNS(namespaceURI, "g");
  linkElement.classList.add('link');

  const linkPath = document.createElementNS(namespaceURI, "path");

  const startCoords = link.start;
  const endCoords = link.end;
  const pathObj = {
    m: startCoords,
    c3: endCoords
  };
  const controls = calculateControls(pathObj);
  pathObj.c1 = controls.c1;
  pathObj.c2 = controls.c2;
  const directions = {
    start: link.start.direction,
    end: link.end.direction
  };
  const originalPathD = objToPathD(pathObj, directions);
  linkPath.setAttribute('d', originalPathD)

  linkElement.appendChild(linkPath);

  //drawControls({ namespaceURI, link, linkElement, pathObj });

  const linksGroup = document.querySelector('#canvas #links');
  linksGroup.appendChild(linkElement);

  return linkElement;
}

function drawLink(link, callback) {
  var linkElement = document.querySelector(`g[data-label="${link.label}"]`);
  const linkStartParent = document.querySelector(
    `.box[data-label="${link.start.parent.block}"]
       .node[data-label="${link.start.parent.node}"]`
  );
  const linkEndParent = document.querySelector(
    `.box[data-label="${link.end.parent.block}"]
       .node[data-label="${link.end.parent.node}"]`
  );

  const linkStartParentHelper = document.querySelector(
    `.box[data-label="${link.start.parent.block}"]
       .helpers [data-label="${link.start.parent.node}"]`
  );

  const linkEndParentHelper = document.querySelector(
    `.box[data-label="${link.end.parent.block}"]
       .helpers [data-label="${link.end.parent.node}"]`
  );

  // if(callback){
  //     console.log({ linkElement, linkEndParent, linkStartParent });
  // }
  // don't draw (or remove) link if it doesn't have 2 connections
  if (!linkStartParent || !linkEndParent) {
    if (!linkElement) {
      return;
    }
    linkElement.parentNode.removeChild(linkElement);
    return;
  }

  if (!linkElement) {
    linkElement = createLinkElement(link);
    linkElement.setAttribute('data-label', link.label);
  }
  const pathObj = {
    m: {
      x: link.start.x,
      y: link.start.y
    },
    c3: {
      x: link.end.x,
      y: link.end.y
    }
  };

  const controlPoints = calculateControls(pathObj);
  pathObj.c1 = controlPoints.c1;
  pathObj.c2 = controlPoints.c2;
  const directions = {
    start: link.start.direction,
    end: link.end.direction
  };
  const newPathD = objToPathD(pathObj, directions);
  // if(callback){
  //     console.log({ newPathD, pathObj, linkElement, linkEndParent, linkStartParent });
  // }
  linkElement.querySelector('path').setAttribute('d', newPathD);
  //NOTE: filter on a thin, vertical element is buggy (so pulse is commented for now)
  if (link.selected) {
    linkElement.classList.add('selected');
    linkStartParent.classList.add('selected');
    linkEndParent.classList.add('selected');
    linkStartParentHelper.classList.add('selected');
    linkEndParentHelper.classList.add('selected');
    //linkElement.classList.add('pulse');
  } else {
    linkElement.classList.remove('selected');
    linkStartParent.classList.remove('selected');
    linkEndParent.classList.remove('selected');
    linkStartParentHelper.classList.remove('selected');
    linkEndParentHelper.classList.remove('selected');
    //linkElement.classList.remove('pulse');
  }
  //linkElement.setAttribute('class', 'link' + (link.class ? ` ${link.class}` : ''));

  const animated = linkElement.querySelector('path.animated');
  if (animated) {
    animated.setAttribute('d', newPathD);
  }
  if (callback) {
    callback(linkElement);
  }
}

function drawOrUpdateUnit(unit, callback) {
  const unitElement = document.querySelector(`.box[data-label="${unit.label}"]`);

  if (!unitElement) {
    drawUnit(unit, callback);
    return;
  }

  unitElement.setAttribute('class', 'box draggable-group' + (unit.class ? ` ${unit.class}` : ''));
  unitElement.setAttribute('transform', `translate(${unit.x} , ${unit.y})`);
  //console.log({ TODO: `updateUnit ${unit.label}`})
}

function drawUnit(unit, callback) {
  const width = Number(unit.width || 76);
  const height = Number(unit.height) || 76;

  const namespaceURI = document.getElementById('canvas').namespaceURI;
  const unitElement = document.createElementNS(namespaceURI, "g");
  unit.temporary && unitElement.setAttribute('data-temporary', true);
  unitElement.setAttribute('data-label', unit.label);
  unitElement.setAttribute('class', 'box draggable-group' + (unit.class ? ` ${unit.class}` : ''));
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

  if (unit.temporary) {
    unitElement.innerHTML = `
            <circle class="node dragging" data-label=${unit.nodes[0].label} cx="0" cy="0" r="3"></circle>
        `;
    canvas.appendChild(unitElement);
    if (callback) {
      callback(unitElement);
    }
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
    if (n.selected) {
      el.classList.add('selected');
    }
    const direction = getNodeDirection(el);
    el.setAttribute('data-direction', getNodeDirection(el));
    const cx = Number(el.getAttribute('cx'));
    const cy = Number(el.getAttribute('cy'));
    const offset = 6; //length of helper
    const segment = {
      'north': `M ${cx} ${cy} L ${cx} ${cy - offset}`,
      'east': `M ${cx} ${cy} L ${cx + offset} ${cy}`,
      'south': `M ${cx} ${cy} L ${cx} ${cy + offset}`,
      'west': `M ${cx} ${cy} L ${cx - offset} ${cy}`
    };
    helpersHTML += `
            <path data-label="${n.label}" class="helper-segment${n.selected ? ' selected' : ''}" d="${segment[direction]}"></path>
        `;
    //console.log({ direction: n.direction })
  });

  helpers.innerHTML = helpersHTML;

  //const linksGroup = document.querySelector('#canvas #links');

  canvas.appendChild(unitElement);
  //canvas.insertBefore(unitElement, linksGroup);
  if (callback) {
    callback(unitElement);
  }
}

// -----------------------------------------------------------------------------

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
  const offset = getMousePosition(svg, evt);

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

function initialiseWireDragging(evt) {
  //console.log('wire drag start');
  const mousePos = getMousePosition(this.svg, evt);
  const label = Math.random().toString(26).replace('0.', '');

  const startDirection = evt.target.dataset.direction;
  const endDirection = oppositeDirection[startDirection];

  const tempUnit = {
    x: mousePos.x,
    y: mousePos.y,
    label,
    width: 10,
    height: 10,
    temporary: true,
    nodes: [{
      x: 0,
      y: 0,
      direction: endDirection,
      label: 'first'
    }]
  };

  const linkLabel = Math.random().toString(26).replace('0.', '');
  const tempLink = {
    temporary: true,
    label: linkLabel,
    start: {
      direction: startDirection,
      parent: {
        block: evt.target.parentNode.dataset.label,
        node: evt.target.dataset.label
      },
      x: getTranslateX(evt.target.parentNode) + Number(evt.target.getAttribute('cx')),
      y: getTranslateY(evt.target.parentNode) + Number(evt.target.getAttribute('cy'))
    },
    end: {
      direction: endDirection,
      parent: {
        block: tempUnit.label,
        node: tempUnit.nodes[0].label
      },
      x: mousePos.x,
      y: mousePos.y
    }
  };
  tempLink.temporary = true;

  const setDraggingState = (unitElement, linkElement) => {
    //const unitElement = document.querySelector(`.box[data-label="${tempUnit.label}"]`);
    if (!unitElement || !linkElement) {
      debugger;
    }
    this.selectedElement = unitElement;
    const initD = initialiseUnitDragging(this.svg, unitElement, evt);
    this.transform = initD.transform;
    this.offset = initD.offset;
    this.draggedUnit = unitElement;
    this.draggedLink = linkElement;
    this.update((state) => {
      const newUnits = state.units.concat([tempUnit]);
      const newLinks = state.links.concat([tempLink]);
      return { units: newUnits, links: newLinks };
    });
  }

  const initWireDragTasks = () => {
    drawOrUpdateUnit(tempUnit, (unitElement) => {
      drawLink(tempLink, (linkElement) => {
        setDraggingState(unitElement, linkElement);
      });
    });
  };
  withAnimFrame(initWireDragTasks)();
}

function distanceNodes(node1, node2) {
  var a = node1.x - node2.x;
  var b = node1.y - node2.y;

  var c = Math.sqrt(a * a + b * b);
  return c;
}

// ---------------------------------------------------------------

function startDrag(evt) {
  if (this.selectedElement) {
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
      bringToTop(this.selectedElement);
      const initD = initialiseUnitDragging(this.svg, this.selectedElement, evt);
      this.transform = initD.transform;
      this.offset = initD.offset;
    }
  };

  const dragMode = [
    nodeDrag, groupDrag
  ].filter(x => {
    try {
      return x.test();
    } catch (e) {
      return false;
    }
  })[0];

  if (dragMode) {
    setStyle('clearBox', `
        .box {
            opacity: 0.7;
        }
        path.animated {
            opacity: 0.5 !important;
        }
    `);
    dragMode.start();
    window.pause && window.pause();
  }

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
  state.update((state) => {
    const selectedUnitState = state.units.find(u => u.label === this.selectedElement.dataset.label);
    selectedUnitState.x = coord.x - this.offset.x;
    selectedUnitState.y = coord.y - this.offset.y;

    //update connected links
    state.links.forEach(link => {
      ['start', 'end'].forEach(connect => {
        const connection = link[connect];
        if (connection.parent.block !== selectedUnitState.label) {
          return;
        }
        const connectedNode = selectedUnitState.nodes
          .find(n => n && n.label === connection.parent.node);
        connection.x = selectedUnitState.x + connectedNode.x;
        connection.y = selectedUnitState.y + connectedNode.y;
      });
    });
    return state;
  });
  //console.log(`el: ${this.selectedElement.dataset.label}, x: ${coord.x - this.offset.x}, y: ${coord.y - this.offset.y}`);
}

function endDrag(evt) {
  if (!this.selectedElement) {
    return;
  }
  removeStyle('clearBox');

  const dragged = {
    element: this.selectedElement,
    link: this.draggedLink,
    unit: this.draggedUnit,
    temporary: this.selectedElement.dataset.temporary
  };
  if (dragged.temporary) {
    const mousePos = getMousePosition(this.svg, evt);
    const currentState = this.read();
    const allNodes = currentState.units
      .filter(x => x.label !== dragged.unit.dataset.label)
      .reduce((all, one) => {
        const nodes = one.nodes.map(x => {
          if (!x) {
            return x;
          }
          const globalPosition = () => {
            return {
              x: one.x + x.x,
              y: one.y + x.y
            };
          };
          const parentLabel = one.label;
          return Object.assign({}, x, { globalPosition, parentLabel });
        });
        return all.concat(nodes)
      }, [])
      .filter(x => !!x)
      .map(n => ({
        label: n.label,
        parentLabel: n.parentLabel,
        direction: n.direction,
        x: n.x,
        y: n.y,
        globalX: n.globalPosition().x,
        globalY: n.globalPosition().y,
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
    if (!allNodes.length) {
      const units = currentState.units.filter(u => !u.temporary);
      const links = currentState.links.filter(l => !l.temporary);

      this.update(() => {
        return { units, links };
      });
      this.selectedElement = undefined;
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }
    const units = currentState.units.filter(u => !u.temporary);
    const links = currentState.links;
    const draggingLink = links.find(l => l.temporary);
    const newEnd = allNodes[0];
    delete draggingLink.temporary;
    draggingLink.end.parent.block = newEnd.parentLabel;
    draggingLink.end.parent.node = newEnd.label;
    draggingLink.end.parent.direction = oppositeDirection[newEnd.direction];

    //console.log({ draggingLink, newEnd, allNodes })
    //TODO: update end
    this.update(() => {
      return { units, links };
    })
  }
  window.resume && window.resume();
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

// ----------------------------------------------------------------

function bringToTop(targetElement) {
  // put the element at the bottom of its parent
  let parent = targetElement.parentNode;
  parent.appendChild(targetElement);
}

function hoverStart(event) {
  if (this.selectedElement) {
    return;
  }
  const currentState = this.read();
  const units = currentState.units;
  const links = currentState.links;

  const getNodeIndex = (el) => Array.from(
    el.parentNode.querySelectorAll('circle')
  ).indexOf(el);
  const getHelperIndex = (el) => Array.from(
    el.parentNode.querySelectorAll('.helper-segment')
  ).indexOf(el);

  const getNodeHelpers = (el) => Array.from(
    el.parentNode.querySelectorAll('.helpers path')
  );
  const getNodeForHelper = (el) => {
    return el.parentNode.parentNode.querySelectorAll('circle')[getHelperIndex(el)];
  };
  const getHelper = (el) => (getNodeHelpers(el) || [])[getNodeIndex(el)];

  if (event.target.tagName === 'path' && !event.target.classList.contains('helper-segment')) {
    const linkLabel = event.target.parentNode.getAttribute('data-label');
    const linkElement = event.target.parentNode;
    const link = (links.filter(x => x.label === linkLabel) || [])[0];
    const start = document
      .querySelector(`.box[data-label="${link.start.parent.block}"] circle[data-label="${link.start.parent.node}"]`);
    const end = document
      .querySelector(`.box[data-label="${link.end.parent.block}"] circle[data-label="${link.end.parent.node}"]`);
    if (!start || !end) {
      debugger;
    }
    const startHelper = getHelper(start);
    const endHelper = getHelper(end);
    bringToTop(linkElement);
    this.hovered = [linkElement, end, start, endHelper, startHelper];
    //console.log({ link, hovered: this.hovered})
    this.hovered.forEach(el => el.classList.add('hovered'));
  }
  if (event.target.tagName === 'circle') {
    const helper = getHelper(event.target);
    const node = event.target;
    this.hovered = [helper, node];
    if (!helper || !node) {
      debugger
    }
    this.hovered.forEach(el => el.classList.add('hovered'));
  }
  if (event.target.classList.contains('helper-segment')) {
    const helper = event.target;
    const node = getNodeForHelper(event.target);
    if (!helper || !node) {
      debugger
    }
    this.hovered = [helper, node];
    this.hovered.forEach(el => el.classList.add('hovered'));
  }
}

function hoverEnd(event) {
  if (this.hovered) {
    this.hovered.forEach(el => el.classList.remove('hovered'));
    this.hovered = undefined;
  }
}

function linkClick(event) {
  const t = event.target;
  var link;
  if (t.tagName === 'path' && t.parentNode.classList.contains('link')) {
    link = t.parentNode;
  }

  if (t.classList.contains('link')) {
    link = t;
  }
  if (!link) {
    return;
  }
  this.update(({ units, links }) => {
    console.log('clicked a link: ', link.dataset.label);
    const clickedStateLink = links.find(l => l.label === link.dataset.label);
    clickedStateLink.selected = !clickedStateLink.selected;
    if (!clickedStateLink.selected) {
      delete clickedStateLink.selected;
    }
    console.log('TODO: also select nodes');
    return { links };
  });
}

function addLinkEffects(state) {
  var svg = state.svg;
  const hoverStartHandler = hoverStart.bind(state);
  const hoverEndHandler = hoverEnd.bind(state);
  const clickHandler = linkClick.bind(state);
  svg.addEventListener("mouseover", hoverStartHandler);
  svg.addEventListener('mouseout', hoverEndHandler);
  svg.addEventListener('mouseleave', hoverEndHandler);
  svg.addEventListener('click', clickHandler);
}

function mapNodeToState(node, index) {
  if (!node) { return node; }
  const unit = this.unit;
  const width = Number(unit.width || 76);
  const height = Number(unit.height || 76);

  const directionMap = [
    'west', 'west', 'west',
    'south',
    'east', 'east', 'east',
    'north'
  ];

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

  return {
    label: node.label,
    x: positions[index].x,
    y: positions[index].y,
    direction: directionMap[index]
  };
}

function initState({ units, links }) {
  const u = units.map(unit => ({
    label: unit.label,
    color: unit.color,
    class: unit.class,
    x: unit.x,
    y: unit.y,
    width: unit.width,
    height: unit.height,
    nodes: unit.nodes.map(mapNodeToState.bind({ unit }))
  }));
  //console.log({ unit: units[0], u: u[0]})

  const l = links.map(link => {
    const stripParent = {
      getNode: (block, node) => ({ block, node })
    };

    const _link = ['start', 'end'].reduce((all, name) => {
      const parent = link[name](stripParent);
      const unit = u.find(unit => unit && unit.label === parent.block);
      const node = unit.nodes.find(node => node && node.label === parent.node);
      if (link.selected) {
        node.selected = true;
      }
      all[name] = {
        x: unit.x + node.x,
        y: unit.y + node.y,
        parent,
        direction: node.direction
      };
      return all;
    }, {});
    _link.label = link.label || Math.random().toString(26).replace('0.', '');
    _link.selected = link.selected;
    return _link;
  });
  //console.log({ link: links[0], l: l[0]})
  return { units: u, links: l };
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function cleanScene(state) {
  const domLinks = Array.from(document.querySelectorAll('.link'));
  //.map(x => x.dataset.label);
  const domUnits = Array.from(document.querySelectorAll('.box'));
  //.map(x => x.dataset.label);
  const stateUnitLabels = state.units.map(x => x.label);
  const stateLinkLabels = state.links.map(x => x.label);

  domUnits.forEach(unit => {
    const label = unit.dataset.label;
    if (!stateUnitLabels.includes(label)) {
      unit.parentNode.removeChild(unit);
    }
  });

  domLinks.forEach(link => {
    const label = link.dataset.label;
    if (!stateLinkLabels.includes(label)) {
      link.parentNode.removeChild(link);
    }
  });

  //TODO: remove links that are missing one or both units

  //TODO: remove nodes that are missing from each unit
}

// TODO: maybe use an observer to keep dom model current
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
function getDom() {
  const dom = Array.from(document.querySelectorAll('.box'))
    .map(u => {
      const { label } = u.dataset;
      const el = u;
      const children = Array.from(u.querySelectorAll('.node'));
      const helpers = Array.from(u.querySelectorAll('.helper-segment'));
      return {
        label, children, helpers, el
      };
    });
  return dom;
};

function render(_state) {
  const state = typeof _state.read === 'function' ? _state.read()
    : _state;

  cleanScene(state);

  const domUnits = Array.from(document.querySelectorAll('.box'))
    .map(element => ({
      element,
      label: element.dataset.label,
      class: Array.from(element.classList)
        .filter(c => !(c === 'box' || c === 'draggable-group'))
        .join(' '),
      position: {
        x: getTranslateX(element),
        y: getTranslateY(element)
      }
    }));

  const unitsToUpdate = state.units.filter(unit => {
    const domMatch = domUnits.find(d => d.label === unit.label);
    if (!domMatch) {
      return true;
    }

    const hasMoved = domMatch.position.x !== unit.x
      || domMatch.position.y !== unit.y;
    const classChanged = domMatch.class !== unit.class;

    return hasMoved || classChanged;
  });

  clone(unitsToUpdate).forEach(withAnimFrame(drawOrUpdateUnit));

  const domLinks = Array.from(document.querySelectorAll('g.link'));
  const linksToUpdate = state.links
    .reduce((all, one) => {
      const unitsToUpdateLabels = unitsToUpdate.map(u => u.label);
      const linkStartConnected = () => {
        const startParent = one.start.parent.block;
        return unitsToUpdateLabels.includes(startParent);
      };
      const linkEndConnected = () => {
        const endParent = one.end.parent.block;
        return unitsToUpdateLabels.includes(endParent);
      };
      const linkNewlySelected = () => {
        const isSelected = one.selected;
        const isInSelectedLinks = this.selectedLinks.includes(one.label);
        if (isSelected && !isInSelectedLinks) {
          this.selectedLinks.push(one.label);
        }
        if (!isSelected && isInSelectedLinks) {
          this.selectedLinks = this.selectedLinks.filter(x => x === one.label);
        }
        return isSelected && !isInSelectedLinks;
      };
      const linkClassChanged = () => {
        const domLink = domLinks.find(d => d.dataset.label === one.label);
        if (!domLink) {
          return;
        }
        const domClass = domLink.getAttribute('class');
        return domClass === ('link ' + one.class);
      };
      if (linkClassChanged() || linkStartConnected() || linkEndConnected() || linkNewlySelected()) {
        all.push(one)
      }
      return all;
    }, []);
  //console.log({ linksToUpdate });

  clone(linksToUpdate).forEach(withAnimFrame(drawLink));
}

//---------------------------------------------------------------
function engineBindState(Engine, _state) {
  /*
    FROM EMIT_STEP (works right):

    [ομφαλός] fetch: start - 0 ms
    [ομφαλός] fetch: success - 2499 ms

    [ομφαλός] send: start - 2500 ms
    [जो है वही है] ack: success - 7501 ms
    [ομφαλός] send: success - 4998 ms

    [जो है वही है] send: start - 2500 ms
    [גליטש] ack: success - 7499 ms
    [जो है वही है] send: success - 5001 ms

    [גליטש] send: start - 2499 ms
    [ομφαλός] ack: success - 7499 ms
    [גליטש] send: success - 5001 ms
	*/

  const cleanClass = (stateClass) => {
    return (stateClass || '')
      .replace(' fail', '')
      .replace(' wait', '')
      .replace(' pulse', '')
      .replace('fail', '')
      .replace('wait', '')
      .replace('pulse', '');
  };

  var t0;
  const emitStep = (data) => {
    //debugger;
    t0 = t0 || performance.now();
    var t1 = performance.now();
    var tDiff = Math.floor(t1 - t0);
    t0 = t1 + 0;
    const { label } = (data.src || data);
    const linkSpacer = data.name === 'link' && data.state === 'success'
      ? '\n\n'
      : '';
    console.log(`[${label}] ${data.name}: ${data.status || data.state} - ${tDiff} ms ${linkSpacer}`);
    //console.log({ data });

  };

  const unitsChange = (data) => {
    data.forEach(d => emitStep({name: 'unit', ...d}));
    _state.update(({ units }) => {
      data.forEach(u => {
        const stateUnit = units.find(s => s.label === u.label);
        if (u.state === 'success') {
          stateUnit.class = cleanClass(stateUnit.class);
          return;
        }
        if (u.state === 'active') {
          stateUnit.class = cleanClass(stateUnit.class) + " pulse";
          return;
        }
        if (u.state === 'fail') {
          stateUnit.class = cleanClass(stateUnit.class) + " fail";
          return;
        }
        if (u.state === 'wait') {
          stateUnit.class = cleanClass(stateUnit.class) + " wait";
          return;
        }
      })
      return { units };
    });
  };

  const linksChange = (data) => {
    data.forEach(d => emitStep({name: 'link', ...d}));
    /*
        TODO: side effects come along with updating state here:
            - animate link
            - remove animation
        this should be done in renderer, not here
    */
    //console.log({ linksChange: JSON.stringify(data) })

    //TODO: this needs to be done better!! (remove animation)
    //removeAnimation();
    _state.update(({ links }) => {
      data.forEach(u => {
        const stateLink = links.find(s => s.label === u.label);
        if (u.state === 'receive') {
          stateLink.class = (cleanClass(stateLink.class) + " pulse").trim();
          animateLink({ label: u.label }, null, 'reverse');
          stateLink.selected = true;
          return;
        }
        if (u.state === 'send') {
          stateLink.class = (cleanClass(stateLink.class) + " pulse").trim();
          animateLink({ label: u.label });
          stateLink.selected = true;
          return;
        }
        if (u.state === 'fail') {
          stateLink.class = "fail";
          //stateLink.selected = false;
          return;
        }
        if (u.state === 'success') {
          stateLink.class = cleanClass(stateLink.class);
          stateLink.selected = false;
          return;
        }
        console.log({ unhandledLink: u });
      })
      return { links };
    });
  };



  // const unitsDeactivate = (data) => {
  //     _state.update(({ units }) => {
  //         data.forEach(u => {
  //             const stateUnit = units.find(s => s.label === u.label);
  //             //TODO: fail versus success?
  //             stateUnit.class = stateUnit.class.replace(' pulse', '');
  //         })
  //         return { units };
  //     });
  // };

  Engine.on('units-change', unitsChange);
  Engine.on('links-change', linksChange);
  //Engine.on('emit-step', emitStep);
  Engine.on('emit-step', ()=>{});
}

// --------------------------------------------------------------
// function testEngine(){
//     console.log('test engine');
//     const { engine } = window.ExpressionEngine;
//     const links = [];
//     const units = [{
//         handle: `
//             ack()
//             fetch(countRegisterUrl)
//             send(null, 'fourth')
//         `,
//     }];
//     const stateDefintion = { units, links, verbose: true }; //because state won't carry function definitions
//     const Engine = engine(stateDefintion);
//     Engine.on('emit-step', (data) => {
//         //console.log('step emitted');
//         console.log(`${data.name}: ${data.status}`);
//     });
// }

function initScene(evt, units, links) {
  if (window.innerWidth > 750) {
    document.body.style.zoom = "150%";
  }

  const _state = new State();
  //TODO: at some point this state has to be reconciled with app state?
  _state.svg = evt.target;
  const state = {
    read: _state.read,
    update: _state.update,
    svg: _state.svg,
    hovered: undefined,
    draggedUnit: undefined,
    draggedLink: undefined,
    selectedLinks: [],
    selectedElement: undefined,
    offset: undefined,
    transform: undefined
  };
  const renderHandler = render.bind(state);

  _state.on('create', renderHandler);
  _state.on('update', renderHandler);
  _state.on('delete', renderHandler);

  _state.on('history', (data) => {
    const historyStatsEl = document.getElementById('state-memory-size');
    if (historyStatsEl) {
      historyStatsEl.innerHTML = JSON.stringify(data)
        .replace(/[\{\}\"]/g, '')
        .replace(/\,/g, ', ');
    }
  });

  //TODO: would be nice if this went away > initState
  _state.create(initState({ units, links }));


  window.state = _state;

  makeDraggable(state);
  addLinkEffects(state);

  setTimeout(() => {
    //return testEngine();
    const { engine } = window.ExpressionEngine;
    const stateDefintion = { units, links, verbose: false }; //because state won't carry function definitions
    const Engine = engine(stateDefintion);

    engineBindState(Engine, _state);
    const currentState = _state.read(); //because stateDef does not have link labels
    Engine.start(currentState);
  }, 1000);

  return;

  // BELOW: create and handle activity in network
  // --------------------------------------------------------------

  // make slow requests - http://slowwly.robertomurray.co.uk/
  // eg. http://slowwly.robertomurray.co.uk/delay/3000/url/http://www.boredapi.com/api/activity/

  // cheerlights
  // http://api.thingspeak.com/channels/1417/field/1/last.json

  //https://github.com/toddmotto/public-apis << COOL

  const apis = {
    ghibli: 'https://ghibliapi.herokuapp.com/films/?limit=10',
    bored: 'http://www.boredapi.com/api/activity/',
    countRegister: 'https://api.countapi.xyz/hit/boxesandwires/visits',
    countGet: 'https://api.countapi.xyz/get/boxesandwires/visits',
  };
  // fetch(countRegister)
  //     .then(response => response.text())
  //     .then(body => {
  //         const results = tryParse(body);
  //         console.log({ results });
  //     });

  // ------------------------------------------------------------------------

  const { compile } = window.ExpressionEngine;
  const api = 'countRegister';
  const exampleExpression = `
        fetch(${api}Url)
        map(${api}Map, ${api}Url, "${api}Map")
        send(${api}MapValue, 2)
        send(${api}MapValue, 1)
    `;
  var myFunc = compile(exampleExpression, verbose = true);

  myFunc({
    [`${api}Url`]: apis[api],
    [`${api}Map`]: (data) => data.value || data.activity
  }, (err, data) => {
    try {
      document.getElementById('api-results').innerHTML = data.map[0].result;
      console.log({ err, data, result: data.map[0].result });
    } catch (e) { }
  });

}