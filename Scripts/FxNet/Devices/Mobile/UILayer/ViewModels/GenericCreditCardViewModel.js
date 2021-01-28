define(
    "deviceviewmodels/GenericCreditCardViewModel",
    [
        "require",
        "knockout",
        'handlers/general',
        'viewmodels/Payments/GenericCreditCardViewModel'
    ],
    function GenericCreditCardDef(require) {
        var ccBaseViewModel = require('viewmodels/Payments/GenericCreditCardViewModel'),
            general = require('handlers/general');

        var GenericCreditCardViewModel = general.extendClass(ccBaseViewModel, function GenericCreditCardClass() {
            var ko = require("knockout"),
                parent = this.parent;

            parent.CVVTooltipInfo.isPaymentButtonVisible = ko.observable(true);

            function dispose() {
                parent.dispose();
                parent.CVVTooltipInfo.isPaymentButtonVisible(false);
            }

            return {
                Form: parent.Form,
                Deposit: parent.Deposit,
                ShowCVV: parent.ShowCVV,
                CVVTooltipInfo: parent.CVVTooltipInfo,
                dispose: dispose,
                CVVInfo: parent.CVVInfo
            };
        });

        return GenericCreditCardViewModel;
    }
);
