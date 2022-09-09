import { TodoList } from './../todo-model/todo-model.js';

export const TodoController = (() => {

    const getCategories = () => {
        return Object.keys(TodoList.query("Categories", null));

    }

    const modelCallback = (method, payload) => {
        
    }


    return {    
        modelCallback,
        getCategories,
    };
})();

