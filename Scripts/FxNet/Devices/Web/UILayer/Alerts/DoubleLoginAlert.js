define('devicealerts/DoubleLoginAlert', [
    "require",
    'devicemanagers/AlertsManager',
    "initdatamanagers/Customer",
    'dataaccess/dalCommon'
],
function (require) {
    var customer = require("initdatamanagers/Customer"),
        dalCommon = require('dataaccess/dalCommon');

    var DoubleLoginAlert = (function () {
        var logoutTimer;

        var show = function () {
            if (!customer.isAutologin()) {
                logoutTimer = setTimeout(function () { dalCommon.Logout(eLoginLogoutReason.web_doubleLogin1); }, 180000);
            }
            require(['devicemanagers/AlertsManager'], function () {
                AlertsManager.UpdateAlert(AlertTypes.DoubleLoginAlert);
                AlertsManager.PopAlert(AlertTypes.DoubleLoginAlert);
            });
        };

        return {
            Show: show,
            LogoutTimer: logoutTimer
        };
    })();
    return DoubleLoginAlert;
});

