define(
    'devicealerts/HelpAlert',
    [
        'require',
        'devicealerts/Alert',
    ],
    function HelpAlertDef(require) {
        var alertBase = require('devicealerts/Alert');

        var HelpAlert = function HelpAlertClass() {
            var inheritedAlertInstance = new alertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'HelpAlert';
                inheritedAlertInstance.visible(false);
            };

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return HelpAlert;
    }
);
