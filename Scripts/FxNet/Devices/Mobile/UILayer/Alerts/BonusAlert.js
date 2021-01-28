define('devicealerts/BonusAlert', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var BonusAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = 'BonusAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(String.format(Dictionary.GetItem('pendingbonustext'), '', '', ''));


            createButtons();
        };

        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
            new inheritedAlertInstance.buttonProperties(Dictionary.GetItem("ok"),
             function () {
                 inheritedAlertInstance.visible(false);
             }, 'btnOk'));
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return BonusAlert;
});