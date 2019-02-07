
function attrsFromLevelType(type){
    return {
        'Very Easy': {
            color: 'green'
        },
        'Easy': {
            color: 'green'
        },
        'Normal': {
            color: 'yellow'
        },
        'Hard': {
            color: 'orange'
        },
        'Very Hard': {
            color: 'orange'
        }
    }[type];
}

function getProps(node){
    var attrsArray = Array.apply([], node.attributes);
    return attrsArray.reduce((all, one) => {
        all[one.name] = one.value;
        return all;
    }, {});
}

function renderLevels(target){
    var levelNodes = document.querySelectorAll('Level');
    var levelList = Array.apply([], levelNodes);

    var feathersToSpend = document.querySelector('Situation .field input').value;
    var backupParent;
    var targetType;
    if(target){
        var nearestLevel = target.closest('level');
        targetType = nearestLevel.getAttribute('type')
        backupParent = document.createElement('div');
        backupParent.appendChild(target.parentNode);
    }

    levelList.forEach((node, index) => {
        var props = getProps(node);
        var levelType = props.type;
        var attrs = attrsFromLevelType(levelType);
        node.addEventListener('updateModel',
            function (e) { /* ... */
                console.log(`--- update ${levelType} level node: ${e.data}`);
            },
        false);

        if(target && targetType !== props.type){
            return;
        }

        // TODO: probably better to just replace fields that will change!!
        node.innerHTML = `
            <div class="${attrs.color} cell">
                <svg>
                    <use xlink:href="#icon-hex-${attrs.color}"></use>
                </svg>
                <span class="${levelType.length > 6 ? 'limited' : '' }">${levelType}</span>
            </div>
            <fieldsContainer></fieldsContainer>
        `;

        var fieldsContainer = node.querySelector('fieldsContainer');

        var chanceField;
        if(targetType === props.type){
            chanceField = target.parentNode;
        }
        if(!chanceField){
            chanceField = document.createElement('div');
            chanceField.className = 'field chance';
            chanceField.innerHTML = `
                <label class="highlight label">Chance</label>
                <input tabindex=${101} type="number" min="0.010" max="3.000" step="0.001" value="${props.chance}"></input>
            `;
        }
        chanceField.oninput = (e) => {
            node.setAttribute('chance', e.target.value);
            renderLevels(e.target);
        };

        var chance500Field = document.createElement('div');
        chance500Field.className = 'field';
        chance500Field.innerHTML = `
            <input disabled tabindex=${0} value="${(2 * props.chance).toFixed(4)}"></input>
            <label>P500</label>
        `;

        var chance1000Field = document.createElement('div');
        chance1000Field.className = 'field';
        chance1000Field.innerHTML = `
            <input disabled tabindex=${0} value="${(3 * props.chance).toFixed(4)}"></input>
            <label>P1000</label>
        `;

        var seperator = document.createElement('div');
        seperator.className = 'seperator';
        var tries = Math.floor(feathersToSpend / props.feathers);
        var feathersField = document.createElement('div');
        feathersField.className = 'field';
        feathersField.innerHTML = `
            <input disabled tabindex=${0} value="${tries}" class="highlight"></input>
            <label>Attempts</label>
            <input disabled tabindex=${0} value="${props.feathers}"></input>
            <label>Cost</label>
        `;

        var resultsField = document.createElement('div');
        resultsField.className = 'field';
        var results = Math.floor(props.chance * tries);
        resultsField.innerHTML = `
            <label class="highlight">Results</label>
            <input disabled tabindex=${0} value="${results}"></input>
            <label>P1</label>
        `;

        var results500Field = document.createElement('div');
        results500Field.className = 'field';
        var results500 = Math.floor(2 * props.chance * tries);
        results500Field.innerHTML = `
            <input disabled tabindex=${0} value="${results500}"></input>
            <label>P500</label>
        `;

        var results1000Field = document.createElement('div');
        results1000Field.className = 'field';
        var results1000 = Math.floor(3 * props.chance * tries);
        results1000Field.innerHTML = `
            <input disabled tabindex=${0} value="${results1000}"></input>
            <label>P1000</label>
        `;

        fieldsContainer.appendChild(chanceField);
        if(target && targetType === props.type){
            target.focus();
        }
        fieldsContainer.appendChild(chance500Field);
        fieldsContainer.appendChild(chance1000Field);
        fieldsContainer.appendChild(seperator);
        fieldsContainer.appendChild(feathersField);
        fieldsContainer.appendChild(seperator.cloneNode());
        fieldsContainer.appendChild(resultsField);
        fieldsContainer.appendChild(results500Field);
        fieldsContainer.appendChild(results1000Field);

    });
}

function reseed(it, tries){
    var r = new Array(Number(it)).fill();
    r = r.map(x =>
        new Array(tries).fill()
            .map(y => [Math.random, Math.random,Math.random])
    );
    //console.log(r[0])
    return r;
}

function domToObject(fromNode){
    var idOrClass = fromNode.id
        ? fromNode.id
        : fromNode.classList && fromNode.classList.value;

    var name = idOrClass
        ? idOrClass
        : fromNode.nodeName.toLowerCase();

    var obj = { name };
    if(typeof fromNode.value !== 'undefined'){
        obj.value = fromNode.value;
    }

    if(name === '#text'){
        obj.value = (fromNode.nodeValue||'').trim();
        if(!obj.value){
            return;
        }
    }
    if([
        'h1', 'h2', 'h3', 'h4', 'h5', 'highlight label', 'label', 'span'
    ].includes(name)){
        obj.value = fromNode.innerText;
        return obj;
    }

    if(fromNode.childNodes.length){
        var children = Array.from(fromNode.childNodes).map(domToObject);

        (children || []).forEach(x => {
            if(!x || typeof x === 'undefined' || !x.name){
                return;
            }
            var name = x.name;
            delete x.name;

            if(x.value){
                obj[name] = x.value;
                return
            }

            if(!obj[name]) {
                obj[name] = x;
                return;
            }
            if(Array.isArray(obj[name])){
                obj[name].push(x);
                return;
            }
            obj[name] = [ obj[name], x ];
        });
    }

    return obj;
}

function renderSituation(){
    var situationNode = document.querySelector('Situation');
    var props = getProps(situationNode);

    var veryEasyCost = getProps(
        document.querySelector('Level[type="Very Easy"]')
    ).feathers;
    var maxTries = Math.floor(props.feathers / veryEasyCost);
    //reseed(props.iterations, maxTries);

    situationNode.innerHTML = `
        <h4>Situation</h4>
        <div class="field">
            <input type"number" value="${props.feathers}" step=1></input>
            <label>Feathers To Spend</label>
            <button>Reseed</button>
        </div>
    `;

    situationNode.querySelector('.field input').oninput =
        // (e) => updatePage(e);
        (e) => {
            reseed(0, 0);
            //should store seed in localStorage
            renderLevels();
        };
    situationNode.querySelector('.field button').onclick =
        // (e) => updatePage(e);
        (e) => {
            reseed(0, 0);
            //should store seed in localStorage
            renderLevels();
        };
    situationNode.addEventListener('updateModel',
        function (e) { /* ... */
            console.log('--- update situation node: ', e.data);
        },
    false);
}

function clone(o){
    return JSON.parse(JSON.stringify(o));
}

function updatePageModel(event){
    var pageModel = clone({
        initialized: false,
        LevelList: {
            model: {
                attempts: 0,
                cost: 0,
                results: {
                    'P1': {
                        low: 0,
                        high: 0
                    },
                    'P500': {
                        low: 0,
                        high: 0
                    },
                    'P1000': {
                        low: 0,
                        high: 0
                    },
                }
            },
            types: [
                'Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'
            ]
        },
        Situation: {
            feathers: 0,
            iterations: 0
        },
        meta: {
            maxTries: 0,
            lowestCost: 0,
            highestCost: 0,
        },
        randomSeed: {
            opts: {},
            values: []
        }
    });

    pageModel.LevelList = pageModel.LevelList.types.reduce(list, type => {
        var level = clone(pageModel.LevelList.model);
        level.type = type;
        list[type] = level;
        return list;
    }, {});

    // TODO: get values for model from page

    // change page model based on (except) event.target
    return pageModel;
}

function applyPageModel(model, event){
    // set all values of page elements(except event.target) based on model
    var event = new Event('updateModel');
    event.data = 'foo';
    var situationNode = document.querySelector('Situation');
    situationNode.dispatchEvent(event);
}

function updatePage(event){
    var model = updatePageModel(event);
    applyPageModel(model, event)
}

function setupPage(){
    renderSituation();
    renderLevels();
    applyPageModel();
}