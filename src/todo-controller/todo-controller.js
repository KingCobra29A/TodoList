import { TodoList } from './../todo-model/todo-model.js';

export const TodoController = (() => {

    let _currentTodos;
    let _currentCategory;

    const getCategories = () => {
        return Object.keys(TodoList.query("Categories", null));

    }

    const getTodos = () => {
        return TodoList.query("TodoByCategory", {category:_currentCategory});
    }

    const selectCategory = (categoryIn) => {
        _currentCategory = categoryIn;
        _currentTodos = getTodos();
        return _currentTodos;
    }

    const categorizeTodo = (id, category) => {
        TodoList.modify("Todo", {id, category})
    }

    const addTodo = (title, description, date) => {
        TodoList.add("Todo", {title, description, date});
    }

    const toggleTodoCompletionStatus = (id) => {
        let todo = _currentTodos.filter(todo => todo.id == id)[0];
        if(todo.active == true){
            TodoList.modify("Todo", {id, active: false});
        }
        else{
            TodoList.modify("Todo", {id, active: true});
        }
    }

    return {
        getCategories,
        getTodos,
        selectCategory,
        categorizeTodo,
        addTodo,
        toggleTodoCompletionStatus,       
    };
})();

