import compareAsc from "date-fns/compareAsc";
import compareDesc from "date-fns/compareDesc";
import addDays from "date-fns/addDays";
import { TodoList } from "../todo-model/todo-model";

export const TodoController = (() => {
  let currentTodos;
  let currentCategory;

  const addTodo = (title, description, category, date) => {
    TodoList.add("Todo", { title, description, category, date });
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
  const getCurrentCategoryIndex = () =>
    getCategories().indexOf(currentCategory);

  const sortTodosDefault = () => {
    // sort by creation date
    currentTodos.sort((a, b) => compareDesc(a.creationDate, b.creationDate));
    // sort by existance of due date
    currentTodos.sort((a, b) => {
      if (a.date === b.date) return 0;
      if (a.date) return -1;
      return 1;
    });
    // sort todos by due date in ascending order
    currentTodos.sort((a, b) => {
      if (a.date && b.date) {
        return compareAsc(a.date, b.date);
      }
      return 0;
    });
    // sort by completion status
    currentTodos.sort((a, b) => {
      if (a.active === b.active) return 0;
      if (a.active) return -1;
      return 1;
    });
    // sort completed todos by completion date in descending order
    currentTodos.sort((a, b) => {
      if (a.completionDate && b.completionDate) {
        return compareDesc(a.completionDate, b.completionDate);
      }
      return 0;
    });
  };

  const getTodos = () => {
    if (currentCategory === "getTodosByDate") {
      currentTodos = TodoList.query("TodoByDate", {
        date: addDays(new Date(), 1),
      });
    } else {
      currentTodos = TodoList.query("TodoByCategory", {
        category: currentCategory,
      });
    }
    sortTodosDefault();
    return currentTodos;
  };

  const getUpcomingTodos = () => {
    currentTodos = TodoList.query("TodoByDate", {
      date: addDays(new Date(), 1),
    });
    currentCategory = "getTodosByDate";
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

  const deleteTodo = (id) => {
    TodoList.remove("Todo", id);
  };

  return {
    getCategories,
    getCurrentCategoryIndex,
    getTodos,
    getUpcomingTodos,
    getTodoContentById,
    selectCategory,
    categorizeTodo,
    addTodo,
    addCategory,
    toggleTodoCompletionStatus,
    deleteCategory,
    deleteTodo,
    editTodo,
  };
})();

export default TodoController;
