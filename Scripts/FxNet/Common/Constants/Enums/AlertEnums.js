var AlertTypes = {
    CloseDealAlert: 0,
    ServerResponseAlert: 1,
    SimpleClientAlert: 2,
    MaxIdleTimeAlert: 3,
    DoubleLoginAlert: 4,
    ExposureCoverageAlert: 5,
    MinEquityAlert: 6,
    BonusAlert: 7,
    ExitAlert: 8,
    CCDeposit: 9,
    ClientQuestionnaire: 10,
    CddClientQuestionnaire: 11,
    GeneralOkCancelAlert: 12,
    ClosePositionsConfirmation: 13,
    SignalsDisclaimerAlert: 14,
    GeneralCancelableAlert: 15,
    PopupClientQuestionnaire: 16,
    DealsClosedServerResponseAlert: 17,
    DealAddServerResponseAlert: 18,
    LimitsServerResponseAlert: 19,
    GeneralOkAlert: 20,
    RemoveCreditCardConfirmationAlert: 27,
    MultipleDealsClosedConfirmation: 28,
    ClientKnowledgeQuestionnaire: 29,
    RemoveFingerprintLoginOptionConfirmationAlert: 40,
    AddFingerprintLoginOptionConfirmationAlert: 41,
    ScanFingerprintLoginOptionConfirmationAlert: 42,
    FingerprintLoginActivatedAlert: 43,
    DeviceNotSupportFingerprintAlert: 44,
    DepositSuccessAlert: 45,
    HelpAlert: 46,
    DepositConfirmationEmailSentAlert: 47,
    ContactUsCTAAlert: 48,
    TradingConfirmationRetryAlert: 49,
    MultiplePriceAlertsClosedConfirmation: 50,
    PriceAlertServerResponseAlert: 51,
    PriceAlertClosedServerResponseAlert: 52,
    IframeAlert: 53,
    RequestAccessVideoLessonsAlert: 54,
    RequestAccessTutorialsAlert: 55,
    SessionEndedAlert: 56,
    DepositConfirmationSignatureAlert: 57,
    CreditCardNotApprovedAlert: 58,
    DepositQuestionnaireAlert: 59
};

var PostClientStatesLoginsAlerts = {
    ExposureAlert: 21,
    ExposureCoverageAlert: 22,
    SystemMode: 23,
    MarketState: 24,
    SystemModeApplicationClosing: 25,
    SystemModeApplicationShutDown: 26

};

var PostPortfoliosLoginsAlerts = {
    AmlStatus: 30,
    IsActive: 31,
    IsDemo: 32,
    IsReal: 35,
    KycStatus: 33,
    PepStatus: 34
};

var SaveWithdrawalResponseReturnType = {
    NotPossible: 0,
    EquityLimit: 1,
    AmountLimit: 2,
    Succeded: 3,
    EquityChanged: 4,
    HasOpenPos: 5,
    BalanceError: 6,
    TradingBonusTakeoutRequired: 7,
    TradingBonusTakeoutRequiredRich: 8
};

var KnowledgeAlertTypes = {
    Retry: 0,
    Review: 1,
    Tested: 2,
    Inappropriate: 3,
    Unsuitable: 4
};