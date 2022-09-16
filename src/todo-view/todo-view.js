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

    const _Utilities = (() => {

        //
        const createText = (typeOfText, content) => {
            let container = document.createElement(typeOfText);
            container.appendChild(document.createTextNode(content));
            return container;
        }

        //
        const createImg = (src, classes) => {
            let returnImage = document.createElement("img");
            returnImage.src = src;
            if(classes.length){
                returnImage.classList.add(...classes);
            }
            console.log(returnImage)
            return returnImage;
        }

        return{
            createText,
            createImg,
        }
    })();


    //
    const editTodoCallback = (e) => {
        console.log("edit");
    }

    //
    const changeDateCallback = (e) => {
        console.log("calendar");
    }

    //
    const checkOffTodoCallback = (e) => {
        console.log("DONE");
    }



    //Internal module that houses eventlistener callbacks
    //Exposed callbacks:
    const _Callbacks = (() => {

        const _CategoryBtn = (() => {

            let _activeCategoryModal = false;
            let _isModalActive = false;

            //lower order fn
            //used by submitCategoryFormCallback and initView
            const _removeCategoryModal = () => {
                _activeCategoryModal.parentNode.removeChild(_activeCategoryModal);
                _activeCategoryModal = false;
                _isModalActive = false;
            }

            //lower order fn
            //used by _createCategoryForm
            const _createCategoryChoice = (nameIn, forIn) => {
                let choice = document.createElement("p");
                let label = _Utilities.createText("label", forIn);
                let input = document.createElement("input");
                input.type = "radio";
                input.id = forIn;
                input.name = nameIn;
                input.value = forIn;
                input.required = "required";
                label.for = forIn;
                choice.appendChild(input);
                choice.appendChild(label);        
                return choice;
            }

            //
            //
            const submitCategoryFormCallback = (eventTarget) => {
                let catgorySelection = document.forms.categoryForm.elements.categoryChoice.value;
                let todoLi = eventTarget.parentNode.parentNode.parentNode;
            
                TodoController.categorizeTodo(todoLi.id, catgorySelection);
                _removeCategoryModal();
                _MenuTools.refreshView();              
            }

            //lower order fn 
            //used by createCategoryForm
            const _createSubmitButton = (valueIn) => {
                let wrapper = document.createElement("p");
                let btn = document.createElement("input");
                btn.type = "submit";
                btn.value = valueIn;
                wrapper.classList.add("submit-btn");
                wrapper.appendChild(btn);
                return wrapper;
            }

            //lower oder fn
            //used by categorizeTodoCallback
            const _createCategoryForm = (parentElement) => {
                let categories = TodoController.getCategories();
                let catForm = document.createElement("form"); 
                catForm.name = "categoryForm";
                catForm.classList.add("todo-btn-category-options");
                catForm.appendChild(_Utilities.createText("h1", "Change category to:"));
                for(let i = 0; i < categories.length; i++){
                    catForm.appendChild(_createCategoryChoice("categoryChoice", categories[i]));
                }
                catForm.appendChild(_createSubmitButton("Submit category choice"));
                catForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    submitCategoryFormCallback(e.target);
                    return false;
                });        
                _activeCategoryModal = catForm;
                parentElement.appendChild(catForm);
                setTimeout(()=>_isModalActive = true, 0)
            }

            //Creates the form which will categorize the todo, if submitted
            const categorizeTodoCallback = (e) => {
                let btnWrapper = e.currentTarget.parentNode;
                if(_isModalActive){
                    _removeCategoryModal();
                }        
                _createCategoryForm(btnWrapper);
            }

            const removeCategoryModalCallback = (e) =>{
                if(_isModalActive && !_activeCategoryModal.contains(e.target)){
                    _removeCategoryModal();
                }
            }

            return {
                categorizeTodoCallback,
                removeCategoryModalCallback,
            }
        })();

        const categorize = _CategoryBtn.categorizeTodoCallback;
        const removeCategoryModal = _CategoryBtn.removeCategoryModalCallback;

        return {
            categorize,
            removeCategoryModal,
        }
    })();


    //Internal module used to create DOM elements based on todos
    //Exposed method: createTodo
    const _TodoDomTools = (() => {

        //lower order fn used in _createTodoButtons and _createTodoContentWrapper
        //this is invoked 4 times per todo
        const _createTodoBtn = (src, inputClasses, callback) => {
            let btn = document.createElement("img");
            btn.classList.add(...inputClasses);
            btn.src = src;
            btn.addEventListener('click', (e) => callback(e))
            return btn;
        }

        //lower order fn used in _createTodoContentWrapper
        const _createTodoButtons = () => {
            let btnWrapper = document.createElement("div");
            btnWrapper.classList.add("todo-btn-wrapper");
            btnWrapper.appendChild(_createTodoBtn(editSrc, ["todo-btn", "edit-todo-btn"], editTodoCallback));
            btnWrapper.appendChild(_createTodoBtn(callendarSrc, ["todo-btn", "change-date-btn"], changeDateCallback));
            btnWrapper.appendChild(_createTodoBtn(moveSrc, ["todo-btn", "change-categor-btn"], _Callbacks.categorize));
            return btnWrapper;
        }

        //lower order fn used in _createTodoContentWrapper
        const _createTodoContent = (todo) => {
            let content = document.createElement("div");
            content.classList.add("todo-content");
            content.appendChild(_Utilities.createText("h1", todo.title));
            content.appendChild(_Utilities.createText("h2", todo.description));
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
        const createTodo = (todo) => {
            let todoElement = document.createElement("li");
            todoElement.id = todo.id;
            todoElement.classList.add("todo-li")
            todoElement.appendChild(_createTodoContentWrapper(todo));
            todoElement.appendChild(document.createElement("hr"));
            return todoElement;
        }

        return {
            createTodo,
        }
    })();

    //Internal module used to populate the DOM with categories and todos 
    //Exposed methods: refreshView, selectMenu,
    const _MenuTools = (() => {

        //Internal Internal module used to build the category list
        //Exposed method: buildCategoryList
        const _MenuBuilder = (() => {
        
            //lower order fn
            //used by _buildMenuItem
            const _buildMenuItemImage = (imageSrc) => {
                let wrapperSpan = document.createElement("span");
                wrapperSpan.classList.add("project-icon-placeholder");
                wrapperSpan.appendChild(_Utilities.createImg(imageSrc, ["menu-bullet"]));
                return wrapperSpan;
            }
    
            //lower order fn
            //used in buildCategoryList and ?MAYBESOMETHINGELSE?
            const _buildMenuItem = (label) => {
                let menuItem = document.createElement("li");
                menuItem.classList.add('menu-item', 'menu-item-sizing');
                menuItem.appendChild(_buildMenuItemImage(bulletSrc));
                menuItem.appendChild(_Utilities.createText("h1", label));
                menuItem.id = label;
                menuItem.addEventListener('click', (e) => _MenuTools.selectMenu(e.currentTarget));
                return menuItem;
            }
    
            //lower order fn
            //used in refreshView
            const buildCategoryList = () => {
                let categories = TodoController.getCategories();
                let categoryList = document.querySelector(".project-list");
                while (categoryList.firstChild) {
                    categoryList.removeChild(categoryList.firstChild);
                }
                for(let i = 0; i < categories.length; i++){
                    categoryList.appendChild(_buildMenuItem(categories[i]));
                }
            }
    
            return{
                buildCategoryList,
            }
        })();

        //lower order fn 
        //used in selectMenu, _refreshView
        //removes all todo li from the DOM
        const _clearTodoList = () => {
            while (_todoList.firstChild) {
                _todoList.removeChild(_todoList.firstChild);
            }
        }

        //lower order fn
        //used in selectMenu, _refreshView
        const _populateTodoList = (todos) => {
            _clearTodoList();
            for(let i = 0; i < todos.length; i++){
                _todoList.appendChild(_TodoDomTools.createTodo(todos[i], i));
            }
        }

        //lower order fn
        //used in selectMenu
        const _updateTodoListHeader = () => {
            let textNode = document.createTextNode(_currentCategory.id);
            let todoListHeaderH1 = _todoListHeader.childNodes[1];
            todoListHeaderH1.removeChild(todoListHeaderH1.childNodes[0])
            _todoListHeader.childNodes[1].appendChild(textNode);
        }

        //lower order fn
        //used in selectMenu
        const _handleMenuActiveClass = (element) => {
            _currentCategory.classList.remove("menu-active");
            _currentCategory = element;
            element.classList.add("menu-active");
        }

        //
        //
        const selectMenu = (eTarget) => {
            _handleMenuActiveClass(eTarget);            
            _updateTodoListHeader();
            _populateTodoList(TodoController.selectCategory(eTarget.id));
        }

        //
        //
        const refreshView = () => {
            _MenuBuilder.buildCategoryList();            
            _populateTodoList(TodoController.getTodos());
        }

        return {
            refreshView,
            selectMenu,
        }
    })();

    //Internal Module used to set up add todo button
    const _TodoBtn =(() => {

        //lower order fn
        //used in _createAddTodoModalForm
        const createTextInput = (fieldName, label) => {
            let wrapper = document.createElement("p");
            let inputElement = document.createElement("input");
            let labelElement = _Utilities.createText("label", label);
            inputElement.type = "text";
            inputElement.id = fieldName;
            inputElement.name = fieldName;
            labelElement.for = fieldName;
            wrapper.appendChild(labelElement);
            wrapper.appendChild(inputElement);
            return wrapper;
        }

        //
        //
        const _createAddTodoModalForm = () => {
            let modalForm = document.createElement("form");
            modalForm.appendChild(_Utilities.createText("h1", "Add Todo"));
            modalForm.appendChild(createTextInput("modal-title", "Title"));
            modalForm.appendChild(createTextInput("modal-description", "Description"));
            modalForm.classList.add("modal-content");   
            return modalForm;
        } 

        //lower order fn 
        //used by setupTodoBtn
        const _createAddTodoModal = () => {
            let modal = document.createElement("div");
            modal.id = "add-todo-modal";
            modal.classList.add("modal");
            modal.appendChild(_createAddTodoModalForm());
            modal.addEventListener("click", (e) => {
                if (e.target == modal) {
                    modal.style.display = "none";
                }
            });
            document.body.appendChild(modal);
        }

        const init = () => {
            let todoBtn = document.querySelector(".add-todo-btn");
            todoBtn.addEventListener("click", () => {
                _createAddTodoModal();
            })
        }

        return {
            init,
        }
    })();

    //Called once on page load
    //
    const initView = () => {
        let menuItemUncategoried = document.getElementById("uncategorized");
        menuItemUncategoried.addEventListener('click', (e) => _MenuTools.selectMenu(e.currentTarget));
        _MenuTools.refreshView();
        _TodoBtn.init();

        //Event listener to remove category modal
        window.addEventListener('click', (e) => _Callbacks.removeCategoryModal(e));
    }    

    return{
        initView,
    }
})();

TodoView.initView();
