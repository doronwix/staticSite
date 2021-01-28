var eResult = {
    Error: 0,
    Success: 1
};

//----------------------------------------------------

var eRequestMode = {
    Initial: 0,
    Correct: 1,
    Failed: 2
};

//----------------------------------------------------

var eOrderResult = {
    OK: 0,
    Error: 1
};

//----------------------------------------------------

var eQuoteStates = {
    None: 0,
    Enabled: 1,
    Locked: 2,
    TimedOut: 3,
    Disabled: 4,
    Up: 5,
    Down: 6,
    NotChanged: 7
};

var eHighLowStates = {
    NA: 0,
    MarketClosed: 1,
    Active: 2
};

//----------------------------------------------------

var eMessages = {
    InvalidLimitRate: 1,
    LimitRateIsEmpty: 2,
    TPRateNotInRange: 3,
    SLRateNotInRange: 4,
    InvalidTPRate: 5,
    InvalidSLRate: 6,
    InvalidDate: 7
};

//----------------------------------------------------

var eOrderDir = {
    Sell: 0,
    Buy: 1,
    None: 2
};

//----------------------------------------------------

var eStartSpinFrom = {
    Below: 0,
    Above: 1,
    None: 2
};

//----------------------------------------------------

var eDateFilter = {
    Yesterday: 0,
    Today: 1,
    Tomorrow: 2,
    ThisWeek: 3,
    NextWeek: 4
};

//----------------------------------------------------

var eImportanceFilter = {
    Low: 1,
    Medium: 2,
    Hight: 3
};

//----------------------------------------------------

var eCountryFilter = {
    AU: 0,
    CA: 1,
    CN: 2,
    DE: 3,
    EU: 4,
    FR: 5,
    IT: 6,
    JP: 7,
    NZ: 8,
    CH: 9,
    UK: 10,
    US: 11
};

//----------------------------------------------------

var eNewDealTool = {
    None: 0,
    Chart: 1,
    MarketLiveInfo: 2,
    EconomicCalendar: 3,
    Signals: 4,
    InstrumentInfo: 5
};

//----------------------------------------------------

var eNewDealValue = {
    Inline: 'Inline',
    Popup: 'Popup',
    None: 'None'
};

//----------------------------------------------------

var eDealPage = {
    NewDeal: 'NewDeal',
    NewLimitViewModel: 'NewLimitViewModel',
    CloseDeal: 'CloseDeal',
    EditClosingLimit: 'EditClosingLimit',
    EditLimitViewModel: 'EditLimitViewModel',
    EditIfDoneLimit: 'EditIfDoneLimit'
};

//----------------------------------------------------

var eTrackingDealVersion = {
    NewDealSlip: '2016',
    OldDealSlip: ''
};

//----------------------------------------------------

var eLimitType = {
    None: 0,
    StopLoss: 1,
    TakeProfit: 2
};

//-----------------------------------------------------

var eLimitMode = {
    None: 0,
    OpenDeal: 1,
    CloseDeal: 2,
    Add: 3, // not used on client
    PriceAlert: 4
};

//----------------------------------------------------

var eLimitValidationMode = {
    All: 0,
    Single: 1,
    Amount: 2,
    Rate: 3,
    Percent: 4
};

//----------------------------------------------------

var eHistoryLimitRequest = {
    All: 0,
    Deleted: 1,
    Edited: 2,
    Expired: 3,
    EitherOr: 4,
    PositionClosed: 5,
    Executed: 6,
    EquityAlert: 7,
    ExposureAlert: 8,
    PositionMissing: 9,
    CloseAllDeals: 10
};

//----------------------------------------------------

var eStatus = {
    New: 0,
    Edited: 1,
    Removed: 2,
    Cancelled: 3
};

//----------------------------------------------------

var eMarketState = {
    Open: 1,
    Close: 2
};

//----------------------------------------------------

var eDealPLState = {
    None: 0,
    Up: 1,
    Down: 2
};

//-----------------------------------------------------

var eMessageBoxIcon = {
    Info: 0,
    Error: 1,
    Warning: 2,
    Question: 3
};

//----------------------------------------------------

var eAMLStatus = {
    NotRequired: 0,
    Unverified: 1,
    Denied: 2,
    Approved: 3,
    Pending: 4,
    Restricted: 5
};

//----------------------------------------------------

var eKYCStatus = {
    NotRequired: 0,
    NotComplete: 1,
    GaveUp: 2,
    Complete: 3,
    // new statuses
    Passed: 4,
    // warning required
    Failed: 5,
    // acknowledged
    FailedAware: 6
};

//----------------------------------------------------

var eCDDStatus = {
    NotRequired: 1,
    NotComplete: 2,
    Complete: 3
};

//----------------------------------------------------

var eCDDAccess = {
    Restricted: 0,
    Access: 1
};

//----------------------------------------------------

var eKYCReviewStatus = {
    NotReviewed: 0,
    Appropriate: 1,
    Rejected: 2,
    Experienced: 3,
    Eligible: 4,
    Review: 5,
    Tested: 6,
    Inappropriate: 7,
    Unsuitable: 8
};

//----------------------------------------------------

var eLocalStorageKeys = {
    QuestionsAnswersCDDKYC: "QuestionsAnswersCDDKYC"
};

//----------------------------------------------------

var ePEPStatus = {
    NotRequired: 1,
    Required: 2,
    No: 3,
    Statement2a: 4,
    Statement2b: 5,
    Statement2c: 6,
    Statement2d: 7,
    Statement2e: 8,
    Statement2f: 9,
    Statement3: 10,
    Statement4a: 11,
    Statement4b: 12
};

//----------------------------------------------------

var eSmartBannerStatus = {
    Invisible: 0,
    Visible: 1
};

//----------------------------------------------------

var eSmartBannerPosition = {
    Wide: 'smartBannerWide',
    Small: 'smartBannerSmall',
    None: 'None'
};

//----------------------------------------------------

var eAccountType = {
    Pending: 0,
    Active: 1
};

//----------------------------------------------------

var eDialogType = {
    Order: 0,
    Other: 1
};

//----------------------------------------------------

var eDealPermit = {
    None: 0,
    Islamic: 3,
    SpotOnly: 4,
    ZeroSpread: 17
};

//----------------------------------------------------

var eDealType = {
    Spot: 2,
    Islamic: 6,
    Future: 7,
    Share: 8
};

//----------------------------------------------------

var eRowAlternatingStyle = {
    EveryRow: 1,
    EveryTwoRows: 2
};

//----------------------------------------------------

var eRateFormatStyle = {
    SevenDigit: 1,
    EightDigit: 2,
    NineDigit: 3
};

//----------------------------------------------------

var exTypes = {
    html: 0,
    array: 1
};

//---------------------------------------------------

var eBrowserType = {
    chrome: 0,
    safari: 1,
    opera: 2,
    ie: 3,
    firefox: 4
};

//---------------------------------------------------

var eDataStatus = {
    partial: 0,
    full: 1
};

//---------------------------------------------------

var eFlagState = {
    Initial: -1,
    NotActive: 0,
    Active: 1
};

//---------------------------------------------------

var eViewMode = {
    simple: 0,
    advance: 1
};

//---------------------------------------------------

var eErrorSeverity = {
    warning: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
};

//----------------------------------------------------

var eCustomerType = {
    Standard: 1,
    TradingBonus: 39
};

//----------------------------------------------------

var eFolderType = {
    TradingBonus: "10"
};

//----------------------------------------------------

var eFolder = {
    GameFolder: 10,
    IntDebit: 39
};

//----------------------------------------------------

var eUserRole = {
    customer: "FXnet_Customers",
    QA: "FXnet_QA"
};

//----------------------------------------------------

var eRegulationStatus = {
    customer: "FXnet_Customers",
    QA: "FXnet_QA"
};

//---------------------------------------------------

var eOrderAction = {
    NewLimit: "NewLimit",
    EditLimit: "EditLimit",
    DeleteLimit: "DeleteLimit",
    NewDeal: "NewDeal",
    CloseDeal: "CloseDeal",
    SaveLimits: "SaveLimits",
    PendingBonus: "PendingBonus",
    GetOvernightFinancing: "GetOvernightFinancing",
    CashBack: "CashBackGetVolumes",
    NewPriceAlert: "NewPriceAlert"
};

//---------------------------------------------------

var eOrderActionType = {
    None: 0,
    NewLimit: 1,
    EditLimit: 2,
    DeleteLimit: 3,
    NewDeal: 4,
    CloseDeal: 5,
    PendingBonus: 6,
    NewPriceAlert: 7,
    GetOvernightFinancing: 8,
    CashBack: 9,
    DeletePriceAlert: 10
};

//---------------------------------------------------

var eTradingAgreement = {
    Needed: 0,
    NotNeeded: 1
};

//---------------------------------------------------

var eKeepAliveError = {
    None: 0,
    HttpContextRequired: 1,
    SessionMissingOrDuplicate: 2
};

//---------------------------------------------------

var eTradingPermissions = {
    Allowed: 3,
    Required: 2,
    Blocked: 1
};

//---------------------------------------------------

var eNotificationType = {
    InstrumentEdited: 31,
    AmountGroupEdited: 25,
    MinDealGroupEdited: 46
};

//----------------------------------------------------

var eScreenId = {
    CreditCard: 1,
    RegularWireTransfer: 2,
    RealTimeWireTransfer: 3,
    MoneyBooker: 4,
    Cachu: 6
};

//----------------------------------------------------

var eDepositingActionType = {
    NA: 0,
    Regular: 1,
    ForceDeposit: 2,
    Moneybookers: 3,
    PayPal: 5,
    GlobalCollectAPM: 7,
    WireTransfer: 20,
    SafechargePPP: 31,
    EmpCashU: 32,
    SafeChargeCashier: 33,
    Epaylinks: 34,
    Astropay: 36,
    NetellerGO: 37,
    PaySafeCard: 38,
    InatecAPM: 41,
    NoAPIClearer: 42,
    EcoPayz: 43,
    SofortDirect: 44,
    Kluwp: 45,
    RPN: 46,
    AstropayCard: 47,
    PayRetailers: 48,
    RisingSunAPM: 49,
    Jeton: 50,
    ZotapayAPM: 51,
    BitWallet: 52,
    NuveiAPM: 53,
    GlobePay: 54,
    AstropayWallet: 55,
    PerfectMoney: 56
};

//----------------------------------------------------

var eDepositCreditCardType = {
    Unknown: 0,
    AmericanExpress: 1,
    Diners: 2,
    Discover: 3,
    Jcb: 5,
    Laser: 6,
    Mastercard: 7,
    Maestro: 8,
    Solo: 9,
    Switch: 10,
    Visa: 13,
    CUP: 43
};

//----------------------------------------------------

var ePaymentMethods = {
    Regular: "pmCreditCard",
    ForceDeposit: "pmForceDeposit",
    Moneybookers: "pmMoneyBooker",
    CashU: "pmCashU",
    WireTransfer: "pmRegularWireTransfer"
};

//----------------------------------------------------

var eCountryPaymentsInfosResponse = {
    Country: 0,
    DepositingActionType: 1
};

//----------------------------------------------------

var ePaymentsChallengeWindowSize = {
    Fullscreen: '05'
};

//----------------------------------------------------

var eChangePasswordStatus = {
    None: 0,
    Success: 1,
    OldPasswordDoesNotMatch: 2,
    NewPasswordsDoNotMatch: 3,
    InvalidNewPassword: 4,
    PreviousPasswordRecurrence: 5,
    UserLockedOut: 7,
    UserNotFound: 8
};

//----------------------------------------------------

var eClientParams = {
    Interval: 0,
    Device: 1,
    MaxIdleTime: 2,
    IdleTimer: 3,
    TutorialUrlTemplate: 4,
    JsErrorBlacklistRegex: 5,
    ClientStateLatencyInterval: 10
};

//----------------------------------------------------

var eUIOrderType = {
    Default: 0,
    Custom: 1
};

//----------------------------------------------------

var eTileLayout = {
    Single: 1,
    Split: 2,
    FourSplit: 4
};

//----------------------------------------------------

var eChartInstanceType = {
    newDealSlip: 3,
    newDealMobile: 4
};

//----------------------------------------------------

var eChartDirection = {
    Same: 1,
    Opposite: 2
};

//----------------------------------------------------

var eChartParentType = {
    NewDeal: 0,
    NewLimit: 1,
    EditLimit: 2,
    CloseDeal: 3,
    EditClosingLimit: 4,
    NewPriceAlert: 5
};

//----------------------------------------------------

var eChartPeriod = {
    Ticks: 0,
    OneMinute: 1,
    FiveMinutes: 2,
    FifteenMinutes: 3,
    ThirtyMinutes: 4,
    OneHour: 5,
    SixHours: 6,
    TwelveHours: 7,
    OneDay: 8,
    OneWeek: 9,
    OneMonth: 10,
    TenSeconds: 11,
    TwoHours: 12,
    FourHours: 13
};

//----------------------------------------------------

var eChartTimeFramesIds = {
    'tick': '1T',
    '1 Minute': '1M',
    '5 Mintes': '5M',
    '10 Minutes': '10M',
    '15 Minutes': '15M',
    '30 Minutes': '30M',
    '1 Hour': '60M',
    '2 Hours': '2H',
    '4 Hours': '4H',
    '5 Hours': '5H',
    '6 Hours': '6H',
    '7 Hours': '7H',
    '8 Hours': '8H',
    '9 Hours': '9H',
    '10 Hours': '10H',
    '12 Hours': '12H',
    '14 Hours': '14H',
    '1 Day': '1D',
    '1 Week': '1W',
    '1 Month': '1N',
    '3 Months': '3N',
    '6 Months': '6N',
    '1 Year': '1Y'
}

//----------------------------------------------------

var eChartMode = {
    Collapsed: 'collapsed',
    Expanded: 'expanded'
};

//----------------------------------------------------

var eChartRateType = {
    Ask: 0,
    Bid: 1
};

//----------------------------------------------------

var eChartPriceLineType = {
    CurrentRate: 0,
    LimitLevel: 1,
    StopLoss: 2,
    TakeProfit: 3,
    OpenRate: 4,
    PriceAlertRate: 5
};

//----------------------------------------------------

var eChartCustomTemplates = {
    mobile: 'customMobileTemplate',
    mobileDark: 'customMobileTemplateDark',
    web: 'customtemplate',
    webDark: 'customtemplateDark',
}

//----------------------------------------------------

var eCandleHistoryProperites = {
    date: 0,
    open: 1,
    high: 2,
    low: 3,
    close: 4
};

//----------------------------------------------------

var eTickHistoryProperites = {
    date: 0,
    rate: 1
};

//----------------------------------------------------

var eClientStateResult = {
    NotFound: 0,
    Success: 1,
    Failed: 2
};

//----------------------------------------------------

var eOperationStatus = {
    None: 0,
    Success: 1,
    RequestFailed: 2,
    InternalServerError: 3,
    ValidationFailed: 4,
    ExportValidationFailed: 5
};

//----------------------------------------------------

var eViewState = {
    Initial: 0,
    Start: 1,
    Stop: 2,
    Save: 3,
    Update: 4,
    Refresh: 5
};

//----------------------------------------------------

var eLimitsType = {
    Active: "Active",
    Executed: "Executed",
    Deleted: "Deleted"
};

//----------------------------------------------------

var eCSFlagStates = {
    NotActive: 0,
    Active: 1,
    MaintenanceMode: 3
};

//----------------------------------------------------

var eFrameContentValidation = {
    Available: 0,
    NotAvailable: 1,
    SecurityFailure: 2
};

//----------------------------------------------------

var eRegistrationListName = {
    QuotesTable: "QuotesTable",
    ContractQuotesTable: "ContractQuotesTable",
    InBetweenQuote: "InBetweenQuote",
    SingleQuote: "SingleQuote",
    TradingSignals: "TradingSignals",
    Search: "Search"
};

//----------------------------------------------------

var eInstrumentType = {
    Mixed: 0, // Main Tab
    Currencies: 1,
    Commodities: 2,
    Indices: 3,
    Shares: 4,
    ETF: 8,
    Crypto: 9,
    Stocks: 10
};

//----------------------------------------------------

var eAssetType = {
    Forex: 1,
    Future: 2,
    Share: 3,
    Interest: 4
};

//----------------------------------------------------

var ePresetType = {
    PresetCustomized: 0,
    PresetMostPopular: 2,
    PresetMostPopularWithoutFutures: 1,

    PresetMostPopularCurrencies: 3,
    PresetUsdCurrencies: 4,
    PresetEurCurrencies: 5,
    PresetGbpCurrencies: 6,
    PresetJpyCurrencies: 7,
    PresetOtherCurrencies: 8,

    PresetCommodities: 9,
    PresetCommoditiesWithoutFutures: 10,

    IndiciesMostPopular_NoShares: 11,
    PresetShares: 12,

    PresetSharesUS: 13,
    PresetSharesGermany: 15,
    PresetSharesSpain: 16,
    PresetSharesItaly: 17,
    PresetSharesUK: 20,
    PresetSharesFrance: 21,
    PresetSharesJapan: 22,
    PresetSharesRussia: 23,
    PresetCommoditiesAgricultural: 24,
    PresetCommoditiesEnergy: 25,
    PresetCommoditiesMetals: 26,
    IndicesEurope_NoShares: 27,
    IndicesNorthAmerica_NoShares: 28,
    IndicesOther_NoShares: 29,
    PresetSharesSouthCorea: 30,
    PresetSharesNetherlands: 31,
    PresetSharesSwitzerland: 32,
    PresetSharesSweden: 33,
    PresetSharesHongKong: 125,
    PresetSharesAustralia: 126,
    PresetSharesMexico: 127,
    PresetSharesPoland: 128,
    PresetSharesGreece: 129,
    PresetSharesCzechRepublic: 130,
    PresetSharesHungary: 131,
    PresetSharesFinland: 132,
    SharesSaudiArabia: 135,
    PresetSharesIndia: 140,

    // General Tab continued  Most with different permissions
    PresetMostPopularWithoutShares: 18, //with future
    PresetMostPopularWithoutFuturesWithoutShares: 19,

    MainHot: 80,
    CurrenciesHot: 81,
    SharesHot: 82,
    MainHot_NoShares: 83,
    MainHot_NoSharesNoFutures: 84,
    MainTopGainers: 85,
    CurrenciesTopGainers: 86,
    SharesTopGainers: 87,
    MainTopGainers_NoShares: 88,
    MainTopGainers_NoSharesNoFuture: 89,
    MainTopLosers: 90,
    CurrenciesTopLosers: 91,
    SharesTopLosers: 92,
    MainTopLosers_NoShares: 93,
    MainTopLosers_NoSharesNoFutures: 94,
    CommoditiesHot: 95,
    CommoditiesTopGainers: 96,
    CommoditiesTopLosers: 97,
    IndicesHot_NoShares: 98,
    IndicesTopGainers_NoShares: 99,
    IndicesTopLosers_NoShares: 100,
    MainHot_NoFutures: 101,
    MainTopGainers_NoFutures: 102,
    MainTopLosers_NoFutures: 103,
    ETFMostPopular: 104,
    ETFHot: 105,
    ETFTopGainers: 106,
    ETFTopLosers: 107,
    ETFCommodities: 108,
    ETFEquityCountries: 109,
    ETFEquityIndices: 110,
    ETFEquitySectors: 111,
    ETFFixedIncome: 112,
    IndicesMostPopular: 113,
    IndicesHot: 114,
    IndicesTopGainers: 115,
    IndicesTopLosers: 116,
    IndicesEurope: 117,
    IndicesNorthAmerica: 118,
    IndicesOther: 119,

    CryptoMostPopular: 120,
    CryptoHot: 121,
    CryptoTopGainers: 122,
    CryptoTopLosers: 123,
    CryptoCurrencies: 124,

    PresetNewReleases: 136,
    PresetNewReleasesNoFutures: 137,
    PresetNewReleasesNoShares: 138,
    PresetNewReleasesNoSharesNoFutures: 139,
    StocksMostPopular: 141
};

//----------------------------------------------------

var Operation = {
    Add: 0,
    Substruct: 1
};

// topics used for modelview message comunication using ko post-box extension
var eTopic = {
    onCancelPendingRedrawal: 'onCancelPendingRedrawal',
    onDoubleLoginEvent: 'onDoubleLoginEvent',
    onDynamicScriptsLoaded: 'onDynamicScriptsLoaded',
    onCustomQuotesSaved: 'onCustomQuotesSaved'
};

var eShutDownHandlerTopics = {
    stopClientStateManagerCalls: 'onStopClientStateManagerCalls',
    stopKeepAliveCalls: 'onStopKeepAliveCalls',
    stopGetActiveIMCalls: 'onStopGetActiveIMCalls',
    stopGetRatesRecentWebCalls: 'stopGetRatesRecentWebCalls',
    restartClientStateManagerCalls: 'onRestartClientStateManagerCalls',
    restartKeepAliveCalls: 'onRestartKeepAliveCalls',
    restartGetActiveIMCalls: 'onRestartGetActiveIMCalls',
    restartGetRatesRecentWebCalls: 'restartGetRatesRecentWebCalls'
};

var eAppEvents = {
    formChangeEvent: 'formChangeEvent',
    formChangedEvent: 'formChangedEvent',
    amlStatusLoadedEvent: 'amlStatusLoadedEvent',
    cddStatusLoadedEvent: 'cddStatusLoadedEvent',
    dialogClosed: 'dialogClosed',
    exportDataLoadedEvent: 'exportDataLoadedEvent',
    rolledOverDataLoaded: 'rolledOverDataLoaded',
    accountCardRecordsDataLoaded: 'accountCardRecordsDataLoaded',
    contractRolloverDataLoaded: 'contractRolloverDataLoaded',
    customerInformationLoadedEvent: 'customerInformationLoadedEvent',
    depositConfirmationLoadedEvent: 'depositConfirmationLoadedEvent'
};

var eGender = {
    Female: "F",
    Male: "M"
};

var eClaimActionType = {
    Save: 1,
    Fetch: 2,
    Update: 3,
    Delete: 4
};

var eClaimRecordType = {
    photocopyOfIDPassport: 1,
    utilityBill: 2,
    creditCardPhotocopy: 3,
    PhotocopyOfCardholdersID: 4,
    CardHolderAuthorization: 5,
    depositConfirmation: 6,
    withdrawalConfirmation: 7,
    generalDocument: 8,
    AMLapproval: 9,
    TaxCard: 10,
    PEP: 11,
    KeyManager: 12,
    CreditCard: 13,
    Agreement: 14,
    BeneficiaryDeclaration: 15,
    CVV: 16
};

var ePostboxTopic = {
    ClaimRequestFailed: "ClaimRequestFailed",
    UploadCCNumberResult: "UploadResult",
    CCNumberValidation: "CCNumberValidation",
    CVVValidation: "CVVValidation",
    StartTokenizationFlowIfCCValid: "StartTokenizationFlowIfCCValid",
    UsedCCNumber: "UsedCCNumber",
    ClearCCData: "ClearCCData",
    CCNumberIframeReady: "CCNumberIframeReady",
    SetSpinnerVisibility: "SetSpinnerVisibility",
    PaymentDeposit: "payment-deposit",
    PaymentFormValid: "payment-formValid",
    EnableCCFormFieldsValidation: "EnableCCFormFieldsValidation",
    ValidateCCIframeFields: "ValidateCCIframeFields",
    ValidateCCIframeFieldsResult: "ValidateCCIframeFieldsResult",
    ConcretePaymentData: "ConcretePaymentData",
    ReloadConcretePayments: "ReloadConcretePayments",
    ConcretePaymentSelectedCountry: "ConcretePaymentSelectedCountry",
    MissingInfo: "MissingInfo",
    PaymentButtonsVisible: "ButtonsVisible"
};

var eConcretePaymentDataState = {
    Pending: "ConcretePaymentDataPending",
    Success: "ConcretePaymentDataSuccess"
};

var eTokenizationError = {
    frameNotLoaded: 0,
    uploadError: 1,
    claimError: 2,
    frameNotLoadedDepositIntended: 3
};

var eAjaxerState = {
    None: 0,
    Retry: 1,
    SlaCompromised: 2
};

var eUIVersion = {
    Default: 0
};

var eSignalType = {
    TechnicalAnalysis: 1,
    Alert: 2,
    CandleStick: 3,
    Pattern: 4
};

var eDirections = {
    Up: "up",
    Down: "down",
    Bold: "bold"
};

var ePCIValidationType = {
    StartDepositFlow: 0,
    StartDepositValidation: 1,
    ResetValidation: 2
};

var eConcretePaymentCategory = {
    Recommended: 0,
    CreditCard: 1,
    EPayments: 2,
    BankTransfer: 3,
    PrepaidCards: 4,
    LastPayment: 5
};

var eFxNetEvents = {
    Init: 'fx-net-init-event',
    Start: 'fx-net-start-event',
    End: 'fx-net-end-event',
    UiLayerStart: 'fx-net-ui-layer-start-event',
    UiLayerEnd: 'fx-net-ui-layer-end-event',
    CacheLoadStart: 'fx-net-start-cache-load-event',
    CacheLoadEnd: 'fx-net-end-cache-load-event',
    InitialDataStart: 'fx-net-start-initial-data-event',
    InitialDataEnd: 'fx-net-end-initial-data-event',
    WaitHtmlStart: 'fx-net-start-wait-html-event',
    WaitHtmlEnd: 'fx-net-end-wait-html-event',
    ApplyBindingsStart: 'fx-net-start-apply-bindings-event',
    ApplyBindingsEnd: 'fx-net-end-apply-bindings-event',
    SplashScreenRemoved: 'fx-net-splash-screen-removed',
    ExposeUi: 'fx-net-expose-ui-event',
    GtmConfigurationSet: 'fx-net-gtm-configuration-set',
    ChartInit: 'fx-net-chart-instance-init',
    ChartInitComplete: 'fx-net-chart-instance-init-complete',
    ChartStart: 'fx-net-chart-instance-start',
    ChartStartComplete: 'fx-net-chart-instance-start-complete',
    ChartGetHistoryRequest: 'fx-net-chart-get-history-request',
    ChartGetHistoryResponse: 'fx-net-chart-get-history-response',
    FirstQuoteEvent: 'fx-net-first-quote-event',
    Trading_Central_Added: 'Trading_Central_Added',
    Trading_Central_Removed: 'Trading_Central_Removed'
};

var eRefDomElementsIds = {
    newDealRefParentTopElement: "#AccSummaryEquityTitle"
};

var eAvailabilityState = {
    Unknown: -1,
    NotAvailable: 0,
    Available: 1
};

var eApplicationTypes = {
    Web: 0,
    Mobile: 1,
    Dealer: 3
};

//----------------------------------------------------

var eDeepLinkParameterType = {
    Integer: 0,
    Instrument: 1,
    OrderDir: 2,
    Tab: 3,
    Form: 4,
    LoginOption: 5,
    View: 6,
    SettingsView: 7,
    String: 8
};

var eTransactionSwitcher = {
    None: 0,
    NewDeal: 1,
    NewLimit: 2,
    NewPriceAlert: 4
};

var eExpirationDateUIType = {
    Select: 1,
    RadioGroup: 2
};

var ePresetsOrder = {
    None: 0,
    Ascending: 1,
    Descending: 2
};

var eConfigContentValues = {
    False: "0",
    True: "1"
};

var ePlatformSwitch = {
    Demo: "demo",
    Real: "real",
    None: "none"
};

var ePendingBonusType = {
    cashBack: 0,
    spreadDiscount: 1
};

//----------------------------------------------------

var eHistoryStateType = {
    ExitFullscren: 'exitfullscren',
    EnterFullscren: 'enterfullscren',
    CloseAlert: 'closealert',
    CloseDialog: 'closedialog',
    Invalid: 'invalid',
    View: 'view',
    Questionnaire: 'questionnaire',
    Wizard: 'wizard'
};

//----------------------------------------------------

var ePopupType = {
    Alert: 'alert',
    Dialog: 'dialog'
};

//----------------------------------------------------

var eNavigateDirection = {
    Next: 0,
    Prev: 1
};

//----------------------------------------------------

var eSetLimitsTabs = {
    None: 0,
    Rate: 1,
    Amount: 2,
    NoTabs: 3,
    Percent: 4
};

var eUIScreens = {
    FXNetMobileDefault: 11,
    FXNetMobileTradingMajors: 12,
    FXNetMobileTradingMinors: 13,
    FXNetMobileEuroCrosses: 14,
    FXNetMobileGBPCrosses: 15,
    FXNetMobileJPYCrosses: 16,
    FXNetMobileOtherCrosses: 17,
    FXNetMobileCFD: 32,
    FXNetMobileDefaultWithoutfutures: 33
};

//----------------------------------------------------

var eWeekendFinancingTypes = {
    None: 0,
    Friday: 1,
    Thursday: 2
};

//----------------------------------------------------

var eResourcesNames = {
    ChartsResources: 'charts_resources',
    FaqDeposit: 'faqdeposit',
    FaqDepositThankYou: 'faqdepositthankyou',
    Support: 'support',
    FaqUploadDocuments: 'faquploaddocuments'
};

var eStateObjectTopics = {
    ReadyForUse: "ReadyForUse",
    ToolsToggle: "toolsToggle",
    SignalChartToggle: "signalChartToggle",
    CsmOutOfDate: "CsmOutOfDate",
    UserFlowChanged: "UserFlowChanged",
    ClosedDealsUseFilters: 'ClosedDealsUseFilters',
    ScmmFddLoaded: 'ScmmFddLoaded'
}

var eQuestionnaireType = {
    CDD: 0,
    KYC: 1,
    MIFID: 2
};

var eAccountMode = {
    None: "0",
    Demo: "1",
    Real: "2"
};

var eEducationalTutorialsType = {
    Basic: "novice",
    Advanced: "advanced"
};

var eWireTransferStatus = {
    Pending: 3,
    Approved: 4,
    Canceled: 5,
    ApprovalOnPending: 6,
    CanceledPendingDeposit: 7
};

var eUploadDocumentType = {
    ProofOfID: 1,
    ProofOfResidence: 2,
    CreditCardCopy: 3,
    DepositConfirmation: 6,
    WithdrawalPendingRequest: 7,
    OtherDocuments: 8,
    TaxCard: 10
};

var eUploadDocumentStatus = {
    Approved: 1,
    AwaitingDocument: 2,
    Processing: 3,
    Incomplete: 4,
    NotRequired: 5,
    AwaitingSignature: 6,
    AwaitingSignatureHighAmount: 7
};

var eCountryAttributes = {
    Id: 0,
    Name: 1,
    IsActive: 2
};

var eFormActions = {
    newDeal: 'NewDeal',
    newLimit: 'NewLimit',
    deposit: 'Deposit'
};

var eFixPosition = {
    deletePosition: 1,
    restorePosition: 0
};

var registerParams = {
    traderInstrumentId: 'trader_instrumentId=',
    traderOrderDir: '&trader_orderdir=',
    traderFrom: 'trader_from',
};

var eUserFlowSteps = {
    None: -1,
    OpenedAnAccount: 0,
    GeneralInforamtionQuestionnaire: 1,
    TradingKnowledgeQuiz: 2,
    ProofOfIdentity: 3,
    FundYourAccount: 4,
    Trade: 5
};
var eUserStatus = {
    NA: -1,
    NotActivated: 0,
    ReadyToTrade: 1,
    ActiveLimited: 2,
    Active: 3,
    Restricted: 4,
    Locked: 5
};
var eStepStatus = {
    NotActive: 0, // black
    Seamless: 1, // gray
    Error: 2, // red x
    Restricted: 3, // red no entry
    Available: 4, // blue
    Complete: 5, // green
    Hidden: 6
};
var eCta = {
    None: 0,
    Seamless: 1,
    ContactUs: 2,
    ClientQuestionnaire: 3,
    Deposit: 4,
    UploadDocuments: 5
};

var eAccountRedirectForms = {
    WithdrawalAutomation: 1013,
    WireTransfers: 1015,
    NewApproveWireTransfer: 1016,
    WithdrawalProcess: 1017,
    ConvertBalance: 1018,
    ConvertAccountLine: 1019,
    GeneralAccountActions: 1020,
    FixPosition: 1021
};

var eRequestAccessType = {
    Signals: 0,
    VideoLessons: 1,
    Tutorials: 2
};

var eStateObjectAccessRequest = {
    Signals: "Signals",
    VideoLessons: "VideoLessons",
    Tutorials: "Tutorials"
};

var eAccessRequestStatus = {
    RequestNotSubmitted: 1,
    RequestSubmitted: 2,
    ExtensionNotSubmitted: 3,
    ExtensionSubmitted: 4
};

var instrumentInfoProps = {
    pipValue: 'pipValue',
    pipWorth: 'pipWorth',
    requiredMargin: 'requiredMargin',
    offHoursRequiredMargin: 'offHoursRequiredMargin',
    maximumLeverage: 'maximumLeverage',
    minDealAmount: 'minDealAmount',
    maxDealAmount: 'maxDealAmount',
    marketPriceTolerance: 'marketPriceTolerance',
    ofSell: 'ofSell',
    ofBuy: 'ofBuy',
    ofPercentageSell: 'ofPercentageSell',
    ofPercentageBuy: 'ofPercentageBuy',
    overnightFinancingGMT: 'overnightFinancingGMT',
    rolloverDate: 'rolloverDate',
    dividendDate: 'dividendDate',
    dividendAmount: 'dividendAmount',
    weekendFinancing: 'weekendFinancing'
};

var eDealerParams = {
    DealerCurrency: 'dealerCurrency',
    DealerAdvancedWalletView: 'dealerAdvancedWalletView'
};

var ePeriodTabs = {
    None: -1,
    Short: 0,
    Medium: 1,
    Long: 2
};

var eMarketInfoPeriods = {
    FiveMin: 1,
    OneH: 2,
    TwelveHours: 3,
    Today: 4,
    OneDay: 5,
    OneWeek: 6,
    TwoWeeks: 7,
    ThisMonth: 8,
    ThirtyDays: 9,
    NinetyDays: 10,
    FiftyTwoWeeks: 11,
    ThisYear: 12
};

var eRateIDataPositions = {
    Id: 0,
    High: 1,
    Low: 2
};


var eMarketInfoPrefixEvent = {
    NewDeal: 'deal-slip',
    NewLimitViewModel: 'limit-slip',
    CloseDeal: 'close-deal',
    EditLimitViewModel: 'edit-limit',
    EditClosingLimit: 'edit-closing-limit'
};

var eMarketInfoNameEvent = {
    TradingSentiment: 'trading-sentiment',
    MarketInfo: 'market-info',
    HighLow: 'high-low',
    InstrumentInfo: 'instrument-info'
};

var eAccordionState = {
    collapse: 'collapse',
    expand: 'expand'
};

var eMarketInfoEvents = {
    DealSlipTradingSentimentCollapse: 'deal-slip-collapse-trading-sentiment',
    DealSlipTradingSentimentExpand: 'deal-slip-expand-trading-sentiment',
    DealSlipMarketInfoCollapse: 'deal-slip-collapse-market-info',
    DealSlipMarketInfoExpand: 'deal-slip-expand-market-info',
    DealSlipHighLowCollapse: 'deal-slip-collapse-high-low',
    DealSlipHighLowExpand: 'deal-slip-expand-high-low',
    DealSlipInstrumentInfoCollapse: 'deal-slip-collapse-instrument-info',
    DealSlipInstrumentInfoExpand: 'deal-slip-expand-instrument-info',

    LimitSlipTradingSentimentCollapse: 'limit-slip-collapse-trading-sentiment',
    LimitSlipTradingSentimentExpand: 'limit-slip-expand-trading-sentiment',
    LimitSlipMarketInfoCollapse: 'limit-slip-collapse-market-info',
    LimitSlipMarketInfoExpand: 'limit-slip-expand-market-info',
    LimitSlipHighLowCollapse: 'limit-slip-collapse-high-low',
    LimitSlipHighLowExpand: 'limit-slip-expand-high-low',
    LimitSlipInstrumentInfoCollapse: 'limit-slip-collapse-instrument-info',
    LimitSlipInstrumentInfoExpand: 'limit-slip-expand-instrument-info',

    CloseDealTradingSentimentCollapse: 'close-deal-collapse-trading-sentiment',
    CloseDealTradingSentimentExpand: 'close-deal-expand-trading-sentiment',
    CloseDealMarketInfoCollapse: 'close-deal-collapse-market-info',
    CloseDealMarketInfoExpand: 'close-deal-expand-market-info',
    CloseDealHighLowCollapse: 'close-deal-collapse-high-low',
    CloseDealHighLowExpand: 'close-deal-expand-high-low',
    CloseDealInstrumentInfoCollapse: 'close-deal-collapse-instrument-info',
    CloseDealInstrumentInfoExpand: 'close-deal-expand-instrument-info',

    EditClosingLimitTradingSentimentCollapse: 'edit-closing-limit-collapse-trading-sentiment',
    EditClosingLimitTradingSentimentExpand: 'edit-closing-limit-expand-trading-sentiment',
    EditClosingLimitMarketInfoCollapse: 'edit-closing-limit-collapse-market-info',
    EditClosingLimitMarketInfoExpand: 'edit-closing-limit-expand-market-info',
    EditClosingLimitHighLowCollapse: 'edit-closing-limit-collapse-high-low',
    EditClosingLimitHighLowExpand: 'edit-closing-limit-expand-high-low',
    EditClosingLimitInstrumentInfoCollapse: 'edit-closing-limit-collapse-instrument-info',
    EditClosingLimitInstrumentInfoExpand: 'edit-closing-limit-expand-instrument-info',

    EditLimitTradingSentimentCollapse: 'edit-limit-collapse-trading-sentiment',
    EditLimitTradingSentimentExpand: 'edit-limit-expand-trading-sentiment',
    EditLimitMarketInfoCollapse: 'edit-limit-collapse-market-info',
    EditLimitMarketInfoExpand: 'edit-limit-expand-market-info',
    EditLimitHighLowCollapse: 'edit-limit-collapse-high-low',
    EditLimitHighLowExpand: 'edit-limit-expand-high-low',
    EditLimitInstrumentInfoCollapse: 'edit-limit-collapse-instrument-info',
    EditLimitInstrumentInfoExpand: 'edit-limit-expand-instrument-info'
};

var eMarketInfoSectionsProps = {
    tsArea: 0,
    miArea: 1,
    hlArea: 2,
    iiArea: 3
};

var eWithdrawalSteps = {
    setAmount: 1,
    setMethod: 2,
    setBankDetails: 3,
    setCreditCard: 4,
    setApproval: 5
};

var eWithdrawalMethods = {
    card: 0,
    bank: 1
};

var eHelpcSections = {
    default: 'helpc',
    personalguide: 'pg'
};

var eHowtoWthrough = {
    quickTour: 'qpt',
    foundAccount: 'fya',
    openDeal: 'oad',
    uploadDocument: 'uad'
};

var eCustomerStateSuffix = {
    seameless: '_seameless',
    pending: '_pending',
    live: '_live',
    demo: '_demo'
};