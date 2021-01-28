define(
    'viewmodels/BaseInstrumentSearchViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/ViewModelsManager',
        'Dictionary'
    ],
    function BaseInstrumentSearchDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            vmQuotesPreset = viewModelsManager.VmQuotesPreset;

        var BaseInstrumentSearchViewModel = general.extendClass(koComponentViewModel, function BaseInstrumentSearchClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                defaultMinLenght = 2;

            function init(settings) {
                parent.init.call(self, settings);

                setObservables();
                setValues(settings);
                setSubscribers();
            }

            function setObservables() {
                data.list = vmQuotesPreset.SearchInstrumentsObservable;
                data.searchMinLength = ko.observable(vmQuotesPreset.SingleCharSearch() ? 1 : defaultMinLenght);
                data.selected = ko.observable({});
                data.instrumentsList = ko.observableArray([]);
                data.favouritePreset = ko.observable(false);
            }

            function setValues(settings) {
                setDefaultInstruments();

                data.selectedInstrumentId = settings.selectedInstrumentId;
                data.suffixId = settings.suffixId;
                data.searchPostBoxTopic = settings.searchPostBoxTopic;
            }

            function setSubscribers() {
                self.subscribeTo(data.selected, onSelectedInstrumentChanged);

                instrumentsManager.OnFavoritesPresetChanged.Add(setDefaultInstruments);
            }

            function onSelectedInstrumentChanged(instrument) {
                if (!instrument || !instrument.id || instrument.id <= -1) {
                    return;
                }

                if (general.isFunctionType(data.selectedInstrumentId)) {
                    data.selectedInstrumentId(instrument.id);
                }
            }

            function setDefaultInstruments() {
                var quotesUIorder,
                    instruments = instrumentsManager.GetFavoriteInstruments();

                if (instruments.length === 0) {
                    instruments = instrumentsManager.GetMainMostPopularInstruments();
                    quotesUIorder = instrumentsManager.GetPresetInstruments(instrumentsManager.GetMainMostPopularPresetId());
                } else {
                    quotesUIorder = instrumentsManager.GetCustomizedUiOrder();
                    data.favouritePreset(true);
                }
                instrumentsManager.SetQuotesUIOrder(quotesUIorder, false, eRegistrationListName.Search);
                data.instrumentsList(addPresetInfo(instruments));
            }

            function addPresetInfo(instruments) {
                for (var idxInstrument = 0; idxInstrument < instruments.length; idxInstrument++) {
                    var instrument = instruments[idxInstrument];
                    var presets = instrumentsManager.GetPresetsForInstrument(instrument.id);

                    var presetId;
                    var presetFound = presets.some(function (id) {
                        if (vmQuotesPreset.IsSearchPreset(id)) {
                            presetId = parseInt(id);
                            return true;
                        }
                    });

                    presetId = presetFound ? presetId : instrument.presetId;
                    instrument.presetLabel = vmQuotesPreset.GetPreset(presetId).Label;
                }

                return instruments;
            }

            function dispose() {
                instrumentsManager.OnFavoritesPresetChanged.Remove(setDefaultInstruments);

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose
            };
        });

        return BaseInstrumentSearchViewModel;
    }
);
