define("devicealerts/serverevents/ClientStateAlertSystemMode", ["require", 'devicealerts/Alert', "Dictionary", 'dataaccess/dalCommon'], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary"),
        dalCommon = require('dataaccess/dalCommon');
   
    var ClientStateAlertSystemMode = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = "ClientStateAlertSystemMode";
            inheritedAlertInstance.body(Dictionary.GetItem('maintenanceAlertContent'));
            inheritedAlertInstance.title(Dictionary.GetItem('maintenanceAlertContentTitle'));
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
    return ClientStateAlertSystemMode;
});