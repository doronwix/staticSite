define(
    "devicealerts/DepositConfirmationEmailSentAlert",
    [
        "require",
        'handlers/general',
        'devicealerts/Alert',
        "Dictionary"
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert'),
            Dictionary = require("Dictionary"),
            general = require('handlers/general');

        var DepositConfirmationEmailSentAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            function init() {
                inheritedAlertInstance.alertName = "DepositConfirmationEmailSentAlert";
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = createButtons;
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem("ok"),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                                inheritedAlertInstance.properties.okButtonCallback();
                            }
                        },
                        'btn'
                    )
                );
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return DepositConfirmationEmailSentAlert;
    }
);
