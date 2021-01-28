define(
    'viewmodels/TransactionsReportViewModel',
    [
        'require',
        'knockout',
        'helpers/KoComponentViewModel',
        'devicemanagers/ViewModelsManager',
        'handlers/general',
        'LoadDictionaryContent!TransactionsReport',
        'dataaccess/dalTransactionsReport'
    ],
    function (require) {
        var ko = require('knockout'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            dalTransactionsReport = require('dataaccess/dalTransactionsReport'),
            general = require('handlers/general');

        var TransactionsReportsViewModel = general.extendClass(koComponentViewModel, function TransactionsReportsViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                dateFrom = ko.observable(),
                dateTo = ko.observable();

            var dataSet = new ObservableDataSet(ko, general, {
                columns: [
                    {
                        name: "PositionNumber",
                        dataIndex: eTransactionsReports.PositionNumber
                    }, {
                        name: "TranactionNumber",
                        dataIndex: eTransactionsReports.TransactionNumber
                    }, {
                        name: "ExecutionDate",
                        dataIndex: eTransactionsReports.ExecutionDate
                    }, {
                        name: "BuySell",
                        dataIndex: eTransactionsReports.BuySell
                    }, {
                        name: "Item",
                        dataIndex: eTransactionsReports.Item
                        
                    },
                    {
                        name: "InstrumentId",
                        dataIndex: eTransactionsReports.InstrumentId,
                    },
                    {
                        name: "ItemBase",
                        transform: function (value, rIndex, cIndex, rawRecord, record) {
                            return record.Item.split(/\//)[0];
                        }
                    }, {
                        name: "QuantityTraded",
                        dataIndex: eTransactionsReports.QuantityTraded
                    }, {
                        name: "UnitPrice",
                        dataIndex: eTransactionsReports.UnitPrice
                    }, {
                        name: "QuantityTradedAndOtherCcy",
                        transform: function (value, rIndex, cIndex, rawRecord, record) {
                            return record.QuantityTraded;
                        }
                    }, {
                        name: "TotalAmountCurrency",
                        dataIndex: eTransactionsReports.TotalAmountCurrency
                    }, {
                        name: "USDVolume",
                        dataIndex: eTransactionsReports.USDVolume
                    }, {
                        name: "TypeOfOrder",
                        dataIndex: eTransactionsReports.TypeOfOrder
                    }, {
                        name: "OpenRolloverClose",
                        dataIndex: eTransactionsReports.OpenRolloverClose
                    }, {
                        name: "BaseCur",
                        dataIndex: eTransactionsReports.BaseCur
                    }, {
                        name: "OtherCur",
                        dataIndex: eTransactionsReports.OtherCur
                    }, {
                        name: "Commission",
                        dataIndex: eTransactionsReports.Commission
                    }
                ],
                statusField: "status",
                totalField: "totalItems",
                dataField: "Transactions",
                pagination: {
                    pagesPerPage: 5,
                    pageIndexField: "page",
                    pageSizeField: "pagesize"
                },
                Filter: {
                    page: 1,
                    pagesize: 20,
                    to: dateTo,
                    from: dateFrom
                },
                DAL: {
                    reference: dalTransactionsReport.LoadTransactions,
                    callerName: "TransactionsReportViewModel/getTransactions",
                    errorSeverity: eErrorSeverity.medium
                }
            });

            function registerObservableStartUpEvent() {
                self.subscribeTo(viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vTransactionsReport).state, function (state) {
                    switch (state) {
                        case eViewState.Refresh:
                            dataSet.Load();
                            viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vTransactionsReport).state(eViewState.Initial);
                            break;
                    }
                });

                self.subscribeTo(dataSet.HasRecords, function (hasData) {
                    ko.postbox.publish("printableDataAvailable", {
                        dataAvailable: hasData,
                        viewType: viewModelsManager.VManager.ActiveFormType(),
                        viewModel: 'TransactionsReportsViewModel'
                    });
                });
            }

            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                setFilterToDefault();
                registerObservableStartUpEvent();
                dataSet.Init();

                dataSet.ApplyFilter();
            }

            function setFilterToDefault() {
                var date = new Date();
                dateFrom((new Date(date.getFullYear(), date.getMonth(), 1)).ExtractDate());
                dateTo((new Date()).ExtractDate());
            }

            function dispose() {
                dataSet.Clean();

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            function apply() {
                if (dataSet.IsLoadingData()) {
                    return;
                }

                dataSet.ApplyFilter();
            }

            var enableApplyButton = ko.computed(function () { return !dataSet.IsLoadingData(); }, self);

            return {
                init: init,
                dispose: dispose,
                Transactions: dataSet.DataRows,
                HasRecords: dataSet.HasRecords,
                DataSet: dataSet,
                EnableApplyButton: enableApplyButton,
                Filter: {
                    From: dateFrom,
                    To: dateTo,
                    Apply: apply
                }
            };
        });

        var createViewModel = function (params) {
            var viewModel = new TransactionsReportsViewModel();

            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);