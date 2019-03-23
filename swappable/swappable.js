$(document).ready(function () {
    setRestrictive();
    addSettingsHTML();
    addSwappableFunctionality();
    changePlacesBack();
});

let restrictive = true;

function setRestrictive(){
    restrictive = $("#disableRestrictiveSwappable").length === 0;
}


function addSwappableFunctionality() {
    //set who can be dragged to whom
    let swappableDivs = $(".swappable");

    //make divs swappable / revert to original position / stack: automatically changes z-index
    swappableDivs.draggable({
        disabled: true,
        revert: true,
        revertDuration: 0,
        stack: ".swappable"
    });

    swappableDivs.each(function (index, div) {
        if (restrictive){
            let width = $(div).width();
            let height = $(div).height();
            let divider = (width < height) ? width : height;
            let ratio = Math.round(width / divider) + "-" + Math.round(height / divider);
            let classValue = "drag" + ratio;
            $(div).addClass(classValue);
            acceptableKey = "." + classValue;
        }

        $(div).droppable({
            accept: restrictive ? acceptableKey : '.swappable',
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

function changePlacesBack() {
    // Retrieve your data from locaStorage
    let saveData = loadSavedData();
    let swappableDivs = $(".swappable");
    let alreadySwapped = [];
    let divArrangement = [];



    swappableDivs.each(function (index, div) {
        divArrangement[$(div).attr("id")] = $(div).attr("id");
    });

    $.each(saveData, function (key, value) {
        if ($.inArray(value, alreadySwapped) < 0) {
            let id1 = getKeyByValue(divArrangement, key);
            let id2 = getKeyByValue(divArrangement, value);

            let temp = divArrangement[id1];
            divArrangement[id1] = divArrangement[id2];
            divArrangement[id2] = temp;

            if (id1 !== id2) {
                $("#" + id1).swap($("#" + id2));
                alreadySwapped.push(key);
            }
        }
    });
}

function saveLayoutChange(div1, div2) {
    let saveData = loadSavedData();

    if (saveData === null) {
        setLocalStorageToDefault();
        saveData = loadSavedData();
    }

    let key1 = getKeyByValue(saveData, div1.attr("id"));
    let key2 = getKeyByValue(saveData, div2.attr("id"));

    let div1newValue = saveData[key2];
    let div2newValue = saveData[key1];

    saveData[key1] = div1newValue;
    saveData[key2] = div2newValue;

    localStorage.setItem(window.location.href.split("#")[0], JSON.stringify(saveData));
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function setLocalStorageToDefault() {
    let swappableDivs = $(".swappable");
    let saveData = {};

    swappableDivs.each(function (index, div) {
        saveData[$(div).attr("id")] = $(div).attr("id");
    });

    localStorage.setItem(window.location.href.split("#")[0], JSON.stringify(saveData));
}


function loadSavedData() {
    return JSON.parse(localStorage.getItem(window.location.href.split("#")[0]));
}

function startEditMode() {
    let swappableDivs = $(".swappable");
    swappableDivs.draggable("enable");
    swappableDivs.addClass("editModeActive");
}

function endEditMode() {
    let swappableDivs = $(".swappable");
    swappableDivs.draggable("disable");
    swappableDivs.removeClass("editModeActive");
}

function resetLocalStorage() {
    // Retrieve your data from locaStorage
    let saveData = loadSavedData();
    let divArrangement = Object.assign({}, saveData); //copying the object so that there's no issue when iterating through

    $.each(saveData, function (key, value) {
        if (key !== divArrangement[key]) {
            $("#" + value).swap($("#" + getKeyByValue(divArrangement, value)));
            divArrangement[getKeyByValue(divArrangement, key)] = value;
            divArrangement[key] = key;
        }
    });

    localStorage.removeItem(window.location.href.split("#")[0] );
}

function addSettingsHTML() {
    //create settings element
    let settings = $(document.createElement("img"));
    settings.prop("id", "openSwappableModal");
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

    settings.click(function () {
        modal.addClass("showModal");
    });

    modalClose.click(function () {
        modal.removeClass("showModal");
    });

    modal.click(function () {
        modal.removeClass("showModal");
    });

    //append settings icon and modal to document
    document.body.appendChild(settings[0]);
    document.body.appendChild(modal[0]);
}

$.fn.swap = function (div) {
    $(document.createTextNode('')).insertBefore(this).before(div.before(this)).remove();
};