define(
    "alerts/MultipleDealsClosedConfirmation",
    [
        "require",
        "knockout",
        'handlers/general',
        'devicealerts/Alert',
        'initdatamanagers/InstrumentsManager',
        "Dictionary"
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert'),
            ko = require("knockout"),
            general = require('handlers/general'),
            Dictionary = require("Dictionary"),
            $instrumentsManager = require('initdatamanagers/InstrumentsManager');

        var MultipleDealsClosedConfirmation = function () {
            var inheritedAlertInstance = new AlertBase(),
                LS = StorageFactory(StorageFactory.eStorageType.local);

            function init() {
                inheritedAlertInstance.alertName = 'alerts/MultipleDealsClosedConfirmation';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = prepareForShow;
                inheritedAlertInstance.hideConfirmation = ko.observable(false);
                inheritedAlertInstance.lblChecked = Dictionary.GetItem('dontshowagain');
            }

            function getInstrumentData(instrumentId) {
                var instrument = $instrumentsManager.GetInstrument(instrumentId);

                return {
                    instrumentId: instrument.id,
                    baseSymbolId: instrument.baseSymbol,
                    otherSymbolId: instrument.otherSymbol
                };
            }

            function prepareForShow() {
                var self = this,
                    storageName =  !general.isEmptyValue(this.properties.selectedData) &&
                                    this.properties.selectedData[0].mode === eLimitMode.PriceAlert ?
                                    'hideConfRemovePAlerts' : 'hideConfCloseDeals';
                this.selectedData = this.properties.selectedData || [];

                this.getInstrumentData = getInstrumentData;
                this.confirmationCloseDeal = function () {
                    if (inheritedAlertInstance.hideConfirmation()) {
                        LS.setItem(storageName, 'true');
                    }

                    inheritedAlertInstance.visible(false);
                    self.properties.confirmationCloseDeal();
                };
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return MultipleDealsClosedConfirmation;
    }
);