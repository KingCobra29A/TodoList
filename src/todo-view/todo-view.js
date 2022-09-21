import './style/css-reset.css';
import './style/index.css';
import { TodoController } from './../todo-controller/todo-controller.js';
import bulletSrc from './assets/noun-circle-5147182.svg';
import editSrc from './assets/noun-edit-3094235.svg';
import callendarSrc from './assets/noun-schedule-4064788.svg';
import moveSrc from './assets/noun-send-folder-1678334.svg';
import unfilledCircleSrc from './assets/noun-unfilled-circle-1157067.svg';
import checkboxSrc from './assets/noun-checkbox-1043038.svg';
import optionsSrc from './assets/noun-dots-1287551.svg';
import deleteSrc from './assets/noun-delete-1610849.svg';

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
            return returnImage;
        }

        //
        const _createLabel = (name, label) => {
            let labelElement = createText("label", label);
            labelElement.htmlFor = name;
            return labelElement;
        }

        //
        const _createTextInput = (name) => {
            let inputElement = document.createElement("input");
            inputElement.type = "text";
            inputElement.id = name;
            inputElement.name = name;
            return inputElement;
        }

        //
        const _createRadioInput = (value, fieldsetName) => {
            let inputElement = document.createElement("input");
            inputElement.type = "radio"
            inputElement.id = value;
            inputElement.value = value;
            inputElement.name = fieldsetName;
            return inputElement;
        }

        //
        const _createTextarea = (name) => {
            let textareaElement = document.createElement("textarea");
            textareaElement.id = name;
            textareaElement.name = name;
            return textareaElement;
        }

        //
        const required = (element, validator) => {
            let requiredField = element.querySelector("input");
            let label = element.querySelector("label");
            requiredField.required = true;
            requiredField.setCustomValidity("required field");
            requiredField.addEventListener('input', (e) => {
                validator(e.target);
            });
            label.classList.add("required-field");
            return element;
        } 

        //
        const createFormField = (name, label, type) => {
            let wrapper = document.createElement("p");
            if(type == "textarea"){
                wrapper.classList.add("input-field");
                wrapper.appendChild(_createLabel(name, label));
                wrapper.appendChild(_createTextarea(name));
            }
            else{
                wrapper.classList.add("input-field");
                wrapper.appendChild(_createLabel(name, label));
                wrapper.appendChild(_createTextInput(name));
            }
            return wrapper;
        }

        //
        const createRadioFieldset = (values, fieldsetName, classes) => {
            let fieldsetElement = document.createElement("fieldset");
            fieldsetElement.classList.add(...classes);
            for(let i = 0; i < values.length; i++){
                let wrapper = document.createElement("p");
                wrapper.classList.add("radio-field");
                wrapper.appendChild(_createRadioInput(values[i], fieldsetName));
                wrapper.appendChild(_createLabel(values[i], values[i]));
                fieldsetElement.appendChild(wrapper);
            }
            return fieldsetElement;
        }

        //lower order fn 
        //used by createCategoryForm
        const createSubmitButton = (valueIn) => {
            let wrapper = document.createElement("p");
            let btn = document.createElement("input");
            btn.type = "submit";
            btn.value = valueIn;
            wrapper.classList.add("submit-btn");
            wrapper.appendChild(btn);
            return wrapper;
        }

        //
        const createModal = (id, form) => {
            let modal = document.createElement("div");
            modal.id = id;
            modal.classList.add("modal");
            modal.appendChild(form);
            modal.addEventListener("click", (e) => {
                if (e.target == modal) {
                    modal.parentNode.removeChild(modal);
                }
            });
            document.body.appendChild(modal);
            modal.querySelector("input").focus();
        }

        const removeModal = () => {
            try {
                document.querySelector(".modal").click();
            }catch{};
        }

        const prepFormForModal = (modalForm, callback) => {
            modalForm.classList.add("modal-content");
            modalForm.addEventListener("submit", (e) => {
                e.preventDefault();
                callback(e);
                return false;
            });    
        }

        return{
            createText,
            createImg,
            createFormField,
            createRadioFieldset,
            required,
            createSubmitButton,
            createModal,
            removeModal,
            prepFormForModal,
        }
    })();


    //
    const editTodoCallback = (e) => {
        let id = e.currentTarget.parentElement.parentElement.parentElement.id;
        let todo = TodoController.getTodoContentById(id);
        console.log(todo);
        _TodoBtn.createEditTodoModalForm(todo);
    }

    //
    const changeDateCallback = (e) => {
        console.log("calendar");
    }

    // HACK
    const checkOffTodoCallback = (e) => {
        let todoLi = e.target.parentNode.parentNode;
        console.log(todoLi);
        TodoController.toggleTodoCompletionStatus(todoLi.id);
        setTimeout(_MenuTools.refreshView(), 10);
    }

    //Internal module that houses eventlistener callbacks
    //Exposed callbacks:
    const _Callbacks = (() => {

        const _MiniModal = (() => {

            let _activeMiniModal = false;
            let _isModalActive = false;

            let getActive = () => {return _isModalActive};

            //lower order fn
            //used by submitCategoryFormCallback and initView
            const removeMM = () => {
                _activeMiniModal.parentNode.removeChild(_activeMiniModal);
                _activeMiniModal = false;
                _isModalActive = false;
            }

            const removeMMCbk = (e) => {
                if(_isModalActive && !_activeMiniModal.contains(e.target)){
                    removeMM();
                }
            }

            const createMM = (parentElement, inputFormGenerator) => {
                let inputForm = inputFormGenerator();
                if(_isModalActive){
                    removeMM();
                }
                inputForm.classList.add("mini-modal");
                _activeMiniModal = inputForm;
                parentElement.appendChild(inputForm);
                setTimeout(()=>_isModalActive = true, 0);
            }

            return {
                getActive,
                removeMM,
                removeMMCbk,
                createMM,                
            }
        })();

        const _CategorizeTodoBtn = (() => {

            //Called when the category modal form is submitted
            //Todo is categorized and the view is refreshed
            const submitCategoryFormCallback = (eventTarget) => {
                let catgorySelection = document.forms.categoryForm.elements.categoryChoice.value;
                let todoLi = eventTarget.parentNode.parentNode.parentNode;
                TodoController.categorizeTodo(todoLi.id, catgorySelection);
                _MiniModal.removeMM();
                _MenuTools.refreshView();              
            }

            //lower oder fn
            //used by categorizeTodoCallback
            const _createCategoryForm = () => {
                let categories = TodoController.getCategories();
                let catForm = document.createElement("form"); 
                catForm.name = "categoryForm";
                catForm.appendChild(_Utilities.createText("h1", "Change category to:"));
                catForm.appendChild(_Utilities.createRadioFieldset(categories, "categoryChoice", []));
                catForm.appendChild(_Utilities.createSubmitButton("Submit category choice"));
                catForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    submitCategoryFormCallback(e.target);
                    return false;
                });
                return catForm;
            }

            //Creates the form which will categorize the todo, if submitted
            const categorizeTodoCallback = (e) => {
                let btnWrapper = e.currentTarget.parentNode;    
                _MiniModal.createMM(btnWrapper, _createCategoryForm);
            }

            return {
                categorizeTodoCallback,
            }
        })();

        const categorize = _CategorizeTodoBtn.categorizeTodoCallback;
        const removeMiniModal = _MiniModal.removeMMCbk;

        return {
            categorize,
            removeMiniModal,
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
            if(todo.active == true){
                todoWrapper.appendChild(_createTodoBtn(unfilledCircleSrc, ["todo-chip"], checkOffTodoCallback));
                todoWrapper.appendChild(_createTodoContent(todo));
                todoWrapper.appendChild(_createTodoButtons());
            }
            else{
                todoWrapper.classList.add("todo-wrapper-inactive");
                todoWrapper.appendChild(_createTodoBtn(checkboxSrc, ["todo-chip"], checkOffTodoCallback));
                todoWrapper.appendChild(_createTodoContent(todo));
            }          
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
        
            const _deleteProjectCbk = (currentTarget) => {
                let menuItem = currentTarget.parentElement.parentElement;
                setTimeout(buildCategoryList, 0);
                if(TodoController.deleteCategory(menuItem.id)){
                    setTimeout( () => document.getElementById("Uncategorized").click(), 0);
                }
            }

            //lower order fn
            //used by _buildMenuItem
            const _buildMenuItemImage = (imageSrc, wrapperClasses, imageClasses, callback) => {
                let wrapperSpan = document.createElement("span");
                wrapperSpan.classList.add(...wrapperClasses);
                wrapperSpan.appendChild(_Utilities.createImg(imageSrc, imageClasses));
                if(callback){
                    wrapperSpan.firstChild.addEventListener('click', (e) => _deleteProjectCbk(e.currentTarget))
                }
                return wrapperSpan;
            }

            //lower order fn
            //used in buildCategoryList and ?MAYBESOMETHINGELSE?
            const _buildMenuItem = (label) => {
                let menuItem = document.createElement("li");
                menuItem.classList.add('menu-item', 'menu-item-sizing');
                menuItem.appendChild(_buildMenuItemImage(bulletSrc, ["project-icon-placeholder"], ["menu-bullet"], null));
                menuItem.appendChild(_Utilities.createText("h1", label));
                menuItem.appendChild(_buildMenuItemImage(deleteSrc, ["project-options-wrapper", "project-options-inactive"], [ "project-options"], _deleteProjectCbk));
                menuItem.id = label;
                menuItem.addEventListener('click', (e) => _MenuTools.selectMenu(e.currentTarget));
                menuItem.addEventListener('mouseover', (e) => {
                    if(e.currentTarget.childNodes[2].classList.contains("project-options-inactive")){
                        e.currentTarget.childNodes[2].classList.remove("project-options-inactive")
                    }
                })
                menuItem.addEventListener('mouseout', (e) => {
                    if(!e.currentTarget.childNodes[2].classList.contains("project-options-inactive")){
                        e.currentTarget.childNodes[2].classList.add("project-options-inactive")
                    }
                })
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
            todos.sort((a,b) => {
                return (a.active == b.active)? 0 : (a.active? -1 : 1);
            })
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

        const _validateTitle = (title) => {
            console.log(title.value);
            if(!title.value){
                title.setCustomValidity("required field")
            }
            else{
                title.setCustomValidity("")
            }
        }

        //
        //
        const submitAddTodoFormCallback = (e) => {
            let formContents = document.forms.addTodoForm.elements;
            let title = formContents.todoTitle.value;
            let description = formContents.todoDescription.value;
            
            TodoController.addTodo(title, description, null);
            _Utilities.removeModal();
            _MenuTools.refreshView(); 
        }

        const submitEditTodoFormCallback = (idIn) => {
            let id = idIn;
            return () => {
                let formContents = document.forms.editTodoForm.elements;
                let title = formContents.todoTitle.value;
                let description = formContents.todoDescription.value;
                TodoController.editTodo({id, title, description});
                _Utilities.removeModal();
                _MenuTools.refreshView();
            }
        }

        //
        //
        const _createTodoModalForm = (formTitle, name, callback) => {
            let modalForm = document.createElement("form");
            modalForm.name = name;
            modalForm.appendChild(_Utilities.createText("h1", formTitle));
            modalForm.appendChild(_Utilities.required(_Utilities.createFormField("todoTitle", "Title: ", "text"), _validateTitle));
            modalForm.appendChild(_Utilities.createFormField("todoDescription", "Description: ", "textarea"));
            modalForm.appendChild(_Utilities.createSubmitButton(formTitle));
            _Utilities.prepFormForModal(modalForm, callback)
            return modalForm;
        }
        
        //
        //
        const createEditTodoModalForm = (todo) => {
            _Utilities.createModal("edit-todo-modal", _createTodoModalForm("Edit Todo", "editTodoForm", submitEditTodoFormCallback(todo.id)));
            let title = document.getElementById("todoTitle");
            title.setAttribute('value', todo.title);
            title.setCustomValidity("");
            document.getElementById("todoDescription").setAttribute('value', todo.description);
            document.getElementById("todoDescription").innerText = todo.description;
            console.log(document.getElementById("todoDescription"))
        }
        

        const init = () => {
            let todoBtn = document.querySelector(".add-todo-btn");
            todoBtn.addEventListener("click", () => {
                _Utilities.createModal("add-todo-modal", _createTodoModalForm("Add Todo", "addTodoForm", submitAddTodoFormCallback));
            })
        }

        return {
            init,
            createEditTodoModalForm,
        }
    })();

    const _AddCategoryBtn = (() => {

        const _validateCategory = (category) => {
            
            if(!category.value){
                category.setCustomValidity("required field")
            }
            else if(TodoController.getCategories().includes(category.value)){
                category.setCustomValidity(category.value + " already exists")
            }
            else{
                category.setCustomValidity("")
            }
        }

        const submitAddCategoryFormCallback = (e) => {
            let formContents = document.forms.addCategoryForm.elements;
            let category = formContents.category.value;
            TodoController.addCategory(category)
            _Utilities.removeModal();
            _MenuTools.refreshView();         
        }

        const _createAddCategoryModalForm = () => {
            let modalForm = document.createElement("form");
            modalForm.name = "addCategoryForm";
            modalForm.appendChild(_Utilities.createText("h1", "Add Category"));
            modalForm.appendChild(_Utilities.required(_Utilities.createFormField("category", "Category: ", "text"), _validateCategory));
            modalForm.appendChild(_Utilities.createSubmitButton("Add Category"));
            _Utilities.prepFormForModal(modalForm, submitAddCategoryFormCallback)
            return modalForm;
        }

        const init = () => {
            let addCategoryBtn = document.querySelector(".add-project-btn");
            addCategoryBtn.addEventListener("click", () => {
                _Utilities.createModal("add-category-modal", _createAddCategoryModalForm());
            })
        }

        return {
            init,
        }
    })();

    //Called once on page load
    //
    const initView = () => {
        let menuItemUncategoried = document.getElementById("Uncategorized");
        menuItemUncategoried.addEventListener('click', (e) => _MenuTools.selectMenu(e.currentTarget));
        menuItemUncategoried.click();
        _MenuTools.refreshView();
        _TodoBtn.init();
        _AddCategoryBtn.init();

        //Event listener to remove category modal
        window.addEventListener('click', (e) => _Callbacks.removeMiniModal(e)); //HACK
    }    

    return{
        initView,
    }
})();

TodoView.initView();
