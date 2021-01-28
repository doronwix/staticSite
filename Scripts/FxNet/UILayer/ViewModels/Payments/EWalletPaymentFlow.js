/* globals  DepositMessagesManager, eDepositEngineStatus, AmlPopupManager, ePostData, eDepositMessageTypes, cDepositMessageKeys, eDepositCurrencyWithValidation  */
define(
    'viewmodels/Payments/eWalletPaymentFlow',
    [
        "require",
        "knockout",
        "JSONHelper",
        'viewmodels/ViewModelBase',
        'dataaccess/dalDeposit',
        'payments/ComplianceBeforeDeposit',
        'devicemanagers/AlertsManager',
        'initdatamanagers/SymbolsManager',
        "initdatamanagers/Customer",
        'managers/AmlPopupManager',
        'handlers/general',
        'deposit/DepositCurrency',
        'viewmodels/Payments/PaymentResultProcessor',
        'managers/CommunicationManager',
        'deposit/DepositMessagesManager'
    ],
    function EWalletPaymentFlowClass(require) {
        var ko = require("knockout"),
            JSONHelper = require("JSONHelper"),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            dalDeposit = require('dataaccess/dalDeposit'),
            complianceBeforeDeposit = require('payments/ComplianceBeforeDeposit'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            SymbolsManager = require('initdatamanagers/SymbolsManager'),
            Customer = require("initdatamanagers/Customer"),
            AmlPopupManager = require('managers/AmlPopupManager'),
            general = require('handlers/general'),
            depositCurrency = require('deposit/DepositCurrency'),
            PaymentResultProcessor = require('viewmodels/Payments/PaymentResultProcessor'),
            CommunicationManager = require('managers/CommunicationManager'),
            DepositMessagesManager = require('deposit/DepositMessagesManager');

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
                        var source = "[eWalletPaymentFlow]";
                        var message = "Received null concrete payment type id. New value=" + JSON.stringify(newValue);
                        ErrorManager.onWarning(source, message);
                    }
                }, true));
        }

        function stop() {
            subscribers.forEach(function disposeSubscriber(subscriber) {
                subscriber.dispose();
            });

            subscribers.length = 0;
        }

        function getCurrenciesOrdered(paymentType, callback) {
            dalDeposit
                .getEWalletCurrencies(paymentType, countryId, concretePaymentType)
                .then(function onEWalletCurrenciesReceived(responseText) {
                    var currenciesAllData = JSONHelper.STR2JSON("EWalletPaymentViewModel/onGetCurrenciesCompleted",
                        responseText),
                        currenciesResult = currenciesAllData.result;

                    var depositCurrenciesTable = buildDepositCurrencies(currenciesResult),
                        sortedDepCurrencies = depositCurrenciesTable.Sort(currencySortPropertyName())
                            .map(function mapDepositCurrency(id) { return depositCurrenciesTable.GetItem(id); });

                    var currencies = sortedDepCurrencies.map(function mapCurrency(depCurr) {
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

        function currencySortPropertyName() {
            return settings().currencySortPropertyName || "orderID";
        }

        function buildDepositCurrencies(data) {
            var currencies = new THashTable();

            data
                .map(function mapCurrency(d) {
                    return new depositCurrency(d, SymbolsManager.GetTranslatedSymbolById(d[eDepositCurrency.CurrencyID]));
                })
                .forEach(function processCurrency(dC) { currencies.SetItem(dC.currencyID, dC); });

            return currencies;
        }

        function addValidationInfoToDepositCurrencies(data, validationsData, shouldValidateAmlAmount) {
            data.map(function mapValidationInfo(d) {
                var currencyIdToFind = d.orderId,
                    currency = validationsData.find(function findCurrency(c) {
                        return currencyIdToFind === c[eDepositCurrencyWithValidation.CurrencyID];
                    })

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

        function prepareDepositRequest(req) {
            currRequest = req;

            // avoid popup block by opening window before ajax request
            prepare3rdPartyView();
            FxNet.hideUI();
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

            function buildDeposit() {
                isDepositInProgress(true);
                prepareDepositRequest(req);
                dalDeposit.depositEWallet(currRequest)
                    .then(onDepositRequestCompleted)
                    .fail(onDepositRequestError)
                    .done();
            }

            if (complianceBeforeDeposit.isCddBeforeDeposit()) {
                complianceBeforeDeposit.openCdd(getRequestData, buildDeposit);
                return true;
            }

            if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
                complianceBeforeDeposit.showKycWarningAlert();
                return true;
            }

            buildDeposit();
            return true;
        }

        function depositEmailEwallet(req) {
            buildRequestData(req);

            function buildDepositEmailEwallet() {
                isDepositInProgress(true);
                prepareDepositRequest(req);
                dalDeposit.depositEmailEWallet(currRequest)
                    .then(onDepositRequestCompleted)
                    .fail(onDepositRequestError)
                    .done();
            }

            if (complianceBeforeDeposit.isCddBeforeDeposit()) {
                complianceBeforeDeposit.openCdd(getRequestData, buildDepositEmailEwallet);
                return true;
            }

            if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
                complianceBeforeDeposit.showKycWarningAlert();
                return true;
            }

            buildDepositEmailEwallet();
            return true;
        }

        function depositMoneyBookers(req) {
            buildRequestData(req);

            function buildDepositMoneyBookers() {
                isDepositInProgress(true);
                prepareDepositRequest(req);
                dalDeposit.depositMoneyBookers(currRequest)
                    .then(onDepositRequestCompleted)
                    .fail(onDepositRequestError)
                    .done();
            }

            if (complianceBeforeDeposit.isCddBeforeDeposit()) {
                complianceBeforeDeposit.openCdd(getRequestData, buildDepositMoneyBookers);
                return true;
            }

            if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
                complianceBeforeDeposit.showKycWarningAlert();
                return true;
            }

            buildDepositMoneyBookers();
            return true;
        }

        function depositInatecAPM(req) {
            buildRequestData(req);

            function buildDepositInatecAPM() {
                isDepositInProgress(true);
                prepareDepositRequest(req);
                dalDeposit.depositInatecAPM(currRequest)
                    .then(onDepositRequestCompleted)
                    .fail(onDepositRequestError)
                    .done();
            }

            if (complianceBeforeDeposit.isCddBeforeDeposit()) {
                complianceBeforeDeposit.openCdd(getRequestData, buildDepositInatecAPM);
                return true;
            }

            if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
                complianceBeforeDeposit.showKycWarningAlert();
                return true;
            }

            buildDepositInatecAPM();
            return true;
        }

        function depositCreditCard3rdParty(req) {
            buildRequestData(req);

            function buildDepositCreditCard3rdParty() {
                isDepositInProgress(true);
                req.userSelectedCountry = req.userSelectedCountry || countryId || 0;
                deposit(req);
            }

            if (complianceBeforeDeposit.isCddBeforeDeposit()) {
                complianceBeforeDeposit.openCdd(getRequestData, buildDepositCreditCard3rdParty);
                return true;
            }

            if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
                complianceBeforeDeposit.showKycWarningAlert();
                return true;
            }

            buildDepositCreditCard3rdParty();
            return true;
        }

        function settings() {
            return inheritedInstance.getSettings(self);
        }

        function prepare3rdPartyView() {
            window.paymentsPopup = settings().prepare3rdPartyView();

            window.paymentsPopup.OnClose(function onPopupClosed() {
                isDepositInProgress(false);
                depositCompletedCallback(currRequest);
            });
        }

        function onDepositRequestError() {
            closePopup();
            isDepositInProgress(false);
        }

        function onDepositRequestCompleted(res) {
            var parsedRes = JSONHelper.STR2JSON("EWalletPaymentFlow/onDepositRequestCompleted", res);

            if (parsedRes.status === "ServerError") {
                AlertsManager.ShowAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem("GenericAlert", "dialogsTitles", " "), Dictionary.GetItem("ServerError"), null);
                isDepositInProgress(false);
                return;
            }

            var response = parsedRes.result;

            currRequest.EngineStatusID = response[eDepositResponse.EngineStatusID];

            if (response[eDepositResponse.ValidationStatusID] != eDepositValidationStatus.Valid) {
                var messageType = DepositMessagesManager.getMessageTypeForValidationStatusId(response[eDepositResponse.ValidationStatusID]);
                failDepositWithMessage(messageType, response);
                return;
            }

            if (response[eDepositResponse.EngineStatusID] == eDepositEngineStatus.Failed) {
                failDepositWithMessage(eDepositMessageTypes.depositFailed, response);
                return;
            }

            var resultProcessor = new PaymentResultProcessor(settings(), depositCompletedCallback, currRequest);
            dalDeposit.getPaymentStatus(response[eDepositResponse.RequestID], depositingActionType, resultProcessor.OnDepositPaymentStatusTimeout)
                .then(resultProcessor.ProcessPaymentFinalResponse)
                .fail(general.emptyFn)
                .done();

            window.paymentsPopup.Navigate(getCommunicationManager(response));
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
                ko.postbox.publish('deposit-failed', depositMessageWrapper.message);
                showDepositResponse(depositMessageWrapper, { redirectToView: settings().formToDisplayForFailedPayments });
            } else {
                ko.postbox.publish('deposit-failed');
                AmlPopupManager.show();
            }

            closePopup();
            isDepositInProgress(false);
            depositCompletedCallback(currRequest);
        }

        function showDepositResponse(depositMessageWrapper, params) {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, depositMessageWrapper.title, depositMessageWrapper.message, depositMessageWrapper.messages || '', params);
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
        }

        function closePopup() {
            if (!window.paymentsPopup) {
                return;
            }

            if (window.paymentsPopup.Close) {
                window.paymentsPopup.Close();
            }

            window.paymentsPopup = null;
        }

        function getCommunicationManager(response) {
            var communicationData = parseCommunicationData(response);

            return new CommunicationManager(communicationData);
        }

        function parseCommunicationData(response) {
            var postData = response[eDepositResponse.ClearerPostData].map(function mapData(pd) {
                return { name: pd[ePostData.Name], value: pd[ePostData.Value] };
            });

            var clearerUrl = response[eDepositResponse.ClearerRequestUrl] ||
                response[eDepositResponse.MoneybookersURL];

            return {
                actionUrl: clearerUrl,
                postData: postData,
                hash: response[eDepositResponse.ClearerUrlHash],
                accountNumber: Customer.prop.accountNumber,
                title: settings().title
            };
        }

        return {
            Init: init,
            GetCurrencies: getCurrenciesOrdered,
            Deposit: deposit,
            DepositEmailEwallet: depositEmailEwallet,
            DepositMoneyBookers: depositMoneyBookers,
            DepositInatecAPM: depositInatecAPM,
            DepositCreditCard3rdParty: depositCreditCard3rdParty,
            start: start,
            stop: stop
        };
    }
);