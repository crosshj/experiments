const fs = require('fs');


//https://medium.com/tomincode/removing-array-duplicates-in-es6-551721c7e53f

const unique = (arr, prop) => {
    return [...(
        new Set(
            prop
                ? arr.map((x) => x[prop])
                : arr
        )
    )]
};

const quickSave = (data, path) => {
    fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
};

const clone = (item) => {
    var cloned;
    try {
        cloned = JSON.parse(JSON.stringify(item));
    } catch (e) { /* */ }
    return cloned;
};

const propsMap = (object, func) => Object.entries(object)
    .map(func)
    .reduce((all, one) => {
        return { ...all, ...{ [one[0]]: one[1] } };
    }, {});

const logNice = (item) => {
    console.log(JSON.stringify(item, null, '\t'));
};

const ensureRequireJSON = (path) => {
    let json;
    try {
        json = require(path);
    } catch (e) {
        fs.openSync(path, 'w');
    }
    return json;
};

const safeAccess = (fn) => {
    var output;
    try {
        output = fn();
    } catch (e) {
        /* do nothing */
    }
    return output;
};

const tryParse = (input) => {
    return safeAccess(() => JSON.parse(input));
}

module.exports = {
    unique,
    quickSave,
    clone,
    propsMap,
    safeAccess,
    ensureRequireJSON,
    tryParse
};
