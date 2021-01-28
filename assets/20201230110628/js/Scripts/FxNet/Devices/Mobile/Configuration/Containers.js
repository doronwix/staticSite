define(
    'configuration/Containers',
    [
        'require',
        'customEnums/ViewsEnums',
        'enums/enums',
        'handlers/HashTable'
    ],
    function Containers(require) {
        var THashTable = require('handlers/HashTable');
        var viewsCollections = {};
        var formsContainer = new THashTable();
        var _uiVersion;
        var independentViews = [
            eViewTypes.vMissingCustomerInformation
        ];

        viewsCollections[eUIVersion.Default] = function () {
            formsContainer.SetItem(eForms.Quotes, {
                "mappedViews": [
                    eViewTypes.vQuotes,
                    eViewTypes.vMenu,
                    eViewTypes.vMarketClosed,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vQuotesPreset
                ]
            });

            formsContainer.SetItem(eForms.OpenDeals, {
                "mappedViews": [
                    eViewTypes.vOpenDeals,
                    eViewTypes.vMenu,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.Limits, {
                "mappedViews": [
                    eViewTypes.vLimits,
                    eViewTypes.vMenu,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.ClosedDeals, {
                "mappedViews": [
                    eViewTypes.vClosedDealsSummaries,
                    eViewTypes.vMenu,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.ClosedDealsFilter, {
                "mappedViews": [
                    eViewTypes.vClosedDealsFilter,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.ContractRollover, {
                "mappedViews": [
                    eViewTypes.vContractRollover,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.AccountCardRecords, {
                "mappedViews": [
                    eViewTypes.vAccountCardRecords,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.AccountCardRecordsCosts, {
                "mappedViews": [
                    eViewTypes.vAccountCardRecords,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.Wallet, {
                "mappedViews": [
                    eViewTypes.vWallet,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.Transaction, {
                "mappedViews": [
                    eViewTypes.vTransactionSwitcher,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.NewPriceAlert, {
                "mappedViews": [
                    eViewTypes.vNewPriceAlert,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.ClosedDealDetails, {
                "mappedViews": [
                    eViewTypes.vClosedDealDetails,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.Balance, {
                "mappedViews": [
                    eViewTypes.vBalance,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.NetExposure, {
                "mappedViews": [
                    eViewTypes.vNetExposure,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.CashBack, {
                "mappedViews": [
                    eViewTypes.vCashBack,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.Withdrawal, {
                "mappedViews": [
                    eViewTypes.vWithdrawal,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.EditFavoriteInstruments, {
                "mappedViews": [
                    eViewTypes.vEditFavoriteInstruments,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.EditClosingLimit, {
                "mappedViews": [
                    eViewTypes.vEditClosingLimit,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.CloseDeal, {
                "mappedViews": [
                    eViewTypes.vCloseDeal,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.InternalContactUs, {
                "mappedViews": [
                    eViewTypes.vInternalContactUs,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.PendingWithdrawal, {
                "mappedViews": [
                    eViewTypes.vPendingWithdrawal,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.EditLimit, {
                "mappedViews": [
                    eViewTypes.vEditLimit,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.Menu, {
                "mappedViews": [
                    eViewTypes.vMenu
                ]
            });

            formsContainer.SetItem(eForms.Deposit, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vPaymentTypes,
                    eViewTypes.vMenu
                ]
            });

            formsContainer.SetItem(eForms.DepositSuccess, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vDepositSuccessThankYou,
                ]
            });

            formsContainer.SetItem(eForms.DepositPending, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vDepositPendingThankYou,
                ]
            });

            formsContainer.SetItem(eForms.ConcretePaymentForm, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vConcretePaymentForm
                ]
            });

            formsContainer.SetItem(eForms.Charts, {
                "mappedViews": [
                    eViewTypes.vCharts
                ]
            });

            formsContainer.SetItem(eForms.AddInstrument, {
                "mappedViews": [
                    eViewTypes.vAddInstrument,
                    eViewTypes.vTradingSummery
                ]
            });

            formsContainer.SetItem(eForms.ThirdParty, {
                "mappedViews": [
                    eViewTypes.vThirdParty
                ]
            });

            formsContainer.SetItem(eForms.Aml, {
                "mappedViews": [
                    eViewTypes.vAmlStatus,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.ClientQuestionnaire, {
                "mappedViews": [
                    eViewTypes.vClientQuestionnaire,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.ChangePassword, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vChangePassword
                ]
            });

            formsContainer.SetItem(eForms.UploadDocuments, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vUploadDocuments
                ]
            });

            formsContainer.SetItem(eForms.TradingSignals, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vTradingSignals
                ]
            });

            formsContainer.SetItem(eForms.EconomicCalendar, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vEconomicCalendar
                ]
            });

            formsContainer.SetItem(eForms.EconomicCalendarFilter, {
                "mappedViews": [
                    eViewTypes.vPopupHeader,
                    eViewTypes.vEconomicCalendar,
                    eViewTypes.vEconomicCalendarFilter
                ]
            });

            formsContainer.SetItem(eForms.EducationalTutorials, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vEducationalTutorialsSwitcher
                ]
            });

            formsContainer.SetItem(eForms.TradingSignalDetails, {
                "mappedViews": [
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vTradingSummery,
                    eViewTypes.vTradingSignalDetails
                ]
            });

            formsContainer.SetItem(eForms.SignalsDisclaimer, {
                "mappedViews": [
                    eViewTypes.vPopupHeader,
                    eViewTypes.vSignalsDisclaimer
                ]
            });

            formsContainer.SetItem(eForms.NotificationsSettings, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vNotificationsSettings
                ]
            });

            formsContainer.SetItem(eForms.WithdrawalBankDetails, {
                "mappedViews": [
                    eViewTypes.vWithdrawalBankDetails,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.WithdrawalCCDetails, {
                "mappedViews": [
                    eViewTypes.vWithdrawalCCDetails,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.HelpDepositThankYou, {
                "mappedViews": [
                    eViewTypes.vHelpDepositThankYou,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.HelpUploadDocuments, {
                "mappedViews": [
                    eViewTypes.vHelpUploadDocuments,
                    eViewTypes.vPopupHeader
                ]
            });

            formsContainer.SetItem(eForms.EducationalTutorialsAccess, {
                "mappedViews": [
                    eViewTypes.vPopupHeader,
                    eViewTypes.vEducationalTutorialsAccess
                ]
            });

            formsContainer.SetItem(eForms.PriceAlerts, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vPriceAlerts
                ]
            });

            formsContainer.SetItem(eForms.WireTransfer, {
                "mappedViews": [
                    eViewTypes.vWireTransfer
                ]
            });

            formsContainer.SetItem(eForms.WireTransferSuccess, {
                "mappedViews": [
                    eViewTypes.vTradingSummery,
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vWireTransferSuccess
                ]
            });

            formsContainer.SetItem(eForms.UserFlowMap, {
                "mappedViews": [
                    eViewTypes.vUserFlowMap
                ]
            });

            formsContainer.SetItem(eForms.AccountPreferences, {
                "mappedViews": [
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vAccountPreferences
                ]
            });

            formsContainer.SetItem(eForms.PersonalInformation, {
                "mappedViews": [
                    eViewTypes.vDynamicHeader,
                    eViewTypes.vPersonalInformation
                ]
            });

            formsContainer.SetItem(eForms.WithdrawalThankYou, {
                "mappedViews": [
                    eViewTypes.vWithdrawalThankYou,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.InternalContactUs, {
                "mappedViews": [
                    eViewTypes.vInternalContactUs,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.FeedbackUs, {
                "mappedViews": [
                    eViewTypes.vFeedbackUs,
                    eViewTypes.vDynamicHeader
                ]
            });

            formsContainer.SetItem(eForms.DocumentVerificationModal, {
                "mappedViews": [
                    eViewTypes.vPopupHeader,
                    eViewTypes.vDocumentVerificationModal
                ]
            });

        };

        var getUiVersion = function () {
            return _uiVersion;
        };

        var init = function (uiVersion) {
            formsContainer.Clear();

            if (typeof viewsCollections[uiVersion] === "undefined") {
                // Fallback to First version
                uiVersion = eUIVersion.Default;
            }

            viewsCollections[uiVersion]();

            _uiVersion = uiVersion;
        };

        return {
            Init: init,
            IndependentViews: independentViews,
            Forms: formsContainer,
            MainForm: eForms.Quotes,
            UiVersion: getUiVersion
        };
    }
);