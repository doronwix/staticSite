define(
    "viewmodels/Payments/EWalletExtendedViewModel",
    [
        "require",
        "knockout",
        "configuration/initconfiguration",
        'viewmodels/Payments/eWalletPaymentFlow',
        'initdatamanagers/Customer',
        "viewmodels/Payments/EwalletComponentViewModel",
        'Dictionary'
    ],
    function EWalletExtendedViewModelDef(require) {
        var ko = require("knockout"),
            initConfiguration = require("configuration/initconfiguration"),
            paymentFlow = require('viewmodels/Payments/eWalletPaymentFlow'),
            customer = require('initdatamanagers/Customer'),
            EwalletComponentViewModel = require("viewmodels/Payments/EwalletComponentViewModel"),
            dictionary = require("Dictionary");

        function EWalletExtendedViewModel(params) {
            var formObs = {
                    email: ko.observable(customer.prop.email),
                    validationOn: ko.observable(false)
                },
                subscribers = [];

            var ewalletVM = new EwalletComponentViewModel(paymentFlow,
                params.depositingType,
                initConfiguration.PaymentInNewWindowConfiguration);

            ewalletVM.AddAdditionalValidations({
                email: formObs.email.extend({
                    required: {
                        value: true,
                        message: dictionary.GetItem("reqEwalletEmail"),
                        onlyIf: ewalletVM.Form.isDepositClicked
                    },
                    validation: {
                        validator: function (val, args) {
                            if (typeof val != "undefined" && validateEmail(val)) { return true; }
                        },
                        message: dictionary.GetItem("valEwalletEmail")
                    }

                })
            });

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));
                ewalletVM.init(resetData, true);
                Object.assign(formObs, ewalletVM.Form);
            }

            function resetData(cacheData) {
                if (cacheData) {
                    formObs.email(cacheData.email);
                }
            }

            function validateEmail(mail) {
                if (/^\w*([\.\-\_\+\%]*\w*)*@\w+([\.\-\_\+\%]*\w*)*\.+([\.\-\_\+\%]*\w+)+$/.test(mail)) {
                    return true;
                }

                return false;
            }

            function deposit() {
                formObs.isDepositClicked(true);

                if (!formObs.formValidation.isValid()) {
                    if (formObs.email.length == 0) {
                        formObs.validationOn(true);
                    }

                    formObs.formValidation.errors.showAllMessages();
                    return;
                }

                paymentFlow.DepositEmailEwallet(buildRequest());
            }

            function buildRequest() {
                return Object.assign({
                    email: formObs.email()
                }, ewalletVM.buildRequest());
            }

            function dispose() {
                subscribers.forEach(function disposeSubscribers(subscriber) { subscriber.dispose(); });
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

        return EWalletExtendedViewModel;
    }
);