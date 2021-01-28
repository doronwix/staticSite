var TDALInitialData = function (errorManager) {
    var getData = function(onSuccess) {
        var ajaxer = new TAjaxer();

        return ajaxer.promises.get(
            "TDALInitialData/getData",
            "InitialData/GetData",
            "",
            onSuccess,
            function(error) {
                errorManager.onError("TDALInitialData/getData", errorManager.getFullExceptionMessage(error), eErrorSeverity.high);
            },
            null, null, null, false
        );
    };

    return {
        GetData: getData
    };
};