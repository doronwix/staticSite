var WithdrawalRequestInfo = function () {
    var prop = {
        bankInfo: null,
        ccyList: new THashTable(),
        maxWithdrawalAmount: {}
    }

    //-----------------------------------------------
    // setRequestInfo
    //-----------------------------------------------

    var setRequestInfo = function (data) {
        setBankInfo(data);
        setcurrenciesList(data);
        setMaxWithdrawalAmount(data);
    }

    //-----------------------------------------------

    var setBankInfo = function (data) {
        var wReq = data.LastWithdrawalRequest;

        if (wReq.length > 0) {
            prop.bankInfo = {};

            prop.bankInfo.symbolName = wReq[eWithdrawalView.symbolName];
            prop.bankInfo.bankName = wReq[eWithdrawalView.bankName];
            prop.bankInfo.bankAccount = wReq[eWithdrawalView.bankAccount];
            prop.bankInfo.bankAddress = wReq[eWithdrawalView.bankAddress];
            prop.bankInfo.bankCountryID = wReq[eWithdrawalView.bankCountryID];
            prop.bankInfo.bankCountryName = wReq[eWithdrawalView.bankCountryName];
            prop.bankInfo.bankBranch = wReq[eWithdrawalView.bankBranch];
            prop.bankInfo.bankBeneficiary = wReq[eWithdrawalView.bankBeneficiary];
            prop.bankInfo.bankComments = wReq[eWithdrawalView.bankComments];
        }
    };

    //-----------------------------------------------

    var setMaxWithdrawalAmount = function (data) {
        prop.maxWithdrawalAmount.value = data.MaxWithdrawalAmount;
    };

    //-----------------------------------------------

    var setcurrenciesList = function (data) {
        prop.ccyList = data.CcyList.slice(0);
    };

    var hasData = function (data) {
        return prop.ccyList.hasItems();
    };

    //-----------------------------------------------

    return {
        prop: prop,
        hasData: hasData,
        setRequestInfo: setRequestInfo
    };
};