define(
    'alerts/RemoveCreditCardConfirmationAlert',
    [
        "require",
        'devicealerts/Alert',
        'handlers/general'
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert'),
            general = require('handlers/general');

        var RemoveCreditCardConfirmationAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            function init() {
                inheritedAlertInstance.alertName = "RemoveCreditCardConfirmationAlert";
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = createButtons;
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem(inheritedAlertInstance.properties.cancelButtonCaption || "cancel"),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.cancelButtonCallback)) {
                                inheritedAlertInstance.properties.cancelButtonCallback();
                            }
                        },
                        'btnCancel colored'
                    ),
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem(inheritedAlertInstance.properties.okButtonCaption || "proceed"),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                                inheritedAlertInstance.properties.okButtonCallback();
                            }
                        },
                        'btnOk'
                    )
                );
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };
        return RemoveCreditCardConfirmationAlert;
    }
);
