define('devicealerts/MaxIdleTimeAlert', ["require", 'devicemanagers/AlertsManager'], function (require) {
    var MaxIdleTimeAlert = (function () {
        var AlertsManager = require('devicemanagers/AlertsManager');

        var show = function () {
            AlertsManager.UpdateAlert(AlertTypes.MaxIdleTimeAlert);
            AlertsManager.PopAlert(AlertTypes.MaxIdleTimeAlert);
        };

        return {
            Show: show
        };
    })();
    return MaxIdleTimeAlert;
});
