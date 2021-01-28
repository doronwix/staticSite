define('managers/PopupInAlertManager',
    [
        'require',
        'handlers/general',
        'devicemanagers/AlertsManager'
    ],
    function (require) {
        var alertsManager = require('devicemanagers/AlertsManager'),
            general = require('handlers/general');

        var PopupInAlertManager = function () {
            var onCloseCallback =general.emptyFn,
                alertType = AlertTypes.IframeAlert;

            var open = function (communicationManager) {
                var options = {
                    iframeUrl: communicationManager.ActionUrl,
                    alertType: alertType,
                    onCloseCallback: onCloseCallback
                };

                alertsManager.UpdateAlert(alertType, communicationManager.Title, null, null, options);
                alertsManager.PopAlert(alertType)
            };

            var close = function () {
                var alert = alertsManager.GetAlert(alertType);

                if (alert) {
                    alert.hide();
                }

                onCloseCallback();
            };

            var onClose = function (callback) {
                onCloseCallback = callback;
            };

            return {
                Navigate: open,
                Close: close,
                OnClose: onClose
            };
        };

        return PopupInAlertManager;
    }
);