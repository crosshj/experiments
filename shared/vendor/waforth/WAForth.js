const isSafari =
  typeof navigator != "undefined" &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

class WAForth {
  constructor(wasmModule, arrayToBase64) {
    if (wasmModule == null) {
      this.wasmModule = require("./waforth.wasm");
    } else {
      this.wasmModule = wasmModule;
    }
    this.arrayToBase64 =
      arrayToBase64 ||
      function arrayToBase64(bytes) {
        var binary = "";
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      };
  }

  start() {
    let table;
    let memory;
    const buffer = (this.buffer = []);

    return WebAssembly.instantiate(this.wasmModule, {
      shell: {
        ////////////////////////////////////////
        // I/O
        ////////////////////////////////////////

        emit: this.onEmit,

        getc: () => {
          if (buffer.length === 0) {
            return -1;
          }
          return buffer.pop();
        },

        debug: d => {
          console.log("DEBUG: ", d, String.fromCharCode(d));
        },

        key: () => {
          let c;
          while (c == null || c == "") {
            c = window.prompt("Enter character");
          }
          return c.charCodeAt(0);
        },

        accept: (p, n) => {
          const input = (window.prompt("Enter text") || "").substr(0, n);
          const target = new Uint8Array(memory.buffer, p, input.length);
          for (let i = 0; i < input.length; ++i) {
            target[i] = input.charCodeAt(i);
          }
          console.log("ACCEPT", p, n, input.length);
          return input.length;
        },

        ////////////////////////////////////////
        // Loader
        ////////////////////////////////////////

        load: (offset, length, index) => {
          let data = new Uint8Array(
            this.core.exports.memory.buffer,
            offset,
            length
          );
          if (isSafari) {
            // On Safari, using the original Uint8Array triggers a bug.
            // Taking an element-by-element copy of the data first.
            let dataCopy = [];
            for (let i = 0; i < length; ++i) {
              dataCopy.push(data[i]);
            }
            data = new Uint8Array(dataCopy);
          }
          if (index >= table.length) {
            table.grow(table.length); // Double size
          }
          // console.log("Load", index, this.arrayToBase64(data));
          var module = new WebAssembly.Module(data);
          new WebAssembly.Instance(module, {
            env: { table, memory, tos: -1 }
          });
        }
      }
    }).then(instance => {
      this.core = instance.instance;
      table = this.core.exports.table;
      memory = this.core.exports.memory;
    });
  }

  read(s) {
    const data = new TextEncoder().encode(s);
    for (let i = data.length - 1; i >= 0; --i) {
      this.buffer.push(data[i]);
    }
  }

  run(s) {
    this.read(s);
    try {
      return this.core.exports.interpret();
    } catch (e) {
      // Exceptions thrown from the core means QUIT or ABORT is called, or an error
      // has occurred. Assume what has been done has been done, and ignore here.
    }
  }
}

export default WAForth;
