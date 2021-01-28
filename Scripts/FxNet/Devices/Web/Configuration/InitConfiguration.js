/* global UrlResolver */
var InitConfiguration = function () {
	var applicationConfiguration = {
		applicationType: window.eApplicationTypes.Web,
		doubleTabListenInterval: 500,
	};

	var newDealConfiguration = {
		onSuccessRedirectTo: false,
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.NoTabs,
			parentView: eViewTypes.vNewDealSlip,
		},
		dealAmountPrefixKey: "dealAmountLabel_",
		profileKeyForDefaultTab: "defaultTab",
		currentRateDirectionSwitch: false,
		chart: {
			direction: eChartDirection.Same,
			allowDragLine: true,
			keys: {
				stopLoss: "chartline_StopLoss",
				takeProfit: "chartline_TakeProfit",
				currentRate: "chartline_CurrentRate",
			},
		},
	};

	var defaultChartConfiguration = {
		direction: eChartDirection.Same,
		allowDragLine: true,
		keys: {
			stopLoss: "chartline_IfDoneStopLoss",
			takeProfit: "chartline_IfDoneTakeProfit",
			currentRate: "chartline_CurrentRate",
			limitLevel: "chartline_LimitLevel",
		},
	};

	var newLimitConfiguration = {
		onSuccessRedirectTo: false,
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.NoTabs,
			parentView: eViewTypes.vNewLimit,
		},
		dealAmountPrefixKey: "dealAmountLabel_",
		profileKeyForDefaultTab: "defaultTab",
		chart: defaultChartConfiguration,
	};

	var priceAlertConfiguration = {
		onSuccessRedirectTo: false,
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.NoTabs,
		},
		profileKeyForDefaultTab: "defaultTab",
		chart: {
			parentType: eChartParentType.NewPriceAlert,
			direction: eChartDirection.Same,
			allowDragLine: true,
			keys: {
				currentRate: "chartline_CurrentRate",
				priceAlertRate: "chartline_PriceAlertRate",
			},
		},
	};

	var editClosingLimitConfiguration = {
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.Rate,
		},
		profileKeyForDefaultTab: "editClosingLimitTab",
		showValidationTooltips: true,
		currentRateDirectionSwitch: true,
		chart: {
			direction: eChartDirection.Opposite,
			allowDragLine: true,
			keys: {
				stopLoss: "chartline_StopLoss",
				takeProfit: "chartline_TakeProfit",
				currentRate: "chartline_ClosingRate",
				openRate: "chartline_OpenRate",
			},
		},
	};

	var editLimitSettingsConfiguration = {
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.NoTabs,
		},
		profileKeyForDefaultTab: "editLimitTab",
		showValidationTooltips: true,
		showExpirationCalendar: true,
	};

	var closeDealSettingsConfiguration = {
		profileKeyForDefaultTab: "closeDealTab",
		currentRateDirectionSwitch: true,
		chart: {
			direction: eChartDirection.Opposite,
			allowDragLine: false,
			keys: {
				stopLoss: "chartline_StopLoss",
				takeProfit: "chartline_TakeProfit",
				currentRate: "chartline_ClosingRate",
				openRate: "chartline_OpenRate",
			},
		},
	};

	var extendedCloseDealSettingsConfiguration = {
		profileKeyForDefaultTab: "closeDealTab",
		currentRateDirectionSwitch: true,
		chart: {
			direction: eChartDirection.Opposite,
			allowDragLine: false,
			keys: {
				stopLoss: "chartline_StopLoss",
				takeProfit: "chartline_TakeProfit",
				currentRate: "chartline_ClosingRate",
				openRate: "chartline_OpenRate",
			},
		},
		rangeForPLCalculation: {
			far: function () {
				return 0;
			},
			near: function () {
				return 20000;
			},
		},
	};

	var activeLimitsConfiguration = {
		defaultLimitMode: eLimitMode.OpenDeal,
	};

	var limitsConfiguration = {
		defaultLimitType: eLimitsType.Active,
	};

	var openDealsConfiguration = {
		closeSelected: true,
		itemsPerRender: 50,
	};

	var withdrawalConfiguration = {
		withdrawalRequestSuccessRedirectToView: eForms.ViewAndPrintWithdrawal,
		stepLoadFailRedirectView: eForms.Deals,
		wizardConfig: {
			defaultForm: eForms.Withdrawal,
			defaultStep: eWithdrawalSteps.setAmount,
			useBrowserHistory: true,
			steps: {
				1: {
					component: "fx-component-withdrawal-amount",
					previousStep: {
						label: "lblBack",
						valid: true,
						visible: false,
					},
					nextStep: {
						label: "lblContinue",
						valid: false,
						visible: false,
					},
				},
				2: {
					component: "fx-component-withdrawal-method",
					previousStep: {
						label: "lblBack",
						valid: true,
						visible: true,
					},
					nextStep: {
						label: "lblContinue",
						valid: false,
						visible: true,
					},
				},
				3: {
					component: "fx-component-withdrawal-setbankdetails",
					previousStep: {
						label: "lblBack",
						valid: true,
						visible: true,
					},
					nextStep: {
						label: "lblContinue",
						valid: false,
						visible: true,
					},
				},
				4: {
					component: "fx-component-withdrawal-setccdetails",
					previousStep: {
						label: "lblBack",
						valid: true,
						visible: true,
					},
					nextStep: {
						label: "lblContinue",
						valid: false,
						visible: true,
					},
				},
				5: {
					component: "fx-component-withdrawal-setapproval",
					previousStep: {
						label: "lblBack",
						valid: true,
						visible: true,
					},
					nextStep: {
						label: "lblApprove",
						valid: false,
						visible: true,
					},
				},
			},
		},
	};

	var quotesGridConfiguration = {
		minRowsToDisplay: 9,
	};

	var favoriteInstrumentsConfiguration = {
		favoriteInstrumentsLimit: 50,
	};

	var quotesPresetConfiguration = {
		areQuotesVisible: true,
	};

	var pendingWithdrawalConfiguration = {};

	var walletConfiguration = {
		formatConditionalVolume: false,
		useAdvancedView: true,
	};

	var balanceConfiguration = {
		pageSize: 250,
	};

	var closedDealsConfiguration = {
		pageSize: 2000,
		threshold: 2000,
		scrollMaxVisible: 10,
	};

	var csvConfiguration = {
		pageSize: 1000,
	};

	var printConfiguration = {
		pageSize: 1000,
	};

	var economicCalendarConfiguration = {
		hubname: "econoCalendarHub",
		eventsMaxImportance: 3,
		contentKeySection: "ec",
		invertedDirectionEvents: [
			2471280,
			195,
			2,
			4241147,
			55,
			73,
			181,
			185,
			192,
			1371097,
			1561129,
			1591134,
			1891180,
			2121218,
			2461277,
			2471280,
			2831382,
			3631549,
			3641551,
			3641552,
			4221618,
			4221619,
			4231627,
			4241147,
			4241150,
			2611297,
			2611423,
			121,
		],
	};

	var marketInfoConfiguration = {
		hubname: "sentimentsHub",
	};

	var gtmConfiguration = {
		gtmContentKey: "googleTagManagerId",
		disabledGTMToken: "#",
	};

	var signalsConfiguration = {
		pageSize: 10,
	};

	var tradingSignalsConfig = {
		durationFilterBySignalType: {
			technicalAnalisys: { detailed: -14, nondetailed: -8 },
			generic: { detailed: -8, nondetailed: -4 },
		},
		rowsPerGridPage: {
			technicalAnalisys: 10,
			alerts: 5,
			candleStick: 5,
		},
		rowGridHeight: 28.5, //this figure should be in synk with the css - less grid row hight
		defaultPage: 1,
	};

	var contractRolloverConfiguration = {
		defaultPage: 1,
		pageSize: 1000,
		scrollMaxVisible: 8,
	};

	var advinionChartConfiguration = {
		rootPath: UrlResolver.getStaticJSPath("Scripts/AdvinionChart"),
		cssLoaderPath: UrlResolver.getAssetsPath() + "/Skins/Web/Broker" + UrlResolver.getDefaultBroker() + "/Default/",
	};

	var accountCardRecordsConfiguration = {
		pageSize: 10,
	};

	var dealTabsConfiguration = {
		view: eViewTypes.vDealsTabs,
		tabs: [
			{
				type: eViewTypes.vOpenDeals,
				headerComponent: "fx-component-open-deals-grid-tab-header",
				bodyComponent: "fx-component-open-deals-grid",
				tabTitle: "openDeals_tabTitle",
			},
			{
				type: eViewTypes.vLimits,
				headerComponent: "fx-component-limits-grid-tab-header",
				bodyComponent: "fx-component-limits-grid",
				tabTitle: "openingLimits_tabTitle",
			},
			{
				type: eViewTypes.vClosedDeals,
				headerComponent: "fx-component-closed-deals-grid-tab-header",
				bodyComponent: "fx-component-closed-deals-grid",
				tabTitle: "closedDeals_tabTitle",
			},
		],
	};

	var uploadDocumentsConfiguration = {
		interWindowsCommunicationLimit: 30000,
		uploadFrameReloadTimeout: 10000,
		uploadFrameRetryCount: 3,
	};

	var amlConfiguration = {
		countriesWithDisabledUpload: ["Hungary"],
		countriesWithVideoId: ["Hungary"],
		countriesWithDisabledAlternativeSend: ["Hungary"],
	};

	var thankYouConfiguration = {
		brokersThatShouldShowAmlNotice: ["3"],
	};

	var depositConfirmationConfiguration = {
		excludeList: {
			idList: ["ClearAction", "SendActionContainer", "DisableOverlay"],
			tagList: {
				IFRAME: null,
				LINK: {
					rel: ["dns-prefetch", "preconnect", "prefetch", "manifest"],
				},
			},
		},
	};

	var autoCompleteConfiguration = {
		IEFirstSearchTimeOut: 3500,
	};

	var personalGuideConfiguration = {
		DoNotShowForms: [
			eForms.Deposit,
			eForms.ConcretePaymentForm,
			eForms.DepositConfirmation,
			eForms.DepositPending,
			eForms.DepositSuccess,
		],
		PersonalAssistants: {
			Max: {
				name: "Max",
				version: "6",
				variation: 2
			},
			Lexi: {
				name: "Lexi",
				version: "2",
				variation: 2
			},
			MaxSA: {
				name: "MaxSA",
				version: "1",
				variation: 3
			},
			LexiTestVariation4: {
				name: "Lexi",
				version: "2",
				variation: 2
			},
			MaxTestVariation4: {
				name: "Max",
				version: "6",
				variation: 2
			}
		},
	};

	var dynamicTitleConfiguration = {
		dynamicTitleKey: "dynamicSlipTitle",
	};

	return {
		ApplicationConfiguration: applicationConfiguration,

		NewDealConfiguration: newDealConfiguration,
		EditClosingLimitConfiguration: editClosingLimitConfiguration,
		CloseDealSettingsConfiguration: closeDealSettingsConfiguration,
		ExtendedCloseDealSettingsConfiguration: extendedCloseDealSettingsConfiguration,
		NewLimitConfiguration: newLimitConfiguration,
		PriceAlertConfiguration: priceAlertConfiguration,
		EditLimitSettingsConfiguration: editLimitSettingsConfiguration,

		ActiveLimitsConfiguration: activeLimitsConfiguration,
		LimitsConfiguration: limitsConfiguration,
		OpenDealsConfiguration: openDealsConfiguration,
		WithdrawalConfiguration: withdrawalConfiguration,
		PendingWithdrawalConfiguration: pendingWithdrawalConfiguration,

		QuotesPresetConfiguration: quotesPresetConfiguration,
		WalletConfiguration: walletConfiguration,
		BalanceConfiguration: balanceConfiguration,
		ClosedDealsConfiguration: closedDealsConfiguration,
		PrintConfiguration: printConfiguration,
		CsvConfiguration: csvConfiguration,
		FavoriteInstrumentsConfiguration: favoriteInstrumentsConfiguration,

		QuotesGridConfiguration: quotesGridConfiguration,
		EconomicCalendarConfiguration: economicCalendarConfiguration,
		SignalsConfiguration: signalsConfiguration,
		MarketInfoConfiguration: marketInfoConfiguration,
		GTMConfiguration: gtmConfiguration,
		TradingSignalsConfig: tradingSignalsConfig,
		ContractRolloverConfiguration: contractRolloverConfiguration,

		AdvinionChartConfiguration: advinionChartConfiguration,
		AccountCardRecordsConfiguration: accountCardRecordsConfiguration,

		DefaultChartConfiguration: defaultChartConfiguration,
		DealTabsConfiguration: dealTabsConfiguration,

		UploadDocumentsConfiguration: uploadDocumentsConfiguration,
		AmlConfiguration: amlConfiguration,
		ThankYouConfiguration: thankYouConfiguration,
		MarketInfoSectionsConfiguration: {},
		DepositConfirmationConfiguration: depositConfirmationConfiguration,

		AutoCompleteConfiguration: autoCompleteConfiguration,

		PersonalGuideConfiguration: personalGuideConfiguration,
		DynamicTitleConfiguration: dynamicTitleConfiguration,
	};
};

define("configuration/initconfiguration", ["enums/enums", "customEnums/ViewsEnums", "global/UrlResolver"], function () {
	return InitConfiguration();
});
