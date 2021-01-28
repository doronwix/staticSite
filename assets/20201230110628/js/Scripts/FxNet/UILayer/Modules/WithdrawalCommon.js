define(
    'modules/WithdrawalCommon',
    [
        'require',
        'knockout',
        'handlers/general',
        'configuration/initconfiguration',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/SymbolsManager',
        'modules/BuilderForInBetweenQuote',
        'handlers/AmountConverter',
        'Dictionary',
        'Q',
        'managers/historymanager',
        'JSONHelper'
    ],
    function WithDrawalCommonDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            initConfiguration = require('configuration/initconfiguration'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            AmountConverter = require('handlers/AmountConverter'),
            Dictionary = require('Dictionary'),
            JSONHelper = require('JSONHelper'),
            HistoryManager = require('managers/historymanager'),
            Q = require('Q');

        var WithDrawalCommon = function WithDrawalCommonClass() {
            var settings = initConfiguration.WithdrawalConfiguration;

            function goBack() {
                HistoryManager.Back();
            }

            function isBackOffice() {
                return !general.isEmptyValue(settings.isBackOffice) ? settings.isBackOffice : false;
            }

            function goToDefaultPage() {
                viewModelsManager.VManager.SwitchViewVisible(settings.stepLoadFailRedirectView, {})
            }

            function getSymbolIdOrDefault(symboldId, currencies) {
                if (currencies.length > 0) {
                    var currencyAvailable = currencies.find(function (ccy) { return ccy.SymbolID === parseInt(symboldId); });
                    return !general.isEmptyValue(currencyAvailable) ? symboldId : currencies[0].SymbolID;
                }

                return null;
            }

            function getCurrenciesFromWrapper(currenciesWrapper) {
                return ko.utils.arrayMap(currenciesWrapper, function (wrap) { return { SymbolID: wrap.Value, SymbolName: symbolsManager.GetTranslatedSymbolById(wrap.Value) } });
            }

            function getConvertedAmmount(amount, maxAmount, defaultCurrencyId, selectedCurrencyId) {
                var q = Q.defer(),
                    convertToDefaultCurrency = BuilderForInBetweenQuote
                        .GetInBetweenQuote(selectedCurrencyId, defaultCurrencyId)
                        .then(function (response) {
                            return AmountConverter.Convert(amount, response, true);
                        }),
                    convertToSelectedCurrency = BuilderForInBetweenQuote
                        .GetInBetweenQuote(defaultCurrencyId, selectedCurrencyId)
                        .then(function (response) {
                            return AmountConverter.Convert(maxAmount, response, true);
                        });


                Q.all([convertToDefaultCurrency, convertToSelectedCurrency])
                    .then(function (result) {
                        var convertedAmount = result[0],
                            convertedMaxAmount = result[1];

                        return q.resolve({
                            amount: convertedAmount,
                            maxAmount: convertedMaxAmount
                        });
                    }, function () {
                        ErrorManager.onError("WithdrawalCommon/CurrencyConversionFailed", "", eErrorSeverity.medium);

                        return q.reject(null)
                    });

                return q.promise;
            }

            function parseWSaveResponse(responseText, symbolId, saveWithdrawal) {
                var response = JSONHelper.STR2JSON("WithdrawalViewModel/onLoadComplete", responseText, eErrorSeverity.medium) ||
                    { ResponseReturnType: null, ResponseLimit: 0 },
                    fail = false,
                    success = false,
                    trackingEvent = null,
                    alertType = AlertTypes.GeneralOkAlert,
                    alertProps = {},
                    alertTitle = null,
                    alertContent = null,
                    maxWAmount = response.hasOwnProperty('ResponseLimit') && !general.isEmptyValue(response.ResponseLimit) ?
                        Number.fromStr(response.ResponseLimit.toString()) : 0;

                maxWAmount = general.isNumberType(maxWAmount) && maxWAmount > 0 ? maxWAmount : 0;

                switch (response.ResponseReturnType) {
                    case SaveWithdrawalResponseReturnType.TradingBonusTakeoutRequired:
                    case SaveWithdrawalResponseReturnType.TradingBonusTakeoutRequiredRich:
                        var responseLimit = response.ResponseLimit.split(','),
                            tradingBonusRequiredEquityPercent = responseLimit[1],
                            maxWithdrawalWithoutBonusTakeout = responseLimit[2],
                            newTradingBonus = responseLimit[3],
                            currency = responseLimit[4],
                            bodyText = Dictionary.GetItem(response.ResponseReturnType === SaveWithdrawalResponseReturnType.TradingBonusTakeoutRequired ?
                                'MSG_WITHD_TB_TAKEOUT_MSG' : 'MSG_WITHD_TB_TAKEOUT_MSG_CASE2');

                        alertType = AlertTypes.GeneralOkCancelAlert;
                        alertProps = {
                            okButtonCallback: function () { saveWithdrawal(true); },  // OK click handler for the second withdrawal request
                            okButtonCaption: Dictionary.GetItem('proceed'),
                            cancelButtonCaption: Dictionary.GetItem('cancel')
                        };

                        alertTitle = Dictionary.GetItem("MSG_WITHD_TB_TAKEOUT_MSG_TITLE");
                        alertContent = String.format(bodyText, currency, maxWithdrawalWithoutBonusTakeout, tradingBonusRequiredEquityPercent, newTradingBonus);
                        break;

                    case SaveWithdrawalResponseReturnType.Succeded:
                        success = true;
                        alertProps = { redirectToView: settings.withdrawalRequestSuccessRedirectToView, redirectToViewArgs: { showMenuButton: true, iD: response.WithdrawalID } };
                        alertContent = String.format(Dictionary.GetItem("withdrawalSucceeded"), response.WithdrawalID);
                        trackingEvent = { type: 'trading-event', value: 'withdrawal-success' };
                        break;

                    case SaveWithdrawalResponseReturnType.NotPossible:
                        fail = true;
                        alertContent = Dictionary.GetItem('withdNotPossible');
                        trackingEvent = { type: 'withdrawal-error', value: 'withdNotPossible' };
                        break;

                    case SaveWithdrawalResponseReturnType.EquityLimit:
                        fail = true;
                        alertContent = Dictionary.GetItem('withdEquityLimit');
                        trackingEvent = { type: 'withdrawal-error', value: 'withdEquityLimit' };
                        break;

                    case SaveWithdrawalResponseReturnType.AmountLimit:
                        fail = true;
                        alertContent = Dictionary.GetItem('withdAmountLimit') + " " +
                            maxWAmount.toString() + " " + symbolsManager.GetTranslatedSymbolById(symbolId);
                        trackingEvent = { type: 'withdrawal-error', value: 'withdAmountLimit' };
                        break;

                    default:
                        alertContent = Dictionary.GetItem('withdrawalFailed');
                        trackingEvent = { type: 'withdrawal-error', value: 'withdrawalFailed' };
                }

                return {
                    success: success,
                    fail: fail,
                    trackingEvent: trackingEvent,
                    maxWAmount: maxWAmount,
                    alertDetails: {
                        type: alertType,
                        props: alertProps,
                        title: alertTitle,
                        content: alertContent
                    }
                };
            }

            return {
                isBackOffice: isBackOffice,
                goToDefaultPage: goToDefaultPage,
                getConvertedAmmount: getConvertedAmmount,
                getSymbolIdOrDefault: getSymbolIdOrDefault,
                getCurrenciesFromWrapper: getCurrenciesFromWrapper,
                parseWSaveResponse: parseWSaveResponse,
                goBack: goBack
            };
        };

        return new WithDrawalCommon();
    }
);
