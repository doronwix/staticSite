define('alerts/TradingConfirmationRetryAlert', ["require", 'devicealerts/Alert'], function (require) {
    var AlertBase = require('devicealerts/Alert');

    var TradingConfirmationRetryAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = 'alerts/TradingConfirmationRetryAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.prepareForShow = prepareForShow;
        };

        var prepareForShow = function () {
            var self = this;
            this.selectedData = this.properties.selectedData;
            this.confirmationCloseDeal = function () {
                inheritedAlertInstance.visible(false);
                if (self.properties &&
                    self.properties.hasOwnProperty('tradingEnabledRetry') &&
                    typeof self.properties.tradingEnabledRetry === 'function') {
                    self.properties.tradingEnabledRetry(self.properties.requestData);
                }
            };
        }

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };

    return TradingConfirmationRetryAlert;
});