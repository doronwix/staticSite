var dalTransactionsReport = function (ErrorManager, general) {
    //load transactions
    var loadTransactions = function(params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};
        ajaxer.post(
            "TransactionsReportViewModel/getTransactions",
            "api/transactionreport/LoadTransactionsReport",
            general.urlEncode(params),
            onLoadComplete,
            function() {
                ErrorManager.onError("dalTransactionsReport/getTransactions", "", eErrorSeverity.medium);
            },
            0
        );
    };
    return {
        LoadTransactions: loadTransactions
    };
};
