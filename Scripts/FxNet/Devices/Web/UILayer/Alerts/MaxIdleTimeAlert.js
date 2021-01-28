define('devicealerts/MaxIdleTimeAlert', ["require", 'devicemanagers/AlertsManager'], function (require) {
    var AlertsManager = require('devicemanagers/AlertsManager');

    var MaxIdleTimeAlert = (function() {

        var show = function() {
            AlertsManager.UpdateAlert(AlertTypes.MaxIdleTimeAlert);
            AlertsManager.PopAlert(AlertTypes.MaxIdleTimeAlert);
        };

        return {
            Show: show
        };
    })();

    return MaxIdleTimeAlert;
});

