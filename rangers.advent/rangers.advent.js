
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

function render(target){
    var levelNodes = document.querySelectorAll('Level');
    var levelList = Array.apply([], levelNodes);

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
                <input tabindex=${101} min="0.01" max="1.00" step="0.01" value="${props.chance}"></input>
            `;
        }
        chanceField.oninput = (e) => {
            node.setAttribute('chance', e.target.value);
            render(e.target);
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

        var feathersField = document.createElement('div');
        feathersField.className = 'field';
        feathersField.innerHTML = `
            <input disabled tabindex=${0} value="${props.feathers}"></input>
            <label>Try Cost</label>
        `;

        fieldsContainer.appendChild(chanceField);
        if(target && targetType === props.type){
            target.focus();
            debugger;
        }
        fieldsContainer.appendChild(chance500Field);
        fieldsContainer.appendChild(chance1000Field);
        fieldsContainer.appendChild(seperator);
        fieldsContainer.appendChild(feathersField);
    });
}

function setupPage(){
    render();
}