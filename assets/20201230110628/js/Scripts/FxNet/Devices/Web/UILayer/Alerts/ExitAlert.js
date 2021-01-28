define(
    'devicealerts/ExitAlert',
    [
        'require',
        'devicealerts/Alert',
        'Dictionary',
        'dataaccess/dalCommon'
    ],
    function ExitAlertDef(require) {
        var ExitAlert = function ExitAlertClass() {
            var AlertBase = require('devicealerts/Alert'),
                Dictionary = require('Dictionary'),
                dalCommon = require('dataaccess/dalCommon');

            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'ExitAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.body(Dictionary.GetItem('areyousurelogout'));
                inheritedAlertInstance.title(Dictionary.GetItem('areyousurelogoutTitle'));
                createButtons();
            };

            var createButtons = function () {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem('cancel'),
                        function () {
                            inheritedAlertInstance.hide();
                        },
                        'btnCancel colored'
                    ),
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem('ok'),
                        function () {
                            dalCommon.Logout(eLoginLogoutReason.web_exitAlert);
                        },
                        'btnOk'
                    )
                );
            };

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return ExitAlert;
    }
);
