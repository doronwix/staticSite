define("devicealerts/serverevents/PortfolioAlertCddStatus", ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");
    
    var PortfolioAlertCddStatus = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = 'PortfolioAlertCddStatus';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem('CddAlertContent'));
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
    return PortfolioAlertCddStatus;
});