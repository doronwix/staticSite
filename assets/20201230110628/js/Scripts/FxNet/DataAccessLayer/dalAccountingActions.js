function TDALAccountingActions(ErrorManager, general) {
    function loadAccountingActions(filter, OnLoadComplete) {
        var ajaxer = new TAjaxer();

        var requestFilter = {
            symbolId: filter.SymbolId,
            actionCategory: filter.ActionCategory,
            from: filter.From,
            to: filter.To,
            page: filter.Page,
            position: filter.Position,
            pageSize: filter.pagesize || filter.PageSize,
            exportdata: filter.exportdata || false,
            showCosts: filter.ShowCosts || false,
            closedDate: filter.ClosedDate
        };

        ajaxer.get(
            "TDALAccountingActions/loadAccountingActions",
            "api/accountingactions/GetData",
            general.urlEncode(requestFilter),
            OnLoadComplete,
            function () {
                ErrorManager.onError("TDALAccountingActions/loadAccountingActions", "", eErrorSeverity.medium);
            }
        );
    }

    function getAccountSymbols(OnLoadSymbolsComplete) {
        var ajaxer = new TAjaxer();

        ajaxer.get(
            "TDALAccountingActions/getAccountSymbols",
            "api/accountingactions/GetAccountSymbols",
            "",
            OnLoadSymbolsComplete,
            function () {
                ErrorManager.onError("TDALAccountingActions/getAccountSymbols", "", eErrorSeverity.medium);
            }
        );
    }

    function getContractRollover(filter, OnLoadComplete) {
        var ajaxer = TAjaxer();

        var requestFilter = {
            page: filter.Page,
            position: filter.Position,
            pageSize: filter.pagesize || filter.PageSize,
            exportdata: filter.exportdata || false
        };

        ajaxer.get(
            "TDALAccountingActions/getContractRollover",
            "api/accountingactions/GetAdditionalPl",
            general.urlEncode(requestFilter),
            OnLoadComplete,
            function () {
                ErrorManager.onError("TDALAccountingActions/getContractRollover", "", eErrorSeverity.medium);
            }
        );
    }

    return {
        LoadAccountingActions: loadAccountingActions,
        GetAccountSymbols: getAccountSymbols,
        GetContractRollover: getContractRollover
    };
}
