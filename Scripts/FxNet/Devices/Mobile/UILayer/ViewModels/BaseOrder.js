define(
    'deviceviewmodels/BaseOrder',
    [
        'require',
        'knockout',
        'Dictionary',
        'handlers/general',
        'initdatamanagers/Customer',
        'cachemanagers/QuotesManager',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'managers/viewsmanager',
        "devicealerts/MinEquityAlert"
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
            MinEquityAlert = require("devicealerts/MinEquityAlert"),
            ViewsManager = require('managers/viewsmanager');

        function BaseOrder() {
            var settings = {},
                _observableObject;

            //------------------------------------------------------
            function init(customSettings, observableObject) {
                _observableObject = observableObject;
                setSettings(customSettings);
            }

            //-------------------------------------------------------
            var openAmlStatusAlert = function () {
                ViewsManager.SwitchViewVisible(eForms.Aml, {});
            }

            //------------------------------------------------------
            function openClientQuestionnaire() {
                var viewArgs = {};
                var dealModel = ko.toJS(_observableObject);

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

            //------------------------------------------------------
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

            //------------------------------------------------------
            function showMessageResult(results, callerId, instrument, prop) {
                var messages = [];
                var i = 0;
                var properties = prop || {};
                var alert = AlertTypes.ServerResponseAlert;

                general.extendType(prop, { callerId: callerId, instrument: instrument });

                for (var j = 0, jj = results.length; j < jj; j++) {
                    switch (results[j].msgKey) {
                        case "SuccessPriceAlertAdd":
                        case "OrderError20":
                        case "OrderError22":
                            showServerAlert(AlertTypes.PriceAlertServerResponseAlert, results, prop);

                            return;

                        case "SuccessLimitEdit":
                        case "SuccessLimitDelete":
                        case "SuccessLimitAdd":
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
                            properties = {};

                            break;

                        case "OrderError13":
                            MinEquityAlert.Show(results[j], instrument ? InstrumentTranslationsManager.Long(instrument.id) : null, false);

                            return;

                        case "OrderError105":
                            AlertsManager.PopAlert(PostPortfoliosLoginsAlerts.IsActive);

                            return;

                        //121 - cdd, 107 and 115- AML
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
                            } else {
                                openClientQuestionnaire();
                            }

                            return;

                        case "OrderError116": // instrument max exposure exceed
                        case "OrderError120":
                            var instrumentId = results[j].arguments.pop(-1),
                                translatedInstrument = InstrumentTranslationsManager.Short(instrumentId);

                            if (translatedInstrument) {
                                results[j].arguments[0] = translatedInstrument;
                            }

                            messages[i++] = defaultResultMessage(results[j]);
                            properties = {};
                            break;

                        case "SuccessCancelPendingWithdrawal":
                        case "CancelProcessWithdrawal":
                            messages[i++] = String.format(Dictionary.GetItem(results[j].msgKey), results[j].itemId, results[j].amount, results[j].ccy);
                            break;

                        case "FaildCancelPendingWithdrawal":
                            messages[i++] = Dictionary.GetItem(results[j].msgKey);

                            break;

                        default:
                            if (eOrderActionType[callerId] == eOrderActionType.CloseDeal && results[j].msgKey !== "ServerError") {
                                showServerAlert(AlertTypes.DealsClosedServerResponseAlert, results, prop);

                                return;
                            }

                            messages[i++] = defaultResultMessage(results[j]);
                            properties = {};

                            break;
                    }
                }

                showAlert(alert, '', messages, properties);
            }

            //-------------------------------------------------------
            // private :  
            // get analyzed response results, return translated message with additional arguments if exist.
            function defaultResultMessage(result) {
                var msg = Dictionary.GetItem(result.msgKey || "InternalError"),
                    args = result.arguments;

                if (!general.isNullOrUndefined(args)) {
                    return String.format(msg, args);
                }

                return msg;
            }

            //-------------------------------------------
            function limitValidateQuote(instrumentId) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId);
                var alertBody;
                var quote = QuotesManager.Quotes.GetItem(instrumentId);
                var brokerAllowLimitsOnNoRates = Customer.prop.brokerAllowLimitsOnNoRates;

                if (!brokerAllowLimitsOnNoRates && quote && !quote.isActive()) {
                    alertBody = String.format("{0} - " + Dictionary.GetItem("InstrumentInactive"), instrument.ccyPair);

                    AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, '', alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);

                    return false;
                }

                return true;
            }

            //-------------------------------------------------------

            function validateOnlineTradingUser() {
                if (StatesManager.States.fxDenied() === true) {

                    if (Customer.prop.isDemo === true) {
                        AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, null, Dictionary.GetItem("DemoExpiredMessage"), '');
                    }
                    else {
                        AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, null, Dictionary.GetItem("OrderError102"), '');
                    }

                    if (StatesManager.States.ExposureCoverageAlert() == 1) {
                        AlertsManager.GetAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
                        AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
                    }

                    if (Customer.prop.isPending === true || Customer.prop.isLive) {
                        AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, null, Dictionary.GetItem("OrderError102"), '');
                    }

                    if (StatesManager.States.FolderTypeId() === parseInt(eFolderType.TradingBonus)) {
                        AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, null, Dictionary.GetItem("TradingBonusMessage"), '');
                    }

                    if (StatesManager.States.isIntDebit() === true) {
                        AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, null, Dictionary.GetItem("OnlineTradingDisabled"), '');
                    }

                    AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);
                }
            }

            //-------------------------------------------------------
            function limitValidate(instrumentId, nestedValidation) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId),
                    res = checkTradingAgreement(instrument),
                    alertBody;

                if (StatesManager.States.fxDenied() == true) {
                    validateOnlineTradingUser();

                    return false;
                }

                if (res != eTradingAgreement.NotNeeded) {
                    alertBody = String.format(Dictionary.GetItem("rcFuturesRedirect"), instrument.ccyPair);

                    AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, '', alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);

                    return false;
                }

                //-------------------------------------------

                if (_observableObject.orderDir() == eOrderDir.None) {
                    alertBody = Dictionary.GetItem("limitOrderDirEmpty");

                    AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, '', alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);

                    return false;
                }

                //-------------------------------------------

                if (!_observableObject.openLimit()) {
                    alertBody = Dictionary.GetItem("limitLevelEmpty");

                    AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, '', alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);

                    return false;
                }

                //-------------------------------------------

                if (!general.isNumber(_observableObject.openLimit())) {
                    alertBody = Dictionary.GetItem("limitLevelInvalid");

                    AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, '', alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);

                    return false;
                }

                //-------------------------------------------

                if (!general.isEmptyValue(nestedValidation)) {
                    alertBody = nestedValidation;
                    AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, '', null, alertBody);
                    AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);

                    return false;
                }

                //-------------------------------------------

                return true;
            }

            //------------------------------------------------------
            function setSettings(customSettings) {
                for (var key in customSettings) {
                    if (customSettings.hasOwnProperty(key)) {
                        settings[key] = customSettings[key];
                    }
                }
            }

            //------------------------------------------------------
            function onActionReturn(result, callerId, instrument, args) {
                showMessageResult(result, callerId, instrument, args);
            }

            //------------------------------------------------------
            function resultStatusSuccess(result) {
                for (var i = 0, length = result.length; i < length; i++) {
                    if (isResultStatusError(result[i])) {
                        return false;
                    }
                }

                return true;
            }

            //------------------------------------------------------
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

            //------------------------------------------------------
            function isResultStatusError(result) {
                return result.status == eResult.Error || result.status === "ServerError";
            }

            //------------------------------------------------------
            return {
                Init: init,
                CheckTradingAgreement: checkTradingAgreement,
                ShowMessageResult: showMessageResult,
                ShowAlert: showAlert,
                OnActionReturn: onActionReturn,
                LimitValidate: limitValidate,
                ValidateOnlineTradingUser: validateOnlineTradingUser,
                LimitValidateQuote: limitValidateQuote,
                ResultStatusSuccess: resultStatusSuccess,
                RaiseErrorEvent: raiseErrorEvent
            };
        }

        return BaseOrder;
    }
);
