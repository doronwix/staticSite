define(
    'viewmodels/MarginStatusViewModel',
    [
        'require',
        'knockout',
        'helpers/ObservableHashTable',
        'handlers/general',
        'cachemanagers/ClientStateHolderManager',
        'cachemanagers/InstrumentVolumeManager',
        'cachemanagers/PortfolioStaticManager'
    ],
    function MarginStatusViewModelDef(require) {
        var ko = require('knockout'),
            observableHashTable = require('helpers/ObservableHashTable'),
            general = require('handlers/general'),
            csHolderManager = require('cachemanagers/ClientStateHolderManager'),
            instrumentVolumeManager = require('cachemanagers/InstrumentVolumeManager'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager');

        var MarginStatusViewModel = function MarginStatusViewModelClass() {
            var instrumentVolumeCollection = new observableHashTable(ko, general, "InstrumentID"),
                walletInfo = {},
                totals = {};

            function init() {
                setObservableObject();
                registerObservableStartUpEvent();
            }

            function setObservableObject() {
                // WalletInfo
                walletInfo.CustomerCcy = $customer.prop.defaultCcy();

                walletInfo.Equity = ko.observable(0);
                walletInfo.TotalEquity = ko.observable(0);

                walletInfo.Securities = ko.observable(0);
                walletInfo.TradingBonus = ko.observable(0);

                // Totals
                var totalUsedMargin = ko.observable(0),
                    totalMarginUtilization = ko.observable(0);

                totals.TotalUsedMargin = ko.computed({
                    read: function () {
                        var value = 0;

                        ko.utils.arrayForEach(instrumentVolumeCollection.Values(), function processItem(item) {
                            var tmp = general.toNumeric(item.UsedMargin());

                            if (tmp) {
                                value += tmp;
                            }
                        });

                        return value;
                    },
                    write: function (value) {
                        totalUsedMargin(value);
                    }
                });

                totals.TotalMarginUtilization = ko.computed({
                    read: function () {
                        var value = 0;

                        ko.utils.arrayForEach(instrumentVolumeCollection.Values(), function processItem(item) {
                            var tmp = general.toNumeric(item.MarginUtilizationPercentage());
                            if (tmp) {
                                value += tmp;
                            }
                        });

                        return value;
                    },
                    write: function (value) {
                        totalMarginUtilization(value);
                    }
                });
            }

            function setInitialData() {
                instrumentVolumeManager.InstrumentVolumes.ForEach(function processInstrumentVolume(key, element) {
                    instrumentVolumeCollection.Add(toObservable(element));
                });

                totals.TotalUsedMargin(0);
                totals.TotalMarginUtilization(0);

                onClientStateChange();
                onPortfolioStateChange();
            }

            function registerToDispatcher() {
                instrumentVolumeManager.OnChange.Add(onInstrumentVolumeChange);
                csHolderManager.OnChange.Add(onClientStateChange);
                portfolioManager.OnChange.Add(onPortfolioStateChange);
            }

            function unRegisterFromDispatcher() {
                instrumentVolumeManager.OnChange.Remove(onInstrumentVolumeChange);
                csHolderManager.OnChange.Remove(onClientStateChange);
                portfolioManager.OnChange.Remove(onPortfolioStateChange);
            }

            function start() {
                setInitialData();

                registerToDispatcher();
            }

            function stop() {
                unRegisterFromDispatcher();
                instrumentVolumeCollection.Clear();
            }

            function toObservable(item) {
                var obj = {};

                for (var prop in item) {
                    obj[prop] = ko.observable(item[prop]);
                }

                return obj;
            }

            function onInstrumentVolumeChange(items) {
                for (var i = 0; i < items.removedItems.length; i++) {
                    var rid = items.removedItems[i];

                    instrumentVolumeCollection.Remove(rid);
                }

                for (var j = 0, jj = items.editedItems.length; j < jj; j++) {
                    var eid = items.editedItems[j];

                    instrumentVolumeCollection.Update(eid, instrumentVolumeManager.InstrumentVolumes.GetItem(eid));
                }

                for (var k = 0, kk = items.newItems.length; k < kk; k++) {
                    var nid = items.newItems[k];
                    var deal = instrumentVolumeManager.InstrumentVolumes.GetItem(nid);

                    if (deal) {
                        instrumentVolumeCollection.Add(toObservable(deal));
                    }
                }
            }

            function onClientStateChange() {
                walletInfo.Equity(general.toNumeric(csHolderManager.CSHolder.equity));
                walletInfo.TotalEquity(general.toNumeric(csHolderManager.CSHolder.totalEquity));
            }

            function onPortfolioStateChange() {
                walletInfo.Securities(general.toNumeric(portfolioManager.Portfolio.securities));
                walletInfo.TradingBonus(general.toNumeric(portfolioManager.Portfolio.tradingBonus));
            }

            function registerObservableStartUpEvent() {
                $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vMarginStatus).state.subscribe(function (state) {
                    switch (state) {
                        case eViewState.Start:
                            start();
                            break;

                        case eViewState.Stop:
                            stop();
                            break;
                    }
                });
            }

            return {
                Init: init,
                Collection: instrumentVolumeCollection.Values,
                WalletInfo: walletInfo,
                Totals: totals
            };
        };

        return new MarginStatusViewModel();
    }
);