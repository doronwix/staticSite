//-------------------------------------------------------
// AttachEvent
//-------------------------------------------------------
 
function AttachEvent(object, evt, func) {
    if (typeof object === "undefined" || object === null) {
        return false;
    }

    if (!object.id) {
        return false;
    }

    if (typeof func !== 'function') {
        return false;
    }

    $("#" + object.id).on(evt, func);

    return true;
}

//-------------------------------------------------------
// RemoveEvent
//-------------------------------------------------------

function RemoveEvent(object, evt) {
    if (typeof object === "undefined" || object === null) {
        return false;
    }

    if (object.id == "") {
        return false;
    }

    if (typeof evt === "undefined") {
        $("#" + object.id).off();
    } else {
        $("#" + object.id).off(evt);
    }

    return true;
}

//-------------------------------------------------------------
// is event bound
//-------------------------------------------------------------

$.fn.isBound = function(type, fn) {
    var events = this.data('events');

    if (!events) {
        return false;
    }

    var data = events[type];

    if (typeof data === "undefined" || data === null) {
        return false;
    }

    if (!data.length) {
        return false;
    }

    return (-1 !== $.inArray(fn, data));
};