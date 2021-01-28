/*global eSignalType */
define(
    'FxNet/LogicLayer/Signals/SignalsGridsHandler',
    [
        'require',
        'dataaccess/dalTradingSignals',
        'Q',
        'JSONHelper',
        'handlers/general',
    ],
    function (require) {
        var dalTradingSignals = require('dataaccess/dalTradingSignals'),
            JSONHelper = require('JSONHelper'),
            Q = require('Q'),
            general = require('handlers/general'),
            requestTimer = 0,
            requestHolder = {};

        function deferredLoadData(collectedRequests) {
            requestHolder = {};

            var filter = [];

            for (var grid in collectedRequests) {
                if (collectedRequests.hasOwnProperty(grid)) {
                    filter.push(JSON.stringify(collectedRequests[grid].params));
                }
            }

            dalTradingSignals
                .getSignalsForGrids(filter)
                .then(function (responseText) {
                    return JSONHelper.STR2JSON("getSignalsForGrids/onLoadComplete", responseText);
                })
                .then(function (result) {
                    result = result || [];

                    for (var i = 0; i < result.length; i++) {
                        var type = result[i].type;

                        if (typeof collectedRequests[type] !== "undefined" && typeof collectedRequests[type].defer !== "undefined") {
                            collectedRequests[type].defer.resolve(result[i]);
                        }
                    }
                }).done();
        }

        /**
         * var params = {
         *      type: eSignalType.TechnicalAnalysis,
         *      symbol: 'EUR',
         *      page: 1
         * };
         * 
         * @param {Object} params 
         * @returns {Promise} 
         */
        function loadData(params, callback) {
            var defer = Q.defer();

            if (requestTimer) {
                clearTimeout(requestTimer);
                requestTimer = 0;
            }

            requestHolder[params.type] = {
                params: params,
                defer: defer
            };

            requestTimer = setTimeout(deferredLoadData, 300, requestHolder);

            return defer.promise.then(function (response) {
                if (general.isFunctionType(callback)) {
                    callback(response);
                }

                return response;
            });
        }

        return {
            LoadData: loadData
        };
    }
);
