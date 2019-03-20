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
        var _history = [];
        function State(initObj){
            this.create(initObj);
        }
        State.prototype.create = _create.bind(this);
        State.prototype.read = _read.bind(this);
        State.prototype.update = _update.bind(this);
        State.prototype.delete = _delete.bind(this);

        State.prototype.history = (function(){ return this._history; }).bind(this);
        State.prototype.toObject = _read.bind(this);
        State.prototype.toString = () => JSON.stringify(_read.bind(this)());
        return State;
    })();

    function clone(obj){
        return JSON.parse(JSON.stringify(obj));
    }

    // can be initialized with initial state or initial history
    function _create(initObj){
        if(typeof initObj === 'array'){
            this._history = initObj;
            return;
        }
        this._history = [initObj];
    }

    // can rewind (return a state from history)
    function _read(count){
        const index = this._history.length - 1 - (count || 0);
        if(index > this._history.length - 1){
            return undefined;
        }
        if(index < 0){
            return undefined;
        }
        return clone(this._history[index]);
    }

    // can be updated (not sure if object.assign is good enough for array items)
    function _update(update){
        const currentState = this._history[this._history.length - 1];
        const newState = Object.assign(clone(currentState), update);
        this._history.push(newState);
    }

    // not sure if this is needed
    function _delete(count){
        const index = this._history.length - (count || 0);
        if(index > this._history.length){
            return undefined;
        }
        if(index < 0){
            return undefined;
        }
        this._history = this._history.slice(0, index);
        return clone(this._history[index]);
    }

    window.State = State;
})();