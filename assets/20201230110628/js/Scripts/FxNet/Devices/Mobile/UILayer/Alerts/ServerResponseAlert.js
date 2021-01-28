define('devicealerts/ServerResponseAlert', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var ServerResponseAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = 'ServerResponseAlert';
            inheritedAlertInstance.visible(false);
            createButtons();
        };

        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.addRedirectButton(Dictionary.GetItem("ok"), 'btnCancel');
        };


        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return ServerResponseAlert;
});