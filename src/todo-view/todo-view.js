import './style/css-reset.css';
import './style/index.css';
import { TodoController } from './../todo-controller/todo-controller.js';
import bulletSrc from './assets/noun-circle-5147182.svg';

const TodoView = (() => {

    let _todoListHeader = document.getElementById("todo-list-header");
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

    // lower order fn
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
    const buildCategoryList = () => {
        let categories = TodoController.getCategories();
        let categoryList = document.querySelector(".project-list");
        for(let i = 0; i < categories.length; i++){
            categoryList.appendChild(_buildMenuItem(categories[i]));
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
        _updateTodoListHeader();
        console.log(eTarget.id)
    }

    //
    //
    const setupMenuEventListeners = () => {

    }

    return{
        buildCategoryList,
    }
})();

TodoView.buildCategoryList();

/*
Event listener
remove all other active statuses
add new active status
modify todo-list
*/