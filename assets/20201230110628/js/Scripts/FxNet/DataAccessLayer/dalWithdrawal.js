var TDALWithdrawal = function () {
    var getWithdrawalInfo = function () {
        var ajaxer = new TAjaxer();

        return ajaxer.promises
            .get("dalWithdrawal/getWithdrawalInfo",
                String.format("api/withdrawal/GetWithdrawalInfo/{0}?SecurityToken={1}", $customer.prop.baseCcyId(), systemInfo.securityToken),
                null)
            .fail(function () { ErrorManager.onError("dalWithdrawal/getWithdrawalInfo", "", eErrorSeverity.medium) });
    };

    //---------------------------------------------------
    // getWithdrawalRequestById
    //---------------------------------------------------

    var getWithdrawalRequestById = function (withdrawalID, OnLoadComplete) {
        var ajaxer = new TAjaxer();

        ajaxer.get("dalWithdrawal/getWithdrawalRequestById", String.format("api/withdrawal/GetWithdrawalRequestById/{0}/{1}?SecurityToken={2}", $customer.prop.baseCcyId(), withdrawalID, systemInfo.securityToken),
            null,
            OnLoadComplete,
            function () { ErrorManager.onError("dalWithdrawal/getWithdrawalRequestById", "", eErrorSeverity.medium) },
            0
        );
    };

    //---------------------------------------------------
    // getCCDeposits
    //---------------------------------------------------

    var getCCDeposits = function () {
        var ajaxer = new TAjaxer();

        return ajaxer.promises
            .get("dalWithdrawal/getCCDeposits",
                String.format("api/withdrawal/GetCCDeposits?SecurityToken={0}", systemInfo.securityToken),
                null)
            .fail(function () { ErrorManager.onError("dalWithdrawal/getCCDeposits", "", eErrorSeverity.medium); });
    };

    //---------------------------------------------------
    // saveWithdrawalRequest
    //---------------------------------------------------

    var saveWithdrawalRequest = function (OnLoadComplete, data) {
        var ajaxer = new TAjaxer();

        var sb = new StringBuilder();

        sb.append(String.format("request={0}&", encodeURIComponent(data)));
        sb.append(String.format("SecurityToken={0}", systemInfo.securityToken));

        ajaxer.post("dalWithdrawal/saveWithdrawal", "api/withdrawal/SaveWithdrawal",
            sb.toString(),
            OnLoadComplete,
            function (error) { ErrorManager.onError("dalWithdrawal/saveWithdrawalRequest", error.message, eErrorSeverity.medium) },
            0);
    };

    //---------------------------------------------------
    // saveWithdrawal
    //---------------------------------------------------

    var saveWithdrawalBackOfficeRequest = function (OnLoadComplete, data) {
        var ajaxer = new TAjaxer();

        ajaxer.promises.jsonPost(
            "dalWithdrawal/saveWithdrawal",
            "api/backoffice/withdrawal/saveWithdrawal",
            data)
            .then(function (responseText) {
                var response = JSONHelper.STR2JSON("dalWithdrawal:saveWithdrawalBackOfficeRequest", responseText);

                if (response.Status === eOperationStatus.Success) {
                    responseText = JSONHelper.STR2JSON("dalWithdrawal:saveWithdrawalBackOfficeRequest", responseText);
                    responseText = responseText || {};

                    OnLoadComplete(JSON.stringify(responseText.Result));
                } else {
                    throw new Error("Withdrawal from BackOffice failed. Server error");
                }
            }).fail(
                function (error) {
                    ErrorManager.onError("dalWithdrawal/saveWithdrawalBackOfficeRequest", error.message, eErrorSeverity.medium);
                });
    };

    //---------------------------------------------------
    // getPendingWithdrawals - With Paging
    //---------------------------------------------------

    var getPendingWithdrawals = function (Page, PageSize, OnLoadComplete) {
        var ajaxer = new TAjaxer();

        ajaxer.get("dalWithdrawal/getPendingWithdrawals", String.format("api/withdrawal/GetPendingWithdrawals/{0}/{1}?SecurityToken={2}", Page, PageSize, systemInfo.securityToken),
            null,
            OnLoadComplete,
            function () { ErrorManager.onError("dalWithdrawal/GetPendingWithdrawals", "", eErrorSeverity.medium) },
            0
        );
    };

    //---------------------------------------------------
    // getPendingWithdrawals - NO Paging
    //---------------------------------------------------

    var getAllPendingWithdrawalsByAccount = function (OnLoadComplete) {
        var ajaxer = new TAjaxer();

        ajaxer.get("dalWithdrawal/getAllPendingWithdrawalsByAccount", 
            String.format("api/withdrawal/GetAllPendingWithdrawalsByAccount?SecurityToken={0}", systemInfo.securityToken),
            null,
            OnLoadComplete,
            function () { ErrorManager.onError("dalWithdrawal/getAllPendingWithdrawalsByAccount", "", eErrorSeverity.medium) },
            0);
    };

    //---------------------------------------------------
    // cancelPendingWithdrawal
    //---------------------------------------------------

    var cancelPendingWithdrawal = function (withdrawalnfo) {
        var ajaxer = new TAjaxer();
        var sb = new StringBuilder();

        sb.append(String.format("withdrawalID={0}&", withdrawalnfo[eWithdrawalView.withdrawalID]));
        sb.append(String.format("accountingActionId={0}&", withdrawalnfo[eWithdrawalView.actionID]));
        sb.append(String.format("SecurityToken={0}&", systemInfo.securityToken));
        sb.append(String.format("rv={0}&", encodeURIComponent(withdrawalnfo[eWithdrawalView.rowVersion])));
        sb.append(String.format("amrv={0}", encodeURIComponent(withdrawalnfo[eWithdrawalView.accountMaxRowVersion])));

        return ajaxer.promises.post(
                "dalWithdrawal/CancelPendingWithdrawal",
                "api/withdrawal/CancelPendingWithdrawal",
                 sb.toString()
            )
            .then(function (response) {
                return response;
            })
            .fail(function (error) {
                ErrorManager.onError("dalWithdrawal/CancelPendingWithdrawal", error.message, eErrorSeverity.medium);
                return Q.reject();
            });
    };

    //---------------------------------------------------
    // getCreditCardCurrencies
    //---------------------------------------------------

    var getCreditCardCurrencies = function (cardTypeId, OnLoadComplete) {
        var ajaxer = new TAjaxer();

        var sb = new StringBuilder();
        sb.append(String.format("cardTypeId={0}&", cardTypeId));
        sb.append(String.format("SecurityToken={0}", systemInfo.securityToken));

        ajaxer.post("dalWithdrawal/getCreditCardCurrencies", "api/withdrawal/GetCreditCardCurrencies",
            sb.toString(),
            OnLoadComplete,
            function () { ErrorManager.onError("dalWithdrawal/getCreditCardCurrencies", "", eErrorSeverity.medium) },
            0
        );
    };

    return {
        getWithdrawalInfo: getWithdrawalInfo,
        getWithdrawalRequestById: getWithdrawalRequestById,
        saveWithdrawalRequest: saveWithdrawalRequest,
        saveWithdrawalBackOfficeRequest: saveWithdrawalBackOfficeRequest,
        getPendingWithdrawals: getPendingWithdrawals,
        getAllPendingWithdrawalsByAccount: getAllPendingWithdrawalsByAccount,
        cancelPendingWithdrawal: cancelPendingWithdrawal,
        getCCDeposits: getCCDeposits,
        getCreditCardCurrencies: getCreditCardCurrencies
    };
};

var dalWithdrawal = new TDALWithdrawal();