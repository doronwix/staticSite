define('devicealerts/GeneralCancelableAlert', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var GeneralCancelableAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.setDefaultTitle = function () { }
            inheritedAlertInstance.alertName = 'devicealerts/GeneralCancelableAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.title(Dictionary.GetItem("msgtype240") || Dictionary.GetItem("GenericAlert"));
            createButtons();
        };

        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem("ok"),
                    function () {
                        inheritedAlertInstance.visible(false);
                    },
                    'btnOk'
                )
            );
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return GeneralCancelableAlert;
});