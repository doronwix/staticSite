define(
    'viewmodels/Deals/ClosedDealsModule',
    [
        'require',
        'knockout',
        'initdatamanagers/Customer',
        'configuration/initconfiguration',
        'managers/instrumentTranslationsManager',
        'initdatamanagers/SymbolsManager',
        'viewmodels/ViewModelBase',
        'dataaccess/dalClosedDeals',
        'FxNet/LogicLayer/Deal/DealPermissions',
        'initdatamanagers/InstrumentsManager',
        'handlers/general'
    ],
    function ClosedDealsModuleDef(require) {
        var ko = require('knockout'),
            customer = require('initdatamanagers/Customer'),
            closedDealsGridSettings = require('configuration/initconfiguration').ClosedDealsConfiguration,
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            dalClosedDeals = require("dataaccess/dalClosedDeals"),
            dealPermissions = require('FxNet/LogicLayer/Deal/DealPermissions'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            general = require('handlers/general');

        function ClosedDealsModule() {
            var self,
                defaultPageSize = 40,
                inheritedInstance = general.clone(ViewModelBase),
                viewData = {},
                filter = {
                    positionNumber: ko.observable(),
                    instrumentId: ko.observable(),
                    instrument: ko.observable(),
                    from: ko.observable(),
                    to: ko.observable(),
                    page: ko.observable(1),
                    pagesize: defaultPageSize
                },
                dsColumns = {
                    idField: "positionNumber",
                    columns: [
                        {
                            name: "rowNumber",
                            transform: function (value, rIndex) {
                                return rIndex;
                            }
                        },
                        {
                            name: "positionNumber",
                            dataIndex: eClosedDealsBase.positionNumber
                        },
                        {
                            name: "orderID",
                            dataIndex: eClosedDealsBase.orderID
                        },
                        {
                            name: "instrumentID",
                            dataIndex: eClosedDealsBase.instrumentID
                        },
                        {
                            name: "instrumentName",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID],
                                    dbEnglishName = rawRecord[eClosedDealsBase.instrumentEnglishName];

                                var instrumentName = instrumentTranslationsManager.Short(instrumentId);
                                if (!general.isEmptyValue(instrumentName)) {
                                    return instrumentName;
                                } else {
                                    return dbEnglishName;
                                }
                            }
                        },
                        {
                            name: "specialFontStart",
                            dataIndex: eClosedDealsBase.specialFontStart
                        },
                        {
                            name: "specialFontLength",
                            dataIndex: eClosedDealsBase.specialFontLength
                        },
                        {
                            name: "buyAmount",
                            dataIndex: eClosedDealsBase.buyAmount
                        },
                        {
                            name: "buySymbol",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var symbol = symbolsManager.ExtractSymbolsNames(rawRecord[eClosedDealsBase.instrumentID]);

                                if (symbol) {
                                    if (rawRecord[eClosedDealsBase.orderDir] == eOrderDir.Buy) {
                                        return symbol.base;
                                    } else {
                                        return symbol.other;
                                    }
                                }

                                return "";
                            }
                        },
                        {
                            name: "sellAmount",
                            dataIndex: eClosedDealsBase.sellAmount
                        },
                        {
                            name: "sellSymbol",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var symbol = symbolsManager.ExtractSymbolsNames(rawRecord[eClosedDealsBase.instrumentID]);

                                if (symbol) {
                                    if (rawRecord[eClosedDealsBase.orderDir] == eOrderDir.Buy) {
                                        return symbol.other;
                                    } else {
                                        return symbol.base;
                                    }
                                }

                                return "";
                            }
                        },
                        {
                            name: "orderDir",
                            dataIndex: eClosedDealsBase.orderDir
                        },
                        {
                            name: "dealAmount",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                if (rawRecord[eClosedDealsBase.orderDir] == eOrderDir.Sell) {
                                    return rawRecord[eClosedDealsBase.sellAmount];
                                } else {
                                    return rawRecord[eClosedDealsBase.buyAmount];
                                }
                            }
                        },
                        {
                            name: "dealType",
                            dataIndex: eClosedDealsBase.dealType
                        },
                        {
                            name: "valueDate",
                            dataIndex: eClosedDealsBase.valueDate
                        },
                        {
                            name: "positionStart",
                            dataIndex: eClosedDealsSummaries.positionStart
                        },
                        {
                            name: "positionStartFormatted",
                            dataIndex: eClosedDealsSummaries.positionStart,
                            transform: function (value) {
                                return formatDateString(value);
                            }
                        },
                        {
                            name: "positionStartNormalized",
                            dataIndex: eClosedDealsSummaries.positionStart,
                            transform: function (value) {
                                return normalizeShortDateString(value);
                            }
                        },
                        {
                            name: "executionTime",
                            dataIndex: eClosedDealsBase.executionTime
                        },
                        {
                            name: "executionTimeFormatted",
                            dataIndex: eClosedDealsBase.executionTime,
                            transform: function (value) {
                                return formatDateString(value);
                            }
                        },
                        {
                            name: "executionTimeNormalized",
                            dataIndex: eClosedDealsBase.executionTime,
                            transform: function (value) {
                                return normalizeShortDateString(value);
                            }
                        },
                        {
                            name: "forwardPips",
                            dataIndex: eClosedDealsBase.forwardPips
                        },
                        {
                            name: "originalPosNum",
                            dataIndex: eClosedDealsSummaries.originalPosNum
                        },
                        {
                            name: "orderRateOpen",
                            dataIndex: eClosedDealsSummaries.orderRateOpen,
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID],
                                    decimals = rawRecord[eClosedDealsBase.decimalDigit];

                                return Format.toRate(value, true, instrumentId, decimals);
                            }
                        },
                        {
                            name: "orderRateOpenNumeric",
                            dataIndex: eClosedDealsSummaries.orderRateOpen,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "orderRateClosed",
                            dataIndex: eClosedDealsSummaries.orderRateClosed,
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID],
                                    decimals = rawRecord[eClosedDealsBase.decimalDigit];

                                return Format.toRate(value, true, instrumentId, decimals);
                            }
                        },
                        {
                            name: "orderRateClosedNumeric",
                            dataIndex: eClosedDealsSummaries.orderRateClosed,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "pl",
                            dataIndex: eClosedDealsSummaries.pl
                        },
                        {
                            name: "plAsNumber",
                            dataIndex: eClosedDealsSummaries.pl,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "plCCY",
                            dataIndex: eClosedDealsSummaries.plCCY
                        },
                        {
                            name: "plCCYAsNumber",
                            dataIndex: eClosedDealsSummaries.plCCY,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "plSymbol",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var symbol = symbolsManager.ExtractSymbolsNames(rawRecord[eClosedDealsBase.instrumentID]);

                                if (symbol) {
                                    return symbol.other;
                                }

                                return "";
                            }
                        },
                        {
                            name: "hasAdditionalPL",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                return Number(rawRecord[eClosedDealsSummaries.additionalPL]) !== 0;
                            }
                        },
                        {
                            name: "plSign",
                            dataIndex: eClosedDealsSummaries.pl,
                            transform: function (value) {
                                return value.sign();
                            }
                        },
                        {
                            name: "adj",
                            dataIndex: eClosedDealsSummaries.originalPosNum,
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                if (customer.prop.dealPermit == eDealPermit.Islamic) {
                                    return false;
                                }

                                if (!rawRecord[eClosedDealsBase.valueDate]) {
                                    return true;
                                }

                                return general.isPos(value);
                            }
                        },
                        {
                            name: "instrumentShortName",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                return instrumentTranslationsManager.Short(rawRecord[eClosedDealsBase.instrumentID]);
                            }
                        },
                        {
                            name: "spreadDiscount",
                            dataIndex: eClosedDealsSummaries.spreadDiscount
                        },
                        {
                            name: "commission",
                            dataIndex: eClosedDealsSummaries.commission
                        },
                        {
                            name: "grossPL",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                if (dealPermissions.CustomerDealPermit() === eDealPermit.ZeroSpread) {
                                    return (general.toNumeric(rawRecord[eClosedDealsSummaries.pl]) + general.toNumeric(rawRecord[eClosedDealsSummaries.commission])).toFixed(2).toString();
                                }

                                if (dealPermissions.HasSpreadDiscount()) {
                                    return (general.toNumeric(rawRecord[eClosedDealsSummaries.pl]) - general.toNumeric(rawRecord[eClosedDealsSummaries.spreadDiscount])).toFixed(2).toString();
                                }

                                return rawRecord[eClosedDealsSummaries.pl];
                            }
                        },
                        {
                            name: "isStock",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID];

                                return instrumentsManager.IsInstrumentStock(instrumentId);
                            }
                        }
                    ],
                    statusField: "status",
                    totalField: "totalItems",
                    dataField: "closedDealSummary",
                    pagination: {
                        pagesPerPage: 5,
                        pageIndexField: "page",
                        pageSizeField: "pagesize"
                    },
                    Filter: filter,
                    DAL: {
                        reference: dalClosedDeals.LoadClosedDealsSummariesWithThreshold,
                        callerName: "ClosedDealsViewModel/getLastClosedDeals",
                        errorSeverity: eErrorSeverity.medium
                    }
                };

            var dataSet = new ObservableDataSet(ko, general, dsColumns, { enabled: true, sortProperty: 'executionTimeNormalized', asc: false });

            function init(customSettings) {
                self = this;
                inheritedInstance.setSettings(self, customSettings);

                setObservables();
                setComputables();
                setExtenders();

                setFilterDefaults();

                dataSet.Init();
            }

            function setObservables() {
                viewData.isOpenedInDialog = ko.observable(false);
                viewData.ccyPairs = ko.observableArray([]);
            }

            function setComputables() {
                viewData.isApplyButtonEnabled = ko.computed(function () {
                    return !dataSet.IsLoadingData();
                }, self);
            }

            function setExtenders() {
                filter.positionNumber = filter.positionNumber.extend({
                    toNumericLength: {
                        ranges: [{
                            from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: 0
                        }]
                    }
                });

                filter.from.extend({
                    validation: {
                        validator: function (v) {
                            return general.str2Date(v) <= general.str2Date(filter.to());
                        }
                    }
                });

                filter.to.extend({
                    validation: {
                        validator: function (v) {
                            return general.str2Date(v) >= general.str2Date(filter.from());
                        }
                    }
                });
            }

            function setFilterDefaults() {
                filter.positionNumber("");
                filter.instrumentId(Number.MAX_SAFE_INTEGER);
                filter.instrument();
                filter.from((new Date()).AddWeeks(-1).ExtractDateUTC());
                filter.to((new Date()).ExtractDateUTC());
                filter.page(1);

                filter.pagesize = inheritedInstance.getSettings(self).pageSize || filter.pagesize;

                if (inheritedInstance.getSettings(self).threshold) {
                    filter.threshold = inheritedInstance.getSettings(self).threshold;
                }
            }

            function filterIsValid() {
                return filter.from.isValid() && filter.to.isValid();
            }

            function applyFilter(useDefault) {
                if (viewData.isApplyButtonEnabled()) {
                    if (useDefault || !filterIsValid()) {
                        setFilterDefaults()
                    }

                    dataSet.ApplyFilter();
                }
            }

            function normalizeShortDateString(value) {
                var arr = value.split(' ');
                var datePartArray = arr[0].split('/');

                arr[0] = datePartArray[2] + datePartArray[1] + datePartArray[0];

                var retString = arr.join('').replace(/[/\|:| ]/g, '');
                return retString;
            }

            function formatDateString(dateString) {
                var splitDate = general.SplitDateTime(dateString);

                return splitDate.date + " " + splitDate.time;
            }

            return {
                init: init,
                DataSet: dataSet,
                HasRecords: dataSet.HasRecords,
                ViewData: viewData,
                ClosedDeals: dataSet.DataRows,
                Filter: {
                    Position: filter.positionNumber,
                    InstrumentId: filter.instrumentId,
                    Instrument: filter.instrument,
                    From: filter.from,
                    To: filter.to
                },
                ApplyFilter: applyFilter,
                DsColumns: dsColumns,
                SetSorting: dataSet.SetSorting,
                SortProperties: dataSet.SortProperties,
                DealPermissions: dealPermissions
            };
        }

        var instance = new ClosedDealsModule();

        instance.init(closedDealsGridSettings);

        return instance;
    }
);
