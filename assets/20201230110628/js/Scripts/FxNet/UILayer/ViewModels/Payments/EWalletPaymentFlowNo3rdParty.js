/* globals  DepositMessagesManager, eDepositEngineStatus, AmlPopupManager, eDepositMessageTypes, eDepositCurrencyWithValidation  */
define(
    "viewmodels/Payments/eWalletPaymentFlowNo3rdParty",
    [
        "require",
        "knockout",
        'handlers/general',
        'dataaccess/dalDeposit',
        'payments/ComplianceBeforeDeposit',
        'devicemanagers/AlertsManager',
        "JSONHelper",
        'viewmodels/ViewModelBase',
        'initdatamanagers/SymbolsManager',
        'managers/AmlPopupManager',
        'deposit/DepositCurrency',
        'viewmodels/Payments/PaymentResultProcessor',
        'deposit/DepositMessagesManager',
        'Dictionary'
    ],
    function EWalletPaymentFlowNo3rdPartyClass(require) {
        var ko = require("knockout"),
            dalDeposit = require('dataaccess/dalDeposit'),
            complianceBeforeDeposit = require('payments/ComplianceBeforeDeposit'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            JSONHelper = require("JSONHelper"),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            SymbolsManager = require('initdatamanagers/SymbolsManager'),
            AmlPopupManager = require('managers/AmlPopupManager'),
            depositCurrency = require('deposit/DepositCurrency'),
            general = require('handlers/general'),
            PaymentResultProcessor = require('viewmodels/Payments/PaymentResultProcessor'),
            DepositMessagesManager = require('deposit/DepositMessagesManager'),
            dictionary = require('Dictionary');

        var currRequest = {},
            requestData = {},
            self = null,
            depositCompletedCallback = function () { },
            countryId = null,
            concretePaymentType = null,
            subscribers = [],
            depositingActionType,
            isDepositInProgress = ko.observable(false).publishOn(ePostboxTopic.SetSpinnerVisibility);

        var inheritedInstance = general.clone(ViewModelBase);

        function init(customSettings, paymentType, depositDoneCallback) {
            self = this;
            depositingActionType = paymentType;
            inheritedInstance.setSettings(self, customSettings);
            depositCompletedCallback = depositDoneCallback;

            isDepositInProgress.extend({ notEqual: true });
        }

        function start() {
            subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData,
                function onConcretePaymentDataReceived(newValue) {
                    countryId = newValue.paymentCountry.id;
                    concretePaymentType = newValue.concretePaymentType;

                    if (newValue.concretePaymentType === null) {
                        var source = "[eWalletPaymentFlowNo3rdParty]";
                        var message = "Received null concrete payment type id. New value=" + JSON.stringify(newValue);
                        ErrorManager.onWarning(source, message);
                    }
                },
                true));
        }

        function stop() {
            subscribers.forEach(function disposeSubscriber(subscriber) { subscriber.dispose(); });
            subscribers.length = 0;
        }

        function settings() {
            return inheritedInstance.getSettings(self);
        }

        function buildDepositCurrencies(data) {
            var currencies = new THashTable();

            data
                .map(function mapCurreny(d) {
                    return new depositCurrency(d, SymbolsManager.GetTranslatedSymbolById(d[eDepositCurrency.CurrencyID]));
                })
                .forEach(function processCurrency(dC) { currencies.SetItem(dC.currencyID, dC); });

            return currencies;
        }

        function currencySortPropertyName() {
            return settings().currencySortPropertyName || "orderID";
        }

        function getCurrenciesOrdered(paymentType, callback) {
            dalDeposit
                .getEWalletCurrencies(paymentType, countryId, concretePaymentType)
                .then(function onEWalletCurrenciesReceived(responseText) {
                    var currenciesAllData = JSONHelper.STR2JSON("EWalletPaymentViewModel/onGetCurrenciesCompleted", responseText),
                        currenciesResult = currenciesAllData.result;

                    var depositCurrenciesTable = buildDepositCurrencies(currenciesResult);

                    var sortedDepCurrencies = depositCurrenciesTable.Sort(currencySortPropertyName())
                        .map(function mapDepositCurrency(id) {
                            return depositCurrenciesTable.GetItem(id);
                        });

                    var currencies = sortedDepCurrencies
                        .map(function mapCurrency(depCurr) {
                            return { name: depCurr.name, orderId: depCurr.currencyID };
                        });

                    if (!general.isEmptyValue(currenciesAllData.validation)) {
                        addValidationInfoToDepositCurrencies(currencies, currenciesAllData.validation, 1 === parseInt(currenciesAllData.validateAml));
                    }

                    callback(currencies);
                })
                .fail(general.emptyFn)
                .done();
        }

        function addValidationInfoToDepositCurrencies(data, validationsData, shouldValidateAmlAmount) {
            data.map(function mapValidationInfo(d) {
                var currencyIdToFind = d.orderId,
                    currency = validationsData.find(function findCurrency(c) {
                        return currencyIdToFind === c[eDepositCurrencyWithValidation.CurrencyID];
                    });

                if (currency) {
                    d.MinAmount = currency[eDepositCurrencyWithValidation.MinAmount];
                    d.MaxAmount = currency[eDepositCurrencyWithValidation.MaxAmount];
                    if (shouldValidateAmlAmount) {
                        d.MaxAmlAmount = currency[eDepositCurrencyWithValidation.MaxAmlAmount];
                    }
                }
            });

            return data;
        }

        function buildRequestData(req) {
            requestData.concretePaymentType = req.concretePaymentType;
            requestData.concretePaymentName = req.concretePaymentName;
            requestData.currencyName = req.depositCurrencyName;
            requestData.amount = req.amount;
            requestData.concretePaymentType = req.concretePaymentType || concretePaymentType;

            return requestData;
        }

        function getRequestData() {
            return requestData;
        }

        function deposit(req) {
            buildRequestData(req);

            function sendDeposit() {
                isDepositInProgress(true);
                currRequest = req;
                dalDeposit.depositEWallet(currRequest)
                    .then(onDepositRequestCompleted)
                    .fail(onDepositRequestError)
                    .done();
            }

            if (complianceBeforeDeposit.isCddBeforeDeposit()) {
                complianceBeforeDeposit.openCdd(getRequestData, sendDeposit);
                return true;
            }

            if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
                complianceBeforeDeposit.showKycWarningAlert();
                return true;
            }

            sendDeposit();
            return true;
        }

        function showDepositResponse(depositMessageWrapper, params) {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, depositMessageWrapper.title, depositMessageWrapper.message, "", params);
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
        }

        function failDepositWithMessage(messageType, response) {
            var messageData = {
                messageDetails: response[eDepositResponse.MessageDetails],
                currency: SymbolsManager.GetTranslatedSymbolById(currRequest.depositCurrency),
                amount: currRequest.amount,
                confirmationCode: response[eDepositResponse.ConfirmationCode],
                transactionDescriptor: response[eDepositResponse.TransactionDescriptor],
                baseClearerTypeId: response[eDepositResponse.BaseClearerTypeId]
            };

            if (messageType !== eDepositMessageTypes.showAmlPending) {
                var depositMessageWrapper = DepositMessagesManager.getDepositMessageWrapper(messageType, messageData);
                ko.postbox.publish("deposit-failed", depositMessageWrapper.message);
                showDepositResponse(depositMessageWrapper, { redirectToView: settings().formToDisplayForFailedPayments });
            } else {
                ko.postbox.publish("deposit-failed");
                AmlPopupManager.show();
            }

            isDepositInProgress(false);
            depositCompletedCallback(currRequest);
        }

        function depositCompleted() {
            isDepositInProgress(false);
            depositCompletedCallback(currRequest);
        }

        function onDepositRequestError() {
            isDepositInProgress(false);
        }

        function onDepositRequestCompleted(res) {
            var parsedRes = JSONHelper.STR2JSON("EWalletPaymentFlow/onDepositRequestCompleted", res);

            if (parsedRes.status === "ServerError") {
                AlertsManager.ShowAlert(AlertTypes.ServerResponseAlert, dictionary.GetItem("GenericAlert", "dialogsTitles", " "), dictionary.GetItem("ServerError"), null);
                isDepositInProgress(false);
                return;
            }

            var response = parsedRes.result;

            currRequest.EngineStatusID = response[eDepositResponse.EngineStatusID];

            if (response[eDepositResponse.ValidationStatusID] !== eDepositValidationStatus.Valid) {
                var messageType = DepositMessagesManager.getMessageTypeForValidationStatusId(response[eDepositResponse.ValidationStatusID]);
                failDepositWithMessage(messageType, response);
                return;
            }

            if (response[eDepositResponse.EngineStatusID] === eDepositEngineStatus.Failed) {
                failDepositWithMessage(eDepositMessageTypes.depositFailed, response);
                return;
            }

            var resultProcessor = new PaymentResultProcessor(settings(), depositCompletedCallback, currRequest);
            dalDeposit.getPaymentStatus(response[eDepositResponse.RequestID], depositingActionType, resultProcessor.OnDepositPaymentStatusTimeout)
                .then(resultProcessor.ProcessPaymentFinalResponse)
                .fail(general.emptyFn)
                .done();

            if (!resultProcessor.ProcessPaymentFinalResponse(res)) {
                depositCompleted();
                return;
            }
        }

        return {
            Init: init,
            GetCurrencies: getCurrenciesOrdered,
            Deposit: deposit,
            start: start,
            stop: stop
        };
    }
);