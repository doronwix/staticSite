/* globals eChartInstanceType, eChartRateType */
define(
    'deviceviewmodels/ChartToolViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/historymanager',
        'viewmodels/dialogs/DialogViewModel',
        'managers/AdvinionChart/DealSlipChart',
        'StateObject!Transaction'
    ],
    function ChartToolDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            historyManager = require('managers/historymanager'),
            chart = require('managers/AdvinionChart/DealSlipChart'),
            stateObject = require('StateObject!Transaction');

        var ChartToolViewModel = general.extendClass(chart, function ChartToolClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data, // inherited from KoComponentViewModel
                dealData = stateObject.getAll(),
                disposables = [];

            //-------------------------------------------------------
            function init(settings) {
                var chartDeffer = stateObject.containsKey("stateObjectIsReadyDefer") ?
                    stateObject.get('stateObjectIsReadyDefer') :
                    stateObject.set('stateObjectIsReadyDefer', Q.defer());

                setObservables();

                chartDeffer.promise
                    .then(function () {
                        startComponent(settings);
                    })
                    .done();
            }

            function startComponent(settings) {
                dealData = stateObject.getAll();
                settings = general.extendType(settings, getAdditionalSettings());
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                setSubscribers();
            }

            //-------------------------------------------------------
            function setObservables() {
                data.isChartReady = ko.observable(false);
                data.isLoadingData = ko.observable(false);
                data.isFullScreen = stateObject.set('isFullScreen', ko.observable(false));
                data.tcChartSignals = stateObject.set('tc-chart-signals', ko.observable({
                    disabled: true,
                    active: false
                }));
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

                if (stateData.orderDir) {
                    self.subscribeTo(stateData.orderDir, function (newOrderDir) {
                        if (general.isFunctionType(stateData.switchToRate)) {
                            stateData.switchToRate();
                        }

                        if (ko.isObservable(stateData.stopLossRate) && stateData.stopLossRate()) {
                            stateData.stopLossRate("");
                        }

                        if (ko.isObservable(stateData.takeProfitRate) && stateData.takeProfitRate()) {
                            stateData.takeProfitRate("");
                        }

                        parent.ChangeSymbol(stateData.selectedInstrument(), getChartOrderDir(newOrderDir));
                    });
                }

                if (stateObject.containsKey('transactionType')) {
                    self.subscribeAndNotify(stateData.transactionType, subscribeToPriceLineChanges);
                } else {
                    subscribeToPriceLineChanges();
                }

                self.subscribeTo(data.isFullScreen, parent.ChangeMode);

                historyManager.OnStateChanged.Add(onHistoryStateChanged);
            }

            //-------------------------------------------------------
            function subscribeToPriceLineChanges() {
                var stateData = stateObject.getAll();

                for (var i = 0; i < disposables.length; i++) {
                    disposables[i].dispose();
                }

                disposables.length = 0;

                if (stateData.stopLossRate && ko.isObservable(stateData.stopLossRate)) {
                    disposables.push(self.subscribeAndNotify(stateData.stopLossRate, function (slRate) {
                        parent.DrawPriceLine(eChartPriceLineType.StopLoss, slRate, stateData.chart.keys.stopLoss);
                    }));
                }

                if (stateData.takeProfitRate && ko.isObservable(stateData.takeProfitRate)) {
                    disposables.push(self.subscribeAndNotify(stateData.takeProfitRate, function (tpRate) {
                        parent.DrawPriceLine(eChartPriceLineType.TakeProfit, tpRate, stateData.chart.keys.takeProfit);
                    }));
                }

                if (stateData.dealRate) {
                    parent.DrawPriceLine(eChartPriceLineType.OpenRate, stateData.dealRate, stateData.chart.keys.openRate);
                }

                if (stateData.openLimit && ko.isObservable(stateData.openLimit)) {
                    disposables.push(self.subscribeAndNotify(stateData.openLimit, function (openLimitRate) {
                        var lineType = stateData.chart.parentType === eChartParentType.NewPriceAlert ?
                            eChartPriceLineType.PriceAlertRate : eChartPriceLineType.LimitLevel,
                            rateLabel = stateData.chart.parentType === eChartParentType.NewPriceAlert ?
                                stateData.chart.keys.priceAlertRate : stateData.chart.keys.limitLevel;

                        parent.DrawPriceLine(lineType, openLimitRate, rateLabel);
                    }));
                }
            }

            //-------------------------------------------------------
            function onHistoryStateChanged(state) {
                if (state.type === eHistoryStateType.ExitFullscren ||
                    state.type === eHistoryStateType.CloseDialog) {
                    data.isFullScreen(false);
                }

                if (state.type === eHistoryStateType.EnterFullscren) {
                    data.isFullScreen(true);
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
                        break;

                    case eChartPriceLineType.TakeProfit:
                        if (stateData.takeProfitRate && ko.isObservable(stateData.takeProfitRate)) {
                            stateData.takeProfitRate(newRate);
                        }
                        break;
                }
            }

            //-------------------------------------------------------
            function getAdditionalSettings() {
                var orderDir = getChartOrderDir(dealData.orderDir());

                return {
                    additionalStartArgs: {
                        instrumentId: dealData.selectedInstrument(),
                        orderDir: orderDir,
                        currentRateKey: dealData.chart.keys.currentRate,
                        instanceType: eChartInstanceType.newDealSlip,
                        containerSuffix: String.empty,
                        isLoadingData: data.isLoadingData,
                        toggleDealSlipViewCallback: toggleDealSlipView,
                        isExpandedMode: data.isFullScreen(),
                        isFullScreen: data.isFullScreen(),
                        tracking: {
                            eventName: 'deal-slip-chart-interaction'
                        },
                        onPriceLineDragged: onPriceUpdated,
                        allowDragLine: dealData.chart.allowDragLine
                    }
                };
            }

            //-------------------------------------------------------
            function toggleDealSlipView() {
                data.isFullScreen(!data.isFullScreen());

                if (data.isFullScreen()) {
                    historyManager.PushPopupState(ePopupType.Dialog, eFullScreenControl.TransactionSwitcher);
                }
            }

            //-------------------------------------------------------
            function dispose() {
                data.isFullScreen(false);
                historyManager.OnStateChanged.Remove(onHistoryStateChanged);

                parent.dispose.call(self);          // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                NewDealData: dealData,
                ToggleDealSlipView: toggleDealSlipView
            };
        });

        function createViewModel(params) {
            var viewModel = new ChartToolViewModel();

            viewModel.init(params);

            return viewModel;
        }

        return {
            ChartToolViewModel: ChartToolViewModel,
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);