define(
    'viewmodels/Payments/CreditCard3rdPartyViewModel',
    [
        'require',
        'knockout',
        'viewmodels/ViewModelBase',
        'configuration/initconfiguration',
        'helpers/ObservableHelper',
        'viewmodels/Payments/eWalletPaymentFlow',
        'viewmodels/Payments/CreditCard3rdPartyPublicData',
        'handlers/general'
    ],
    function (require) {
        var ko = require('knockout');
        var ViewModelBase = require('viewmodels/ViewModelBase');
        var initConfiguration = require('configuration/initconfiguration');
        var vmHelpers = require('helpers/ObservableHelper');
        var eWalletFlow = require('viewmodels/Payments/eWalletPaymentFlow');
        var CreditCardPublicData = require('viewmodels/Payments/CreditCard3rdPartyPublicData');
        var general = require('handlers/general');

        function CreditCard3rdPartyViewModel() {
            var formObs = {},
                infoObs = {},
                self = this,
                subscribers = [];
            var paymentType = eDepositingActionType.SafechargePPP;

            var ccData = new CreditCardPublicData(paymentType);

            var inheritedInstance = general.clone(ViewModelBase);

            var customSettings = initConfiguration.PaymentsConfiguration;

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));

                inheritedInstance.setSettings(self, customSettings);
                ccData.Init();
                eWalletFlow.Init(customSettings, paymentType, depositDoneCallback);

                initObservables();
                start();
            }

            function initObservables() {
                formObs.isDepositInProgress = ko.observable(false);

                formObs.formValidation = ko.validatedObservable({
                    ccData: ccData.Form.isValid.extend({ equal: true }),
                    isDepositInProgress: formObs.isDepositInProgress.extend({ notEqual: true }),
                    amount: ccData.Amount.Data.value
                });

                infoObs.isPaymentButtonVisible = ko.observable(true);
                infoObs.isAmountInputFocused = ko.observable(false);
            }

            function start() {
                setDefaultObservables();
                ccData.Start();
                eWalletFlow.start();
            }

            function setDefaultObservables() {
                vmHelpers.CleanKoObservableSimpleObject(formObs);
            }

            function deposit() {
                ccData.Form.isValidationEnabled(true);

                if (!formObs.formValidation.isValid()) {
                    formObs.formValidation.errors.showAllMessages(true);
                    return;
                }

                if (!ccData.Form.selectedCCType()) {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("depUnsupportedCardType"), "");
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return;
                }

                if (general.isEmptyValue(ccData.Amount.Data.selectedCurrency())) {
                    ErrorManager.onWarning('CreditCard3rdPartyVM/Deposit', 'Tried to deposit without selected currency. Payment type: ' + paymentType + '. Currency list has count: ' + ccData.Amount.Data.currencyList().length);
                    return;
                }

                eWalletFlow.DepositCreditCard3rdParty({
                    depositCurrency: ccData.Amount.Data.selectedCurrency().orderId,
                    amount: ccData.Amount.Data.value(),
                    paymentType: paymentType
                });
            }

            function depositDoneCallback() {
                setDefaultObservables();
            }

            function dispose() {
                setDefaultObservables();

                infoObs.isPaymentButtonVisible(false);

                ccData.Stop();
                eWalletFlow.stop();
                subscribers.forEach(function (subscriber) { subscriber.dispose(); });
                subscribers.length = 0;
            }

            init();

            return {
                PublicInfo: ccData.Info,
                PublicForm: ccData.Form,
                Form: formObs,
                Info: infoObs,
                Amount: ccData.Amount,
                Deposit: deposit,
                dispose: dispose
            };
        }

        return CreditCard3rdPartyViewModel;
    }
);