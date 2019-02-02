
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

function render(){
    var levelNodes = document.querySelectorAll('Level');
    var levelList = Array.apply([], levelNodes);
    levelList.forEach((node, index) => {
        var props = getProps(node);
        var levelType = props.type;
        var attrs = attrsFromLevelType(levelType);
        node.innerHTML = `
            <div class="${attrs.color} cell">
                <svg>
                    <use xlink:href="#icon-hex-${attrs.color}"></use>
                </svg>
                <span class="${levelType.length > 6 ? 'limited' : '' }">${levelType}</span>
            </div>
            <fieldsContainer>
                <div class="field chance">
                    <label>Chance</label>
                    <input tabindex=${101} min="0.01" max="1.00" step="0.01" value="${props.chance}"></input>
                </div>
                <div class="field">
                    <input disabled tabindex=${0} value="${(2 * props.chance).toFixed(3)}"></input>
                    <label>P500</label>
                </div>
                <div class="field">
                    <input disabled tabindex=${0} value="${(3 * props.chance).toFixed(3)}"></input>
                    <label>P1000</label>
                </div>
                <div class="seperator"></div>
                <div class="field">
                    <input disabled tabindex=${0} value="${props.feathers}"></input>
                    <label>Feathers</label>
                </div>
            </fieldsContainer>
        `;
        node.querySelector('fieldsContainer .chance input').oninput = (e) => {
            node.setAttribute('chance', e.target.value);
            render();
        };
    });
}

function setupPage(){
    render();
}