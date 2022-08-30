const TodoList = (() => {
    let _todoList = [];
    let _categoryDict = {};
    let _index = 0;

    const Todo = (title, description, date, id) => {
        title;
        description;
        date;
        id;
        category: uncategorized;
        active: true;
    }

    //Lower order fn used by "add"
    const _addTodo = (title, description, date) => {
        _todoList.push(Todo(title, description, date, _index));
        _index += 1; /* HACK? */
    }

    //Lower order fn used by "add"
    const _addCategory = (input) => {
        if(!_categoryDict.hasOwnProperty(input)) _categoryDict[input] = true;
        else{
            //duplicate category, maybe take some action?
        }
    }

    /*
    **
    **
    */
    const add = (method, payload) => {
        if(method == "Todo"){
            //TODO: add validation to these parameters
            _addTodo(payload.title, payload.description, payload.data);
            //TODO: need to trigger event for view
        }
        else if(method == "Category"){
            _addCategory(payload.category);
            //TODO: need to trigger event for view
        }
        else{
            //invalid method
        }
    }

    //Lower order fn used by "query"
    const _getTodoByCategory = (category) => {
        return _todoList.filter((element) => element.active && element.category == category);
    }

    //Lower order fn used by "query"
    const _getTodoByDate = (date) => {
        //TODO
        return;
    }

    /*
    **
    **
    */
    const query = (method, payload) => {
        if(method == "Category"){
            _getTodoByCategory(payload.category); /* HACK This is returning a value that is not being used */
            //TODO: need to trigger event for view
        }
        else if(method == "Date"){
            _getTodoByDate(payload.date); /* HACK This is returning a value that is not being used */
            //TODO: need to trigger event for view
        }
        else{
            //invalid method
        }
    }

    //Lower order fn used by "modify"
    const _modifyTodoCategory = (input) => {
        //TODO
    }

    //Lower order fn used by "modify"
    const _modifyTodo = () => {
        //TODO
    }

    /*
    **
    **
    */
   const modify = (method, payload) => {
        //TODO
   }

   /*
   **
   **
   */
  const remove = (method, payload) => {
        //TODO
  }

    return {    add,
                query,
                modify,
                remove
            }

})();
