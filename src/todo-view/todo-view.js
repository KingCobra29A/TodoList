import './style/css-reset.css';
import './style/index.css';
import { TodoController } from './../todo-controller/todo-controller.js';
import bulletSrc from './assets/noun-circle-5147182.svg';

const TodoView = (() => {

    let bulletPointSrc = "src/todo-view/assets/noun-circle-5147182.svg";



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
        innerImg.src = bulletSrc;
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
    //used in buildCategoryList and
    const _buildMenuItem = (label) => {
        let menuItem = document.createElement("li");
        menuItem.classList.add("menu-item");
        menuItem.classList.add("menu-item-sizing");
        menuItem.appendChild(_buildMenuItemImage(bulletPointSrc));
        menuItem.appendChild(_buildMenuItemH1(label));
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

    return{
        buildCategoryList,
    }
})();

TodoView.buildCategoryList();