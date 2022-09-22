import { TodoList } from "../todo-model/todo-model";

export const TodoController = (() => {
  let currentTodos;
  let currentCategory;

  const getCategories = () => Object.keys(TodoList.query("Categories", null));

  const getTodoContentById = (id) =>
    currentTodos.filter((element) => element.id === id)[0];

  const getTodos = () => {
    // TODO, should probably be working off a deep copy?
    currentTodos = TodoList.query("TodoByCategory", {
      category: currentCategory,
    });
    return currentTodos;
  };

  const selectCategory = (categoryIn) => {
    currentCategory = categoryIn;
    return getTodos();
  };

  const categorizeTodo = (id, category) => {
    TodoList.modify("Todo", { id, category });
  };

  const addTodo = (title, description, date) => {
    TodoList.add("Todo", { title, description, date });
  };

  const addCategory = (category) => {
    TodoList.add("Category", { category });
  };

  const toggleTodoCompletionStatus = (id) => {
    const todo = currentTodos.filter((item) => item.id === id)[0];
    if (todo.active === true) {
      TodoList.modify("Todo", { id, active: false });
    } else {
      TodoList.modify("Todo", { id, active: true });
    }
  };

  const deleteCategory = (category) => {
    const refreshAfter = !!(
      currentCategory.toLowerCase() === "uncategorized" ||
      currentCategory === category
    );
    TodoList.remove("Category", category);
    return refreshAfter;
  };

  const editTodo = (payload) => {
    TodoList.modify("Todo", payload);
  };

  return {
    getCategories,
    getTodos,
    getTodoContentById,
    selectCategory,
    categorizeTodo,
    addTodo,
    addCategory,
    toggleTodoCompletionStatus,
    deleteCategory,
    editTodo,
  };
})();

export default TodoController;
