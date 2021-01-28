define(
    'FxNet/LogicLayer/Deal/DealAmountLabel',
    [
        'require',
        'handlers/general',
        'Dictionary',
        'configuration/initconfiguration',
        'initdatamanagers/SymbolsManager',
        'LoadDictionaryContent!dealAmountLabel'
    ],
    function (require) {
        var general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            newDealConfiguration = require('configuration/initconfiguration').NewDealConfiguration,
            SymbolsManager = require('initdatamanagers/SymbolsManager');

        function translate(instrument, prefixKey) {
            if (!instrument) {
                return;
            }

            var shouldIncludeBaseSymbolName = false,
                prefix = general.isNullOrUndefined(prefixKey) ? newDealConfiguration.dealAmountPrefixKey : prefixKey,
                contentKey = prefix + instrument.id,
                labelValue;

            if (Dictionary.ValueIsEmpty(contentKey, 'dealAmountLabel')) {
                if (instrument.isFuture) {
                    contentKey = prefix + 'future';
                }
                else if (instrument.isShare) {
                    contentKey = prefix + 'share';
                }
                else {
                    contentKey = prefix + 'default';
                    shouldIncludeBaseSymbolName = true;
                }
            }

            labelValue = Dictionary.GetItem(contentKey, 'dealAmountLabel');

            if (shouldIncludeBaseSymbolName) {
                labelValue += (' ' + SymbolsManager.GetTranslatedSymbolById(instrument.baseSymbol));
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
