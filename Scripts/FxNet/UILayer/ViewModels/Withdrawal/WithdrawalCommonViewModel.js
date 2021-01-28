define(
    'viewmodels/Withdrawal/WithdrawalCommonViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'initdatamanagers/Customer',
        'devicemanagers/ViewModelsManager',
        'devicemanagers/StatesManager',
        'devicemanagers/AlertsManager',
        'JSONHelper',
        'initdatamanagers/SymbolsManager',
        'dataaccess/dalWithdrawal',
        'FxNet/LogicLayer/Withdrawals/LastWithdrawalRequest',
        'modules/systeminfo',
        'configuration/initconfiguration'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            JSONHelper = require('JSONHelper'),
            Dictionary = require('Dictionary'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            initConfiguration = require('configuration/initconfiguration');   

        var WithdrawalCommonViewModel = general.extendClass(KoComponentViewModel, function WithdrawalCommonViewModelClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                settings;
               
            function init() {
                settings = initConfiguration.WithdrawalConfiguration;
            }

            function dispose() {
                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            function handleSaveWithdrawalResponse(responseText, symbolId, saveWithdrawalRequestCallback) {
                var props = {};
                var response = JSONHelper.STR2JSON("WithdrawalViewModel/onLoadComplete", responseText, eErrorSeverity.medium) || { ResponseReturnType: null };
                var responseAlertBody;

                switch (response.ResponseReturnType) {
                    case SaveWithdrawalResponseReturnType.Succeded:
                        props = { redirectToView: settings.withdrawalRequestSuccessRedirectToView, redirectToViewArgs: { showMenuButton: true, iD: response.WithdrawalID } };
                        responseAlertBody = String.format(Dictionary.GetItem("withdrawalSucceeded"), response.WithdrawalID);
                        ko.postbox.publish('trading-event', 'withdrawal-success');
                        break;
                    case SaveWithdrawalResponseReturnType.NotPossible:
                        responseAlertBody = Dictionary.GetItem("withdNotPossible");
                        ko.postbox.publish('withdrawal-error', 'withdNotPossible');
                        break;
                    case SaveWithdrawalResponseReturnType.EquityLimit:
                        responseAlertBody = Dictionary.GetItem("withdEquityLimit");
                        ko.postbox.publish('withdrawal-error', 'withdEquityLimit');
                        break;
                    case SaveWithdrawalResponseReturnType.AmountLimit:
                        var amountLimit = response.ResponseLimit.toString() + " " + symbolsManager.GetTranslatedSymbolById(symbolId);
                        responseAlertBody = Dictionary.GetItem("withdAmountLimit") + " " + amountLimit;
                        ko.postbox.publish('withdrawal-error', 'withdAmountLimit');
                        break;
                    case SaveWithdrawalResponseReturnType.TradingBonusTakeoutRequired:
                    case SaveWithdrawalResponseReturnType.TradingBonusTakeoutRequiredRich:
                        var bodyText, responseLimit = response.ResponseLimit.split(',');

                        if (response.ResponseReturnType === SaveWithdrawalResponseReturnType.TradingBonusTakeoutRequired) {
                            bodyText = Dictionary.GetItem("MSG_WITHD_TB_TAKEOUT_MSG");
                        } else {
                            bodyText = Dictionary.GetItem("MSG_WITHD_TB_TAKEOUT_MSG_CASE2");
                        }

                        var tradingBonusRequiredEquityPercent = responseLimit[1],
                            maxWithdrawalWithoutBonusTakeout = responseLimit[2],
                            newTradingBonus = responseLimit[3],
                            currency = responseLimit[4];

                        bodyText = String.format(bodyText, currency, maxWithdrawalWithoutBonusTakeout, tradingBonusRequiredEquityPercent, newTradingBonus);
                        props = {
                            okButtonCallback: function () { saveWithdrawalRequestCallback(true); },  // OK click handler for the second withdrawal request
                            okButtonCaption: Dictionary.GetItem("proceed"),
                            cancelButtonCaption: Dictionary.GetItem("cancel")
                        };

                        AlertsManager.UpdateAlert(AlertTypes.GeneralOkCancelAlert, Dictionary.GetItem("MSG_WITHD_TB_TAKEOUT_MSG_TITLE"), bodyText, null, props);
                        AlertsManager.PopAlert(AlertTypes.GeneralOkCancelAlert);
                        return;
                    default:
                        responseAlertBody = Dictionary.GetItem("withdrawalFailed");
                        ko.postbox.publish('withdrawal-error', 'withdrawalFailed');
                }

                AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, null, [responseAlertBody], props);
                AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
            }

            function getSymbolIdOrDefault(symboldId, currencies) {
                if (currencies.length > 0) {
                    if (ko.utils.arrayFirst(currencies, function(ccy) { return ccy.SymbolID === symboldId }) !== null) {
                        return symboldId;
                    }
                    else {
                        return currencies[0].SymbolID;
                    }
                }
                return null;
            }

            function getCurrenciesFromWrapper(currenciesWrapper) {
                return ko.utils.arrayMap(currenciesWrapper, function(wrap) { return { SymbolID: wrap.Value, SymbolName: symbolsManager.GetTranslatedSymbolById(wrap.Value) } } );
            }

            return {
                init: init,
                dispose: dispose,
                handleSaveWithdrawalResponse: handleSaveWithdrawalResponse,
                getSymbolIdOrDefault: getSymbolIdOrDefault,
                getCurrenciesFromWrapper: getCurrenciesFromWrapper
            };
        });

        return WithdrawalCommonViewModel;
    }
);