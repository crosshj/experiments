export const getState = ({
  useState, useCallback
}) =>
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
