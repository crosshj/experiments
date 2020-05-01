const fs = require('fs');

const safeAccess = (fn, except) => {
    var output;
    try {
        output = fn();
    } catch (e) {
        if (except){
            try {
                output = except(e);
            } catch(err) {
                /* do nothing */
            }
        }
    }
    return output;
};

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
    var cloned = safeAccess(() =>
        JSON.parse(JSON.stringify(item))
    );
    return cloned;
};

const tryParse = (input) => {
    return safeAccess(() => JSON.parse(input));
}

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

module.exports = {
    clone,
    ensureRequireJSON,
    logNice,
    quickSave,
    unique,
    propsMap,
    safeAccess,
    tryParse
};
