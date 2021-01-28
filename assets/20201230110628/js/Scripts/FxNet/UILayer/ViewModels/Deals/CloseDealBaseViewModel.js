define(
    'viewmodels/Deals/CloseDealBaseViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        "helpers/ObservableHashTable",
        'helpers/KoComponentViewModel',
        'configuration/initconfiguration',
        'cachemanagers/dealsmanager',
        'devicemanagers/ViewModelsManager',
        'FxNet/LogicLayer/Deal/DealAmountLabel',
        'deviceviewmodels/BaseOrder',
        'viewmodels/QuotesSubscriber',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'devicemanagers/StatesManager',
        'initdatamanagers/Customer',
        'managers/CustomerProfileManager',
        'cachemanagers/QuotesManager',
        'StateObject!Transaction',
        'modules/BuilderForInBetweenQuote',
        'FxNet/LogicLayer/Deal/DealPermissions'
    ],
    function CloseDealBaseDef(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            observableHashTable = require("helpers/ObservableHashTable"),
            settings = require('configuration/initconfiguration').CloseDealSettingsConfiguration,
            dealsManager = require('cachemanagers/dealsmanager'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            dealAmountLabel = require('FxNet/LogicLayer/Deal/DealAmountLabel'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            statesManager = require('devicemanagers/StatesManager'),
            customer = require('initdatamanagers/Customer'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            quotesManager = require('cachemanagers/QuotesManager'),
            stateObject = require('StateObject!Transaction'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            dealPermissions = require('FxNet/LogicLayer/Deal/DealPermissions');

        var CloseDealBaseViewModel = general.extendClass(KoComponentViewModel, function CloseDealBaseClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                baseOrder = new BaseOrder(),
                quotesSubscriber = new QuotesSubscriber(),
                observableOpenDealsCollection = new observableHashTable(ko, general, 'orderID', { enabled: true, sortProperty: 'orderID', asc: false });

            function init(customSettings) {
                parent.init.call(self, customSettings); // inherited from KoComponentViewModel			
                baseOrder.Init({}, data);

                setProperties();
                setObservables();
                setComputables();
                setSubscribers();

                registerToDispatcher();
                setStaticInfo();
                populateObservableCollection();

                updateSelectedPositionBasedOnOrderID();
                setChartProperties();
                stateObject.update('currentRateDirectionSwitch', settings.currentRateDirectionSwitch);

                quotesSubscriber.Start();
            }

            function setProperties() {
                data.PageName = eDealPage.CloseDeal;
            }

            function setObservables() {
                data.orderID = ko.observable("");
                data.selectedInstrument = stateObject.set('selectedInstrument', ko.observable(''));
                data.ccyPairLong = ko.observable("");
                data.orderDir = stateObject.set('orderDir', ko.observable(eOrderDir.None));
                data.ccyPair = stateObject.set('ccyPair', ko.observable(''));
                data.customerSymbolName = stateObject.set('customerSymbolName', ko.observable(''));
                data.customerSymbolId = ko.observable(customer.prop.baseCcyId());
                data.selectedCcyId = ko.observable(customer.prop.selectedCcyId());
                data.changePips = ko.observable("");
                data.selectedDealAmount = stateObject.set('selectedDealAmount', ko.observable(''));
                data.quoteForOtherCcyToAccountCcy = stateObject.set('quoteForOtherCcyToAccountCcy', ko.observable(''));
                data.amountSymbol = stateObject.set('amountSymbol', ko.observable(''));
                data.baseSymbol = stateObject.set('baseSymbol', ko.observable(''));
                data.bidPips = ko.observable("");
                data.askPips = ko.observable("");
                data.isFuture = stateObject.set('isFuture', ko.observable(''));
                data.isShare = stateObject.set('isShare', ko.observable(''));
                data.change = stateObject.set('change', ko.observable(''));
                data.formattedChange = stateObject.set('formattedChange', ko.observable(''));
                data.tradeTime = stateObject.set('tradeTime', ko.observable(''));
                data.open = stateObject.set('open', ko.observable(''));
                data.close = stateObject.set('close', ko.observable(''));
                data.highBid = stateObject.set('highBid', ko.observable(''));
                data.lowAsk = stateObject.set('lowAsk', ko.observable(''));
                data.isProcessing = ko.observable(false);
                data.isCollapsed = ko.observable(false);
                data.SelectedPosition = ko.observable("");
                data.profileKeyForDefaultTab = ko.observable(settings.profileKeyForDefaultTab);
                data.initialToolTab = stateObject.set('initialToolTab', ko.observable(''));
                data.selectedCcyName = ko.observable(customer.prop.selectedCcyName());
                data.bid = stateObject.set('bid', ko.observable(''));
                data.ask = stateObject.set('ask', ko.observable(''));
                data.slRate = ko.observable("").extend({ dirty: false });
                data.tpRate = ko.observable("").extend({ dirty: false });
                data.quoteIsActive = stateObject.set('isActiveQuote', ko.observable(false));

                data.customerSymbolName(customer.prop.baseCcyName());
                data.initialToolTab(customerProfileManager.ProfileCustomer()[settings.profileKeyForDefaultTab] || eNewDealTool.Chart);

                data.chartTransactionEnabled = stateObject.set('chartTransactionEnabled', ko.observable(false));
            }

            function setComputables() {
                data.HasPosition = self.createComputed(function () {
                    var selectedPositionValue = ko.utils.unwrapObservable(data.SelectedPosition);

                    return !general.isEmptyValue(selectedPositionValue);
                });

                data.CloseDealReady = self.createComputed(function () {
                    var isGuiContextAvailable = !data.isProcessing(),
                        isMarketClosed = general.isDefinedType(statesManager.States.IsMarketClosed()) ? statesManager.States.IsMarketClosed() : false,
                        result = data.quoteIsActive() && !isMarketClosed && isGuiContextAvailable && data.HasPosition();

                    return result;
                });
            }

            function setSubscribers() {
                self.subscribeTo(data.SelectedPosition, function (position) {
                    if (position) {
                        data.selectedInstrument(position.instrumentID);
                        data.ccyPairLong(position.Instrument.ccyPairLong);
                        data.ccyPair(position.Instrument.ccyPair);
                        data.selectedDealAmount(position.dealAmount);
                        data.amountSymbol(position.Instrument.amountSymbol);
                        data.baseSymbol(position.Instrument.baseSymbolId);
                        data.isFuture(position.Instrument.isFuture);
                        data.isShare(position.Instrument.isShare);
                        data.orderDir(position.orderDir);
                        data.slRate(position.slRate);
                        data.tpRate(position.tpRate);

                        updateQuoteValues();
                    }
                });

                self.subscribeTo(data.selectedInstrument, function (instrumentId) {
                    var instrument = InstrumentsManager.GetInstrument(instrumentId);

                    if (!instrument) {
                        return;
                    }

                    BuilderForInBetweenQuote.GetInBetweenQuote(instrument.otherSymbol, customer.prop.baseCcyId())
                        .then(function (response) {
                            data.quoteForOtherCcyToAccountCcy(response);
                        }).done();
                });
            }

            function registerToDispatcher() {
                dealsManager.OnDealsChange.Add(onDealsChange);
                dealsManager.OnDealsPLChange.Add(onDealsPLChange);
                quotesManager.OnChange.Add(updateQuoteValues);
            }

            function updateQuoteValues() {
                var activeQuote = quotesManager.Quotes.GetItem(data.selectedInstrument());

                if (activeQuote) {
                    data.changePips(activeQuote.changePips);
                    data.tradeTime(activeQuote.tradeTime);
                    data.close(activeQuote.close);
                    data.open(activeQuote.open);
                    data.change(Format.toPercent(activeQuote.change));
                    data.formattedChange(Format.toSignedPercent(activeQuote.change, ''));
                    data.highBid(activeQuote.highBid);
                    data.lowAsk(activeQuote.lowAsk);
                    data.bid(activeQuote.bid);
                    data.ask(activeQuote.ask);
                    data.quoteIsActive(activeQuote.isActive());
                }
            }

            function onDealsChange(items) {
                if (!items) {
                    return;
                }

                removeItems(items.removedItems);
                updateItems(items.editedItems);
                addNewItems(items.newItems);
            }

            function getGrossPl(deal) {
                var discount = (dealPermissions.HasSpreadDiscount() ? -general.toNumeric(deal.spreadDiscount) : (dealPermissions.CustomerDealPermit() === eDealPermit.ZeroSpread ? general.toNumeric(deal.commission) : 0));
                return (general.toNumeric(deal.pl) + discount).toFixed(2);
            }

            function onDealsPLChange(changes) {
                var updatedItems = changes.dealsIDs;
                for (var i = 0, ii = updatedItems.length; i < ii; i++) {
                    var observable = observableOpenDealsCollection.Get(updatedItems[i]);
                    if (observable) {
                        var deal = dealsManager.Deals.GetItem(updatedItems[i]);

                        if (deal) {
                            var delta = {
                                prevSpotRate: observable.spotRate(),
                                spotRate: deal.spotRate,
                                spotRateLabel: setRateLabel(deal.spotRate, deal.instrumentID),
                                closingRateLabel: setRateLabel(deal.closingRate, deal.instrumentID),
                                fwPips: deal.fwPips,
                                closingRate: deal.closingRate,
                                pl: deal.pl,
                                lastUpdate: quotesSubscriber.GetQuote(deal.instrumentID).time(),
                                commission: deal.commission,
                                grosspl: getGrossPl(deal)
                            }

                            observableOpenDealsCollection.Update(updatedItems[i], delta);
                        }
                    }
                }
            }

            function removeItems(removedItems) {
                for (var i = 0; i < removedItems.length; i++) {
                    observableOpenDealsCollection.Remove(removedItems[i]);
                }
            }

            function updateItems(updatedItems) {
                for (var i = 0, ii = updatedItems.length; i < ii; i++) {
                    var deal = toObservableRow(dealsManager.Deals.GetItem(updatedItems[i]));
                    if (deal) {
                        observableOpenDealsCollection.Update(deal.orderID, deal);
                    }
                }
            }

            function addNewItems(newItems) {
                for (var i = 0, ii = newItems.length; i < ii; i++) {
                    var deal = toObservableRow(dealsManager.Deals.GetItem(newItems[i]));
                    if (deal) {
                        observableOpenDealsCollection.Add(deal);
                    }
                }
            }

            function changeSelectedPosition() {
                data.SelectedPosition(observableOpenDealsCollection.Values()[0]);
            }

            function toObservableRow(deal) {
                var instrument = InstrumentsManager.GetInstrument(deal.instrumentID);

                var row = {
                    positionNumber: deal.positionNumber,
                    instrumentID: deal.instrumentID || 0,
                    orderDir: deal.orderDir,
                    dealAmount: deal.orderDir == eOrderDir.Sell ? deal.sellAmount : deal.buyAmount,

                    orderID: deal.orderID,
                    prevSpotRate: ko.observable(deal.spotRate),
                    spotRate: ko.observable(deal.spotRate),
                    closingRate: ko.observable(deal.closingRate),
                    fwPips: ko.observable(deal.fwPips),
                    exeTime: ko.observable(deal.exeTime),
                    valueDate: ko.observable(getValueDate(deal)),
                    pl: ko.observable(deal.pl),

                    dealRate: deal.orderRate,
                    dealRateLabel: setRateLabel(deal.orderRate, deal.instrumentID),
                    spotRateLabel: ko.observable(setRateLabel(deal.spotRate, deal.instrumentID)),
                    closingRateLabel: ko.observable(setRateLabel(deal.closingRate, deal.instrumentID)),
                    slRate: deal.slRate,
                    tpRate: deal.tpRate,

                    slRateLabel: setRateLabel(deal.slRate, deal.instrumentID),
                    tpRateLabel: setRateLabel(deal.tpRate, deal.instrumentID),

                    Instrument: {
                        ccyPairLong: instrumentTranslationsManager.Long(deal.instrumentID),
                        ccyPair: instrument.ccyPair,
                        baseSymbol: instrumentTranslationsManager.GetTranslatedInstrumentById(deal.instrumentID).baseSymbolName,
                        dealAmountLbl: dealAmountLabel.Translate(instrument).label,
                        amountSymbol: instrument.otherSymbol,
                        isFuture: instrument.isFuture,
                        isShare: instrument.isShare,
                        isStock: instrument.isStock,
                        baseSymbolId: instrument.baseSymbol,
                        otherSymbolId: instrument.otherSymbol
                    }
                };

                row.commission = ko.observable(!general.isStringType(deal.commission) ? Number.toStr(deal.commission) : deal.commission);
                row.spreadDiscount = ko.observable(!general.isStringType(deal.spreadDiscount) ? Number.toStr(deal.spreadDiscount) : deal.spreadDiscount);
                row.grosspl = ko.observable(getGrossPl(deal));
                row.hasAdditionalPL = ko.observable(Number(deal.additionalPL) !== 0);
                row.adj = ko.computed(function () {
                    if (customer.prop.dealPermit == eDealPermit.Islamic) {
                        return false;
                    }

                    if (deal.valueDate.length === 0) {
                        return true;
                    }

                    return deal.positionNumber != deal.orderID;
                });

                // ------------------------------
                row.isProfit = ko.computed(function () {
                    return general.toNumeric(this.pl()) >= 0;
                }, row);
                row.isLoss = ko.computed(function () {
                    return general.toNumeric(this.pl()) < 0;
                }, row);
                row.isUp = ko.computed(function () {
                    return this.spotRate() > this.prevSpotRate();
                }, row);
                row.isDown = ko.computed(function () {
                    return this.spotRate() < this.prevSpotRate();
                }, row);

                return row;
            }

            function getValueDate(deal) {
                var instrument = InstrumentsManager.GetInstrument(deal.instrumentID);

                if (instrument.isShare) {
                    var corporateActionDate = instrument.getCorporateActionDate();
                    if (corporateActionDate)
                        if (deal.valueDate)
                            return {
                                isValueDateEmpty: false,
                                date: general.str2Date(deal.valueDate, 'd/m/y H:M') < general.str2Date(corporateActionDate, 'd/m/y H:M') ? deal.valueDate : corporateActionDate
                            };
                        else
                            return {
                                isValueDateEmpty: true,
                                date: corporateActionDate
                            };
                }

                if (deal.valueDate) {
                    return {
                        isValueDateEmpty: false,
                        date: deal.valueDate
                    };
                } else {
                    return {
                        isValueDateEmpty: true,
                        date: null
                    };
                }
            }

            function setRateLabel(rate, instrumentID) {
                var RateLabel = {
                    First: 0,
                    Middle: 0,
                    Last: 0
                };

                var splitSpotRate = Format.tenthOfPipSplitRate(rate, instrumentID);

                RateLabel.First = splitSpotRate.button.first;
                RateLabel.Middle = splitSpotRate.button.middle;
                RateLabel.Last = splitSpotRate.button.last;

                return RateLabel;
            }

            function setStaticInfo() {
                data.isProcessing(false);
                data.SelectedPosition("");   // reset to default value
            }

            function populateObservableCollection() {
                dealsManager.Deals.ForEach(function iterator(orderId, deal) {
                    var row = toObservableRow(deal);

                    observableOpenDealsCollection.Add(row);
                });
            }

            function updateSelectedPositionBasedOnOrderID() {
                var orderId = viewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vCloseDeal, 'orderId');
                if (orderId) {
                    data.SelectedPosition(observableOpenDealsCollection.Get(orderId));
                    data.orderID(orderId);
                }
            }

            function unRegisterFromDispatcher() {
                dealsManager.OnDealsPLChange.Remove(onDealsPLChange);
                dealsManager.OnDealsChange.Remove(onDealsChange);
                quotesManager.OnChange.Remove(updateQuoteValues);
            }

            function setChartProperties() {
                stateObject.update("stopLossRate", ko.observable(data.SelectedPosition().slRate));
                stateObject.update("takeProfitRate", ko.observable(data.SelectedPosition().tpRate));
                stateObject.update("dealRate", data.SelectedPosition().dealRate);
                stateObject.update('chart', settings.chart);
            }

            function unsetChartProperties() {
                stateObject.unset("stopLossRate");
                stateObject.unset("takeProfitRate");
                stateObject.unset("dealRate");
                stateObject.unset('chart');
                stateObject.unset('stateObjectIsReadyDefer');
            }

            function dispose() {
                unsetChartProperties();
                unRegisterFromDispatcher();
                observableOpenDealsCollection.Clear();
                quotesSubscriber.Stop();
                stateObject.unset('cachedOvernightFinancing');
                stateObject.unset('currentRateDirectionSwitch');
                parent.dispose.call(self);
            }

            return {
                init: init,
                Data: data,
                ChangeSelectedPosition: changeSelectedPosition,
                OpenDeals: observableOpenDealsCollection.Values,
                BaseOrder: baseOrder,
                DealPermissions: dealPermissions,
                dispose: dispose
            };
        });

        return CloseDealBaseViewModel;
    }
);