define("devicealerts/serverevents/ClientStateAlertApplicationClosing", ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var ClientStateAlertApplicationClosing = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = "ClientStateAlertApplicationClosing";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem('statusApplicationClosing'));
            createButtons();
        };
        var createButtons = function() {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties("Ok",
                    function() {
                        inheritedAlertInstance.visible(false);
                    }, 'btnCancel'));
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };

    return ClientStateAlertApplicationClosing;
});