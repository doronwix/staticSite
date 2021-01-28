define("devicealerts/serverevents/PortfolioAlertAmlStatus", ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");
    
    var PortfolioAlertAmlStatus = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = 'PortfolioAlertAmlStatus';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem('AmlAlertContent'));
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
    return PortfolioAlertAmlStatus;
});
