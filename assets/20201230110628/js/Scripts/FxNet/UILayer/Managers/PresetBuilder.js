'use strict';
define('managers/PresetBuilder',
    [
        'require',
        'knockout',
        'handlers/general',
        "helpers/ObservableHashTable",
        'initdatamanagers/InitialDataManager',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dictionary = require('Dictionary'),
            observableHashTable = require("helpers/ObservableHashTable"),
            initialDataManager = require('initdatamanagers/InitialDataManager');

        function setPresetName(params) {
            for (var presetName in ePresetType) {
                if (ePresetType.hasOwnProperty(presetName) &&
                    ePresetType[presetName] === params.presetId) {
                    return presetName;
                }
            }

            return "";
        }

        function setPresetOrder(params) {
            if (params.ascOrderPresetIds && 0 <= params.ascOrderPresetIds.indexOf(params.presetId)) {
                return ePresetsOrder.Ascending;
            }

            if (params.descOrderPresetIds && 0 <= params.descOrderPresetIds.indexOf(params.presetId)) {
                return ePresetsOrder.Descending;
            }

            return ePresetsOrder.None;
        }

        function newPreset(currentCategory, presetType) {
            var data = {};

            var presetId = currentCategory.presets[presetType].id,
                subCategory = currentCategory.presets[presetType].subCategory;

            data = {
                presetId: presetId,
                instrumentType: currentCategory.instrumentType,
                subCategory: subCategory,
                categoryNameKey: currentCategory.categoryName,
                presetOrder: currentCategory.presetOrder,
                isInitial: presetId == initialDataManager.prop.initialScreen.screenId,
                ascOrderPresetIds: currentCategory.ascOrderPresetIds,
                descOrderPresetIds: currentCategory.descOrderPresetIds
            };

            var name = setPresetName(data);

            var quotesCollection = new observableHashTable(ko,general,'id');
            var onOrderUpdate = new TDelegate();

            var isSelected = ko.observable(false);
            var isReady = ko.observable(false);

            function getNonFakeCount() {
                return quotesCollection.Values()
                    .filter(function (item) {
                        return item.isFake === false;
                    })
                    .length;
            }

            var nonFakeCount = ko.pureComputed(getNonFakeCount);

            function updateOrder() {
                var newOrder = quotesCollection.Values()
                                .filter(function (item) { return item.isFake === false; })
                                .map(function (item) { return item.id; });

                onOrderUpdate.Invoke(newOrder);

                ko.postbox.publish("favorite-instruments-reorder-drop");
            }

            function update() {
                clear();

                if (isSelected()) {
                    isSelected(false);
                    isSelected(true);
                }
            }

            function addRange(collection) {
                quotesCollection.AddRange(collection);
                isReady(true);
            }

            function clear() {
                isReady(false);
                quotesCollection.Clear();
            }

            return {
                Id: data.presetId,
                IdString: data.presetId.toString(),
                InstrumentType: parseInt(data.instrumentType),
                CategoryNameKey: data.categoryNameKey,
                IsReady: isReady,
                Order: setPresetOrder(data),
                PresetOrder: data.presetOrder,
                subCategory: data.subCategory,
                Name: name,
                Label: dictionary.GetItem(name, 'PresetsCategories'),
                IsCustomScreen: (data.presetId === ePresetType.PresetCustomized),
                isSelected: isSelected,
                OnOrderUpdate: onOrderUpdate,
                UpdateOrder: updateOrder,
                QuotesCollection: quotesCollection,
                TemporaryQuotesCollection: [],
                Count: nonFakeCount,
                Update: update,
                AddRange: addRange,
                Clear: clear
            };
        }

        return {
            NewPreset: newPreset
        }
    }
);