define("devicealerts/serverevents/ClientStateAlertApplicationClosing", ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary");
   
    var ClientStateAlertApplicationClosing = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = "ClientStateAlertSystemModeApplicationClosing";
            inheritedAlertInstance.body(Dictionary.GetItem('statusApplicationClosing'));
            inheritedAlertInstance.title(Dictionary.GetItem('statusApplicationClosingTitle'));
            createButtons();
        };

        var createButtons = function() {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem("ok"),
                    function() {
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

    return ClientStateAlertApplicationClosing;
});