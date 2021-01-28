define(
    'managers/AdvinionChart/AdvinionDataObjectsMapper',
    [
        'require',
        'handlers/general',
        'cachemanagers/CacheManager',
        'managers/instrumentTranslationsManager'
    ],
    function(require) {
        var cacheManager = require('cachemanagers/CacheManager'),
            general = require('handlers/general'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager');

        var AdvinionDataObjectsMapper = function() {
            var constants = { symbolsExchangeId: "advinion" },
                regExForNumbersOnly = /[\D]/g,
                currentCenturyYearPrefix = '20',
                previousCenturyYearPrefix = '19',
                quotesVM = {};

            function init(quotesSubscriber) {
                quotesVM = quotesSubscriber;
            }

            function dispose() {
            }

            function arraySwapElements(firstPosition, secondPosition, array) {
                array[firstPosition] = array.splice(secondPosition, 1, array[firstPosition])[0];
            }

            function mapCandleOrTickDateToAdvinionDate(dateTimeString) {
                // "dd/MM/yy HH:mm:ss" => "yyyy M d h m s"
                var finalYearPosition = 0,
                    finalDayPosition = 2,
                    dateTimeElements = dateTimeString.split(regExForNumbersOnly);

                arraySwapElements(finalYearPosition, finalDayPosition, dateTimeElements);

                var year = dateTimeElements[finalYearPosition],
                    currentYear = (new Date()).getFullYear();

                dateTimeElements[finalYearPosition] = parseInt(currentCenturyYearPrefix + year) > currentYear
                    ? previousCenturyYearPrefix + year
                    : currentCenturyYearPrefix + year;

                return dateTimeElements.join(' ');
            }

            function mapServerDateToAdvinionDate() {
                var dateToFormat = new Date(cacheManager.ServerTime().getTime());

                var year = dateToFormat.getFullYear();
                var month = dateToFormat.getMonth() + 1;
                var day = dateToFormat.getDate();
                var hour = dateToFormat.getHours();
                var minute = dateToFormat.getMinutes();
                var second = dateToFormat.getSeconds();

                if (month.toString().length == 1) {
                    month = '0' + month;
                }

                if (day.toString().length == 1) {
                    day = '0' + day;
                }

                if (hour.toString().length == 1) {
                    hour = '0' + hour;
                }

                if (minute.toString().length == 1) {
                    minute = '0' + minute;
                }

                if (second.toString().length == 1) {
                    second = '0' + second;
                }

                return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
            }

            function mapTickObject(historyQuoteValue) {
                return {
                    open: Number(historyQuoteValue[eTickHistoryProperites.rate]),
                    close: Number(historyQuoteValue[eTickHistoryProperites.rate]),
                    low: Number(historyQuoteValue[eTickHistoryProperites.rate]),
                    high: Number(historyQuoteValue[eTickHistoryProperites.rate]),
                    ask: 0,
                    bid: 0,
                    other: 0,
                    date: mapCandleOrTickDateToAdvinionDate(historyQuoteValue[eTickHistoryProperites.date])
                };
            }

            function mapCandleObject(historyQuoteValue) {
                return {
                    open: Number(historyQuoteValue[eCandleHistoryProperites.open]),
                    close: Number(historyQuoteValue[eCandleHistoryProperites.close]),
                    low: Number(historyQuoteValue[eCandleHistoryProperites.low]),
                    high: Number(historyQuoteValue[eCandleHistoryProperites.high]),
                    ask: 0,
                    bid: 0,
                    other: 0,
                    date: mapCandleOrTickDateToAdvinionDate(historyQuoteValue[eCandleHistoryProperites.date])
                };
            }

            function mapSymbolLite(instrumentId) { // works for cfds,shares items
                var quote = quotesVM.GetQuote(instrumentId);

                return {
                    exchangeId: constants.symbolsExchangeId,
                    marketId: eInstrumentType.Shares,
                    countryId: "",
                    id: instrumentId,
                    name: getInstrumentName(instrumentId),
                    description: getInstrumentName(instrumentId),
                    precision: general.lenAfterDelimeter(quote.midRate()),
                    timescales: null,
                    defaultTimescale: null
                };
            }

            function mapSymbol(instrument) { // works for items in instrumentsmanager
                return {
                    exchangeId: constants.symbolsExchangeId,
                    marketId: instrument.instrumentTypeId,
                    countryId: "",
                    id: instrument.id,
                    name: getInstrumentName(instrument.id),
                    description: getInstrumentDescription(instrument.id),
                    precision: instrument.DecimalDigit,
                    timescales: null,
                    defaultTimescale: null
                };
            }

            function mapComparisonSymbol(instrument) {
                return {
                    name: getInstrumentName(instrument.id),
                    id: instrument.id,
                    description: getInstrumentDescription(instrument.id)
                };
            }

            function mapRecentHistoryObject(instrument, historyData) {
                return {
                    id: instrument,
                    lastTimeStamp: mapServerDateToAdvinionDate(),
                    data: historyData
                };
            }

            function mapMultiRTObject(instrumentId, value) {
                var currentTimeStamp = mapServerDateToAdvinionDate();

                return {
                    id: instrumentId,
                    lastTimeStamp: currentTimeStamp,
                    data: [{ ask: value, bid: value, other: 0, date: currentTimeStamp }]
                };
            }

            function getInstrumentName(instrumentId) {
                return instrumentTranslationsManager.Long(instrumentId);
            }

            function getInstrumentDescription(instrumentId) {
                return instrumentTranslationsManager.GetTooltipByInstrumentId(instrumentId);
            }

            //Return YYYY-MM-DD hh:mm:ss
            function mapFormatedDate(date) {
                return date.getFullYear() + "-" +
                ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
                ("00" + date.getDate()).slice(-2) + " " +
                ("00" + date.getHours()).slice(-2) + ":" +
                ("00" + date.getMinutes()).slice(-2) + ":" +
                ("00" + date.getSeconds()).slice(-2);
            }

            //Input: yyyy MM dd HH dd ss
            //Return: yyyyMMddhhmmssfff
            function mapAdvinonFromDateToJSONSerializedDate(dateString) {
                return mapAdvionDateToJSONSerirializedDate(dateString, '000');
            }

            //Input: yyyy-MM-dd HH:dd:ss
            //Return: yyyyMMddhhmmssfff
            function mapAdvinonToDateToJSONSerializedDate(dateString) {
                return mapAdvionDateToJSONSerirializedDate(dateString, '999');
            }

            //Input: yyyy MM dd HH dd ss / yyyy-MM-dd HH dd ss
            //Return: yyyyMMddhhmmssfff
            function mapAdvionDateToJSONSerirializedDate(dateString, milisecond) {
                if (general.isEmptyType(dateString) || !general.isStringType(dateString)) {
                    return null;
                }

                return dateString.replace(/[-: ]/g, '') + milisecond;
            }

            return {
                init: init,
                dispose: dispose,
                mapTickObject: mapTickObject,
                mapCandleObject: mapCandleObject,
                mapSymbol: mapSymbol,
                mapComparisonSymbol: mapComparisonSymbol,
                mapMultiRTObject: mapMultiRTObject,
                mapRecentHistoryObject: mapRecentHistoryObject,
                mapSymbolLite: mapSymbolLite,
                mapFormatedDate: mapFormatedDate,
                mapAdvinonFromDate: mapAdvinonFromDateToJSONSerializedDate,
                mapAdvinonToDate: mapAdvinonToDateToJSONSerializedDate
            };
        }

        return new AdvinionDataObjectsMapper();
    }
);