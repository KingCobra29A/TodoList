import './css-reset.css';
import './index.css';

//IIFE to create div where everything is gonna live
//should probably be done in some type of html template or something
let createContentDiv = (() => {
    let contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    document.body.append(contentDiv);
    return contentDiv;
})();



//
//
//
let renderIndex = (() => {

    let _tabClasses = ["screm", "blep", "mlem"];
    let indexDiv = document.createElement("div");

    //helper function to append a text node
    let _addTextNode = (data, toAppend) => {
        let textNode = document.createTextNode(data);
        toAppend.appendChild(textNode);
    };

    //helper function to create tabs
    let _createTabs = () => {
        let tabs = document.createElement("div");
        tabs.classList.add("tabs");
        for(let i=0; i < 3; i++){
            let tab = document.createElement("div");
            tab.classList.add(_tabClasses[i]);
            tab.classList.add("tab");
            _addTextNode(_tabClasses[i].toUpperCase(), tab);
            //add event listener
            tabs.appendChild(tab);
        }
        console.log(tabs);
        return tabs;
    };


    indexDiv.classList.add("index")
    indexDiv.appendChild(_createTabs());
    createContentDiv.appendChild(indexDiv);

    //

})();



/*

<div>
    <div>
        <tab>
        <tab>
        <tab>
    </div>
    <content-of-tab>
</div>

*/