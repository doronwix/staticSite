define(
    'managers/AlertsManager',
    [
        'require',
        'enums/alertenums',
        'devicealerts/AlertFactory',
        'knockout',
        'handlers/Delegate'
    ],
    function AlertsManagerDef(require) {
        var AlertsManager = function AlertsManagerClass() {
            var AlertFactory = require('devicealerts/AlertFactory'),
                delegate = require('handlers/Delegate'),
                ko = require('knockout');

            var alertfactory = new AlertFactory(),
                alerts = {},
                alertCounter = ko.observable(0),
                onShowAlert = new delegate(),
                visiblePriorityAlerts = [],
                priorityAlerts = [
                    AlertTypes.MaxIdleTimeAlert,
                    AlertTypes.DoubleLoginAlert,
                    AlertTypes.SessionEndedAlert
                ];

            function visiblePriorityAlertOnClose() {
                visiblePriorityAlerts.pop();
            }

            function priorityAlertCanBeShow() {
                return 0 >= visiblePriorityAlerts.length;
            }

            var hasAlert = ko.computed(function () {
                return alertCounter() > 0;
            });

            hasAlert.subscribe(function (value) {
                if (value) {
                    $('body').addClass('mobilePopupVisible');
                } else {
                    $('body').removeClass('mobilePopupVisible');
                }
            });

            //-------------- public Methods -----------------------------

            function getAlert(alertType) {
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
            }

            function popAlert(alertType) {
                var alert = getAlert(alertType);

                if (alert && !alert.visible()) {
                    if (priorityAlerts.indexOf(alertType) >= 0) {
                        if (priorityAlertCanBeShow()) {
                            alert.onCloseAction.Remove(visiblePriorityAlertOnClose);
                            alert.onCloseAction.Add(visiblePriorityAlertOnClose);
                            visiblePriorityAlerts.push(priorityAlerts.indexOf(alertType));
                        } else {
                            return;
                        }
                    }

                    alert.show();

                    onShowAlert.Invoke(alertType, alert);
                }
            }

            function updateAlert(alertType, title, body, messages, properties, withoutLineBrakes) {
                var alert = getAlert(alertType);
                if (alert) {
                    alertfactory.UpdateAlert(alert, alertType, title, body, messages, properties, withoutLineBrakes);
                }
            }

            function showAlert(alertType, title, body, messages, properties, withoutLineBrakes) {
                updateAlert(alertType, title, body, messages, properties, withoutLineBrakes);
                popAlert(alertType);
            }

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
    }
);