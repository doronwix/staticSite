define("devicealerts/AddFingerprintLoginOptionConfirmationAlert", ["require", 'devicealerts/Alert', "Dictionary", 'handlers/general'], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        general= require('handlers/general'),
        Dictionary = require("Dictionary");
        
    var AddFingerprintLoginOptionConfirmationAlert = function () {
        var inheritedAlertInstance = new AlertBase();

        function init() {
            inheritedAlertInstance.alertName = "AddFingerprintLoginOptionConfirmationAlert";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.prepareForShow = createButtons;
        }

        function createButtons() {
            inheritedAlertInstance.buttons.removeAll();

            inheritedAlertInstance.buttons.push(

                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem("cancel"),
                    function () {
                        inheritedAlertInstance.visible(false);

                        if (general.isFunctionType(inheritedAlertInstance.properties.cancelButtonCallback)) {
                            inheritedAlertInstance.properties.cancelButtonCallback();
                        }
                    },
                    'btn gray left',
                    'fingerprint_close'
                ),
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem('btnContinue'),
                    function () {
                        inheritedAlertInstance.visible(false);

                        if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                            inheritedAlertInstance.properties.okButtonCallback();
                        }
                    },
                    'btn right',
                    'fingerprint_continue'
                )
            );
        }

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return AddFingerprintLoginOptionConfirmationAlert;
});