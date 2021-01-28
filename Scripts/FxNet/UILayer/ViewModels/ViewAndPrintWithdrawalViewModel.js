var ViewAndPrintWithdrawalViewModel = function (ko, ViewModelBase, general) {
    var self = this;

    var inheritedInstance = general.clone(ViewModelBase);
    var accountDetails = {};
    var requestDetails = {};

    var depositsInfo = {};

    var init = function (customSettings) {
        inheritedInstance.setSettings(self, customSettings);

        initAccountDetails();
        initRequestDetails();
        initDepositsInfo();
        registerObservableStartUpEvent();

    };
    var initAccountDetails = function () {
        var customer = $customer.prop;

        accountDetails.accountName = customer.userName;
        accountDetails.accountNumber = customer.accountNumber;
        accountDetails.email = customer.email;
        accountDetails.fullName = customer.firstName + ' ' + customer.lastName;
        accountDetails.telephone = customer.phone;
        accountDetails.accountSymbol = customer.defaultCcy();
        accountDetails.equity = ko.observable(0);
        accountDetails.currency = ko.observable("");
    };

    var initRequestDetails = function () {
        requestDetails.date = ko.observable("");
        requestDetails.amount = ko.observable(0);
        requestDetails.currency = ko.observable("");

        requestDetails.bankName = ko.observable("");
        requestDetails.bankAddress = ko.observable("");
        requestDetails.bankDetails = ko.observable("");
        requestDetails.branch = ko.observable("");
        requestDetails.swiftCode = ko.observable(0);
        requestDetails.bankAccount = ko.observable("");

        requestDetails.ccId = ko.observable();
        requestDetails.last4 = ko.observable("");
        requestDetails.creditCardType = ko.observable("");
        requestDetails.creditCardExpirationDate = ko.observable("");

        requestDetails.isBankWithdrawal = ko.computed(function () {
            return general.isEmptyValue(requestDetails.last4()) && !general.isEmptyValue(requestDetails.date());
        });
        requestDetails.isCreditCardWithdrawal = ko.computed(function () {
            return !general.isEmptyValue(requestDetails.last4()) && !general.isEmptyValue(requestDetails.date());
        });

    };

    var initDepositsInfo = function () {
        depositsInfo.depositsTotal = ko.observableArray();
        depositsInfo.deposits = ko.observableArray();
        depositsInfo.firstDepositDate = ko.observable("");
        depositsInfo.lastDepositDate = ko.observable("");

    };
    var registerObservableStartUpEvent = function () {
        $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vViewAndPrintWithdrawal).state.subscribe(function (state) {
            if (state === eViewState.Start) {
                start();
            }
        });
    };

    var start = function () {
        var args = $viewModelsManager.VManager.GetViewArgs(eViewTypes.vViewAndPrintWithdrawal);
        var id = args.iD;

        dalWithdrawal.getWithdrawalRequestById(id, function (responseText) {
            var response = JSONHelper.STR2JSON("ViewAndPrintWithdrawalViewModel/onLoadWithdrawalsComplete", responseText, eErrorSeverity.medium);
            setRequestDetails(response.WithdrawalRequestById);
        });

        dalWithdrawal.getCCDeposits()
            .then(onLoadCCDepositsComplete)
            .done();
    };

    var setRequestDetails = function (lastWithdrawalRequest) {
        if (lastWithdrawalRequest) {
            requestDetails.date(lastWithdrawalRequest.RequestDate);
            requestDetails.amount(lastWithdrawalRequest.Amount);
            requestDetails.currency($symbolsManager.GetTranslatedSymbolByName(lastWithdrawalRequest.SymbolName));

            requestDetails.bankName(lastWithdrawalRequest.BankName);
            requestDetails.bankAddress(lastWithdrawalRequest.BankAddress);
            requestDetails.bankDetails(lastWithdrawalRequest.Details);
            requestDetails.branch(lastWithdrawalRequest.BankBranch);
            requestDetails.swiftCode(lastWithdrawalRequest.SwiftCode);
            requestDetails.bankAccount(lastWithdrawalRequest.BankAccount);
            requestDetails.ccId(lastWithdrawalRequest.CCId);
            requestDetails.last4(lastWithdrawalRequest.Last4);
            requestDetails.creditCardType(lastWithdrawalRequest.CreditCardType);
            requestDetails.creditCardExpirationDate(lastWithdrawalRequest.CreditCardExpirationDate);

        }
    };
    var onLoadCCDepositsComplete = function (responseText) {
        var ccDepositsResponse = JSONHelper.STR2JSON("ViewAndPrintWithdrawalViewModel/onLoadCCDepositsComplete", responseText, eErrorSeverity.medium);

        depositsInfo.deposits(ccDepositsResponse.Deposits);
        depositsInfo.depositsTotal(ccDepositsResponse.DepositsTotal);

        depositsInfo.firstDepositDate(ccDepositsResponse.FirstDepositDate);
        depositsInfo.lastDepositDate(ccDepositsResponse.LastDepositDate);
    };

    //-------------------------------------------------------
    return {
        AccountDetails: accountDetails,
        RequestDetails: requestDetails,
        DepositsInfo: depositsInfo,
        Init: init
    };
}