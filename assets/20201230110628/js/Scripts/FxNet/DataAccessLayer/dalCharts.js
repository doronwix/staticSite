define(
    'dataaccess/dalCharts',
    [
        'require',
        'handlers/general',
        'handlers/Ajaxer',
        'generalmanagers/ErrorManager',
        'JSONHelper'
    ],
    function DalChartsDef(require) {
        var general = require('handlers/general'),
            TAjaxer = require('handlers/Ajaxer'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            JSONHelper = require('JSONHelper');

        var dalCharts = function DalChartsClass() {
            function validateGetCandlesModel(model) {
                if (!model || !model.instrumentId ||
                    general.isEmptyValue(model.periodId) ||
                    !model.numCandles ||
                    general.isEmptyValue(model.rateType)) {
                    throwError('TDALChartsData/getCandles', 'Missing parameter values');
                }

                if (!(general.isNumberType(model.instrumentId) &&
                    general.isNumberType(model.periodId) &&
                    general.isNumberType(model.numCandles))) {
                    throwError('TDALChartsData/getCandles', 'Invalid parameter values');
                }
            }

            function validateGetTicksModel(model) {
                if (!model ||
                    !model.instrumentId ||
                    !model.numTicks ||
                    general.isEmptyValue(model.rateType)) {
                    throwError('TDALChartsData/getTicks', 'Missing parameter values');
                }

                if (!(general.isNumberType(model.instrumentId) &&
                    general.isNumberType(model.numTicks))) {
                    throwError('TDALChartsData/getTicks', 'Invalid parameter values');
                }
            }

            function getTicks(model) {
                validateGetTicksModel(model);

                var ajaxer = new TAjaxer(),
                    params = general.urlEncode({
                        instrumentId: model.instrumentId,
                        numTicks: model.numTicks,
                        rateType: model.rateType,
                        fromDate: model.fromDate,
                        toDate: model.toDate,
                    });

                return ajaxer.promises
                    .get('TDALChartsData/getTicks', 'FeedsHistory/GetTicks', params)
                    .then(analyzeResponse)
                    .fail(function onGetTicksError(error) {
                        throwError('TDALChartsData/getTicks', error);
                    });
            }

            function getCandles(model) {
                validateGetCandlesModel(model);

                var ajaxer = new TAjaxer(),
                    params = general.urlEncode({
                        instrumentId: model.instrumentId,
                        periodId: model.periodId,
                        numCandles: model.numCandles,
                        rateType: model.rateType,
                        fromDate: model.fromDate,
                        toDate: model.toDate,
                    });

                return ajaxer.promises
                    .get('TDALChartsData/getCandles',
                        'FeedsHistory/GetCandles',
                        params,
                        null,
                        null,
                        1,
                        2
                    )
                    .then(analyzeResponse)
                    .fail(function onGetCandlesError(error) {
                        throwError('TDALChartsData/getCandles', error);
                    });
            }

            function getPeriods() {
                var ajaxer = new TAjaxer();

                return ajaxer.promises
                    .get('TDALChartsData/getPeriods', 'FeedsHistory/GetCandlePeriods')
                    .then(analyzeResponse)
                    .fail(function onGetPeriodsError(error) {
                        throwError('TDALChartsData/getPeriods', error);
                    });
            }

            function throwError(caller, error) {
                ErrorManager.onError(caller, '', eErrorSeverity.high);

                throw error;
            }

            function analyzeResponse(responseText) {
                var response = JSONHelper.STR2JSON(
                    'dalCharts:analyzeResponse',
                    responseText
                );

                if (general.isNullType(response) || response.status === 'ServerError') {
                    throw new Error('Cannot get chart data');
                }

                return response.result || response;
            }

            return {
                GetCandles: getCandles,
                GetTicks: getTicks,
                GetPeriods: getPeriods,
            };
        };

        return new dalCharts();
    }
);
