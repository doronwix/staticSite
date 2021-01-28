define(
    'devicealerts/ContactUsCTAAlert',
    [
        'require',
        'devicealerts/Alert',
        'Dictionary',
        'LoadDictionaryContent!account_ContactUs'
    ],
    function ContactUsCtaAlertDef(require) {
        var AlertBase = require('devicealerts/Alert'),
            Dictionary = require('Dictionary');

        var ContactUsCtaAlert = function ContactUsCtaAlertClass() {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'devicealerts/ContactUsCTAAlert';
                inheritedAlertInstance.visible(false);

            };

            inheritedAlertInstance.lnkCallBack = Dictionary.GetItem('PhoneusLink', 'account_ContactUs');
            inheritedAlertInstance.lnkEmailResponse = Dictionary.GetItem('EmailusLink', 'account_ContactUs');
            inheritedAlertInstance.title = Dictionary.GetItem('lblContactUsTitle');

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return ContactUsCtaAlert;
    }
);
