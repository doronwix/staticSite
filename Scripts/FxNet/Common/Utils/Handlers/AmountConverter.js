define('handlers/AmountConverter',
    [
        'require',
        'handlers/general'
    ],
    function (require) {
        var general = require('handlers/general');

        var AmountConverter = {
            Convert: function (amount, inBetweenQuote, useMidRate) {
                var bid, ask;

                if (general.isNullOrUndefined(inBetweenQuote)) {
                    return;
                }

                if (typeof inBetweenQuote.bid == 'function') {
                    bid = inBetweenQuote.bid();

                } else {
                    bid = inBetweenQuote.bid;
                }

                if (typeof inBetweenQuote.ask == 'function') {
                    ask = inBetweenQuote.ask();

                } else {
                    ask = inBetweenQuote.ask;
                }

                if (useMidRate === true) {
                    ask = bid = Format.toMidRate(bid, ask);
                }

                if (inBetweenQuote.isOppositeInstrumentFound) {
                    if (amount < 0) {
                        return amount * inBetweenQuote.instrumentFactor / bid;
                    } else {
                        return amount * inBetweenQuote.instrumentFactor / ask;
                    }
                } else {
                    if (amount < 0) {
                        return amount * ask / inBetweenQuote.instrumentFactor;
                    } else {
                        return amount * bid / inBetweenQuote.instrumentFactor;
                    }
                }
            }
        };

        return AmountConverter;
    }
);