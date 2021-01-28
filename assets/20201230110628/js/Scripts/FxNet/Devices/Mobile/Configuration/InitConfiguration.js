/* global UrlResolver */
var InitConfiguration = function () {
	var applicationConfiguration = {
		applicationType: window.eApplicationTypes.Mobile,
		doubleTabListenInterval: 500,
	};

	var newDealConfiguration = {
		showTools: true,
		onSuccessRedirectTo: eForms.OpenDeals,
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.NoTabs,
			parentView: eViewTypes.vNewDeal,
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

	var newLimitConfiguration = {
		showTools: true,
		onSuccessRedirectTo: eForms.Limits,
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.NoTabs,
			parentView: eViewTypes.vNewLimit,
		},
		dealAmountPrefixKey: "dealAmountLabel_",
		profileKeyForDefaultTab: "defaultTab",
		currentRateDirectionSwitch: false,
		chart: {
			direction: eChartDirection.Same,
			allowDragLine: true,
			keys: {
				stopLoss: "chartline_IfDoneStopLoss",
				takeProfit: "chartline_IfDoneTakeProfit",
				currentRate: "chartline_CurrentRate",
				limitLevel: "chartline_LimitLevel",
			},
		},
	};

	var editLimitSettingsConfiguration = {
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.NoTabs,
		},
		profileKeyForDefaultTab: "editLimitTab",
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

	var editClosingLimitConfiguration = {
		setlimitsConfiguration: {
			defaultTab: eSetLimitsTabs.Rate,
		},
		profileKeyForDefaultTab: "editClosingLimitTab",
		redirectToOpenDeals: true,
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

	var activeLimitsConfiguration = {
		defaultLimitMode: eLimitMode.OpenDeal,
	};

	var limitsConfiguration = {
		defaultLimitType: eLimitsType.Active,
	};

	var openDealsConfiguration = {
		closeSelected: true,
	};

	var marketInfoConfiguration = {
		hubname: "sentimentsHub",
	};

	var withdrawalConfiguration = {
		withdrawalRequestSuccessRedirectToView: eForms.Wallet,
		stepLoadFailRedirectView: eForms.Quotes,
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

	var favoriteInstrumentsConfiguration = {
		favoriteInstrumentsLimit: 50,
	};

	var quotesPresetConfiguration = {
		areQuotesVisible: true,
	};

	var pendingWithdrawalConfiguration = {};

	var walletConfiguration = {
		formatConditionalVolume: true,
		useAdvancedView: false,
		isVisibleUsedMargin: true,
		supressDialogs: true,
	};

	var balanceConfiguration = {
		pageSize: 20,
	};

	var closedDealsConfiguration = {
		pageSize: 20,
		threshold: 2000,
	};

	var accountCardRecordsConfiguration = {
		pageSize: 20,
	};

	var gtmConfiguration = {
		gtmContentKey: "googleTagManagerId",
		disabledGTMToken: "#",
	};

	var economicCalendarConfiguration = {
		hubname: "econoCalendarHub",
		eventsMaxImportance: 3,
		contentKeySection: "ec",
		contentKeyFilterPrefix: "lbl",
		mobilePageSize: 10,
		defaultDateTab: eDateFilter.ThisWeek,
		instrumentsToTrade: {
			au: [2817, 303, 279, 3585],
			ca: [12035, 3587, 791, 4099],
			ch: [4868, 12036, 1047, 3588],
			cn: [4912, 12037, 11013, 10757, 12050],
			de: [26894, 3631, 3607, 3600],
			eu: [28174, 26894, 3631, 3607, 3600, 27406, 27662],
			fr: [27406, 3631, 3607, 3600],
			it: [27662, 3631, 3607, 3600],
			jp: [34839, 12055, 3607, 4119, 279],
			nz: [7727, 7703, 3614, 286, 4126],
			uk: [27152, 4143, 4119, 3600],
			us: [21807, 25391, 25135, 3631, 12055, 4143, 12035, 7215],
		},
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

	var signalsConfiguration = {
		pageSize: 10,
	};

	var advinionChartConfiguration = {
		rootPath: UrlResolver.getStaticJSPath("Scripts/AdvinionChart"),
		cssLoaderPath:
			UrlResolver.getAssetsPath() + "/Skins/Mobile/Broker" + UrlResolver.getDefaultBroker() + "/Default/",
	};

	var contractRolloverConfiguration = {
		defaultPage: 1,
		pageSize: 100,
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

	var marketInfoSectionsConfiguration = {
		tsArea: true,
		miArea: false,
		hlArea: false,
		iiArea: false,
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
				variation: 4
			},
			MaxTestVariation4: {
				name: "Max",
				version: "6",
				variation: 4
			}
		},
	};

	return {
		ApplicationConfiguration: applicationConfiguration,
		NewDealConfiguration: newDealConfiguration,
		NewLimitConfiguration: newLimitConfiguration,
		EditLimitSettingsConfiguration: editLimitSettingsConfiguration,
		CloseDealSettingsConfiguration: closeDealSettingsConfiguration,
		EditClosingLimitConfiguration: editClosingLimitConfiguration,

		ActiveLimitsConfiguration: activeLimitsConfiguration,
		LimitsConfiguration: limitsConfiguration,
		OpenDealsConfiguration: openDealsConfiguration,
		MarketInfoConfiguration: marketInfoConfiguration,
		WithdrawalConfiguration: withdrawalConfiguration,
		PendingWithdrawalConfiguration: pendingWithdrawalConfiguration,
		FavoriteInstrumentsConfiguration: favoriteInstrumentsConfiguration,
		QuotesPresetConfiguration: quotesPresetConfiguration,
		WalletConfiguration: walletConfiguration,
		BalanceConfiguration: balanceConfiguration,
		ClosedDealsConfiguration: closedDealsConfiguration,
		AccountCardRecordsConfiguration: accountCardRecordsConfiguration,

		GTMConfiguration: gtmConfiguration,
		EconomicCalendarConfiguration: economicCalendarConfiguration,
		SignalsConfiguration: signalsConfiguration,
		ContractRolloverConfiguration: contractRolloverConfiguration,

		AdvinionChartConfiguration: advinionChartConfiguration,
		UploadDocumentsConfiguration: uploadDocumentsConfiguration,
		AmlConfiguration: amlConfiguration,
		ThankYouConfiguration: thankYouConfiguration,
		MarketInfoSectionsConfiguration: marketInfoSectionsConfiguration,
		DepositConfirmationConfiguration: depositConfirmationConfiguration,

		AutoCompleteConfiguration: autoCompleteConfiguration,

		PersonalGuideConfiguration: personalGuideConfiguration,
	};
};

define("configuration/initconfiguration", ["enums/enums", "customEnums/ViewsEnums", "global/UrlResolver"], function () {
	return InitConfiguration();
});
