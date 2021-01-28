var eClientState = {
    portfolioStatic: 0,
    portfolioSummary: 1,
    flags: 2,
    ticks: 3,
    ohlcs: 4,
    deals: 5,
    limits: 6,
    notifications: 7,
    serverTime: 8,
    bonus: 9
};

//-----------------------------------------------------

var eSubscriptionRequestFlags = {
    Balance: 0,
    ClientStateHolder: 1,
    Deals: 2,
    Exposures: 3,
    Flags: 4,
    Limits: 5,
    Notifications: 6,
    PL: 7,
    PortfolioStatic: 8,
    Quotes: 9,
    TradingNotifications: 10,
    All: 11
};

//-----------------------------------------------------

var ePortfolioSummary = {
    csHolder: 0,
    dealPL: 1,
    netExposure: 2,
    isUpdated: 3,
    instrumentVolumes: 4,
    optionIndication: 5
};

//-----------------------------------------------------

var eInstruments = {
    id: 0,
    amountGroupId: 1,
    factor: 2,
    hasSignals: 3,
    ccyPair: 4,
    tradable: 5,
    defaultDealSize: 6,
    signalName: 7,
    maxDeal: 8,
    SLMinDistance: 9,
    TPMinDistance: 10,
    DecimalDigit: 11,
    PipDigit: 12,
    SpecialFontStart: 13,
    SpecialFontLength: 14,
    assetTypeId: 15,
    expirationDate: 16,
    instrumentTypeId: 17,
    baseSymbolId: 18,
    otherSymbolId: 19,
    exchangeInstrumentName: 20,
    exchange: 21,
    contractMonthAndYear: 22,
    instrumentEnglishName: 23,
    weightedVolumeFactor: 24,
    eventDate: 25,
    eventAmount: 26,
    marketPriceTolerance: 27
};

//-----------------------------------------------------

var eQuotes = {
    instrumentID: 0,
    bid: 1,
    ask: 2,
    open: 3,
    high: 4,
    low: 5,
    tradeTime: 6,
    state: 7,
    close: 8
};

//-----------------------------------------------------

var eSymbol = {
    id: 0,
    name: 1
};

//----------------------------------------------------

var eExposure = {
    symbolID: 0,
    amount: 1,
    accountSymbolAmount: 2,
    status: 3
};

//-----------------------------------------------------

var eInstrumentVolume = {
    InstrumentID: 0,
    BaseSymbolNetExposure: 1,
    OtherSymbolNetExposure: 2,
    AccountSymbolAmount: 3,
    RequiredMarginPercentage: 4,
    UsedMargin: 5,
    MarginUtilizationPercentage: 6,
    AvailableMargin: 7,
    MarginUtilizationStatus: 8,
    Status: 9,
    OrdersCounter: 10,
    LastUpdate: 11,
    BaseSymbolAmount: 12,
    OtherSymbolAmount: 13
};

var eMarginUtilizationStatus = {
    NA: 0,
    Low: 1,
    Medium: 2,
    High: 3
};

//-----------------------------------------------------

var ePortfolioStatic = {
    accountSymbol: 0,
    maxExposure: 1,
    securities: 2,
    tradingBonus: 3,
    pendingBonus: 4,
    isActive: 5,
    isDemo: 6,
    kycStatus: 7,
    amlStatus: 8,
    pendingWithdrawals: 9,

    pepStatus: 12,
    cddStatus: 13,
    pendingBonusType: 15,
    pendingBonusVolumePercentage: 16,
    kycReviewStatus: 17

};

//-----------------------------------------------------

var eCSHolder = {
    accountBalance: 0,
    equity: 1,
    netExposure: 2,
    margin: 3,
    exposureCoverage: 4,
    totalEquity: 5,
    openPL: 6,
    usedMargin: 7,
    marginUtilizationPercentage: 8,
    availableMargin: 9,
    marginUtilizationStatus: 10
};

//-----------------------------------------------------

var eCSFlags = {
    exposureCoverageAlert: 0,
    equityAlert: 1,
    exposureAlert: 2,
    marketState: 3,
    systemMode: 4,
    isUpdated: 5,
    limitMultiplier: 6
};

//----------------------------------------------------

var eSystemMode = {
    none: 0,
    active: 1,
    closing: 2,
    inactive: 3,
    shutdown: 4
};

//-----------------------------------------------------

var eCustomer = {
    accountBaseSymbol: 0,
    defaultCcy: 1,
    email: 2,
    accountNumber: 3,
    language: 4,
    dealPermit: 5,
    accountsCcy: 6
};

//-----------------------------------------------------

var eLimit = {
    instrumentID: 0,
    orderID: 1,
    positionNumber: 2,
    orderDir: 3,
    orderRate: 4,
    buySymbolID: 5,
    buyAmount: 6,
    sellSymbolID: 7,
    sellAmount: 8,
    type: 9,
    mode: 10,
    expirationDate: 11,
    entryTime: 12,
    slRate: 13,
    tpRate: 14,
    otherLimitID: 15,
    dealType: 16,
    status: 17
};

//-----------------------------------------------------

var eHistoricalLimit = {
    instrumentID: 0,
    orderID: 1,
    positionNumber: 2,
    orderDir: 3,
    orderRate: 4,
    buySymbolID: 5,
    buyAmount: 6,
    sellSymbolID: 7,
    sellAmount: 8,
    type: 9,
    mode: 10,
    executionDate: 11,
    entryTime: 12,
    slRate: 13,
    tpRate: 14,
    status: 15
};

//-----------------------------------------------------

var eDeal = {
    instrumentID: 0,
    orderID: 1,
    positionNumber: 2,
    orderDir: 3,
    orderRate: 4,
    buySymbolID: 5,
    buyAmount: 6,
    sellSymbolID: 7,
    sellAmount: 8,
    valueDate: 9,
    dealType: 10,
    exeTime: 11,
    slRate: 12,
    slID: 13,
    tpRate: 14,
    tpID: 15,
    additionalPL: 16,
    status: 17,
    spreadDiscount: 20
};

//-----------------------------------------------------

var eDealPL = {
    instrumentID: 0,
    dealID: 1,
    spotRate: 2,
    fwPips: 3,
    closingRate: 4,
    pl: 5,
    lastUpdate: 6,
    commission: 7
};

//-----------------------------------------------------

var eClosedDealsBase = {
    orderID: 0,
    positionNumber: 1,
    instrumentID: 2,
    buyAmount: 3,
    sellAmount: 4,
    orderDir: 5,
    dealType: 6,
    valueDate: 7,
    executionTime: 8,
    forwardPips: 9,
    instrumentEnglishName: 10,
    pipDigit: 11,
    decimalDigit: 12,
    specialFontStart: 13,
    specialFontLength: 14
};

var eClosedDeals = {
    dealRate: 15,
    pl: 16,
    originalPosNum: 17,
    plCCY: 18,
    positionStart: 19,
    additionalPL: 20
};

//-----------------------------------------------------

var eClosedDealsSummaries = {
    orderRateOpen: 15,
    orderRateClosed: 16,
    pl: 17,
    originalPosNum: 18,
    plCCY: 19,
    positionStart: 20,
    additionalPL: 21,
    spreadDiscount: 22,
    commission: 23
};

//-----------------------------------------------------

var eAccountingAction = {
    actionID: 0,
    actionTypeID: 1,
    symbolID: 2,
    date: 3,
    credit: 4,
    debit: 5,
    posNum: 6,
    comment: 7,
    balance: 8,
    totalsum: 9
};

//-----------------------------------------------------

var eContractRollover = {
    actionID: 0,
    posNum: 1,
    symbol: 2,
    date: 3,
    debit: 4,
    credit: 5,
    gap: 6,
    closeMidRate: 7,
    openMidRate: 8,
    spread: 9
};

//-----------------------------------------------------
var eAccountingActionsCategory = {
    All: 0,
    Deposits: 1,
    Withdrawals: 2,
    DealPL: 3,
    OvernightFinancing: 4,
    General: 5,
    OvernightHistory: 6,
    ContractRollover: 7,
    Dividend: 8
};

//-----------------------------------------------------

var eMinDealValue = {
    instrumentID: 0,
    groupID: 1,
    minAmount: 2
};

//-----------------------------------------------------

var eActivityLog = {
    MessageType: 0,
    DateTime: 1,
    SourceType: 2,
    Message: 3
};

var eExpiredOptions = {
    InstrumentID: 0,
    OptionID: 1,
    Amount: 2,
    AmountCCY: 3,
    BaseCCY: 4,
    OtherCCY: 5,
    OpenRate: 6,
    ServerRate: 7,
    ITMReturn: 8,
    OTMReturn: 9,
    EqualReturn: 10,
    OptionReturn: 11,
    USDValue: 12,
    ExpirationTime: 13,
    TimeGenerated: 14,
    ClosingRate: 15,
    Direction: 16,
    Distance: 17,
    ExpirationBid: 18,
    ExpirationAsk: 19,
    ExpirationTradeTime: 20,
    Canceled: 21
};

//-----------------------------------------------------

var eActivityLogFilterType = {
    Positions: 1,
    Limits: 2,
    Account: 3,
    Logins: 5
};

//-----------------------------------------------------

var eCreditCard = {
    CardTypeID: 0,
    Name: 1,
    OrderID: 2,
    Currencies: 3,
    D3SecureStatus: 4,
    DepositingActionType: 5
};

//-----------------------------------------------------

var eDepositCurrency = {
    CurrencyID: 0,
    SortOrderID: 1
};

//-----------------------------------------------------

var eDepositCurrencyWithValidation = {
    CurrencyID: 0,
    SortOrderID: 1,

    MinAmount: 3,
    MaxAmount: 4,
    MaxAmlAmount: 5,
};

//-----------------------------------------------------
var eDepositErrorType = {
    fieldValidation: 0,
    upload: 1,
    claim: 2,
    isInvalidLuhn: 4,
    ccTypeUnknown: 5
};

//-----------------------------------------------------

var ePaymentAuthStatus = {
    Disable: 0,
    Optional: 1,
    Required: 2
};

//-----------------------------------------------------

var eCardView = {
    PaymentID: 0,
    CardHolderName: 1,
    Last4: 2,
    CardNumberLength: 3,
    ExpirationMonth: 4,
    ExpirationYear: 5,
    IsDefault: 6,
    IsCVVRequired: 7,
    CardTypeID: 8,
    First6: 9,
    CcGuid: 10
};

//-----------------------------------------------------

var eWireTransferCountry = {
    CountryID: 0,
    Name: 1
};

//-----------------------------------------------------

var eWireTransferCountryContainer = {
    CountryID: 0,
    Name: 1,
    DefaultCurrencyID: 2,
    DefaultCurrencyName: 3,
    LocalCurrencies: 4,
    InternationalCurrencies: 5
};

//-----------------------------------------------------

var eWireTransferBankCurrency = {
    CurrencyID: 0,
    SortOrderID: 1,
    MinDeposit: 2
};

//-----------------------------------------------------

var eDepositResponse = {
    RequestID: 0,
    EngineStatusID: 1,
    ValidationStatusID: 2,
    ClearingStatusID: 3,
    DepositingTransactionStatusID: 4,
    CreditCardMaintenanceStatusID: 5,
    DepositingRequest3DSecureStatusID: 6,
    CreditCardAuthenticationModeID: 7,
    MessageDetails: 8,
    MoneybookersURL: 9,
    D3SecureURL: 10,
    WireTransferInvoiceInfo: 11,
    GlobalCollectAPMURL: 12,
    ConfirmationCode: 13,
    ClearerRequestUrl: 14,
    ClearerPostData: 15,
    BaseClearerTypeId: 16,
    TransactionDescriptor: 17,
    ClearerUrlHash: 18,
    Last4: 19
};

var ePostData = {
    Name: 0,
    Value: 1
};

//-----------------------------------------------------

var eDepositEngineStatus = {
    Pending: 10,
    Valid: 20,
    Success: 70,
    CCStored: 80,
    Finished: 100,
    Failed: 200
};

//-----------------------------------------------------

var eDepositValidationStatus = {
    CardIDNotFound: 1,
    AccountNumberNotFound: 2,
    Blocked: 3,
    BadLuhn: 4,
    UnkownCCType: 5,
    MaxCCReached: 6,
    Spoofing: 7,
    DoubleUse: 8,
    MinDeposit: 9,
    MaxDeposit: 10,
    DepositRangeValidationFailed: 11,
    InvalidCardType: 12,
    InvalidEmailFormat: 13,
    CreditCardExpired: 14,
    InvalidWMID: 15,
    WMCurrencyMismatch: 16,
    WMAmountMismatch: 17,
    AMLComplianceDenied: 18,
    RequestedCVVNotFound: 19,
    InvalidMobileFormat: 20,
    Valid: 21,
    WhiteList: 23,
    TransactionCancelledByUser: 25,
    RefundableClearer: 26,
    ExceededLimit: 27,
    Unknown: 28,
    MinMaxDepositBlocked: 29,
    MeikoPayMaxAmount: 30,
    InvalidConfiguration: 31,
    CCBinCountryBlacklist: 32,
    NoSupportedClearers: 33,
    MaxCardTypeUSDAmount: 34,
    ShowAdditionalPaymentOnFailedDeposit: 35
};

//-----------------------------------------------------

var eSecureFlow = {
    Need: 0,
    NotNeed: 1,
    Failed: 2
};

//-----------------------------------------------------

var ePaymentAuthMode = {
    None: 1,
    D3Secure: 2
};

//-----------------------------------------------------

var eClearingStatus = {
    TransactionRequired: 0,
    TransactionApproved: 1,
    FailedOn3DMissing: 11,
    FailedOnMoneybookersRequestCanceled: 7
};

//-----------------------------------------------------

var eWireTransferType = {
    NA: 0,
    Local: 1,
    International: 2
};

//------------------Withdrawal----------------------

var eWithdrawalView = {
    withdrawalID: 0,
    actionID: 1,
    amount: 2,
    symbolID: 3,
    requestDate: 4,
    withdrawalStatus: 5,
    rowVersion: 6,
    accountMaxRowVersion: 7,
    symbolName: 8,
    bankName: 9,
    bankAccount: 10,
    bankAddress: 11,
    bankCountryID: 12,
    bankCountryName: 13,
    bankBranch: 14,
    bankBeneficiary: 15,
    bankComments: 16
};

var eWithdrawalStatus = {
    NA: 0,
    pendingWithdrawal: 1,
    Approved: 2,
    Rejected: 3,
    processingWithdrawal: 4
};
//-----------------------------------------------------

var eDepositingRequest3DSecureStatus = {
    WaitngForResponse: 0,
    Enrolled: 1,
    AttemptedNotEnrolled: 2,
    NotEligible: 3,
    NoSupportedClearers: 4
};

//-----------------------------------------------------

var eKeepAlive = {
    Success: 0,
    Error: 1
};

//-----------------------------------------------------

var eQuotesUIOrder = {
    InstrumentID: 0,
    DealAmount: 1
};

//-----------------------------------------------------

var eNotification = {
    NotificationType: 0,
    ItemId: 1,
    RelatedItemId: 2,
    Version: 3
};

//-----------------------------------------------------

var eTransactionsReports = {
    PositionNumber: 0,
    TransactionNumber: 1,
    ExecutionDate: 2,
    BuySell: 3,
    Item: 4,
    UnitPrice: 5,
    QuantityTraded: 6,
    TotalAmountCurrency: 7,
    USDVolume: 8,
    TypeOfOrder: 9,
    OpenRolloverClose: 10,
    BaseCur: 11,
    OtherCur: 12,
    Commission: 13,
    InstrumentId: 14
};

//-----------------------------------------------------

var eInitialScreen = {
    ScreenId: 0,
    IsCustomScreen: 1
};

//-----------------------------------------------------

var ePresetCategory = {
    InstrumentType: 0,
    Presets: 1
};

//-----------------------------------------------------

var ePreset = {
    PresetId: 0,
    InstrumentType: 1,
    IsSelected: 2
};
//-----------------------------------------------------

// TradingSignal data
var eTradingSignal = {
    signalId: 0,
    signalTitle: 1,
    signalDate: 2,
    imagePath: 3,
    mediumTermLevel: 4,
    weekDelta: 5,
    longTermLevel: 6,
    monthDelta: 7,
    summary: 8,
    symbol: 9,
    story: 10,
    shortTerm: 11
};

// AlertSignal data
var eAlertSignal = {
    ma20: 0,
    ma50: 1,
    ma20_50: 2,
    macd_sl: 3,
    macd_0: 4,
    bollinger: 5,
    rsi70: 6,
    rsi30: 7,
    volume: 8,
    periodUnit: 9,
    periodValue: 10,
    id: 11,
    symbol: 12,
    dateTime: 13,
    title: 14
};

// CandlestickSignal data
var eCandlestickSignal = {
    candlestick: 0,
    last: 1,
    opinion: 2,
    invalidation: 3,
    id: 4,
    symbol: 5,
    dateTime: 6,
    title: 7
};

// TechAnalysisSignal data
var eTechAnalysisSignal = {
    week: 0,
    weekDelta: 1,
    month: 2,
    monthDelta: 3,
    id: 4,
    symbol: 5,
    dateTime: 6,
    title: 7
};

var eTicks = {
    instrumentID: 0,
    bid: 1,
    ask: 2,
    tradeTimeOffset: 3,
    state: 4
};

var eOhlc = {
    instrumentID: 0,
    open: 1,
    close: 2,
    high: 3,
    low: 4
};

var eBonus = {
    amountBase: 0,
    amountGivenBase: 1,
    volumeUsd: 2,
    startDate: 3,
    endDate: 4,
    accumulatedVolumeUsd: 5
};

var eNameValuePairIndex = {
    name: 0,
    value: 1
};

var eDepositResponseThreeDIndex = {
    paReq: 0,
    md: 1,
    termUrl: 2,
    acsUrl: 3,
    requiresExtraRedirect: 4,
};
