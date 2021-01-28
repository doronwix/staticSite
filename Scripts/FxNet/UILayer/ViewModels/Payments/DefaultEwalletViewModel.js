'use strict';
define(
    'viewmodels/Payments/DefaultEwalletViewModel',
    [
        "require",
        'configuration/initconfiguration',
        'viewmodels/Payments/eWalletPaymentFlow',
        'viewmodels/Payments/EwalletComponentViewModel'
    ],
    function (require) {
        var initConfiguration = require('configuration/initconfiguration'),
            paymentFlow = require('viewmodels/Payments/eWalletPaymentFlow'),
            EwalletComponentViewModel = require('viewmodels/Payments/EwalletComponentViewModel');

        function DefaultEwalletViewModel(params) {
            var ewalletVM = new EwalletComponentViewModel(paymentFlow, params.depositingType, initConfiguration.PaymentInNewWindowConfiguration);

            ewalletVM.init();

            return {
                Deposit: ewalletVM.Deposit,
                Form: ewalletVM.Form,
                Info: ewalletVM.Info,
                Amount: ewalletVM.Amount,
                dispose: ewalletVM.dispose
            };
        }

        return DefaultEwalletViewModel;
    }
);