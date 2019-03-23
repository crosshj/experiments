(function () {

  /*
      should expose a state creator in global which:

      - can be initialized with initial state or initial history
      - can be updated
      - can rewind
      - keeps track of all scene state

      TODO:
          - all items in state tree should be given an id
          - updates can be made using this id
          - if items are added to state from update (not just updated)
          - new items added by update should get an id
          - history should not get too big?
          - integrate with redux dev tools?
  */
  const State = (function () {
    const context = {
      history: [],
      eventListeners: {}
    };

    function State(initObj) {
      this.create = initObj => _create.bind(this)(context, initObj);
      this.read = count => _read.bind(this)(context, count);
      this.update = update => _update.bind(this)(context, update);
      this.delete = count => _delete.bind(this)(context, count);

      this.on = (key, callback) => _on(context, key, callback);
      this.emit = (key, data) => _emit.bind(this)(context, key, data)
      this.listeners = () => context.eventListeners;
      //removeListener?

      this.history = () => clone(context.history);
      this.toObject = () => this.read(context);
      this.toString = () => JSON.stringify(this.read(context));

      if (initObj) {
        this.create(initObj);
      }
    }

    return State;
  })();

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function _on(context, key, callback) {
    if (context.eventListeners[key] === undefined) {
      context.eventListeners[key] = [];
    }
    context.eventListeners[key].push(callback);
  }

  function _emit(context, key, data) {
    if (!context.eventListeners[key]) {
      return;
    }
    context.eventListeners[key].forEach(listener => {
      listener(data || this.read());
    });
    return;
  }

  // can be initialized with initial state or initial history
  function _create(context, initObj) {
    if (typeof initObj === 'array') {
      context.history = initObj;
      this.emit('create');
      return;
    }
    context.history = [initObj];
    this.emit('create');
  }

  // can rewind (return a state from history)
  function _read(context, count) {
    const index = context.history.length - 1 - (count || 0);
    if (index > context.history.length - 1) {
      return undefined;
    }
    if (index < 0) {
      return undefined;
    }
    this.emit('read');
    return clone(context.history[index]);
  }

  // can be updated (not sure if object.assign is good enough for array items)
  // TODO: update using an id which gets added to every node in tree
  function _update(context, update) {
    const currentState = context.history[context.history.length - 1];
    var functionUpdate = typeof update === 'function'
      ? update(clone(currentState))
      : null;
    // if(functionUpdate){
    //   console.log({ functionUpdate })
    // }
    const newState = Object.assign(clone(currentState), functionUpdate || update);
    context.history.push(newState);
    if (context.history.length % 100 === 0) {
      const length = context.history.length;
      const size = memorySizeOf(context.history);
      this.emit('history', { length, size });
    }
    this.emit('update');
  }

  // not sure if this is needed
  function _delete(context, count) {
    const index = context.history.length - (count || 0);
    if (index > context.history.length) {
      return undefined;
    }
    if (index < 0) {
      return undefined;
    }
    context.history = context.history.slice(0, index);
    this.emit('delete');
  }

  function memorySizeOf(obj) {
    var bytes = 0;

    function sizeOf(obj) {
      if (obj !== null && obj !== undefined) {
        switch (typeof obj) {
          case 'number':
            bytes += 8;
            break;
          case 'string':
            bytes += obj.length * 2;
            break;
          case 'boolean':
            bytes += 4;
            break;
          case 'object':
            var objClass = Object.prototype.toString.call(obj).slice(8, -1);
            if (objClass === 'Object' || objClass === 'Array') {
              for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;
                sizeOf(obj[key]);
              }
            } else bytes += obj.toString().length * 2;
            break;
        }
      }
      return bytes;
    };

    function formatByteSize(bytes) {
      if (bytes < 1024) return bytes + " bytes";
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " kB";
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
      else return (bytes / 1073741824).toFixed(3) + " GB";
    };

    return formatByteSize(sizeOf(obj));
  };

  window.State = State;
})();