/*
    TODO:
    - need a delay for links and compiled function
    - need to verify links for send

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

const funcDelay = 3000;
const ackDelay = 2000;
const sendDelay = 0;

const DONE = true;
const WAITING = false;
const FAILED = false;

function flatPromise() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function sleeper(ms) {
    return function(x) {
        return new Promise(resolve => setTimeout(() => resolve(x), ms));
    };
}

// OMG - https://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise
const isPromise = function (object) {
    return object && typeof object.then === 'function';
};

//TODO: maybe check if node versus browser better
const fetch = typeof window !== 'undefined' && window.fetch
    ? window.fetch
    : () => new Promise(function (resolve, reject) {
        // maybe use request here so this works in node
        resolve();
    });

function _fetch(url) {
    const fetchPromise = fetch(url)
        .then(x => x.text())
        .then(t => {
            const result = tryParse(t);
            if (!result) {
                throw new Error('failed to parse');
            }
            return result;
        });

    return fetchPromise;
}

const mappedItems = [];
function _map(mapper, input, output) {
    //console.log('custom function [map] ran');
    var mapped = mappedItems.find(x => x.name === output);
    if (mapped) {
        return mapped.error
            ? FAILED
            : DONE;
    }

    //if input is url, get result from promiseQueue
    //TODO: if not??
    //const queued = promiseQueue.find(x => x.name === input);
    const queued = false;
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

function _send(message, nodes, timeout = 10000) {
    //console.log(arguments)
    //console.log('custom function [send] ran');
    //test if array, wrap in array if not
    //TODO:

    const { resolve, reject, promise: p } = new flatPromise();

    var nodesArray = Array.isArray(nodes)
        ? nodes
        : [nodes];

    var timer = undefined;
    const nodesDone = nodesArray.map(label => ({ label, done: false }));
    const listener = ({ data = {}, removeListener, error } = {}) => {
        timer = timer || setTimeout(() => {
            removeListener && removeListener();
            reject({
                message: 'send not acknowledged within time limit',
                nodesDone
            });
        }, timeout);

        if (error) {
            clearTimeout(timer);
            timer = undefined;
            removeListener && removeListener();
            reject({
                message: 'send error occured',
                error, nodesDone
            });
            return;
        }

        // only handle ack events
        const isAck = data.name === 'ack';
        if (!isAck) {
            return;
        }

        // mark a node as done
        const foundNode = nodesDone.find(n => n.label === data.src.label);
        foundNode && (foundNode.done = true);

        // should listen for ack from all nodes
        const unfinishedNodes = nodesDone.find(n => !n.done);
        if (!unfinishedNodes) {
            clearTimeout(timer);
            removeListener && removeListener();
            setTimeout(() => {
                resolve({
                    message: 'all send\'s ack\'ed',
                    nodesDone
                });
            }, sendDelay);
        }
    };

    const sendPromise = p;
    sendPromise.listener = listener;
    sendPromise.targets = nodesArray;
    sendPromise.message = message;

    return sendPromise;
}

function _ack(sender, target, message) {
    const { resolve, reject, promise: p } = new flatPromise();

    /*
        TODO: should maybe send an ack message the way that _send does
    */

    const ackPromise = p;
    setTimeout(() => {
        if(sender && typeof message !== 'undefined'){
            resolve({
                targets: [sender], message
            });
        } else {
            //console.log('---- REJECT!');
            reject({
                message: 'ack error occured',
                error: JSON.stringify({ targets: [sender], message })
            });
        }
    }, ackDelay);

    ackPromise.targets = [sender];
    ackPromise.message = message;

    return ackPromise;
}

const customFunctions = {
    ack: _ack,
    fetch: _fetch,
    map: _map,
    send: _send
};

/*
TODO:
Need to know what unit is acting
emit-step should maybe just be in compiled (line 131)
idea is for this functionality ^^^ to notify outside world of progress
need to be able to modify/keep global state so that functions can share data
*/
const wrapCustomFunctions = (custFuncs, emitStep, currentNode) => {
    // should probably just be called a queue or results and not promises
    let promises = [];
    let global = undefined;
    let find = (fn) => {
        return promises.find(fn)
    };
    const wrapped = Object.keys(custFuncs)
        .reduce((all, key) => {
            all[key] = (...args) => {
                var funcKey = `${key}:${args.join('-')}`;
                if(key === 'ack' && global){
                    funcKey = `${key}:${global.sendFrom}-${global.sendMessage}`;
                }

                //console.log(`custom function [${key}] ran`);
                //console.log({ funcKey })

                var queued = find(x => x.name === funcKey);

                // if(queued && (key === "send" || key === "ack")){
                //     console.log(`--- sending queued response for ${funcKey}`);
                // }
                if (queued && queued.error) {
                    //console.log(`queued error: ${!!queued.error}`);
                    return FAILED;
                }
                if (queued && queued.result) {
                    //console.log(`queued result: ${!!queued.result}`);
                    return DONE;
                }

                var result = (key === 'ack' && global)
                    ? custFuncs[key](global.sendFrom, currentNode, global.sendMessage)
                    : custFuncs[key](...args);

                if (!isPromise(result)) {
                    result = new Promise((resolve) => resolve(result))
                }

                //console.log('queued, waiting');
                queued = new function QueueItem() {
                    this.name = funcKey;
                    this.func = key;
                    this.result = undefined;
                    this.error = undefined;
                    this.promise = result
                        //TODO: reject status errors?
                        .then(sleeper(['ack', 'send'].includes(key) ? 0: funcDelay))
                        .then(res => {
                            emitStep && emitStep({
                                name: key, result: res, status: 'success'
                            });
                            this.result = res;
                            return res;
                        })
                        .catch(err => {
                            console.log({ wrapCustomFunctionsError: err, key, funcKey });
                            //debugger
                            emitStep && emitStep({
                                name: key, result: err, status: 'error'
                            });
                            this.error = err;
                            //throw new Error('error in custom function promise');
                        });
                };

                emitStep && emitStep({
                    name: key,
                    targets: result.targets,
                    message: result.message,
                    listener: result.listener,
                    status: 'start'
                });

                promises.push(queued);
                return WAITING;
            };
            return all;
        }, {});
    wrapped.promises = promises;
    wrapped.reset = () => {
        promises = [];
        wrapped.promises = promises;
        global = undefined;
    };
    wrapped.bindInput = (data) => {
        //console.log(`--- bind data: ${JSON.stringify(data)}`);
        global = data
    };
    return wrapped;
};

module.exports = (emitStep, currentNode) => wrapCustomFunctions(customFunctions, emitStep, currentNode);
