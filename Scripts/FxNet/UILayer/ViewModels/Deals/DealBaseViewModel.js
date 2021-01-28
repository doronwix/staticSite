/*global eNewDealLimitType  */
define(
    'viewmodels/Deals/DealBaseViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'handlers/Deal',
        'helpers/KoComponentViewModel',
        'configuration/initconfiguration',
        'initdatamanagers/Customer',
        'deviceviewmodels/BaseOrder',
        'viewmodels/limits/SetLimitsViewModel',
        'dataaccess/dalorder',
        'generalmanagers/RegistrationManager',
        'cachemanagers/QuotesManager',
        'initdatamanagers/InstrumentsManager',
        'managers/CustomerProfileManager',
        'managers/viewsmanager',
        'FxNet/LogicLayer/Deal/DealAmountLabel',
        'initdatamanagers/SymbolsManager',
        'generalmanagers/DealTypeManager',
        'StateObject!Transaction',
        'modules/BuilderForInBetweenQuote',
        'cachemanagers/PortfolioStaticManager',
        'devicemanagers/AlertsManager'
    ],
    function DealBaseDef(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            TDeal = require('handlers/Deal'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            settings = require('configuration/initconfiguration').NewDealConfiguration,
            Customer = require('initdatamanagers/Customer'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            SetLimitsViewModel = require('viewmodels/limits/SetLimitsViewModel'),
            dalOrders = require('dataaccess/dalorder'),
            RegistrationManager = require('generalmanagers/RegistrationManager'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            ViewsManager = require('managers/viewsmanager'),
            DealAmountLabel = require('FxNet/LogicLayer/Deal/DealAmountLabel'),
            SymbolsManager = require('initdatamanagers/SymbolsManager'),
            DealTypeManager = require('generalmanagers/DealTypeManager'),
            stateObject = require('StateObject!Transaction'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            portfolioStaticManager = require('cachemanagers/PortfolioStaticManager'),
            AlertsManager = require('devicemanagers/AlertsManager');

        var DealBaseViewModel = general.extendClass(KoComponentViewModel, function DealBaseClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                baseOrder = new BaseOrder(),
                usdId = 47,
                setLimitsModel = new SetLimitsViewModel();

            function init(customSettings) {
                parent.init.call(self, customSettings);	 // inherited from KoComponentViewModel

                baseOrder.Init({}, data);

                setObservables();
                setSubscribers();
                setComputables();

                var setlimitsConfiguration = self.getSettings().setlimitsConfiguration;
                setLimitsModel.Init(data, setlimitsConfiguration);

                setPropertiesFromViewArgs();
            }

            function setObservables() {
                data.PageName = eDealPage.NewDeal;
                data.ready = ko.observable(false);

                data.customerSymbolName = stateObject.set("customerSymbolName", ko.observable(Customer.prop.baseCcyName()));
                data.customerSymbolId = stateObject.set("customerSymbolId", ko.observable(Customer.prop.baseCcyId()));
                data.orderDir = stateObject.set("orderDir", ko.observable(eOrderDir.None).extend({ dirty: false }));
                data.selectedInstrument = stateObject.set("selectedInstrument", ko.observable());
                data.selectedDealAmount = stateObject.set("selectedDealAmount", ko.observable());
                data.selectedDealAmount.extend({ notify: 'always' });
                data.selectedDealAmount.extend({ amountValidation: [] });
                data.amountSymbol = stateObject.set("amountSymbol", ko.observable(""));
                data.quoteForOtherCcyToAccountCcy = stateObject.get("quoteForOtherCcyToAccountCcy");
                data.quoteForBaseCcyToAccountCcy = stateObject.get("quoteForBaseCcyToAccountCcy");
                data.quoteForUsdCcyToAccountCcy = stateObject.get("quoteForUsdCcyToAccountCcy");
                data.bid = stateObject.set("bid", ko.observable(''));
                data.ask = stateObject.set("ask", ko.observable(''));

                data.initialToolTab = stateObject.set("initialToolTab", ko.observable(""));
                data.showTools = stateObject.set("showTools", ko.observable(true));

                data.bidPips = stateObject.set("bidPips", ko.observable(""));
                data.askPips = stateObject.set("askPips", ko.observable(""));
                data.changePips = stateObject.set("changePips", ko.observable(""));
                data.tradeTime = stateObject.set("tradeTime", ko.observable(""));
                data.highBid = stateObject.set("highBid", ko.observable(""));
                data.lowAsk = stateObject.set("lowAsk", ko.observable(""));
                data.open = stateObject.set("open", ko.observable(""));
                data.close = stateObject.set("close", ko.observable(""));
                data.change = stateObject.set("change", ko.observable(""));
                data.formattedChange = stateObject.set("formattedChange", ko.observable(""));

                data.isForex = stateObject.set("isForex", ko.observable(false));
                data.isFuture = stateObject.set("isFuture", ko.observable(false));
                data.isShare = stateObject.set("isShare", ko.observable(false));
                data.isStock = stateObject.set("isStock", ko.observable(false));
                data.isNonForex = ko.observable(true);

                data.hasInstrument = ko.observable(false);
                data.baseSymbolName = ko.observable("");
                data.otherSymbolName = ko.observable("");
                data.dealAmountLabel = ko.observable("");
                data.dealMinMaxAmounts = ko.observableArray([]);
                data.originalSymbolName = ko.observable("");
                data.baseSymbol = ko.observable("");
                data.ccyPair = stateObject.set("ccyPair", ko.observable(''));

                data.quotesAvailable = ko.observable(false);
                data.isProcessing = ko.observable(false);
                data.limitsReady = ko.observable(false);

                data.activeQuote = null;
                data.isActiveQuote = stateObject.set('isActiveQuote', ko.observable(false));
                data.activeQuoteState = ko.observable();
                data.bid10K = ko.observable("");
                data.bid100K = ko.observable("");
                data.ask10K = ko.observable("");
                data.ask100K = ko.observable("");

                data.bidLabel = {
                    First: ko.observable(""),
                    Middle: ko.observable(""),
                    Last: ko.observable("")
                };

                data.askLabel = {
                    First: ko.observable(""),
                    Middle: ko.observable(""),
                    Last: ko.observable("")
                };

                data.profileKeyForDefaultTab = stateObject.set('profileKeyForDefaultTab', ko.observable(settings.profileKeyForDefaultTab));

                data.enableSLLimit = ko.observable(false);
                data.enableTPLimit = ko.observable(false);

                data.isSlRateActiveTab = ko.observable(false);
                data.isSlAmountActiveTab = ko.observable(false);
                data.isSlPercentActiveTab = ko.observable(false);
                data.isTpRateActiveTab = ko.observable(false);
                data.isTpAmountActiveTab = ko.observable(false);
                data.isTpPercentActiveTab = ko.observable(false);
                data.displaySlPercentSymbol = ko.observable(false);
                data.displayTpPercentSymbol = ko.observable(false);
                data.displaySlAmountCcySymbol = ko.observable(false);
                data.displayTpAmountCcySymbol = ko.observable(false);

                data.quoteForAccountCcyToUSDCcy = ko.observable("");
                data.quoteForBaseCcyToUSDCcy = ko.observable("");
                data.quoteForAccountCcyToOtherCcy = ko.observable("");

                // Functions
                data.buyBtnClick = function () {
                    setOrderDir(eOrderDir.Buy);
                };

                data.sellBtnClick = function () {
                    setOrderDir(eOrderDir.Sell);
                };

                data.pendingBonusType = ko.observable();
                data.spreadDiscount = ko.observable();

                data.chartTransactionEnabled = stateObject.set('chartTransactionEnabled', ko.observable(false));
            }

            function setSubscribers() {
                self.subscribeAndNotify(data.ask, function (rate) {
                    var splitRate = Format.tenthOfPipSplitRate(rate, data.selectedInstrument());

                    data.askLabel.First(splitRate.button.first);
                    data.askLabel.Middle(splitRate.button.middle);
                    data.askLabel.Last(splitRate.button.last);
                });

                self.subscribeAndNotify(data.bid, function (rate) {
                    var splitRate = Format.tenthOfPipSplitRate(rate, data.selectedInstrument());

                    data.bidLabel.First(splitRate.button.first);
                    data.bidLabel.Middle(splitRate.button.middle);
                    data.bidLabel.Last(splitRate.button.last);
                });

                self.subscribeChanged(data.selectedInstrument, function (instrumentId, prevInstrumentId) {
                    if (prevInstrumentId && instrumentId !== prevInstrumentId) {
                        data.selectedDealAmount("");

                        if (!(stateObject.containsKey('skipReset') && stateObject.get('skipReset'))) {
                            data.orderDir(eOrderDir.None);
                        }
                    }
                });

                self.subscribeTo(data.baseSymbol, function (baseSymbolId) {
                    setInBetweenQuotes(baseSymbolId);
                });

                self.subscribeTo(data.selectedInstrument, function (instrumentId) {
                    var instrument = InstrumentsManager.GetInstrument(instrumentId),
                        roundMinMaxAmounts = function (amount) {
                            return [Math.ceil(amount[0]), Math.floor(amount[1])]
                        },
                        roundDefaultSize = function (defaultSize, minMaxAmounts) {
                            var up = Math.ceil(defaultSize);
                            return up < minMaxAmounts[1] ? up : Math.floor(defaultSize);
                        };

                    if (instrument) {
                        data.quotesAvailable(false);
                        data.dealMinMaxAmounts([]);

                        if (!(stateObject.containsKey('skipReset') && stateObject.get('skipReset'))) {
                            data.enableSLLimit(false);
                            data.enableTPLimit(false);
                        }

                        //order matters because of valueAllowUnset param from select in View  
                        InstrumentsManager.GetUpdatedInstrumentWithDealMinMaxAmounts(instrumentId).then(function (response) {
                            var dealMinMaxAmounts = instrument.isStock && response.dealMinMaxAmounts && response.dealMinMaxAmounts.length > 1 ?
                                roundMinMaxAmounts(response.dealMinMaxAmounts) : response.dealMinMaxAmounts,
                                defaultSize = instrument.isStock && dealMinMaxAmounts && dealMinMaxAmounts.length > 1 ?
                                    roundDefaultSize(response.defaultDealSize, dealMinMaxAmounts) : response.defaultDealSize;
                            data.dealMinMaxAmounts(dealMinMaxAmounts);
                            data.selectedDealAmount.extend({ amountValidation: dealMinMaxAmounts });
                            data.selectedDealAmount(data.selectedDealAmount() || defaultSize);
                        }).done();

                        data.amountSymbol(instrument.otherSymbol);
                        data.baseSymbolName(SymbolsManager.GetTranslatedSymbolById(instrument.baseSymbol));
                        data.otherSymbolName(SymbolsManager.GetTranslatedSymbolById(instrument.otherSymbol));
                        data.originalSymbolName(instrument.baseSymbolName);
                        data.baseSymbol(instrument.baseSymbol);
                        data.ccyPair(instrument.ccyPair);

                        data.isNonForex(instrument.instrumentTypeId !== eInstrumentType.Currencies);
                        data.isForex(instrument.isForex);
                        data.isShare(instrument.isShare);
                        data.isFuture(instrument.isFuture);
                        data.isStock(instrument.isStock);

                        registerInstruments(instrumentId);

                        var result = DealAmountLabel.Translate(instrument);
                        data.dealAmountLabel(result.label);

                        DealTypeManager.Init();

                        if (instrument.isFuture) {
                            DealTypeManager.ConsumeEvent('future');
                        } else if (instrument.isShare) {
                            DealTypeManager.ConsumeEvent('share');
                        } else {
                            DealTypeManager.ConsumeEvent();
                        }
                        data.pendingBonusType(portfolioStaticManager.Portfolio.pendingBonusType);
                        data.spreadDiscount(portfolioStaticManager.Portfolio.spreadDiscountVolumePercentage);

                        updateQuoteValues();

                        BuilderForInBetweenQuote.GetInBetweenQuote(Customer.prop.baseCcyId(), instrument.otherSymbol)
                            .then(function (response) {
                                data.quoteForAccountCcyToOtherCcy(response);
                            }).done();

                        data.hasInstrument(true);

                        updateTransactionSwitcherViewArgs(instrumentId);
                    } else {
                        data.hasInstrument(false);
                    }
                });
            }

            /**
             * Get Transaction Switcher view args, 
             * if the view is not visible then return false
             * @returns {Object|False} 
             */
            function getTransactionSwitcherViewArgs() {
                var transactionView = ViewsManager.GetActiveFormViewProperties(eViewTypes.vTransactionSwitcher);

                if (transactionView && transactionView.visible()) {
                    return transactionView.args || {};
                }

                return false;
            }

            function updateTransactionSwitcherViewArgs(instrumentId) {
                var args = getTransactionSwitcherViewArgs();

                if (!general.isNullOrUndefined(args) && args !== false) {
                    args.instrumentId = instrumentId;
                    ViewsManager.ChangeViewState(eViewTypes.vTransactionSwitcher, eViewState.Update, args);
                }
            }

            function setComputables() {
                data.isShowBuyBox = self.createComputed(function () {
                    return data.orderDir() === eOrderDir.Buy;
                });

                data.isShowSellBox = self.createComputed(function () {
                    return data.orderDir() === eOrderDir.Sell;
                });

                data.ViewModelReady = self.createComputed(function () {
                    if (data.ready()) {
                        return true;
                    }

                    var hasInstrument = data.hasInstrument(),
                        hasLimits = data.limitsReady();

                    var isReady = hasInstrument && hasLimits;
                    data.ready(isReady);

                    return isReady;
                });

                data.isUp = ko.pureComputed(function () {
                    return data.activeQuoteState() === eQuoteStates.Up;
                });

                data.isDown = ko.pureComputed(function () {
                    return data.activeQuoteState() === eQuoteStates.Down;
                });
            }

            function setInBetweenQuotes(baseSymbolId) {
                BuilderForInBetweenQuote.GetInBetweenQuote(Customer.prop.baseCcyId(), usdId).then(function (response) {
                    data.quoteForAccountCcyToUSDCcy(response);
                }).done();

                BuilderForInBetweenQuote.GetInBetweenQuote(baseSymbolId, usdId).then(function (response) {
                    data.quoteForBaseCcyToUSDCcy(response);
                }).done();
            }

            function setPropertiesFromViewArgs() {
                var args = getTransactionSwitcherViewArgs() || {},
                    toolTab = args.tab,
                    prevInstrumentId = data.selectedInstrument(),
                    instrumentId = args.instrumentId
                        || data.selectedInstrument()
                        || InstrumentsManager.GetUserDefaultInstrumentId();

                data.selectedInstrument(instrumentId);

                if (prevInstrumentId === instrumentId) {
                    data.selectedInstrument.notifySubscribers(instrumentId);
                }

                if (general.isInt(args.orderDir)) {
                    setOrderDir(args.orderDir);
                }

                if (args.selectedDealAmount) {
                    data.selectedDealAmount(args.selectedDealAmount);
                }

                data.initialToolTab((general.isDefinedType(toolTab) && general.isDefinedType(eNewDealTool[toolTab])) ? eNewDealTool[toolTab] : CustomerProfileManager.ProfileCustomer()[settings.profileKeyForDefaultTab] || eNewDealTool.Chart);
            }

            function setLimitTabsFromClientProfile() {
                var profileCustomer = CustomerProfileManager.ProfileCustomer();

                if (profileCustomer.defaultSlLimitTab) {
                    setLimitsModel.SetSlActiveTab(profileCustomer.defaultSlLimitTab);
                } else {
                    setLimitsModel.SetSlActiveTab(eSetLimitsTabs.Amount);
                }

                if (profileCustomer.defaultTpLimitTab) {
                    setLimitsModel.SetTpActiveTab(profileCustomer.defaultTpLimitTab);
                } else {
                    setLimitsModel.SetTpActiveTab(eSetLimitsTabs.Amount);
                }
            }

            function setOrderDir(orderDir) {
                if (orderDir != eOrderDir.Buy && orderDir != eOrderDir.Sell && orderDir != eOrderDir.None) {
                    orderDir = eOrderDir.None;
                }

                data.orderDir(orderDir);
            }

            function registerInstruments(instrumentId) {
                RegistrationManager.Update(eRegistrationListName.SingleQuote, instrumentId);
            }

            function registerToDispatcher() {
                QuotesManager.OnChange.Add(updateQuoteValues);
                portfolioStaticManager.OnChange.Add(updatePendingBonusType);
            }

            function unRegisterFromDispatcher() {
                QuotesManager.OnChange.Remove(updateQuoteValues);
                portfolioStaticManager.OnChange.Remove(updatePendingBonusType);
            }

            function updatePendingBonusType() {
                data.pendingBonusType(portfolioStaticManager.Portfolio.pendingBonusType);
            }

            function updateQuoteValues() {
                data.activeQuote = QuotesManager.Quotes.GetItem(data.selectedInstrument());

                if (data.activeQuote) {
                    data.isActiveQuote(data.activeQuote.isActive());
                    data.bid(data.activeQuote.bid);
                    data.ask(data.activeQuote.ask);
                    data.open(data.activeQuote.open);
                    data.close(data.activeQuote.close);
                    data.change(Format.toPercent(data.activeQuote.change));
                    data.formattedChange(Format.toSignedPercent(data.activeQuote.change, ''));
                    data.changePips(data.activeQuote.changePips);
                    data.highBid(data.activeQuote.highBid);
                    data.lowAsk(data.activeQuote.lowAsk);
                    data.tradeTime(data.activeQuote.tradeTime);
                    data.activeQuoteState(data.activeQuote.state);
                    data.quotesAvailable(true);
                }
            }

            function openDeal() {
                var deal = new TDeal();

                deal.dealType = DealTypeManager.GetStatus();
                deal.instrumentID = data.selectedInstrument();
                deal.amount = data.selectedDealAmount();
                deal.marketRate = data.orderDir() === eOrderDir.Sell ? data.activeQuote.bid : data.activeQuote.ask;
                deal.otherRateSeen = data.orderDir() === eOrderDir.Sell ? data.activeQuote.ask : data.activeQuote.bid;
                deal.orderDir = data.orderDir();
                deal.slRate = 0;
                deal.tpRate = 0;

                if (data.enableSLLimit()) {
                    if (setLimitsModel.Data.stopLossRate() === "") {
                        return enabledSltpValidationError();
                    }
                    deal.slRate = setLimitsModel.Data.stopLossRate();
                }

                if (data.enableTPLimit()) {
                    if (setLimitsModel.Data.takeProfitRate() === "") {
                        return enabledSltpValidationError();
                    }
                    deal.tpRate = setLimitsModel.Data.takeProfitRate();
                }

                data.hasInstrument(false);
                data.isProcessing(true);
                dalOrders.OpenDeal(deal, onOpenDeal);
            }

            function onOpenDeal(result, callerId, instrumentId, requestData) {
                data.hasInstrument(true);
                data.isProcessing(false);

                var instrument = InstrumentsManager.GetInstrument(instrumentId);
                var redirectToView = self.getSettings().onSuccessRedirectTo;

                if (instrument) {
                    if (baseOrder.ResultStatusSuccess(result)) {
                        InstrumentsManager.SetInstrumentDealAmount(instrumentId, requestData.amount);
                        ko.postbox.publish('deal-slip-success', { instrument: data.ccyPair() });
                        saveDefaultLimitTab();
                        resetDealValues();
                    }

                    // Check if redirect is required
                    if (redirectToView) {
                        baseOrder.OnActionReturn(result, callerId, instrument, { redirectToView: redirectToView, requestData: requestData });
                    } else {
                        baseOrder.OnActionReturn(result, callerId, instrument, { requestData: requestData });
                    }

                    baseOrder.RaiseErrorEvent(result, 'deal-slip-error-details', {});
                }
            }

            function ignoreSltpValidationError() {
                data.enableSLLimit(false);
                data.enableTPLimit(false);
                openDeal();
            }

            function enabledSltpValidationError() {
                AlertsManager.UpdateAlert(
                    AlertTypes.GeneralOkAlert,
                    Dictionary.GetItem('pleaseNoteTitle'),
                    Dictionary.GetItem('sltpValidationMsg', 'deals_NewDeal'),
                    null,
                    { okButtonCallback: ignoreSltpValidationError }
                );
                AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
            }

            function resetDealValues() {
                setLimitsModel.Data.stopLossRate(String.empty);
                setLimitsModel.Data.takeProfitRate(String.empty);

                data.enableSLLimit(false);
                data.enableTPLimit(false);
                setOrderDir(eOrderDir.None);
            }

            function saveDefaultLimitTab() {
                var profileCustomer = CustomerProfileManager.ProfileCustomer();
                profileCustomer.defaultSlLimitTab = setLimitsModel.Data.curSlActiveTab();
                profileCustomer.defaultTpLimitTab = setLimitsModel.Data.curTpActiveTab();
                CustomerProfileManager.ProfileCustomer(profileCustomer);
            }

            function dispose() {
                unRegisterFromDispatcher();
                data.selectedDealAmount.extend({ amountValidation: false });
                stateObject.unset('cachedOvernightFinancing');
                parent.dispose.call(self);  // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BaseOrder: baseOrder,
                SetLimitsModel: setLimitsModel,
                openDeal: openDeal,
                unRegisterFromDispatcher: unRegisterFromDispatcher,
                registerToDispatcher: registerToDispatcher,
                setLimitTabsFromClientProfile: setLimitTabsFromClientProfile
            };
        });

        return DealBaseViewModel;
    }
);
