define(
    'devicealerts/serverevents/PortfolioAlertIsActive',
    [
        "require",
        'devicealerts/Alert',
        "Dictionary"
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert');
        var Dictionary = require("Dictionary");

        var PortfolioAlertIsActive = function () {

            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'PortfolioAlertIsActive';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.body(Dictionary.GetItem("OrderError105"));
                //createButtons();

                inheritedAlertInstance.prepareForShow = prepareForShow;
            };

            var prepareForShow = function () {
                inheritedAlertInstance.injectDepositButtons();
            };

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return PortfolioAlertIsActive;
    }
);
