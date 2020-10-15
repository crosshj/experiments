import './todo.styl';

import { Header } from './todo-header.jsx';
import { Body } from './todo-body.jsx';
import { Footer } from './todo-footer.jsx';
import { Actions } from './todo-actions.jsx';

import { getState } from './todo-state.mjs';
const useStore = getState({ useState, useCallback });

const App = () => {
  const {
    value, addTodo, checkItem, filterTodos, replaceAll, reorder
  } = useStore();
  const {
    todos=[], counts, activeFilter='all'
  } = value || {};

  return (
    <div class="app">
      <div class="container">
        <Header name="⚡ todo ⚡"/>
        <Actions
          replaceAll={replaceAll}
          useStore={useStore}
        />
        <Body
          todos={todos}
          addTodo={addTodo}
          check={checkItem}
          reorder={reorder}
        />
        <Footer
          filter={filterTodos}
          active={activeFilter}
          counts={counts}
        />
      </div>
    </div>
  );
};
