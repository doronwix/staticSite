/*global eAlertSignal */
define(
    'deviceviewmodels/Signals/SignalsAlertGridViewModel',
    [
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'FxNet/LogicLayer/Signals/SignalsGridsHandler',
        'configuration/initconfiguration',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        "helpers/observabledataset",
        'LoadDictionaryContent!controls_ctlsignalalert'
    ],
    function SignalsAlertGridDef(ko, general, KoComponentViewModel, signalsGridsHandler, InitConfiguration, instrumentManager, instrumentTranslationsManager, ObservableDataSet) {
        var SignalsAlertGridViewModel = general.extendClass(KoComponentViewModel, function SignalsAlertGridClass(componentParams) {
            var self = this,
                data = self.Data,
                parent = self.parent,
                datasetConfig = {
                    columns: [
                        {
                            name: 'ma20',
                            dataIndex: eAlertSignal.ma20
                        },
                        {
                            name: 'ma50',
                            dataIndex: eAlertSignal.ma50
                        },
                        {
                            name: 'ma20_50',
                            dataIndex: eAlertSignal.ma20_50
                        },
                        {
                            name: 'macd_sl',
                            dataIndex: eAlertSignal.macd_sl
                        },
                        {
                            name: 'macd_0',
                            dataIndex: eAlertSignal.macd_0
                        },
                        {
                            name: 'bollinger',
                            dataIndex: eAlertSignal.bollinger
                        },
                        {
                            name: 'rsi70',
                            dataIndex: eAlertSignal.rsi70
                        },
                        {
                            name: 'rsi30',
                            dataIndex: eAlertSignal.rsi30
                        },
                        {
                            name: 'volume',
                            dataIndex: eAlertSignal.volume
                        },
                        {
                            name: 'periodUnit',
                            dataIndex: eAlertSignal.periodUnit
                        },
                        {
                            name: 'periodValue',
                            dataIndex: eAlertSignal.periodValue
                        },
                        {
                            name: 'id',
                            dataIndex: eAlertSignal.id
                        },
                        {
                            name: 'symbol',
                            transform: function (value, rowIndex, columnIndex, rawRecord) {
                                var instrument = instrumentManager.GetInstrumentBySignalName(rawRecord[eAlertSignal.symbol]);
                                return instrument ? instrumentTranslationsManager.Long(instrument.id) : rawRecord[eAlertSignal.symbol];
                            }
                        },
                        {
                            name: 'dateTime',
                            dataIndex: eAlertSignal.dateTime
                        },
                        {
                            name: 'title',
                            dataIndex: eAlertSignal.title
                        }],
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
                        callerName: "SignalsAlertGrid/onLoadComplete",
                        errorSeverity: eErrorSeverity.medium,
                        onLoad: function () { }
                    },
                    Filter: {
                        type: eSignalType.Alert,
                        page: InitConfiguration.TradingSignalsConfig.defaultPage,
                        days: ko.observable(InitConfiguration.TradingSignalsConfig.durationFilterBySignalType.generic.nondetailed),
                        pageSize: InitConfiguration.TradingSignalsConfig.rowsPerGridPage.alerts,
                        symbol: componentParams.symbol || ''
                    }
                },
                observableDataset = new ObservableDataSet(ko, general, datasetConfig);

            observableDataset.Init();
            observableDataset.Load().done();

            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                data.rowsPerGridPage = InitConfiguration.TradingSignalsConfig.rowsPerGridPage.alerts;
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
                    }
                    else {
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
            var viewModel = new SignalsAlertGridViewModel(componentParams || {});
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
