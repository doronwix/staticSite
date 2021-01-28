'use strict';
define(
    'viewmodels/Payments/MoneyBookersViewModel',
    [
        "require",
        "knockout",
        "jquery",
        'configuration/initconfiguration',
        'viewmodels/Payments/eWalletPaymentFlow',
        "initdatamanagers/Customer",
        'viewmodels/Payments/EwalletComponentViewModel'
    ],
    function (require) {
        var ko = require("knockout"),
            $ = require("jquery"),
            initConfiguration = require('configuration/initconfiguration'),
            paymentFlow = require('viewmodels/Payments/eWalletPaymentFlow'),
            customer = require("initdatamanagers/Customer"),
            EwalletComponentViewModel = require('viewmodels/Payments/EwalletComponentViewModel');

        function MoneyBookersViewModel() {
            var formObs = {
                    email: ko.observable(customer.prop.email)
                },
                subscribers = [];

            var ewalletVM = new EwalletComponentViewModel(paymentFlow,
                eDepositingActionType.Moneybookers,
                initConfiguration.PaymentInNewWindowConfiguration);

            ewalletVM.AddAdditionalValidations({
                email: formObs.email.extend({ required: { params: true, onlyIf: ewalletVM.Form.isDepositClicked } })
            });

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));
                ewalletVM.init(resetData, true);
                $.extend(formObs, ewalletVM.Form);
            }

            function resetData(cacheData) {
                if (cacheData) {
                    formObs.email(cacheData.email);
                }
            }

            function deposit() {
                formObs.isDepositClicked(true);
                if (!formObs.formValidation.isValid()) {
                    formObs.formValidation.errors.showAllMessages();
                    return;
                }

                paymentFlow.DepositMoneyBookers(buildRequest());
            }

            function buildRequest() {
                return $.extend({
                    email: formObs.email()
                }, ewalletVM.buildRequest());
            }

            function dispose() {
                subscribers.forEach(function (subscriber) { subscriber.dispose(); });
                ewalletVM.dispose();
            }

            init();

            return {
                Deposit: deposit,
                Form: formObs,
                Info: ewalletVM.Info,
                Amount: ewalletVM.Amount,
                dispose: dispose
            };
        }

        return MoneyBookersViewModel;
    }
);
