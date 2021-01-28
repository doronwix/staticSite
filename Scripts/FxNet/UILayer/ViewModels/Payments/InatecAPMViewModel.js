'use strict';
define(
    'viewmodels/Payments/InatecAPMViewModel',
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

        function InatecAPMViewModel(params) {
            var formObs = {
                    holderName: ko.observable(),
                    accountNumber: ko.observable(),
                    bankCode: ko.observable()
                },
                subscribers = [],
                ewalletVM = {};

            if (params.inatecSubtype === 'giropay') {
                ewalletVM = new EwalletComponentViewModel(paymentFlow, eDepositingActionType.InatecAPM, initConfiguration.PaymentInNewWindowConfiguration);

                ewalletVM.AddAdditionalValidations({
                    holderName: formObs.holderName.extend({ required: { params: true, onlyIf: ewalletVM.Form.isDepositClicked } }),
                    accountNumber: formObs.accountNumber.extend({ required: { params: true, onlyIf: ewalletVM.Form.isDepositClicked } }),
                    bankCode: formObs.bankCode.extend({ required: { params: true, onlyIf: ewalletVM.Form.isDepositClicked } })
                });
            } else {
                ewalletVM = new EwalletComponentViewModel(paymentFlow, eDepositingActionType.InatecAPM, initConfiguration.PaymentInNewWindowConfiguration);

                ewalletVM.AddAdditionalValidations({
                    holderName: formObs.holderName.extend({ required: { params: true, onlyIf: ewalletVM.Form.isDepositClicked } })
                });
            }

            $.extend(formObs, ewalletVM.Form);

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));
                ewalletVM.init(resetData, true);
                formObs.isAmountInputFocused = ko.observable(false);
                formObs.isNameInputFocused = ko.observable(false);
                formObs.isAccountInputFocused = ko.observable(false);
                formObs.isBankInputFocused = ko.observable(false);

                formObs.isContinueButtonVisible = ko.computed(function () {
                    return !formObs.isAmountInputFocused() && !formObs.isNameInputFocused() && !formObs.isAccountInputFocused() && !formObs.isBankInputFocused();
                });
            }

            function resetData(cachedData) {
                if (cachedData) {
                    formObs.holderName(cachedData.holderName);
                    formObs.accountNumber(cachedData.accountNumber);
                    formObs.bankCode(cachedData.bankCode);
                }
            }

            function deposit() {
                formObs.isDepositClicked(true);

                if (!formObs.formValidation.isValid()) {
                    formObs.formValidation.errors.showAllMessages();
                    return;
                }

                paymentFlow.DepositInatecAPM(buildRequest());
            }

            function buildRequest() {
                if (params.inatecSubtype === 'giropay')
                    return $.extend({
                        holderName: formObs.holderName(),
                        accountNumber: formObs.accountNumber(),
                        bankCode: formObs.bankCode()
                    }, ewalletVM.buildRequest());
                else
                    return $.extend({
                        holderName: formObs.holderName()
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
                Form: formObs,
                Info: ewalletVM.Info,
                Amount: ewalletVM.Amount,
                dispose: dispose
            };
        }

        return InatecAPMViewModel;
    }
);
