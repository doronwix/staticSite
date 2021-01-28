define(
    'modules/BuilderForInBetweenQuote',
    [
        'require',
        'knockout',
        'Q',
        'handlers/general',
        'initdatamanagers/InstrumentsManager',
        'generalmanagers/RegistrationManager',
        'cachemanagers/QuotesManager',
        'dataaccess/dalConversion'
    ],
    function BuilderForInBetweenQuote(require) {
        var ko = require('knockout'),
            Q = require('Q'),
            general = require('handlers/general'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            RegistrationManager = require('generalmanagers/RegistrationManager'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            dalConversion = require('dataaccess/dalConversion');

        function getInBetweenQuote(fromSymbolId, toSymbolId) {
            if (fromSymbolId == toSymbolId) {
                return Q({
                    ask: ko.observable(1),
                    bid: ko.observable(1),
                    instrumentFactor: 1,
                    isOppositeInstrumentFound: false
                });
            }

            var instrumentProp = InstrumentsManager.GetInstrumentPropUsedForConversion(fromSymbolId, toSymbolId);

            if (!general.isNullOrUndefined(instrumentProp)) {
                return registerInstrument(instrumentProp.id)
                    .then(function (quote) {
                        return {
                            ask: quote.ask,
                            bid: quote.bid,
                            instrumentFactor: instrumentProp.factor,
                            isOppositeInstrumentFound: instrumentProp.isOppositeInstrumentFound
                        };
                    });
            }
            else {
                return dalConversion
                    .getInBetweenQuote(fromSymbolId, toSymbolId)
                    .then(function (response) {
                        var result = response.result;
                        var inBetweenQuote = null;

                        if (result) {
                            inBetweenQuote = {
                                ask: ko.observable(result.ask),
                                bid: ko.observable(result.bid),
                                instrumentFactor: result.instrumentFactor,
                                isOppositeInstrumentFound: result.isOppositeInstrumentFound
                            };
                        }

                        return inBetweenQuote;
                    });
            }
        }

        function registerInstrument(instrumentId) {
            var defer = Q.defer(),
                quote = {
                    ask: ko.observable(),
                    bid: ko.observable()
                };

            var updateQuote = function () {
                var quoteForInstrument = QuotesManager.Quotes.GetItem(instrumentId);

                if (quoteForInstrument) {
                    quote.bid(quoteForInstrument.bid);
                    quote.ask(quoteForInstrument.ask);

                    defer.resolve(quote);

                    return true;
                }

                return false;
            };

            QuotesManager.OnChange.Add(updateQuote);

            if (updateQuote() === false) {
                RegistrationManager.Update(eRegistrationListName.InBetweenQuote, instrumentId);
            }

            return defer.promise;
        }

        return {
            GetInBetweenQuote: getInBetweenQuote
        };
    }
);
