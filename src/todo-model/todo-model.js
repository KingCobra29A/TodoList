import { v4 as uuidv4 } from "uuid";

export const TodoList = (() => {
  const todoListArray = [];
  let categoryDict = {};
  const categoryKey = "categories";
  // let _addCallback = todoController.modelCallback;
  // let _queryCallback = todoController.modelCallback;

  const Todo = (title, description, date, id) => ({
    title,
    description,
    date,
    id,
    creationDate: new Date(),
    completionDate: null,
    category: "uncategorized",
    active: true,
  });

  // TODO: make more robust
  const localStorageStoreTodo = (state) => {
    if (window.localStorage) {
      localStorage.setItem(state.id, JSON.stringify(state));
    } else {
      // no local storage
    }
  };

  const reconstructDates = (todoIn) => {
    const dateKeys = ["completionDate", "creationDate", "date"];
    const reworkedTodo = todoIn;
    dateKeys.forEach((key) => {
      if (reworkedTodo[key] !== null && reworkedTodo[key]) {
        reworkedTodo[key] = new Date(reworkedTodo[key]);
      }
    });
    return reworkedTodo;
  };

  // Loads the entire contents of localStorage into the todoListArray array
  // TODO: add protection against duplicate entries in the array?
  const localStorageLoadTodo = () => {
    if (window.localStorage) {
      for (let i = 0; i < localStorage.length; i += 1) {
        const currentKey = localStorage.key(i);
        if (currentKey === categoryKey) {
          categoryDict = JSON.parse(localStorage.getItem(currentKey));
        } else {
          let todoFromStorage = JSON.parse(localStorage.getItem(currentKey));
          todoFromStorage = reconstructDates(todoFromStorage);
          todoListArray.push(todoFromStorage);
        }
      }
    } else {
      // no local storage
    }
  };

  // Lower order fn used by "add"
  const addTodo = (title, description, date) => {
    const newTodo = Todo(title, description, date, uuidv4());
    todoListArray.push(newTodo);
    console.log(newTodo.creationDate);
    localStorageStoreTodo(newTodo);
  };

  // Lower order fn used by "add"
  // if a new category is added, it is immediately committed to local storage
  const addCategory = (input) => {
    if (!Object.prototype.hasOwnProperty.call(categoryDict, input)) {
      categoryDict[input] = true;
      localStorage.setItem(categoryKey, JSON.stringify(categoryDict));
    } else {
      // duplicate category, maybe take some action?
    }
  };

  /*
   **
   **
   */
  const add = (method, payload) => {
    if (method === "Todo") {
      // TODO: add validation to these parameters
      addTodo(payload.title, payload.description, payload.date);
      // TODO: need to trigger event for view
    } else if (method === "Category") {
      addCategory(payload.category);
      // TODO: need to trigger event for view
    } else {
      // invalid method
    }
    // _addCallback("add", []); //HACK
  };

  // lower order fn used by getTodoByCategory
  const todoCategoryNonexistant = (categoryIn) =>
    !Object.prototype.hasOwnProperty.call(categoryDict, categoryIn);

  // Lower order fn used by "query"
  const getTodoByCategory = (category) =>
    todoListArray.filter((element) => {
      if (category.toLowerCase() === "uncategorized") {
        return (
          element.category.toLowerCase() === category.toLowerCase() ||
          todoCategoryNonexistant(element.category)
        );
      }

      return element.category.toLowerCase() === category.toLowerCase();
    });

  // Lower order fn used by "query"
  const getTodoByDate = (date) => {
    // TODO, should use a date library probably
  };

  /*
   **
   **
   */
  const query = (method, payload) => {
    if (method === "TodoByCategory") {
      return getTodoByCategory(payload.category);
    }
    if (method === "TodoByDate") {
      // _queryCallback("query", getTodoByDate(payload.date)); //Arguements are assumed
    } else if (method === "Categories") {
      return JSON.parse(JSON.stringify(categoryDict));
    } else {
      return null;
      // invalid method
    }
  };

  // Lower order fn
  const getIndexofID = (id) =>
    todoListArray.findIndex((element) => element.id === id);

  // Lower order fn used by "modify"
  const modifyTodo = (payload) => {
    const todoIndex = getIndexofID(payload.id);
    const prototypeKeys = Object.keys(Todo());
    const payloadKeys = Object.keys(payload);
    prototypeKeys.forEach((key) => {
      if (key !== "id" && payloadKeys.includes(key)) {
        try {
          todoListArray[todoIndex][key] = payload[key];
          if (key === "active") {
            todoListArray[todoIndex].completionDate =
              payload.active === false ? new Date() : null;
          }
          localStorageStoreTodo(todoListArray[todoIndex]);
        } catch {
          /* Do Nothing */
        }
      }
    });
  };

  /*
   **
   **
   */
  const modify = (method, payload) => {
    if (method === "Todo") {
      modifyTodo(payload);
    } else if (method === "Category") {
      // no reason to modify a category yet, but the future does exist
    } else {
      // invalid method
    }
  };

  // Lower order fn
  const removeCategory = (category) => {
    if (Object.prototype.hasOwnProperty.call(categoryDict, category)) {
      delete categoryDict[category];
      localStorage.setItem(categoryKey, JSON.stringify(categoryDict));
    } else {
      console.log("nothing happens");
      // category does not exist in categoryDict to begin with
    }
  };

  /*
   **
   **
   */
  const remove = (method, payload) => {
    if (method === "Category") {
      removeCategory(payload);
    } else {
      // invalid method
    }
  };

  /*
   **
   **
   **
   */
  const debugPrintState = () => {
    console.log("Todo State: ");
    console.log(todoListArray);
    console.log("Category State: ");
    console.log(categoryDict);
  };

  // Invoking the load function
  localStorageLoadTodo();

  return { add, query, modify, remove, debugPrintState };
})();

export default TodoList;
