define(
    'alerts/RemoveCreditCardConfirmationAlert',
    [
        'require',
        'devicealerts/Alert',
        'Dictionary',
        'handlers/general'
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert'),
            general = ('handlers/general'),
            Dictionary = require('Dictionary');

        var RemoveCreditCardConfirmationAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            function init() {
                inheritedAlertInstance.alertName = 'alerts/RemoveCreditCardConfirmationAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = createButtons;
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem(inheritedAlertInstance.properties.okButtonCaption || 'proceed'),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                                inheritedAlertInstance.properties.okButtonCallback();
                            }
                        },
                        'btnOk'
                    ),
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem(inheritedAlertInstance.properties.cancelButtonCaption || 'cancel'),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.cancelButtonCallback)) {
                                inheritedAlertInstance.properties.cancelButtonCallback();
                            }
                        },
                        'btnCancel'
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
