define(
    'devicealerts/CloseDealConfirmationAlert',
    [
        'require',
        'knockout',
        'devicealerts/Alert',
        'Dictionary',
        'initdatamanagers/InstrumentsManager',
        'global/storagefactory'
    ],
    function CloseDealConfirmaionAlertDef(require) {
        var ko = require('knockout'),
            alertBase = require('devicealerts/Alert'),
            storageFactory = require('global/storagefactory'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            dictionary = require('Dictionary');

        var CloseDealConfirmaionAlert = function CloseDealConfirmaionAlertClass() {
            var inheritedAlertInstance = new alertBase(),
                LS = storageFactory(storageFactory.eStorageType.local);

            function init() {
                inheritedAlertInstance.alertName = 'CloseDealConfirmationAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = prepareForShow;
                inheritedAlertInstance.hideConfirmation = ko.observable(false);
                inheritedAlertInstance.dontshowagain = dictionary.GetItem('dontshowagain');
                inheritedAlertInstance.title(dictionary.GetItem('CloseDeal'));
                inheritedAlertInstance.body(dictionary.GetItem('closeSingleDealAlert'));
            }

            function getInstrumentData(instrumentId) {
                var instrument = instrumentsManager.GetInstrument(instrumentId);

                return {
                    instrumentId: instrument.id,
                    baseSymbolId: instrument.baseSymbolId,
                    otherSymbolId: instrument.otherSymbolId
                };
            }

            function prepareForShow() {
                var self = this;

                this.selectedData = this.properties.selectedData;
                this.getInstrumentData = getInstrumentData;

                this.confirmationCloseDeal = function onConfirmationCloseDeal() {
                    if (inheritedAlertInstance.hideConfirmation()) {
                        LS.setItem('hideConfCloseDeals', 'true');
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

        return CloseDealConfirmaionAlert;
    }
);

