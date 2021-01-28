/* global JSONHelper, General */
var TDALMarketState = function () {
    function getData() {
        var ajaxer = new TAjaxer();

        return ajaxer.promises
            .get('TDALMarketState/get', 'api/MarketState/GetState')
            .then(analyzeResponse)
            .fail(throwError);
    }

    function throwError(error) {
        ErrorManager.onError('TDALMarketState/get', '', eErrorSeverity.high);

        throw error;
    }

    function analyzeResponse(responseText) {
        var response = JSONHelper.STR2JSON('dalMarketState:analyzeResponse', responseText);

        if (General.isNullType(response) || response.status === 'ServerError') {
            throw new Error('Cannot get market state');
        }

        return response.Result;
    }

    return {
        GetData: getData
    };
};
