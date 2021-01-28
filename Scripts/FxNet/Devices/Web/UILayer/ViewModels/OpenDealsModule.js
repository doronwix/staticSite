define(
    'deviceviewmodels/OpenDealsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'initdatamanagers/Customer',
        'devicemanagers/AlertsManager',
        'Dictionary',
        'cachemanagers/ClientStateHolderManager',
        'cachemanagers/dealsmanager',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/StatesManager',
        'helpers/ObservableHelper',
        'dataaccess/dalorder',
        'deviceviewmodels/BaseOrder',
        'viewmodels/QuotesSubscriber',
        'viewmodels/ViewModelBase',
        "modules/BuilderForInBetweenQuote",
        'FxNet/LogicLayer/Deal/DealPermissions',
        'viewmodels/OpenDealsViewModelBase',
        'global/storagefactory',
        'StateObject!OpenedDeals',
        'handlers/AmountConverter'
    ],
    function OpenDealsDef(require) {
        var ko = require('knockout'),
            customer = require('initdatamanagers/Customer'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary'),
            csHolderManager = require('cachemanagers/ClientStateHolderManager'),
            dealsManager = require('cachemanagers/dealsmanager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            statesManager = require('devicemanagers/StatesManager'),
            vmHelpers = require('helpers/ObservableHelper'),
            dalOrders = require('dataaccess/dalorder'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            BuilderForInBetweenQuote = require("modules/BuilderForInBetweenQuote"),
            dealPermissions = require('FxNet/LogicLayer/Deal/DealPermissions'),
            general = require('handlers/general'),
            OpenDealsViewModelBase = require('viewmodels/OpenDealsViewModelBase'),
            storageFactory = require('global/storagefactory'),
            stateObject = require('StateObject!OpenedDeals'),
            amountConverter = require('handlers/AmountConverter');

        var OpenDealsModule = general.extendClass(OpenDealsViewModelBase, function OpenDealsClass() {
            var self = this, // REBUILD_COLLECTION_SIZE = 2,
                itemsPerRender = 50,
                USD_ID = 47,
                quotesVM = new QuotesSubscriber(),
                baseOrder = new BaseOrder(),
                inheritedInstance = general.clone(ViewModelBase),
                LS = storageFactory(storageFactory.eStorageType.local),
                selectionKey = 'selection',
                availableSelectionKey = 'availableSelection',
                // module data
                data = {},
                subscribers = [];

            var init = function (customSettings) {
                itemsPerRender = customSettings.itemsPerRender || itemsPerRender;

                inheritedInstance.setSettings(self, customSettings);
                setFlagsState();

                registerToDispatcher();
                loadOpenedDeals();

                setSubscribers();

                quotesVM.Start();
            };

            var _prepareData = function () {
                data.dealsList = ko.observableArray([]);

                // prepare data
                Object.assign(data, {
                    dealsData: null,
                    isSorting: ko.observable(false),
                    isLoadingData: ko.observable(true),
                    isRenderingData: ko.observable(true),
                    onCloseDealsEnable: ko.observable(true),
                    quoteForAccountCcyToUsdCcy: ko.observable(null),
                    totalEquity: ko.observable(0),
                    hasValueDateColumn: ko.observable(false),
                    sortConfig: ko.observable({
                        sortProperty: 'positionNumber',
                        asc: false
                    }),
                    selection: stateObject.set(selectionKey, ko.observableArray([])),
                    availableSelection: stateObject.set(availableSelectionKey, ko.observableArray([])),
                    selectedDeals: ko.observableArray([]),
                    allSelected: ko.observable(false),
                    totalOpenedDeals: ko.observable(0),
                    flagsState: {},
                    positions: {}
                });

                data.currentRenders = ko.observable(1);
                data.lastDealPosition = ko.computed(function () {
                    return getLastDealPosition();
                });

            };

            var getLastDealPosition = function () {
                var lastDealPosition = dealsManager.Deals.count(),
                    limitedPosition = (data.currentRenders() * itemsPerRender),
                    lastPosition;

                lastPosition = lastDealPosition >= 0 ? lastDealPosition : 0;
                data.totalOpenedDeals(dealsManager.Deals.count());

                return limitedPosition <= lastPosition ? limitedPosition : lastPosition;
            };

            var updateDealsToClose = function (reset) {
                data.selectedDeals([]);
                if (reset) {
                    return;
                }

                data.selection().forEach(function (orderID) {
                    var deal = dealsManager.Deals.Container[orderID];
                    data.selectedDeals.push(toObservableRow(deal));
                });
            };

            var closeDealAfterConfirmation = function () {
                var closeDealsConfig = {
                    failCallback: function () {
                        data.onCloseDealsEnable(true);
                    }
                };

                if (data.selection().length > 0) {
                    data.onCloseDealsEnable(false);
                    return dalOrders.CloseDeals(data.selectedDeals(), onCloseDealsReturn, closeDealsConfig);
                }

                return ErrorManager.onError("closeDealAfterConfirmation", "trying to close empty list of positions", eErrorSeverity.low);
            };

            var showMultipleDealsConfirmationAlert = function () {
                var properties = {
                    selectedData: data.selectedDeals(),
                    confirmationCloseDeal: closeDealAfterConfirmation
                };

                AlertsManager.UpdateAlert(AlertTypes.MultipleDealsClosedConfirmation, this.title, this.body, [], properties);
                AlertsManager.PopAlert(AlertTypes.MultipleDealsClosedConfirmation);
            };


            var closeMultipleDeals = function () {
                if (!inheritedInstance.getSettings(self).closeSelected) {
                    return;
                }

                if (statesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    return;
                }

                if (data.selection().length === 0) {
                    return;
                }

                updateDealsToClose();
                if (LS.getItem('hideConfCloseDeals') == 'true') {
                    closeDealAfterConfirmation();
                } else {
                    showMultipleDealsConfirmationAlert();
                }
            };

            var setFlagsState = function () {
                data.flagsState.isMarketClosed = statesManager.States.IsMarketClosed;
            };

            var registerToDispatcher = function () {
                dealsManager.OnDealsChange.Add(onDealsChange);
                dealsManager.OnDealsPLChange.Add(onDealsPLChange);
                csHolderManager.OnChange.Add(onClientStateChange);
            };

            var loadOpenedDeals = function () {
                var accountCcyId = customer.prop.baseCcyId();

                if (accountCcyId !== USD_ID) {
                    BuilderForInBetweenQuote.GetInBetweenQuote(accountCcyId, USD_ID).then(function (response) {
                        data.quoteForAccountCcyToUsdCcy(response);
                        firstDealsLoad();
                    }).done();
                } else {
                    firstDealsLoad();
                }
            };

            var firstDealsLoad = function () {
                data.isLoadingData(true);
                renderDeals();
                data.isLoadingData(false);
            };

            var renderDeals = function () {
                data.isRenderingData(true);
                data.dealsList(getCurrentDealData());
                data.isRenderingData(false);
            };

            var setSubscribers = function () {
                subscribers.push(
                    data.lastDealPosition.subscribe(function () {
                        renderDeals();
                    })
                );

                subscribers.push(
                    data.dealsList.subscribe(function () {
                        checkListSelection();
                    })
                );

                subscribers.push(
                    data.allSelected.subscribe(function (newValue) {
                        if (newValue) {
                            if (data.selection().length !== data.availableSelection().length) {
                                data.selection(ko.toJS(data.availableSelection()));
                            }
                        } else {
                            if (data.selection().length === data.availableSelection().length) {
                                data.selection([]);
                            }
                        }
                    })
                );

                subscribers.push(
                    data.selection.subscribe(function (newValue) {
                        checkListSelection();
                    })
                );
            };

            var onDealsPLChange = function (changes) {
                if (data.isSorting() || data.isRenderingData()) {
                    return;
                }

                data.dealsList(getCurrentDealData());

                if (data.selectedDeals().length) {
                    var deals = changes.dealsObj;
                    for (var i = 0; i < data.selectedDeals().length; i++) {
                        var _deal = deals[data.selectedDeals()[i].orderID];
                        if (_deal) {
                            data.selectedDeals()[i].closingRate(_deal.closingRate);
                            data.selectedDeals()[i].fwPips(_deal.fwPips);
                            data.selectedDeals()[i].spotRate(_deal.spotRate);
                        }
                    }
                }

            };

            var onDealsChange = function (changes) {
                data.dealsList(getCurrentDealData());

                if (!general.isNullOrUndefined(changes.removedItems) && changes.removedItems.length) {
                    var ri = changes.removedItems;
                    for (var i = 0; i < ri.length; i++) {
                        if (data.availableSelection.indexOf(ri[i]) !== -1) {
                            data.availableSelection.remove(ri[i]);
                        }

                        if (data.selection.indexOf(ri[i]) !== -1) {
                            data.selection.remove(ri[i]);
                        }
                    }
                    checkListSelection();
                }

                if (!general.isNullOrUndefined(changes.newItems) && changes.newItems.length) {
                    checkListSelection();
                }
            };

            var checkListSelection = function () {
                data.allSelected(data.selection().length && data.selection().length === data.availableSelection().length);
            };

            var onClientStateChange = function () {
                data.totalEquity(general.toNumeric(csHolderManager.CSHolder.equity));
            };

            var getCurrentDealData = function () {
                data.dealsData = dealsManager.Deals.Sort(data.sortConfig().sortProperty, data.sortConfig().asc);
                var lastDealPos = getLastDealPosition();
                return data.dealsData && data.dealsData.length ? data.dealsData.slice(0, lastDealPos) : [];
            };

            var setSorting = function (enabled, sortBy, ascending) {
                var asc = ascending;
                data.isSorting(true);
                if (data.sortConfig().sortProperty === sortBy) {
                    asc = !data.sortConfig().asc;
                }
                data.sortConfig({
                    sortProperty: sortBy,
                    asc: asc
                });
                data.isSorting(false);
                data.currentRenders(1);
            };

            var onCloseThisDeal = function (deal) {
                var alert = alertsManager.GetAlert(AlertTypes.CloseDealAlert);

                if (alert.DisableThisAlertByCookie()) {
                    var arr = generateArrayForDal([]); // data.deals.Get(deal.orderID)

                    if (arr) {
                        deal.OnCloseDealEnable(false);
                        dalOrders.CloseDeals([arr], onCloseDealReturn);
                    }
                } else {
                    // should come from DB!
                    alertsManager.UpdateAlert(AlertTypes.CloseDealAlert, null,
                        dictionary.GetItem('closeDealConfirmationAlert'),
                        [],
                        {
                            positionNumber: deal.positionNumber,
                            orderDir: deal.orderDir,
                            dealAmount: deal.dealAmount,
                            instrumentID: deal.instrumentID,
                            closingRate: deal.closingRate,
                            deal: deal,
                            caller: publicAPI
                        }
                    );

                    alertsManager.PopAlert(AlertTypes.CloseDealAlert);
                }
            };

            var generateArrayForDal = function (observable) {
                var arr = null;

                if (observable) {
                    var tmpDealObj = ko.toJS(observable);
                    arr = vmHelpers.GeneratePrimitiveTypeArray(tmpDealObj);
                }

                return arr;
            };

            var onCloseDealReturn = function (result, callerID, requestData) {
                updateProcessingObservables(result, callerID, { requestData: requestData });
            };

            var onCloseDealsReturn = function (result, callerID, requestData) {
                updateProcessingObservables(result, callerID, general.extendType({ isCloseMultipleDealsCall: true }, { requestData: requestData }));
            };

            var updateProcessingObservables = function (result, callerID, args) {
                baseOrder.OnActionReturn(result, callerID, null, args);
                data.selectedDeals([]);
                data.onCloseDealsEnable(true);
            };

            var getSelectedInstrument = function () {
                return instrumentsManager.GetUserDefaultInstrumentId();
            };

            var isActiveQuote = function () {
                var quote = quotesVM.GetQuote(getSelectedInstrument());
                return !general.isNullOrUndefined(quote) && quote.isActiveQuote();
            };

            var hasRecords = ko.pureComputed(function () {
                return 0 < data.dealsList().length;
            });

            var updateVdColumnVisibility = function (value) {
                data.hasValueDateColumn(value);
            };


            var toObservableRow = function (_deal) {
                var row = {};

                row.positionNumber = _deal.positionNumber;
                row.exeTime = _deal.exeTime;
                row.instrumentID = _deal.instrumentID;
                row.orderDir = _deal.orderDir;
                row.dealAmount = _deal.orderDir == eOrderDir.Sell ? _deal.sellAmount : _deal.buyAmount;
                row.dealType = _deal.dealType;

                row.buyAmount = _deal.buyAmount;
                row.buySymbolID = _deal.buySymbolID;

                row.sellAmount = _deal.sellAmount;
                row.sellSymbolID = _deal.sellSymbolID;

                row.orderRate = _deal.orderRate;
                row.orderRateNumeric = general.toNumeric(_deal.orderRate);
                row.valueDate = self.getValueDate(_deal);

                row.slRate = ko.observable(_deal.slRate == 0 ? cEmptyRate : _deal.slRate);
                row.typeSL = dictionary.GetItem("limtype1_short");

                row.tpRate = ko.observable(_deal.tpRate == 0 ? cEmptyRate : _deal.tpRate);
                row.typeTP = dictionary.GetItem("limtype2_short");

                row.orderID = _deal.orderID;
                row.prevSpotRate = ko.observable(_deal.spotRate);
                row.spotRate = ko.observable(_deal.spotRate);
                row.fwPips = ko.observable(_deal.fwPips);
                row.hasAdditionalPL = ko.observable(_deal.hasAdditionalPL);
                row.prevClosingRate = ko.observable(_deal.closingRate);
                row.closingRate = ko.observable(_deal.closingRate);
                row.closeDealRate = ko.computed(function () {
                    return row.closingRate() ? row.closingRate().substring(0, row.closingRate().length - 2) : '0.';
                });
                row.closeDealRatePips = ko.computed(function () {
                    return row.closingRate() ? row.closingRate().substring(row.closingRate().length - 2, row.closingRate().length) : '00';
                });
                row.dialogTitleSLDealLimit = ko.computed(function () {
                    return (!general.isNumber(row.slRate()) || row.slRate() == 0) ? dictionary.GetItem('AddStopLossTitle', 'dialogsTitles', '') : dictionary.GetItem('UpdateRemoveStopLossTitle', 'dialogsTitles', '');
                });
                row.dialogTitleTpDealLimit = ko.computed(function () {
                    return (!general.isNumber(row.tpRate()) || row.tpRate() == 0) ? dictionary.GetItem('AddTakeProfitTitle', 'dialogsTitles', '') : dictionary.GetItem('UpdateRemoveTakeProfitTitle', 'dialogsTitles', '');
                });

                row.pl = ko.observable(!general.isStringType(_deal.pl) ? Number.toStr(_deal.pl) : _deal.pl);
                row.plNumeric = general.toNumeric(_deal.pl);
                row.plSign = ko.observable(Math.floor(general.toNumeric(_deal.pl)).sign());

                row.commission = ko.observable(!general.isStringType(_deal.commission) ? Number.toStr(_deal.commission) : _deal.commission);
                row.spreadDiscount = ko.observable(!general.isStringType(_deal.spreadDiscount) ? Number.toStr(_deal.spreadDiscount) : _deal.spreadDiscount);
                row.spreadDiscountConverted = ko.observable(!general.isStringType(_deal.spreadDiscount) ? Number.toStr(_deal.spreadDiscount) : _deal.spreadDiscount);
                row.grosspl = ko.computed(function () {
                    if (data.quoteForAccountCcyToUsdCcy() && customer.prop.selectedCcyId() !== customer.prop.baseCcyId()) {
                        var spreadDiscount = amountConverter.Convert(
                            general.toNumeric(row.spreadDiscount()),
                            data.quoteForAccountCcyToUsdCcy()
                        );

                        row.spreadDiscountConverted(!general.isStringType(spreadDiscount) ? Number.toStr(spreadDiscount.toFixed(2))
                            : spreadDiscount);
                    }
                    var discount = general.toNumeric(row.spreadDiscountConverted()) === 0 ? general.toNumeric(row.commission()) : -general.toNumeric(row.spreadDiscountConverted());

                    var grossPl = general.toNumeric(row.pl()) + discount;
                    return grossPl.toFixed(2);
                });

                row.OnCloseDealEnable = ko.observable(true);
                row.OnCloseDealClick = onCloseThisDeal;
                row.ThisDealSwipe = ko.observable(true);
                row.lastUpdate = ko.observable(quotesVM.GetQuote(_deal.instrumentID).dataTime());
                row.quoteIsActive = ko.observable(false);
                row.isStock = ko.observable(instrumentsManager.IsInstrumentStock(_deal.instrumentID));

                row.adj = ko.computed(function () {
                    if (customer.prop.dealPermit == eDealPermit.Islamic) {
                        return false;
                    }

                    if (_deal.valueDate.length === 0) {
                        return true;
                    }

                    return _deal.positionNumber != _deal.orderID;
                });

                row.isChecked = ko.observable(false);
                row.hasAdditionalPL = ko.observable(Number(_deal.additionalPL) !== 0);

                return row;
            };

            _prepareData();

            var publicAPI = {
                Init: init,
                OnCloseDealsEnable: data.onCloseDealsEnable,
                IsLoadingData: data.isLoadingData,
                IsRenderingData: data.isRenderingData,
                LastDealPosition: data.lastDealPosition,
                CurrentRenders: data.currentRenders,
                TotalEquity: data.totalEquity,
                SortProperties: data.sortConfig,
                SetSorting: setSorting,
                FlagsState: data.flagsState,
                HasValueDateColumn: data.hasValueDateColumn,
                HasRecords: hasRecords,
                Selection: data.selection,
                AvailableSelection: data.availableSelection,
                AllSelected: data.allSelected,
                QuoteForAccountCcyToUsdCcy: data.quoteForAccountCcyToUsdCcy,
                CloseMultipleDeals: closeMultipleDeals,
                CloseThisDeal: onCloseThisDeal,
                OnCloseDealReturn: onCloseDealReturn,
                Positions: data.positions,
                GetSelectedInstrument: getSelectedInstrument,
                IsActiveQuote: isActiveQuote,
                DealPermissions: dealPermissions,
                DealsList: data.dealsList,
                UpdateVdColumnVisibility: updateVdColumnVisibility,
                TotalOpenedDeals: data.totalOpenedDeals
            };

            return publicAPI;
        });

        return OpenDealsModule;
    }
);
