(function(){

    /*
        should expose a state creator in global which:

        - can be initialized with initial state or initial history
        - can be updated
        - can rewind
        - keeps track of all scene state

        TODO:
            all items in state tree should be given an id
            updates can be made using this id
            if items are added to state from update (not just updated)
            new items added by update should get an id

    */
    const State = (function(){
        const context = {
            history: [],
            eventListeners: {}
        };

        function State(initObj){
            this.create = initObj => _create.bind(this)(context, initObj);
            this.read = count => _read.bind(this)(context, count);
            this.update = update => _update.bind(this)(context, update);
            this.delete = count => _delete.bind(this)(context, count);

            this.on = (key, callback) => _on(context, key, callback);
            this.emit = (key) => _emit.bind(this)(context, key)
            this.listeners = () => context.eventListeners;
            //removeListener?

            this.history = () => clone(context.history);
            this.toObject = () => this.read(context);
            this.toString = () => JSON.stringify(this.read(context));

            if(initObj){
                this.create(initObj);
            }
        }

        return State;
    })();

    function clone(obj){
        return JSON.parse(JSON.stringify(obj));
    }

    function _on(context, key, callback){
        if (context.eventListeners[key] === undefined) {
            context.eventListeners[key] = [];
        }
        context.eventListeners[key].push(callback);
    }

    function _emit(context, key){
        if (!context.eventListeners[key]){
            return;
        }
        context.eventListeners[key].forEach(listener => {
            listener(this.read());
        });
        return;
    }

    // can be initialized with initial state or initial history
    function _create(context, initObj){
        if(typeof initObj === 'array'){
            context.history = initObj;
            this.emit('create');
            return;
        }
        context.history = [initObj];
        this.emit('create');
    }

    // can rewind (return a state from history)
    function _read(context, count){
        const index = context.history.length - 1 - (count || 0);
        if(index > context.history.length - 1){
            return undefined;
        }
        if(index < 0){
            return undefined;
        }
        this.emit('read');
        return clone(context.history[index]);
    }

    // can be updated (not sure if object.assign is good enough for array items)
    // TODO: update using an id which gets added to every node in tree
    function _update(context, update){
        const currentState = context.history[context.history.length - 1];
        const newState = Object.assign(clone(currentState), update);
        context.history.push(newState);
        this.emit('update');
    }

    // not sure if this is needed
    function _delete(context, count){
        const index = context.history.length - (count || 0);
        if(index > context.history.length){
            return undefined;
        }
        if(index < 0){
            return undefined;
        }
        context.history = context.history.slice(0, index);
        this.emit('delete');
    }

    window.State = State;
})();