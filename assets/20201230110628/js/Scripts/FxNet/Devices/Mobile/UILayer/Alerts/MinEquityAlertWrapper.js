define('devicealerts/MinEquityAlertWrapper', ["require", 'devicealerts/Alert'], function (require) {
    var AlertBase = require('devicealerts/Alert');

    var MinEquityAlertWrapper = function () {
        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = 'MinEquityAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.prepareForShow = prepareForShow;
        };

        var prepareForShow = function () {
            inheritedAlertInstance.injectDepositButtons();
        };

        return {
            GetAlert: inheritedAlertInstance,
            Init: init
        };
    };
    return MinEquityAlertWrapper;
});