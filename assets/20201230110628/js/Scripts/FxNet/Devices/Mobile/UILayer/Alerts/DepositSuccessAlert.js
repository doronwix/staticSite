define('devicealerts/DepositSuccessAlert', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var DepositSuccessAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = 'devicealerts/DepositSuccessAlert';
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
    return DepositSuccessAlert;
});