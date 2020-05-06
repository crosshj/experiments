/* http://todomvc.com/ - the bartok|react answer */

const App = () => {
  const { value, addTodo, checkItem, filterTodos } = useStore();
  const { todos=[], activeFilter='all' } = value || {};

  const add = (event) => {
    const inputText = document.getElementById('inputBox').value;
    addTodo(inputText);
    event.preventDefault();
  };
  return (
    <div class="app">
      <Style />
      <Header name="🦠 todo 🦠"/>
      <Body todos={todos} add={add} check={checkItem}/>
      <Footer filter={filterTodos} active={activeFilter}/>
    </div>
  );
};

// header component, should be imported
const Header = ({ name }) => (
  <h1 class="todo-header">
    <span>{name}</span>
  </h1>
);

// body component, should be imported
const Body = ({ todos=[], add, check }) => (
  <div class="todo-body">
    <div class="input-container">
        <form onSubmit={add}>
          <input id="inputBox" type="text" value="" autocomplete="off"/>
          <button onClick={add}>ADD</button>
        </form>
    </div>
    <ul>
      {(todos||[]).map((todo, i) => (
        <li class={todo.status} key={todo.value}>
          <input
            type="checkbox"
            defaultChecked={todo.status==="completed"}
            onChange={() => check(todo.value)}
          />
          <span>{todo.value}</span>
        </li>
      ))}
    </ul>
  </div>
);

// footer component, should be imported
const Footer = ({ filter, active }) => (
  <div class="todo-footer">
    {['all', 'active', 'completed'].map((menuItem, i) => (
      <div
        className={active===menuItem ? 'active' : ''}
        onClick={() => filter(menuItem)}
      >{menuItem}</div>
    ))}
  </div>
);

// state, using hooks
function useStore() {
  let [value, setValue] = useState(0);

  if(!value){
    const ls = localStorage.getItem('react-todo');
    if(!!ls){
      value = JSON.parse(ls);
    }
  }

  const addTodo = useCallback((submitted) => {
    const { todos = [], activeFilter='all' } = value;
    setValue({
      todos: todos.concat({ value: submitted, status: 'active' }),
      activeFilter
    });
  }, [value]);

  const checkItem = useCallback((item) => {
    const { todos = [], activeFilter='all' } = value;
    const theItem = todos.find(x => x.value === item);
    theItem.status = theItem.status === 'active'
      ? 'completed'
      : 'active';
    setValue({ todos, activeFilter });
  }, [value]);

  const filterTodos = useCallback((which) => {
    const { todos = [] } = value;
    setValue({
      todos,
      activeFilter: which
    });
  }, [value]);

  const state = value
    ? {
      todos: value.activeFilter === 'all'
        ? value.todos
        : (value.todos||[]).filter(
            x => x.status === value.activeFilter
        ),
      activeFilter: value.activeFilter
    }
    : {
      todos: undefined,
      activeFilter: undefined
    };

  // sort by status, then alpha
  state.todos = (state.todos||[]).sort((a, b) => {
      if (a.status==="active" && b.status==="completed"){ return -1; }
      if (a.status==="completed" && b.status==="active") { return 1; }
      const A = a.value.toUpperCase();
      const B = b.value.toUpperCase();
      if (A < B) { return -1; }
      if (A > B) { return 1; }
      return 0;
  });

  localStorage.setItem('react-todo', JSON.stringify(value));

  return {
    value: state,
    addTodo,
    checkItem,
    filterTodos
  };
}



const Style = () => (
  <style dangerouslySetInnerHTML={{__html: `
    .app {
      margin: 20px;
    }
    .todo-header {
      display: flex;
      justify-content: space-around;
    }
    .todo-body * {
      color: grey;
      background: transparent;
    }

    .input-container {
      border: 1px solid;
      border-radius: 3px;
      height: 30px;
    }
    .input-container input,
    .input-container button {
        font-size: 0.8em;
    }
    .input-container button {
      height: 100%;
      border: 1px solid transparent;
      background: transparent;
      margin-left: -45px;
    }
    .input-container form {
      height: 100%;
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
    li {
      margin-bottom: 9px;
      text-indent: -19px;
    }
    li.completed span {
      text-decoration: line-through;
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
      width: calc(100vw - 40px);
      display: flex;
      justify-content: space-between;
    }
    .todo-footer * {
      cursor: pointer;
      border: 1px solid;
      border-radius: 3px;
      min-width: 70px;
      text-align: center;
      text-transform: uppercase;
      padding: 4px 14px;
      font-size: 11px;
      color: grey;
    }
    .todo-footer .active {
      color: white;
      background: #ffffff10;
    }
  `}} />
);