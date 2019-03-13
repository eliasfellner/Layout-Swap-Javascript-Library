$(document).ready(function () {
    addSettingsHTML();
    addDraggableFunctionality();
    changePlacesBack();
});


function addDraggableFunctionality() {
    //set who can be dragged to whom
    let draggableDivs = $(".draggable");

    //make divs draggable / revert to original position / stack: automatically changes z-index
    draggableDivs.draggable({
        disabled: true,
        revert: true,
        revertDuration: 0,
        stack: ".draggable"
    });

    draggableDivs.each(function (index, div) {
        let width = $(div).width();
        let height = $(div).height();
        let divider = (width < height) ? width : height;
        let ratio = Math.round(width / divider) + "-" + Math.round(height / divider);
        let classValue = "drag" + ratio;
        $(div).addClass(classValue);

        let acceptableKey = "."+classValue;
        $(div).droppable({
            accept: acceptableKey,
            classes: {
                "ui-droppable-active": "dragOverlay",
                "ui-droppable-hover": "dragOverlayActive"
            },
            drop: function (event, ui) {
                saveLayoutChange($(this), ui.draggable);
                $(this).swap(ui.draggable);
            }
        });
    });
}

//TODO fix this //bubble swap and don't swap if key/value already got swapped
function changePlacesBack() {
    // Retrieve your data from locaStorage
    let saveData = loadSavedData();
    let alreadySwapped= [];

    let draggableDivs = $(".draggable");
    let divArrangement = {};

    draggableDivs.each(function (index, div) {
        divArrangement[$(div).attr("id")] = $(div).attr("id");
    });

    console.log(divArrangement);

    $.each(saveData, function(key, value){
        if ($.inArray(value, alreadySwapped)<0){
            let key1 = getKeyByValue(divArrangement, key);
            let key2 = getKeyByValue(divArrangement, value);

            console.log("key1" + key1);
            console.log("key2" + key2);
            console.log("--------------");

            let temp = divArrangement[key1];
            divArrangement[key1] = divArrangement[key2];
            divArrangement[key2] = temp;

            $("#" + divArrangement[key1]).swap($("#" + divArrangement[key2]));
            alreadySwapped.push(key);
        }
    });
}

function saveLayoutChange(div1, div2) {
    let saveData = loadSavedData();

    if (saveData === null){
        setLocalStorageToDefault();
        saveData = loadSavedData();
    }

    let key1 = getKeyByValue(saveData, div1.attr("id"));
    let key2 = getKeyByValue(saveData, div2.attr("id"));

    let div1newValue = saveData[key2];
    let div2newValue = saveData[key1];

    saveData[key1] = div1newValue;
    saveData[key2] = div2newValue;

    localStorage.setItem("draggableChanges", JSON.stringify(saveData));
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function setLocalStorageToDefault(){
    let draggableDivs = $(".draggable");
    let saveData = {};

    draggableDivs.each(function (index, div) {
        saveData[$(div).attr("id")] = $(div).attr("id");
    });

    localStorage.setItem("draggableChanges", JSON.stringify(saveData));
}


function loadSavedData() {
    return JSON.parse(localStorage.getItem("draggableChanges"));
}

function startEditMode(){
    let draggableDivs = $(".draggable");
    draggableDivs.draggable("enable");
    draggableDivs.addClass("editModeActive");
}

function endEditMode(){
    let draggableDivs = $(".draggable");
    draggableDivs.draggable("disable");
    draggableDivs.removeClass("editModeActive");
}

function resetLocalStorage(){
    changePlacesBack();
    localStorage.removeItem("draggableChanges");
}

function addSettingsHTML(){
    //create settings element
    let settings = $(document.createElement("img"));
    settings.prop("id", "openDraggableModal");
    settings.prop("src", "https://img.icons8.com/ios/80/000000/automatic-filled.png");

    //create modal window (fullscreen)
    let modal = $(document.createElement("div"));
    modal.prop("id", "open-modal");
    modal.addClass("modal-window");

    //create content for settings modal
    let modalContent = $(document.createElement("div"));
    modalContent.addClass("shadow");
    let modalBT1 = $(document.createElement("button"));
    let modalBT2 = $(document.createElement("button"));
    let modalClose = $(document.createElement("button"));
    let resetChanges = $(document.createElement("button"));

    modalBT1.html("Start Edit Mode");
    modalBT2.html("End Edit Mode");
    modalClose.html("Close");
    resetChanges.html("Reset Changes");
    modalBT1.addClass("button button--lighten");
    modalBT2.addClass("button button--lighten");
    modalClose.addClass("button button--lighten");
    resetChanges.addClass("button button--lighten");
    modalBT1.prop("id", "startEdit");
    modalBT2.prop("id", "endEdit");
    modalClose.prop("id", "modal-close");
    resetChanges.prop("id", "resetChanges");
    modalBT1.click(startEditMode);
    modalBT2.click(endEditMode);
    resetChanges.click(resetLocalStorage);


    //append the divs
    modalContent[0].appendChild(modalBT1[0]);
    modalContent[0].appendChild(modalBT2[0]);
    modalContent[0].appendChild(modalClose[0]);
    modalContent[0].appendChild(resetChanges[0]);
    modal[0].appendChild(modalContent[0]);

    settings.click(function(){
        modal.addClass("showModal");
    });

    modalClose.click(function(){
       modal.removeClass("showModal");
    });

    modal.click(function(){
        modal.removeClass("showModal");
    });

    //append settings icon and modal to document
    document.body.appendChild(settings[0]);
    document.body.appendChild(modal[0]);
}

$.fn.swap = function (elem) {
    elem = elem.jquery ? elem : $(elem);
    $(document.createTextNode('')).insertBefore(this).before(elem.before(this)).remove();
};