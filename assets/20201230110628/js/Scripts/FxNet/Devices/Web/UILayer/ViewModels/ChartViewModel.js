/* globals eChartInstanceType, eChartRateType */
define(
    'deviceviewmodels/ChartViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/AdvinionChart/DealSlipChart',
        'StateObject!Transaction',
        'managers/ChartLayoutSettings',
        'configuration/initconfiguration'
    ],
    function ChartDef(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            dealSlipChart = require('managers/AdvinionChart/DealSlipChart'),
            stateObject = require('StateObject!Transaction'),
            chartLayoutSettings = require('managers/ChartLayoutSettings'),
            defaultChartConfiguration = require('configuration/initconfiguration').DefaultChartConfiguration;

        function setChartObservables() {
            var defered = Q.defer(),
                deferedState = stateObject.set('stateObjectIsReadyDefer', defered);

            if (deferedState !== defered) {
                defered.reject();
                defered = null;
            }

            stateObject.set('selectedInstrument', ko.observable());
            stateObject.set('orderDir', ko.observable());
            stateObject.set('openLimit', ko.observable("").extend({ dirty: false, rate: true }));
            stateObject.set('stopLossRate', ko.observable());
            stateObject.set('takeProfitRate', ko.observable());
            stateObject.set('switchToRate', general.emptyFn);
            stateObject.set('chart', defaultChartConfiguration);
        }

        var ChartViewModel = general.extendClass(koComponentViewModel, function ChartClass(params) {
            var self = this,
                chart = new dealSlipChart(),
                parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data, // inherited from KoComponentViewModel
                currentDealData = {},
                lastDealDataSnapShot = {},
                startSettings,
                disposables = [];

            //-------------------------------------------------------
            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                chartLayoutSettings.Init();

                setValues();
                setDefaultObservables();
                setChartObservables();

                startSettings = getAdditionalSettings();
                chart.init.call(self, startSettings);

                stateObject.update('skipReset', true);

                setSubscribers();
            }

            //-------------------------------------------------------
            function setValues() {
                data.chartId = params.index;
                data.isActive = params.isActive;
                data.isFullScreen = params.isFullScreen;
                data.isSingleMode = params.isSingleMode;
            }

            //-------------------------------------------------------
            function setDefaultObservables() {
                var chartSettings = getChartSetingsForCustomer();

                data.isChartReady = ko.observable(false);
                data.isLoadingData = ko.observable(false);
                data.currentInstrumentId = ko.observable(chartSettings.instrumentId);
            }

            //-------------------------------------------------------
            function onStateObjectReady() {
                currentDealData = stateObject.getAll();
                self.subscribeAndNotify(currentDealData.transactionType, subscribeToCurrentDeal);
            }

            //-------------------------------------------------------
            function onPromiseRejected() {
                //used on rejected promise on fail when don't want to do nothing
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

                self.subscribeTo(data.isActive, function switchActiveChartSubscriptions(isActive) {
                    if (isActive) {
                        var stateObjectDealData = stateObject.getAll();
                        stateObjectDealData.selectedInstrument(data.currentInstrumentId());
                    }

                    subscribeToCurrentDeal();
                });

                self.subscribeTo(data.isFullScreen, setMode);
                self.subscribeTo(data.isSingleMode, setMode);

                self.subscribeTo(data.currentInstrumentId, function setCurrentInstrument(instrumentId) {
                    var stateObjectDealData = stateObject.getAll();
                    stateObjectDealData.selectedInstrument(instrumentId);
                    stateObjectDealData.orderDir(eOrderDir.None);
                    stateObjectDealData.stopLossRate('');
                    stateObjectDealData.takeProfitRate('');

                    chart.ChangeSymbol(data.currentInstrumentId(), eOrderDir.None);
                });

                currentDealData.stateObjectIsReadyDefer
                    .promise
                    .then(onStateObjectReady)
                    .fail(onPromiseRejected)
                    .done();
            }

            //-------------------------------------------------------
            function setMode() {
                chart.ChangeMode(data.isFullScreen() || data.isSingleMode());
            }

            //-------------------------------------------------------
            function subscribeToCurrentDeal() {
                for (var i = 0; i < disposables.length; i++) {
                    disposables[i].dispose();
                }

                disposables.length = 0;

                clearChartLines();

                if (!data.isActive()) {
                    return;
                }

                currentDealData = stateObject.getAll();
                currentDealData.selectedInstrument(data.currentInstrumentId());

                disposables.push(currentDealData.selectedInstrument.subscribe(data.currentInstrumentId));

                if (currentDealData.orderDir && ko.isObservable(currentDealData.orderDir)) {
                    currentDealData.orderDir(general.isDefinedType(lastDealDataSnapShot.orderDir) ? lastDealDataSnapShot.orderDir : eOrderDir.None);

                    disposables.push(currentDealData.orderDir.subscribe(function (newOrderDir) {
                        if (general.isFunctionType(currentDealData.switchToRate)) {
                            currentDealData.switchToRate();
                        }

                        if (ko.isObservable(currentDealData.stopLossRate) && currentDealData.stopLossRate()) {
                            currentDealData.stopLossRate("");
                        }

                        if (ko.isObservable(currentDealData.takeProfitRate) && currentDealData.takeProfitRate()) {
                            currentDealData.takeProfitRate("");
                        }

                        lastDealDataSnapShot.orderDir = newOrderDir;
                        chart.ChangeSymbol(data.currentInstrumentId(), newOrderDir);
                    }));
                }

                if (currentDealData.openLimit && ko.isObservable(currentDealData.openLimit)) {
                    if (lastDealDataSnapShot.openLimit != currentDealData.openLimit()) {
                        currentDealData.openLimit(lastDealDataSnapShot.openLimit || '');
                    }

                    disposables.push(currentDealData.openLimit.subscribe(function (openLimitRate) {
                        lastDealDataSnapShot.openLimit = openLimitRate;
                        chart.DrawPriceLine(eChartPriceLineType.LimitLevel, openLimitRate, currentDealData.chart.keys.limitLevel);
                    }));
                }

                if (currentDealData.stopLossRate && ko.isObservable(currentDealData.stopLossRate)) {
                    currentDealData.stopLossRate(lastDealDataSnapShot.stopLossRate || '');

                    disposables.push(currentDealData.stopLossRate.subscribe(function (stopLossRate) {
                        lastDealDataSnapShot.stopLossRate = stopLossRate;
                        chart.DrawPriceLine(eChartPriceLineType.StopLoss, stopLossRate, currentDealData.chart.keys.stopLoss);
                    }));
                }

                if (currentDealData.takeProfitRate && ko.isObservable(currentDealData.takeProfitRate)) {
                    currentDealData.takeProfitRate(lastDealDataSnapShot.takeProfitRate || '');

                    disposables.push(currentDealData.takeProfitRate.subscribe(function (takeProfitRate) {
                        lastDealDataSnapShot.takeProfitRate = takeProfitRate;
                        chart.DrawPriceLine(eChartPriceLineType.TakeProfit, takeProfitRate, currentDealData.chart.keys.takeProfit);
                    }));
                }
            }

            //-------------------------------------------------------
            function clearChartLines() {
                lastDealDataSnapShot = {};
                chart.DeletePriceLine(eChartPriceLineType.LimitLevel);
                chart.DeletePriceLine(eChartPriceLineType.StopLoss);
                chart.DeletePriceLine(eChartPriceLineType.TakeProfit);
            }

            //-------------------------------------------------------
            function getChartSetingsForCustomer() {
                return chartLayoutSettings.GetSettings(data.chartId);
            }

            //-------------------------------------------------------
            function getOrderDir() {
                currentDealData = stateObject.getAll();

                var orderDirValue = ko.utils.unwrapObservable(currentDealData.orderDir),
                    orderDir = orderDirValue === eOrderDir.None ? eOrderDir.Buy : orderDirValue;

                if (currentDealData.chart.direction === eChartDirection.Opposite) {
                    orderDir = eOrderDir.Buy - orderDir;
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
                var instrumentId = getChartSetingsForCustomer().instrumentId;

                currentDealData = stateObject.getAll();

                return {
                    additionalStartArgs: {
                        instrumentId: instrumentId,
                        orderDir: getOrderDir(),
                        currentRateKey: currentDealData.chart.keys.currentRate,
                        instanceType: eChartInstanceType.newDealSlip,
                        containerSuffix: data.chartId,
                        isLoadingData: data.isLoadingData,
                        toggleDealSlipViewCallback: general.emptyFn,
                        isExpandedMode: data.isSingleMode(),
                        isFullScreen: data.isFullScreen(),
                        tracking: {
                            eventName: 'chart-interaction'
                        },
                        onPriceLineDragged: onPriceUpdated,
                        allowDragLine: currentDealData.chart.allowDragLine
                    }
                };
            }

            //-------------------------------------------------------
            function dispose() {
                for (var i = 0; i < disposables.length; i++) {
                    disposables[i].dispose();
                }

                disposables.length = 0;

                chart.dispose();
                parent.dispose.call(self);          // inherited from KoComponentViewModel

                if (stateObject.containsKey('skipReset')) {
                    stateObject.unset('skipReset');
                }
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                ChartData: chart.Data
            };
        });

        function createViewModel(params) {
            var viewModel = new ChartViewModel(params);
            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
