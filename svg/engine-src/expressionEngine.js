const filtrex = require('filtrex');
window.filtrex = filtrex;
const { compileExpression } = filtrex;

const customFunctions = require('./customFunctions');

const handleDelay = 0;

function ExpressionEngine({ emitStep, currentNode } = {}) {
    var compile = (exp, custFn, maxFails) => {
        var fails = 0;
        // return a function that will continuosly compile and run (as promises resolve) until true
        // each custom function should be wrapped so that it will return true only if resolved
        // as promises are resolved, compile/run is ran

        /*
            each line of overall function should be split into its own function
                ^^^ (with promise returned ?)
            ideally, each custom function call should act this way (not just program lines)
            ideally, adding a custom function should not involve also writing this kind of handler

            currently, its reasonably difficult to add custom functions in this way
        */

        function propFunction(
            propertyName, // name of the property being accessed
            get, // safe getter that retrieves the property from obj
            obj // the object passed to compiled expression
        ) {
            if (propertyName === 'null') {
                return null;
            }
            if (propertyName === 'undefined') {
                return undefined;
            }
            if (propertyName.includes('unit:')) {
                return propertyName.replace('unit:', '');
            }
            const [func, index, prop, prop2] = propertyName.split('.');
            const supportedCommands = Object.keys(custFn);
            //console.log({ func, index, path, supportedCommands })

            if (supportedCommands.includes(func)) {
                //console.log({ func, index, prop })
                var res = undefined;
                try {
                    res = custFn.promises.filter(x => x.func === func)[index].result[prop];
                    if (prop2) {
                        res = res[prop2];
                    }
                } catch (e) { }
                return res;
                //console.log(custFn.promises.filter(x => x.func === func));
            }
        }

        var myFunc = undefined;
        function compiled(data, callback) {
            // promise are reset after finished state
            const beginRun = custFn.promises.length === 0;
            if (beginRun) {
                custFn.bindInput(data);
            }
            myFunc = myFunc || compileExpression(
                exp,
                custFn,
                propFunction
            );

            const result = myFunc(data);
            //console.log({ promises: custFn.promises });

            const asyncError = custFn.promises
                .map(x => x.error).find(x => x);
            const mappingError = false && mappedItems
                .map(x => x.error).find(x => x);

            const tooManyFails = fails > maxFails
                ? `Maximum failures exceeded: ${maxFails}`
                : undefined;

            const finished = result
                || asyncError
                || mappingError
                || tooManyFails;
            //console.log({ result, asyncError, mappingError })

            if (finished) {
                emitStep && emitStep({
                    name: 'end'
                });
                custFn.reset();
                //myFunc = undefined;

                /*
                    TODO: wish this worked
                    the idea is that wrapped state should be reset when script has finished
                    this seems to not be the case
                */
                if (!callback) {
                    return;
                }
                const results = mappedItems.length > 0 || custFn.promises.length > 0
                    ? {
                        map: mappedItems,
                        fetch: custFn.promises
                    }
                    : undefined;

                callback(
                    asyncError || mappingError || tooManyFails,
                    results || result
                );
                return;
            }

            //RETRYING
            const dataFromMap = {
                TODO: 'add mapped data'
            };
            const dataPlusMapped = Object.assign({}, data, dataFromMap);

            const firstUnresolved = custFn.promises.find(x => !x.result);
            if (!firstUnresolved) {
                //console.log('--- no unresolved promises, will call');
                fails++;
                compiled(dataPlusMapped, callback);
                return;
            }
            //console.log(firstUnresolved.func)
            firstUnresolved.promise
                //.then(sleeper(firstUnresolved.func === 'send' ? 3000 : 0))
                .then(x => {
                    //console.log('--- unresolved promise found, attaching');
                    //console.log({ x });
                    compiled(dataPlusMapped, callback);
                });
        };

        return (data, callback) => {
            emitStep && emitStep({
                name: 'start'
            });
            compiled(data, callback);
        };
    };

    //TODO: expose customFunctions? and maxFails to browser
    var maxFails = 20;
    const expressionEngine = (exampleExpression, verbose) => {
        // // rip data from original expression
        // const ripped = {
        //     data: {},
        //     exp: ''
        // }

        // const extractFuncRegex = /\b[^()]+\((.*)\)$/;
        // const extractArgsRegex = /([^,]+\(.+?\))|([^,]+)/;

        // const expLines = exampleExpression.split('\n');
        // expLines.forEach(line => {
        //     const func = line.match(extractFuncRegex);
        //     const args = line.match(extractArgsRegex);
        //     (func && args) && console.log({ func, args })
        // });

        const ex = exampleExpression
            .trim()
            .split('\n')
            .join(' and ')
            .replace(/\s\s+/g, ' ');

        if (verbose) { console.log('EXPRESSION: ' + exampleExpression); }

        return compile(ex, customFunctions(emitStep, currentNode), maxFails);
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
function Environment({ units = [], links = [], verbose } = {}) {

    const mapUnitToCompiled = (n, { control }) => {
        var { handle, start } = n;
        // TODO: bind handlers to umvelt (because outside world should know about steps, ie. emit)
        const emitStep = (data) => {
            const dataWithUnitInfo = { src: n, ...data };
            control('emit-step', dataWithUnitInfo);
        };

        const currentNode = n.label;
        handle = handle && new ExpressionEngine({ emitStep, currentNode })(handle, verbose);
        start = start && new ExpressionEngine({ emitStep, currentNode })(start, verbose);
        const fns = { handle, start };
        Object.keys(fns).forEach(p => {
            !fns[p] && delete fns[p];
        });
        return Object.assign(n, { ...fns });
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
            this.start = (state) => _fakeRun.bind(this)(state, context);

            // this is for internal signals
            //this.control = (key, data) => _control.bind(this)(context, key, data);
            this.control = (key, data) => {
                _gameLoop(_control.bind(this), context, key, data);
            };
            context.units = compiledUnits(this);
            //console.log({ compiledUnits });
        }

        return Umvelt;
    })();

    class Loop {
        constructor() {
            this.items = [];
            this.delay = 3000;
            this.width = 1;
            this.start();
        }
        isEmpty(){
            return this.items.length == 0;
        }
        add(element){
            // todo: priority
            if(Array.isArray(element)){
                [].push.apply(this.items, element);
                return;
            }
            this.items.push(element);
        }
        // maybe remove multiple items at a time?
        remove(){
            if(this.isEmpty()){
                return undefined;
            }
            return this.items.shift();
        }
        process(){
            const item = this.remove();
            if(!item){
                return;
            }
            if(item.log){
                console.log(item.log);
            }
            item();
        }
        //TODO: pause/resume
        start(){
            this.interval = setInterval(this.process.bind(this), this.delay);
        }
    }

    //const loopEvents = ['start', 'end', 'send', 'ack'];
    function _gameLoop(controller, context, key, data){
        const {
            name, targets, message, listener, status, src, result
        } = data;

        // reject some events ???
        // if(!loopEvents.includes(name)){
        //     return;
        // }

        // create queue if not created
        context.loop = context.loop || new Loop();

        // queue event
        const event = () => controller(context, key, data);
        //event.log = `${name.toUpperCase()}:${status}`;
        //console.log(`ACK:${status} [${_message}] ${_targets.join(' ,')} -> ${src.label}`);
        //console.log(`SEND [${data.message}] ${data.src.label} -> ${targets.join(' ,')}`);
        context.loop.add(event)
    }

    function _control(context, key, data) {
        const {
            name, targets, message, listener, status, src, result
        } = data;
        //console.log({ context, key, data, engine: this });

        //TODO: if send/ack from one compiled script then
        //  - TODO: activate link (send message to UI for link)
        //  - DONE: notify other compiled script
        //  - ...

        const emitUnitsUpdate = (updates) => {
            // TODO: guard: updates is array, each item has label and state
            const action = 'units-change'
            this.emit(action, updates);
        };
        const emitLinksUpdate = (updates) => {
            // TODO: guard: updates is array, each item has label and state
            const action = 'links-change'
            this.emit(action, updates);
        };

        if (name === 'ack' && status === 'start') {
            var _targets = targets;
            var _message = message;
            if (!_targets && result) {
                _targets = result.targets;
            }
            if (!_message && result) {
                _message = result.message;
            }
            //console.log(`ACK:${status} [${_message}] ${_targets.join(' ,')} -> ${src.label}`);

            const linkUpdates = context.state.links
                .map(x => {
                    const update = {
                        label: x.label,
                        state: 'no_update'
                    };

                    if (x.start.parent.block === src.label) {
                        if (!_targets.includes(x.end.parent.block)) {
                            return update;
                        }
                        update.state = 'send';
                    } else if (x.end.parent.block === src.label) {
                        if (!_targets.includes(x.start.parent.block)) {
                            return update;
                        }
                        update.state = 'receive';
                    }
                    return update;
                })
                .filter(x => x.state !== 'no_update');
            //console.log({ links: linkUpdates, src, targets })
            emitLinksUpdate(linkUpdates);
            return;
        }

        if (name === 'start' && !status) {
            emitUnitsUpdate([{
                label: src.label,
                state: 'active'
            }]);
            return;
        }

        if (name === 'end' && !status) {
            emitUnitsUpdate([{
                label: src.label,
                state: 'success'
            }]);
            return;
        }

        this.emit(key, data)

        if (name === 'send') {
            /*
                TODO: also need to handle ack!
            */
            if (data.status === 'error') {
                //debugger;
            }

            if (data.status === 'start') {
                emitUnitsUpdate([{
                    label: src.label,
                    state: 'wait'
                }]);
            }
            var _targets = targets;
            if (result && result.nodesDone) {
                _targets = result.nodesDone.map(x => x.label);
            }
            if (!_targets) {
                console.log('UNHANDLED: situation in engine handling send message')
                debugger
                return;
            }
            const linkUpdates = context.state.links
                .map(x => {
                    const update = {
                        label: x.label,
                        state: 'no_update'
                    };

                    if (x.start.parent.block === src.label) {
                        if (!_targets.includes(x.end.parent.block)) {
                            return update;
                        }
                        update.state = data.status === 'start'
                            ? 'send'
                            : data.status;
                    } else if (x.end.parent.block === src.label) {
                        if (!_targets.includes(x.start.parent.block)) {
                            return update;
                        }
                        update.state = 'start'
                            ? 'receive'
                            : data.status;
                    }
                    if (update.state === 'error') {
                        update.state = 'fail';
                        update.data = data;
                    }
                    return update;
                })
                .filter(x => x.state !== 'no_update');
            //console.log({ links: linkUpdates, src, targets })
            emitLinksUpdate(linkUpdates);
        }

        if (name === 'send' && targets) {
            //console.log(`SEND [${data.message}] ${data.src.label} -> ${targets.join(' ,')}`);
            const targetUnits = targets.map(label => {
                return context.units.find(u => u.label === label && u.handle);
            }).filter(x => !!x);

            if (targetUnits.length !== targets.length) {
                listener({ error: 'cannot find all nodes or handlers', data: { targetUnits } });
                return;
            }

            //TODO: sending unit must have link to receiver unit, otherwise error

            //TODO: add function to remove listener
            const { remove } = this.on('emit-step', (data) => {
                listener({ data, removeListener: remove });
            });
            targetUnits.forEach(u => setTimeout(() => u.handle({
                sendFrom: data.src.label,
                sendMessage: data.message
            }), handleDelay));
        }
    }

    function _on(context, key, callback) {
        if (context.eventListeners[key] === undefined) {
            context.eventListeners[key] = [];
        }
        callback._hash = [...Array(30)].map(() => Math.random().toString(36)[2]).join('');
        context.eventListeners[key].push(callback);
        const remove = () => {
            context.eventListeners[key] = context.eventListeners[key]
                .filter(x => x._hash !== callback._hash);
        };
        return { remove };
    }

    function _emit(context, key, data) {
        //console.log({ key });
        if (!context.eventListeners[key]) {
            //debugger;
            console.log(' listener not registered');
            console.log({ listeners: context.eventListeners, key });
            return;
        }
        context.eventListeners[key].forEach(listener => {
            listener(data);
        });
        return;
    }

    function strangeCase() {
        const unitsPulsing = document.querySelectorAll('.box.pulse');

        if (unitsPulsing.length !== 1) {
            return;
        }

        const unitsWaiting = document.querySelectorAll('.box.wait');
        if (unitsWaiting.length !== 0) {
            return
        }
        const linksSelected = document.querySelectorAll('.link.selected').length;
        if (linksSelected !== 1) {
            return;
        }

        debugger;
    }

    function _fakeRun(state, context) {
        context.state = state;

        const fake = false;
        if (!fake) {
            const unitsWithStartHandlers = context.units.filter(x => x.start);
            //console.log({ unitsWithStartHandlers });

            setTimeout(() => {
                unitsWithStartHandlers.forEach(x => x.start());
            }, 2000);

            return;
        }

        const longDelay = 2000;
        const shortDelay = 50;
        const events = (current, next, link) => [
            `units-change|${state.units[current].label}|active|${2 * longDelay}`, //process
            `units-change|${state.units[current].label}|wait|${shortDelay}`, //send data
            `links-change|${state.links[link].label}|send|${longDelay}`, // link start
            `units-change|${state.units[next].label}|active|${shortDelay}`, // receiver ack
            `links-change|${state.links[link].label}|receive|${longDelay}`, // link wait
            `links-change|${state.links[link].label}|success|${shortDelay}`, // link drop
            `units-change|${state.units[current].label}|success|${0.5 * longDelay}`, //send ack
            //`units-change|${state.units[next].label}|success|0`, // receiver done
        ];
        const eventsAll = [
            ...events(0, 1, 0),
            ...events(1, 2, 1),
            ...events(2, 0, 2)
        ];

        const eventsPromises = eventsAll.map(e => {
            const [action, label, state, time] = e.split('|');
            const getPromise = () => new Promise((resolve, reject) => {
                const fn = () => {
                    if (strangeCase()) {
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

        const promiseSeries = function (tasks, callback) {
            return tasks.reduce((promiseChain, currentTask) => {
                return promiseChain.then(chainResults =>
                    currentTask().then(currentResult =>
                        [...chainResults, currentResult]
                    )
                );
            }, Promise.resolve([])).then(callback);
        };

        var count = 0;
        const doAll = () => {
            promiseSeries(eventsPromises, (all) => {
                console.log(`--- fake engine: iteration ${++count} done`);
                if (count >= 10) {
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