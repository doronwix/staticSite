/*global eTechAnalysisSignal */
define(
    'deviceviewmodels/Signals/SignalsTechnicalAnalisisGridViewModel',
    [
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'FxNet/LogicLayer/Signals/SignalsGridsHandler',
        'configuration/initconfiguration',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        "helpers/observabledataset",
        'LoadDictionaryContent!controls_ctlsignaltechanalysis'
    ],
    function SignalsTechnicalAnalysisGridDef(ko, general, KoComponentViewModel, signalsGridsHandler, InitConfiguration, instrumentManager, instrumentTranslationsManager, ObservableDataSet) {
        var SignalsTechnicalAnalysisGridViewModel = general.extendClass(KoComponentViewModel, function SignalsTechnicalAnalysisGridClass(componentParams) {
            var self = this,
                data = self.Data,
                parent = self.parent,
                datasetConfig = {
                    columns: [
                        {
                            name: 'id',
                            dataIndex: eTechAnalysisSignal.id
                        },
                        {
                            name: 'week',
                            dataIndex: eTechAnalysisSignal.week
                        },
                        {
                            name: 'weekDelta',
                            dataIndex: eTechAnalysisSignal.weekDelta
                        },
                        {
                            name: 'month',
                            dataIndex: eTechAnalysisSignal.month
                        },
                        {
                            name: 'monthDelta',
                            dataIndex: eTechAnalysisSignal.monthDelta
                        },
                        {
                            name: '',
                            dataIndex: eTechAnalysisSignal.id
                        },
                        {
                            name: 'symbol',
                            dataIndex: eTechAnalysisSignal.symbol
                        },
                        {
                            name: 'instrument',
                            transform: function (value, rowIndex, columnIndex, rawRecord) {
                                var instrument = instrumentManager.GetInstrumentBySignalName(rawRecord[eTechAnalysisSignal.symbol]);
                                return instrument ? instrumentTranslationsManager.Long(instrument.id) : rawRecord[eTechAnalysisSignal.symbol];
                            }
                        },
                        {
                            name: 'dateTime',
                            dataIndex: eTechAnalysisSignal.dateTime
                        },
                        {
                            name: 'title',
                            dataIndex: eTechAnalysisSignal.title
                        }
                    ],
                    pageSizes: 10,
                    statusField: "status",
                    totalField: "totalRecords",
                    dataField: "result",
                    pagination: {
                        pagesPerPage: 10,
                        pageIndexField: "page",
                        pageSizeField: "pageSize"
                    },
                    DAL: {
                        reference: signalsGridsHandler.LoadData,
                        callerName: "SignalsTechnicalAnalisisGrid/onLoadComplete",
                        errorSeverity: eErrorSeverity.medium,
                        onLoad: function () { }
                    },
                    Filter: {
                        type: eSignalType.TechnicalAnalysis,
                        page: InitConfiguration.TradingSignalsConfig.defaultPage,
                        days: ko.observable(InitConfiguration.TradingSignalsConfig.durationFilterBySignalType.technicalAnalisys.nondetailed),
                        pageSize: InitConfiguration.TradingSignalsConfig.rowsPerGridPage.technicalAnalisys,
                        symbol: componentParams.symbol
                    }
                },
                observableDataset = new ObservableDataSet(ko, general, datasetConfig);

            observableDataset.Init();
            observableDataset.Load().done();

            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                data.rowsPerGridPage = InitConfiguration.TradingSignalsConfig.rowsPerGridPage.technicalAnalisys;
                data.rowHeight = InitConfiguration.TradingSignalsConfig.rowsPerGridPage.rowHeight;
                setObservables();
                setSubscribers();
            }

            function setObservables() {
                data.days = datasetConfig.Filter.days;
                data.signalId = ko.observable();
                data.symbol = ko.observable(componentParams.symbol() || '');
                data.isFullSignal = ko.observable(!general.isEmpty(data.symbol()));
            }

            function setSubscribers() {
                self.subscribeTo(data.signalId, function (value) {
                    general.isEmptyValue(value)
                        ? data.isFullSignal(false)
                        : data.isFullSignal(true);
                });

                self.subscribeTo(componentParams.symbol, function (symbol) {
                    if (symbol === '') {
                        data.days(InitConfiguration.TradingSignalsConfig.durationFilterBySignalType.technicalAnalisys.nondetailed);
                    } else {
                        data.days(InitConfiguration.TradingSignalsConfig.durationFilterBySignalType.technicalAnalisys.detailed);
                        observableDataset.Paging.CurrentPage(InitConfiguration.TradingSignalsConfig.defaultPage);
                    }

                    observableDataset.Load().done();
                });
            }

            function selectSignal(signalId, symbol) {
                data.signalId(signalId);
                data.symbol(symbol);
                componentParams.symbol(symbol);
            }

            return {
                init: init,
                gridData: observableDataset.DataRows,
                pager: observableDataset.Paging,
                SelectSignal: selectSignal,
                IsLoadingData: observableDataset.IsLoadingData,
                Data: data
            };
        });

        function createViewModel(componentParams) {
            var viewModel = new SignalsTechnicalAnalysisGridViewModel(componentParams || {});
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
