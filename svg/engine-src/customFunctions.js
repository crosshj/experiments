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
        function flatPromise() {
            let resolve, reject;
            const promise = new Promise((res, rej) => {
              resolve = res;
              reject = rej;
            });
            return { promise, resolve, reject };
        }
        const { resolve, reject, promise: p } = flatPromise();

        var nodesArray = Array.isArray(nodes)
            ? nodes
            : [ nodes ];

        var timer = undefined;
        const nodesDone = nodesArray.map(label => ({ label, done: false}));
        const listener = ({ data = {}, removeListener, error } = {}) => {

            timer = timer || setTimeout(() => {
                removeListener && removeListener();
                reject({
                    message: 'send not acknowledged within time limit',
                    nodesDone
                });
            }, timeout);

            if(error){
                clearTimeout(timer);
                removeListener && removeListener();
                reject({
                    message: 'send error occured',
                    error, nodesDone
                });
                return;
            }

            // only handle ack events
            const isAck = data.name === 'ack';
            if(!isAck){
                return;
            }

            // mark a node as done
            const foundNode = nodesDone.find(n => n.label === data.src.label);
            foundNode && (foundNode.done = true);

            // should listen for ack from all nodes
            const unfinishedNodes = nodesDone.find(n => !n.done);
            if(!unfinishedNodes){
                clearTimeout(timer);
                removeListener && removeListener();
                resolve({
                    message: 'all send\'s ack\'ed',
                    nodesDone
                });
            }
        };

        const sendPromise = p;
        sendPromise.listener = listener;
        sendPromise.targets = nodesArray;
        sendPromise.message = message;

        return sendPromise;
    }

    function _ack(value, nodes) {
        //test if array, wrap in array if not
        //TODO:
        //console.log('custom function [ack] ran');
        return DONE;
    }

    const customFunctions = {
        ack: _ack,
        fetch: _fetch,
        map: _map,
        send: _send
    };

    module.exports = customFunctions;
