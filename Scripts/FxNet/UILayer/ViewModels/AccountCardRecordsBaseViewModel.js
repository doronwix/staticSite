define(
    'viewmodels/AccountCardRecordsBaseViewModel',
    [
        'require',
        'knockout',
        'helpers/KoComponentViewModel',
        'handlers/general',
        'managers/viewsmanager',
        'initdatamanagers/Customer',
        'initdatamanagers/InstrumentsManager',
        'initdatamanagers/SymbolsManager',
        'dataaccess/dalAccountingActions',
        'configuration/initconfiguration',
        'Dictionary',
        'helpers/observabledataset',
        'StateObject!Positions',
        'enums/DataMembersPositions'
    ],
    function (require) {
        var ko = require('knockout'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            ViewsManager = require('managers/viewsmanager'),
            general = require('handlers/general'),
            customer = require('initdatamanagers/Customer'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            dalAccountingActions = require('dataaccess/dalAccountingActions'),
            Dictionary = require('Dictionary'),
            initConfiguration = require('configuration/initconfiguration'),
            positionsCache = require('StateObject!Positions'),
            ObservableDataSet = require('helpers/observabledataset');

        var AccountCardRecordsBaseViewModel = general.extendClass(KoComponentViewModel, function () {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                handlers = {},
                viewArgs;

            var filter = new function () {
                var me = this;

                me.SymbolId = ko.observable(0);
                me.SymbolName = ko.observable('');
                me.ActionCategory = ko.observable(eAccountingActionsCategory.OvernightHistory);
                me.From = ko.observable((new Date()).AddWeeks(-1).ExtractDate());
                me.To = ko.observable((new Date()).ExtractDate());
                me.Position = ko.observable('');
                me.Page = ko.observable(1);
                me.PageSize = initConfiguration.AccountCardRecordsConfiguration.pageSize;
                me.ShowCosts = false;
                me.ClosedDate = ko.observable((new Date()).AddWeeks(-1).ExtractDate());
            }();

            function onLoad(response) {
                ko.postbox.publish(eAppEvents.accountCardRecordsDataLoaded);

                if (observableDataSet.DataRows().length > 0) {
                    data.totalSum(observableDataSet.DataRows()[0]['totalsum']);
                }

                data.showZeroCosts = response.showZeroCosts;

                if (response.costs) {
                    var costValues = {};
                    costValues.SpreadCost = response.costs.SpreadCostInAccountBase;
                    costValues.SpreadDiscount = response.costs.SpreadDiscount;
                    costValues.Commission = response.costs.CommissionInAccountBase;
                    costValues.RolloverSpreadCost = response.costs.RolloverSpreadCostInAccountBase;
                    costValues.ConversionCost = response.costs.ConversionCostInAccountBase;

                    data.showSpreadCost = !!costValues.SpreadCost;
                    data.showSpreadDiscount = !!costValues.SpreadDiscount;
                    data.showCommision = !!costValues.Commission || (costValues.Commission === 0 && costValues.SpreadCost === 0);
                    data.showRolloverSpreadCost = !!costValues.RolloverSpreadCost;
                    data.showConversionCost = !!costValues.ConversionCost;

                    costValues.OvernightFinancing = Number.fromStr(data.totalSum());
                    costValues.TotalCosts = ((costValues.SpreadCost === null) ? 0 : costValues.SpreadCost)
                        + ((costValues.SpreadDiscount === null) ? 0 : costValues.SpreadDiscount)
                        + ((costValues.Commission === null) ? 0 : costValues.Commission)
                        + ((costValues.RolloverSpreadCost === null) ? 0 : costValues.RolloverSpreadCost)
                        + ((costValues.ConversionCost === null) ? 0 : costValues.ConversionCost);

                    data.showTotalCosts = data.showSpreadCost || data.showSpreadDiscount || data.showCommision || data.showRolloverSpreadCost || data.showConversionCost;

                    costValues.TotalWithOvernightFinancing = costValues.TotalCosts + costValues.OvernightFinancing;

                    data.costValues(costValues);
                }

                if (positionsCache.containsKey('ofhPositionNumber')) {
                    positionsCache.update('ofhPositionNumber', null);
                }

                data.isDataReady(true);
            }

            var dsColumns = {
                idField: 'actionNumber',
                columns: [
                    {
                        name: 'rowNumber',
                        transform: function (value, rowIndex) {
                            return rowIndex;
                        }
                    },
                    {
                        name: 'actionNumber',
                        dataIndex: eAccountingAction.actionID
                    },
                    {
                        name: 'date',
                        dataIndex: eAccountingAction.date
                    },
                    {
                        name: 'credit',
                        dataIndex: eAccountingAction.credit
                    },
                    {
                        name: 'debit',
                        dataIndex: eAccountingAction.debit
                    },
                    {
                        name: 'symbolId',
                        dataIndex: eAccountingAction.symbolID
                    },
                    {
                        name: 'symbolName',
                        transform: function (value, rowIndex, cIndex, rawRecord) {
                            return symbolsManager.GetTranslatedSymbolById(rawRecord[eAccountingAction.symbolID]);
                        }
                    },
                    {
                        name: 'type',
                        transform: function (value, rowIndex, columnIndex, rawRecord) {
                            return Dictionary.GetItem('acctype' + rawRecord[eAccountingAction.actionTypeID]);
                        }
                    },
                    {
                        name: 'comment',
                        dataIndex: eAccountingAction.comment
                    },
                    {
                        name: 'totalsum',
                        dataIndex: eAccountingAction.totalsum
                    }
                ],
                pageSizes: 20,
                statusField: 'status',
                totalField: 'totalItems',
                dataField: 'actions',
                pagination: {
                    pagesPerPage: 5,
                    pageIndexField: 'Page',
                    pageSizeField: 'PageSize'
                },
                Filter: filter,
                DAL: {
                    reference: dalAccountingActions.LoadAccountingActions,
                    callerName: 'StatementControl/onLoadComplete',
                    errorSeverity: eErrorSeverity.medium,
                    onLoad: onLoad
                }
            };

            var observableDataSet = new ObservableDataSet(ko, general, dsColumns);

            function setObservables() {
                data.totalSum = ko.observable(0);
                data.isDataReady = ko.observable(false);
                data.costs = ko.observable(null);
                data.costValues = ko.observable(null);
            }

            function setDefaults() {
                filter.From((new Date()).AddWeeks(-1).toShortISOString());
                filter.To((new Date()).toShortISOString());
                filter.Position('');
                filter.PageSize = initConfiguration.AccountCardRecordsConfiguration.pageSize;
                data.totalSum('0');
                data.isDataReady(false);
            }

            var enableApplyButton = self.createComputed(function () { return !observableDataSet.IsLoadingData(); }, self);

            function startViewAccountCard() {
                viewArgs = ViewsManager.GetViewArgs(eViewTypes.vAccountCardRecords);
                setDefaults();

                if (customer.prop.autoConvert)
                    filter.SymbolId(customer.prop.baseCcyId());
                else {
                    filter.SymbolId(instrumentsManager.GetInstrument(viewArgs.instrumentId).otherSymbol);
                }

                filter.SymbolName(symbolsManager.GetTranslatedSymbolById(filter.SymbolId()));
                filter.Position(viewArgs.posNum);
                filter.From(getISODateSting(viewArgs.fromDate));
                filter.ShowCosts = !!viewArgs.showCosts;
                filter.ClosedDate(getISODateSting(viewArgs.closedDate));

                observableDataSet.SetFilter(filter);
                observableDataSet.Load();
            }

            function getISODateSting(date) {
                if (!date ||
                    !general.str2Date(date)) {
                    return null;
                }

                return general.str2Date(date).toShortISOString()
            }

            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                setObservables();
                setDefaults();

                viewArgs = ViewsManager.GetViewArgs(eViewTypes.vAccountCardRecords);
                startViewAccountCard();
            }

            function dispose() {
                observableDataSet.Clean();
                handlers.scrolled = null;
                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BalanceInfo: observableDataSet.DataRows,
                GetNextBalance: observableDataSet.Paging.ShowMore,
                VisibleShowMore: observableDataSet.Paging.HasNextPage,
                DataSet: observableDataSet,
                Filter: filter,
                EnableApplyButton: enableApplyButton,
                HasRecords: observableDataSet.HasRecords,
                DsColumns: dsColumns,
                IsLoadingData: observableDataSet.IsLoadingData

            };
        });

        return AccountCardRecordsBaseViewModel;
    }
);