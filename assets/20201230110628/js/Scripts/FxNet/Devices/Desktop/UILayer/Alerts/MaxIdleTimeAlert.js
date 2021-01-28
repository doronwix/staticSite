define('devicealerts/MaxIdleTimeAlert', [
  'require',
  'managers/AlertsManager',
], function (require) {
  var AlertsManager = require('managers/AlertsManager');

  var MaxIdleTimeAlert = (function () {
    var show = function () {
      AlertsManager.UpdateAlert(AlertTypes.MaxIdleTimeAlert);
      AlertsManager.PopAlert(AlertTypes.MaxIdleTimeAlert);
    };

    return {
      Show: show,
    };
  })();

  return MaxIdleTimeAlert;
});
