define(
    'viewmodels/Payments/EwalletComponentViewModel',
    [
        'require',
        'knockout',
        'viewmodels/ViewModelBase',
        'helpers/ObservableHelper',
        'helpers/CustomKOBindings/NumericFieldBinding',
        'viewmodels/Payments/defaultCurrencyManager',
        'fxnet/uilayer/viewmodels/payments/validation/amountcurrencyvalidation',
        'devicemanagers/StatesManager',
        'handlers/general'
    ],
    function (require) {
        var ko = require('knockout'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            vmHelpers = require('helpers/ObservableHelper'),
            defaultCurrencyManager = require('viewmodels/Payments/defaultCurrencyManager'),
            amountCurrencyValidation = require('fxnet/uilayer/viewmodels/payments/validation/amountcurrencyvalidation'),
            StatesManager = require('devicemanagers/StatesManager'),
            general = require('handlers/general');

        function EwalletComponentViewModel(paymentFlow, paymentType, customSettings) {
            defaultCurrencyManager.loadLastUsedCurrency();

            var inheritedInstance = general.clone(ViewModelBase),
                amountValidation = new amountCurrencyValidation({ paymentType: paymentType}),
                self = this,
                infoObs = {
                    isPaymentButtonVisible: ko.observable(true)
                },
                formObs = {
                    isDepositInProgress: ko.observable(false).publishOn(ePostboxTopic.SetSpinnerVisibility),
                    isDepositClicked: ko.observable(false),
                    concretePaymentType: ko.observable(null),
                    originalPaymentName: ko.observable(null),
                    selectedUserCountry: ko.observable(),
                    concretePaymentData: ko.observable(null),
                    showQuestionnaireAlert: ko.observable(false)
                },
                cachedCurrencyId,
                subscribers = [],
                cachedConcretePaymentCurrencies = [];

            var validations = {
                isDepositInProgress: formObs.isDepositInProgress.extend({ notEqual: true }),
            };

            function init(specificDataReset, depositSubscriberAttached) {
                amountValidation.init();

                Object.assign(validations, { amount: amountValidation.Data.value });

                formObs.formValidation = ko.validatedObservable(validations);

                formObs.formValidation.isValid.publishOn(ePostboxTopic.PaymentFormValid);

                if (!depositSubscriberAttached) {
                    subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));
                }

                var undefinedVar;
                resetData(undefinedVar, specificDataReset);

                inheritedInstance.setSettings(self, customSettings);
                paymentFlow.Init(customSettings, paymentType, function depositDoneCallback(cachedData) {
                    resetData(cachedData, specificDataReset);
                });

                subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData, function onConcretePaymentDataChanged(newValue) {
                    formObs.concretePaymentType(newValue.concretePaymentType);
                    formObs.originalPaymentName(newValue.originalPaymentName);
                    formObs.concretePaymentData(newValue.paymentData);
                    formObs.selectedUserCountry(newValue.paymentCountry.id);
                    amountValidation.Data.concretePaymentCurrencies(newValue.paymentCurrencies);
                    cachedConcretePaymentCurrencies = newValue.paymentCurrencies;
                }, true));

                subscribers.push(formObs.isDepositClicked.subscribe(function onDepositClicked(wasClicked) {
                    if (wasClicked) {
                        amountValidation.Data.validationOn(true);
                    }
                }));
            }

            function resetData(cachedData, specificDataReset) {
                setDefaultObservables();
                paymentFlow.stop();
                paymentFlow.start();
                initCurrencies();

                if (cachedData) {
                    restoreData(cachedData);
                } else {
                    cachedCurrencyId = null;
                }

                if (specificDataReset) {
                    specificDataReset(cachedData);
                }
            }

            function restoreData(selectedData) {
                amountValidation.Data.value(selectedData.amount);
                cachedCurrencyId = selectedData.depositCurrency;

                formObs.concretePaymentType(selectedData.concretePaymentType);
                formObs.originalPaymentName(selectedData.originalPaymentName);
                amountValidation.Data.concretePaymentCurrencies(cachedConcretePaymentCurrencies);
                formObs.concretePaymentData(selectedData.concretePaymentData);
                formObs.selectedUserCountry(selectedData.userSelectedCountry);
            }

            function initCurrencies() {
                paymentFlow.GetCurrencies(paymentType, function onPaymentsReceived(currencyList) {
                    amountValidation.Data.currencyList(currencyList);

                    var currency = amountValidation.Data.currencyList()
                        .find(function findCurrency(c) {
                            return c.orderId === cachedCurrencyId;
                        });

                    if (general.isEmptyValue(currency)) {
                        defaultCurrencyManager
                            .getDefaultCurrency(amountValidation.Data.currencyList())
                            .then(function onDefaultCurrencyReceived(defaultCurrency) {
                                if (!general.isEmptyValue(defaultCurrency)) {
                                    amountValidation.Data.selectedCurrency(defaultCurrency);
                                }
                            })
                            .done();
                    } else {
                        amountValidation.Data.selectedCurrency(currency);
                        amountValidation.Data.selectedCurrency.valueHasMutated();
                    }
                });
            }

            function setDefaultObservables() {
                vmHelpers.CleanKoObservableSimpleObject(formObs);
                vmHelpers.CleanKoObservableSimpleObject(infoObs);

                infoObs.isPaymentButtonVisible(true);
                infoObs.isAmountInputFocused = ko.observable(false);
                formObs.isEmailInputFocused = ko.observable(false);
                formObs.isIDInputFocused = ko.observable(false);

                infoObs.isContinueButtonVisible = ko.computed(function computeVisibility() {
                    return amountValidation.Data.value.isValid();
                });
            }

            function deposit(request) {
                var paymentJson = formObs.concretePaymentData();
                var paymentDataObj = !general.isEmptyValue(paymentJson) && JSONHelper.IsValid(paymentJson) ? JSON.parse(paymentJson) : null;

                if (!general.isNullOrUndefined(paymentDataObj) &&
                    (paymentDataObj.personalData === true || paymentDataObj.personalData == 'true') &&
                    (StatesManager.States.IsCddStatusNotRequired() || StatesManager.States.IsCddStatusNotComplete())) {
                    formObs.showQuestionnaireAlert(true);
                    return;
                }

                formObs.isDepositClicked(true);

                if (!formObs.formValidation.isValid()) {
                    formObs.formValidation.errors.showAllMessages(true);
                    return;
                }

                if (general.isEmptyValue(amountValidation.Data.selectedCurrency())) {
                    ErrorManager.onWarning('EwalletComponentVM/Deposit', 'Tried to deposit without selected currency. Payment type: ' + paymentType + '. Currency list has count: ' + amountValidation.Data.currencyList().length);
                    return;
                }

                paymentFlow.Deposit(request || buildRequest());
            }

            function buildRequest() {
                return {
                    depositCurrency: amountValidation.Data.selectedCurrency().orderId,
                    depositCurrencyName: amountValidation.Data.selectedCurrency().name,
                    amount: amountValidation.Data.value(),
                    paymentType: paymentType,
                    concretePaymentType: formObs.concretePaymentType(),
                    concretePaymentName: formObs.originalPaymentName(),
                    userSelectedCountry: formObs.selectedUserCountry() || 0,
                    concretePaymentData: formObs.concretePaymentData()
                };
            }

            function addAdditionalValidations(additionalValidations) {
                Object.assign(validations, additionalValidations);

                formObs.formValidation = ko.validatedObservable(validations);
            }

            function dispose() {
                amountValidation.dispose();

                paymentFlow.stop();
                subscribers.forEach(function disposeSubscribers(subscriber) {
                    subscriber.dispose();
                });
                subscribers.length = 0;

                infoObs.isPaymentButtonVisible(false);
            }

            return {
                Deposit: deposit,
                Form: formObs,
                Info: infoObs,
                Amount: amountValidation,
                buildRequest: buildRequest,
                init: init,
                dispose: dispose,
                AddAdditionalValidations: addAdditionalValidations
            };
        }

        return EwalletComponentViewModel;
    }
);