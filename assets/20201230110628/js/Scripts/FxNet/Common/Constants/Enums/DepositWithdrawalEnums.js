var eDepositMessageTypes = {
    // negative -> flow flags
    d3ProcessStarted: -2,
    showAmlPending: -1,
    none: 0,
    // positive -> actuall message types
    confirmation: 1,
    succeeded: 2,
    changeGeneratedPasswordAfterFirstDeposit: 3,
    minDeposit: 4,
    maxDeposit: 5,
    clearerMaxRangeDeposit: 33,
    maxCCAllowed: 6,
    invalidCardType: 7,
    refundableClearer: 8,
    minMaxBlocked: 9,
    maxCardTypeUSDAmount: 10,
    creditCardExpired: 11,
    whiteListValidation: 12,
    meikoPayMaxAmount: 13,
    depositFailed: 14,
    succeededAdditionalWithDescriptor: 15,
    succeededAdditional: 16,
    ccBinCountryBlacklistWithCountryId: 17,
    requestPended: 18,
    unableProcessRequest: 19,
    unsupportedCardType: 20,
    d3secureNotAllowed: 21,
    noSupportedClearers: 22,
    notEnrolledCard: 23,
    notice3DSecureDeposit: 24,
    d3SecureMissed: 25,
    removeCCMessage: 26,
    serverError: 27,
    moneyBookersDepositRequestCancelled: 28,
    cancelledByUser: 29,
    pendingDepositRequest: 30,
    showAdditionalPaymentOnFailedDeposit: 31,
    transactionCancelledByUser: 32
};

var eWithdrawalStatuses = {
    None: 0,
    Pending: 1,
    Approved: 2,
    Canceled: 3,
    Processing: 4
};