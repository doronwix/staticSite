/* global General */
var TDALTradingSignals = function () {
    function getLatestTradingSignal(signalData, OnLoadComplete) {
        if (!General.isFunctionType(OnLoadComplete)) {
            OnLoadComplete = General.emptyFn;
        }

        var ajaxer = TAjaxer(),
            params = General.urlEncode(signalData);

        return ajaxer.promises.get(
            "TDALTradingSignals/getLatestTradingSignal",
            "api/tradingsignals/GetLatestTradingSignal",
            params,
            OnLoadComplete,
            function () {
                ErrorManager.onError("TDALTradingSignals/getLatestTradingSignal", "", eErrorSeverity.medium);
            },
            0
        );
    }

    function getSignalsDetailsForTechAnalysis(signalData, OnLoadComplete) {
        if (!General.isFunctionType(OnLoadComplete)) {
            OnLoadComplete = General.emptyFn;
        }

        var ajaxer = TAjaxer(),
            params = General.urlEncode(signalData);

        return ajaxer.promises.get(
            "TDALTradingSignals/getSignalsDetailsForTechAnalysis",
            "api/tradingsignals/GetSignalsDetailsForTechAnalysis",
            params,
            OnLoadComplete,
            function () {
                ErrorManager.onError("TDALTradingSignals/getSignalsDetailsForTechAnalysis", "", eErrorSeverity.medium);
            },
            0
        );
    }

    function getTradingSignal(signalData, OnLoadComplete) {
        if (!General.isFunctionType(OnLoadComplete)) {
            OnLoadComplete = General.emptyFn;
        }

        var ajaxer = TAjaxer(),
            params = General.urlEncode(signalData);

        return ajaxer.promises.get(
            "TDALTradingSignals/getTradingSignal",
            "api/tradingsignals/GetTradingSignal",
            params,
            OnLoadComplete,
            function () {
                ErrorManager.onError("TDALTradingSignals/getTradingSignal", "", eErrorSeverity.medium);
            },
            0
        );
    }

    function getSignalsForGrids(signalData, OnLoadComplete) {
        if (!General.isFunctionType(OnLoadComplete)) {
            OnLoadComplete = General.emptyFn;
        }

        var ajaxer = TAjaxer(),
            params = "";

        return ajaxer.promises.get(
            "TDALTradingSignals/getSignalsForGrids",
            "api/tradingsignals/GetSignalsForGrids?filters=[" + signalData + "]",
            params,
            OnLoadComplete,
            function () {
                ErrorManager.onError("TDALTradingSignals/getSignalsForGrids", "", eErrorSeverity.medium);
            },
            0
        );
    }

    return {
        getLatestTradingSignal: getLatestTradingSignal,
        getSignalsDetailsForTechAnalysis: getSignalsDetailsForTechAnalysis,
        getTradingSignal: getTradingSignal,
        getSignalsForGrids: getSignalsForGrids
    };
};