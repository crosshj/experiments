const { compileExpression } = require('filtrex');

/*
    TODO:
    - make more OO
    - pull out keywords from main object

    other API/keyword ideas:
    - delay, wait for net, wait for message
    - different types of messages (.on)
    - switch
    - affect unit color, dimensions, etc
    - affect link color
    - add node to unit, remove/disable link/node
    - disable node, sleep node, set node state
    - create connection, create unit
    - cache / memory
*/

function ExpressionEngine({ emitStep } = {}) {
    //TODO: maybe check if node versus browser better
    const fetch = typeof window !== 'undefined' && window.fetch
        ? window.fetch
        : () => new Promise(function (resolve, reject) {
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
        //console.log('custom function [send] ran');
        return DONE;
    }

    function _ack(value, nodes) {
        //test if array, wrap in array if not
        //TODO:
        console.log('custom function [ack] ran');
        return DONE;
    }

    const customFunctions = {
        ack: _ack,
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

            emitStep && emitStep({ name: 'TODO', status: 'not sure about this yet'});

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
                    results || result
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

        if (verbose) { console.log('EXPRESSION: ' + exampleExpression); }

        return compile(ex, customFunctions, maxFails);
    };

    if (typeof window === 'undefined') {
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

//module.exports = expressionEngine();
export const compile = ExpressionEngine();

// -----------------------------------------------------------------------------

// function WebWorker(fn) {
//     const fnString = `(function(){
//         onmessage = function(event) {
//             const results = ${fn.name}(event.data);
//             postMessage(results);
//         }
//         ${fn.toString()}
//     })()`;
//     const worker = new Worker(URL.createObjectURL(new Blob([fnString])));

//     const wrapped = function(args, cb){
//         worker.onmessage = function (e){
//             cb(e.data);
//         }
//         worker.postMessage(args);
//     };
//     wrapped.close = worker.terminate;
//     wrapped.worker = worker;

//     return wrapped;
// }

//TODO: would be nice to leverage WebWorkers for this
// ^^ bigger task than can be handled now
// ^^ maybe load this entire file in worker -https://github.com/webpack-contrib/worker-loader
// ^^ but would be really nice if each unit became a worker...

/*

purpose:

A) run an environment (and PAUSE execution?)
B) notify about environment

run an environment:
- input a definition for an environment consisting of units and links.
- compile all start functions, handler functions defined
- on start, run all start functions
- when a send or ack occurs, activate link it occurs on and run handler for unit on that link
- on ack, resolve handler for sending link
- if not ack within timeout period, consider handler failed

notify about environment:
    links-change: send, receive, fail, success,
    units-change: active (progress?), wait, success, fail
*/
function Environment({ units = [], links = [] }) {
    const mapUnitToCompiled = (n, { emit }) => {
        var { handle, start } = n;
        // TODO: bind handlers to umvelt (because outside world should know about steps, ie. emit)
        const emitStep = (data) => {
            emit('emit-step', data);
        };

        handle = new ExpressionEngine({ emitStep })(handle /*, true*/);
        start = start && new ExpressionEngine({ emitStep })(start /*, true*/);
        const fns = { handle, start };
        Object.keys(fns).forEach(p => {
            !fns[p] && delete fns[p];
        });
        return Object.assign(n, {...fns});
    };
    const compiledUnits = (umvelt) => units.map((u) => mapUnitToCompiled(u, umvelt));

    /*
        also considered using "bailiwick" and "umbgebung"
        https://en.wikipedia.org/wiki/Umwelt
        basically means something like "around world", but don't take my word for it
        https://yourdailygerman.com/um-german-prefix-meaning/ + velt(world)
        "umvelt" is easier to type than "environment" (v instead of w to aid mental pronounce)
    */
    const Umvelt = (function () {
        const context = {
            units: undefined,
            links,
            eventListeners: {}
        };

        function Umvelt() {
            this.on = (key, callback) => _on(context, key, callback);
            this.emit = (key, data) => _emit.bind(this)(context, key, data);
            this.start = (state) => _fakeRun.bind(this)(state);

            context.units = compiledUnits(this);
            //console.log({ compiledUnits });

            const apis = {
                ghibli: 'https://ghibliapi.herokuapp.com/films/?limit=10',
                bored: 'http://www.boredapi.com/api/activity/',
                countRegister: 'https://api.countapi.xyz/hit/boxesandwires/visits',
                countGet: 'https://api.countapi.xyz/get/boxesandwires/visits',
            };
            const api = 'countRegister';

            const dataForScript = {
                [`${api}Url`]: apis[api],
                [`${api}Map`]: (data) => data.value || data.activity
            };

            //testing handler of first unit
            setTimeout(() => {
                context.units[0].handle(dataForScript, (error, data) => {
                    console.log('---- SIMPLE TEST OF UNIT HANDLER: DONE ------');
                    //console.log({ error, data });
                });
            }, 2000);
        }

        return Umvelt;
    })();

    function _on(context, key, callback) {
        if (context.eventListeners[key] === undefined) {
            context.eventListeners[key] = [];
        }
        context.eventListeners[key].push(callback);
    }

    function _emit(context, key, data) {
        //console.log({ key });
        if (!context.eventListeners[key]) {
            debugger;
            console.log(' listener not registered');
            console.log({ listeners: context.eventListeners, key });
            return;
        }
        context.eventListeners[key].forEach(listener => {
            listener(data);
        });
        return;
    }

    function strangeCase(){
        const unitsPulsing = document.querySelectorAll('.box.pulse');

        if(unitsPulsing.length !== 1){
            return;
        }

        const unitsWaiting = document.querySelectorAll('.box.wait');
        if(unitsWaiting.length !== 0){
            return
        }
        const linksSelected = document.querySelectorAll('.link.selected').length;
        if(linksSelected !== 1){
            return;
        }

        debugger;
    }

    function _fakeRun(state){
        const longDelay = 2000;
        const shortDelay = 50;
        const events = (current, next, link) => [
            `units-change|${state.units[current].label}|active|${2*longDelay}`, //process
            `units-change|${state.units[current].label}|wait|${shortDelay}`, //send data
            `links-change|${state.links[link].label}|send|${longDelay}`, // link start
            `units-change|${state.units[next].label}|active|${shortDelay}`, // receiver ack
            `links-change|${state.links[link].label}|receive|${longDelay}`, // link wait
            `links-change|${state.links[link].label}|success|${shortDelay}`, // link drop
            `units-change|${state.units[current].label}|success|${0.5*longDelay}`, //send ack
            //`units-change|${state.units[next].label}|success|0`, // receiver done
        ];
        const eventsAll = [
            ...events(0, 1, 0),
            ...events(1, 2, 1),
            ...events(2, 0, 2)
        ];

        const eventsPromises = eventsAll.map(e => {
            const [ action, label, state, time ] = e.split('|');
            const getPromise = () => new Promise((resolve, reject) => {
                const fn = () => {
                    if(strangeCase()){
                        debugger;
                    }
                    this.emit(action, [{
                        label, state
                    }]);
                    setTimeout(() => {
                        resolve({ action, label, state });
                    }, Number(time));
                };
                fn();
              });
              return getPromise;
        });


        const promiseSeries = function(tasks, callback){
            return tasks.reduce((promiseChain, currentTask) => {
                return promiseChain.then(chainResults =>
                    currentTask().then(currentResult =>
                        [ ...chainResults, currentResult ]
                    )
                );
            }, Promise.resolve([])).then(callback);
        };

        var count = 0;
        const doAll = () => {
            promiseSeries(eventsPromises, (all)=>{
                console.log(`--- fake engine: iteration ${++count} done`);
                if(count >= 10) {
                    console.log('FAKE ITERATION MAX: DONE!');
                    this.emit('units-change', [{
                        label: state.units[0].label,
                        state: 'success'
                    }]);
                    return;
                }
                doAll();
            });
        };
        doAll();


    }

    return new Umvelt();
}

export const engine = Environment;