var cDepositMessageKeys = {
    confirmation: 'depConfirmation',
    succeeded: 'depSucceeded',
    succeededTitle: 'depSucceededTitle',
    changeGeneratedPasswordAfterFirstDeposit: 'ChangeGeneratedPasswordAfterFirstDeposit',
    minDeposit: 'depMinDeposit',
    maxDeposit: 'depMaxDeposit',
    clearerMaxRangeDeposit: 'depMaxDepositRange',
    maxCCAllowed: 'depMaxCCAllowed',
    invalidCardType: 'depInvalidCardType',
    refundableClearer: 'depRefundableClearer',
    minMaxBlocked: 'depMinMaxBlocked',
    maxCardTypeUSDAmount: 'depMaxCardTypeUSDAmount',
    creditCardExpired: 'depCreditCardExpired',
    whiteListValidation: 'depWhiteListValidation',
    meikoPayMaxAmount: 'depMeikoPayMaxAmount',
    depositFailed: 'depDepositFailed',
    requestPended: 'depRequestPended',
    unableProcessRequest: 'depUnableProcessRequest',
    unsupportedCardType: 'depUnsupportedCardType',
    d3secureNotAllowed: 'd3secure',
    noSupportedClearers: 'noSupportedClearers',
    notEnrolledCard: 'notEnrolledCard',
    notice3DSecureDeposit: 'notice3DSecureDeposit',
    d3SecureMissed: 'depD3SecureMissed',
    removeCCMessage: 'depRemoveCCMessage',
    serverError: 'ServerError',
    moneyBookersDepositRequestCancelled: 'depMBDepositRequestCancelled',
    cancelledByUser: 'depCancelledByUser',
    pendingDepositRequest: 'depPendingDepositRequest'
};

var cDepositMessageKeyPrefixes = {
    succeededAdditionalWithDescriptor: 'depSucceededAdditionalWithDescriptor_',
    succeededAdditional: 'depSucceededAdditional_',
    ccBinCountryBlacklistWithCountryId: 'depCCBinCountryBlacklist_countryId_'
};

var cDepositMessageTitleKeys = {
    failedDepositMinimumDeposit: 'FailedDeposit_MinimumDeposit',
    failedDepositExpiryDate: 'FailedDeposit_ExpiryDate',
    failedDepositDoubleCheck: 'FailedDeposit_DoubleCheck',
    failedDepositSorry: 'FailedDeposit_Sorry'
};

var cEmptyGuid = "00000000-0000-0000-0000-000000000000";