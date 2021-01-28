function TDALClosedDeals(ErrorManager, general) {
    function ensurePositionNumber(params) {
        if (general.isEmptyType(params['positionNumber'])) {
            params['positionNumber'] = 0;
        }
    }

    function ensureInstrumentId(params) {
        if (general.isEmptyType(params['instrumentId']) || params['instrumentId'] == Number.MAX_SAFE_INTEGER || params['instrumentId'] === -1) {
            params['instrumentId'] = 0;
        }
    }

    function loadClosedDeals(params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};

        ensurePositionNumber(params);
        ensureInstrumentId(params);

        ajaxer.get(
            "dalClosedDeals/LoadClosedDeals",
            "api/closeddeals/LoadClosedDeals",
            general.urlEncode(params),
            onLoadComplete,
            function () {
                ErrorManager.onError("dalClosedDeals/loadClosedDealsSummaries", "", eErrorSeverity.medium);
            }
        );
    }

    function loadClosedDealsSummaries(params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};

        ensurePositionNumber(params);
        ensureInstrumentId(params);

        ajaxer.get(
            "dalClosedDeals/loadClosedDealsSummaries",
            "api/closeddeals/LoadClosedDealsSummaries",
            general.urlEncode(params),
            onLoadComplete,
            function () {
                ErrorManager.onError("dalClosedDeals/loadClosedDealsSummaries", "", eErrorSeverity.medium);
            }
        );
    }

    function loadClosedDealsSummariesWithThreshold(params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};

        ensurePositionNumber(params);
        ensureInstrumentId(params);

        ajaxer.get(
            "dalClosedDeals/loadClosedDealsSummariesWithThreshold",
            "api/closeddeals/LoadClosedDealsSummariesWithThreshold",
            general.urlEncode(params),
            onLoadComplete,
            function () {
                ErrorManager.onError("dalClosedDeals/loadClosedDealsSummaries", "", eErrorSeverity.medium);
            }
        );
    }

    function loadRolledOverHistory(filter, onLoadComplete) {
        var ajaxer = new TAjaxer(),
            positionNumber = filter.PositionNumber,
            page = filter.Page,
            pageSize = filter.PageSize,
            params = "positionNumber=" + positionNumber + "&" +
                "page=" + page + "&" +
                "pageSize=" + pageSize;

        ajaxer.get(
            "TDALHistoricalData/loadRolledOverHistory",
            "api/closeddeals/LoadRolledOverHistory",
            params,
            onLoadComplete,
            function () {
                ErrorManager.onError("TDALHistoricalData/loadRolledOverHistory", "", eErrorSeverity.medium);
            }
        );
    }

    return {
        LoadClosedDeals: loadClosedDeals,
        LoadRolledOverHistory: loadRolledOverHistory,
        LoadClosedDealsSummaries: loadClosedDealsSummaries,
        LoadClosedDealsSummariesWithThreshold: loadClosedDealsSummariesWithThreshold
    };
}
