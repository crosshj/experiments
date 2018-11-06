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

const tryParse = (input) => {
    var output;
    try {
        output = JSON.parse(input);
    } catch (e) { /* do nothing */ }
    return output;
}

module.exports = {
    unique,
    quickSave,
    clone,
    propsMap,
    ensureRequireJSON,
    tryParse
};
