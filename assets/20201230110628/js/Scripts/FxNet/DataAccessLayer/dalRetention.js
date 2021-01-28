var TDALRetention = function () {
    //-----------------------------------------------------------------
    // getToken
    //-----------------------------------------------------------------
    function getToken(onSuccess) {
        var ajaxer = new TAjaxer();

        var params = "";

        return ajaxer.promises.get(
            "TDALRetention/getToken",
            $customer.prop.interactiveMessagesToken,
            params,
            onSuccess,
            function (error) {
                ErrorManager.onError("TDALRetention/getToken", ErrorManager.getFullExceptionMessage(error), eErrorSeverity.high);
            },
            null, null, null, false
        );
    }
    return {
        GetToken: getToken
    };
};