﻿var eForms = {
    Quotes: 1,
    OpenDeals: 2,
    Limits: 3,
    ClosedDeals: 4,
    Wallet: 5,
    ClosedDealDetails: 7,
    Balance: 10,
    NetExposure: 11,
    Withdrawal: 12,
    EditFavoriteInstruments: 13,
    Deposit: 15,
    EditClosingLimit: 16,
    InternalContactUs: 17,
    PendingWithdrawal: 18,
    EditLimit: 20,
    Menu: 21,
    Charts: 23,
    AddInstrument: 24,
    ThirdParty: 25,
    Aml: 26,
    ClientQuestionnaire: 27,
    UploadDocuments: 28,
    TradingSignals: 30,
    EconomicCalendar: 31,
    TradingSignalDetails: 32,
    EconomicCalendarFilter: 33,
    ConcretePaymentForm: 34,
    Transaction: 35,
    CashBack: 50,
    ChangePassword: 51,
    NotificationsSettings: 52,
    ClosedDealsFilter: 53,
    CloseDeal: 54,
    ContractRollover: 55,
    AccountCardRecords: 56,
    WithdrawalBankDetails: 57,
    WithdrawalCCDetails: 58,
    AccountCardRecordsCosts: 60,
    EducationalTutorials: 61,
    EducationalTutorialsAccess: 62,
    SignalsDisclaimer: 63,
    DepositSuccess: 64,
    DepositPending: 65,
    HelpDepositThankYou: 68,
    HelpUploadDocuments: 70,
    PriceAlerts: 71,
    WireTransfer: 72,
    WireTransferSuccess: 73,
    NewPriceAlert: 74,
    UserFlowMap: 75,
    PersonalInformation: 77,
    WithdrawalThankYou: 78,
    FeedbackUs: 79,
    DocumentVerificationModal: 80,
    AccountPreferences: 81
};

var eViewTypes = {
    vQuotes: 1,
    vOpenDeals: 2,
    vLimits: 3,
    vClosedDeals: 4,
    vWallet: 5,
    vNewDeal: 6,
    vClosedDealDetails: 7,
    vNewLimit: 9,
    vBalance: 10,
    vNetExposure: 11,
    vWithdrawal: 12,
    vEditFavoriteInstruments: 13,
    vQuotesPreset: 14,
    vEditClosingLimit: 16,
    vContact: 17,
    vPendingWithdrawal: 18,
    vEditLimit: 20,
    vMenu: 21,
    vCharts: 23,
    vAddInstrument: 24,
    vTradingSummery: 25,
    vSummeryView: 26,
    vHomepageContent: 27,
    vSideMenu: 28,
    vChangePassword: 29,
    vActivityLog: 31,
    vPersonalDetails: 34,
    vToolBar: 35,
    vPageTitle: 36,
    vClosedDealsSummaries: 39,
    vCloseDeal: 40,
    vRolledOver: 41,
    vEditDealLimit: 42,
    vOrderTabs: 43,
    vMarginStatus: 44,
    vViewAndPrintWithdrawal: 46,
    vTransactionsReport: 47,
    vRelatedPosition: 48,
    vUploadDocuments: 49,
    vThirdParty: 51,
    vTradingSignals: 52,
    vTradingSignalsTutorials: 53,
    vDynamicHeader: 54,
    vTutorials: 59,
    vCreditCard3rdParty: 60,
    vPaymentTypes: 61,
    vEmpCashU: 62,
    vEpaylinks: 63,
    vSafeChargeCashier: 100,
    vAmlStatus: 64,
    vClientQuestionnaire: 65,
    vMissingCustomerInformation: 66,
    vAstropay: 69,
    vNetellerGO: 70,
    vPaySafeCard: 71,
    vMoneyBookers: 72,
    vConcretePaymentForm: 75,
    vGlobalCollectAPM: 76,
    vCashBack: 77,
    vInatecAPMGiropay: 78,
    vInatecAPMPrzelewy24: 79,
    vMarketClosed: 80,
    vNoAPIClearer: 81,
    vEcoPayz: 82,
    vSofortDirect: 83,
    vClosedDealsFilter: 84,
    vSignalsDisclaimer: 130,
    vEconomicCalendar: 200,
    vTradingSignalDetails: 201,
    vEconomicCalendarFilter: 202,
    vPopupHeader: 203,
    vTransactionSwitcher: 204,
    vKluwp: 205,
    vNotificationsSettings: 206,
    vRPN: 207,
    vPayPal: 208,
    vContractRollover: 209,
    vAccountCardRecords: 210,
    vWithdrawalBankDetails: 211,
    vWithdrawalCCDetails: 212,
    vAstropayCard: 213,
    vInternalContactUs: 214,
    vEducationalTutorialsSwitcher: 216,
    vEducationalTutorialsAccess: 217,
    vGenericCreditCard: 218,
    vDepositSuccessThankYou: 219,
    vDepositPendingThankYou: 220,
    vHelpDepositThankYou: 223,
    vHelpUploadDocuments: 225,
    vPayRetailers: 226,
    vPriceAlerts: 227,
    vRisingSunAPM: 228,
    vWireTransfer: 229,
    vWireTransferSuccess: 230,
    vNewPriceAlert: 231,
    vUserFlowMap: 232,
    vPersonalInformation: 234,
    vJeton: 235,
    vWithdrawalThankYou: 236,
    vZotapayAPM: 237,
    vBitWallet: 238,
    vFeedbackUs: 239,
    vDocumentVerificationModal: 240,
    vAccountPreferences: 241,
    vNuveiAPM: 242,
    vGlobePay: 243,
    vAstropayWallet: 244,
    vPerfectMoney: 245
};

var eTemplateNames = {
    editLimitNavigator: 'deal-details-navigator'
};

var eFullScreenControl = {};

var eFullScreenTogleControls = {};

var eSettingsViews = {
    PersonalInformation: {
        form: eForms.PersonalInformation,
        viewId: eViewTypes.vPersonalInformation
    },
    AccountPreferences: {
        form: eForms.AccountPreferences,
        viewId: eViewTypes.vAccountPreferences
    },
    ChangePassword: {
        form: eForms.ChangePassword,
        viewId: eViewTypes.vChangePassword
    },
    NotificationsSettings: {
        form: eForms.NotificationsSettings,
        viewId: eViewTypes.vNotificationsSettings
    }
};
