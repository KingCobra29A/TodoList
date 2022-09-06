import { v4 as uuidv4 } from 'uuid';

export const TodoList = (() => {
    let _todoList = [];
    let _categoryDict = {};
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


    // TODO
    const _localStorageUpdateTodo = () => {
        //Pretty sure this isnt necessary. _localStorageStoreTodo should do the necessary
    }

    // Loads the entire contents of localStorage into the _todoList array
    // TODO: add protection against duplicate entries in the array?
    const _localStorageLoadTodo = () => {
        if(window.localStorage){
            for(let i = 0; i < localStorage.length; i++){
                _todoList.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
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
        //TODO
        return;
    }

    /*
    **
    **
    */
    const query = (method, payload) => {
        if(method == "Category"){
            //_queryCallback("query", _getTodoByCategory(payload.category)); //Arguements are assumed
        }
        else if(method == "Date"){
            //_queryCallback("query", _getTodoByDate(payload.date)); //Arguements are assumed
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

  /*
  **
  **
  **
  */
 const debugPrintState = () => {
    console.log("Todo State: ")
    console.log(_todoList);
 }

    return {    add,
                query,
                modify,
                remove,
                debugPrintState,
                _localStorageLoadTodo,
            }

})();


let tempTodos = [
    {title:"Eat Fudge",description:"2lbs",date:null},
    {title:"meow",description:"prrrow",date:null},
    {title:"a",description:"AA",date:null},
    {title:"b",description:"BB",date:null},
    {title:"c",description:"CC",date:null},
    {title:"d",description:"DD",date:null},
    {title:"e",description:"EE",date:null},
    {title:"f",description:"FF",date:null},
    {title:"g",description:"GG",date:null},
    {title:"h",description:"HH",date:null}
]

