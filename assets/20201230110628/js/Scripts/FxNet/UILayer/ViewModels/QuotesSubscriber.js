define(
    'viewmodels/QuotesSubscriber',
    [
        'require',
        'knockout',
        'handlers/general',
        'cachemanagers/QuotesManager',
        "helpers/ObservableHashTable"
    ],
    function(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            observableHashTable = require("helpers/ObservableHashTable");

        function QuotesSubscriber() {
            var observableQuotesCollection = new observableHashTable(ko,general,'instrumentID'),
                started = false;

            var start = function() {
                if (!started) {
                    registerToDispatcher();

                    started = true;
                }
            };

            var stop = function() {
                if (started) {
                    unRegisterFromDispatcher();
                    observableQuotesCollection.Clear();

                    started = false;
                }
            };

            var registerToDispatcher = function() {
                QuotesManager.OnChange.Add(onQuoteChange);
            };

            var unRegisterFromDispatcher = function() {
                QuotesManager.OnChange.Remove(onQuoteChange);
            };

            var subscribeToQuote = function(instrumentId) {
                var quote = QuotesManager.Quotes.GetItem(instrumentId);
                if (quote) {
                    var observableQuote = createObservableQuote(quote);
                    observableQuotesCollection.Add(observableQuote);
                    return true;
                } else {
                    var emptyQuote = createObservableQuote({
                        id: instrumentId,
                        bid: 0,
                        ask: 0,
                        open: 0,
                        close: 0,
                        high: 0,
                        low: 0,
                        change: 0,
                        tradeTime: '00:00:00',
                        state: eQuoteStates.Disabled,
                        isActive: function () {
                            return false;
                        }
                    });

                    observableQuotesCollection.Add(emptyQuote);
                    return false;
                }
            };

            var createObservableQuote = function (quote) {
                var observableQuote = {
                    instrumentID: quote.id,
                    bid: ko.observable(quote.bid),
                    ask: ko.observable(quote.ask),
                    open: ko.observable(quote.open),
                    close: ko.observable(quote.close),
                    high: ko.observable(quote.high),
                    low: ko.observable(quote.low),
                    change: ko.observable(Format.toPercent(quote.change)),
                    dataTime: ko.observable(quote.tradeTime),
                    state: ko.observable(quote.state),
                    midRate: ko.observable(Format.toMidRate(quote.bid, quote.ask)),
                    time: ko.observable(Format.toTime(quote.tradeTime)),
                    isActiveQuote: ko.observable(quote.isActive()),
                };

                observableQuote.rateDirIsUp = ko.pureComputed(function() { return this.state() == eQuoteStates.Up; }, observableQuote);
                observableQuote.rateDirIsDown = ko.pureComputed(function() { return this.state() == eQuoteStates.Down; }, observableQuote);
                observableQuote.isInactive = ko.pureComputed(function () { return !this.isActiveQuote() }, observableQuote);

                return observableQuote;
            };

            var getOrderRate = function(instrumentId, orderDir) {
                var quote = getQuote(instrumentId);
                return (orderDir == eOrderDir.Buy) ? quote.ask : quote.bid;
            };

            var getQuote = function(instrumentId) {
                var quote = observableQuotesCollection.Get(instrumentId);
                if (!quote) {
                    subscribeToQuote(instrumentId);
                    quote = observableQuotesCollection.Get(instrumentId);
                }
                return quote;
            };

            var removeQuoteSubscription = function (instrumentId) {
                var quote = observableQuotesCollection.Get(instrumentId);

                if (quote) {
                    observableQuotesCollection.Remove(quote)
                }

                return quote;
            };

            var onQuoteChange = function(deltaList) {
                if (deltaList) {
                    for (var i = 0; i < deltaList.length; i++) {
                        var quote = QuotesManager.Quotes.GetItem(deltaList[i]);
                        var delta = {
                            instrumentID: quote.id,
                            bid: quote.bid,
                            ask: quote.ask,
                            open: quote.open,
                            close: quote.close,
                            high: quote.high,
                            low: quote.low,
                            change: Format.toPercent(quote.change),
                            dataTime: quote.tradeTime,
                            state: quote.state,
                            midRate: Format.toMidRate(quote.bid, quote.ask),
                            time: Format.toTime(quote.tradeTime)
                        };
                        observableQuotesCollection.Update(deltaList[i], delta);
                    }
                }
            };

            return {
                Start: start,
                Stop: stop,
                GetOrderRate: getOrderRate,
                GetQuote: getQuote,
                RemoveQuoteSubscription: removeQuoteSubscription,
                Values: observableQuotesCollection.Values
            };
        }

        return QuotesSubscriber;
    }
);