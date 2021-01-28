define(
    'viewmodels/Deals/EditClosingLimitBaseViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'helpers/KoComponentViewModel',
        'configuration/initconfiguration',
        'viewmodels/limits/ExpirationDateModel',
        'dataaccess/dalorder',
        'cachemanagers/dealsmanager',
        'devicemanagers/ViewModelsManager',
        'FxNet/LogicLayer/Deal/DealAmountLabel',
        'initdatamanagers/SymbolsManager',
        'cachemanagers/QuotesManager',
        'deviceviewmodels/BaseOrder',
        'viewmodels/limits/SetLimitsViewModel',
        'initdatamanagers/Customer',
        'managers/CustomerProfileManager',
        'initdatamanagers/InstrumentsManager',
        'cachemanagers/activelimitsmanager',
        'devicemanagers/StatesManager',
        'managers/instrumentTranslationsManager',
        'StateObject!Transaction',
        'modules/BuilderForInBetweenQuote',
        'handlers/general'
    ],
    function EditClosingLimitBaseDef(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            settings = require('configuration/initconfiguration').EditClosingLimitConfiguration,
            ExpirationDateModel = require('viewmodels/limits/ExpirationDateModel'),
            dalOrders = require('dataaccess/dalorder'),
            dealsManager = require('cachemanagers/dealsmanager'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            dealAmountLabel = require('FxNet/LogicLayer/Deal/DealAmountLabel'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            quotesManager = require('cachemanagers/QuotesManager'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            SetLimitsViewModel = require('viewmodels/limits/SetLimitsViewModel'),
            customer = require('initdatamanagers/Customer'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            activeLimitsManager = require('cachemanagers/activelimitsmanager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            stateObject = require('StateObject!Transaction'),
            StatesManager = require('devicemanagers/StatesManager'),
            general = require('handlers/general'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote');

        var EditClosingLimitBaseViewModel = general.extendClass(KoComponentViewModel, function EditClosingLimitBaseClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                activeQuote = null,
                setLimitsModel = new SetLimitsViewModel(),
                baseOrder = new BaseOrder(),
                expirationDateModel = new ExpirationDateModel(),
                LimitNotFoundErrorKey = 'OrderError7',
                PositionNotFoundErrorKey = 'OrderError8',
                orderId;

            function init(customSettings) {
                parent.init.call(self, customSettings); // inherited from KoComponentViewModel			
                baseOrder.Init({}, data);
                expirationDateModel.Init();

                setProperties();
                setObservables();
                setComputables();

                setLimitsModel.Init(data, self.getSettings().setlimitsConfiguration);

                registerToDispatcher();
                setChartProperties();
                stateObject.update('currentRateDirectionSwitch', settings.currentRateDirectionSwitch);
            }

            function setProperties() {
                data.PageName = eDealPage.EditClosingLimit;
            }

            function setObservables() {
                data.dealRate = '';
                data.dealRateLabel = {
                    First: ko.observable(''),
                    Middle: ko.observable(''),
                    Last: ko.observable('')
                };

                data.spotRateLabel = {
                    First: ko.observable(''),
                    Middle: ko.observable(''),
                    Last: ko.observable('')
                };

                data.closingRateLabel = {
                    First: ko.observable(''),
                    Middle: ko.observable(''),
                    Last: ko.observable('')
                };

                data.orderID = ko.observable("");
                data.exeTime = ko.observable("");
                data.positionNumber = ko.observable("");
                data.ccyPairLong = ko.observable("");
                data.selectedDealAmount = stateObject.set('selectedDealAmount', ko.observable(''));
                data.selectedDeal = ko.observable(null);
                data.dealAmountLabel = ko.observable("");
                data.isNonForex = ko.observable(true);
                data.baseSymbolName = ko.observable("");
                data.baseSymbolId = ko.observable("");
                data.otherSymbolId = ko.observable("");

                data.isActiveQuote = stateObject.set('isActiveQuote', ko.observable(null));
                data.quoteForOtherCcyToAccountCcy = stateObject.set('quoteForOtherCcyToAccountCcy', ko.observable(''));
                data.quoteForAccountCcyToOtherCcy = ko.observable("");

                data.quotesAvailable = ko.observable(false);
                data.isProcessing = ko.observable(false);
                data.limitsReady = ko.observable(false);

                data.customerSymbolId = ko.observable(customer.prop.baseCcyId());
                data.customerSymbolName = stateObject.set('customerSymbolName', ko.observable(''));
                data.selectedCcyName = ko.observable(customer.prop.selectedCcyName());
                data.selectedCcyId = ko.observable(customer.prop.selectedCcyId());
                data.limitCalc = ko.observable("").extend({ dirty: false });
                data.selectedInstrument = stateObject.set('selectedInstrument', ko.observable(''));
                data.amountSymbol = stateObject.set('amountSymbol', ko.observable(''));
                data.ccyPair = stateObject.set('ccyPair', ko.observable(''));
                data.orderDir = stateObject.set('orderDir', ko.observable(''));
                data.bid = stateObject.set('bid', ko.observable(''));
                data.ask = stateObject.set('ask', ko.observable(''));
                data.open = stateObject.set('open', ko.observable(''));
                data.close = stateObject.set('close', ko.observable(''));
                data.change = stateObject.set('change', ko.observable(''));
                data.formattedChange = stateObject.set('formattedChange', ko.observable(''));
                data.tradeTime = stateObject.set('tradeTime', ko.observable(''));
                data.changePips = ko.observable("");
                data.highBid = stateObject.set('highBid', ko.observable(''));
                data.lowAsk = stateObject.set('lowAsk', ko.observable(''));
                data.prevBid = ko.observable("");
                data.prevAsk = ko.observable("");

                data.bidPips = ko.observable("");
                data.bid10K = ko.observable("");
                data.bid100K = ko.observable("");
                data.askPips = ko.observable("");
                data.ask10K = ko.observable("");
                data.ask100K = ko.observable("");

                data.limitType = ko.observable(eLimitType.None);
                data.stopLossInCustomerCcy = ko.observable("");
                data.takeProfitInCustomerCcy = ko.observable("");
                data.displaySlPercentSymbol = ko.observable(false);
                data.displayTpPercentSymbol = ko.observable(false);
                data.displaySlAmountCcySymbol = ko.observable(false);
                data.displayTpAmountCcySymbol = ko.observable(false);

                data.profileKeyForDefaultTab = ko.observable(settings.profileKeyForDefaultTab);
                data.initialToolTab = stateObject.set('initialToolTab', ko.observable(''));

                data.isForex = ko.observable("");
                data.isShare = stateObject.set('isShare', ko.observable(''));
                data.isFuture = stateObject.set('isFuture', ko.observable(''));
                data.isStock = stateObject.set('isStock', ko.observable(''));

                data.isProfit = ko.observable("");
                data.profitLoss = ko.observable("");

                data.slRate = ko.observable("").extend({ dirty: false });
                data.tpRate = ko.observable("").extend({ dirty: false });
                data.originalLimits = {
                    slRate: ko.observable(""),
                    tpRate: ko.observable("")
                };
                data.setLimitsIsDirty = ko.observable(false);
                data.closingLimit = ko.observable(null);
                data.valueDate = ko.observable(null);
                data.hasAdditionalPL = ko.observable(false);
                data.additionalPL = ko.observable("");

                data.customerSymbolName(customer.prop.baseCcyName());
                data.initialToolTab(customerProfileManager.ProfileCustomer()[settings.profileKeyForDefaultTab] || eNewDealTool.Chart);
                data.chartTransactionEnabled = stateObject.set('chartTransactionEnabled', ko.observable(false));
            }

            function setComputables() {
                data.setLimitsIsDirty = self.createComputed(function () {
                    var limitsReady = data.limitsReady(),
                        limitType = data.limitType();

                    if (!limitsReady) {
                        return false;
                    }

                    var slOriginalRate = general.toNumeric(data.slRate.originalValue()),
                        stopLossRate = general.toNumeric(setLimitsModel.Data.stopLossRate() || "0"),
                        slChanged = slOriginalRate !== stopLossRate,

                        tpOriginalRate = general.toNumeric(data.tpRate.originalValue()),
                        takeProfitRate = general.toNumeric(setLimitsModel.Data.takeProfitRate() || "0"),
                        tpChanged = tpOriginalRate !== takeProfitRate;

                    if (limitType === eLimitType.StopLoss) {
                        return slChanged;
                    } else if (limitType === eLimitType.TakeProfit) {
                        return tpChanged;
                    }

                    return false;
                });

                data.UpdateButtonEnabled = self.createComputed(function () {
                    var isDirtyLimits = data.setLimitsIsDirty(),
                        viewModelReady = data.limitsReady() && data.quotesAvailable(),
                        isActiveQuote = data.isActiveQuote(),
                        isBrokerAllowLimitsOnNoRates = customer.prop.brokerAllowLimitsOnNoRates,
                        isProcessing = data.isProcessing(),
                        isExpirationDateDirty = expirationDateModel.Data.isExpirationDateDirty(),
                        hasClosingLimit = !general.isNullOrUndefined(data.closingLimit());

                    return ((isBrokerAllowLimitsOnNoRates || isActiveQuote) && viewModelReady && !isProcessing && (isDirtyLimits || (isExpirationDateDirty && hasClosingLimit)));
                });

                data.hasRateAdded = self.createComputed(function () {
                    var originalRate;

                    if (data.limitType() === eLimitType.StopLoss) {
                        originalRate = data.slRate.originalValue();
                    } else if (data.limitType() === eLimitType.TakeProfit) {
                        originalRate = data.tpRate.originalValue();
                    } else {
                        return false;
                    }

                    return general.isNumber(originalRate) && originalRate != 0;
                });

                data.adj = ko.computed(function () {
                    if (customer.prop.dealPermit === eDealPermit.Islamic) {
                        return false;
                    }

                    if (!data.valueDate()) {
                        return true;
                    }

                    return data.positionNumber() !== data.orderID();
                });
            }

            function updateViewModelData() {
                orderId = viewModelsManager.VManager.GetViewArgs(eViewTypes.vEditClosingLimit).orderId;

                var selectedDeal = dealsManager.Deals.GetItem(orderId),
                    instrument,
                    amountDeal;

                if (selectedDeal) {
                    data.orderID(orderId);

                    data.selectedDeal(selectedDeal);
                    data.limitType(viewModelsManager.VManager.GetViewArgs(eViewTypes.vEditClosingLimit).limitType);

                    data.exeTime(selectedDeal.exeTime);
                    data.positionNumber(selectedDeal.positionNumber);
                    data.orderDir(selectedDeal.orderDir);
                    data.selectedInstrument(selectedDeal.instrumentID);

                    amountDeal = selectedDeal.orderDir === eOrderDir.Sell ? selectedDeal.sellAmount : selectedDeal.buyAmount;
                    data.selectedDealAmount(amountDeal);
                    data.limitCalc(selectedDeal.orderRate);

                    data.slRate(selectedDeal.slRate);
                    data.slRate.markClean();
                    data.originalLimits.slRate(selectedDeal.slRate);

                    data.tpRate(selectedDeal.tpRate);
                    data.tpRate.markClean();
                    data.originalLimits.tpRate(selectedDeal.tpRate);
                    data.valueDate(selectedDeal.valueDate);
                    data.hasAdditionalPL(Number(selectedDeal.additionalPL) !== 0);
                    data.additionalPL(selectedDeal.additionalPL);

                    var dealRate = selectedDeal.orderRate;
                    var splitDealRate = Format.tenthOfPipSplitRate(dealRate, selectedDeal.instrumentID);

                    data.dealRate = dealRate;
                    data.dealRateLabel.First = splitDealRate.button.first;
                    data.dealRateLabel.Middle = splitDealRate.button.middle;
                    data.dealRateLabel.Last = splitDealRate.button.last;

                    setProfitLoss(selectedDeal.pl);
                    setSpotRateLabel(selectedDeal);
                    setClosingRateLabel(selectedDeal);

                    instrument = InstrumentsManager.GetInstrument(selectedDeal.instrumentID);

                    if (instrument) {
                        data.isForex(instrument.isForex);
                        data.isShare(instrument.isShare);
                        data.isFuture(instrument.isFuture);
                        data.isStock(instrument.isStock);
                        data.ccyPairLong(instrumentTranslationsManager.Long(instrument.id));
                        data.isNonForex(instrument.instrumentTypeId !== eInstrumentType.Currencies);
                        data.baseSymbolName(symbolsManager.GetTranslatedSymbolById(instrument.baseSymbol));
                        data.amountSymbol(instrument.otherSymbol);
                        data.ccyPair(instrument.ccyPair);
                        data.baseSymbolId(instrument.baseSymbol);
                        data.otherSymbolId(instrument.otherSymbol);
                        var result = dealAmountLabel.Translate(instrument);
                        data.dealAmountLabel(result.label);

                        populateInBetweenQuotes(instrument);
                        updateQuoteValues();

                        expirationDateModel.UpdateSelectedWithToday(selectedDeal.instrumentID);
                    }
                }
            }

            function populateInBetweenQuotes(instrument) {
                BuilderForInBetweenQuote.GetInBetweenQuote(instrument.otherSymbol, customer.prop.baseCcyId())
                    .then(function (response) {
                        data.quoteForOtherCcyToAccountCcy(response);
                    }).done();

                BuilderForInBetweenQuote.GetInBetweenQuote(customer.prop.baseCcyId(), instrument.otherSymbol)
                    .then(function (response) {
                        data.quoteForAccountCcyToOtherCcy(response);
                    }).done();
            }

            function setProfitLoss(profitLoss) {
                data.profitLoss(profitLoss);
                data.isProfit(general.toNumeric(profitLoss) >= 0);
            }

            function setSpotRateLabel(selectedDeal) {
                var splitSpotRate = Format.tenthOfPipSplitRate(selectedDeal.spotRate, selectedDeal.instrumentID);

                data.spotRateLabel.First(splitSpotRate.button.first);
                data.spotRateLabel.Middle(splitSpotRate.button.middle);
                data.spotRateLabel.Last(splitSpotRate.button.last);
            }

            function setClosingRateLabel(selectedDeal) {
                var splitClosingRate = Format.tenthOfPipSplitRate(selectedDeal.closingRate, selectedDeal.instrumentID);

                data.closingRateLabel.First(splitClosingRate.button.first);
                data.closingRateLabel.Middle(splitClosingRate.button.middle);
                data.closingRateLabel.Last(splitClosingRate.button.last);
            }

            function registerToDispatcher() {
                quotesManager.OnChange.Add(updateQuoteValues);
                dealsManager.OnDealsChange.Add(onDealsChange);
                dealsManager.OnDealsPLChange.Add(onDealsPLChange);
            }

            function unRegisterFromDispatcher() {
                quotesManager.OnChange.Remove(updateQuoteValues);
                dealsManager.OnDealsChange.Remove(onDealsChange);
                dealsManager.OnDealsPLChange.Remove(onDealsPLChange);
            }

            function updateQuoteValuesHandler() {
                activeQuote = quotesManager.Quotes.GetItem(data.selectedInstrument());

                if (activeQuote) {
                    data.isActiveQuote(activeQuote.isActive());

                    data.prevBid(data.bid());
                    data.prevAsk(data.ask());
                    data.bid(activeQuote.bid);
                    data.ask(activeQuote.ask);
                    data.open(activeQuote.open);
                    data.close(activeQuote.close);
                    data.change(Format.toPercent(activeQuote.change));
                    data.formattedChange(Format.toSignedPercent(activeQuote.change, ''));
                    data.changePips(activeQuote.changePips);
                    data.highBid(activeQuote.highBid);
                    data.lowAsk(activeQuote.lowAsk);
                    data.tradeTime(activeQuote.tradeTime);

                    data.quotesAvailable(true);
                }
            }

            var updateQuoteValues = debounce(updateQuoteValuesHandler);

            function onDealsChange(updatedItems) {
                var deal = dealsManager.Deals.GetItem(updatedItems.editedItems[0]);

                if (deal) {
                    data.slRate(deal.slRate);
                    data.tpRate(deal.tpRate);
                    data.slRate.markClean();
                    data.tpRate.markClean();
                }
            }

            function onDealsPLChange(changes) {
                var updatedItems = changes.dealsIDs;

                if (updatedItems.indexOf(orderId) >= 0) {
                    var selectedDeal = dealsManager.Deals.GetItem(orderId);
                    if (selectedDeal) {
                        setSpotRateLabel(selectedDeal);
                        setProfitLoss(selectedDeal.pl);
                        setClosingRateLabel(selectedDeal);
                    }
                }
            }

            function createAmountFieldsWrappers() {
                var slAmount = ko.observable(""),
                    tpAmount = ko.observable("");

                // Stop Loss
                self.subscribeTo(setLimitsModel.Data.ccySLAmount, function (value) {
                    var isAmountTabSelected = setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Amount;

                    if (!isAmountTabSelected) {
                        slAmount(value);
                    }
                });

                data.stopLossInCustomerCcy = self.createComputed({
                    read: function () {
                        var isAmountTabSelected = setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Amount,
                            rawValue,
                            amount = "";

                        if (!isAmountTabSelected) {
                            rawValue = setLimitsModel.Data.ccySLAmount();
                        } else {
                            rawValue = slAmount();
                        }

                        if (rawValue === "NA") {
                            return rawValue;
                        }

                        if (rawValue !== "" && !isNaN(rawValue)) {
                            amount = Number(rawValue);
                            amount = amount < 0 ? Math.floor(amount) : Math.ceil(amount);
                        }

                        return amount;
                    }
                });

                // apply validator
                data.stopLossInCustomerCcy.extend({
                    validation: {
                        validator: function () {
                            return setLimitsModel.Data.stopLossAmount.isValid();
                        }, params: setLimitsModel.Data.stopLossAmount
                    }
                });

                data.stopLossInCustomerCcy.extend({
                    notify: "always"
                });

                // Take Profit
                self.subscribeTo(setLimitsModel.Data.ccyTPAmount, function (value) {
                    var isAmountTabSelected = setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Amount;

                    if (!isAmountTabSelected) {
                        tpAmount(value);
                    }
                });

                data.takeProfitInCustomerCcy = self.createComputed({
                    read: function () {
                        var isAmountTabSelected = setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Amount,
                            rawValue,
                            amount = "";

                        if (!isAmountTabSelected) {
                            rawValue = setLimitsModel.Data.ccyTPAmount();
                        } else {
                            rawValue = tpAmount();
                        }

                        if (rawValue === "NA") {
                            return rawValue;
                        }

                        if (rawValue !== "" && !isNaN(rawValue)) {
                            amount = Number(rawValue);
                            amount = amount < 0 ? Math.floor(amount) : Math.ceil(amount);
                        }

                        return amount;
                    }
                });

                // apply validator
                data.takeProfitInCustomerCcy.extend({
                    validation: {
                        validator: function () {
                            return setLimitsModel.Data.takeProfitAmount.isValid();
                        }, params: setLimitsModel.Data.takeProfitAmount
                    }
                });

                data.takeProfitInCustomerCcy.extend({
                    notify: "always"
                });
            }

            function getLimitsValidationModel() {
                if (data.limitType() === eLimitType.StopLoss) {
                    return ko.validatedObservable({
                        stopLossAmount: setLimitsModel.Data.stopLossAmount,
                        ccySLAmount: setLimitsModel.Data.ccySLAmount,
                        stopLossRate: setLimitsModel.Data.stopLossRate,
                        stopLossPercent: setLimitsModel.Data.stopLossPercent
                    });
                } else if (data.limitType() === eLimitType.TakeProfit) {
                    return ko.validatedObservable({
                        takeProfitAmount: setLimitsModel.Data.takeProfitAmount,
                        ccyTPAmount: setLimitsModel.Data.ccyTPAmount,
                        takeProfitRate: setLimitsModel.Data.takeProfitRate,
                        takeProfitPercent: setLimitsModel.Data.takeProfitPercent
                    });
                } else {
                    return ko.validatedObservable({
                        stopLossAmount: setLimitsModel.Data.stopLossAmount,
                        takeProfitAmount: setLimitsModel.Data.takeProfitAmount,
                        ccySLAmount: setLimitsModel.Data.ccySLAmount,
                        ccyTPAmount: setLimitsModel.Data.ccyTPAmount,
                        stopLossRate: setLimitsModel.Data.stopLossRate,
                        takeProfitRate: setLimitsModel.Data.takeProfitRate,
                        stopLossPercent: setLimitsModel.Data.stopLossPercent,
                        takeProfitPercent: setLimitsModel.Data.takeProfitPercent
                    });
                }
            }

            function editLimitClick() {
                var selectedDeal = dealsManager.Deals.GetItem(orderId);

                if (StatesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    return false;
                }

                if (general.isNullOrUndefined(selectedDeal)) {
                    displayAlert(PositionNotFoundErrorKey);
                    return;
                }

                if (settings.showValidationTooltips) {
                    var limitsErrors = data.limitType() === eLimitType.StopLoss ?
                        setLimitsModel.ValidateSlRate() : setLimitsModel.ValidateTpRate();

                    if (limitsErrors.length) {
                        ko.postbox.publish('edit-deal-limit-show-validation-tooltips');
                        return false;
                    }
                }

                var limits = fillLimitsData();

                if (!general.isNullOrUndefined(limits) && limits.length > 0) {
                    data.isProcessing(true);
                    dalOrders.SaveLimits(limits, onActionReturn);
                }
            }

            var saveLimit = debounce(editLimitClick, 300, true);

            function deleteLimit() {
                if (!data.hasRateAdded()) {
                    return;
                }

                if (data.limitType() === eLimitType.StopLoss) {
                    setLimitsModel.Data.stopLossRate("");
                } else if (data.limitType() === eLimitType.TakeProfit) {
                    setLimitsModel.Data.takeProfitRate("");
                } else {
                    return;
                }

                saveLimit();
            }

            function fillNewLimitData(limitType, limitValue) {

                return {
                    instrumentID: data.selectedInstrument(),
                    positionNumber: data.positionNumber(),
                    amount: 0,
                    orderDir: data.orderDir() === eOrderDir.Sell ? eOrderDir.Buy : eOrderDir.Sell,
                    limitRate: limitValue,
                    ifDoneSLRate: 0,
                    ifDoneTPRate: 0,
                    expirationDate: getExpirationDate(),
                    type: limitType,
                    mode: eLimitMode.CloseDeal,
                    action: eOrderActionType.NewLimit
                };
            }

            function fillEditLimitData(limitId, limitValue) {
                var limit = activeLimitsManager.limits.GetItem(limitId);

                if (!general.isNullOrUndefined(limit)) {
                    limit.limitRate = limitValue;
                    limit.expirationDate = getExpirationDate();
                    limit.ifDoneSLRate = 0;
                    limit.ifDoneTPRate = 0;
                    limit.amount = 0;
                    limit.action = eOrderActionType.EditLimit;


                    return limit;
                }

                displayAlert(LimitNotFoundErrorKey);
            }

            function fillDeleteLimitData(limitId) {
                var limit = activeLimitsManager.limits.GetItem(limitId);

                if (!general.isNullOrUndefined(limit)) {
                    limit.action = eOrderActionType.DeleteLimit;

                    return limit;
                }

                displayAlert(LimitNotFoundErrorKey);
            }


            function fillLimitsData() {
                var returnLimits = [],
                    slLimit,
                    tpLimit,
                    selectedDeal = dealsManager.Deals.GetItem(orderId),
                    isExpirationDateDirty = expirationDateModel.Data.isExpirationDateDirty();

                if (general.isNullOrUndefined(selectedDeal)) {
                    displayAlert(PositionNotFoundErrorKey);
                    return;
                }

                if ((selectedDeal.slID == "" || selectedDeal.slID == 0) && (setLimitsModel.Data.stopLossRate.isDirty())) {
                    // New SL Limit
                    slLimit = fillNewLimitData(eLimitType.StopLoss, setLimitsModel.Data.stopLossRate());
                } else if ((setLimitsModel.Data.stopLossRate.isDirty() || (isExpirationDateDirty && data.limitType() === eLimitType.StopLoss)) && setLimitsModel.Data.stopLossRate() != "") {
                    // Edit SL Limit
                    slLimit = fillEditLimitData(selectedDeal.slID, setLimitsModel.Data.stopLossRate());
                } else if (selectedDeal.slID != "" && selectedDeal.slID != 0 && setLimitsModel.Data.stopLossRate.isDirty()) {
                    // Remove SL Limit
                    slLimit = fillDeleteLimitData(selectedDeal.slID);
                }

                if ((selectedDeal.tpID == "" || selectedDeal.tpID == 0) && (setLimitsModel.Data.takeProfitRate.isDirty())) {
                    // New TP Limit
                    tpLimit = fillNewLimitData(eLimitType.TakeProfit, setLimitsModel.Data.takeProfitRate());
                } else if ((setLimitsModel.Data.takeProfitRate.isDirty() || (isExpirationDateDirty && data.limitType() === eLimitType.TakeProfit)) && setLimitsModel.Data.takeProfitRate() != "") {
                    // Edit TP Limit
                    tpLimit = fillEditLimitData(selectedDeal.tpID, setLimitsModel.Data.takeProfitRate());
                } else if (selectedDeal.tpID != "" && selectedDeal.tpID != 0 && setLimitsModel.Data.takeProfitRate.isDirty()) {
                    // Remove TP Limit
                    tpLimit = fillDeleteLimitData(selectedDeal.tpID);
                }

                if (slLimit) {
                    returnLimits.push(slLimit);
                }

                if (tpLimit) {
                    returnLimits.push(tpLimit);
                }

                return returnLimits;
            }

            function displayAlert(key) {
                AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem(key), null, { redirectToView: eForms.OpenDeals });
                AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
            }

            function getExpirationDate() {
                var expirationDate = null;
                if (!expirationDateModel.Data.expirationDateSelector.IsGoodTillCancelChecked()) {
                    expirationDate = expirationDateModel.Data.expirationDate();
                    var selectedHoursValue = expirationDateModel.Data.selectedHoursValue();

                    if (general.isObjectType(selectedHoursValue) && general.isEmptyType(selectedHoursValue)) {
                        expirationDate += "  " + selectedHoursValue.value;
                    } else if (general.isStringType(selectedHoursValue) && !general.isEmptyType(selectedHoursValue)) {
                        expirationDate += "  " + selectedHoursValue;
                    } else {
                        expirationDate += "  00:00";
                    }
                }
                return expirationDate;
            }

            function onActionReturn(result, callerId, instrumentId, requestData) {
                var selectedDeal = dealsManager.Deals.GetItem(orderId);

                if (!selectedDeal) {
                    return;
                }

                var instrument = InstrumentsManager.GetInstrument(selectedDeal.instrumentID);
                if (!instrument) {
                    return;
                }

                data.isProcessing(false);
                var parms = {};

                if (settings.redirectToOpenDeals) {
                    parms.redirectToView = eForms.OpenDeals;
                }

                if ('valueDate' in selectedDeal) {
                    parms.valueDate = selectedDeal.valueDate;
                }

                baseOrder.OnActionReturn(result, callerId, instrument, general.extendType(parms, { requestData: requestData }));
            }

            function getDealRateValue() {
                orderId = viewModelsManager.VManager.GetViewArgs(eViewTypes.vEditClosingLimit).orderId;
                return dealsManager.Deals.GetItem(orderId).orderRate;
            }

            function setChartProperties() {
                getDealRateValue();
                stateObject.update("stopLossRate", setLimitsModel.Data.stopLossRate);
                stateObject.update("takeProfitRate", setLimitsModel.Data.takeProfitRate);
                stateObject.update("dealRate", getDealRateValue());
                stateObject.update('chart', settings.chart);
            }

            function dispose() {
                unRegisterFromDispatcher();
                stateObject.unset('cachedOvernightFinancing');
                stateObject.unset('currentRateDirectionSwitch');
                stateObject.unset('isActiveQuote');
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                TPField: setLimitsModel.TPField,
                SLField: setLimitsModel.SLField,
                SetLimitsInfo: setLimitsModel.Data,
                SetLimitsViewProperties: setLimitsModel.ViewProperties,
                ExpirationDate: expirationDateModel,
                SetLimitsModel: setLimitsModel,
                EditLimit: saveLimit,
                DeleteLimit: deleteLimit,
                getLimitsValidationModel: getLimitsValidationModel,
                createAmountFieldsWrappers: createAmountFieldsWrappers,
                updateViewModelData: updateViewModelData,
                FillLimitsData: fillLimitsData
            };
        });
        return EditClosingLimitBaseViewModel;
    }
);
