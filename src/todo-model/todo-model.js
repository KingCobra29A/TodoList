import { v4 as uuidv4 } from 'uuid';

export const TodoList = (() => {
    let _todoList = [];
    let _categoryDict = {};
    let _categoryKey = "categories";    /*used in _localStorageLoadTodo, _addCategory methods*/
    //let _addCallback = todoController.modelCallback;
    //let _queryCallback = todoController.modelCallback;

    const Todo = (title, description, date, id) => {
        return {
            title,
            description,
            date,
            id,
            category: "uncategorized",
            active: true
        }
    }

    // TODO: make more robust
    const _localStorageStoreTodo = (state) => {
        if(window.localStorage){
            localStorage.setItem(state.id, JSON.stringify(state));
        }
        else{
            //no local storage
        }
    }

    // Loads the entire contents of localStorage into the _todoList array
    // TODO: add protection against duplicate entries in the array?
    const _localStorageLoadTodo = () => {
        if(window.localStorage){
            for(let i = 0; i < localStorage.length; i++){
                let currentKey = localStorage.key(i);
                if(currentKey === _categoryKey){
                    _categoryDict = JSON.parse(localStorage.getItem(currentKey));
                }
                else{
                    _todoList.push(JSON.parse(localStorage.getItem(currentKey)));
                }                
            }
        }
        else{
            //no local storage
        }
    }

    //Lower order fn used by "add"
    const _addTodo = (title, description, date) => {
        let newTodo = Todo(title, description, date, uuidv4());
        _todoList.push(newTodo);
        _localStorageStoreTodo(newTodo);
    }

    //Lower order fn used by "add"
    //if a new category is added, it is immediately committed to local storage
    const _addCategory = (input) => {
        if(!_categoryDict.hasOwnProperty(input)){
            _categoryDict[input] = true;
            localStorage.setItem(_categoryKey, JSON.stringify(_categoryDict));
        } 
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
            _addTodo(payload.title, payload.description, payload.date);
            //TODO: need to trigger event for view
        }
        else if(method == "Category"){
            _addCategory(payload.category);
            //TODO: need to trigger event for view
        }
        else{
            //invalid method
            return;
        }
        //_addCallback("add", []); //HACK
    }

    //Lower order fn used by "query"
    const _getTodoByCategory = (category) => {
        return _todoList.filter((element) => element.active && element.category == category);
    }

    //Lower order fn used by "query"
    const _getTodoByDate = (date) => {
        //TODO, should use a date library probably
        return;
    }

    /*
    **
    **
    */
    const query = (method, payload) => {
        if(method == "TodoByCategory"){
            return _getTodoByCategory(payload.category);
        }
        else if(method == "TodoByDate"){
            //_queryCallback("query", _getTodoByDate(payload.date)); //Arguements are assumed
        }
        else if(method == "Categories"){
            return JSON.parse(JSON.stringify(_categoryDict));
        }
        else{
            //invalid method
        }
    }

    //Lower order fn
    const _getIndexofID = (id) => {
        return _todoList.findIndex((element) => element.id == id);
    }

    //Lower order fn used by "modify"
    const _modifyTodo = (payload) => {
        let id = payload.id;
        delete payload.id;
        for (const property in payload){
            _todoList[_getIndexofID(id)][property] = payload[property];
        }
        _localStorageStoreTodo(_todoList[_getIndexofID(id)]);
    }

    /*
    **
    **
    */
   const modify = (method, payload) => {
        if(method == "Todo"){
            _modifyTodo(payload);
        }
        else if(method == "Category"){
            //no reason to modify a category yet, but the future does exist
        }
        else{
            //invalid method
        }
   }

   //Lower order fn
   const _removeCategory = (category) => {
        if(_categoryDict.hasOwnProperty(category)){
            delete _categoryDict[category];
        }
        else{
            //category does not exist in _categoryDict to begin with
        }
   }

   /*
   **
   **
   */
  const remove = (method, payload) => {
        if(method == category){
            _removeCategory(payload);
        }
        else{
            //invalid method
        }
  }

  /*
  **
  **
  **
  */
 const debugPrintState = () => {
    console.log("Todo State: ");
    console.log(_todoList);
    console.log("Category State: ");
    console.log(_categoryDict);
 }

 //Invoking the load function 
 _localStorageLoadTodo();

    return {    add,
                query,
                modify,
                remove,
                debugPrintState,
            }

})();