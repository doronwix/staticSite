define("dataaccess/dalConversion",
    [
        "require",
        "JSONHelper",
        'generalmanagers/ErrorManager'
    ],
    function (require) {
        var baseUrl = "api/conversion",
            jsonhelper = require("JSONHelper"),
            errorManager = require('generalmanagers/ErrorManager');

        function getInBetweenQuote(fromSymbolId, toSymbolId) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .get("dalConversion/getInBetweenQuote",
                    String.format("{0}/GetInBetweenQuote/{1}/{2}", baseUrl, fromSymbolId, toSymbolId),
                    "")
                .then(function onResponse(responseText) {
                    var response = jsonhelper.STR2JSON("getInBetweenQuote/onLoadComplete", responseText);

                    return response;
                })
                .fail(function onError(error) {
                    errorManager.onError("dalConversion/getInBetweenQuote", "", eErrorSeverity.medium);

                    throw error;
                });
        }

        function getConversionRateFormated(fromSymbolId, toSymbolId, fromSymbolName, toSymbolName) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .get("dalConversion/getConversionRateFormated",
                    String.format("{0}/GetConversionRateFormated/{1}/{2}/{3}/{4}", baseUrl, fromSymbolId, toSymbolId, fromSymbolName, toSymbolName),
                    "")
                .then(function onResponse(responseText) {
                    var response = jsonhelper.STR2JSON("getConversionRateFormated/onLoadComplete", responseText);

                    return response;
                })
                .fail(function onError(error) {
                    errorManager.onError("dalConversion/getConversionRateFormated", "", eErrorSeverity.medium);

                    throw error;
                });
        }

        return {
            getInBetweenQuote: getInBetweenQuote,
            getConversionRateFormated: getConversionRateFormated
        };
    }
);