define("devicealerts/DeviceNotSupportFingerprintAlert", ["require", 'devicealerts/Alert','handlers/general'], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        general = require('handlers/general');

    var DeviceNotSupportFingerprintAlert = function () {
        var inheritedAlertInstance = new AlertBase();

        function init() {
            inheritedAlertInstance.alertName = "DeviceNotSupportFingerprintAlert";
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
                    'btn',
                    'fingerprint_ok'
                )
            );
        }

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };

    return DeviceNotSupportFingerprintAlert;
});