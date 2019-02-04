
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
                <label>Chance</label>
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
            <input disabled tabindex=${0} value="${(2 * props.chance).toFixed(3)}"></input>
            <label>P500</label>
        `;

        var chance1000Field = document.createElement('div');
        chance1000Field.className = 'field';
        chance1000Field.innerHTML = `
            <input disabled tabindex=${0} value="${(3 * props.chance).toFixed(3)}"></input>
            <label>P1000</label>
        `;

        var seperator = document.createElement('div');
        seperator.className = 'seperator';
        var tries = Math.floor(feathersToSpend / props.feathers);
        var feathersField = document.createElement('div');
        feathersField.className = 'field';
        feathersField.innerHTML = `
            <input disabled tabindex=${0} value="${tries}"></input>
            <label>Attempts</label>
            <input disabled tabindex=${0} value="${props.feathers}"></input>
            <label>Cost</label>
        `;

        var resultsField = document.createElement('div');
        resultsField.className = 'field';
        var results = Math.floor((1 * props.chance).toFixed(3) * tries);
        resultsField.innerHTML = `
            <label>Results</label>
            <input disabled tabindex=${0} value="${results}"></input>
            <label>P1</label>
        `;

        var results500Field = document.createElement('div');
        results500Field.className = 'field';
        var results500 = Math.floor((2 * props.chance).toFixed(3) * tries);
        results500Field.innerHTML = `
            <input disabled tabindex=${0} value="${results500}"></input>
            <label>P500</label>
        `;

        var results1000Field = document.createElement('div');
        results1000Field.className = 'field';
        var results1000 = Math.floor((3 * props.chance).toFixed(3) * tries);
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

function renderSituation(){
    var situationNode = document.querySelector('Situation');

    situationNode.innerHTML = `
        <h4>Situation</h4>
        <div class="field">
            <input type"number" value="${situationNode.getAttribute('feathers')}" min=1 max=9999 step=1></input>
            <label>Feathers To Spend</label>
        </div>
    `;
    situationNode.querySelector('.field input').oninput = (e) => {
        renderLevels();
    };
}

function setupPage(){
    renderSituation();
    renderLevels();
}