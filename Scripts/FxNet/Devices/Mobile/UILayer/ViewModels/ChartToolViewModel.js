/* globals eChartInstanceType, eChartRateType */
define(
    'deviceviewmodels/ChartToolViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/AdvinionChart/NewDealMobileChart',
        'StateObject!Transaction'
    ],
    function ChartDealToolDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            chart = require('managers/AdvinionChart/NewDealMobileChart'),
            stateObject = require('StateObject!Transaction');

        var ChartDealToolViewModel = general.extendClass(chart, function ChartDealToolClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                dealData = stateObject.getAll(),
                disposables = [],
                stateObjectSubscriptions = [];

            //-------------------------------------------------------
            function init(settings) {
                setObservables();

                settings = Object.assign(settings, getAdditionalSettings());
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                setSubscribers();
            }

            //-------------------------------------------------------
            function setObservables() {
                var chartTransactionEnabled = stateObject.get('chartTransactionEnabled');

                data.isChartReady = ko.observable(false);
                data.isLoadingData = ko.observable(false);
                data.chartTransactionEnabled = ko.observable(chartTransactionEnabled());
            }

            //-------------------------------------------------------
            function setSubscribers() {
                var subscriber = self.subscribeTo(data.isLoadingData, function setIsChartReady(isLoadingData) {
                    if (isLoadingData) {
                        return;
                    }

                    data.isChartReady(true);
                    subscriber.dispose();
                });

                var stateData = stateObject.getAll();

                self.subscribeTo(stateData.selectedInstrument, function (instrumentId) {
                    parent.ChangeSymbol(instrumentId, getChartOrderDir(stateData.orderDir()));
                });

                self.subscribeTo(stateData.chartTransactionEnabled, function (enabled) {
                    data.chartTransactionEnabled(enabled);
                });

                self.subscribeTo(stateData.orderDir, function (newOrderDir) {
                    var crtStateData = stateObject.getAll();
                    if (general.isFunctionType(crtStateData.switchToRate)) {
                        crtStateData.switchToRate();
                    }

                    switch (crtStateData.selectedTab) {
                        case eTransactionSwitcher.NewDeal:
                            if (ko.isObservable(crtStateData.stopLossRateDeal) && crtStateData.stopLossRateDeal()) {
                                crtStateData.stopLossRateDeal("");
                            }

                            if (ko.isObservable(crtStateData.takeProfitRateDeal) && crtStateData.takeProfitRateDeal()) {
                                crtStateData.takeProfitRateDeal("");
                            }
                            break;

                        case eTransactionSwitcher.NewLimit:
                            if (ko.isObservable(crtStateData.stopLossRateLimit) && crtStateData.stopLossRateLimit()) {
                                crtStateData.stopLossRateLimit("");
                            }

                            if (ko.isObservable(crtStateData.takeProfitRateLimit) && crtStateData.takeProfitRateLimit()) {
                                crtStateData.takeProfitRateLimit("");
                            }
                            break;
                    }

                    parent.ChangeSymbol(stateData.selectedInstrument(), getChartOrderDir(newOrderDir));
                });

                if (general.isDefinedType(dealData.selectedTab)) {
                    if (stateObject.set(eStateObjectTopics.ReadyForUse, false)) {
                        subscribeToPriceLineChanges();
                    }

                    stateObjectSubscriptions.push({
                        unsubscribe: stateObject.subscribe(eStateObjectTopics.ReadyForUse, function (isReady) {
                            if (isReady) {
                                subscribeToPriceLineChanges();
                            }
                        })
                    });
                }
                else {
                    subscribeToPriceLineChanges();
                }
            }

            //------------------------------------------
            function subscribeToPriceLineChanges() {
                for (var i = 0; i < disposables.length; i++) {
                    disposables[i].dispose();
                }
                disposables.length = 0;

                parent.DeletePriceLine(eChartPriceLineType.StopLoss);
                parent.DeletePriceLine(eChartPriceLineType.TakeProfit);
                parent.DeletePriceLine(eChartPriceLineType.LimitLevel);

                var stateData = stateObject.getAll();

                if (stateData.selectedTab) {
                    if (stateData.selectedTab === eTransactionSwitcher.NewDeal) {
                        if (stateData.stopLossRateDeal && ko.isObservable(stateData.stopLossRateDeal)) {
                            disposables.push(self.subscribeAndNotify(stateData.stopLossRateDeal, function (slRate) {
                                parent.DrawPriceLine(eChartPriceLineType.StopLoss, slRate, stateData.chart.keys.stopLoss);
                            }));
                        }

                        if (stateData.takeProfitRateDeal && ko.isObservable(stateData.takeProfitRateDeal)) {
                            disposables.push(self.subscribeAndNotify(stateData.takeProfitRateDeal, function (tpRate) {
                                parent.DrawPriceLine(eChartPriceLineType.TakeProfit, tpRate, stateData.chart.keys.takeProfit);
                            }));
                        }
                    }
                    else {
                        if (stateData.stopLossRateLimit && ko.isObservable(stateData.stopLossRateLimit)) {
                            disposables.push(self.subscribeAndNotify(stateData.stopLossRateLimit, function (slRate) {
                                parent.DrawPriceLine(eChartPriceLineType.StopLoss, slRate, stateData.chart.keys.stopLoss);
                            }));
                        }

                        if (stateData.takeProfitRateLimit && ko.isObservable(stateData.takeProfitRateLimit)) {
                            disposables.push(self.subscribeAndNotify(stateData.takeProfitRateLimit, function (tpRate) {
                                parent.DrawPriceLine(eChartPriceLineType.TakeProfit, tpRate, stateData.chart.keys.takeProfit);
                            }));
                        }

                        if (stateData.openLimit && ko.isObservable(stateData.openLimit)) {
                            disposables.push(self.subscribeAndNotify(stateData.openLimit, function (openLimitRate) {
                                parent.DrawPriceLine(eChartPriceLineType.LimitLevel, openLimitRate, stateData.chart.keys.limitLevel);
                            }));
                        }
                    }
                }
                else {
                    if (stateData.openLimit && ko.isObservable(stateData.openLimit)) {
                        self.subscribeAndNotify(stateData.openLimit, function (openLimitRate) {
                            parent.DrawPriceLine(eChartPriceLineType.LimitLevel, openLimitRate, stateData.chart.keys.limitLevel);
                        });
                    }
                }

                if (stateData.stopLossRate && ko.isObservable(stateData.stopLossRate)) {
                    self.subscribeAndNotify(stateData.stopLossRate, function (slRate) {
                        parent.DrawPriceLine(eChartPriceLineType.StopLoss, slRate, stateData.chart.keys.stopLoss);
                    });
                }
                else {
                    if (stateData.slRate) {
                        if (ko.isObservable(stateData.slRate)) {
                            self.subscribeAndNotify(stateData.slRate, function (slRate) {
                                parent.DrawPriceLine(eChartPriceLineType.StopLoss, slRate, stateData.chart.keys.stopLoss);
                            });
                        }
                        else {
                            parent.DrawPriceLine(eChartPriceLineType.StopLoss, stateData.slRate, stateData.chart.keys.stopLoss);
                        }
                    }
                }

                if (stateData.takeProfitRate && ko.isObservable(stateData.takeProfitRate)) {
                    self.subscribeAndNotify(stateData.takeProfitRate, function (tpRate) {
                        parent.DrawPriceLine(eChartPriceLineType.TakeProfit, tpRate, stateData.chart.keys.takeProfit);
                    });
                }
                else {
                    if (stateData.tpRate) {
                        if (ko.isObservable(stateData.tpRate)) {
                            self.subscribeAndNotify(stateData.tpRate, function (tpRate) {
                                parent.DrawPriceLine(eChartPriceLineType.TakeProfit, tpRate, stateData.chart.keys.takeProfit);
                            });
                        }
                        else {
                            parent.DrawPriceLine(eChartPriceLineType.TakeProfit, stateData.tpRate, stateData.chart.keys.takeProfit);
                        }
                    }
                }

                if (stateData.dealRate) {
                    parent.DrawPriceLine(eChartPriceLineType.OpenRate, stateData.dealRate, stateData.chart.keys.openRate);
                }
            }

            //-------------------------------------------------------
            function getChartOrderDir(orderDirValue) {
                var orderDir = orderDirValue === eOrderDir.None ? eOrderDir.Buy : orderDirValue;

                if (dealData.chart.direction === eChartDirection.Opposite) {
                    orderDir = orderDir === eOrderDir.Sell ? eOrderDir.Buy : eOrderDir.Sell;
                }

                return orderDir;
            }

            //-------------------------------------------------------
            function onPriceUpdated(priceLineType, newRate) {
                var stateData = stateObject.getAll();

                if (stateData.switchToRate && general.isFunctionType(stateData.switchToRate)) {
                    stateData.switchToRate();
                }

                switch (priceLineType) {
                    case eChartPriceLineType.LimitLevel:
                        if (stateData.openLimit && ko.isObservable(stateData.openLimit)) {
                            stateData.openLimit(newRate);
                        }
                        break;

                    case eChartPriceLineType.StopLoss:
                        if (stateData.stopLossRate && ko.isObservable(stateData.stopLossRate)) {
                            stateData.stopLossRate(newRate);
                        }
                        else if (stateData.stopLossRateDeal && ko.isObservable(stateData.stopLossRateDeal)) {
                            stateData.stopLossRateDeal(newRate);
                        }
                        else if (stateData.slRate && ko.isObservable(stateData.slRate)) {
                            stateData.slRate(newRate);
                        }
                        break;

                    case eChartPriceLineType.TakeProfit:
                        if (stateData.takeProfitRate && ko.isObservable(stateData.takeProfitRate)) {
                            stateData.takeProfitRate(newRate);
                        }
                        else if (stateData.takeProfitRateDeal && ko.isObservable(stateData.takeProfitRateDeal)) {
                            stateData.takeProfitRateDeal(newRate);
                        }
                        else if (stateData.tpRate && ko.isObservable(stateData.tpRate)) {
                            stateData.tpRate(newRate);
                        }
                        break;
                }
            }

            //-------------------------------------------------------
            function getAdditionalSettings() {
                var orderDir = getChartOrderDir(ko.utils.unwrapObservable(dealData.orderDir));

                return {
                    additionalStartArgs: {
                        instrumentId: dealData.selectedInstrument(),
                        orderDir: orderDir,
                        currentRateKey: dealData.chart.keys.currentRate,
                        instanceType: eChartInstanceType.newDealMobile,
                        containerSuffix: String.empty,
                        isLoadingData: data.isLoadingData,
                        onPriceLineDragged: onPriceUpdated,
                        allowDragLine: dealData.chart.allowDragLine
                    }
                }
            }

            //-------------------------------------------------------
            function setStateFullscreenStatus(isFullScreen) {
                var isChartFullScrn = stateObject.get('isChartFullScrn');

                if (isChartFullScrn) {
                    isChartFullScrn(isFullScreen);
                }
            }

            //-------------------------------------------------------
            function dispose() {
                while (stateObjectSubscriptions.length > 0) {
                    stateObjectSubscriptions.pop()
                        .unsubscribe();
                }

                parent.dispose.call(self);          // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                SetStateFullscreenStatus: setStateFullscreenStatus
            };
        });

        function createViewModel(params) {
            var viewModel = new ChartDealToolViewModel(params);
            viewModel.init({});

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
