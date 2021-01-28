var PopupInSameWindowForSC = function() {
    //var originalLocation;
    var open = function(communicationManager) {
        //originalLocation = window.location.href;
        window.location.href = communicationManager.ActionUrl;
    };

    var close = function() {
        //window.location.href = originalLocation;
    };

    return {
        Navigate: open,
        Close: close,
        OnClose: function() {}
    };
};