define(
    'viewmodels/ViewModelBase',
    [
        'require',
        'handlers/general',
    ],
    function (require, general) {

        return {
            setSettings: function (child, customSettings, defaultSettings) {
                customSettings = customSettings || {};

                if (!general.isDefinedType(defaultSettings)) {
                    child.settings = {};
                }
                else {
                    child.settings = defaultSettings;
                }
                Object.assign(child.settings, customSettings);
            },
            getSettings: function (child) {
                return child.settings;
            }
        };
    }
);
