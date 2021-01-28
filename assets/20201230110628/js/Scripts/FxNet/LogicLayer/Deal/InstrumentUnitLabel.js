define(
    'FxNet/LogicLayer/Deal/InstrumentUnitLabel',
    [
        'require',
        'Dictionary',
        'initdatamanagers/SymbolsManager'
    ],
    function (require) {
        var Dictionary = require('Dictionary'),
            SymbolsManager = require('initdatamanagers/SymbolsManager');

        function translate(instrument, prefixKey, resourceName) {
            if (!instrument) {
                return;
            }

            var shouldIncludeBaseSymbolName = false,
                contentKey = prefixKey + instrument.id,
                labelValue;

            if (Dictionary.ValueIsEmpty(contentKey)) {
                if (instrument.isFuture) {
                    contentKey = prefixKey + "future";
                } else if (instrument.isShare) {
                    contentKey = prefixKey + "share";
                } else {
                    contentKey = prefixKey + "default";
                    shouldIncludeBaseSymbolName = true;
                }
            }

            labelValue = Dictionary.GetItem(contentKey, resourceName);

            if (shouldIncludeBaseSymbolName) {
                labelValue = (' ' + SymbolsManager.GetTranslatedSymbolById(instrument.baseSymbol));
            }

            return {
                label: labelValue
            };
        }

        return {
            Translate: translate
        };
    }
);