'use strict';
define(
    'viewmodels/QuotesPresetViewModel',
    [
        'knockout',
        'viewmodels/ViewModelBase',
        'managers/PresetCollectionBuilder',
        'managers/PresetCategoryBuilder',
        'modules/PresetsManager',
        'modules/FavoriteInstrumentsManager',
        'initdatamanagers/InitialDataManager',
        'managers/CustomerProfileManager',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'managers/viewsmanager',
        'FxNet/Common/Constants/Collections/PresetsDefinitions',
        'handlers/general'
    ],
    function QuotesPresetViewModel() {
        var self = {},
            observableObject = {},
            ko = require('knockout'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            general = require('handlers/general'),
            inheritedInstance = general.clone(ViewModelBase),
            presetCollectionBuilder = require('managers/PresetCollectionBuilder'),
            presetCategoryBuilder = require('managers/PresetCategoryBuilder'),
            PresetsManager = require('modules/PresetsManager'),
            FavoriteInstrumentsManager = require('modules/FavoriteInstrumentsManager'),
            InitialDataManager = require('initdatamanagers/InitialDataManager'),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            InstrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            ViewsManager = require('managers/viewsmanager'),
            lastPresetIdToSelect = -1,
            maxInitialDataCategories = 2,
            searchInstruments = ko.observable([]),
            singleCharSearch = ko.observable(false),
            presetsDefinitions = require('FxNet/Common/Constants/Collections/PresetsDefinitions'),
            editFavoriteVisible = ko.observable(false);

        function init(customSettings) {
            inheritedInstance.setSettings(self, customSettings);

            setDefaultObservables();
            setComputables();
            setSubscribers();
            setPresetSubscribers();

            buildAndSelect();
        }

        function buildAndSelect() {
            var selectedPresetId = observableObject.SelectedId() || InitialDataManager.prop.initialScreen.screenId;
            var availableCfdScreens = PresetsManager.GetAvailableScreens();

            buildCollections(availableCfdScreens);
            selectPreset(selectedPresetId);

            setSearchInstruments();
        }

        //---------------------------------------------------------
        function isSearchPreset(presetId) {
            var presetIdNum = parseInt(presetId);

            for (var idx = 0; idx < presetsDefinitions.length; idx++) {
                if (0 <= presetsDefinitions[idx].searchPresetIds.indexOf(presetIdNum)) {
                    return true;
                }
            }

            return false;
        }

        //---------------------------------------------------------
        function setSearchInstruments() {
            var instrumentsUiOrder = InstrumentsManager.GetInstrumentIds(),
                presets = InstrumentsManager.GetPresetInstruments();

            var mappedInstruments = instrumentsUiOrder.map(function (instrumentId) {
                //search for preset having instrument
                var presetIdsHavingInstrument = [];

                for (var presetId in presets) {
                    if (!presets.hasOwnProperty(presetId)) {
                        continue;
                    }

                    var presetInstruments = presets[presetId];
                    if (0 <= presetInstruments.findIndex(function (instrument) {
                        return instrument[0] === instrumentId;
                    })) {
                        presetIdsHavingInstrument.push(presetId);
                    }
                }

                if (presetIdsHavingInstrument.length === 0) {
                    return null;
                }

                //search preset for instrument first on searchPresetIds and if not use last one all available presets list
                var instrumentPresetId = presetIdsHavingInstrument.find(isSearchPreset) || presetIdsHavingInstrument[presetIdsHavingInstrument.length - 1];

                var instrumentInfo = InstrumentsManager.GetInstrument(instrumentId),
                    presetInfo = getPreset(instrumentPresetId);

                var instrumentTranslationShort = InstrumentTranslationsManager.Short(instrumentId),
                    instrumentTranslationLong = InstrumentTranslationsManager.Long(instrumentId),
                    fullText = InstrumentTranslationsManager.GetFullTextLatinized(instrumentId),
                    translatedInstrument = InstrumentTranslationsManager.GetTranslatedInstrumentById(instrumentId);

                if (instrumentTranslationLong.length < 2) {
                    singleCharSearch(true);
                }

                return {
                    id: instrumentId,
                    baseSymbolId: instrumentInfo.baseSymbol,
                    otherSymbolId: instrumentInfo.otherSymbol,
                    shortTranslation: instrumentTranslationShort,
                    value: instrumentTranslationLong,
                    fullText: fullText,
                    category: Dictionary.GetItem(presetInfo.CategoryNameKey, 'PresetsCategories') + ' - ' + presetInfo.Label,
                    presetId: presetInfo.Id,

                    instrumentName: instrumentTranslationLong,
                    symbolName: translatedInstrument.baseSymbolName,
                    fullName: InstrumentTranslationsManager.GetTooltipByInstrumentId(instrumentId),
                    ccyOrder: instrumentsUiOrder.indexOf(instrumentId)
                };
            });

            mappedInstruments = mappedInstruments.filter(function (instrument) { return instrument !== null; });

            searchInstruments(mappedInstruments);
        }

        function isDynamicPreset(selectedPresetId) {
            var presetIdNum = parseInt(selectedPresetId);

            for (var idx = 0; idx < presetsDefinitions.length; idx++) {
                if (0 <= presetsDefinitions[idx].ascOrderPresetIds.indexOf(presetIdNum)
                    || 0 <= presetsDefinitions[idx].descOrderPresetIds.indexOf(presetIdNum)
                    || presetIdNum === presetsDefinitions[idx].presets.PresetMostPopularCurrencies
                    || presetIdNum === presetsDefinitions[idx].presets.CurrenciesHot) {
                    return true;
                }
            }

            return false;
        }

        function isFavouritePreset(presetId) {
            var presetIdNum = parseInt(presetId);

            for (var idx = 0; idx < presetsDefinitions.length; idx++) {
                if (presetIdNum === presetsDefinitions[idx].presets.PresetCustomized) {
                    return true;
                }
            }

            return false;
        }

        function equalPresetInstruments(selectedPresetInstruments, newPresetInstruments) {
            if (selectedPresetInstruments.length !== newPresetInstruments.length) {
                return false;
            }

            for (var i = 0; i < newPresetInstruments.length; i++) {
                if (newPresetInstruments[i][0] !== selectedPresetInstruments[i].instrumentId) {
                    return false;
                }
            }
            return true;
        }

        function equalPresets(newPresets, actualPresets) {
            if (general.isNullOrUndefined(newPresets) || general.isNullOrUndefined(actualPresets)) {
                return false;
            }

            actualPresets = actualPresets.filter(function (preset) {
                return isFavouritePreset(preset.Id) === false;
            });

            return Object.keys(newPresets).length === actualPresets.length;
        }

        function buildAndSelectWithDelta(newPresets) {
            var selectedPresetId = observableObject.SelectedId() || InitialDataManager.prop.initialScreen.screenId;
            var actualPresets = observableObject.Presets();

            if (isDynamicPreset(selectedPresetId) || equalPresets(newPresets, actualPresets) === false) {
                buildAndSelect();
            } else {
                var selectedPresetInstruments;
                var selectedPreset = actualPresets.find(function (obsPreset) {
                    return obsPreset.Id === selectedPresetId;
                });

                if (general.isNullOrUndefined(selectedPreset) === false) {
                    selectedPresetInstruments = selectedPreset.QuotesCollection.Values().filter(function (instr) {
                        return !instr.isFake;
                    });
                }

                var newPresetInstruments;

                if (general.isNullOrUndefined(newPresets) === false) {
                    newPresetInstruments = newPresets[selectedPresetId];
                }

                if (general.isNullOrUndefined(newPresetInstruments) === false
                    && general.isNullOrUndefined(selectedPresetInstruments) === false
                    && equalPresetInstruments(selectedPresetInstruments, newPresetInstruments) === false) {
                    buildAndSelect();
                }
            }
        }

        function setPresetSubscribers() {
            PresetsManager.OnPresetsUpdated.Add(buildAndSelectWithDelta);
        }

        function reset() {
            lastPresetIdToSelect = -1;

            // Deactivate presets
            observableObject.Presets().forEach(function (item) {
                item.isSelected(false);
            });
        }

        function setDefaultObservables() {
            observableObject.Presets = ko.observableArray([]);
            observableObject.SelectedId = ko.observable("");
            observableObject.isSearch = ko.observable(false);
        }

        function setComputables() {
            observableObject.SelectedPreset = ko.pureComputed(function () {
                var preset = observableObject.Presets().find(function (item) {
                    return item.isSelected();
                });

                if (preset) {
                    observableObject.SelectedId(preset.Id);
                } else {
                    observableObject.SelectedId("");
                }

                return preset;
            });

            observableObject.Categories = ko.computed(function () {
                // Get all categories IDs (InstrumentType)
                var categorySortingIds = observableObject.Presets().map(function (item) {
                    return { instrumentType: item.InstrumentType, presetOrder: item.PresetOrder };
                });

                var categoryList = buildCategories(categorySortingIds);

                if (categoryList.length > maxInitialDataCategories) {
                    return categoryList;
                }

                return fillCategoryList(categoryList);
            });

            observableObject.SelectedCategory = ko.computed(function () {
                var category = observableObject.Categories().find(function (item) {
                    return item.isSelected();
                });

                return category;
            });
        }

        function buildCategories(categoryIds) {
            var uniqueCategories = categoryIds
                .filter(function (value, index, arr) {
                    var categ = arr.find(function (item) {
                        return item.instrumentType === value.instrumentType;
                    });
                    return arr.indexOf(categ) === index;
                })
                .sort(function (a, b) {
                    return a.presetOrder - b.presetOrder;
                });

            var categoriesList = [],
                category;

            for (var i = 0; i < uniqueCategories.length; i++) {
                // Find the presets that belogs to this category
                var presets = observableObject.Presets().filter(function (categoryType, item) {
                    return item.InstrumentType === categoryType;
                }.bind(null, uniqueCategories[i].instrumentType));

                category = presetCategoryBuilder.NewCategory(presets);

                category.SelectedPreset.subscribe(function (presetId) {
                    selectPreset(presetId);
                });

                categoriesList.push(category);
            }

            return categoriesList;
        }

        function fillCategoryList(initialCategoryList) {
            var categoriesList = [],
                initialCategoryNames = initialCategoryList.map(getCategoryName);

            for (var i = 0; i < presetsDefinitions.length; i++) {
                var categoryName = presetsDefinitions[i].categoryName,
                    category;

                if (initialCategoryNames.contains(categoryName)) {
                    category = initialCategoryList.find(isSpecifiedCategory.bind(null, categoryName));
                } else {
                    category = presetCategoryBuilder.NewCategory([], categoryName);
                }

                categoriesList.push(category);
            }

            return categoriesList;
        }

        function getCategoryName(category) {
            return category.Key;
        }

        function isSpecifiedCategory(categoryName, item) {
            return item.Key === categoryName;
        }

        function setSubscribers() {
            ko.postbox.subscribe('swipePreset', function (direction) {
                var categories = observableObject.Categories();
                var currentPresetPos = categories.indexOf(observableObject.SelectedCategory());

                if (direction === "left-to-right") {
                    if (typeof categories[currentPresetPos - 1] !== "undefined") {
                        categories[currentPresetPos - 1].Select();
                    } else {
                        ko.postbox.publish('search-presets');
                        observableObject.isSearch(true);
                    }
                }

                if (direction === "right-to-left" && typeof categories[currentPresetPos + 1] !== "undefined") {
                    if (observableObject.isSearch()) {
                        categories[0].Select();
                    } else {
                        categories[currentPresetPos + 1].Select();
                    }

                    observableObject.isSearch(false);
                }
            });

            InstrumentsManager.OnFavoritesPresetChanged.Add(function onPresetChanged() {
                var customizedPreset = observableObject.Presets().find(function (item) {
                    return item.Id == ePresetType.PresetCustomized;
                });

                if (customizedPreset) {
                    customizedPreset.Update();
                }
            });
        }

        function buildCollections(availableCfdScreens) {
            var collection = presetCollectionBuilder.NewCollection(presetsDefinitions, availableCfdScreens);

            collection.forEach(function (presteItem) {
                presteItem.Select = selectPreset;
            });

            observableObject.Presets(collection);
        }

        function selectPresetHandler(preset) {
            // Only the last clicked preset should be selected
            if (preset.Id !== lastPresetIdToSelect) {
                return;
            }

            if (preset.isSelected()) {
                // Skip an already selected preset
                return;
            }

            // Deactivate others
            observableObject.Presets().forEach(function (item) {
                if (item.Id !== lastPresetIdToSelect) {
                    item.isSelected(false);
                    // remove any listeners
                    item.OnOrderUpdate.Flush();
                }
            });

            if (inheritedInstance.getSettings(self).areQuotesVisible) {
                updateQuoteUIOrder(preset);
            }

            // Activate
            preset.isSelected(true);

            // listen for order change
            preset.OnOrderUpdate.Add(function (instrumentsIds) {
                FavoriteInstrumentsManager.ChangeUIOrder(instrumentsIds, true);
            });

            ko.postbox.publish('preset-changed', preset.Name);
            CustomerProfileManager.LastSelectedPresetId(preset.Id);
        }

        function selectPreset(presetId) {
            presetId = Number(presetId);

            editFavoriteVisible(presetId === 0);

            var presetToActivate = observableObject.Presets().find(function (item) {
                return item.Id === presetId;
            });

            if (!presetToActivate) {
                return;
            }

            lastPresetIdToSelect = presetId;

            selectPresetHandler(presetToActivate);
        }

        function getPreset(presetId) {
            var preset = observableObject.Presets().find(function (item) {
                return item.Id == presetId;
            });

            return preset;
        }

        function updateQuoteUIOrder(preset) {
            var quotesUIorder;

            if (preset.Id == ePresetType.PresetCustomized) {
                quotesUIorder = InstrumentsManager.GetCustomizedUiOrder();
            } else {
                quotesUIorder = InstrumentsManager.GetPresetInstruments(preset.Id);
            }

            if (quotesUIorder) {
                if (!observableObject.isSearch()) {
                    InstrumentsManager.SetQuotesUIOrder(quotesUIorder);
                }

                if (!inheritedInstance.getSettings(self).areQuotesVisible) {
                    ViewsManager.SwitchViewVisible(eForms.Quotes, { presetToSelect: preset.Id });
                }
            }

            ko.postbox.publish('quotes-ui-order-loaded');
        }

        function getCurrentPresetName() {
            var currentPreset = observableObject.SelectedPreset();

            if (!currentPreset) {
                currentPreset = observableObject.Presets().find(function (item) {
                    return InitialDataManager.prop.initialScreen.screenId === item.Id;
                });
            }

            return currentPreset.Name;
        }

        return {
            Init: init,
            Reset: reset,
            Data: observableObject,
            SearchInstrumentsObservable: searchInstruments,
            SingleCharSearch: singleCharSearch,
            GetCurrentPresetName: getCurrentPresetName,
            GetPreset: getPreset,
            SelectPreset: selectPreset,
            IsSearchPreset: isSearchPreset,
            EditFavoriteVisible: editFavoriteVisible
        };
    });