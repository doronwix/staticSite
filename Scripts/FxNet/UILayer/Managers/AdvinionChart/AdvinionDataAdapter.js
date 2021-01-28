define(
    'managers/AdvinionChart/AdvinionDataAdapter',
    [
        'require',
        'Q',
        'handlers/general',
        'managers/AdvinionChart/AdvinionChartsManager',
        'managers/AdvinionChart/AdvinionDataObjectsMapper',
        'cachemanagers/QuotesManager',
        'viewmodels/QuotesSubscriber',
        'dataaccess/dalCharts'
    ],
    function (require) {
        var Q = require('Q'),
            general = require('handlers/general'),
            advinionChartsManager = require('managers/AdvinionChart/AdvinionChartsManager'),
            advinionDataObjectsMapper = require('managers/AdvinionChart/AdvinionDataObjectsMapper'),
            quotesManager = require('cachemanagers/QuotesManager'),
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            dalCharts = require('dataaccess/dalCharts');

        var AdvinionDataAdapter = function () {
            var quotesSubscriber = new QuotesSubscriber(),
                mappingArray = [
                    {
                        databaseValue: eChartPeriod.Ticks,
                        chartValue: eChartTimeFramesIds.tick // 1 tick
                    },
                    {
                        databaseValue: eChartPeriod.OneMinute,
                        chartValue: eChartTimeFramesIds["1 Minute"]
                    },
                    {
                        databaseValue: eChartPeriod.FiveMinutes,
                        chartValue: eChartTimeFramesIds["5 Mintes"]
                    },
                    {
                        databaseValue: eChartPeriod.FifteenMinutes,
                        chartValue: eChartTimeFramesIds["15 Minutes"]
                    },
                    {
                        databaseValue: eChartPeriod.ThirtyMinutes,
                        chartValue: eChartTimeFramesIds["30 Minutes"]
                    },
                    {
                        databaseValue: eChartPeriod.OneHour,
                        chartValue: eChartTimeFramesIds["1 Hour"]
                    },
                    {
                        databaseValue: eChartPeriod.TwoHours,
                        chartValue: eChartTimeFramesIds["2 Hours"]
                    },
                    {
                        databaseValue: eChartPeriod.FourHours,
                        chartValue: eChartTimeFramesIds["4 Hours"]
                    },
                    {
                        databaseValue: eChartPeriod.SixHours,
                        chartValue: eChartTimeFramesIds["6 Hours"]
                    },
                    {
                        databaseValue: eChartPeriod.TwelveHours,
                        chartValue: eChartTimeFramesIds["12 Hours"]
                    },
                    {
                        databaseValue: eChartPeriod.OneDay,
                        chartValue: eChartTimeFramesIds["1 Day"]
                    },
                    {
                        databaseValue: eChartPeriod.OneWeek,
                        chartValue: eChartTimeFramesIds["1 Week"]
                    },
                    {
                        databaseValue: eChartPeriod.OneMonth,
                        chartValue: eChartTimeFramesIds["1 Month"]
                    }
                ];

            function start() {
                quotesSubscriber.Start();
                advinionDataObjectsMapper.init(quotesSubscriber);
            }

            function fixOngoingCandleData(instrumentId, data, orderDir) {
                if (!instrumentId || !data || data.length === 0) {
                    return;
                }

                var lastCandle = data[data.length - 1];

                if (!lastCandle || lastCandle.close) {
                    return;
                }

                var lastQuoteValueString = getQuoteData(instrumentId, orderDir).value;
                var lastQuoteValue = Number(lastQuoteValueString);

                if (!lastQuoteValueString || !lastQuoteValue || isNaN(lastQuoteValue)) {
                    throw new Error('Quote data unavailable for instrument: ' + instrumentId);
                }

                if (lastCandle.high < lastQuoteValue) {
                    lastCandle.high = lastQuoteValue;
                }

                if (lastCandle.low > lastQuoteValue) {
                    lastCandle.low = lastQuoteValue;
                }

                lastCandle.close = lastQuoteValue;
            }

            function getHistoryRates(request) {
                function onLoadComplete(recentHistoryQuotes) {
                    var recentHistoryQuotesMapped = advinionDataObjectsMapper.mapRecentHistoryObject(request.instrumentId,
                        recentHistoryQuotes.map(advinionDataObjectsMapper.mapCandleObject));

                    if (recentHistoryQuotesMapped && recentHistoryQuotesMapped.data) {
                        fixOngoingCandleData(request.instrumentId, recentHistoryQuotesMapped.data, request.orderDir);
                    }

                    return recentHistoryQuotesMapped;
                }

                var candleStickDataModel = {
                    instrumentId: request.instrumentId,
                    rateType: request.orderDir === eOrderDir.Sell ? eChartRateType.Bid : eChartRateType.Ask,
                    periodId: getDatabasePeriod(request.timeFrame),
                    fromDate: advinionDataObjectsMapper.mapAdvinonFromDate(request.fromDate),
                    toDate: advinionDataObjectsMapper.mapAdvinonToDate(request.toDate),
                    numCandles: request.historyLength
                };

                var deferred = Q.defer();

                function updateQuote() {
                    var activeQuote = quotesManager.Quotes.GetItem(request.instrumentId);

                    if (!activeQuote) {
                        return;
                    }

                    quotesManager.OnChange.Remove(updateQuote);

                    var getCandlesPromise = dalCharts
                        .GetCandles(candleStickDataModel)
                        .then(onLoadComplete);

                    deferred.resolve(getCandlesPromise);
                }

                quotesManager.OnChange.Add(updateQuote);
                updateQuote();

                return deferred.promise;
            }

            function getHistoryTickRates(request) {
                function onTicksLoadComplete(recentHistoryTickQuotes) {
                    return advinionDataObjectsMapper.mapRecentHistoryObject(request.instrumentId, recentHistoryTickQuotes.map(advinionDataObjectsMapper.mapTickObject));
                }

                var tickDataModel = {
                    instrumentId: request.instrumentId,
                    rateType: request.orderDir === eOrderDir.Sell ? eChartRateType.Bid : eChartRateType.Ask,
                    fromDate: advinionDataObjectsMapper.mapAdvinonFromDate(request.fromDate),
                    toDate: advinionDataObjectsMapper.mapAdvinonToDate(request.toDate),
                    numTicks: request.historyLength
                };

                return dalCharts
                    .GetTicks(tickDataModel)
                    .then(onTicksLoadComplete);
            }

            function getDatabasePeriod(chartTimeScale) {
                var result = mappingArray.filter(function timeScaleFilter(mappingObject) {
                    return mappingObject.chartValue == chartTimeScale;
                });

                if (result.length == 0) {
                    throw new Error('The specified time scale was not found (' + chartTimeScale + ').');
                }

                return result[0].databaseValue;
            }

            function getChartTimeScale(databasePeriod) {
                var result = mappingArray.filter(function databasePeriodFilter(mappingObject) {
                    return mappingObject.databaseValue == databasePeriod;
                });

                if (result.length == 0) {
                    throw new Error('The specified time scale period was not found (' + databasePeriod + ').');
                }

                return result[0].chartValue;
            }

            function mapTimeScaleObject(period) {
                return {
                    f: 1,
                    id: getChartTimeScale(period.periodID),
                    n: period.periodName
                };
            }

            function getTimeScalesAsync() {
                if (!general.isEmptyValue(advinionChartsManager.ServerPeriods)) {
                    return getPeriods();
                }

                return dalCharts
                    .GetPeriods()
                    .then(removeTenSecondsPeriod)
                    .then(setPeriods)
                    .then(getPeriods);
            }

            function setPeriods(periods) {
                advinionChartsManager.ServerPeriods = periods.map(mapTimeScaleObject);
            }

            function getPeriods() {
                return Q(advinionChartsManager.ServerPeriods);
            }

            function removeTenSecondsPeriod(periods) {
                return periods.filter(function filterOutPeriods(period) { return period.periodID != eChartPeriod.TenSeconds; });
            }

            function getMapper() {
                return advinionDataObjectsMapper;
            }

            function getQuoteData(instrumentId, orderDir) {
                var lastQuote = quotesSubscriber.GetQuote(instrumentId);

                return {
                    value: orderDir === eOrderDir.Sell ? lastQuote.bid() : lastQuote.ask(),
                    isInactive: lastQuote.isInactive()
                };
            }

            function unsubscribeFromQuote(instrumentId) {
                quotesSubscriber.RemoveQuoteSubscription(instrumentId)
            }

            start();

            return {
                getDatabasePeriod: getDatabasePeriod,
                getChartTimeScale: getChartTimeScale,
                getHistoryRates: getHistoryRates,
                getHistoryTicks: getHistoryTickRates,
                getTimeScalesAsync: getTimeScalesAsync,
                getMapper: getMapper,
                getQuoteData: getQuoteData,
                unsubscribeFromQuote: unsubscribeFromQuote
            };
        };

        return AdvinionDataAdapter();
    }
);
