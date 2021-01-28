/*eslint-disable */
define(
    'devicealerts/AlertFactory',
    [
        "require",
        'devicealerts/GeneralOkCancelAlert',
        'devicealerts/SignalsDisclaimerAlert'
    ],
    function AlertFactoryDef(require) {
        var GeneralOkCancelAlert = require('devicealerts/GeneralOkCancelAlert'),
            SignalsDisclaimerAlert = require('devicealerts/SignalsDisclaimerAlert');

        function AlertFactory() {
            //-------------- Alert Properties ----------------
            var createAlert = function (alertType) {
                var alert;

                switch (alertType) {
                    case AlertTypes.GeneralOkCancelAlert:
                        alert = new GeneralOkCancelAlert();
                        break;

                    case AlertTypes.SignalsDisclaimerAlert:
                        alert = new SignalsDisclaimerAlert();
                        break;
                }

                if (alert) {
                    alert.Init();
                    alert = alert.GetAlert;
                }

                return alert;
            };

            var setAlertProperties = function (alert, alertType, title, body, messages, properties, withoutLineBrakes) {
                alert.messages.removeAll();

                if (title != null) {
                    alert.title(title);
                }
                else {
                    alert.setDefaultTitle();
                }

                if (body != undefined) {
                    try {
                        if (general.isArrayType(body)) {
                            for (var i = 0; i < body.length; i++) {
                                body[i] = applyLineBreaks(body[i], withoutLineBrakes);

                            }
                        }
                        else {
                            // is string
                            body = applyLineBreaks(body, withoutLineBrakes);
                        }
                    }
                    catch (e) {
                        // empty
                    }

                    alert.body(body);
                }

                if (messages != undefined) {
                    while (messages.length > 0) {
                        var msg = messages.shift();
                        msg = applyLineBreaks(msg, withoutLineBrakes);

                        alert.messages.push(msg);
                    }
                }

                if (properties) {
                    alert.properties = properties;
                }
                else {
                    alert.properties = {};
                }

                return alert;
            };

            var applyLineBreaks = function (str, withoutLineBrakesReplacer) {
                if (withoutLineBrakesReplacer) {
                    return str;
                }

                return str.replace(/\\r\\n|\\n|\\r/gm, "<br />").replace(/(\r\n|\n|\r)/gm, "<br />"); // removes all 3 types of line breaks;
            };

            return {
                CreateAlert: createAlert,
                UpdateAlert: setAlertProperties
            };
        };

        window.AlertFactory = AlertFactory;
        return AlertFactory;
    }
);
