/*global eCandlestickSignal */
define(
    'deviceviewmodels/Signals/SignalsCandleStickGridViewModel',
    [
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'FxNet/LogicLayer/Signals/SignalsGridsHandler',
        'configuration/initconfiguration',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        "helpers/observabledataset",
        'LoadDictionaryContent!controls_ctlsignalcandlestick'
    ],
    function SignalsCandlestickGridDef(ko, general, KoComponentViewModel, signalsGridsHandler, InitConfiguration, instrumentManager, instrumentTranslationsManager, ObservableDataSet) {
        var SignalsCandlestickGridViewModel = general.extendClass(KoComponentViewModel, function SignalsCandlestickGridClass(componentParams) {
            var self = this,
                data = self.Data,
                parent = self.parent,
                datasetConfig = {
                    columns: [
                        {
                            name: 'candlestick',
                            dataIndex: eCandlestickSignal.candlestick
                        },
                        {
                            name: 'last',
                            dataIndex: eCandlestickSignal.last
                        },
                        {
                            name: 'opinion',
                            dataIndex: eCandlestickSignal.opinion
                        },
                        {
                            name: 'invalidation',
                            dataIndex: eCandlestickSignal.invalidation
                        },
                        {
                            name: 'id',
                            dataIndex: eCandlestickSignal.id
                        },
                        {
                            name: 'symbol',
                            transform: function (value, rowIndex, columnIndex, rawRecord) {
                                var instrument = instrumentManager.GetInstrumentBySignalName(rawRecord[eCandlestickSignal.symbol]);
                                return instrument ? instrumentTranslationsManager.Long(instrument.id) : rawRecord[eCandlestickSignal.symbol];
                            }
                        },
                        {
                            name: 'dateTime',
                            dataIndex: eCandlestickSignal.dateTime
                        },
                        {
                            name: 'title',
                            dataIndex: eCandlestickSignal.title
                        }
                    ],
                    pageSizes: 5,
                    statusField: "status",
                    totalField: "totalRecords",
                    dataField: "result",
                    pagination: {
                        pagesPerPage: 5,
                        pageIndexField: "page",
                        pageSizeField: "pageSize"
                    },
                    DAL: {
                        reference: signalsGridsHandler.LoadData,
                        callerName: "SignalsCandlestickGrid/onLoadComplete",
                        errorSeverity: eErrorSeverity.medium,
                        onLoad: function () { }
                    },
                    Filter: {
                        type: eSignalType.CandleStick,
                        page: InitConfiguration.TradingSignalsConfig.defaultPage,
                        days: ko.observable(InitConfiguration.TradingSignalsConfig.durationFilterBySignalType.generic.nondetailed),
                        pageSize: InitConfiguration.TradingSignalsConfig.rowsPerGridPage.candleStick,
                        symbol: componentParams.symbol || ''
                    }
                },
                observableDataset = new ObservableDataSet(ko, general, datasetConfig);

            observableDataset.Init();
            observableDataset.Load().done();

            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                data.rowsPerGridPage = InitConfiguration.TradingSignalsConfig.rowsPerGridPage.candleStick;
                data.rowHeight = InitConfiguration.TradingSignalsConfig.rowsPerGridPage.rowHeight;

                setObservables();
                setSubscribers();
            }

            function setObservables() {
                data.days = datasetConfig.Filter.days;
            }

            function setSubscribers() {
                self.subscribeTo(componentParams.symbol, function (symbol) {
                    if (symbol === '') {
                        data.days(InitConfiguration.TradingSignalsConfig.durationFilterBySignalType.generic.nondetailed);
                    } else {
                        data.days(InitConfiguration.TradingSignalsConfig.durationFilterBySignalType.generic.detailed);
                        observableDataset.Paging.CurrentPage(InitConfiguration.TradingSignalsConfig.defaultPage);
                    }

                    observableDataset.Load().done();
                });
            }

            return {
                init: init,
                IsLoadingData: observableDataset.IsLoadingData,
                gridData: observableDataset.DataRows,
                pager: observableDataset.Paging,
                gridVisibilityFlag: ko.observable(false),
                gridVisibilityFlagChangeCallback: function () { this.gridVisibilityFlag(!this.gridVisibilityFlag()); }
            }
        });

        function createViewModel(componentParams) {
            var viewModel = new SignalsCandlestickGridViewModel(componentParams || {});
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
