define(
    'viewmodels/Deals/DealMarginViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'FxNet/LogicLayer/Deal/DealMarginCalculator',
        'cachemanagers/InstrumentVolumeManager',
        'dataaccess/dalorder',
        'cachemanagers/ClientStateHolderManager',
        'initdatamanagers/Customer',
        'cachemanagers/PortfolioStaticManager',
        'LoadDictionaryContent!deals_RequireMargin'
    ],
    function DealMarginDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            dealMarginCalculator = require('FxNet/LogicLayer/Deal/DealMarginCalculator'),
            instrumentVolumeManager = require('cachemanagers/InstrumentVolumeManager'),
            dalOrders = require('dataaccess/dalorder'),
            csHolderManager = require('cachemanagers/ClientStateHolderManager'),
            customer = require('initdatamanagers/Customer'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager');

        var DealMarginViewModel = general.extendClass(KoComponentViewModel, function DealMarginClass(_newDealData, _content) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                newDealData = _newDealData || {};

            var init = function (settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setObservables();
                setComputables();
                setSubscribers();

                csHolderManager.OnChange.Add(onClientStateChange);
                onClientStateChange();
            };

            var getDealMarginPercentage = function () {
                dalOrders.GetDealMarginDetails(newDealData.selectedInstrument()).then(function (result) {
                    data.requiredMarginPercentage(result[0].Result.MarginPercentage);
                }).done();
            };

            var setObservables = function () {
                data.triggerDealMarginCalculation = ko.observable().extend({ notify: 'always' });
                data.requiredMarginPercentage = ko.observable("");
                data.displayDealMargin = ko.observable("");
                data.prevInstrumentId = ko.observable("");

                var symbolName = ko.utils.unwrapObservable(newDealData.customerSymbolName);

                data.currencySymbol = ko.observable(symbolName);
                data.customerSymbolId = ko.observable(customer.prop.baseCcyId());
                data.isDealMarginHigher = ko.observable(false);
                data.spreadWorth = ko.observable();
                data.availableMargin = ko.observable();
            };

            var setComputables = function () {
                data.dealMargin = self.createComputed(function () {
                    var otherSymbolAmount = 0,
                        baseSymbolAmount = 0,
                        dealRate,
                        instrumentId = newDealData.selectedInstrument(),
                        item = instrumentVolumeManager.InstrumentVolumes.GetItem(instrumentId),
                        orderDir = newDealData.orderDir(),
                        hasLimitLevel = newDealData.openLimit && newDealData.openLimit(),
                        hasPosition = false;

                    if (item) {
                        otherSymbolAmount = item.OtherSymbolAmount;
                        baseSymbolAmount = item.BaseSymbolAmount;
                        hasPosition = true;
                    }

                    if (!hasPosition && orderDir == eOrderDir.None) {
                        orderDir = eOrderDir.Buy;
                    }

                    if (hasLimitLevel) {
                        if (newDealData.openLimit() < newDealData.bid()) {
                            dealRate = Format.toMidRate(newDealData.bid(), newDealData.ask());
                        }
                        else {
                            dealRate = newDealData.openLimit();
                        }
                    } else {
                        dealRate = orderDir == eOrderDir.Sell ? newDealData.bid() : newDealData.ask();
                    }

                    var params = {
                        'orderDir': orderDir,
                        'dealAmount': general.toNumeric(newDealData.selectedDealAmount()),
                        'dealRate': general.toNumeric(dealRate),
                        'ask': general.toNumeric(newDealData.ask()),
                        'bid': general.toNumeric(newDealData.bid()),
                        'quoteForBaseCcyToAccountCcy': newDealData.quoteForBaseCcyToAccountCcy(),
                        'quoteForOtherCcyToAccountCcy': newDealData.quoteForOtherCcyToAccountCcy(),
                        'otherSymbol': newDealData.amountSymbol(),
                        'baseSymbol': newDealData.baseSymbol(),
                        'hasPosition': hasPosition,
                        'otherSymbolAmount': otherSymbolAmount,
                        'baseSymbolAmount': baseSymbolAmount,
                        'requiredMarginPercentage': hasPosition ? general.toNumeric(data.requiredMarginPercentage()) / 100 : general.toNumeric(data.requiredMarginPercentage())
                    };

                    data.triggerDealMarginCalculation();

                    var spreadWorth = dealMarginCalculator.SpreadWorthInAcountCCY(params);

                    data.spreadWorth(spreadWorth);

                    var dealMargin = dealMarginCalculator.DealMargin(params);
                    var displayDealMargin = Math.round((dealMargin + spreadWorth) * 100) / 100;

                    displayDealMargin = Math.abs(displayDealMargin);
                    data.displayDealMargin(displayDealMargin);

                    return dealMargin;

                }).extend({ empty: true });

                data.isDealMarginPositive = self.createComputed(function () {
                    var dealMargin = general.toNumeric(data.dealMargin()),
                        tradingBonus = newDealData && newDealData.isStock && newDealData.isStock() ?
                            general.toNumeric(portfolioManager.Portfolio.tradingBonus) : 0;

                    if (dealMargin > 0 || (dealMargin <= 0 && Math.abs(dealMargin) < data.spreadWorth())) {
                        if (data.displayDealMargin() >= (data.availableMargin() - tradingBonus)) {
                            data.isDealMarginHigher(true);
                        }
                        else {
                            data.isDealMarginHigher(false);
                        }

                        return true;
                    }
                    else {
                        data.isDealMarginHigher(false);

                        return false;
                    }
                });

                data.isCompleted = self.createComputed(function () {
                    return !data.dealMargin.isEmpty() && !isNaN(data.dealMargin());
                });

                data.selectedInstrumentId = self.createComputed(function () {
                    return newDealData.selectedInstrument();
                });

                data.isBaseEqualWithCustomerCcy = self.createComputed(function () {
                    return newDealData.baseSymbol() === customer.prop.baseCcyId();
                });
            };

            var setSubscribers = function () {
                self.subscribeAndNotify(data.selectedInstrumentId, function (instrumentId) {
                    var item = instrumentVolumeManager.InstrumentVolumes.GetItem(instrumentId);

                    if (item) {
                        data.requiredMarginPercentage(item.RequiredMarginPercentage);
                    } else if (data.prevInstrumentId() != instrumentId) {
                        getDealMarginPercentage();
                    }

                    data.prevInstrumentId(instrumentId);
                });

                self.addDisposable(
                    ko.postbox.subscribe('deal-slip-error-details', function (error) {
                        if (error.reason == 'OrderError12') {
                            data.triggerDealMarginCalculation(true);
                        }
                    })
                );
            };

            function onClientStateChange() {
                var csHolder = csHolderManager.CSHolder;
                var availableMargin = general.toNumeric(csHolder.availableMargin);

                if (customer.prop.baseCcyId() == customer.prop.selectedCcyId()) {
                    data.availableMargin(availableMargin);
                }
                else {
                    var availableMarginConverted = dealMarginCalculator.Convert(availableMargin, newDealData.quoteForUsdCcyToAccountCcy());

                    data.availableMargin(availableMarginConverted);
                }
            }

            var dispose = function () {
                csHolderManager.OnChange.Remove(onClientStateChange);
                parent.dispose.call(self);
            };

            return {
                init: init,
                content: _content,
                dispose: dispose
            };
        });

        var createViewModel = function (params) {
            var viewModel = new DealMarginViewModel(params.data, params.content);

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
