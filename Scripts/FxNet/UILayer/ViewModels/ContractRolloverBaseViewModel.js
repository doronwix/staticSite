/*global eContractRollover  */
define(
    'viewmodels/ContractRolloverBaseViewModel',
    [
        'require',
        'knockout',
        'helpers/KoComponentViewModel',
        'devicemanagers/ViewModelsManager',
        'dataaccess/dalAccountingActions',
        'handlers/general',
        'StateObject!Positions',
        'initdatamanagers/InstrumentsManager',
        'FxNet/LogicLayer/Deal/InstrumentUnitLabel',
        'managers/instrumentTranslationsManager',
        'configuration/initconfiguration'
    ],
    function ContractRolloverBaseViewModelDef(require) {
        var ko = require('knockout'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            dalAccountingActions = require('dataaccess/dalAccountingActions'),
            general = require('handlers/general'),
            positionsCache = require('StateObject!Positions'),
            InstrumentUnitLabel = require('FxNet/LogicLayer/Deal/InstrumentUnitLabel'),
            instrumentManager = require('initdatamanagers/InstrumentsManager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            initConfiguration = require('configuration/initconfiguration');

        var ContractRolloverBaseViewModel = general.extendClass(KoComponentViewModel, function ContractRolloverBaseViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data;
            var unitPrefix = 'unitLabel_';
            var resourceName = 'deals_ContractRollover';

            var filters = {};

            var dsColumns = {
                idField: "actionNumber",
                columns: [
                    {
                        name: "rowNumber",
                        transform: function (value, rowIndex) {
                            return rowIndex;
                        }
                    }, {
                        name: "actionID",
                        dataIndex: eContractRollover.actionID
                    }, {
                        name: "posNum",
                        dataIndex: eContractRollover.posNum
                    }, {
                        name: "date",
                        dataIndex: eContractRollover.date
                    }, {
                        name: "credit",
                        dataIndex: eContractRollover.credit
                    }, {
                        name: "debit",
                        dataIndex: eContractRollover.debit
                    }, {
                        name: "symbolName",
                        dataIndex: eContractRollover.symbol
                    }, {
                        name: "openMidRate",
                        transform: function (value, rowIndex, columnIndex, rawRecord) {
                            return Format.toRate(rawRecord[eContractRollover.openMidRate], true, data.instrumentID());
                        }
                    }, {
                        name: "closeMidRate",
                        transform: function (value, rowIndex, columnIndex, rawRecord) {
                            return Format.toRate(rawRecord[eContractRollover.closeMidRate], true, data.instrumentID());
                        }
                    }, {
                        name: "gap",
                        transform: function (value, rowIndex, columnIndex, rawRecord) {
                            return Format.toRate(rawRecord[eContractRollover.gap], true, data.instrumentID());
                        }
                    }, {
                        name: "spread",
                        transform: function (value, rowIndex, columnIndex, rawRecord) {
                            return Format.toRate(rawRecord[eContractRollover.spread], true, data.instrumentID());
                        }
                    }
                ],
                pageSizes: 20,
                statusField: "status",
                totalField: "totalItems",
                dataField: "actions",
                pagination: {
                    pagesPerPage: 5,
                    pageIndexField: "Page",
                    pageSizeField: "PageSize"
                },
                Filter: filters,
                DAL: {
                    reference: dalAccountingActions.GetContractRollover,
                    callerName: "ContractRollover/onLoadComplete",
                    errorSeverity: eErrorSeverity.medium,
                    onLoad: function (info) {
                        ko.postbox.publish(eAppEvents.contractRolloverDataLoaded);
                        data.totalSum(info.totalAmount);

                        if (!general.isEmptyValue(info.actions) && !general.isEmptyValue(info.actions[0])) {
                            data.currency(info.actions[0][eContractRollover.symbol]);
                            data.firstGap(Format.toRate(info.actions[0][eContractRollover.gap], true, data.instrumentID()));
                            data.firstAmount(general.toNumeric(info.actions[0][eContractRollover.debit]) != 0 ? info.actions[0][eContractRollover.debit] : info.actions[0][eContractRollover.credit]);
                            data.debitSign(general.toNumeric(info.actions[0][eContractRollover.debit]) != 0 ? "-" : "");
                            data.firstSpread(Format.toRate(info.actions[0][eContractRollover.spread].toString(), true, data.instrumentID()));
                        }

                        if (positionsCache.containsKey('plPositionNumber')) {
                            positionsCache.update('plPositionNumber', null);
                        }

                        data.isDataReady(true);
                    }
                }
            };

            var observableDataSet = new ObservableDataSet(ko, general, dsColumns);

            function setObservables() {
                data.totalSum = ko.observable(0);
                data.totalSumFormatted = ko.computed(function formatTotalSum() {
                    return Format.toNumberWithThousandsSeparator(ko.utils.unwrapObservable(data.totalSum), 2);
                });
                data.isDataReady = ko.observable(false);
                data.currency = ko.observable("");
                data.firstGap = ko.observable("");
                data.firstAmount = ko.observable("");
                data.debitSign = ko.observable("");
                data.firstSpread = ko.observable("");
                data.instrumentID = ko.observable(viewModelsManager.VManager.GetViewArgs(eViewTypes.vContractRollover).instrumentID);
                data.dealAmount = viewModelsManager.VManager.GetViewArgs(eViewTypes.vContractRollover).dealAmount;
                data.orderDir = viewModelsManager.VManager.GetViewArgs(eViewTypes.vContractRollover).orderDir;

                var position = viewModelsManager.VManager.GetViewArgs(eViewTypes.vContractRollover).posNum;
                filters.Position = ko.observable(position);
                filters.Page = ko.observable(initConfiguration.ContractRolloverConfiguration.defaultPage);
                filters.PageSize = initConfiguration.ContractRolloverConfiguration.pageSize;
            }

            function setProperties() {
                var instrument = instrumentManager.GetInstrument(data.instrumentID());

                data.instrumentName = instrumentTranslationsManager.Short(data.instrumentID());
                data.instrumentUnit = InstrumentUnitLabel.Translate(instrument, unitPrefix, resourceName);
            }

            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setObservables();
                setProperties();

                observableDataSet.Init();
                observableDataSet.SetFilter(filters);
                observableDataSet.Load();
            }

            function dispose() {
                observableDataSet.Clean();
                parent.dispose.call(self);          // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BalanceInfo: observableDataSet.DataRows,
                DataSet: observableDataSet,
                GetNextBalance: observableDataSet.Paging.ShowMore,
                VisibleShowMore: observableDataSet.Paging.HasNextPage
            };
        });

        return ContractRolloverBaseViewModel;
    }
);
