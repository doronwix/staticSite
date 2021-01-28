define(
    "dataaccess/Backoffice/dalCurrencyConverter",
    [
        'generalmanagers/ErrorManager'
    ],
    function (errorManager) {
        var self = {},
            baseUrl = 'api/backoffice/currencyconverter';

        self.GetCurrencies = function () {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .get("dalCurrencyConverter/GetCurrencies", baseUrl + "/getcurrencies", null, null, null, null, null, null, false)
                .then(function (responseText) {
                    var response = JSONHelper.STR2JSON("getConversionRateFormated/onLoadComplete", responseText);

                    return response;
                })
                .fail(function (error) {
                    errorManager.onError("dalConversion/getConversionRateFormated", "", eErrorSeverity.medium);

                    throw error;
                });
        };

        self.Convert = function (fromSymbolId, toSymbolId, amount) {
            var convertCurrencyRequest = {
                FromSymbolId: fromSymbolId,
                ToSymbolId: toSymbolId,
                Amount: amount
            };

            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .jsonPost("dalCurrencyConverter/Convert", baseUrl + '/convert', JSON.stringify(convertCurrencyRequest))
                .then(function (responseText) {
                    var response = JSONHelper.STR2JSON("getConversionRateFormated/onLoadComplete", responseText);

                    return response;
                })
                .fail(function (error) {
                    errorManager.onError("dalConversion/getConversionRateFormated", "", eErrorSeverity.medium);

                    throw error;
                });
        }

        return self;
    }
);
