/* http://todomvc.com/ - the bartok|react answer */

const App = () => {
  const {
    value, addTodo, checkItem, filterTodos, replaceAll, reorder
  } = useStore();
  const {todos=[], counts, activeFilter='all' } = value || {};

  const add = (event) => {
    const inputText = document.getElementById('inputBox').value;
    addTodo(inputText);
    event.preventDefault();
  };

  const replace = (event, todos) => {
      replaceAll(todos);
      event.preventDefault();
  };

  return (
    <div class="app">
      <div class="container">
        <Style />
        <Header name="⚡ todo ⚡"/>
        <div id="actions-top">
          <UploadButton replace={replace} />
          <DownloadButton />
        </div>
        <Body
          todos={todos}
          add={add}
          check={checkItem}
          reorder={reorder}
        />
        <Footer filter={filterTodos} active={activeFilter} counts={counts}/>
      </div>
    </div>
  );
};

const Header = ({ name }) => {
  return (
    <h1 class="todo-header">
      <span>{name}</span>
    </h1>
  );
};

const Body = ({ todos=[], add, check, reorder }) => {

  const drop = (e) => {
    const item = e.dataTransfer
      .getData('text');
    e.dataTransfer
      .clearData();
    e.target.classList.remove('dragOver')
    const to = event.target.dataset.order;
    reorder({ item, order: Number(to) - 0.1});
  };

  const seperatorRowClass = ({ value }) => {
    const seperators = [
      '-----', '=====', '*****', '~~~~~', '#####'
    ];
    const isSeperator = seperators.find(x => value.includes(x));
    return isSeperator
      ? ' seperator'
      : '';
  };

  return (
    <div class="todo-body">
      <div class="input-container">
          <form onSubmit={add}>
            <input id="inputBox" type="text" value="" autocomplete="off"/>
            <button onClick={add}>ADD</button>
          </form>
      </div>
      <ul>
        {(todos||[]).map((todo, i) => (
          <li
            data-order={todo.order}
            class={todo.status + seperatorRowClass(todo)}
            draggable="true"
            onDragStart={ (e) => {
              e.dataTransfer
               .setData('text/plain', todo.value);
            }}
            onDragOver={ (e) => {
              e.preventDefault();
              e.target.classList.add('dragOver');
            }}
            onDragLeave={ e => e.target.classList.remove('dragOver') }
            onDrop={drop}
            key={todo.value}
          >
            <input
              type="checkbox"
              droppable="false"
              defaultChecked={todo.status==="completed"}
              onChange={() => check(todo.value)}
            />
            <span
              droppable="false"
            >{todo.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = ({ filter, active, counts={} }) => {
  return (
    <div class="todo-footer">
      {['all', 'active', 'completed'].map((menuItem, i) => (
        <div
          className={active===menuItem ? 'active' : ''}
          onClick={() => filter(menuItem)}
        >
          <span>{menuItem}</span>
          <span class="todo-count">{counts[menuItem] || '23'}</span>
        </div>
      ))}
    </div>
  );
};

const DownloadButton = () => {
  const { value } = useStore({ filter: 'all'});
  const { todos=[] } = value || {};

  const dateString = (new Date()).toISOString().slice(2,10).replace(/-/g, '')
    + '_'
    + (new Date()).toLocaleString("en-US", {
      minute: "2-digit",
        hour: "2-digit",
      hour12: false
    }).replace(":", "");
  const exportName = `TODO-${dateString}`;

  function downloadMarkDown(){
    const activeItems = todos
      .filter(x => x.status === 'active')
      .map(x => `  - [ ] ${x.value}`)
      .join('\n');
    const completedItems = todos
      .filter(x => x.status !== 'active')
      .map(x => `  - [X] ${x.value}`)
      .join('\n');
    const markdown =
`TODO ${dateString}
================
${activeItems}
${completedItems}
`;
    var dataStr = "data:text/json;charset=utf-8,"
      + encodeURIComponent(markdown);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("target", "_blank");
    downloadAnchorNode.setAttribute("download", exportName + ".md");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function downloadObjectAsJson(){
    var dataStr = "data:text/json;charset=utf-8,"
      + encodeURIComponent(JSON.stringify(todos, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("target", "_blank");
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const clickHandler = downloadMarkDown || downloadObjectAsJson;

  return (
    <div
      className="icon"
      title="Download all"
      onClick={clickHandler}
    >
      ⭳
    </div>
  );
};

const UploadButton = ({ replace }) => {
  const upload = (e) => {
    e.preventDefault();
    const confirmed = confirm('This overwrite your current todo list.  Continue?');
    if(!confirmed){ return; }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.setAttribute('accept', 'md');

    const parseResults = ({ error, result }) => {
      if(error){
        console.error(error);
        return;
      }
      const parsed = result
        .split('\n')
        .filter(x => (x||'').includes('- [X]') || (x||'').includes('- [ ]'))
        .map((x, i) => {
          if(x.includes('[X]')){
            return {
              value: x.split('[X] ')[1],
              status: 'completed',
              order: i
            }
          }
          return {
            value: x.split('[ ] ')[1],
            status: 'active',
            order: i
          };
        });


      fileInput.value = '';
      fileInput.remove && fileInput.remove();
      replace(e, parsed);
    };


    fileInput.onchange = e => {
      const readerOne = new FileReader();
      readerOne.onerror = () => parseResults(readerOne);
      readerOne.onload = () => parseResults(readerOne);
      readerOne.readAsText(e.target.files[0]);
    };

    fileInput.click();
  };

  return (
    <div className="icon" title="Upload Todo's"
      onClick={upload}
    >
      ⭱
    </div>
  );
};

function useStore({ filter }={}) {
  let [value, setValue] = useState(0);

  if(!value){
    const ls = localStorage.getItem('react-todo');
    if(!!ls){
      value = JSON.parse(ls);
    }
  }

  const getCounts = (t=[]) => ({
    all: t.length,
    active: t.filter(x => x.status === 'active').length,
    completed: t.filter(x => x.status !== 'active').length,
  });

  const reorder = useCallback(({ item, order }) => {
    const { todos = [], activeFilter='all', counts } = value;

    todos.find(x => x.value === item).order = order;

    setValue({
      todos,
      counts,
      activeFilter
    });
  }, [value]);

  const replaceAll = useCallback((submitted) => {
    const { todos = [], activeFilter='all' } = value;
    setValue({
      todos: submitted,
      counts: getCounts(submitted),
      activeFilter
    });
  }, [value]);

  const addTodo = useCallback((submitted) => {
    const { todos = [], activeFilter='all' } = value;
    const counts = getCounts(todos);
    counts.active++;
    counts.all++;
    setValue({
      todos: todos.concat({ value: submitted, status: 'active' }),
      counts,
      activeFilter
    });
  }, [value]);

  const checkItem = useCallback((item) => {
    const { todos = [], activeFilter='all' } = value;
    const theItem = todos.find(x => x.value === item);
    theItem.status = theItem.status === 'active'
      ? 'completed'
      : 'active';
    setValue({
      todos,
      counts: getCounts(todos),
      activeFilter
    });
  }, [value]);

  const filterTodos = useCallback((which) => {
    const { todos = [], counts } = value;
    setValue({
      todos,
      counts,
      activeFilter: which
    });
  }, [value]);

  const state = value
    ? {
      todos: (filter || value.activeFilter) === 'all'
        ? value.todos
        : (value.todos||[]).filter(
            x => x.status === (filter || value.activeFilter)
        ),
      activeFilter: value.activeFilter
    }
    : {
      todos: undefined,
      activeFilter: undefined
    };

  // sort by status, then order, then alpha
  state.todos = (state.todos||[])
    .sort((a, b) => {
      if (a.status==="active" && b.status==="completed"){ return -1; }
      if (a.status==="completed" && b.status==="active") { return 1; }
      if (a.order < b.order){ return -1; }
      if (a.order > b.order){ return 1; }
      const A = a.value.toUpperCase();
      const B = b.value.toUpperCase();
      if (A < B) { return -1; }
      if (A > B) { return 1; }
      return 0;
    })
    .map((x, i) => {
      x.order = i;
      return x;
    });

  state.counts = getCounts(value.todos);
  /*
  const counts = {
    all: todos.length,
    active: todos.filter(x => x.status === 'active').length,
    completed: todos.filter(x => x.status !== 'active').length,
  };
  */

  localStorage.setItem('react-todo', JSON.stringify(value));

  return {
    value: state,
    replaceAll,
    reorder,
    addTodo,
    checkItem,
    filterTodos
  };
}

const Style = () => {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      :root {
        --bg-color: #1a1a1a;
        --bg-color-a: #1a1a1aff;
        --bg-color-a-low: #1a1a1a11;
      }
      body {
        background: var(--bg-color);
        zoom: 0.64;
      }
      .app {
        margin: 0 auto;
        max-width: 85em;
        position: absolute;
        left: 0; right: 0;
        top: 0; bottom: 0;
      }
      .container {
        position: relative;
        width: calc(100% - 4em);
        height: 100%;
        overflow: hidden;
        padding: 0 2em;
      }
      .todo-header {
        display: flex;
        justify-content: space-around;
        margin-top: 1.5em;
      }
      .todo-body input {
        background: #272727;
        outline: none;
      }
      .todo-body * {
        color: #999;
        background: transparent;
      }
      .todo-body input {
        background: #272727;
      }
      .todo-body ul {
        display: block;
        overflow: auto;
        overflow-x: hidden;
        position: absolute;
        top: 130px;
        bottom: 2.4em;
        right: -7px;
        left: 1.8em;
        margin-right: -0.9em;
        padding-right: 2.5em;
        padding-top: 1.2em;
        padding-bottom: 2em;
      }
      .todo-body ul:before {
        content: '';
        position: fixed;
        top: 6em;
        left: 19px;
        right: 19px;
        height: 2em;
        z-index: 9;
        background: linear-gradient(var(--bg-color-a), var(--bg-color-a-low));
      }
      .todo-body ul:after {
        content: '';
        position: fixed;
        bottom: 2.3em;
        left: 19px;
        right: 19px;
        height: 60px;
        z-index: 9;
        background: linear-gradient(var(--bg-color-a-low), var(--bg-color-a));
      }
      .input-container {
        border: 0px solid;
        border-radius: 3px;
        height: 35px;
      }
      .input-container input,
      .input-container button {
          font-size: 1.1em;
      }
      .input-container button {
        height: 100%;
        border: 1px solid transparent;
        background: transparent;
        margin-left: -55px;
      }
      .input-container form {
        height: 100%;
      }
      .input-container input:focus {
        background: #000;
      }
      .input-container button:focus {
        outline: none;
      }
      .input-container input {
        border: 0px;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        padding-right: 45px;
      }
      input[type="text"]:focus {
        color: white;
        border: none;
        outline: none;
      }
      ul {
        list-style: none;
        font-size: 24px;
        cursor: default;
        user-select: none;
        font-weight: 100;
      }
      li.seperator:before {
        content: '';
        display: block;
        height: 2px;
        background: repeating-linear-gradient(
          to right,
          #9999997a,
          #9999997a 4px,
          transparent 10px,
          transparent 15px
        );
        position: absolute;
        left: 10px;
        right: 0;
      }
      li.seperator:hover:before{
        background: repeating-linear-gradient(
          to right,
          #00000059,
          #00000059 4px,
          transparent 10px,
          transparent 15px
        );
      }
      li.seperator input {
        display: none;
      }
      li.seperator span {
          display: none;
      }
      li {
        padding: 0px 50px 0px 18px;
        margin-left: -39px;
        margin-right: -17px;
        display: flex;
        min-height: 40px;
        align-items: center;
        word-break: break-word;
        position: relative;
      }
      li:after {
        content: '≡';
        position: absolute;
        right: 10px;
        font-stretch: ultra-expanded;
        color: transparent;
      }
      li:hover {
        color: black !important;
        background: #999999;
      }
      li:hover:after,
      li:hover span,
      li:hover input {
        color: inherit;
      }
      li:after,
      li span {
        pointer-events: none;
      }
      li.completed span {
        color: #6e6e6e;
      }
      li.dragOver {
          border-top: 1px solid;
      }
      input[type="checkbox"] {
        left: -18px;
        visibility: hidden !important;
        opacity: 1 !important;
        cursor: pointer;
        position: relative;
      }
      input[type="checkbox"]:before {
        visibility: visible;
        position: absolute;
        top: -16px;
        left: 0px;
        content: '☐';
        font-size: 28px;
      }
      input[type="checkbox"]:checked:before {
        left: -1px;
        content: '✓';
        color: #8BC34A;
      }
      .todo-footer {
        position: absolute;
        bottom: 20px;
        width: calc(100% - 4em);
        display: flex;
        justify-content: space-between;
      }
      .todo-footer > * {
        cursor: pointer;
        border: 1px solid;
        border-radius: 3px;
        min-width: 70px;
        text-align: center;
        text-transform: uppercase;
        padding: 4px 14px;
        font-size: 1.2em;
        color: grey;
      }
      .todo-footer .todo-count {
        margin-left: 1em;
        opacity: 0.9;
      }
      .todo-footer .active {
        color: #b5b5b5;
        background: #ffffff10;
      }
      #actions-top{
        position: absolute;
        right: 29px;
        top: 37px;
        display: flex;
      }
      #actions-top .icon {
        font-size: 30px;
        color: #555;
        transform: scale(1.5, 1);
        font-size: 32px;
        padding: 10px;
        cursor: pointer;
      }
      #actions-top .icon:hover {
        color: white;
      }
    `}} />
  );
};
