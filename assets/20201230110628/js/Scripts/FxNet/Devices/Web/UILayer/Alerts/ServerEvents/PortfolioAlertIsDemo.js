define('devicealerts/serverevents/PortfolioAlertIsDemo', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var PortfolioAlertIsDemo = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = 'PortfolioAlertIsDemo';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem("demoLoginAlertWeb"));
            inheritedAlertInstance.title(Dictionary.GetItem("demoLoginAlertTitle"));
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
                    'btnCancel'
                )
            );
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return PortfolioAlertIsDemo;
});