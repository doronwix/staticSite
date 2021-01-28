define('devicealerts/SignalsDisclaimerAlert', ["require",'handlers/Cookie', 'devicealerts/Alert', "knockout"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        CookieHandler = require('handlers/Cookie'),
        ko = require("knockout");

    var SignalsDisclaimerAlert = function () {

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
});
