define('devicealerts/serverevents/PortfolioAlertIsReal', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");
    
    var PortfolioAlertIsReal = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = 'PortfolioAlertIsReal';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem("realLoginAlert"));
            inheritedAlertInstance.title(Dictionary.GetItem("realLoginAlertTitle"));
            createButtons();
        };
        var createButtons = function() {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(Dictionary.GetItem("ok"),
                    function() {
                        inheritedAlertInstance.visible(false);
                    }, 'btnCancel'));
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return PortfolioAlertIsReal;
});