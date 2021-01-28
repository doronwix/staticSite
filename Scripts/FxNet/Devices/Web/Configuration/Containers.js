define("configuration/Containers", [
	"require",
	"customEnums/ViewsEnums",
	"enums/enums",
	"handlers/HashTable",
], function Containers(require) {
	var hashtable = require("handlers/HashTable");
	var viewsCollections = {};
	var formsContainer = new hashtable();
	var _uiVersion;
	var independentViews = [eViewTypes.vAmlStatus, eViewTypes.vMissingCustomerInformation];

	viewsCollections[eUIVersion.Default] = function () {
		formsContainer.SetItem(eForms.Deals, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vDealsTabs,
				eViewTypes.vOpenDeals,
				eViewTypes.vLimits,
				eViewTypes.vClosedDeals,
				eViewTypes.vMenu,
				eViewTypes.vToolBar,
				eViewTypes.vMarketClosed,
				eViewTypes.vEnableTrading,
			],
			hideToggle: true,
			exportSupport: { isExport: true, historicalData: false },
		});

		formsContainer.SetItem(eForms.Statement, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vBalance,
				eViewTypes.vMenu,
				eViewTypes.vToolBar,
				eViewTypes.vPageTitle,
			],
			exportSupport: { isExport: true, historicalData: true },
		});

		formsContainer.SetItem(eForms.Deposit, {
			mappedViews: [eViewTypes.vMenu, eViewTypes.vPaymentTypes, eViewTypes.vPageTitle],
		});

		formsContainer.SetItem(eForms.DepositSuccess, {
			mappedViews: [eViewTypes.vMenu, eViewTypes.vDepositSuccessThankYou, eViewTypes.vPageTitle],
		});

		formsContainer.SetItem(eForms.DepositPending, {
			mappedViews: [eViewTypes.vMenu, eViewTypes.vDepositPendingThankYou, eViewTypes.vPageTitle],
		});

		formsContainer.SetItem(eForms.WireTransferSuccess, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vWireTransferSuccess,
				eViewTypes.vPageTitle,
			],
		});

		formsContainer.SetItem(eForms.Withdrawal, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vMenu,
				eViewTypes.vWithdrawal,
				eViewTypes.vToolBar,
				eViewTypes.vPageTitle,
			],
		});

		formsContainer.SetItem(eForms.ViewAndPrintWithdrawal, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vMenu,
				eViewTypes.vViewAndPrintWithdrawal,
			],
		});

		formsContainer.SetItem(eForms.ActivityLog, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vMenu,
				eViewTypes.vActivityLog,
				eViewTypes.vToolBar,
				eViewTypes.vPageTitle,
			],
			exportSupport: { isExport: true, historicalData: true },
		});

		formsContainer.SetItem(eForms.PersonalDetails, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vPersonalDetails,
				eViewTypes.vMenu,
				eViewTypes.vToolBar,
				eViewTypes.vPageTitle,
			],
		});

		formsContainer.SetItem(eForms.ClientQuestionnaire, {
			mappedViews: [
				eViewTypes.vClientQuestionnaire,
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
			],
		});

		formsContainer.SetItem(eForms.TransactionsReport, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vTransactionsReport,
				eViewTypes.vMenu,
				eViewTypes.vToolBar,
				eViewTypes.vPageTitle,
			],
			exportSupport: { isExport: true, historicalData: false },
		});

		formsContainer.SetItem(eForms.UploadDocuments, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vMenu,
				eViewTypes.vToolBar,
				eViewTypes.vUploadDocuments,
				eViewTypes.vPageTitle,
			],
		});

		formsContainer.SetItem(eForms.ThirdParty, {
			mappedViews: [eViewTypes.vThirdParty],
		});

		formsContainer.SetItem(eForms.TradingSignals, {
			mappedViews: [
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vMenu,
				eViewTypes.vToolBar,
				eViewTypes.vPageTitle,
				eViewTypes.vTradingSignals,
				eViewTypes.vSignalsTechnicalAnalysisGrid,
				eViewTypes.vSignalsAlertGrid,
				eViewTypes.vSignalsCandleStickGrid,
				eViewTypes.vSignalsService,
				eViewTypes.vSignalsDisclamer,
			],
		});

		formsContainer.SetItem(eForms.AdvinionChart, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vAdvinionChart,
			],
		});

		formsContainer.SetItem(eForms.Tutorials, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vToolBar,
				eViewTypes.vTutorials,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
			],
		});

		formsContainer.SetItem(eForms.EducationalTutorials, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vToolBar,
				eViewTypes.vEducationalTutorials,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
			],
		});

		formsContainer.SetItem(eForms.EconomicCalendar, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vToolBar,
				eViewTypes.vEconomicCalendar,
				eViewTypes.vSummeryView,
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
			],
		});

		formsContainer.SetItem(eForms.AccountCardRecords, {
			mappedViews: [eViewTypes.vAccountCardRecords],
		});

		formsContainer.SetItem(eForms.RolledOver, {
			mappedViews: [eViewTypes.vRolledOver],
		});

		formsContainer.SetItem(eForms.ContractRollover, {
			mappedViews: [eViewTypes.vContractRollover],
		});

		formsContainer.SetItem(eForms.NotificationsSettings, {
			mappedViews: [eViewTypes.vMenu, eViewTypes.vToolBar, eViewTypes.vNotificationsSettings],
		});

		formsContainer.SetItem(eForms.ConcretePaymentForm, {
			mappedViews: [eViewTypes.vMenu, eViewTypes.vPageTitle, eViewTypes.vConcretePaymentForm],
		});

		formsContainer.SetItem(eForms.DepositConfirmation, {
			mappedViews: [eViewTypes.vDepositConfirmation],
		});

		formsContainer.SetItem(eForms.DocumentVerificationModal, {
			mappedViews: [eViewTypes.vDocumentVerificationModal],
		});

		formsContainer.SetItem(eForms.Settings, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vPersonalDetails,
				eViewTypes.vChangePassword,
				eViewTypes.vNotificationsSettings,
				eViewTypes.vAccountPreferences
			],
		});

		formsContainer.SetItem(eForms.PriceAlerts, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vPriceAlerts,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vToolBar,
			],
		});

		formsContainer.SetItem(eForms.PendingWithdrawal, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vPendingWithdrawal,
				eViewTypes.vSummeryView,
				eViewTypes.vAccountSummaryWallet,
				eViewTypes.vQuotes,
				eViewTypes.vQuotesPreset,
				eViewTypes.vToolBar,
			],
		});

		formsContainer.SetItem(eForms.WithdrawalThankYou, {
			mappedViews: [
				eViewTypes.vMenu,
				eViewTypes.vPageTitle,
				eViewTypes.vWithdrawalThankYou
			],
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
		MainForm: eForms.Deals,
		UiVersion: getUiVersion,
	};
});
