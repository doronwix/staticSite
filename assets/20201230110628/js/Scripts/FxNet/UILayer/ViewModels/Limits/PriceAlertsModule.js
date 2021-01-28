define(
    'viewmodels/Limits/PriceAlertsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'devicemanagers/ViewModelsManager',
        'cachemanagers/activelimitsmanager',
        'managers/instrumentTranslationsManager',
        'dataaccess/dalorder',
        'cachemanagers/QuotesManager',
        'deviceviewmodels/BaseOrder',
        'viewmodels/ViewModelBase',
        'modules/GridSelectionModule',
        'initdatamanagers/InstrumentsManager',
        'helpers/ObservableHashTable',
        'enums/alertenums',
        'devicemanagers/AlertsManager',
        'Dictionary',
        'modules/permissionsmodule',
        'global/storagefactory'
    ],
    function PriceAlertsModuleDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            activeLimitsManager = require('cachemanagers/activelimitsmanager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            dalOrders = require('dataaccess/dalorder'),
            quotesManager = require('cachemanagers/QuotesManager'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            gridSelectionModule = require('modules/GridSelectionModule'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            observableHashTable = require('helpers/ObservableHashTable'),
            alertTypes = require('enums/alertenums'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary'),
            permissionsModule = require('modules/permissionsmodule'),
            storageFactory = require('global/storagefactory');

        function PriceAlertsModule() {
            var self,
                observableCollection = new observableHashTable(ko, general, 'orderID', { enabled: true, sortProperty: 'orderID', asc: false }),
                baseOrder = new BaseOrder(),
                inheritedInstance = general.clone(ViewModelBase),
                dataInfo = {},
                positions = {},
                isLoadingData = ko.observable(true),
                LS = storageFactory(storageFactory.eStorageType.local);

            function init() {
                self = this;
                inheritedInstance.setSettings(self, {});
                baseOrder.Init({}, observableCollection);
                dataInfo.Data = observableCollection.Values;
                dataInfo.ShowPager = ko.observable(false);

                createSelectionOptions();
                registerToDispatcher();
                populateObservableCollection();
            }

            function registerToDispatcher() {
                activeLimitsManager.OnChange.Add(onChange);
                quotesManager.OnChange.Add(updateQuoteValues);
            }

            function createSelectionOptions() {
                gridSelectionModule.apply(positions, dataInfo.Data);
            }

            function updateQuoteValues() {
                for (var i = 0, ii = observableCollection.Values().length; i < ii; i++) {
                    var instrumentID = observableCollection.Values()[i].instrumentID;
                    var quote = quotesManager.Quotes.GetItem(instrumentID);

                    if (quote) {
                        observableCollection.Values()[i].currentRate(observableCollection.Values()[i].orderDir == eOrderDir.Sell ? quote.bid : quote.ask);
                    }
                }
            }

            function closedPriceAlertAfterConfirmation(priceAlerts) {
                if (priceAlerts) {
                    return dalOrders.DeletePriceAlerts(priceAlerts, onRemovePriceAlertReturn);
                }

                return ErrorManager.onError('closePriceAlertAfterConfirmation', 'trying to close empty list of price alerts', eErrorSeverity.low);
            }

            function populateObservableCollection() {
                isLoadingData(true);

                activeLimitsManager.GetPriceAlerts().ForEach(function iterator(orderId, priceAlert) {

                    var row = toObservableRow(priceAlert);
                    observableCollection.Add(row);

                });

                isLoadingData(false);
            }

            function onChange(items) {
                if (items) {
                    removeItems(items.removedLimits);
                    updateItems(items.editedLimits);
                    addNewItems(items.newLimits);
                }
            }

            function removeItems(removedLimits) {
                for (var i = 0; i < removedLimits.length; i++) {
                    observableCollection.Remove(removedLimits[i]);
                }
            }

            function updateItems(updatedItems) {
                for (var i = 0, length = updatedItems.length; i < length; i++) {
                    var priceAlert = toObservableRow(activeLimitsManager.GetPriceAlerts().GetItem(updatedItems[i]));

                    if (priceAlert) {
                        observableCollection.Update(priceAlert.orderID, priceAlert);
                    }
                }
            }

            function addNewItems(newItems) {
                if (newItems && newItems.length) {
                    for (var i = 0, length = newItems.length; i < length; i++) {
                        var priceAlert = toObservableRow(activeLimitsManager.GetPriceAlerts().GetItem(newItems[i]));
                        if (priceAlert) {
                            observableCollection.Add(priceAlert);
                        }
                    }
                }
            }

            function onRemovePriceAlert(data) {
                if (!permissionsModule.CheckPermissions('addEditRemovePriceAlert')) {
                    alertsManager.UpdateAlert(alertTypes.ServerResponseAlert, null, dictionary.GetItem('Forbidden'), null);
                    alertsManager.PopAlert(alertTypes.ServerResponseAlert);
                    return;
                }

                if (data === null) {
                    data = positions.CheckedItems()
                }
                else {
                    data = [data];
                }

                var priceAlerts = [];
                var currentPriceAlerts = activeLimitsManager.GetPriceAlerts();

                for (var i = 0; i < data.length; i++) {
                    var pa = currentPriceAlerts.GetItem(data[i].orderID);

                    if (pa) {
                        pa.limitRate = pa.orderRate;
                        priceAlerts.push(pa);
                    }
                }

                if (priceAlerts.length > 0) {
                    if (LS.getItem('hideConfRemovePAlerts') == true) {
                        closedPriceAlertAfterConfirmation(priceAlerts);
                    }
                    else {
                        baseOrder.ShowAlert(
                            alertTypes.MultiplePriceAlertsClosedConfirmation,
                            this.title,
                            this.body,
                            {
                                selectedData: priceAlerts,
                                confirmationCloseDeal: function () {
                                    closedPriceAlertAfterConfirmation(priceAlerts)
                                }
                            }
                        );
                    }
                }
            }

            function onRemovePriceAlertReturn(result, callerId, requestData) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].status !== eResult.Success) {
                        //Temporary general error for all failures coming from server. 
                        //In the future, needs to switch case data.result
                        result[i].msgKey = 'OrderError23';
                        result[i].result = 'OrderError23';
                    }
                }

                baseOrder.ShowMessageResult(result, callerId, null, requestData);
            }

            function getSelectedInstrument() {
                return instrumentsManager.GetUserDefaultInstrumentId();
            }

            function toObservableRow(priceAlert) {
                if (!priceAlert) {
                    return;
                }

                return {
                    instrumentName: ko.observable(instrumentTranslationsManager.Long(priceAlert.instrumentID)),
                    instrumentID: priceAlert.instrumentID,

                    orderID: priceAlert.orderID,
                    positionNumber: priceAlert.positionNumber == 0 ? '' : priceAlert.positionNumber,

                    orderDir: priceAlert.orderDir,
                    orderRate: priceAlert.orderRate,
                    orderRateNumeric: general.toNumeric(priceAlert.orderRate),

                    priceAlertAmount: priceAlert.orderDir == eOrderDir.Sell ? priceAlert.sellAmount : priceAlert.buyAmount,
                    type: priceAlert.type,
                    mode: priceAlert.mode,
                    expirationDate: priceAlert.expirationDate,
                    entryTime: priceAlert.entryTime,
                    isChecked: ko.observable(false),
                    currentRate: ko.observable(priceAlert.orderDir == eOrderDir.Sell
                        ? quotesManager.Quotes.GetItem(priceAlert.instrumentID).bid
                        : quotesManager.Quotes.GetItem(priceAlert.instrumentID).ask)

                };
            }

            function applyFilter() { }

            var hasRecords = ko.pureComputed(function () {
                return 0 < dataInfo.Data().length;
            });

            return {
                init: init,
                DataInfo: dataInfo,
                RemovePriceAlert: onRemovePriceAlert,
                SetSorting: observableCollection.SetSorting,
                SortProperties: observableCollection.SortProperties,
                Refresh: populateObservableCollection,
                IsLoadingData: isLoadingData,
                ApplyFilter: applyFilter,
                HasRecords: hasRecords,
                Positions: positions,
                GetSelectedInstrument: getSelectedInstrument
            };
        }

        var instance = new PriceAlertsModule();
        instance.init();

        return instance;
    }
);