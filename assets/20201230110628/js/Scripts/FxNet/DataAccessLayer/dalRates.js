define(
    'dataaccess/dalRates',
    [
        'require',
        'generalmanagers/ErrorManager',
        'JSONHelper'
    ],
    function DalRatessDef(require) {
        var ErrorManager = require('generalmanagers/ErrorManager'),
            JSONHelper = require('JSONHelper');

        var DalRatess = function DalRatessClass() {
            function fetchPeriods(instrumentId, direction, selection) {
                var ajaxer = new TAjaxer(),
                    callerInfo = 'dalRates/FetchPeriods',
                    url = 'FeedsHistory/GetTermResults',
                    payload = JSON.stringify({
                        instrumentId: instrumentId,
                        termIds: selection,
                        direction: direction
                    });

                return ajaxer.promises
                    .jsonPost(callerInfo, url, payload)
                    .then(function (response) {
                        return parseResult(response);
                    })
                    .fail(function (error) {
                        throwError('TDALRatesData/fetchRates', error);
                    });
            }

            function parseResult(response) {
                var parsedResponse = JSONHelper.STR2JSON("dalRates:parseResult", response);

                return parsedResponse.length
                    ? parsedResponse.map(function (period) {
                        return {
                            id: period[eRateIDataPositions.Id],
                            low: period[eRateIDataPositions.Low],
                            high: period[eRateIDataPositions.High]
                        };
                    })
                    : [];
            }

            function throwError(caller, error) {
                ErrorManager.onError(caller, '', eErrorSeverity.high);

                throw error;
            }

            return {
                FetchPeriods: fetchPeriods
            };
        };

        return new DalRatess();
    }
);