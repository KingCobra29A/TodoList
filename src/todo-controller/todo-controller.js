import compareAsc from "date-fns/compareAsc";
import compareDesc from "date-fns/compareDesc";
import { TodoList } from "../todo-model/todo-model";

export const TodoController = (() => {
  let currentTodos;
  let currentCategory;

  const addTodo = (title, description, date) => {
    TodoList.add("Todo", { title, description, date });
  };

  const addCategory = (category) => {
    TodoList.add("Category", { category });
  };

  const editTodo = (payload) => {
    TodoList.modify("Todo", payload);
  };

  const toggleTodoCompletionStatus = (id) => {
    const todo = currentTodos.filter((item) => item.id === id)[0];
    if (todo.active === true) {
      editTodo({ id, active: false });
    } else {
      editTodo({ id, active: true });
    }
  };

  const categorizeTodo = (id, category) => {
    editTodo({ id, category });
  };

  const getCategories = () => Object.keys(TodoList.query("Categories", null));

  const sortTodosDefault = () => {
    // sort by creation date
    currentTodos.sort((a, b) => compareAsc(a.creationDate, b.creationDate));
    // sort by completion status
    currentTodos.sort((a, b) => {
      if (a.active === b.active) return 0;
      if (a.active) return -1;
      return 1;
    });
    // sort completed todos by completion date in ascending order
    currentTodos.sort((a, b) => {
      if (a.completionDate && b.completionDate) {
        return compareDesc(a.completionDate, b.completionDate);
      }
      return 0;
    });
  };

  const getTodos = () => {
    currentTodos = TodoList.query("TodoByCategory", {
      category: currentCategory,
    });
    sortTodosDefault();
    return currentTodos;
  };

  const getTodoContentById = (id) =>
    currentTodos.filter((element) => element.id === id)[0];

  const selectCategory = (categoryIn) => {
    currentCategory = categoryIn;
    return getTodos();
  };

  const deleteCategory = (category) => {
    const refreshAfter = !!(
      currentCategory.toLowerCase() === "uncategorized" ||
      currentCategory === category
    );
    TodoList.remove("Category", category);
    return refreshAfter;
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
