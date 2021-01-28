require.config({
	shim: {
		ProChart_Loader: {
			exports: "ProChart_Loader",
		},
		"handlers/Logger": {
			deps: ["dataaccess/dalCommon"],
			exports: "Logger",
			init: function (dc) {
				return this.Logger(dc);
			},
		},
		"handlers/Ajaxer": {
			deps: ["Q", "handlers/AjaxError", "global/UrlResolver"],
			exports: "TAjaxer",
			init: function (q) {
				Q = q;
				return this.TAjaxer;
			},
		},
		"handlers/SyncRequestHelper": {
			exports: "SyncRequestHelper",
			deps: ["global/UrlResolver"],
			init: function (q) {
				Q = q;
				return this.SyncRequestHelper;
			},
		},
		jquery: {
			deps: ["vendor/jquery-3.5.1"],
			exports: "jquery",
		},
		jqueryMigrate: {
			deps: ["vendor/jquery-migrate-3.3.1"],
			exports: "jquery",
		},
		"vendor/jquery.history": {
			deps: ["jquery"],
			exports: "History",
		},
		"vendor/jquery-ui": {
			deps: ["jquery"],
			exports: "jquery",
		},
		"vendor/knockout.validation": {
			deps: ["knockout", "JSONHelper"],
			exports: "ko",
		},
		"vendor/knockout-postbox": {
			deps: ["knockout"],
			exports: "ko",
		},
		"vendor/jquery.validate": {
			deps: ["jquery"],
			exports: "jquery",
		},
		"vendor/jquery.validate.unobtrusive": {
			deps: ["jquery", "vendor/jquery.validate"],
			exports: "jquery",
		},
		"vendor/jquery.numeric": {
			deps: ["jquery"],
			exports: "jquery",
		},
		"helpers/ObservableHashTable": {
			deps: ["knockout", "helpers/KOExtensions"],
			exports: "ObservableHashTable",
			init: function () {
				return this.ObservableHashTable;
			},
		},
		"helpers/observabledataset": {
			deps: ["knockout", "JSONHelper", "helpers/ObservableHashTable"],
			exports: "ObservableDataSet",
			init: function () {
				return this.ObservableDataSet;
			},
		},

		"dataaccess/dalAccountingActions": {
			deps: ["generalmanagers/ErrorManager", "handlers/general", "handlers/Ajaxer"],
			exports: "TDALAccountingActions",
			init: function (em, general) {
				return this.TDALAccountingActions(em, general);
			},
		},
		"dataaccess/dalWithdrawal": {
			deps: ["generalmanagers/ErrorManager", "handlers/general"],
			exports: "TDALWithdrawal",
			init: function (em, general) {
				return this.TDALWithdrawal(em, general);
			},
		},
		"dataaccess/dalNotificationData": {
			deps: ["generalmanagers/ErrorManager"],
			exports: "TDALNotificationData",
			init: function (em) {
				return this.TDALNotificationData(em);
			},
		},
		"dataaccess/dalInitialData": {
			deps: ["generalmanagers/ErrorManager"],
			exports: "TDALInitialData",
			init: function (em) {
				return this.TDALInitialData(em);
			},
		},
		"dataaccess/dalActivityLog": {
			deps: ["generalmanagers/ErrorManager", "handlers/general"],
			exports: "dalActivityLog",
			init: function (em, general) {
				return this.dalActivityLog(em, general);
			},
		},
		"dataaccess/dalTransactionsReport": {
			deps: ["generalmanagers/ErrorManager", "handlers/general"],
			exports: "dalTransactionsReport",
			init: function (em, general) {
				return this.dalTransactionsReport(em, general);
			},
		},
		"dataaccess/dalTutorials": {
			deps: ["generalmanagers/ErrorManager", "handlers/general"],
			exports: "TDALTutorials",
			init: function (em, general) {
				return this.TDALTutorials(em, general);
			},
		},
		"dataaccess/dalTradingSignals": {
			deps: ["generalmanagers/ErrorManager", "handlers/general"],
			exports: "TDALTradingSignals",
			init: function (em, general) {
				return this.TDALTradingSignals(em, general);
			},
		},
		"dataaccess/dalClosedDeals": {
			deps: ["generalmanagers/ErrorManager", "handlers/general"],
			exports: "TDALClosedDeals",
			init: function (em, general) {
				return this.TDALClosedDeals(em, general);
			},
		},
		"dataaccess/dalRetention": {
			deps: ["generalmanagers/ErrorManager"],
			exports: "TDALRetention",
			init: function (em) {
				return this.TDALRetention(em);
			},
		},
		CreditCardManager: {
			deps: [
				"knockout",
				"handlers/HashTable",
				"helpers/ObservableHashTable",
				"CreditCard",
				"FxNet/LogicLayer/Deposit/CreditCard/CreditCardView",
			],
			exports: "TCreditCardManager",
			init: function (ko, obs, ht) {
				return this.TCreditCardManager(ko, obs, ht);
			},
		},
		"FxNet/LogicLayer/Deposit/CreditCard/CreditCardView": {
			exports: "TCreditCardView",
		},
		"tracking/EventsCollector": {
			deps: ["knockout", "trackingIntExt/TrackingEvents"],
			exports: "TrackingEventsCollector",
			init: function (ko, te) {
				var trackingEventsCollector = this.TrackingEventsCollector(ko, te, false);
				return trackingEventsCollector;
			},
		},
		"trackingIntExt/TradingEventsHandler": {
			deps: [
				"knockout",
				"trackingIntExt/TrackingData",
				"devicemanagers/ViewModelsManager",
				"handlers/general",
				"tracking/EventsCollector",
			],
			exports: "TradingEventsHandler",
			init: function (ko, td, vm, ge, ec) {
				return this.TradingEventsHandler(ko, td, vm, ge, ec);
			},
		},
		"viewmodels/QuotesViewModel": {
			deps: [
				"knockout",
				"viewmodels/ViewModelBase",
				"handlers/general",
				"global/debounce",
				"Dictionary",
				"cachemanagers/QuotesManager",
				"modules/FavoriteInstrumentsManager",
				"managers/instrumentTranslationsManager",
				"modules/permissionsmodule",
				"handlers/Delegate",
				"devicemanagers/AlertsManager",
        "cachemanagers/PortfolioStaticManager",
				"vendor/knockout-sortable",
				"enums/enums",
			],
			exports: "QuotesViewModel",
			init: function (ko, vmb, gen, deb, dct, qtm, fim, itm, pm, deg, am, pfm) {
				return this.QuotesViewModel(ko, vmb, gen, deb, dct, qtm, fim, itm, pm, deg, am, pfm);
			},
		},
		"handlers/Cookie": {
			deps: [],
			exports: "CookieHandler",
		},
		"handlers/general": {
			deps: [],
			exports: "General",
			init: function () {
				return this.General;
			},
		},
		"deposit/DepositCurrency": {
			deps: [],
			exports: "TDepositCurrency",
			init: function () {
				return this.TDepositCurrency;
			},
		},
		"handlers/AmountConverter": {
			deps: [],
			exports: "AmountConverter",
			init: function () {
				return this.AmountConverter;
			},
		},
		"dataaccess/dalcustomer": {
			deps: ["handlers/Ajaxer", "JSONHelper", "handlers/general"],
			exports: "TDALCustomer",
			init: function (Ajaxer, jsonhelper, general) {
				return this.TDALCustomer(jsonhelper, general);
			},
		},

		"dataaccess/dalMarketState": {
			deps: ["handlers/Ajaxer", "JSONHelper", "handlers/general"],
			exports: "TDALMarketState",
			init: function (Ajaxer, jsonhelper, general) {
				return this.TDALMarketState(jsonhelper, general);
			},
		},
		"dataaccess/dalDemoAccount": {
			deps: ["handlers/Ajaxer", "JSONHelper"],
			exports: "TDALDemoAccount",
			init: function (Ajaxer, jsonhelper) {
				return this.TDALDemoAccount(jsonhelper);
			},
		},
		"dataaccess/dalInstruments": {
			deps: ["handlers/Ajaxer", "JSONHelper", "handlers/general", "handlers/Logger"],
			exports: "TDALInstruments",
			init: function (ajaxer, jsonHelper, general, logger) {
				var ajx = new ajaxer();
				return this.TDALInstruments(ajx, jsonHelper, general, logger);
			},
		},
		"viewmodels/HeaderViewModel": {
			deps: ["knockout", "modules/permissionsmodule"],
			exports: "HeaderViewModel",
			init: function (ko, pm) {
				return this.HeaderViewModel(pm);
			},
		},
		"viewmodels/ViewAndPrintWithdrawalViewModel": {
			deps: ["knockout", "viewmodels/ViewModelBase", "handlers/general"],
			exports: "ViewAndPrintWithdrawalViewModel",
			init: function (ko, vmb, gen) {
				return this.ViewAndPrintWithdrawalViewModel(ko, vmb, gen);
			},
		},

		"viewmodels/AccountMarketViewModel": {
			deps: ["knockout"],
			exports: "AccountMarketViewModel",
			init: function (ko) {
				return this.AccountMarketViewModel(ko);
			},
		},
		"viewmodels/ActivityLogViewModel": {
			deps: [
				"helpers/ObservableCustomExtender",
				"handlers/general",
				"dataaccess/dalActivityLog",
				"modules/systeminfo",
				"helpers/KOExtensions",
			],
			exports: "ActivityLogViewModel",
			init: function (ko, general, dag, si) {
				return this.ActivityLogViewModel(ko, general, dag, si);
			},
		},
		"viewmodels/TradingSignalsTutorialsViewModel": {
			deps: ["knockout", "viewmodels/ViewModelBase", "handlers/general"],
			exports: "TradingSignalsTutorialsViewModel",
			init: function (ko, vmb, gen) {
				return this.TradingSignalsTutorialsViewModel(ko, vmb, gen);
			},
		},
		"viewmodels/SmartBannerViewModel": {
			deps: [
				"knockout",
				"handlers/general",
				"handlers/HashTable",
				"helpers/ObservableHashTable",
				"customEnums/ViewsEnums",
			],
			exports: "SmartBannerViewModel",
			init: function (ko, general, ht, oht) {
				return this.SmartBannerViewModel(ko, general, oht);
			},
		},
		"viewmodels/CountDownModel": {
			deps: ["knockout"],
			exports: "CountDownModel",
			init: function (ko) {
				return this.CountDownModel(ko);
			},
		},
		"managers/PopupInNewWindowManager": {
			exports: "PopupInNewWindowManager",
		},
		"global/apiIM": {
			deps: ["jquery"],
			exports: "apiIM",
			init: function (jquery) {
				return this.apiIM(jquery);
			},
		},
		"vendor/jcf.selectModule": {
			deps: ["vendor/jcf"],
			exports: "jcf.modules.Select",
			init: function (jcf) {
				return this.jcfselect(jcf);
			},
		},
		"calculators/LimitValuesCalculator": {
			deps: ["handlers/AmountConverter"],
			exports: "LimitValuesCalculator",
			init: function () {
				return this.LimitValuesCalculator;
			},
		},
		"calculators/LimitRangeCalculator": {
			deps: ["enums/enums"],
			exports: "LimitRangesCalculator",
			init: function () {
				return this.LimitRangesCalculator;
			},
		},
		"enums/alertenums": {
			exports: "AlertTypes",
		},
		"enums/enums": {
			exports: "eDepositingActionType",
		},
		"global/swipe": {
			exports: "swipe",
		},
		"vendor/globalize": {
			exports: "Globalize",
		},
		"fx-core-api/StoreAPI": {
			deps: [
				"fx-core-api/core.runtime",
				"fx-core-api/vendors~Components~KoBindings~StoreAPI",
				"fx-core-api/vendors~Components~StoreAPI",
				"fx-core-api/vendors~StoreAPI",
				"fx-core-api/vendors~Components~KoBindings",
				"fx-core-api/vendors~Components",
			],
			exports: "Core.StoreAPI",
		},
		"fx-core-api/Components": {
			deps: [
				"fx-core-api/core.runtime",
				"fx-core-api/vendors~Components~KoBindings~StoreAPI",
				"fx-core-api/vendors~Components~KoBindings",
				"fx-core-api/vendors~Components~StoreAPI",
				"fx-core-api/vendors~Components",
			],
			exports: "Core.Components",
		},
		"fx-core-api/KoBindings": {
			deps: [
				"fx-core-api/core.runtime",
				"fx-core-api/vendors~Components~KoBindings~StoreAPI",
				"fx-core-api/vendors~Components~KoBindings",
			],
			exports: "Core.KoBindings",
		},
		"Global/RevealPassword": {
			deps: [],
			exports: "RevealPassword",
		},
		"devicehelpers/adjustUiPerDevice": {
			deps: [],
			exports: "adjustUiPerDevice",
		},
		"Registration/Common/CustomerValidators": {
			deps: ["vendor/jquery.validate", "vendor/jquery.validate.unobtrusive"],
			exports: "CustomerValidators",
		},
		"handlers/limit": {
			deps: [],
			exports: "TLimit",
		},
	},
	//name: "fxnet/devices/mobile/configuration/startRequire",
	//out: "../../assets/20200413222717/js/main-built.mobile.js",
	deps: [
		"vendor/knockout-postbox",
		"vendor/jquery.validate",
		"vendor/jquery.validate.unobtrusive",
		"vendor/jquery.numeric",
		"vendor/jquery-migrate-3.3.1",
		"helpers/ObservableCustomExtender",
		"extensions/Object",
		"extensions/Array",
		"extensions/Date",
		"extensions/String",
		"extensions/Number",
		"handlers/format",
		"handlers/general",
		"tracking/EventRaiser",
		"tracking/EventsCollector",
		"tracking/PerformanceDataCollector",
		"tracking/TrackingCommonData",
		// Browser should be refactored into r.js - very few dependencies
		"global/browser",
		"global/apiIM",
		"vendor/latinize",
		"enums/DataMembersPositions",
		"fxnet/common/constants/consts/Const",
	],
});
