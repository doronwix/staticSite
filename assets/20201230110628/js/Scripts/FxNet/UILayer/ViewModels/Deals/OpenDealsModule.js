define(
    'viewmodels/Deals/OpenDealsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        "helpers/ObservableHashTable",
        'initdatamanagers/Customer',
        'devicemanagers/AlertsManager',
        'Dictionary',
        'cachemanagers/ClientStateHolderManager',
        'cachemanagers/dealsmanager',
        'initdatamanagers/InstrumentsManager',
        'generalmanagers/StatesManager',
        'helpers/ObservableHelper',
        'dataaccess/dalorder',
        'deviceviewmodels/BaseOrder',
        'viewmodels/QuotesSubscriber',
        'viewmodels/ViewModelBase',
        'cachemanagers/QuotesManager',
        "modules/BuilderForInBetweenQuote",
        'handlers/AmountConverter',
        'FxNet/LogicLayer/Deal/DealPermissions',
        "modules/GridSelectionModule",
        'viewmodels/OpenDealsViewModelBase',
        'global/storagefactory'
    ],
    function OpenDealsModuleDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            observableHashTable = require("helpers/ObservableHashTable"),
            customer = require('initdatamanagers/Customer'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary'),
            csHolderManager = require('cachemanagers/ClientStateHolderManager'),
            dealsManager = require('cachemanagers/dealsmanager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            statesManager = require('generalmanagers/StatesManager'),
            vmHelpers = require('helpers/ObservableHelper'),
            dalOrders = require('dataaccess/dalorder'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            quotesManager = require('cachemanagers/QuotesManager'),
            BuilderForInBetweenQuote = require("modules/BuilderForInBetweenQuote"),
            AmountConverter = require('handlers/AmountConverter'),
            dealPermissions = require('FxNet/LogicLayer/Deal/DealPermissions'),
            gridSelectionModule = require("modules/GridSelectionModule"),
            OpenDealsViewModelBase = require('viewmodels/OpenDealsViewModelBase'),
            storageFactory = require('global/storagefactory');

        var OpenDealsModule = general.extendClass(OpenDealsViewModelBase, function () {
            var self = this,
                observableOpenDealsCollection = new observableHashTable(ko, general, 'orderID', { enabled: true, sortProperty: 'positionNumber', asc: false }),
                quotesVM = new QuotesSubscriber(),
                // REBUILD_COLLECTION_SIZE = 2,
                onCloseThisDealEnable = ko.observable(true),
                onCloseDealsEnable = ko.observable(true),
                flagsState = {},
                baseOrder = new BaseOrder(),
                positions = {},
                inheritedInstance = general.clone(ViewModelBase),
                totalEquity = ko.observable(0),
                usdId = 47,
                quoteForAccountCcyToUsdCcy = ko.observable(null),
                isLoadingData = ko.observable(true),
                LS = storageFactory(storageFactory.eStorageType.local);

            function init(customSettings) {
                inheritedInstance.setSettings(self, customSettings);
                setDependencies();
                setFlagsState();

                onCloseThisDealEnable(true);
                registerToDispatcher();

                var accountCcyId = customer.prop.baseCcyId();
                if (accountCcyId !== usdId) {
                    BuilderForInBetweenQuote.GetInBetweenQuote(accountCcyId, usdId)
                        .then(function (response) {
                            quoteForAccountCcyToUsdCcy(response);
                            populateObservableCollection();
                        })
                        .done();
                } else {
                    populateObservableCollection();
                }

                quotesVM.Start();
            }

            function setDependencies() {
                if (inheritedInstance.getSettings(self).closeSelected) {
                    gridSelectionModule.apply(positions, observableOpenDealsCollection.Values, function (item) { return item.quoteIsActive() === true; });

                    var closeDealAfterConfirmation = function () {
                        var closeDealsConfig = {
                            failCallback: function () {
                                onCloseDealsEnable(true);
                            }
                        };

                        if (positions.CheckedItems().length > 0) {
                            onCloseDealsEnable(false);
                            return dalOrders.CloseDeals(positions.CheckedItems(), onCloseDealsReturn, closeDealsConfig);
                        }

                        return ErrorManager.onError("closeDealAfterConfirmation", "trying to close empty list of positions", eErrorSeverity.low);
                    };

                    var showMultipleDealsConfirmationAlert = function () {
                        var properties = {
                            selectedData: positions.CheckedItems(),
                            confirmationCloseDeal: closeDealAfterConfirmation
                        };

                        AlertsManager.UpdateAlert(AlertTypes.MultipleDealsClosedConfirmation, this.title, this.body, [], properties);
                        AlertsManager.PopAlert(AlertTypes.MultipleDealsClosedConfirmation);
                    };

                    positions.CloseSelected = function () {
                        if (statesManager.States.fxDenied() == true) {
                            baseOrder.ValidateOnlineTradingUser();
                            return;
                        }

                        if (!positions.HasSelections()) {
                            return;
                        }

                        if (LS.getItem('hideConfCloseDeals') == 'true') {
                            closeDealAfterConfirmation();
                        } else {
                            showMultipleDealsConfirmationAlert();
                        }
                    };
                }
            }

            function setFlagsState() {
                flagsState.isMarketClosed = statesManager.States.IsMarketClosed;
            }

            function registerToDispatcher() {
                dealsManager.OnDealsChange.Add(onDealsChange);
                dealsManager.OnDealsPLChange.Add(onDealsPLChange);
                csHolderManager.OnChange.Add(onClientStateChange);
                quotesManager.OnChange.Add(updateQuoteValues);
            }

            function populateObservableCollection() {
                isLoadingData(true);

                dealsManager.Deals.ForEach(function iterator(orderId, deal) {
                    var row = toObservableRow(deal);
                    observableOpenDealsCollection.Add(row);
                });

                isLoadingData(false);
            }

            function onDealsChange(items) {
                if (items) {
                    removeItems(items.removedItems);
                    updateItems(items.editedItems);
                    addNewItems(items.newItems);
                }
            }

            function updateQuoteValues() {
                for (var i = 0, ii = observableOpenDealsCollection.Values().length; i < ii; i++) {
                    var instrumentID = observableOpenDealsCollection.Values()[i].instrumentID;
                    var quote = quotesManager.Quotes.GetItem(instrumentID);

                    if (quote) {
                        observableOpenDealsCollection.Values()[i].quoteIsActive(quote.isActive());
                    }
                }
            }

            function onClientStateChange() {
                totalEquity(general.toNumeric(csHolderManager.CSHolder.equity));
            }

            function onDealsPLChange(updatedItems) {
                for (var i = 0, ii = updatedItems.dealsIDs.length; i < ii; i++) {
                    var observable = observableOpenDealsCollection.Get(updatedItems.dealsIDs[i]);

                    if (observable) {
                        var deal = dealsManager.Deals.GetItem(updatedItems.dealsIDs[i]);

                        if (deal) {
                            var delta = {
                                prevSpotRate: observable.spotRate(),
                                spotRate: deal.spotRate,
                                fwPips: deal.fwPips,
                                prevClosingRate: observable.closingRate(),
                                closingRate: deal.closingRate,
                                pl: deal.pl,
                                plNumeric: general.toNumeric(deal.pl),
                                plSign: Math.floor(general.toNumeric(deal.pl)).sign(),
                                lastUpdate: quotesVM.GetQuote(deal.instrumentID).dataTime(),
                                commission: deal.commission
                            };

                            observableOpenDealsCollection.Update(updatedItems.dealsIDs[i], delta);
                        }
                    }
                }
            }

            function removeItems(removedItems) {
                for (var i = 0; i < removedItems.length; i++) {
                    observableOpenDealsCollection.Remove(removedItems[i]);
                }
            }

            function updateItems(updatedItems) {
                for (var i = 0, ii = updatedItems.length; i < ii; i++) {
                    var deal = toObservableRow(dealsManager.Deals.GetItem(updatedItems[i]));

                    if (deal) {
                        observableOpenDealsCollection.Update(deal.orderID, deal);
                    }
                }
            }

            function addNewItems(newItems) {
                for (var i = 0, ii = newItems.length; i < ii; i++) {
                    var deal = toObservableRow(dealsManager.Deals.GetItem(newItems[i]));

                    if (deal) {
                        observableOpenDealsCollection.Add(deal);
                    }
                }
            }

            function onCloseThisDeal(deal) {
                var alert = alertsManager.GetAlert(AlertTypes.CloseDealAlert);

                if (alert.DisableThisAlertByCookie()) {
                    var arr = generateArrayForDal(observableOpenDealsCollection.Get(deal.orderID));

                    if (arr) {
                        deal.OnCloseDealEnable(false);
                        onCloseThisDealEnable(false);
                        dalOrders.CloseDeals([arr], onCloseDealReturn);
                    }
                }
                else {
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
            }

            function generateArrayForDal(observable) {
                var arr = null;

                if (observable) {
                    var tmpDealObj = ko.toJS(observable);

                    arr = vmHelpers.GeneratePrimitiveTypeArray(tmpDealObj);
                }

                return arr;
            }

            function onCloseDealReturn(result, callerID, requestData) {
                updateProcessingObservables(result, callerID, { requestData: requestData });
                observableOpenDealsCollection.Get(requestData.orderID).OnCloseDealEnable(true);
            }

            function onCloseDealsReturn(result, callerID, requestData) {
                positions.IsProcessing(false);
                updateProcessingObservables(result, callerID, general.extendType({ isCloseMultipleDealsCall: true }, { requestData: requestData }));
            }

            function updateProcessingObservables(result, callerID, args) {
                onCloseThisDealEnable(true);
                baseOrder.OnActionReturn(result, callerID, null, args);
                onCloseDealsEnable(true);
            }

            function toObservableRow(_deal) {
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
                    if (quoteForAccountCcyToUsdCcy() && customer.prop.selectedCcyId() !== customer.prop.baseCcyId()) {
                        var spreadDiscount = AmountConverter.Convert(general.toNumeric(row.spreadDiscount()),
                            quoteForAccountCcyToUsdCcy());

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
            }

            function getSelectedInstrument() {
                return instrumentsManager.GetUserDefaultInstrumentId();
            }

            function isActiveQuote() {
                var quote = quotesVM.GetQuote(getSelectedInstrument());
                return !general.isNullOrUndefined(quote) && quote.isActiveQuote();
            }

            var isValueDateColumnVisible = ko.pureComputed(function () {
                return ko.utils.arrayFirst(observableOpenDealsCollection.Values(), function (v) {
                    return !v.valueDate.isValueDateEmpty;
                });
            });

            var hasRecords = ko.pureComputed(function () {
                return 0 < observableOpenDealsCollection.Values().length;
            });

            var publicAPI = {
                Init: init,
                OpenDeals: observableOpenDealsCollection.Values,
                HasRecords: hasRecords,
                FlagsState: flagsState,
                CloseThisDeal: onCloseThisDeal,
                CloseThisDealEnable: onCloseThisDealEnable,
                OnCloseDealReturn: onCloseDealReturn,
                OnCloseDealsEnable: onCloseDealsEnable,
                SetSorting: observableOpenDealsCollection.SetSorting,
                Positions: positions,
                TotalEquity: totalEquity,
                GetSelectedInstrument: getSelectedInstrument,
                IsActiveQuote: isActiveQuote,
                IsValueDateColumnVisible: isValueDateColumnVisible,
                SortProperties: observableOpenDealsCollection.SortProperties,
                IsLoadingData: isLoadingData,
                DealPermissions: dealPermissions
            };

            return publicAPI;
        });

        return OpenDealsModule;
    }
);
