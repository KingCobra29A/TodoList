import "./style/css-reset.css";
import "./style/index.css";
import { TodoController } from "../todo-controller/todo-controller";
import bulletSrc from "./assets/noun-circle-5147182.svg";
import editSrc from "./assets/noun-edit-3094235.svg";
import callendarSrc from "./assets/noun-schedule-4064788.svg";
import moveSrc from "./assets/noun-send-folder-1678334.svg";
import unfilledCircleSrc from "./assets/noun-unfilled-circle-1157067.svg";
import checkboxSrc from "./assets/noun-checkbox-1043038.svg";
import optionsSrc from "./assets/noun-dots-1287551.svg";
import deleteSrc from "./assets/noun-delete-1610849.svg";

const TodoView = (() => {
  const todoListHeader = document.getElementById("todo-list-header");
  const todoList = document.getElementById("current-todos");
  let currentCategory = document.querySelector(".menu-active");

  const Utilities = (() => {
    //
    const createText = (typeOfText, content) => {
      const container = document.createElement(typeOfText);
      container.appendChild(document.createTextNode(content));
      return container;
    };

    //
    const createImg = (src, classes) => {
      const returnImage = document.createElement("img");
      returnImage.src = src;
      if (classes.length) {
        returnImage.classList.add(...classes);
      }
      return returnImage;
    };

    //
    const createLabel = (name, label) => {
      const labelElement = createText("label", label);
      labelElement.htmlFor = name;
      return labelElement;
    };

    //
    const createTextInput = (name) => {
      const inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.id = name;
      inputElement.name = name;
      return inputElement;
    };

    //
    const createRadioInput = (value, fieldsetName) => {
      const inputElement = document.createElement("input");
      inputElement.type = "radio";
      inputElement.id = value;
      inputElement.value = value;
      inputElement.name = fieldsetName;
      return inputElement;
    };

    //
    const createTextarea = (name) => {
      const textareaElement = document.createElement("textarea");
      textareaElement.id = name;
      textareaElement.name = name;
      return textareaElement;
    };

    //
    const required = (element, validator) => {
      const requiredField = element.querySelector("input");
      const label = element.querySelector("label");
      requiredField.required = true;
      requiredField.setCustomValidity("required field");
      requiredField.addEventListener("input", (e) => {
        validator(e.target);
      });
      label.classList.add("required-field");
      return element;
    };

    //
    const createFormField = (name, label, type) => {
      const wrapper = document.createElement("p");
      if (type === "textarea") {
        wrapper.classList.add("input-field");
        wrapper.appendChild(createLabel(name, label));
        wrapper.appendChild(createTextarea(name));
      } else {
        wrapper.classList.add("input-field");
        wrapper.appendChild(createLabel(name, label));
        wrapper.appendChild(createTextInput(name));
      }
      return wrapper;
    };

    //
    const createRadioFieldset = (values, fieldsetName, classes) => {
      const fieldsetElement = document.createElement("fieldset");
      fieldsetElement.classList.add(...classes);
      for (let i = 0; i < values.length; i += 1) {
        const wrapper = document.createElement("p");
        wrapper.classList.add("radio-field");
        wrapper.appendChild(createRadioInput(values[i], fieldsetName));
        wrapper.appendChild(createLabel(values[i], values[i]));
        fieldsetElement.appendChild(wrapper);
      }
      return fieldsetElement;
    };

    // lower order fn
    // used by createCategoryForm
    const createSubmitButton = (valueIn) => {
      const wrapper = document.createElement("p");
      const btn = document.createElement("input");
      btn.type = "submit";
      btn.value = valueIn;
      wrapper.classList.add("submit-btn");
      wrapper.appendChild(btn);
      return wrapper;
    };

    //
    const createModal = (id, form) => {
      const modal = document.createElement("div");
      modal.id = id;
      modal.classList.add("modal");
      modal.appendChild(form);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.parentNode.removeChild(modal);
        }
      });
      document.body.appendChild(modal);
      modal.querySelector("input").focus();
    };

    const removeModal = () => {
      try {
        document.querySelector(".modal").click();
      } catch {}
    };

    const prepFormForModal = (modalForm, callback) => {
      modalForm.classList.add("modal-content");
      modalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        callback(e);
        return false;
      });
    };

    return {
      createText,
      createImg,
      createFormField,
      createRadioFieldset,
      required,
      createSubmitButton,
      createModal,
      removeModal,
      prepFormForModal,
    };
  })();

  //
  const editTodoCallback = (e) => {
    const { id } = e.currentTarget.parentElement.parentElement.parentElement;
    const todo = TodoController.getTodoContentById(id);
    console.log(todo);
    TodoBtn.createEditTodoModalForm(todo);
  };

  //
  const changeDateCallback = (e) => {
    console.log("calendar");
  };

  // HACK
  const checkOffTodoCallback = (e) => {
    const todoLi = e.target.parentNode.parentNode;
    console.log(todoLi);
    TodoController.toggleTodoCompletionStatus(todoLi.id);
    setTimeout(MenuTools.refreshView(), 10);
  };

  // Internal module that houses eventlistener callbacks
  // Exposed callbacks:
  const Callbacks = (() => {
    const MiniModal = (() => {
      let activeMiniModal = false;
      let isModalActive = false;

      const getActive = () => isModalActive;

      // lower order fn
      // used by submitCategoryFormCallback and initView
      const removeMM = () => {
        activeMiniModal.parentNode.removeChild(activeMiniModal);
        activeMiniModal = false;
        isModalActive = false;
      };

      const removeMMCbk = (e) => {
        if (isModalActive && !activeMiniModal.contains(e.target)) {
          removeMM();
        }
      };

      const createMM = (parentElement, inputFormGenerator) => {
        const inputForm = inputFormGenerator();
        if (isModalActive) {
          removeMM();
        }
        inputForm.classList.add("mini-modal");
        activeMiniModal = inputForm;
        parentElement.appendChild(inputForm);
        setTimeout(() => (isModalActive = true), 0);
      };

      return {
        getActive,
        removeMM,
        removeMMCbk,
        createMM,
      };
    })();

    const CategorizeTodoBtn = (() => {
      // Called when the category modal form is submitted
      // Todo is categorized and the view is refreshed
      const submitCategoryFormCallback = (eventTarget) => {
        const catgorySelection =
          document.forms.categoryForm.elements.categoryChoice.value;
        const todoLi = eventTarget.parentNode.parentNode.parentNode;
        TodoController.categorizeTodo(todoLi.id, catgorySelection);
        MiniModal.removeMM();
        MenuTools.refreshView();
      };

      // lower oder fn
      // used by categorizeTodoCallback
      const createCategoryForm = () => {
        const categories = TodoController.getCategories();
        const catForm = document.createElement("form");
        catForm.name = "categoryForm";
        catForm.appendChild(Utilities.createText("h1", "Change category to:"));
        catForm.appendChild(
          Utilities.createRadioFieldset(categories, "categoryChoice", [])
        );
        catForm.appendChild(
          Utilities.createSubmitButton("Submit category choice")
        );
        catForm.addEventListener("submit", (e) => {
          e.preventDefault();
          submitCategoryFormCallback(e.target);
          return false;
        });
        return catForm;
      };

      // Creates the form which will categorize the todo, if submitted
      const categorizeTodoCallback = (e) => {
        const btnWrapper = e.currentTarget.parentNode;
        MiniModal.createMM(btnWrapper, createCategoryForm);
      };

      return {
        categorizeTodoCallback,
      };
    })();

    const categorize = CategorizeTodoBtn.categorizeTodoCallback;
    const removeMiniModal = MiniModal.removeMMCbk;

    return {
      categorize,
      removeMiniModal,
    };
  })();

  // Internal module used to create DOM elements based on todos
  // Exposed method: createTodo
  const TodoDomTools = (() => {
    // lower order fn used in createTodoButtons and createTodoContentWrapper
    // this is invoked 4 times per todo
    const createTodoBtn = (src, inputClasses, callback) => {
      const btn = document.createElement("img");
      btn.classList.add(...inputClasses);
      btn.src = src;
      btn.addEventListener("click", (e) => callback(e));
      return btn;
    };

    // lower order fn used in createTodoContentWrapper
    const createTodoButtons = () => {
      const btnWrapper = document.createElement("div");
      btnWrapper.classList.add("todo-btn-wrapper");
      btnWrapper.appendChild(
        createTodoBtn(editSrc, ["todo-btn", "edit-todo-btn"], editTodoCallback)
      );
      btnWrapper.appendChild(
        createTodoBtn(
          callendarSrc,
          ["todo-btn", "change-date-btn"],
          changeDateCallback
        )
      );
      btnWrapper.appendChild(
        createTodoBtn(
          moveSrc,
          ["todo-btn", "change-categor-btn"],
          Callbacks.categorize
        )
      );
      return btnWrapper;
    };

    // lower order fn used in createTodoContentWrapper
    const createTodoContent = (todo) => {
      const content = document.createElement("div");
      content.classList.add("todo-content");
      content.appendChild(Utilities.createText("h1", todo.title));
      content.appendChild(Utilities.createText("h2", todo.description));
      return content;
    };

    // lower order fn used in createTodo
    const createTodoContentWrapper = (todo) => {
      const todoWrapper = document.createElement("div");
      todoWrapper.classList.add("todo-wrapper");
      if (todo.active === true) {
        todoWrapper.appendChild(
          createTodoBtn(unfilledCircleSrc, ["todo-chip"], checkOffTodoCallback)
        );
        todoWrapper.appendChild(createTodoContent(todo));
        todoWrapper.appendChild(createTodoButtons());
      } else {
        todoWrapper.classList.add("todo-wrapper-inactive");
        todoWrapper.appendChild(
          createTodoBtn(checkboxSrc, ["todo-chip"], checkOffTodoCallback)
        );
        todoWrapper.appendChild(createTodoContent(todo));
      }
      return todoWrapper;
    };

    // returns a li which represents a todo
    // id of the li is set to index
    // used in populateTodoList
    const createTodo = (todo) => {
      const todoElement = document.createElement("li");
      todoElement.id = todo.id;
      todoElement.classList.add("todo-li");
      todoElement.appendChild(createTodoContentWrapper(todo));
      todoElement.appendChild(document.createElement("hr"));
      return todoElement;
    };

    return {
      createTodo,
    };
  })();

  // Internal module used to populate the DOM with categories and todos
  // Exposed methods: refreshView, selectMenu,
  const MenuTools = (() => {
    // Internal Internal module used to build the category list
    // Exposed method: buildCategoryList
    const MenuBuilder = (() => {
      const deleteProjectCbk = (currentTarget) => {
        const menuItem = currentTarget.parentElement.parentElement;
        setTimeout(buildCategoryList, 0);
        if (TodoController.deleteCategory(menuItem.id)) {
          setTimeout(() => document.getElementById("Uncategorized").click(), 0);
        }
      };

      // lower order fn
      // used by buildMenuItem
      const buildMenuItemImage = (
        imageSrc,
        wrapperClasses,
        imageClasses,
        callback
      ) => {
        const wrapperSpan = document.createElement("span");
        wrapperSpan.classList.add(...wrapperClasses);
        wrapperSpan.appendChild(Utilities.createImg(imageSrc, imageClasses));
        if (callback) {
          wrapperSpan.firstChild.addEventListener("click", (e) =>
            deleteProjectCbk(e.currentTarget)
          );
        }
        return wrapperSpan;
      };

      // lower order fn
      // used in buildCategoryList and ?MAYBESOMETHINGELSE?
      const buildMenuItem = (label) => {
        const menuItem = document.createElement("li");
        menuItem.classList.add("menu-item", "menu-item-sizing");
        menuItem.appendChild(
          buildMenuItemImage(
            bulletSrc,
            ["project-icon-placeholder"],
            ["menu-bullet"],
            null
          )
        );
        menuItem.appendChild(Utilities.createText("h1", label));
        menuItem.appendChild(
          buildMenuItemImage(
            deleteSrc,
            ["project-options-wrapper", "project-options-inactive"],
            ["project-options"],
            deleteProjectCbk
          )
        );
        menuItem.id = label;
        menuItem.addEventListener("click", (e) =>
          MenuTools.selectMenu(e.currentTarget)
        );
        menuItem.addEventListener("mouseover", (e) => {
          if (
            e.currentTarget.childNodes[2].classList.contains(
              "project-options-inactive"
            )
          ) {
            e.currentTarget.childNodes[2].classList.remove(
              "project-options-inactive"
            );
          }
        });
        menuItem.addEventListener("mouseout", (e) => {
          if (
            !e.currentTarget.childNodes[2].classList.contains(
              "project-options-inactive"
            )
          ) {
            e.currentTarget.childNodes[2].classList.add(
              "project-options-inactive"
            );
          }
        });
        return menuItem;
      };

      // lower order fn
      // used in refreshView
      const buildCategoryList = () => {
        const categories = TodoController.getCategories();
        const categoryList = document.querySelector(".project-list");
        while (categoryList.firstChild) {
          categoryList.removeChild(categoryList.firstChild);
        }
        for (let i = 0; i < categories.length; i += 1) {
          categoryList.appendChild(buildMenuItem(categories[i]));
        }
      };

      return {
        buildCategoryList,
      };
    })();

    // lower order fn
    // used in selectMenu, _refreshView
    // removes all todo li from the DOM
    const clearTodoList = () => {
      while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
      }
    };

    // lower order fn
    // used in selectMenu, _refreshView
    const populateTodoList = (todos) => {
      clearTodoList();
      todos.sort((a, b) => (a.active == b.active ? 0 : a.active ? -1 : 1));
      for (let i = 0; i < todos.length; i += 1) {
        todoList.appendChild(TodoDomTools.createTodo(todos[i], i));
      }
    };

    // lower order fn
    // used in selectMenu
    const updateTodoListHeader = () => {
      const textNode = document.createTextNode(currentCategory.id);
      const todoListHeaderH1 = todoListHeader.childNodes[1];
      todoListHeaderH1.removeChild(todoListHeaderH1.childNodes[0]);
      todoListHeader.childNodes[1].appendChild(textNode);
    };

    // lower order fn
    // used in selectMenu
    const handleMenuActiveClass = (element) => {
      currentCategory.classList.remove("menu-active");
      currentCategory = element;
      element.classList.add("menu-active");
    };

    //
    //
    const selectMenu = (eTarget) => {
      handleMenuActiveClass(eTarget);
      updateTodoListHeader();
      populateTodoList(TodoController.selectCategory(eTarget.id));
    };

    //
    //
    const refreshView = () => {
      MenuBuilder.buildCategoryList();
      populateTodoList(TodoController.getTodos());
    };

    return {
      refreshView,
      selectMenu,
    };
  })();

  // Internal Module used to set up add todo button
  const TodoBtn = (() => {
    const validateTitle = (title) => {
      console.log(title.value);
      if (!title.value) {
        title.setCustomValidity("required field");
      } else {
        title.setCustomValidity("");
      }
    };

    //
    //
    const submitAddTodoFormCallback = (e) => {
      const formContents = document.forms.addTodoForm.elements;
      const title = formContents.todoTitle.value;
      const description = formContents.todoDescription.value;

      TodoController.addTodo(title, description, null);
      Utilities.removeModal();
      MenuTools.refreshView();
    };

    const submitEditTodoFormCallback = (idIn) => {
      const id = idIn;
      return () => {
        const formContents = document.forms.editTodoForm.elements;
        const title = formContents.todoTitle.value;
        const description = formContents.todoDescription.value;
        TodoController.editTodo({ id, title, description });
        Utilities.removeModal();
        MenuTools.refreshView();
      };
    };

    //
    //
    const createTodoModalForm = (formTitle, name, callback) => {
      const modalForm = document.createElement("form");
      modalForm.name = name;
      modalForm.appendChild(Utilities.createText("h1", formTitle));
      modalForm.appendChild(
        Utilities.required(
          Utilities.createFormField("todoTitle", "Title: ", "text"),
          validateTitle
        )
      );
      modalForm.appendChild(
        Utilities.createFormField(
          "todoDescription",
          "Description: ",
          "textarea"
        )
      );
      modalForm.appendChild(Utilities.createSubmitButton(formTitle));
      Utilities.prepFormForModal(modalForm, callback);
      return modalForm;
    };

    //
    //
    const createEditTodoModalForm = (todo) => {
      Utilities.createModal(
        "edit-todo-modal",
        createTodoModalForm(
          "Edit Todo",
          "editTodoForm",
          submitEditTodoFormCallback(todo.id)
        )
      );
      const title = document.getElementById("todoTitle");
      title.setAttribute("value", todo.title);
      title.setCustomValidity("");
      document
        .getElementById("todoDescription")
        .setAttribute("value", todo.description);
      document.getElementById("todoDescription").innerText = todo.description;
      console.log(document.getElementById("todoDescription"));
    };

    const init = () => {
      const todoBtn = document.querySelector(".add-todo-btn");
      todoBtn.addEventListener("click", () => {
        Utilities.createModal(
          "add-todo-modal",
          createTodoModalForm(
            "Add Todo",
            "addTodoForm",
            submitAddTodoFormCallback
          )
        );
      });
    };

    return {
      init,
      createEditTodoModalForm,
    };
  })();

  const AddCategoryBtn = (() => {
    const validateCategory = (category) => {
      if (!category.value) {
        category.setCustomValidity("required field");
      } else if (TodoController.getCategories().includes(category.value)) {
        category.setCustomValidity(`${category.value} already exists`);
      } else {
        category.setCustomValidity("");
      }
    };

    const submitAddCategoryFormCallback = (e) => {
      const formContents = document.forms.addCategoryForm.elements;
      const category = formContents.category.value;
      TodoController.addCategory(category);
      Utilities.removeModal();
      MenuTools.refreshView();
    };

    const createAddCategoryModalForm = () => {
      const modalForm = document.createElement("form");
      modalForm.name = "addCategoryForm";
      modalForm.appendChild(Utilities.createText("h1", "Add Category"));
      modalForm.appendChild(
        Utilities.required(
          Utilities.createFormField("category", "Category: ", "text"),
          validateCategory
        )
      );
      modalForm.appendChild(Utilities.createSubmitButton("Add Category"));
      Utilities.prepFormForModal(modalForm, submitAddCategoryFormCallback);
      return modalForm;
    };

    const init = () => {
      const addCategoryBtn = document.querySelector(".add-project-btn");
      addCategoryBtn.addEventListener("click", () => {
        Utilities.createModal(
          "add-category-modal",
          createAddCategoryModalForm()
        );
      });
    };

    return {
      init,
    };
  })();

  // Called once on page load
  //
  const initView = () => {
    const menuItemUncategoried = document.getElementById("Uncategorized");
    menuItemUncategoried.addEventListener("click", (e) =>
      MenuTools.selectMenu(e.currentTarget)
    );
    menuItemUncategoried.click();
    MenuTools.refreshView();
    TodoBtn.init();
    AddCategoryBtn.init();

    // Event listener to remove category modal
    window.addEventListener("click", (e) => Callbacks.removeMiniModal(e)); // HACK
  };

  return {
    initView,
  };
})();

TodoView.initView();
