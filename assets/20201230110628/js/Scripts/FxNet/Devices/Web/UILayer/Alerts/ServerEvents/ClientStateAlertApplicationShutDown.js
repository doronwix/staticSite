define("devicealerts/serverevents/ClientStateAlertApplicationShutDown", ["require", 'devicealerts/Alert', 'dataaccess/dalCommon', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary"),
        dalCommon = require('dataaccess/dalCommon');
    
    var ClientStateAlertApplicationShutDown = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = "ClientStateAlertApplicationShutDown";
            inheritedAlertInstance.body(Dictionary.GetItem('statusApplicationShutdown'));
            inheritedAlertInstance.title(Dictionary.GetItem('statusApplicationShutdownTitle'));
            createButtons();
        };
        var createButtons = function() {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem("ok"),
                    function() {
                        inheritedAlertInstance.visible(false);
                        dalCommon.Logout(eLoginLogoutReason.clientStateError);
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
    return ClientStateAlertApplicationShutDown;
});