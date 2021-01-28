'use strict';
define('managers/PresetCategoryBuilder',
    [
        'require',
        'knockout',
        'initdatamanagers/InstrumentsManager',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            dictionary = require('Dictionary'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager');

        function newCategory(presetArr, categoryName) {
            var key = presetArr.length ? presetArr[0].CategoryNameKey : categoryName,
                selectedPreset = ko.observable("").extend({ notify: "always" }),
                lastSelectedPreset = null,
                label = dictionary.GetItem(key, 'PresetsCategories'),
                presets = presetArr;
            
            presets.forEach(function (preset) {
                preset.isSelected.subscribe(function (isSelected) {
                    if (isSelected) {
                        lastSelectedPreset = preset;
                    }
                }, preset);
            });

            var categoryIsSelected = ko.pureComputed(function () {
                var selectedItem = presets.find(function (item) {
                    return item.isSelected();
                });

                return !!selectedItem;
            });

            function select() {
                if (!presets.length) {
                    return;
                }

                var firstPresetFromCollection = presets[0];

                //if we are in main tab and after login (don't have lastSelectedPreset) and have at least one instrument in Favorites, switch to Favorites
                //if Favorites is empty, switch to next preset (MostPopular)
                if (presets.length > 0 &&
                    firstPresetFromCollection.Count() === 0 &&
                    firstPresetFromCollection.CategoryNameKey === "PresetMainTab" &&
                    instrumentsManager.GetPresetInstruments(firstPresetFromCollection.Id).length === 0) {
                    firstPresetFromCollection = presets[1];
                }

                selectedPreset(lastSelectedPreset ? lastSelectedPreset.Id : firstPresetFromCollection.Id);
                ko.postbox.publish('main-tab-click');
            }
            
            function compareAlphabetically(a, b) {
                var firstPresetLabel = a.Label,
                    secondPresetLabel = b.Label;

                return firstPresetLabel.localeCompare(secondPresetLabel);
            }

            function compareSubCategoryOrder(a, b) {
                return a.subCategory.order - b.subCategory.order;
            }

            function sortSubCategoryPresets(subCategoryGroup) {
                if (subCategoryGroup.subCategory.sortAlphabetically) {
                    subCategoryGroup.presets.sort(compareAlphabetically);
                }
            }

            function sortColumns(subCategories) {
                return subCategories
                    .sort(compareSubCategoryOrder)
                    .forEach(sortSubCategoryPresets);
            }

            function getGroupedPresetsByColumns() {
                var columns = [],
                    subCategories = {};

                for (var i = 0; i < presets.length; i++) {
                    var preset = presets[i],
                        columnIndex = preset.subCategory.columnId,
                        group = subCategories[preset.subCategory.label];

                    while (columns.length <= columnIndex) {
                        columns.push([]);
                    }

                    if (!group) {
                        group = { subCategory: preset.subCategory, presets: [] };
                        subCategories[preset.subCategory.label] = group;
                        columns[columnIndex].push(group);
                    }

                    group.presets.push(preset);
                }

                columns.forEach(sortColumns);

                return columns;
            }

            return {
                Key: key,
                SelectedPreset: selectedPreset,
                LastSelectedPreset: lastSelectedPreset,
                Label: label,
                GetGroupedPresetsByColumns: getGroupedPresetsByColumns,
                Presets: presets,
                isSelected: categoryIsSelected,
                Select: select
            };

        }

        return {
            NewCategory: newCategory
        };
    }
);
