var eForms = {
    Deals: 2,
    Statement: 5,
    Deposit: 6,
    Withdrawal: 7,
    ActivityLog: 8,
    PersonalDetails: 9,
    ClientQuestionnaire: 10,
    ViewAndPrintWithdrawal: 12,
    TransactionsReport: 13,
    UploadDocuments: 14,
    TradingSignals: 15,
    ThirdParty: 16,
    Tutorials: 19,
    EducationalTutorials: 20,
    AdvinionChart: 21,
    EconomicCalendar: 23,
    AccountCardRecords: 24,
    ContractRollover: 25,
    NotificationsSettings: 26,
    ConcretePaymentForm: 34,
    DepositSuccess: 64,
    DepositPending: 65,
    DepositConfirmation: 66,
    RolledOver: 67,
    Settings: 68,
    PriceAlerts: 69,
    WireTransferSuccess: 70,
    PendingWithdrawal: 71,
    WithdrawalThankYou: 72,
    DocumentVerificationModal: 73
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
    vQuotesPreset: 14,
    vDeposit: 15,
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
    vPaymentTypes: 30,
    vActivityLog: 31,
    vAccountStatment: 33,
    vPersonalDetails: 34,
    vToolBar: 35,
    vPageTitle: 36,
    vClientQuestionnaire: 38,
    vClosedDealsSummaries: 39,
    vCloseDeal: 40,
    vRolledOver: 41,
    vOrderTabs: 43,
    vMarginStatus: 44,
    vAmlStatus: 45,
    vViewAndPrintWithdrawal: 46,
    vTransactionsReport: 47,
    vRelatedPosition: 48,
    vUploadDocuments: 49,
    vTradingSignals: 52,
    vThirdParty: 53,
    vTradingSignalsTutorials: 54,
    vTutorials: 59,
    vCreditCard3rdParty: 60,
    vEditLimitExpirationDate: 61,
    vEmpCashU: 62,
    vEducationalTutorials: 63,
    vEducationalTutorialsPopup: 64,
    vEpaylinks: 65,
    vMoneyBookers: 72,
    vConcretePaymentForm: 75,
    vSafeChargeCashier: 100,
    vAdvinionChart: 101,
    vMissingCustomerInformation: 102,
    vAstropay: 106,
    vCddFinancialDetails: 107,
    vNetellerGO: 108,
    vPaySafeCard: 109,
    vWireTransfer: 110,
    vAccountSummaryWallet: 111,
    vNewDealSlip: 1000,
    vEconomicCalendar: 112,
    vMarketClosed: 115,
    vCashBack: 116,
    vGlobalCollectAPM: 117,
    vInatecAPMGiropay: 118,
    vInatecAPMPrzelewy24: 119,
    vAccountCardRecords: 120,
    vNoAPIClearer: 121,
    vEcoPayz: 122,
    vSofortDirect: 123,
    vTransactionSwitcher: 125,
    vSignalsTechnicalAnalysisGrid: 126,
    vSignalsAlertGrid: 127,
    vSignalsCandleStickGrid: 128,
    vSignalsService: 129,
    vSignalsDisclamer: 130,
    vKluwp: 131,
    vContractRollover: 132,
    vDealsTabs: 133,
    vNotificationsSettings: 134,
    vClosedDealsDialog: 135,
    vRPN: 136,
    vPayPal: 137,
    vAstropayCard: 138,
    vGenericCreditCard: 139,
    vPayRetailers: 140,
    vDepositSuccessThankYou: 219,
    vDepositPendingThankYou: 220,
    vDepositConfirmation: 221,
    vSettings: 222,
    vAccountPreferences: 223,
    vEnableTrading: 224,
    vPriceAlerts: 226,
    vRisingSunAPM: 227,
    vNewPriceAlert: 228,
    vWireTransferSuccess: 229,
    vJeton: 230,
    vZotapayAPM: 231,
    vWithdrawalThankYou: 232,
    vBitWallet: 233,
    vDocumentVerificationModal: 234,
    vNuveiAPM: 235,
    vGlobePay: 236,
    vAstropayWallet: 237,
    vPerfectMoney: 238
};

var eTemplateNames = {
    editLimitNavigator: 'deal-details-navigator'
};

var eFullScreenControl = {
    TransactionSwitcher: 'TransactionSwitcherDivFullScreen',
    ChartPage: 'ChartPageFullScreen'
};

var eDialog = {
    NewDealSlip: "NewDealSlipDiv",
    NewLimit: "dlgNewLimit",
    TransactionSwitcher: 'TransactionSwitcherDiv',
    NewPriceAlert: 'NewPriceAlertDiv',
    EditLimitExpirationDate: "dlgEditLimitExpirationDate",
    EditClosingLimit: "dlgEditClosingLimit",
    CloseDeal: "dlgCloseDeal",
    ClosedDeal: "dlgClosedDeals",
    RolledOver: "RolledOverDiv",
    EditLimit: "dlgEditLimit",
    MarginStatus: "MarginStatusDiv",
    AmlStatus: "AmlStatusDiv",
    RelatedPosition: "RelatedPositionDiv",
    TradingSignalsTutorials: "TradingSignalsTutorialsDiv",
    EducationalTutorialsPopup: "EducationalTutorialsPopupDiv",
    MissingCustomerInformation: "MissingCustomerInformationDiv",
    MissingCustomerInformationContainer: "#paymentTypesContainerABTesting",
    NetExposuresSummaryDialog: 'fx-component-netexposures-summary',
    CashBackDialog: 'CashBackDiv',
    AccountCardRecords: "AccountCardRecordsDiv",
    ContractRollover: "ContractRolloverDiv",
    ClientQuestionnaire: "KycStatusDiv",
    DepositConfirmation: "DepositConfirmationDiv",
    DocumentVerification: "DocumentVerificationDiv"
};

var eFullScreenTogleControls = {
    TransactionSwitcher: { full: 'TransactionSwitcherDivFullScreen', default: eDialog.TransactionSwitcher },
    ChartPage: { full: 'ChartPageFullScreen', default: eForms.AdvinionChart },
    EditClosingLimit: { full: 'TransactionSwitcherDivFullScreen', default: eDialog.EditClosingLimit },
    CloseDeal: { full: 'TransactionSwitcherDivFullScreen', default: eDialog.CloseDeal },
    EditLimit: { full: 'TransactionSwitcherDivFullScreen', default: eDialog.EditLimit }
};

var eClientExportTable = {
    2: 'tblOpenDeals',
    3: 'tblLimits',
    4: 'tblClosedDeals',
    13: 'tblTransactionsReport',
    66: 'depositsFrame'
};

var eServerExportTable = {
    3: 'tblExportLimits',
    4: 'tblExportClosedDeals',
    5: 'tblExportAccountStatment',
    8: 'tblExportActivityLog'
};

var eComponent = {
    3: 'historical-limits',
    4: 'closed-deals',
    5: 'account-statement',
    8: 'activity-log'
};

var eSettingsViews = {
    PersonalInformation: {
        form: eForms.Settings,
        viewId: eViewTypes.vPersonalDetails
    },
    AccountPreferences: {
        form: eForms.Settings,
        viewId: eViewTypes.vAccountPreferences
    },
    ChangePassword: {
        form: eForms.Settings,
        viewId: eViewTypes.vChangePassword
    },
    NotificationsSettings: {
        form: eForms.Settings,
        viewId: eViewTypes.vNotificationsSettings
    }
};

var eAbTestProps = {
    dealSlipsRevised: 'fx-revised-deal-slips'
};
