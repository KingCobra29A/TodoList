import isBefore from "date-fns/isBefore";
import addDays from "date-fns/addDays";
import formatDistace from "date-fns/formatDistance";
import "./style/css-reset.css";
import "./style/index.css";
import { TodoController } from "../todo-controller/todo-controller";
import bulletSrc from "./assets/noun-circle-5147182.svg";
import editSrc from "./assets/noun-edit-3094235.svg";
import unfilledCircleSrc from "./assets/noun-unfilled-circle-1157067.svg";
import checkboxSrc from "./assets/noun-checkbox-1043038.svg";
import optionsSrc from "./assets/noun-dots-1287551.svg";
import deleteSrc from "./assets/noun-trash-3552557.svg";

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
      inputElement.autocomplete = "off";
      return inputElement;
    };

    const createDateInput = (name) => {
      const inputElement = document.createElement("input");
      inputElement.type = "date";
      inputElement.id = name;
      inputElement.name = name;
      inputElement.min = "2022-09-00";
      return inputElement;
    };

    const createSelectInput = (choices, name, label) => {
      const wrapper = document.createElement("p");
      const labelElement = createLabel(name, label);
      const selectElement = document.createElement("select");
      wrapper.classList.add("input-field");
      selectElement.name = name;
      selectElement.id = name;
      choices.forEach((choice) => {
        const optionElement = document.createElement("option");
        optionElement.value = choice;
        optionElement.innerText = choice;
        selectElement.appendChild(optionElement);
      });
      wrapper.appendChild(labelElement);
      wrapper.appendChild(selectElement);
      return wrapper;
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
      const wrapper = element;
      const requiredField = element.querySelector("input");
      const label = element.querySelector("label");
      const ariaSpan = document.createElement("span");
      ariaSpan.classList.add("error");
      ariaSpan.setAttribute("aria-live", "polite");
      requiredField.required = true;
      requiredField.setCustomValidity("required field");
      requiredField.addEventListener("input", (e) => {
        validator(e.target);
      });
      label.classList.add("required-field");
      wrapper.appendChild(ariaSpan);
      return wrapper;
    };

    //
    const createFormField = (name, label, type) => {
      const wrapper = document.createElement("p");
      if (type === "textarea") {
        wrapper.classList.add("input-field");
        wrapper.appendChild(createLabel(name, label));
        wrapper.appendChild(createTextarea(name));
      } else if (type === "date") {
        wrapper.classList.add("input-field");
        wrapper.appendChild(createLabel(name, label));
        wrapper.appendChild(createDateInput(name));
      } else {
        wrapper.classList.add("input-field");
        wrapper.appendChild(createLabel(name, label));
        wrapper.appendChild(createTextInput(name));
      }
      return wrapper;
    };

    // lower order fn
    // used by createCategoryForm
    const createSubmitButton = (submitText) => {
      const btn = document.createElement("input");
      btn.type = "submit";
      btn.value = submitText;
      btn.classList.add("submit-btn");
      return btn;
    };

    const createCancelButton = () => {
      const btn = document.createElement("input");
      btn.type = "button";
      btn.value = "Cancel";
      btn.classList.add("cancel-btn");
      btn.addEventListener("click", () => {
        removeModal();
      });
      return btn;
    };

    const createFormControls = (submitText) => {
      const wrapper = document.createElement("p");
      wrapper.classList.add("form-controls");
      wrapper.appendChild(createCancelButton());
      wrapper.appendChild(createSubmitButton(submitText));
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
      } catch {
        /* continue regardles of error */
      }
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
      createSelectInput,
      required,
      createModal,
      removeModal,
      prepFormForModal,
      createFormControls,
    };
  })();

  // Internal module used to populate the DOM with categories and todos
  // Exposed methods: refreshView, selectMenu,
  const MenuTools = (() => {
    // Internal Internal module used to build the category list
    // Exposed method: buildCategoryList
    const MenuBuilder = (() => {
      const createDeleteCategoryModalForm = (e) => {
        const menuItem = e.currentTarget.parentElement.parentElement;
        const deleteCategoryForm = document.createElement("form");
        const title = Utilities.createText("h1", "Confirm delete category");
        const buttons = Utilities.createFormControls("Delete Category");
        deleteCategoryForm.classList.add("modal-content");
        deleteCategoryForm.appendChild(title);
        deleteCategoryForm.appendChild(buttons);
        deleteCategoryForm.addEventListener("submit", (e) => {
          e.preventDefault();
          setTimeout(buildCategoryList, 0);
          if (TodoController.deleteCategory(menuItem.id)) {
            setTimeout(
              () => document.getElementById("Uncategorized").click(),
              0
            );
          }
          Utilities.removeModal();
        });
        return deleteCategoryForm;
      };

      const deleteProjectCbk = (e) => {
        e.stopPropagation();
        Utilities.createModal(
          "delete-category-modal",
          createDeleteCategoryModalForm(e)
        );
        // fudge
        // setTimeout(buildCategoryList, 0);
        // if (TodoController.deleteCategory(menuItem.id)) {
        //  setTimeout(() => document.getElementById("Uncategorized").click(), 0);
        // }
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
            deleteProjectCbk(e)
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
      for (let i = 0; i < todos.length; i += 1) {
        todoList.appendChild(TodoDomTools.createTodo(todos[i], i));
      }
    };

    // lower order fn
    // used in selectMenu
    const updateTodoListHeader = (byDate) => {
      let textNode;
      if (byDate) {
        textNode = document.createTextNode("Due Today");
      } else {
        textNode = document.createTextNode(currentCategory.id);
      }
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
      if (eTarget.id === "today") {
        updateTodoListHeader(true);
        populateTodoList(TodoController.getUpcomingTodos());
      } else {
        updateTodoListHeader(false);
        populateTodoList(TodoController.selectCategory(eTarget.id));
      }
    };

    //
    //
    const refreshTodos = () => {
      populateTodoList(TodoController.getTodos());
    };

    const refreshCategories = MenuBuilder.buildCategoryList;

    return {
      refreshTodos,
      refreshCategories,
      selectMenu,
    };
  })();

  //
  const editTodoCallback = (e) => {
    const { id } = e.currentTarget.parentElement.parentElement.parentElement;
    const todo = TodoController.getTodoContentById(id);
    TodoBtn.createEditTodoModalForm(todo);
  };

  const deleteTodoCallback = (e) => {
    const { id } = e.currentTarget.parentElement.parentElement.parentElement;
    TodoController.deleteTodo(id);
    MenuTools.refreshTodos();
  };

  // HACK
  const checkOffTodoCallback = (e) => {
    const todoLi = e.target.parentNode.parentNode;
    TodoController.toggleTodoCompletionStatus(todoLi.id);
    setTimeout(MenuTools.refreshTodos(), 10);
  };

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

    const createTodoDeadlineDisplay = (deadline) => {
      const wrapper = document.createElement("span");
      wrapper.classList.add("todo-deadline");
      if (deadline) {
        let displayString;
        const isPastDue = isBefore(deadline, new Date());
        const isDueWithinWeek = isBefore(deadline, addDays(new Date(), 7));
        if (isPastDue) {
          displayString = formatDistace(deadline, new Date());
          displayString = displayString.concat(" overdue");
          wrapper.classList.add("deadline-overdue");
        } else if (isDueWithinWeek) {
          displayString = formatDistace(new Date(), deadline);
          displayString = "Due in ".concat(displayString);
          wrapper.classList.add("deadline-upcoming");
        } else {
          displayString = deadline.toISOString().substr(0, 10);
        }
        wrapper.appendChild(Utilities.createText("h2", displayString));
      }

      return wrapper;
    };

    // lower order fn used in createTodoContentWrapper
    const createTodoButtons = (src, classes, cbk) => {
      const btnWrapper = document.createElement("div");
      btnWrapper.classList.add("todo-btn-wrapper");
      btnWrapper.appendChild(createTodoBtn(src, classes, cbk));
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
        todoWrapper.appendChild(createTodoDeadlineDisplay(todo.date));
        todoWrapper.appendChild(
          createTodoButtons(
            editSrc,
            ["todo-btn", "edit-todo-btn"],
            editTodoCallback
          )
        );
      } else {
        todoWrapper.classList.add("todo-wrapper-inactive");
        todoWrapper.appendChild(
          createTodoBtn(checkboxSrc, ["todo-chip"], checkOffTodoCallback)
        );
        todoWrapper.appendChild(createTodoContent(todo));
        todoWrapper.appendChild(
          createTodoButtons(
            deleteSrc,
            ["todo-btn", "delete-todo-btn"],
            deleteTodoCallback
          )
        );
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

  // Internal Module used to set up add todo button
  const TodoBtn = (() => {
    const validateTitle = (title) => {
      const ariaSpan = title.nextSibling;
      if (!title.value) {
        title.setCustomValidity("required field");
        ariaSpan.innerText = "Title is a requried field";
      } else {
        title.setCustomValidity("");
        ariaSpan.innerText = "";
      }
    };

    //
    //
    const submitAddTodoFormCallback = () => {
      const formContents = document.forms.addTodoForm.elements;
      if (formContents.todoTitle.validity.valid) {
        const title = formContents.todoTitle.value;
        const description = formContents.todoDescription.value;
        const category = formContents.todoCategory.value;
        const date = formContents.todoDeadline.valueAsDate;
        TodoController.addTodo(title, description, category, date);
        Utilities.removeModal();
        MenuTools.refreshTodos();
      } else {
        validateTitle(formContents.todoTitle);
      }
    };

    const submitEditTodoFormCallback = (idIn) => {
      const id = idIn;
      return () => {
        const formContents = document.forms.editTodoForm.elements;
        const title = formContents.todoTitle.value;
        const description = formContents.todoDescription.value;
        const category = formContents.todoCategory.value;
        const date = formContents.todoDeadline.valueAsDate;

        TodoController.editTodo({ id, title, description, category, date });
        Utilities.removeModal();
        MenuTools.refreshTodos();
      };
    };

    //
    //
    const createTodoModalForm = (formTitle, name, callback) => {
      const modalForm = document.createElement("form");
      const titleField = Utilities.required(
        Utilities.createFormField("todoTitle", "Title: ", "text"),
        validateTitle
      );
      const descriptionField = Utilities.createFormField(
        "todoDescription",
        "Description: ",
        "textarea"
      );
      const deadlineField = Utilities.createFormField(
        "todoDeadline",
        "Deadline: ",
        "date"
      );
      const categoryField = Utilities.createSelectInput(
        ["Uncategorized"].concat(TodoController.getCategories()),
        "todoCategory",
        "Category: "
      );
      try {
        categoryField.querySelector("select").options[
          TodoController.getCurrentCategoryIndex() + 1
        ].defaultSelected = true;
      } catch {
        /* do nothing, but HACK, the need for this try box should be removed */
      }

      modalForm.name = name;
      modalForm.noValidate = true;
      modalForm.appendChild(Utilities.createText("h1", formTitle));
      modalForm.appendChild(titleField);
      modalForm.appendChild(descriptionField);
      modalForm.appendChild(deadlineField);
      modalForm.appendChild(categoryField);
      modalForm.appendChild(Utilities.createFormControls(formTitle));
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
      try {
        document
          .getElementById("todoDeadline")
          .setAttribute("value", todo.date.toISOString().substr(0, 10));
      } catch {
        /* do nothing, not all todos have deadlines defined */
      }
      document.getElementById("todoDescription").innerText = todo.description;
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
      const ariaSpan = category.nextSibling;
      if (!category.value) {
        category.setCustomValidity("required field");
        ariaSpan.innerText = "Category is a required field";
      } else if (
        TodoController.getCategories().includes(category.value) ||
        category.value.toLowerCase() === "today"
      ) {
        category.setCustomValidity(`${category.value} already exists`);
        ariaSpan.innerText = `${category.value} already exists`;
      } else {
        category.setCustomValidity("");
        ariaSpan.innerText = "";
      }
    };

    const submitAddCategoryFormCallback = () => {
      const { category } = document.forms.addCategoryForm.elements;
      if (category.validity.valid) {
        TodoController.addCategory(category.value);
        Utilities.removeModal();
        MenuTools.refreshCategories();
      } else {
        validateCategory(category);
      }
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
      modalForm.appendChild(Utilities.createFormControls("Add Category"));
      modalForm.noValidate = true;
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
    const menuItemToday = document.getElementById("today");
    menuItemUncategoried.addEventListener("click", (e) => {
      MenuTools.selectMenu(e.currentTarget);
    });
    menuItemToday.addEventListener("click", (e) => {
      MenuTools.selectMenu(e.currentTarget);
    });
    menuItemUncategoried.click();
    MenuTools.refreshCategories();
    MenuTools.refreshTodos();
    TodoBtn.init();
    AddCategoryBtn.init();
  };

  return {
    initView,
  };
})();

TodoView.initView();
