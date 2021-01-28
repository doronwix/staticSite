define(
    'deviceviewmodels/EditFavoriteInstrumentsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        "helpers/ObservableHashTable",
        'helpers/KoComponentViewModel',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'modules/FavoriteInstrumentsManager',
        'configuration/initconfiguration',
        'devicemanagers/ViewModelsManager',
        'LoadDictionaryContent!EditFavoriteInstruments'
    ],
    function EditFavoriteInstrumentsDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            observableHashTable = require("helpers/ObservableHashTable"),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            initConfiguration = require('configuration/initconfiguration'),
            InstrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            FavoriteInstrumentsManager = require('modules/FavoriteInstrumentsManager'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            vmQuotesPreset = viewModelsManager.VmQuotesPreset;

        var EditFavoriteInstrumentsViewModel = general.extendClass(koComponentViewModel, function EditFavoriteInstrumentsClass() {
            var parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data, // inherited from KoComponentViewModel
                favoritesCollection = new observableHashTable(ko, general, 'id'),
                instrumentsList = new observableHashTable(ko, general, 'id', { enabled: true, sortProperty: 'ccyPair', asc: false }),
                maxRowsToDisplay;

            //----------------------------------------------------------------
            function init(settings) {
                maxRowsToDisplay = settings.favoriteInstrumentsLimit;

                setObservables();
                setSubscribers();
            }

            //----------------------------------------------------------------
            function setObservables() {
                data.isFavoriteListVisible = ko.observable(true);

                setFaviroteInstrumentList();
                setFavoritesCollection();
            }

            //----------------------------------------------------------------
            function setSubscribers() {
                ko.postbox.subscribeSingleton('edit-favorite-instruments-search-result', function (result) {
                    result = result || {};
                    data.isFavoriteListVisible(!result.hasResults);
                });
            }

            //----------------------------------------------------------------
            function getFavoriteInstrumentIdsToDisplay() {
                var favoriteInstrumentIds = FavoriteInstrumentsManager.GetFavoriteInstrumentIds(),
                    maxLenght = favoriteInstrumentIds.length;

                if (maxRowsToDisplay) {
                    maxRowsToDisplay = general.toNumeric(maxRowsToDisplay);
                    maxLenght = Math.min(maxLenght, maxRowsToDisplay);
                }

                return favoriteInstrumentIds.slice(0, maxLenght);
            }

            //----------------------------------------------------------------
            function setFavoritesCollection() {
                var favoriteInstrumentIds = getFavoriteInstrumentIdsToDisplay();

                if (!favoriteInstrumentIds) {
                    return;
                }

                var length = favoriteInstrumentIds.length || 0;

                favoritesCollection.Clear();

                for (var i = 0; i < length; i++) {
                    var insrumentId = favoriteInstrumentIds[i],
                        instrument = instrumentsList.Get(insrumentId);

                    if (!instrument) {
                        continue;
                    }

                    var instrumentToAdd = {
                        id: instrument.id,
                        baseSymbolId: instrument.baseSymbol,
                        otherSymbolId: instrument.otherSymbol,
                        fullInstrumentList: instrumentsList.Values
                    };

                    setNonCustomPresetInfo(instrumentToAdd);
                    favoritesCollection.Add(instrumentToAdd);
                }
            }

            function setNonCustomPresetInfo(instrument) {
                var presets = InstrumentsManager.GetPresetsForInstrument(instrument.id),
                    presetId;

                var presetFound = presets.some(function (id) {
                    if (vmQuotesPreset.IsSearchPreset(id)) {
                        presetId = parseInt(id);
                        return true;
                    }
                });

                if (presetFound) {
                    instrument.presetLabel = vmQuotesPreset.GetPreset(presetId).Label;
                }
            }

            function setFaviroteInstrumentList() {
                var instrument,
                    ccyPair,
                    instrumentIds = InstrumentsManager.GetInstrumentIds(),
                    favoriteInstrumentIds = FavoriteInstrumentsManager.GetFavoriteInstrumentIds();

                for (var i = 0, ii = instrumentIds.length; i < ii; i++) {
                    var instrumentId = instrumentIds[i];

                    if (favoriteInstrumentIds[instrumentId]) {
                        continue;
                    }

                    instrument = InstrumentsManager.GetInstrument(instrumentId);
                    ccyPair = InstrumentTranslationsManager.Short(instrumentId);

                    instrumentsList.Add({
                        id: instrument.id,
                        baseSymbol: instrument.baseSymbol,
                        otherSymbol: instrument.otherSymbol,
                        ccyPair: ccyPair
                    });
                }
            }

            //----------------------------------------------------------------
            function onFavoriteInstrumentSelected(instrument) {
                if (!instrument || !instrument.id || instrument.id === -1) {
                    return;
                }

                if (FavoriteInstrumentsManager.IsFavoriteInstrument(instrument.id)) {
                    removeInstrument(instrument.id);
                } else {
                    addInstrument(instrument);
                }
            }

            //----------------------------------------------------------------
            function addInstrument(instrument) {
                if (!instrument) {
                    return;
                }

                favoritesCollection.AddAt(0, {
                    id: instrument.id,
                    baseSymbolId: instrument.baseSymbolId,
                    otherSymbolId: instrument.otherSymbolId,
                    fullInstrumentList: instrumentsList.Values
                });

                FavoriteInstrumentsManager.AddFavoriteInstrument(instrument.id);

                ko.postbox.publish("favorite-instrument-update", { instrumentId: instrument.id, isAddInstrument: true });
            }

            //----------------------------------------------------------------
            function removeInstrument(instrumentId) {
                favoritesCollection.Remove(instrumentId);
                FavoriteInstrumentsManager.RemoveFavoriteInstrument(instrumentId);

                ko.postbox.publish("favorite-instrument-update", { instrumentId: instrumentId, isRemoveInstrument: true });
            }

            //----------------------------------------------------------------
            function updateFavoriteInstrumentsUIOrder() {
                var favoritesInNewOrder = favoritesCollection.Values().map(function (instrument) { return instrument.id; });
                FavoriteInstrumentsManager.ChangeUIOrder(favoritesInNewOrder, false);

                ko.postbox.publish("favorite-instruments-reorder-drop");
            }

            //----------------------------------------------------------------
            function dispose() {
                favoritesCollection.Clear();
                instrumentsList.Clear();
            }

            //----------------------------------------------------------------
            return {
                init: init,
                dispose: dispose,
                Data: data,
                FavoritesCollection: favoritesCollection.Values,
                RemoveInstrument: removeInstrument,
                UpdateFavoriteInstrumentsUIOrder: updateFavoriteInstrumentsUIOrder,
                FavoriteInstrumentSelected: onFavoriteInstrumentSelected
            };
        });

        function createViewModel() {
            var viewModel = new EditFavoriteInstrumentsViewModel();

            viewModel.init(initConfiguration.FavoriteInstrumentsConfiguration);

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
