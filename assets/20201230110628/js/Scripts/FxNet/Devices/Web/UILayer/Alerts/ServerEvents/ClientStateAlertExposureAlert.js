define(
    'devicealerts/serverevents/ClientStateAlertExposureAlert',
    [
        "require",
        'devicealerts/Alert',
        "Dictionary"
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert');
        var Dictionary = require("Dictionary");

        var ClientStateAlertExposureAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'ClientStateAlertExposureAlert';
                inheritedAlertInstance.body(Dictionary.GetItem('OrderError12'));
                createButtons();
            };

            var createButtons = function () {
                inheritedAlertInstance.buttons.removeAll();
                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem("ok"),
                        function () {
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

        return ClientStateAlertExposureAlert;
    }
);
