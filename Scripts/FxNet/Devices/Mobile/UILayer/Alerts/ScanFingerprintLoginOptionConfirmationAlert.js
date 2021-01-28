define(
    'devicealerts/ScanFingerprintLoginOptionConfirmationAlert',
    [
        'require',
        'devicealerts/Alert',
        'Dictionary',
        'handlers/general'
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert');
        var Dictionary = require('Dictionary'),
            general = require('handlers/general');

        var ScanFingerprintLoginOptionConfirmationAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            function init() {
                inheritedAlertInstance.alertName = 'ScanFingerprintLoginOptionConfirmationAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = createButtons;
            }

            function createButtons() {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem('cancel'),
                        function () {
                            inheritedAlertInstance.visible(false);

                            if (general.isFunctionType(inheritedAlertInstance.properties.cancelButtonCallback)) {
                                inheritedAlertInstance.properties.cancelButtonCallback();
                            }
                        },
                        'btnCancel',
                        'fingerprint_cancel'
                    )
                );
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return ScanFingerprintLoginOptionConfirmationAlert;
    }
);
