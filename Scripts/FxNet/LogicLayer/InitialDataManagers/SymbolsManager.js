define(
    'initdatamanagers/SymbolsManager',
    [
        'require',
        'handlers/general',
        'handlers/Logger',
        'handlers/HashTable',
        'Dictionary',
        'initdatamanagers/InstrumentsManager'
    ],
    function SymbolsManagerDef(require) {
        var general = require('handlers/general'),
            logger = require('handlers/Logger'),
            hashTable = require('handlers/HashTable'),
            dictionary = require('Dictionary'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager');

        function Symbol(id, name) {
            this.id = id;
            this.name = name;
        }

        function SymbolsManager() {
            var symbols = new hashTable();

            function init(data) {
                var staticSymbols = data;

                if (!general.isEmptyValue(staticSymbols)) {
                    for (var i = 0, ii = staticSymbols.length; i < ii; i++) {
                        var item = staticSymbols[i];

                        symbols.SetItem(item[eSymbol.id], new Symbol(item[eSymbol.id], item[eSymbol.name]));
                    }
                }
            }

            function getSymbol(id) {
                var symbol = symbols.GetItem(id);

                if (!symbol) {
                    logger.log('TSymbolsManager/getSymbol', String.format('symbol {0} not exist', id));
                }

                return symbol;
            }

            function getTranslatedSymbolById(id) {
                var symbol = dictionary.GetItem('symbol_' + id);

                if (!symbol) {
                    logger.log('TSymbolsManager/getSymbol', String.format('symbol {0} not exist', id));
                }

                return symbol;
            }

            function getTranslatedSymbolByName(name) {
                var lowerCaseName = name ? name.toLowerCase() : '';
                var symbol = dictionary.GetItem('symbolbyname_' + lowerCaseName);

                if (!symbol) {
                    logger.log('TSymbolsManager/getSymbol', String.format('symbol {0} not exist', name));
                }

                return symbol;
            }

            function extractSymbolsNames(instrumentId) {
                var instrument = instrumentsManager.GetInstrument(instrumentId);

                if (instrument) {
                    return {
                        'base': getTranslatedSymbolById(instrument.baseSymbol),
                        'other': getTranslatedSymbolById(instrument.otherSymbol)
                    };
                }

                return;
            }

            return {
                Symbols: symbols,
                Init: init,
                GetSymbol: getSymbol,
                GetTranslatedSymbolById: getTranslatedSymbolById,
                GetTranslatedSymbolByName: getTranslatedSymbolByName,
                ExtractSymbolsNames: extractSymbolsNames
            };
        }

        var module = window.$symbolsManager = new SymbolsManager();

        return module;
    }
);
