
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

function transformLevelElements(){
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
                <span>${levelType}</span>
            </div>
            <fieldsContainer>
                <div class="field">
                    <input tabindex=${101} min="0.01" max="1.0" step="0.01" value="${props.chance}"></input>
                    <label>Chance</label>
                </div>
            </fieldsContainer>
        `;
    });
}

function setupPage(){
    transformLevelElements();
}