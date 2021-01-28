'use strict';
define('managers/PresetCollectionBuilder',
    [
        'require',
        'managers/PresetBuilder'
    ],
    function (require) {
        var presetBuilder = require('managers/PresetBuilder');

        function newCollection(categories, availableScreens) {
            var presets = [];
            availableScreens = availableScreens || [];

            for (var index = 0, count = categories.length; index < count; index++) {
                var currentCategory = categories[index];

                for (var presetType in currentCategory.presets) {
                    if (currentCategory.presets.hasOwnProperty(presetType)) {
                        if (availableScreens.contains(currentCategory.presets[presetType].id)) {
                            presets.push(presetBuilder.NewPreset(currentCategory, presetType));
                        }
                    }
                }
            }

            return presets;
        }

        return {
            NewCollection: newCollection
        };
    }
);
