import './style/css-reset.css';
import './style/index.css';
import { TodoController } from './../todo-controller/todo-controller.js';
import bulletSrc from './assets/noun-circle-5147182.svg';
import editSrc from './assets/noun-edit-3094235.svg';
import callendarSrc from './assets/noun-schedule-4064788.svg';
import moveSrc from './assets/noun-send-folder-1678334.svg';


const TodoView = (() => {

    let _todoListHeader = document.getElementById("todo-list-header");
    let _todoList = document.getElementById("current-todos");
    let _currentCategory = document.querySelector(".menu-active");
    let todoBTN = document.querySelector(".add-todo-btn");


    todoBTN.addEventListener('click', () => {
        
    })

    function viewAddTodo(){
        event.preventDefault();
    }

    //lower order fn
    //used by _buildMenuItem
    const _buildMenuItemImage = (imageSrc) => {
        let wrapperSpan = document.createElement("span");
        let innerImg = document.createElement("img");
        wrapperSpan.classList.add("project-icon-placeholder");
        innerImg.classList.add("menu-bullet");
        innerImg.src = imageSrc;
        wrapperSpan.appendChild(innerImg);
        return wrapperSpan;
    }

    //lower order fn
    //used by _buildMenuItem
    const _buildMenuItemH1 = (label) => {
        let menuH1 = document.createElement("h1");
        let textNode = document.createTextNode(label);
        menuH1.appendChild(textNode);
        return menuH1;
    }

    //lower order fn
    //used in buildCategoryList and ?MAYBESOMETHINGELSE?
    const _buildMenuItem = (label) => {
        let menuItem = document.createElement("li");
        menuItem.classList.add("menu-item");
        menuItem.classList.add("menu-item-sizing");
        menuItem.appendChild(_buildMenuItemImage(bulletSrc));
        menuItem.appendChild(_buildMenuItemH1(label));
        menuItem.id = label;
        menuItem.addEventListener('click', (e) => selectMenu(e.currentTarget));
        return menuItem;
    }

    //
    //
    const _buildCategoryList = () => {
        let categories = TodoController.getCategories();
        let categoryList = document.querySelector(".project-list");
        for(let i = 0; i < categories.length; i++){
            categoryList.appendChild(_buildMenuItem(categories[i]));
        }
    }

    //
    const editTodoCallback = () => {
        console.log("edit");
    }

    //
    const changeDateCallback = () => {
        console.log("calendar");
    }

    //
    const categorizeTodoCallback = () => {
        console.log("categorize");
    }

    //
    const checkOffTodoCallback = () => {
        console.log("DONE");
    }

    //lower order fn used in _createTodoButtons and _createTodoContentWrapper
    //this is invoked 4 times per todo
    const _createTodoBtn = (src, inputClasses, callback) => {
        let btn = document.createElement("img");
        for(let i = 0; i < inputClasses.length; i++){
            btn.classList.add(inputClasses[i]);
        }
        btn.src = src;
        btn.addEventListener('click', () => callback())
        return btn;
    }

    
    //lower order fn used in _createTodoContentWrapper
    const _createTodoButtons = () => {
        let btnWrapper = document.createElement("div");
        btnWrapper.classList.add("todo-btn-wrapper");
        btnWrapper.appendChild(_createTodoBtn(editSrc, ["todo-btn", "edit-todo-btn"], editTodoCallback));
        btnWrapper.appendChild(_createTodoBtn(callendarSrc, ["todo-btn", "change-date-btn"], changeDateCallback));
        btnWrapper.appendChild(_createTodoBtn(moveSrc, ["todo-btn", "change-categor-btn"], categorizeTodoCallback));
        return btnWrapper;
    }

    //lower order fn used by _createTodoContent
    const createText = (typeOfText, content) => {
        let container = document.createElement(typeOfText);
        container.appendChild(document.createTextNode(content));
        return container;
    }

    //lower order fn used in _createTodoContentWrapper
    const _createTodoContent = (todo) => {
        let content = document.createElement("div");
        content.classList.add("todo-content");
        content.appendChild(createText("h1", todo.title));
        content.appendChild(createText("h2", todo.description));
        return content;
    }

    //lower order fn used in createTodo
    const _createTodoContentWrapper = (todo) => {
        let todoWrapper = document.createElement("div");
        todoWrapper.classList.add("todo-wrapper")
        todoWrapper.appendChild(_createTodoBtn(bulletSrc, ["todo-chip"], checkOffTodoCallback));
        todoWrapper.appendChild(_createTodoContent(todo));
        todoWrapper.appendChild(_createTodoButtons());
        return todoWrapper;
    }

    //returns a li which represents a todo
    //id of the li is set to index
    //used in _populateTodoList
    const _createTodo = (todo, index) => {
        let todoElement = document.createElement("li");
        todoElement.id = index;
        todoElement.classList.add("todo-li")
        todoElement.appendChild(_createTodoContentWrapper(todo));
        todoElement.appendChild(document.createElement("hr"));
        return todoElement;
    }

    //lower order fn used in selectMenu
    //removes all todo li from the DOM
    const _clearTodoList = () => {
        while (_todoList.firstChild) {
            _todoList.removeChild(_todoList.firstChild);
        }
    }

    //lower order fn used in selectMenu
    //
    const _populateTodoList = (todos) => {
        console.log(todos);
        for(let i = 0; i < todos.length; i++){
            _todoList.appendChild(_createTodo(todos[i], i));
        }
    }

    //
    //
    const _updateTodoListHeader = () => {
        let textNode = document.createTextNode(_currentCategory.id);
        let todoListHeaderH1 = _todoListHeader.childNodes[1];
        todoListHeaderH1.removeChild(todoListHeaderH1.childNodes[0])
        _todoListHeader.childNodes[1].appendChild(textNode);
    }

    //
    //
    const _removeMenuActiveClass = () => {
        _currentCategory.classList.remove("menu-active");
    }

    //
    //
    const _setMenuActive = (element) => {
        element.classList.add("menu-active");
        _currentCategory = element;
    }

    //
    //
    const selectMenu = (eTarget) => {
        _removeMenuActiveClass();
        _setMenuActive(eTarget);
        _clearTodoList();
        _updateTodoListHeader();
        _populateTodoList(TodoController.selectCategory(eTarget.id));
    }

    //
    //
    const initView = () => {
        let menuItemUncategoried = document.getElementById("uncategorized");
        menuItemUncategoried.addEventListener('click', (e) => selectMenu(e.currentTarget));
        _buildCategoryList();

    }

    

    return{
        initView,
    }
})();

TodoView.initView();

/*
Event listener
remove all other active statuses
add new active status
modify todo-list
*/