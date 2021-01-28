define(
    'devicealerts/RemoveFingerprintLoginOptionConfirmationAlert',
    [
        'require',
        'devicealerts/Alert',
        'Dictionary',
        'handlers/general'
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert'),
            Dictionary = require('Dictionary'),
            general = require('handlers/general');

        var RemoveFingerprintLoginOptionConfirmationAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            function init() {
                inheritedAlertInstance.alertName = 'RemoveFingerprintLoginOptionConfirmationAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = createButtons;
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem(inheritedAlertInstance.properties.okButtonCaption || 'depConfirmRemoveCC'),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                                inheritedAlertInstance.properties.okButtonCallback();
                            }
                        },
                        'btnOk',
                        'fingerprint_ok',
                        'fingerprint_ok_id'
                    ),
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem(inheritedAlertInstance.properties.cancelButtonCaption || 'depCancelRemoveCC'),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.cancelButtonCallback)) {
                                inheritedAlertInstance.properties.cancelButtonCallback();
                            }
                        },
                        'btnCancel',
                        'fingerprint_cancel',
                        'fingerprint_cancel_id'
                    )
                );
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return RemoveFingerprintLoginOptionConfirmationAlert;
    }
);