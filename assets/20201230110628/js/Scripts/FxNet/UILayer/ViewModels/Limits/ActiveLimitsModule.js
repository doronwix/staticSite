define(
    'viewmodels/Limits/ActiveLimitsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        "helpers/ObservableHashTable",
        'devicemanagers/ViewModelsManager',
        'cachemanagers/activelimitsmanager',
        'managers/instrumentTranslationsManager',
        'dataaccess/dalorder',
        'configuration/initconfiguration',
        'viewmodels/QuotesSubscriber',
        'deviceviewmodels/BaseOrder',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dictionary = require('Dictionary'),
            observableHashTable = require("helpers/ObservableHashTable"),
            activeLimitsManager = require('cachemanagers/activelimitsmanager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            dalOrders = require('dataaccess/dalorder'),
            activeLimitsConfiguration = require('configuration/initconfiguration').ActiveLimitsConfiguration,
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            ViewModelBase = require('viewmodels/ViewModelBase');

        function ActiveLimitsModule() {
            var self,
                observableActiveLimitsCollection = new observableHashTable(ko, general, 'orderID', { enabled: true, sortProperty: 'orderID', asc: false }),
                quotesVM = new QuotesSubscriber(),
                baseOrder = new BaseOrder(),
                inheritedInstance = general.clone(ViewModelBase),
                dataInfo = {},
                dataInfoExp = {},
                isLoadingData = ko.observable(true);

            var init = function (customSettings) {
                self = this;
                inheritedInstance.setSettings(self, customSettings);
                baseOrder.Init({}, observableActiveLimitsCollection);
                dataInfo.Data = observableActiveLimitsCollection.Values;
                dataInfo.ShowPager = ko.observable(false);

                registerToDispatcher();
                populateObservableCollection();
                quotesVM.Start();
            };

            var registerToDispatcher = function () {
                activeLimitsManager.OnChange.Add(onChange);
            };

            var populateObservableCollection = function () {
                isLoadingData(true);

                var defaultLimitMode = inheritedInstance.getSettings(self).defaultLimitMode;

                activeLimitsManager.limits.ForEach(function iterator(orderId, limit) {
                    if (defaultLimitMode === eLimitMode.None || defaultLimitMode == limit.mode) { //List of open limits only      
                        var row = toObservableRow(limit);
                        observableActiveLimitsCollection.Add(row);
                    }
                });

                isLoadingData(false);
            };

            var onChange = function (items) {
                if (items) {
                    removeItems(items.removedLimits);
                    updateItems(items.editedLimits);
                    addNewItems(items.newLimits);
                }
            };

            var removeItems = function (removedLimits) {
                for (var i = 0; i < removedLimits.length; i++) {
                    observableActiveLimitsCollection.Remove(removedLimits[i]);
                }
            };

            var updateItems = function (updatedItems) {
                var defaultLimitMode = inheritedInstance.getSettings(self).defaultLimitMode;

                for (var i = 0, length = updatedItems.length; i < length; i++) {
                    var limit = toObservableRow(activeLimitsManager.limits.GetItem(updatedItems[i]));
                    if (defaultLimitMode === eLimitMode.None || defaultLimitMode == limit.mode) {

                        observableActiveLimitsCollection.Update(limit.orderID, limit);
                    }
                }
            };

            var addNewItems = function (newItems) {
                if (newItems && newItems.length) {
                    for (var i = 0, length = newItems.length; i < length; i++) {
                        var limit = toObservableRow(activeLimitsManager.limits.GetItem(newItems[i]));
                        if (inheritedInstance.getSettings(self).defaultLimitMode === eLimitMode.None || inheritedInstance.getSettings(self).defaultLimitMode == limit.mode) {
                            observableActiveLimitsCollection.Add(limit);
                        }
                    }
                }
            };

            var onRemoveLimit = function (data) {
                var limit = activeLimitsManager.limits.GetItem(data.orderID);
                if (limit) {
                    data.isRemoving(true);
                    dalOrders.DeleteLimit(limit, onRemoveLimitReturn);
                }
            };

            //------------------------------------------------------------

            var onRemoveLimitReturn = function (result, callerId, requestData) {
                baseOrder.ShowMessageResult(result, callerId, null, requestData);

                if (general.isDefinedType(observableActiveLimitsCollection.Get(result[0].itemId).isRemoving)) {
                    observableActiveLimitsCollection.Get(result[0].itemId).isRemoving(false);
                }
            };

            var toObservableRow = function (limit) {
                return {
                    instrumentName: ko.observable(instrumentTranslationsManager.Long(limit.instrumentID)),
                    instrumentID: limit.instrumentID,
                    isInactiveQuote: quotesVM.GetQuote(limit.instrumentID).isInactive,
                    baseSymbol: limit.baseSymbol,
                    otherSymbol: limit.otherSymbol,
                    orderID: limit.orderID,
                    positionNumber: limit.positionNumber == 0 ? "" : limit.positionNumber,
                    accountNumber: limit.accountNumber,
                    orderDir: limit.orderDir,
                    orderRate: limit.orderRate,
                    orderRateNumeric: general.toNumeric(limit.orderRate),
                    buySymbolID: limit.buySymbolID,
                    buyAmount: limit.buyAmount,
                    sellSymbolID: limit.sellSymbolID,
                    sellAmount: limit.sellAmount,
                    limitAmount: limit.orderDir == eOrderDir.Sell ? limit.sellAmount : limit.buyAmount,
                    type: limit.type,
                    mode: limit.mode,
                    expirationDate: general.isEmptyValue(limit.expirationDate) ? dictionary.GetItem("GoodTillCancel") : limit.expirationDate,
                    entryTime: limit.entryTime,
                    slRate: limit.slRate,  // to do remove toRate function
                    tpRate: limit.tpRate,
                    otherLimitID: limit.otherLimitID,
                    ThisDealSwipe: ko.observable(true),
                    typeTP_abrv: dictionary.GetItem("limtype2_short"),
                    typeTP: dictionary.GetItem("limtype2"),
                    typeSL_abrv: dictionary.GetItem("limtype1_short"),
                    typeSL: dictionary.GetItem("limtype1"),
                    rateDirIsUp: quotesVM.GetQuote(limit.instrumentID).rateDirIsUp,
                    rateDirIsDown: quotesVM.GetQuote(limit.instrumentID).rateDirIsDown,
                    isEditable: limit.mode === eLimitMode.OpenDeal,
                    isRemoving: ko.observable(false)
                };
            };

            var applyFilter = function () { };

            var hasRecords = ko.pureComputed(function () {
                return 0 < dataInfo.Data().length;
            });

            return {
                init: init,
                DataInfo: dataInfo,
                DataInfoExp: dataInfoExp,
                RemoveLimit: onRemoveLimit,
                SetSorting: observableActiveLimitsCollection.SetSorting,
                SortProperties: observableActiveLimitsCollection.SortProperties,
                Refresh: populateObservableCollection,
                IsLoadingData: isLoadingData,
                ApplyFilter: applyFilter,
                HasRecords: hasRecords
            };
        }

        var instance = new ActiveLimitsModule();
        instance.init(activeLimitsConfiguration);

        return instance;
    }
);
