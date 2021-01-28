define(
    'devicealerts/serverevents/ClientStateAlertExposureAlert',
    [
        "require",
        'devicealerts/Alert',
        "Dictionary",
        "knockout"
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert');
        var ko = require("knockout");
        var Dictionary = require("Dictionary");

        var ClientStateAlertExposureAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'ClientStateAlertExposureAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.body(Dictionary.GetItem('OrderError12'));
                inheritedAlertInstance.popCounter = ko.observable(0);
                createButtons();
            };
            var createButtons = function () {
                inheritedAlertInstance.buttons.removeAll();
                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties("Ok",
                        function () {
                            inheritedAlertInstance.visible(false);
                        }, 'btnCancel'));
            };

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };
        return ClientStateAlertExposureAlert;
    }
);
