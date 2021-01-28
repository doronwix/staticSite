/* globals DepositMessagesManager, eDepositEngineStatus, eDepositMessageTypes, cDepositMessageKeys, eDepositCurrencyWithValidation */
'use strict';
define(
    [
        'require',
        'knockout',
        'handlers/general',
        'configuration/initconfiguration',
        'payments/ComplianceBeforeDeposit',
        'dataaccess/dalDeposit',
        'initdatamanagers/SymbolsManager',
        'Dictionary',
        'devicemanagers/AlertsManager',
        'JSONHelper',
        'deposit/DepositCurrency',
        'managers/AmlPopupManager',
        'fxnet/uilayer/viewmodels/payments/validation/amountcurrencyvalidation',
        'devicemanagers/ViewModelsManager',
        'devicemanagers/StatesManager',
        'deposit/DepositMessagesManager'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            initConfiguration = require('configuration/initconfiguration'),
            complianceBeforeDeposit = require('payments/ComplianceBeforeDeposit'),
            dalDeposit = require('dataaccess/dalDeposit'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            Dictionary = require('Dictionary'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            JSONHelper = require('JSONHelper'),
            depositCurrency =require('deposit/DepositCurrency'),
            AmlPopupManager = require('managers/AmlPopupManager'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            amountCurrencyValidation = require('fxnet/uilayer/viewmodels/payments/validation/amountcurrencyvalidation'),
            StatesManager = require('devicemanagers/StatesManager'),
            DepositMessagesManager = require('deposit/DepositMessagesManager');

        function RegularWireTransferViewModel(settings) {
            var bankFlags = {
                none: 0,
                local: 1,
                international: 2,
                iforex: 4,
                globalCollect: 8
            };

            var customSettings = Object.assign(initConfiguration.WireTransferConfiguration, settings || {}),
                formObs = {
                    countryList: ko.observableArray([]),
                    selectedCountry: ko.observable(),
                    selectedType: ko.observable("2"),
                    accName: ko.observable(),
                    accNumber: ko.observable(),
                    bankAccNumber: ko.observable(),
                    telephone: ko.observable(),
                    depCurrency: ko.observable(),
                    depAmount: ko.observable(),
                    beneficiary: ko.observable(),
                    bank: ko.observable(),
                    bankCity: ko.observable(),
                    bankCountry: ko.observable(),
                    iban: ko.observable(),
                    swift: ko.observable(),
                    specialID: ko.observable(),
                    paymentRef: ko.observable(),
                    isDepositInProgress: ko.observable(false).publishOn(ePostboxTopic.SetSpinnerVisibility),
                    isDepositClicked: ko.observable(false),
                    GClogoVisible: ko.observable(false),
                    enableLocalWire: ko.observable(false),
                    enableInternationalWire: ko.observable(false),
                    concretePaymentType: ko.observable(null),
                    originalPaymentName: ko.observable(null),
                    concretePaymentBankFlags: ko.observable(bankFlags.none),
                    showQuestionnaireAlert: ko.observable(false)
                },
                subscribers = [];

            var amountValidation = new amountCurrencyValidation({ paymentType: eDepositingActionType.WireTransfer /*paymentType*/ });
            var allCurrencies;
            var currRequest;
            var wireTransferInvoiceInfo;
            var country;

            formObs.selectedCountry.subscribe(function () {
                dalDeposit.getWireTransferCountryInfo(formObs.selectedCountry())
                    .then(onGetCountryInfoComplete)
                    .fail(general.emptyFn)
                    .done();
            });

            formObs.selectedType.subscribe(function (value) {
                if (typeof allCurrencies != 'undefined') {
                    switch (value) {
                        case "1":
                            if (allCurrencies.localCurrencies.length > 0) {

                                getCurrenciesOrdered(allCurrencies.localCurrencies, function (curs) {
                                    curs = addMinMaxAmountTuCurrencies(curs);
                                    amountValidation.Data.currencyList(curs);
                                });
                            }
                            break;
                        case "2":
                            if (allCurrencies.internationalCurrencies.length > 0) {
                                getCurrenciesOrdered(allCurrencies.internationalCurrencies, function (curs) {
                                    curs = addMinMaxAmountTuCurrencies(curs);
                                    amountValidation.Data.currencyList(curs);
                                });
                            }
                            break;
                    }
                }
            });

            formObs.GClogoVisible = ko.pureComputed(function () {
                return (formObs.concretePaymentBankFlags() & bankFlags.globalCollect) !== 0;
            });

            formObs.paymentRefForView = ko.pureComputed(function () {
                return (general.isNullOrUndefined(formObs.paymentRef()) && formObs.GClogoVisible() === false) ? wireTransferInvoiceInfo.CustomerAccount : formObs.paymentRef()
            });

            function init() {
                amountValidation.init();

                formObs.formValidation = ko.validatedObservable({
                    amount: amountValidation.Data.value,
                    isDepositInProgress: formObs.isDepositInProgress.extend({ notEqual: true }),
                    selectedCountry: formObs.selectedCountry.extend({ required: { params: true, onlyIf: formObs.isDepositClicked } }),
                    selectedType: formObs.selectedType.extend({ required: { params: true, onlyIf: formObs.isDepositClicked } }),
                });

                subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData, function onConcretePaymentDataReceived(newValue) {
                    country = newValue.paymentCountry.id;
                    formObs.selectedCountry(country);
                    formObs.concretePaymentBankFlags(newValue.paymentData);
                    var localOrInternationalFlag = ((newValue.paymentData & ~bankFlags.iforex) & ~bankFlags.globalCollect);
                    formObs.selectedType(localOrInternationalFlag.toString());
                    formObs.concretePaymentType(newValue.concretePaymentType);
                    formObs.originalPaymentName(newValue.originalPaymentName);
                }, true));

                subscribers.push(formObs.isDepositClicked.subscribe(function (wasClicked) {
                    if (wasClicked) {
                        amountValidation.Data.validationOn(true);
                    }
                }));

                if (typeof allCurrencies == 'undefined')
                    formObs.selectedCountry(country);
            }

            function getRequestData() {
                var req = {};

                req.concretePaymentName = formObs.originalPaymentName();
                req.currencyName = amountValidation.Data.selectedCurrency().name;
                req.amount = amountValidation.Data.value();

                return req;
            }

            function switchToView(redirectToView, params) {
                viewModelsManager.VManager.SwitchViewVisible(redirectToView, params);
            }

            function deposit() {
                var paymentJson = formObs.concretePaymentBankFlags();
                var paymentDataObj = !general.isEmptyValue(paymentJson) && JSONHelper.IsValid(paymentJson) ? JSON.parse(paymentJson) : null;

                if (!general.isNullOrUndefined(paymentDataObj) &&
                    (paymentDataObj.personalData === true || paymentDataObj.personalData == 'true') &&
                    (StatesManager.States.IsCddStatusNotRequired() || StatesManager.States.IsCddStatusNotComplete())) {
                    formObs.showQuestionnaireAlert(true);
                    return;
                }

                function buildDeposit() {
                    formObs.isDepositClicked(true);

                    if (!formObs.formValidation.isValid()) {
                        formObs.formValidation.errors.showAllMessages();
                        return;
                    }

                    formObs.isDepositInProgress(true);
                    currRequest = buildRequest();
                    dalDeposit.depositWireTransfer(currRequest)
                        .then(onDepositRequestComplete)
                        .fail(onDepositRequestError)
                        .done();
                }

                if (complianceBeforeDeposit.isCddBeforeDeposit()) {
                    complianceBeforeDeposit.openCdd(getRequestData, buildDeposit);
                } else {
                    if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
                        complianceBeforeDeposit.showKycWarningAlert();
                        return true;
                    }
                    buildDeposit();
                    return true;
                }
            }

            function buildRequest() {
                return {
                    depositCurrency: amountValidation.Data.selectedCurrency().id,
                    amount: amountValidation.Data.value(),
                    wireTransferType: formObs.selectedType(),
                    countryID: formObs.selectedCountry(),
                    concretePaymentType: formObs.concretePaymentType(),
                    concretePaymentName: formObs.originalPaymentName(),
                    concretePaymentData: formObs.concretePaymentBankFlags()
                };
            }

            function onDepositRequestError() {
                formObs.isDepositInProgress(false);
            }

            function onDepositRequestComplete(res) {
                var response = JSONHelper.STR2JSON("WireTransferControl/onDepositRequestComplete", res);

                if (response.status === "ServerError") {
                    AlertsManager.ShowAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem("GenericAlert", "dialogsTitles", " "), Dictionary.GetItem("ServerError"), null);
                    formObs.isDepositInProgress(false);
                    return;
                }

                var result = response.result;

                wireTransferInvoiceInfo = JSONHelper.STR2JSON("WireTransferControl/onDepositRequestComplete", res).wireTransferInvoiceInfo;
                currRequest.EngineStatusID = result[eDepositResponse.EngineStatusID];

                if (result[eDepositResponse.ValidationStatusID] != eDepositValidationStatus.Valid) {
                    var messageType = DepositMessagesManager.getMessageTypeForValidationStatusId(result[eDepositResponse.ValidationStatusID]);
                    failDepositWithMessage(messageType, result);

                    return;
                } else {
                    if (currRequest.EngineStatusID != 200) {
                        formObs.accName(wireTransferInvoiceInfo.CustomerName);
                        formObs.accNumber(wireTransferInvoiceInfo.CustomerAccount);

                        if (formObs.selectedType() == bankFlags.local) {
                            formObs.bankAccNumber(wireTransferInvoiceInfo.BankAccountNumber);
                        }

                        formObs.telephone(wireTransferInvoiceInfo.CustomerPhone);
                        formObs.depCurrency(wireTransferInvoiceInfo.CurrencyName);
                        amountValidation.Data.value(wireTransferInvoiceInfo.Amount);
                        formObs.iban(wireTransferInvoiceInfo.IBAN);
                        formObs.beneficiary(wireTransferInvoiceInfo.Beneficiary);
                        formObs.bank(wireTransferInvoiceInfo.FullName);
                        formObs.paymentRef(wireTransferInvoiceInfo.PaymentReference);
                        formObs.bankCity(wireTransferInvoiceInfo.Branch);
                        formObs.bankCountry(wireTransferInvoiceInfo.CountryDescription);
                        formObs.swift(wireTransferInvoiceInfo.Swift);
                        formObs.specialID(wireTransferInvoiceInfo.SpecialID);
                        formObs.isDepositInProgress(false);

                        var args = {
                            amount: amountValidation.Data.value(),
                            accName: formObs.accName(),
                            accNumber: formObs.accNumber(),
                            telephone: formObs.telephone(),
                            GClogoVisible: formObs.GClogoVisible(),
                            depCurrency: formObs.depCurrency(),
                            beneficiary: formObs.beneficiary(),
                            bank: formObs.bank(),
                            bankCity: formObs.bankCity(),
                            bankCountry: formObs.bankCountry(),
                            bankAccNumber: formObs.bankAccNumber(),
                            specialID: formObs.specialID(),
                            iban: formObs.iban(),
                            swift: formObs.swift(),
                            paymentRefForView: formObs.paymentRefForView()
                        };

                        switchToView(initConfiguration.WireTransferConfiguration.formToDisplayForSuccessfulPayments, args);

                        if (general.isFunctionType(customSettings.onDepositSuccessCallback)) {
                            customSettings.onDepositSuccessCallback();
                        }
                    }
                }

                if (result[eDepositResponse.EngineStatusID] == eDepositEngineStatus.Failed) {
                    failDepositWithMessage(eDepositMessageTypes.depositFailed, result);
                    return;
                }
            }

            function failDepositWithMessage(messageType, response) {
                var messageData = {
                    messageDetails: response[eDepositResponse.MessageDetails],
                    currency: symbolsManager.GetTranslatedSymbolById(currRequest.depositCurrency),
                    amount: currRequest.amount,
                    confirmationCode: response[eDepositResponse.ConfirmationCode],
                    transactionDescriptor: response[eDepositResponse.TransactionDescriptor],
                    baseClearerTypeId: response[eDepositResponse.BaseClearerTypeId]
                };

                if (messageType !== eDepositMessageTypes.showAmlPending) {
                    var depositMessageWrapper = DepositMessagesManager.getDepositMessageWrapper(messageType, messageData);
                    ko.postbox.publish('deposit-failed', depositMessageWrapper.message);
                    showDepositResponse(depositMessageWrapper, { redirectToView: customSettings.formToDisplayForFailedPayments });
                } else {
                    ko.postbox.publish('deposit-failed');
                    AmlPopupManager.show();
                }

                formObs.isDepositInProgress(false);
            }

            function showDepositResponse(depositMessageWrapper, params) {
                AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, depositMessageWrapper.title, depositMessageWrapper.message, depositMessageWrapper.messages || '', params);
                AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
            }

            function addMinMaxAmountTuCurrencies(curs) {
                return curs.map(function (v) {
                    v.MinAmount = 0;
                    v.MaxAmount = 2000000000;
                    return v
                });
            }

            function addValidationInfoToDepositCurrencies(data, validationsData, shouldValidateAmlAmount) {
                data.map(function mapValidationInfo(d) {
                    var currencyIdToFind = d.id,
                        currency = validationsData.find(function findCurrency(c) {
                            return currencyIdToFind === c[eDepositCurrencyWithValidation.CurrencyID];
                        });

                    if (currency) {
                        d.MinAmount = Math.max(currency[eDepositCurrencyWithValidation.MinAmount], d.minAmount);
                        if (shouldValidateAmlAmount) {
                            d.MaxAmlAmount = currency[eDepositCurrencyWithValidation.MaxAmlAmount];
                        }
                    } else {
                        d.MinAmount = 1;
                    }

                    d.MaxAmount = 2000000000;
                })

                return data;
            }

            function onGetCountryInfoComplete(countryCurrencies) {
                allCurrencies = JSONHelper.STR2JSON("RegularWireTransferVM:onGetCountryInfoComplete", countryCurrencies);

                if (formObs.selectedType() === "1") {
                    getCurrenciesOrdered(allCurrencies.localCurrencies, function processCurrency(curs) {

                        if (!general.isEmptyValue(allCurrencies.validation)) {
                            addValidationInfoToDepositCurrencies(curs, allCurrencies.validation, 1 === parseInt(allCurrencies.validateAml));
                        } else {
                            curs = addMinMaxAmountTuCurrencies(curs);
                        }
                        amountValidation.Data.currencyList(curs);
                    });
                } else {
                    getCurrenciesOrdered(allCurrencies.internationalCurrencies, function (curs) {
                        if (!general.isEmptyValue(allCurrencies.validation)) {
                            addValidationInfoToDepositCurrencies(curs, allCurrencies.validation, 1 === parseInt(allCurrencies.validateAml));
                        } else {
                            curs = addMinMaxAmountTuCurrencies(curs);
                        }
                        amountValidation.Data.currencyList(curs);
                    });
                }
            }

            function getCurrenciesOrdered(currencies, callback) {
                var currenciesTable = new THashTable();

                currencies.map(function onEWalletCurrenciesReceived(d) {
                    return new depositCurrency(d, symbolsManager.GetTranslatedSymbolById(d[eDepositCurrency.CurrencyID]));
                }).forEach(function (dC) { currenciesTable.SetItem(dC.currencyID, dC); });

                var result = currencies.map(function mapCurrency(currenciesDetails) {
                    return {
                        name: currenciesDetails[3],
                        id: currenciesDetails[0],
                        minAmount: currenciesDetails[2]
                    };
                });

                callback(result);
            }

            function dispose() {
                subscribers.forEach(function disposeSubscriber(subscriber) { subscriber.dispose(); });
                subscribers.length = 0;
            }

            init();

            return {
                Deposit: deposit,
                Form: formObs,
                Amount: amountValidation,
                dispose: dispose
            };
        }

        return RegularWireTransferViewModel;
    }
);