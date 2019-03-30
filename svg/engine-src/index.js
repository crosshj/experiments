const { compileExpression } = require('filtrex');
/*
    other API ideas:
    - delay, wait for net, wait for message
    - different types of messages (on)
    - switch
    - affect unit color, dimensions, etc
    - affect link color
    - add node to unit, remove/disable link/node
    - disable node, sleep node, set node state
    - create connection
    - cache / memory
*/

function expressionEngine() {
    //TODO: maybe check if node versus browser better
    const fetch = typeof window !== 'undefined' && window.fetch
        ? window.fetch
        : () => new Promise(function(resolve, reject){
            // maybe use request here so this works in node
            resolve();
         });

    const DONE = true;
    const WAITING = false;
    const FAILED = false;

    const promiseQueue = [];
    function _fetch(url) {
        var queued = promiseQueue.find(x => x.name === url);
        if (queued && queued.error) {
            //console.log(`queued error: ${!!queued.error}`);
            return FAILED;
        }
        if (queued && queued.result) {
            //console.log(`queued result: ${!!queued.result}`);
            return DONE;
        }

        //console.log('queued, waiting');
        queued = new function QueueItem() {
            this.name = url;
            this.result = undefined;
            this.error = undefined;
            this.promise = fetch(url)
                //TODO: reject status errors?
                .then(x => x.text())
                .then(t => {
                    const result = tryParse(t) || { error: 'failed to parse' }
                    if (result.error) {
                        throw result.error;
                    }
                    this.result = result;
                })
                .catch(e => {
                    this.error = e;
                });
        };
        promiseQueue.push(queued);
        return WAITING;
    }

    const mappedItems = [];
    function _map(mapper, input, output) {
        var mapped = mappedItems.find(x => x.name === output);
        if (mapped) {
            return mapped.error
                ? FAILED
                : DONE;
        }

        //if input is url, get result from promiseQueue
        //TODO: if not??
        const queued = promiseQueue.find(x => x.name === input);
        if (!queued) {
            mappedItems.push({
                name: output,
                result: '',
                error: 'could not find input source for mapping'
            });
            return FAILED;
        }
        const inputValue = queued.result;

        //output is a string to be used as name for variable
        // ^^^ these variables will be bound to /called with later iterations
        var mapping;
        var mappingError;
        try {
            //TODO: what if mapper is not a function?
            //TODO: mapper syntax (use sop?)
            mapping = mapper(inputValue);
        } catch (e) {
            mappingError = e;
        }
        const mappedItem = {
            name: output,
            result: mapping,
            error: mappingError
        };
        mappedItems.push(mappedItem);

        // console.log({
        //     mapper, input, output, inputValue
        // });
        return mappedItem.error
            ? FAILED
            : DONE;
    }

    function _send(value, nodes) {
        //test if array, wrap in array if not
        //TODO:
        //console.log('send ran');
        return DONE;
    }

    const customFunctions = {
        fetch: _fetch,
        map: _map,
        send: _send
    };

    var compile = (exp, custFn, maxFails) => {
        var fails = 0;
        // return a function that will continuosly compile and run (as promises resolve) until true
        // each custom function should be wrapped so that it will return true only if resolved
        // as promises are resolved, compile/run is ran
        function compiled(data, callback) {
            var myFunc = compileExpression(
                exp,
                custFn
            );

            const result = myFunc(data);

            const fetchingError = promiseQueue
                .map(x => x.error).find(x => x);
            const mappingError = mappedItems
                .map(x => x.error).find(x => x);

            const tooManyFails = fails > maxFails
                ? `Maximum failures exceeded: ${maxFails}`
                : undefined;

            const finished = result
                || fetchingError
                || mappingError
                || tooManyFails;
            //console.log({ result, fetchingError, mappingError })

            if (finished) {
                const results = mappedItems.length > 0 || promiseQueue.length > 0
                    ? {
                        map: mappedItems,
                        fetch: promiseQueue
                    }
                    : undefined;

                callback(
                    fetchingError || mappingError || tooManyFails,
                    results
                );
                return;
            }

            //RETRYING
            const dataFromMap = {
                TODO: 'add mapped data'
            };
            const dataPlusMapped = Object.assign({}, data, dataFromMap);

            const firstUnresolved = promiseQueue.find(x => !x.result);
            if (!firstUnresolved) {
                //console.log('--- no unresolved promises, will call');
                fails++;
                compiled(dataPlusMapped, callback);
                return;
            }
            firstUnresolved.promise.then(x => {
                //console.log('--- unresolved promise found, attaching');
                compiled(dataPlusMapped, callback);
            });
        };

        return compiled;
    };


    // SIMPLE EXAMPLE
    // var myfilter = compileExpression(
    //     'strlen(firstname) > 5',
    //     { strlen: s => s.length }); // custom functions

    // console.log(myfilter({ firstname: 'Joe' }));    // returns 0
    // console.log(myfilter({ firstname: 'Joseph' })); // returns 1


    //TODO: expose customFunctions? and maxFails to browser
    var maxFails = 50;
    const expressionEngine = (exampleExpression, verbose) => {
        const ex = exampleExpression
            .trim()
            .split('\n')
            .join(' and ')
            .replace(/\s\s+/g, ' ');

        if(verbose) { console.log('EXPRESSION: ' + exampleExpression); }

        return compile(ex, customFunctions, maxFails);
    };

    if(typeof window === 'undefined'){
        console.log('node version not implemented (much), but...\n');
        const api = 'fake';
        const fakeUrl = 'https://www.fake.com';
        const exampleExpression = `
            fetch(${api}Url)
            map(${api}Map, ${api}Url, "${api}Map")
            send(${api}MapValue, 2)
            send(${api}MapValue, 1)
        `;
        const fakeData = {
            [`${api}Url`]: fakeUrl,
            [`${api}Map`]: (data) => data.value || data.activity
        };
        const fakeCallback = (err, data) => {
            try {
                console.log(`... all do-nothing promises are resolved.`);
            } catch (e) { }
        };
        const showFuncs = (key, val) => (typeof val === 'function') ? '[function]' : val;
        console.log(JSON.stringify({ fakeData, fakeCallback }, showFuncs, 4));

        const myFunc = expressionEngine(exampleExpression, true);
        myFunc(fakeData, fakeCallback);
    }
    return expressionEngine;
}

module.exports = expressionEngine();
