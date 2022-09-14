import { TodoList } from './../todo-model/todo-model.js';

export const TodoController = (() => {

    let _currentTodos;
    let _currentCategory;

    const getCategories = () => {
        return Object.keys(TodoList.query("Categories", null));

    }

    const selectCategory = (categoryIn) => {
        _currentCategory = categoryIn;
        _currentTodos = TodoList.query("TodoByCategory", {category: categoryIn});
        return _currentTodos;
    }


    return {
        getCategories,
        selectCategory,
    };
})();

