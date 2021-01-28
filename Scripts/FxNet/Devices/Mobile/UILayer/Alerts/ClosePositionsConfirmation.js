define("devicealerts/ClosePositionsConfirmation", ["require", 'devicealerts/Alert'], function (require) {
    var AlertBase = require('devicealerts/Alert');

    var ClosePositionsConfirmation = function () {

        var inheritedAlertInstance = new AlertBase();

        var defaultProp = {};

        var init = function () {
            inheritedAlertInstance.alertName = "ClosePositionsConfirmation";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.properties = defaultProp;

            createButtons();
        };

        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
            new inheritedAlertInstance.buttonProperties(Dictionary.GetItem("ok"),
             function () {
                 inheritedAlertInstance.visible(false);
             }, 'btnOk'));
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return ClosePositionsConfirmation;
});