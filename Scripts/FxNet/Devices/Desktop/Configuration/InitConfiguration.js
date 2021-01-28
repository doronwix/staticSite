var InitConfiguration = function () {
	var applicationConfiguration = {
		applicationType: window.eApplicationTypes.Dealer,
		doubleTabListenInterval: 500,
	};

	var withdrawalConfiguration = {
		withdrawalRequestSuccessRedirectToView: eForms.ViewAndPrintWithdrawal,
		overrideCanWithdrawal: true,
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

	var amlConfiguration = {
		countriesWithDisabledUpload: ["Hungary"],
		countriesWithVideoId: ["Hungary"],
		countriesWithDisabledAlternativeSend: ["Hungary"],
	};

	return {
		ApplicationConfiguration: applicationConfiguration,
		WithdrawalConfiguration: withdrawalConfiguration,
		TradingSignalsConfig: tradingSignalsConfig,
		AmlConfiguration: amlConfiguration,
	};
};

define("configuration/initconfiguration", ["enums/enums", "customEnums/ViewsEnums"], function () {
	return InitConfiguration();
});
