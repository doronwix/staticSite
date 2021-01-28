define('devicealerts/BonusAlert', ["require", "knockout", 'devicealerts/Alert', "Dictionary"], function (require) {
    var BonusAlert = function () {
        var ko = require("knockout"),
            Dictionary = require("Dictionary"),
            AlertBase = require('devicealerts/Alert');

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = 'BonusAlert';
            inheritedAlertInstance.body = ko.observable(String.format(Dictionary.GetItem('pendingbonustext'), '', '', ''));

            inheritedAlertInstance.title(Dictionary.GetItem('pendingbonustexttitle'));

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
    return BonusAlert;
});