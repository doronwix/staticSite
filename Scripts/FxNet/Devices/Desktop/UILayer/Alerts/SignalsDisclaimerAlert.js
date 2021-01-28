define(
    "devicealerts/SignalsDisclaimerAlert",
    [
        "require",
        'devicealerts/Alert',
        "knockout",
        "Dictionary",
        "handlers/Cookie"
    ],
    function SignalsDisclaimerAlertDef(require) {
        var AlertBase = require('devicealerts/Alert'),
            ko = require("knockout"),
            CookieHandler = require('handlers/Cookie'),
            Dictionary = require("Dictionary");

        var SignalsDisclaimerAlert = function SignalsDisclaimerAlertClass() {
            var tradingSignalsDisclaimerAlert = new AlertBase();
            var disclaimerAlertProperties = {
                prepareForShow: prepareForShowHandler
            };

            var init = function () {
                Object.assign(tradingSignalsDisclaimerAlert, disclaimerAlertProperties);
            };

            function prepareForShowHandler() {
                tradingSignalsDisclaimerAlert.alertName = 'SignalsDisclaimerAlert';
                tradingSignalsDisclaimerAlert.body(Dictionary.GetItem('LitContent', 'controls_ctlsignalcompliance'));
                tradingSignalsDisclaimerAlert.title(Dictionary.GetItem('LitTitle', 'controls_ctlsignalcompliance'));
                tradingSignalsDisclaimerAlert.checked = ko.observable(false);
                tradingSignalsDisclaimerAlert.lblChecked = Dictionary.GetItem('ChkAgree', 'controls_ctlsignalcompliance');
                tradingSignalsDisclaimerAlert.isSetComplianceDate = ko.observable(false);
                tradingSignalsDisclaimerAlert.buttons([
                    new tradingSignalsDisclaimerAlert.buttonProperties(
                        Dictionary.GetItem('BtnContinue', 'controls_ctlsignalcompliance'),
                        function () {
                            if (!tradingSignalsDisclaimerAlert.checked()) {
                                return;
                            }
                            CookieHandler.CreateCookie("TsComplianceDate", new Date().toDateString(), (new Date()).AddMonths(12));
                            tradingSignalsDisclaimerAlert.isSetComplianceDate(true);
                            tradingSignalsDisclaimerAlert.visible(false);
                        },
                        'disclaimer-button-continue'
                    ),
                    new tradingSignalsDisclaimerAlert.buttonProperties(
                        Dictionary.GetItem('BtnClose', 'controls_ctlsignalcompliance'),
                        function () {
                            tradingSignalsDisclaimerAlert.visible(false);
                        },
                        'disclaimer-button-close'
                    )
                ]);
            }

            return {
                Init: init,
                GetAlert: tradingSignalsDisclaimerAlert
            };
        };

        return SignalsDisclaimerAlert;
    }
);
