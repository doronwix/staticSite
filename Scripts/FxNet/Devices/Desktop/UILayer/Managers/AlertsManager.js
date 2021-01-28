/* eslint no-alert: 0 */
define('devicemanagers/AlertsManager', [
    "require",
    'knockout',
    'handlers/general',
    'devicealerts/AlertFactory',
    "handlers/Delegate"
], function (require) {
    var ko = require('knockout'),
        AlertFactory = require('devicealerts/AlertFactory'),
        general = require('handlers/general'),
        delegate = require("handlers/Delegate");

    var AlertsManager = function AlertsManager() {

        var alertfactory = new AlertFactory(),
            alerts = {},
            // web alerts
            alertCounter = ko.observable(0),
            onShowAlert = new delegate(),
            // using native alert
            nativeAlertModel = null,
            isHtmlAlert = function (alertType) {
                // if defined in Desktop AlertTypes it's fx html alert.
                for (var key in AlertTypes) {
                    if (AlertTypes.hasOwnProperty(key) && AlertTypes[key] === alertType) {
                        return true;
                    }
                }
                return false;
            };

        var hasAlert = ko.computed(function () {
            return alertCounter() > 0;
        });

        var normaliseBodyMessage = function (msg) {
            var el = document.createElement('div');
            el.innerHTML = msg;

            var outMsg = el.innerText;
            el = null;

            return outMsg;
        };
 
        var normaliseMessages = function (messages) {
            return normaliseBodyMessage(messages.join('\n'));
        };

        //-------------- public Methods -----------------------------

        var getAlert = function (alertType) {
            // native js (old) behavior
            if (!isHtmlAlert(alertType)) {

                return null;
            }
            nativeAlertModel = null;
            var alert = alerts[alertType];

            if (!alert) {
                alert = alertfactory.CreateAlert(alertType);
                if (alert) {
                    alerts[alertType] = alert;

                    alert.visible.subscribe(function (isVisible) {
                        if (isVisible) {
                            alertCounter(alertCounter() + 1);

                        } else {
                            alertCounter(alertCounter() - 1);
                        }
                    });
                }
            }

            return alerts[alertType];
        };

        var popAlert = function (alertType) {
            if (isHtmlAlert(alertType)) {
                var alert = getAlert(alertType);
                if (alert) {
                    alert.show();
                }

                return;
            }
            //else fallback to native alert
            // desktop, using native alert message.
            if (nativeAlertModel === null) {
                return;
            }

            var msg = nativeAlertModel.Body.length === 0 && nativeAlertModel.Message.length > 0 ?
                normaliseMessages(nativeAlertModel.Message) :
                normaliseBodyMessage(nativeAlertModel.Body);

            if (general.isDefinedType(nativeAlertModel.Properties) &&
                nativeAlertModel.Properties.showAsConfirmation &&
                general.isFunctionType(nativeAlertModel.Properties.confirmationCallback)) {
                var result = window.confirm(msg);
                nativeAlertModel.Properties.confirmationCallback(result);
            } else {
                window.alert(msg);
            }

            if (nativeAlertModel.Properties.redirectToView) {
                if (nativeAlertModel.Properties.redirectToView === "exit") {
                    closeMainWindow();
                } else {
                    $viewModelsManager.VManager.SwitchViewVisible(nativeAlertModel.Properties.redirectToView, {});
                }
            }
        };

        var replaceBreaksWithNewLines = function (text) {
            if (!text) {
                return '';
            }

            var htmlBreaks = ["<br/>", "<br />", "<br>", "<br >", "\\n"];
            var textBreak = "\n";
            var result = typeof text === 'string' ? text : JSON.stringify(text);

            for (var i = 0; i < htmlBreaks.length; i++) {
                result = result.replace(htmlBreaks[i], textBreak);
            }

            return result;
        };

        var updateAlert = function (alertType, title, body, messages, properties, withoutLineBrakes) {
            var alert = getAlert(alertType);
            if (alert) {
                alertfactory.UpdateAlert(alert, alertType, title, body, messages, properties, withoutLineBrakes);
            } else {
                // native alert
                nativeAlertModel = {
                    AlertType: alertType,
                    Body: replaceBreaksWithNewLines(body),
                    Message: messages || [],
                    Properties: properties,
                    WithoutLineBrakes: withoutLineBrakes
                };
            }
        };

        var showAlert = function (alertType, title, body, messages, properties, withoutLineBrakes) {
            updateAlert(alertType, title, body, messages, properties, withoutLineBrakes);
            popAlert(alertType);
        };

        var closeMainWindow = function () {
            window.external.CloseHostForm();
        };

        return {
            HasAlert: hasAlert,
            PopAlert: popAlert,
            GetAlert: getAlert,
            UpdateAlert: updateAlert,
            ShowAlert: showAlert,
            OnShowAlert: onShowAlert
        };
    };
    var module = window.AlertsManager = AlertsManager();
    return module;
});