define(
    'deviceviewmodels/BaseOrder',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        'initdatamanagers/Customer',
        'cachemanagers/QuotesManager',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'managers/viewsmanager',
        "devicealerts/MinEquityAlert",
        'viewmodels/dialogs/DialogViewModel',
        'StateObject!TradingEnabled'
    ],
    function BaseOrderDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            Customer = require('initdatamanagers/Customer'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            StatesManager = require('devicemanagers/StatesManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            InstrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            ViewsManager = require('managers/viewsmanager'),
            MinEquityAlert = require("devicealerts/MinEquityAlert"),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            stateTradingEnabled = require('StateObject!TradingEnabled');

        function BaseOrder() {
            var settings = {},
                _observableObject,
                viewProperties = {};

            //-------------------------------------------------------
            function init(customSettings, observableObject) {
                _observableObject = observableObject;

                setViewProperties();
                setSettings(customSettings);
            }

            //-------------------------------------------------------
            function setViewProperties() {
                viewProperties.InactiveInstrumentAlert = inactiveInstrumentAlert;
                viewProperties.popUpAmlAlert = openAmlStatusAlert;
            }

            //-------------------------------------------------------
            function openAmlStatusAlert() {
                closeDialog();

                setTimeout(function () {
                    DialogViewModel.openAsync(
                        eAppEvents.amlStatusLoadedEvent,
                        eDialog.AmlStatus,
                        {
                            title: Dictionary.GetItem('AMLStatus', 'dialogsTitles', ''),
                            closeOnEscape: false,
                            dialogClass: 'fx-dialog amlPopup',
                            width: 620
                        },
                        eViewTypes.vAmlStatus,
                        null
                    );
                });
            }

            //-------------------------------------------------------
            function openClientQuestionnaire() {
                var viewArgs = {};
                var dealModel = ko.toJS(_observableObject);

                if (dealModel) {
                    viewArgs.instrumentId = dealModel.selectedInstrument;
                    viewArgs.tab = dealModel.initialToolTab;

                    viewArgs.transactionType = dealModel.PageName && dealModel.PageName === eDealPage.NewLimitViewModel
                        ? eTransactionSwitcher.NewLimit
                        : eTransactionSwitcher.NewDeal;

                    viewArgs.orderDir = dealModel.orderDir;
                    viewArgs.showTools = dealModel.showTools;
                    viewArgs.selectedDealAmount = dealModel.selectedDealAmount;

                    ViewsManager.RedirectToForm(eForms.ClientQuestionnaire, {
                        from: {
                            form: ViewsManager.ActiveFormType(),
                            viewArgs: viewArgs
                        }
                    });
                }
                else {
                    ViewsManager.RedirectToForm(eForms.ClientQuestionnaire, {});
                }
            }

            //-------------------------------------------------------
            function inactiveInstrumentAlert(instrumentId) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId),
                    body;

                if (instrument) {
                    body = String.format("{0} - " + Dictionary.GetItem("InstrumentInactive"), instrument.ccyPair);
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, body, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            }

            //-------------------------------------------------------
            function checkTradingAgreement(instrument) {
                if (instrument) {
                    if (instrument.isFuture == true) {
                        if (Customer.prop.futureStatus == eTradingPermissions.Required) {
                            return eTradingAgreement.Needed;
                        }
                    }
                }

                return eTradingAgreement.NotNeeded;
            }

            //-------------------------------------------------------
            function showAlert(alert, title, messages, properties) {
                AlertsManager.UpdateAlert(alert, title, '', messages, properties);
                AlertsManager.PopAlert(alert);
            }

            //-------------------------------------------------------
            function showServerAlert(alert, serverResults, properties) {
                properties = general.extendType(properties, { serverResponses: serverResults });
                AlertsManager.UpdateAlert(alert, '', '', [], properties);
                AlertsManager.PopAlert(alert);
            }

            //-------------------------------------------------------
            function showMessageResult(results, callerId, instrument, prop) {
                var title = !general.isEmptyValue(callerId) ? Dictionary.GetItem(callerId, 'dialogsTitles', ' ') : null,
                    messages = [],
                    i = 0,
                    properties = prop || {},
                    alert = AlertTypes.ServerResponseAlert,
                    isTradingEnabled = stateTradingEnabled.containsKey('TradingEnabled')
                        ? stateTradingEnabled.get('TradingEnabled')
                        : false;

                general.extendType(prop, { callerId: callerId, instrument: instrument });

                for (var j = 0, jj = results.length; j < jj; j++) {
                    switch (results[j].msgKey) {
                        case "SuccessPriceAlertAdd":
                        case "OrderError20":
                        case "OrderError22":
                            showServerAlert(AlertTypes.PriceAlertServerResponseAlert, results, prop);
                            return;

                        case "SuccessLimitAdd":
                        case "SuccessLimitEdit":
                        case "SuccessLimitDelete":
                            showServerAlert(AlertTypes.LimitsServerResponseAlert, results, prop);

                            return;
                        case "SuccessPriceAlertDelete":
                        case "OrderError23":
                            showServerAlert(AlertTypes.PriceAlertClosedServerResponseAlert, results, prop);
                            return;

                        case "SuccessDealAdd":
                            showServerAlert(AlertTypes.DealAddServerResponseAlert, results, prop);
                            return;

                        case "SuccessDealClose":
                            ko.postbox.publish('trading-event', 'close-deal-success');
                            showServerAlert(AlertTypes.DealsClosedServerResponseAlert, results, prop);
                            return;

                        case "OrderError2":
                        case "OrderError3":
                        case "OrderError12":
                            messages[i++] = String.format("{0} \n", Dictionary.GetItem(results[j].msgKey));

                            if (isTradingEnabled) {
                                alert = AlertTypes.TradingConfirmationRetryAlert;
                            }
                            break;

                        case "OrderError13":
                            if (isTradingEnabled) {
                                alert = AlertTypes.TradingConfirmationRetryAlert;
                                messages[i++] = MinEquityAlert.GetAlertContent(results[j], instrument ? InstrumentTranslationsManager.Long(instrument.id) : null, true);
                            }
                            else {
                                MinEquityAlert.Show(results[j], instrument ? InstrumentTranslationsManager.Long(instrument.id) : null, false);
                                return;
                            }
                            break;

                        // OrderError105 - Please deposit money first  
                        case "OrderError105":
                            AlertsManager.PopAlert(PostPortfoliosLoginsAlerts.IsActive);
                            return;

                        //121- cdd compliance issue  
                        case "OrderError121":
                            openClientQuestionnaire();
                            return;

                        // OrderError107 - AML Statuses 
                        case "OrderError107": // cdd or aml compliance issue
                        case "OrderError115":
                            openAmlStatusAlert();
                            return;

                        // 106 - kyc compliance issue
                        case "OrderError106":
                            // show 'Failed aware' alert
                            if (StatesManager.States.KycStatus() === eKYCStatus.Failed && StatesManager.States.KycReviewStatus() === eKYCReviewStatus.Appropriate) {
                                alert = AlertTypes.ClientQuestionnaire;
                                var questionnaireAlertManager = AlertsManager.GetAlert(AlertTypes.ClientQuestionnaire);
                                questionnaireAlertManager.popAlert().done();
                            }
                            else {
                                openClientQuestionnaire();
                            }
                            return;

                        case "OrderError116": // instrument max exposure exceed
                        case "OrderError120":
                            var instrumentId = results[j].arguments.pop(),
                                translatedInstrument = InstrumentTranslationsManager.Long(instrumentId);

                            if (translatedInstrument) {
                                results[j].arguments[0] = translatedInstrument;
                            }

                            messages[i++] = translateResult(results[j]);
                            properties = {};
                            break;

                        case "SuccessCancelPendingWithdrawal":
                        case "CancelProcessWithdrawal":
                            messages[i++] = String.format(Dictionary.GetItem(results[j].msgKey), results[j].itemId, results[j].amount, results[j].ccy);
                            title = Dictionary.GetItem('CancelProcessWithdrawalTitle');
                            break;

                        case "FaildCancelPendingWithdrawal":
                            messages[i++] = Dictionary.GetItem(results[j].msgKey);
                            break;

                        default:
                            if (eOrderActionType[callerId] === eOrderActionType.CloseDeal &&
                                results[j].msgKey !== "ServerError" &&
                                results[j].status !== "ServerError") {

                                showServerAlert(AlertTypes.DealsClosedServerResponseAlert, results, prop);

                                return;
                            }

                            if (isTradingEnabled) {
                                switch (results[j].msgKey) {
                                    case 'OrderError103':
                                    case 'OrderError9':
                                        alert = AlertTypes.TradingConfirmationRetryAlert;
                                        messages[i++] = String.format("{0} \n", Dictionary.GetItem(results[j].msgKey));
                                        break;

                                    default:
                                        messages[i++] = String.format("{0} \n", translateResult(results[j]));
                                        properties = {};
                                        title = Dictionary.GetItem('GenericAlert', 'dialogsTitles', ' ');
                                        break;
                                }
                            }
                            else {
                                messages[i++] = String.format("{0} \n", translateResult(results[j]));
                                properties = {};
                                title = Dictionary.GetItem('GenericAlert', 'dialogsTitles', ' ');
                            }
                            break;
                    }
                }

                showAlert(alert, title, messages, properties);
            }

            //-------------------------------------------------------
            function validateOnlineTradingUser() {
                if (StatesManager.States.fxDenied() === true) {

                    if (Customer.prop.isDemo === true) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("DemoExpiredMessage"), '');
                    }
                    else {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("OrderError102"), '');
                    }

                    if (StatesManager.States.ExposureCoverageAlert() == 1) {
                        AlertsManager.GetAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
                        AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
                    }

                    if (Customer.prop.isPending === true || Customer.prop.isLive) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("OrderError102"), '');
                    }

                    if (StatesManager.States.FolderTypeId() === parseInt(eFolderType.TradingBonus)) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("TradingBonusMessage"), '');
                    }

                    if (StatesManager.States.isIntDebit() === true) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("OnlineTradingDisabled"), '');
                    }

                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            }

            //-------------------------------------------------------
            function translateResult(result) {
                var msg = Dictionary.GetItem(result.msgKey || "InternalError"),
                    args = result.arguments;

                if (general.isNullOrUndefined(args)) {
                    return msg;
                }

                return String.format(msg, args);
            }

            //-------------------------------------------------------
            function limitValidateQuote(instrumentId) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId);
                var alertBody;
                var quote = QuotesManager.Quotes.GetItem(instrumentId);
                var brokerAllowLimitsOnNoRates = Customer.prop.brokerAllowLimitsOnNoRates;

                if (!brokerAllowLimitsOnNoRates && quote && !quote.isActive()) {
                    alertBody = String.format("{0} - " + Dictionary.GetItem("InstrumentInactive"), instrument.ccyPair);

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                return true;
            }

            //-------------------------------------------------------
            function limitValidate(instrumentId, nestedValidation) {
                if (StatesManager.States.fxDenied() == true) {
                    validateOnlineTradingUser();

                    return false;
                }

                return limitValidateWithoutTradingStatus(instrumentId, nestedValidation);
            }

            //-------------------------------------------------------
            function limitValidateWithoutTradingStatus(instrumentId, nestedValidation) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId);
                var res = checkTradingAgreement(instrument);
                var alertBody;

                if (res != eTradingAgreement.NotNeeded) {
                    alertBody = String.format(Dictionary.GetItem("rcFuturesRedirect"), instrument.ccyPair);

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (_observableObject.orderDir() == eOrderDir.None) {
                    alertBody = Dictionary.GetItem("limitOrderDirEmpty");

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (!_observableObject.openLimit()) {
                    alertBody = Dictionary.GetItem("limitLevelEmpty");

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (!general.isNumber(_observableObject.openLimit())) {
                    alertBody = Dictionary.GetItem("limitLevelInvalid");

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (!general.isEmptyValue(nestedValidation)) {
                    alertBody = nestedValidation.join();

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody);
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                return true;
            }

            //-------------------------------------------------------
            function setSettings(customSettings) {
                for (var key in customSettings) {
                    if (customSettings.hasOwnProperty(key)) {
                        settings[key] = customSettings[key];
                    }
                }
            }

            //-------------------------------------------------------
            function onActionReturn(result, callerId, instrument, args) {
                var prop = {};

                if (args && ('redirectToView' in args)) {
                    prop.redirectToView = args.redirectToView;
                }

                if (result[0].result === eResult.Success) {
                    closeDialog();
                }

                if (args && ('valueDate' in args)) {
                    prop.valueDate = args.valueDate;
                }

                if (args && ('requestData' in args)) {
                    prop.requestData = args.requestData;
                }

                if (args && ('tradingEnabledRetry' in args)) {
                    prop.tradingEnabledRetry = args.tradingEnabledRetry;
                }

                showMessageResult(result, callerId, instrument, prop);
            }

            //-------------------------------------------------------
            function closeDialog() {
                DialogViewModel.close();
            }

            //-------------------------------------------------------
            function resultStatusSuccess(result) {
                for (var i = 0, length = result.length; i < length; i++) {
                    if (isResultStatusError(result[i])) {
                        return false;
                    }
                }

                return true;
            }

            //-------------------------------------------------------
            function raiseErrorEvent(result, eventToPublish, additionalProperties) {
                for (var i = 0; i < result.length; i++) {
                    if (isResultStatusError(result[i])) {
                        additionalProperties.type = 'server';
                        additionalProperties.reason = result[i].msgKey;

                        if (!general.isEmptyValue(eventToPublish)) {
                            ko.postbox.publish(eventToPublish, additionalProperties);
                        }
                    }
                }
            }

            //-------------------------------------------------------
            function isResultStatusError(result) {
                return result.status == eResult.Error || result.status === "ServerError";
            }

            //-------------------------------------------------------
            return {
                Init: init,
                CheckTradingAgreement: checkTradingAgreement,
                ShowAlert: showAlert,
                ShowMessageResult: showMessageResult,
                OnActionReturn: onActionReturn,
                ValidateOnlineTradingUser: validateOnlineTradingUser,
                LimitValidate: limitValidate,
                LimitValidateQuote: limitValidateQuote,
                LimitValidateWithoutTradingStatus: limitValidateWithoutTradingStatus,
                ViewProperties: viewProperties,
                CloseDialog: closeDialog,
                ResultStatusSuccess: resultStatusSuccess,
                RaiseErrorEvent: raiseErrorEvent
            };
        }

        return BaseOrder;
    }
);