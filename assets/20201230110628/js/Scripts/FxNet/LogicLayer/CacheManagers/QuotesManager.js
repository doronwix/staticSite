define(
    'cachemanagers/QuotesManager',
    [
        'require',
        'tracking/PerformanceDataCollector',
        'handlers/HashTable',
        'handlers/Delegate',
        'enums/DataMembersPositions'
    ],
    function TQuotesManager(require) {
        function TQuote(instrumentId) {
            this.id = instrumentId;
            this.bid = 0;
            this.ask = '';
            this.open = '';
            this.high = '';
            this.low = '';
            this.highBid = '';
            this.lowAsk = '';
            this.tradeTime = '';
            this.change = 0;
            this.changePips = 0;
            this.state = eQuoteStates.NotChanged;
            this.close = '';
        }

        TQuote.prototype.isActive = function () {
            return this.state !== eQuoteStates.Disabled && this.state !== eQuoteStates.TimedOut && this.state !== eQuoteStates.Locked;
        }

        var PerformanceDataCollector = require('tracking/PerformanceDataCollector');
        var onChange = require('handlers/Delegate');
        var quotes = require('handlers/HashTable');

        onChange = new onChange();
        quotes = new quotes();

        onChange.Add(onFirstQuote);

        function onFirstQuote() {
            PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.FirstQuoteEvent);
            onChange.Remove(onFirstQuote);
        }

        function processTickData(data, serverTime) {
            resetStates();

            var delta = [];
            for (var i = 0, length = data.length; i < length; i++) {
                var quote = quotes.GetItem(data[i][eTicks.instrumentID]);

                if (!quote) {
                    quote = new TQuote(data[i][eTicks.instrumentID]);
                    quotes.SetItem(quote.id, quote);
                }

                updateQuoteFromTick(quote, data[i], serverTime);
                delta.push(quote.id);
            }

            onChange.Invoke(delta);
        }

        function processOhlcData(data) {
            var delta = [];

            for (var i = 0, length = data.length; i < length; i++) {
                var quote = quotes.GetItem(data[i][eOhlc.instrumentID]);

                if (!quote) {
                    quote = new TQuote(data[i][eOhlc.instrumentID]);
                    quotes.SetItem(quote.id, quote);
                }

                updateQuoteFromOhlc(quote, data[i]);
                delta.push(quote.id);
            }

            onChange.Invoke(delta);
        }

        function resetStates() {
            quotes.ForEach(function iterator(key, item) {
                if (item.isActive()) {
                    item.state = eQuoteStates.NotChanged;
                }
            });
        }

        function updateQuoteFromTick(quote, delta, serverTime) {
            quote.state = getState(quote, delta);
            quote.bid = delta[eTicks.bid];
            quote.ask = delta[eTicks.ask];

            if (serverTime) {
                var currentTradeTime = new Date(serverTime.getTime());
                currentTradeTime.AddSeconds(-delta[eTicks.tradeTimeOffset]);
                quote.tradeTime = currentTradeTime.ExtractDateShortYear() + ' ' + currentTradeTime.ExtractFullTime();
            }

            quote.changePips = quote.bid - quote.close;
            quote.change = (quote.close != 0) ? (quote.bid / quote.close - 1) * 100 : 0;
        }

        function updateQuoteFromOhlc(quote, delta) {
            quote.open = delta[eOhlc.open];
            quote.highBid = delta[eOhlc.high];
            quote.lowAsk = delta[eOhlc.low];
            quote.close = delta[eOhlc.close];
        }

        function getState(quote, delta) {
            if (delta[eTicks.state] != eQuoteStates.Enabled) {
                return delta[eTicks.state];
            }

            if (quote.bid < delta[eTicks.bid]) {
                return eQuoteStates.Up;
            }

            if (quote.bid > delta[eTicks.bid]) {
                return eQuoteStates.Down;
            }

            return eQuoteStates.NotChanged;
        }

        function removeItems(items) {
            for (var i = 0, length = items.length; i < length; i++) {
                quotes.Remove(items[i]);
            }
        }

        var module = window.$quotesManager = {
            OnChange: onChange,
            Quotes: quotes,
            ProcessTickData: processTickData,
            ProcessOhlcData: processOhlcData,
            GetState: getState,
            RemoveItems: removeItems
        };

        return module;
    }
);