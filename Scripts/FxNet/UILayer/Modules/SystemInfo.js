define(
    'modules/systeminfo',
    [
        'require',
        'handlers/general'
    ],
    function (require) {
        var general = require('handlers/general');

        window.systemInfo = window.systemInfo || {};

        function save(property, value) {
            if (general.isStringType(property) && property.length > 0 && general.isDefinedType(value)) {
                if (Object.keys(window.systemInfo).length < 1) {
                    // systemInfo was not initialized yet
                    var obj = {};
                    obj[property] = value;
                    save(obj);
                } else {
                    window.systemInfo[property] = value;
                }
            } else if (general.isObjectType(property)) {
                window.systemInfo = property;
            }
        }

        function get(property, defaultValue) {
            if (Object.keys(window.systemInfo).length > 0 && typeof window.systemInfo[property] !== 'undefined') {
                return window.systemInfo[property];
            }

            return defaultValue;
        }

        return {
            save: save,
            get: get
        };
    }
);