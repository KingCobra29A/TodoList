const TodoList = (() => {
    let _List = [];
    let _index = 0;

    const Todo = (title, description, date, id) => {
        title;
        description;
        date;
        id;
        category: uncategorized;
        active: true;
    }
    
    let addTodo = (title, description, date) => {
        _List.push(Todo(title, description, date, _index));
        _index += 1;
    }

    let getTodoByCategory = (category) => {
        return _List.filter((element) => element.active && element.category == category);
    }

    let getTodoByDate = (date) => {}

    l

    return {    addTodo,
                getTodoByCategory,
                getTodoByDate
            }

})();
