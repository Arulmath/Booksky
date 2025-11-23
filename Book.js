var popupoverlay=document.querySelector(".popup-overlay")
var popupbox=document.querySelector(".popup-box")
var popupbutton=document.getElementById("add-popup")
popupbutton.addEventListener("click",function(){
    popupoverlay.style.display="block"
    popupbox.style.display="block"
})
var cancelbutton= document.getElementById("cancel-popup")
cancelbutton.addEventListener("click",function(event){
    event.preventDefault()
    popupoverlay.style.display="none"
    popupbox.style.display="none"
})

var container=document.querySelector(".container")
var addbutton=document.getElementById("add-book")
var addtitle=document.getElementById("book-title")
var addauthor=document.getElementById("book-author")
var adddescription=document.getElementById("book-description")

addbutton.addEventListener("click",function(event){

    event.preventDefault()
    var div=document.createElement("div")
    div.setAttribute("class","book-container")
    div.innerHTML=`
    <h2>${addtitle.value}</h2>
    <h4>${addauthor.value}</h4>
    <p>${adddescription.value}</p>
    <button onclick="deletebook(event)">Delete</button>
    `
    container.append(div)
    popupoverlay.style.display="none"
    popupbox.style.display="none"
})
 function deletebook(event)
 {
    event.target.parentElement.remove()
 }   




