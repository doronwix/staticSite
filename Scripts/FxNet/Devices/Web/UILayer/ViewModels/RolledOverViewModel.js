define(
    'deviceviewmodels/RolledOverViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/viewsmanager',
        'initdatamanagers/SymbolsManager',
        'initdatamanagers/InstrumentsManager',
        'StateObject!Positions',
        "helpers/observabledataset",
        'LoadDictionaryContent!datagrids_rolledover'
    ],
    function (require) {
        var ko = require('knockout'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            ViewsManager = require('managers/viewsmanager'),
            general = require('handlers/general'),
            SymbolsManager = require('initdatamanagers/SymbolsManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            ObservableDataSet = require("helpers/observabledataset"),
            positionsCache = require('StateObject!Positions');

        var RolledOverViewModel = general.extendClass(KoComponentViewModel, function () {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel


            var init = function (settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                setObservables();
                var positionNumber = ViewsManager.GetViewArgsByKeyName(eViewTypes.vRolledOver, 'posNum');

                dataSet.SetFilter({ PositionNumber: positionNumber });
                dataSet.Load();
            };

            var onLoad = function () {
                ko.postbox.publish(eAppEvents.rolledOverDataLoaded);

                if (positionsCache.containsKey('ofhPositionNumber')) {
                    positionsCache.update('ofhPositionNumber', null);
                }

                data.isDataReady(true);
            };

            var dataSetOptions = {
                idField: "dealNumber",
                columns: [
                    { name: "posNumber", dataIndex: eClosedDealsBase.positionNumber },
                    { name: "dealNumber", dataIndex: eClosedDealsBase.orderID },
                    { name: "executionDate", dataIndex: eClosedDealsBase.executionTime },
                    { name: "buyAmount", dataIndex: eClosedDealsBase.buyAmount },
                    {
                        name: "buyCcy",
                        transform: function (value, rowIndex, cIndex, rawRecord) {
                            var instrumentId = rawRecord[eClosedDealsBase.instrumentID];
                            var orderDir = rawRecord[eClosedDealsBase.orderDir];
                            if (orderDir == eOrderDir.Buy) {
                                return SymbolsManager.GetTranslatedSymbolById(InstrumentsManager.GetInstrument(instrumentId).baseSymbol);
                            } else {
                                return SymbolsManager.GetTranslatedSymbolById(InstrumentsManager.GetInstrument(instrumentId).otherSymbol);
                            }
                        }
                    },
                    { name: "sellAmount", dataIndex: eClosedDealsBase.sellAmount },
                    {
                        name: "sellCcy",
                        transform: function (value, rowIndex, cIndex, rawRecord) {
                            var instrumentId = rawRecord[eClosedDealsBase.instrumentID];
                            var orderDir = rawRecord[eClosedDealsBase.orderDir];
                            if (orderDir == eOrderDir.Buy) {
                                return SymbolsManager.GetTranslatedSymbolById(InstrumentsManager.GetInstrument(instrumentId).otherSymbol);
                            } else {
                                return SymbolsManager.GetTranslatedSymbolById(InstrumentsManager.GetInstrument(instrumentId).baseSymbol);
                            }
                        }
                    },
                    { name: "dealRate", dataIndex: eClosedDeals.dealRate },
                    { name: "forwardPips", dataIndex: eClosedDealsBase.forwardPips },
                    { name: "valueDate", dataIndex: eClosedDealsBase.valueDate },
                    { name: "instrumentID", dataIndex: eClosedDealsBase.instrumentID }
                ],
                pageSizes: 20,
                statusField: "status",
                totalField: "totalItems",
                dataField: "rolledOverDeals",
                pagination: {
                    pagesPerPage: 5,
                    pageIndexField: "Page",
                    pageSizeField: "PageSize"
                },
                Filter: { PositionNumber: 0 },
                DAL: {
                    reference: dalClosedDeals.LoadRolledOverHistory,
                    callerName: "RolledOverControl/onLoadComplete",
                    errorSeverity: eErrorSeverity.medium,
                    onLoad: onLoad
                }
            };

            var dataSet = new ObservableDataSet(ko, general, dataSetOptions);

            var setObservables = function () {
                data.isDataReady = ko.observable(false);
            };

            var dispose = function () {
                dataSet.Clean();
                parent.dispose.call(self); // inherited from KoComponentViewModel
            };

            return {
                init: init,
                dispose: dispose,
                DataSet: dataSet,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new RolledOverViewModel();

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
