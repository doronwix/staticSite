'use strict';
define(
    'viewmodels/Payments/GlobalCollectAPMViewModel',
    [
        "require",
        "knockout",
        "jquery",
        'configuration/initconfiguration',
        'viewmodels/Payments/eWalletPaymentFlow',
        'viewmodels/Payments/EwalletComponentViewModel'
    ],
    function (require) {
        var ko = require("knockout"),
            $ = require("jquery"),
            initConfiguration = require('configuration/initconfiguration'),
            paymentFlow = require('viewmodels/Payments/eWalletPaymentFlow'),
            EwalletComponentViewModel = require('viewmodels/Payments/EwalletComponentViewModel');

        function GlobalCollectAPMViewModel() {
            var paymentProductId = "840", //Paypal by default
                paymentCountryCode = null, //Customer country will be used by default 
                subscribers = [],
                ewalletVM = new EwalletComponentViewModel(paymentFlow, eDepositingActionType.GlobalCollectAPM, initConfiguration.PaymentInNewWindowConfiguration);

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData, function (newValue) {
                    paymentProductId = newValue.paymentData;    
                    paymentCountryCode = newValue.paymentCountry.code;
                }, true));

                var undefinedVar; 
                ewalletVM.init(undefinedVar, true);
            }

            function deposit() {
                ewalletVM.Deposit(buildRequest());
            }

            function buildRequest() {
                return $.extend({
                    paymentMethod: paymentProductId,
                    paymentCountry: paymentCountryCode
                }, ewalletVM.buildRequest());
            }

            function dispose() {
                subscribers.forEach(function (subscriber) { subscriber.dispose(); });
                subscribers.length = 0;
                ewalletVM.dispose();
            }

            init();

            return {
                Deposit: deposit,
                Form: ewalletVM.Form,
                Info: ewalletVM.Info,
                Amount: ewalletVM.Amount,
                dispose: dispose
            };
        }

        return GlobalCollectAPMViewModel;
    }
);