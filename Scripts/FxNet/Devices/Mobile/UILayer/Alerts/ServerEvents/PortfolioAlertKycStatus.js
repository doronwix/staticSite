define(
    'devicealerts/serverevents/PortfolioAlertKycStatus',
    [
        'require',
        'devicealerts/Alert',
        'Dictionary'
    ],
    function PortfolioAlertKycStatusDef(require) {
        var AlertBase = require('devicealerts/Alert');
        var Dictionary = require('Dictionary');

        var PortfolioAlertKycStatus = function PortfolioAlertKycStatusClass() {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'PortfolioAlertKycStatus';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.body(Dictionary.GetItem('OrderError106'));
                createButtons();
            };
            var createButtons = function () {
                inheritedAlertInstance.buttons.removeAll();
                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(Dictionary.GetItem('ok'),
                        function () {
                            inheritedAlertInstance.visible(false);
                        }, 'btnCancel'));
            };

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return PortfolioAlertKycStatus;
    }
);