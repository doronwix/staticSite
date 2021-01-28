define(
    'managers/AdvinionChart/TradingChartsManager',
    [
        'require',
        'handlers/general',
        'managers/AdvinionChart/AdvinionDataAdapter',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'initdatamanagers/Customer',
        'Dictionary',
        'vendor/latinize'
    ],
    function TradingChartsManagerDef(require) {
        var advinionDataAdapter = require('managers/AdvinionChart/AdvinionDataAdapter'),
            general = require('handlers/general'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            customer = require('initdatamanagers/Customer'),
            dictionary = require('Dictionary'),
            latinize = require('vendor/latinize'),
            constants = {
                dialogCompares: 'dialogcompares',
                comparesgrp: 'majors',
                compares: 'compares',
                tickTimeFrame: eChartTimeFramesIds.tick, // 1 tick
                minuteTimeFrame: '1M'
            };

        function TradingChartsManager() {
            var subscribers = {};

            function subscribe(subscriberGuid) {
                if (subscribers[subscriberGuid]) {
                    return;
                }

                subscribers[subscriberGuid] = [];
            }

            function unsubscribe(subscriberGuid) {
                if (subscribers[subscriberGuid]) {
                    cleanUnused(subscriberGuid, []);
                    delete subscribers[subscriberGuid];
                }
            }

            function getRecentHistory(request) {
                if (request.timeFrame === constants.tickTimeFrame) {
                    return advinionDataAdapter.getHistoryTicks(request);
                } else {
                    return advinionDataAdapter.getHistoryRates(request);
                }
            }

            function getMultiRTResponseData(instrumentIds, orderDir) {
                var responseData = [];

                for (var counter = 0; counter < instrumentIds.length; counter++) {
                    var instrumentId = parseInt(instrumentIds[counter]),
                        quote = advinionDataAdapter.getQuoteData(instrumentId, orderDir);

                    if (quote.isInactive) {
                        continue;
                    }

                    responseData.push(advinionDataAdapter.getMapper().mapMultiRTObject(instrumentId, quote.value));
                }

                return responseData;
            }

            function cleanUnused(chartGuid, newInstrumentsIds) {
                var currentChartSubscribedInstruments = subscribers[chartGuid],
                    chartKeys = Object.keys(subscribers);

                subscribers[chartGuid] = newInstrumentsIds;

                var subscribedInstruments = []

                chartKeys.forEach(function (key) {
                    subscribedInstruments = subscribedInstruments.concat(subscribers[key]);
                });

                var intrumentsForUnsubscribe = currentChartSubscribedInstruments.filter(function (id) {
                    return subscribedInstruments.indexOf(id) < 0;
                });

                intrumentsForUnsubscribe.forEach(advinionDataAdapter.unsubscribeFromQuote)
            }

            function getMultiRT(chartGuid, instrumentIds, orderDir) {
                if (!subscribers[chartGuid]) {
                    return null;
                }

                cleanUnused(chartGuid, instrumentIds);

                var responseData = getMultiRTResponseData(instrumentIds, orderDir);

                if (responseData.length === 0) {
                    return null;
                }

                return responseData;
            }

            function getSymbolsByGroup(strGroup, instrumentId, comparisonInstrumentsNumber, instrumentsNumber) {
                var isCompareGroup = strGroup === constants.comparesgrp;
                var favoriteInstruments = instrumentsManager.GetFavoriteInstruments(isCompareGroup ? comparisonInstrumentsNumber : instrumentsNumber);
                var instrumentsToReturn = (favoriteInstruments.length > 0) ? favoriteInstruments : instrumentsManager.GetMainMostPopularInstruments();

                instrumentsToReturn = instrumentsToReturn.filter(function (instrument) {
                    return !isCompareGroup || instrument.id !== instrumentId;
                });

                return { data: instrumentsToReturn.map(advinionDataAdapter.getMapper().mapSymbol) }
            }

            function findSymbols(searchString, maxResultCount, isForCompares) {
                var resultData = {
                    data: [
                        getAllTabForSearchResults(searchString, maxResultCount)
                    ]
                };

                if (!isForCompares) {
                    resultData.data.push(getCurrenciesTabForSearchResults(searchString, maxResultCount));
                    resultData.data.push(getCommoditiesTabForSearchResults(searchString, maxResultCount));
                    resultData.data.push(getCryptoTabForSearchResults(searchString, maxResultCount));

                    if (customer.prop.futureStatus != eTradingPermissions.Blocked) {
                        resultData.data.push(getIndicesTabForSearchResults(searchString, maxResultCount));
                    }

                    if (customer.prop.shareStatus != eTradingPermissions.Blocked) {
                        resultData.data.push(getSharesTabForSearchResults(searchString, maxResultCount));
                        resultData.data.push(getEtfTabForSearchResults(searchString, maxResultCount));
                    }
                }

                return resultData;
            }

            function getAllTabForSearchResults(searchString, maxResultCount) {
                return {
                    categoryId: eInstrumentType.Mixed,
                    categoryLabel: dictionary.GetItem("All","contentdata",' '),
                    categoryDescription: dictionary.GetItem("AllInstruments", "contentdata", ' '),
                    symbols: getAdvinionSymbols(maxResultCount, searchString, eInstrumentType.Mixed)
                };
            }

            function getCurrenciesTabForSearchResults(searchString, searchInstrumentsNumber) {
                return {
                    categoryId: eInstrumentType.Currencies,
                    categoryLabel: dictionary.GetItem("PresetCurrenciesTab", 'PresetsCategories', ' '),
                    categoryDescription: dictionary.GetItem("PresetCurrenciesTab", 'PresetsCategories', ' '),
                    symbols: getAdvinionSymbols(searchInstrumentsNumber, searchString, eInstrumentType.Currencies)
                };
            }

            function getCommoditiesTabForSearchResults(searchString, searchInstrumentsNumber) {
                return {
                    categoryId: eInstrumentType.Commodities,
                    categoryLabel: dictionary.GetItem("PresetCommoditiesTab", 'PresetsCategories', ' '),
                    categoryDescription: dictionary.GetItem("PresetCommoditiesTab", 'PresetsCategories', ' '),
                    symbols: getAdvinionSymbols(searchInstrumentsNumber, searchString, eInstrumentType.Commodities)
                };
            }

            function getIndicesTabForSearchResults(searchString, searchInstrumentsNumber) {
                return {
                    categoryId: eInstrumentType.Indices,
                    categoryLabel: dictionary.GetItem("PresetIndicesTab", 'PresetsCategories', ' '),
                    categoryDescription: dictionary.GetItem("PresetIndicesTab", 'PresetsCategories', ' '),
                    symbols: getAdvinionSymbols(searchInstrumentsNumber, searchString, eInstrumentType.Indices)
                };
            }

            function getSharesTabForSearchResults(searchString, searchInstrumentsNumber) {
                return {
                    categoryId: eInstrumentType.Shares,
                    categoryLabel: dictionary.GetItem("PresetSharesTab", 'PresetsCategories', ' '),
                    categoryDescription: dictionary.GetItem("PresetSharesTab", 'PresetsCategories', ' '),
                    symbols: getAdvinionSymbols(searchInstrumentsNumber, searchString, eInstrumentType.Shares)
                };
            }

            function getEtfTabForSearchResults(searchString, searchInstrumentsNumber) {
                return {
                    categoryId: eInstrumentType.ETF,
                    categoryLabel: dictionary.GetItem("PresetETFTab", 'PresetsCategories', ' '),
                    categoryDescription: dictionary.GetItem("PresetETFTab", 'PresetsCategories', ' '),
                    symbols: getAdvinionSymbols(searchInstrumentsNumber, searchString, eInstrumentType.ETF)
                };
            }

            function getCryptoTabForSearchResults(searchString, searchInstrumentsNumber) {
                return {
                    categoryId: eInstrumentType.Crypto,
                    categoryLabel: dictionary.GetItem("PresetCryptoTab", 'PresetsCategories', ' '),
                    categoryDescription: dictionary.GetItem("PresetCryptoTab", 'PresetsCategories', ' '),
                    symbols: getAdvinionSymbols(searchInstrumentsNumber, searchString, eInstrumentType.Crypto)
                };
            }

            function getDefaultInstrument(instrumentId) {
                var result;

                if (general.isEmptyValue(instrumentId)) {
                    result = getFirstFavoriteInstrument();
                } else {
                    result = instrumentsManager.GetInstrument(instrumentId); // works only for currencies
                }

                if (!result) {
                    // in case of shares - get instrument from other source
                    var defaultInstrumentId = instrumentsManager.GetUserDefaultInstrumentId();
                    result = instrumentsManager.GetInstrument(defaultInstrumentId);
                }

                return result;
            }

            function getFirstFavoriteInstrument() {
                return instrumentsManager.GetFavoriteInstruments(1)[0];
            }

            function getAdvinionSymbols(maxCount, searchString, instrumentType) {
                var latinizedSearchString = latinize(searchString).toLowerCase(),
                    filteredSymbols = [];

                instrumentsManager.ForeachInstrument(function filterSymbols(id, instrument) {
                    if (isSymbolMatched(instrument, instrumentType, latinizedSearchString)) {
                        filteredSymbols.push(advinionDataAdapter.getMapper().mapSymbol(instrument));
                    }
                });

                filteredSymbols.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                });

                return filteredSymbols.slice(0, maxCount);
            }

            function isSymbolMatched(instrument, instrumentType, latinizedSearchString) {
                if (latinizedSearchString === String.empty) {
                    return true;
                }

                var instrumentLatinizedDescription = instrumentTranslationsManager.GetFullTextLatinized(instrument.id).toLowerCase();

                return instrumentLatinizedDescription.containsNotEmpty(latinizedSearchString) &&
                    (instrumentType === eInstrumentType.Mixed || instrument.instrumentTypeId === instrumentType);
            }

            function getAdvinionInstrument(instrumentId) {
                var current = instrumentsManager.GetInstrument(instrumentId);

                return general.isEmptyType(current)
                    ? advinionDataAdapter.getMapper().mapSymbolLite(instrumentId)
                    : advinionDataAdapter.getMapper().mapSymbol(current);
            }

            return {
                subscribe: subscribe,
                unsubscribe: unsubscribe,
                GetSymbolsByGroup: getSymbolsByGroup,
                GetRecentHistory: getRecentHistory,
                GetMultiRT: getMultiRT,
                FindSymbols: findSymbols,
                GetTimeScalesAsync: advinionDataAdapter.getTimeScalesAsync,
                GetDefaultInstrument: getDefaultInstrument,
                GetAdvinionInstrument: getAdvinionInstrument
            };
        }

        return TradingChartsManager();
    }
);