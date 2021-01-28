define(
    'modules/InstrumentsSearchModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'vendor/latinize'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            latinize = require('vendor/latinize'),
            binaryEnum = {
                bx10000000: parseInt('10000000', 2),
                bx01000000: parseInt('01000000', 2),
                bx00100000: parseInt('00100000', 2),
                bx00010000: parseInt('00010000', 2),

                bx00001000: parseInt('00001000', 2),
                bx00000100: parseInt('00000100', 2),
                bx00000010: parseInt('00000010', 2),
                bx00000001: parseInt('00000001', 2)
            },
            scoresConfig = [
                {
                    field: 'instrumentName',
                    startWithScore: binaryEnum.bx10000000,
                    middleOfScore: binaryEnum.bx00001000
                },
                {
                    field: 'symbolName',
                    startWithScore: binaryEnum.bx01000000,
                    middleOfScore: binaryEnum.bx00000100
                }, {
                    field: 'fullName',
                    startWithScore: binaryEnum.bx00100000,
                    middleOfScore: binaryEnum.bx00000010
                }, {
                    field: 'fullText',
                    startWithScore: binaryEnum.bx00010000,
                    middleOfScore: binaryEnum.bx00000001
                }
            ],
            charactersToEscapeRegex = /[-[\]{}()*+?.,\\/^$|#\s]/g;

        function InstrumentsSearchModuleClass(instruments) {
            var allInstruments = instruments || ko.observableArray([]),
                prevSearchString = "",
                searchResult = ko.observableArray();

            function getInstrumentIndex(instrument) {
                var index = allInstruments().findIndex(function (item) {
                    return item.id === instrument.id;
                });

                return index;
            }

            function buildScores(arrayToSearchFor, searchString) {
                var latinizedSearchString = latinize(searchString)
                    .replace(charactersToEscapeRegex, '\\$&');

                var matchRegex = new RegExp('(' + latinizedSearchString + ')', 'im');

                var scores = arrayToSearchFor.map(function (instrument) {
                    var index = getInstrumentIndex(instrument),
                        score = 0;

                    scoresConfig.forEach(function (scoreConfig) {
                        if (!instrument[scoreConfig.field]) {
                            return;
                        }

                        var match = latinize(instrument[scoreConfig.field]).match(matchRegex);

                        if (!general.isNullOrUndefined(match)) {
                            if (match.index === 0) {
                                score = scoreConfig.startWithScore | score;
                            }

                            if (match.index > 0) {
                                score = scoreConfig.middleOfScore | score;
                            }
                        }
                    });

                    return {
                        idx: index,
                        ccyOrder: instrument.ccyOrder,
                        score: score
                    };
                });

                return scores;
            }

            function getResultsFromScores(scores) {
                return scores.map(function (element) {
                    return allInstruments()[element.idx];
                });
            }

            function searchInternal(arrayToSearchFor, searchString) {
                var scores = buildScores(arrayToSearchFor, searchString);

                scores = scores.filter(function (element) {
                    return element.score && element.score > 0;
                });

                scores.sort(function (elementA, elementB) {
                    var dif = elementB.score - elementA.score;

                    if (dif === 0) {
                        dif = elementA.ccyOrder - elementB.ccyOrder;
                    }

                    return dif;
                });

                var results = getResultsFromScores(scores);

                searchResult(results);
                prevSearchString = searchString;

                return results;
            }

            function canReusePreviousSearch(searchString) {
                return ("" === prevSearchString) || (0 !== searchString.toLowerCase().indexOf(prevSearchString.toLowerCase())) || (0 >= searchResult().length);
            }

            function typingSearch(searchString) {
                if (searchString.term) {
                    searchString = searchString.term;
                }

                if (canReusePreviousSearch(searchString)) {
                    return searchInternal(allInstruments(), searchString);
                } else {
                    return searchInternal(searchResult(), searchString);
                }
            }

            function search(searchString) {
                return searchInternal(allInstruments(), searchString);
            }

            function dispose() {
                allInstruments = null;
                searchResult.removeAll();
                prevSearchString = "";
            }

            return {
                dispose: dispose,
                search: search,
                typingSearch: typingSearch,
                searchResult: searchResult
            };
        }

        return InstrumentsSearchModuleClass;
    }
);