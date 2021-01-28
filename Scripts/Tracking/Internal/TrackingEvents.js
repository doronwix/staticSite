define("trackingIntExt/TrackingEvents", [
	"tracking/EventRaiser",
	"tracking/PerformanceDataCollector",
	"handlers/general",
	"initdatamanagers/Customer",
	"modules/ThemeSettings",
	"enums/enums",
	"fxnet/preloader",
], function TrackingEvents(eventRaiser, PerformanceDataCollector, general, customer, ThemeSettings) {
	var Preloader = require("fxnet/preloader");
	var self = {};

	function removeParametersFromReferrerUrl(referrerUrl) {
		return referrerUrl.split("?")[0];
	}

	self.getCurrentEventData = function () {
		return eventRaiser.eventData;
	};

	self["exposeUI"] = function () {
		var eventData = eventRaiser.eventData;
		eventData.event = "exposeUI";
		eventData.start = Date.now();

		try {
			// Preloader
			eventData.htmlFromCdnDuration = Preloader.Timestamps.getHtmlDuration();
			eventData.initialDataDuration = Preloader.Timestamps.getInitialDataDuration();

			// Static resources
			var contentLoadDuration = PerformanceDataCollector.getResourceTiming(
				UrlResolver.getContentPath("contentdata")
			);
			var cssLoadDuration = PerformanceDataCollector.getResourceTiming(".*.css");
			var faviconLoadDuration = PerformanceDataCollector.getResourceTiming("favicon");
			var preloaderDuration = PerformanceDataCollector.getResourceTiming(
				"assets/" + window.version + "/js/scripts/preloader.js"
			);
			var jsBundleLoadDuration =
				PerformanceDataCollector.getResourceTiming("assets/" + window.version + "/js/main.js") +
				PerformanceDataCollector.getResourceTiming("assets/" + window.version + "/js/mobilemain.js");
			var styleCssLoadDuration = PerformanceDataCollector.getResourceTiming(".*style.css");
			var mainHtmlLoadDuration = PerformanceDataCollector.getResourceTiming(".*main.html");

			// aggregate css, contentdata and favicon.ico -> header duration

			eventData.cssLoadDuration = Math.ceil(cssLoadDuration);
			eventData.contentLoadDuration = Math.ceil(contentLoadDuration);
			eventData.bundleLoadDuration = Math.ceil(jsBundleLoadDuration);
			eventData.preloaderDuration = Math.ceil(preloaderDuration);
			eventData.faviconLoadDuration = Math.ceil(faviconLoadDuration);

			eventData.networkDuration = getNetworkDuration();
			eventData.domParseDuration = getDomParseDuration();
			eventData.applicationStartDuration = getApplicationStartDuration();

			eventData.managersInit =
				PerformanceDataCollector.Timestamps[eFxNetEvents.Start] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.Init];

			// is new version
			eventData.loadedNewVersion = PerformanceDataCollector.isNewVersion();

			// avarage duration for 3 sample files: main.js/mobilemain.js bundle , main.html, style.css
			eventData.average3FilesLoadDuration = Math.ceil(
				(styleCssLoadDuration + mainHtmlLoadDuration + jsBundleLoadDuration) / 3
			);

			// BEGIN Parallel
			// ------------------------------------
			// Duration of waiting for initial data
			eventData.waitInitialDataDuration =
				PerformanceDataCollector.Timestamps[eFxNetEvents.InitialDataEnd] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.InitialDataStart];

			// Duration of waiting for apply bindings until html is available
			eventData.waitHtmlDuration =
				PerformanceDataCollector.Timestamps[eFxNetEvents.WaitHtmlEnd] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.WaitHtmlStart];

			// Duration of ko.applyBindings
			eventData.applyBindingsDuration =
				PerformanceDataCollector.Timestamps[eFxNetEvents.ApplyBindingsEnd] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.ApplyBindingsStart];
			// ------------------------------------
			// END Parallel

			// Duration of CacheManager
			eventData.cacheLoadDuration =
				PerformanceDataCollector.Timestamps[eFxNetEvents.CacheLoadEnd] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.CacheLoadStart];

			// Duration of UiLayerManager
			eventData.uiLayerDuration =
				PerformanceDataCollector.Timestamps[eFxNetEvents.UiLayerEnd] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.UiLayerStart];

			// Duration for initializing the applicationm
			// applicationInitDuration = MAX(waitInitialDataDuration, waitHtmlDuration, applyBindingsDuration) + cacheLoadDuration + uiLayerDuration + exposeUIDuration
			eventData.applicationInitDuration =
				PerformanceDataCollector.Timestamps[eFxNetEvents.ExposeUi] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.Init];

			// Duration between ko.applyBindings and splash screen removed
			eventData.exposeUIDuration =
				PerformanceDataCollector.Timestamps[eFxNetEvents.ExposeUi] -
				PerformanceDataCollector.Timestamps[eFxNetEvents.SplashScreenRemoved];

			eventData.loginDuration = getLoginDuration();

			// from expose UI to getting the first quote MAX(0, First Quote time - ExposeUI time)
			eventData.fromExposeUiToFirstQuote = Math.max(
				0,
				PerformanceDataCollector.Timestamps[eFxNetEvents.FirstQuoteEvent] -
					PerformanceDataCollector.Timestamps[eFxNetEvents.ExposeUi]
			);

			// pure wesocket prformace events:

			// Socket connection duration
			eventData.webSocketStartToComplete = Preloader.Timestamps.getSocketConnectionDuration();

			eventData.webSocketCompleteConnectionToFirstQuote = Preloader.Timestamps.getSocketFromCompleteConnectionToFirstQuote();

			eventData.webSocketsFromCompleteConnectionToFirstFrame = Preloader.Timestamps.getSocketFromCompleteConnectionToFirstFrame();
		} catch (e) {
			eventData.duration = 0;
			// Re-throw the exception, it will be caught by ErrorManager
			throw e;
		} finally {
			eventRaiser.raiseEvent();
		}
	};

	function getNetworkDuration() {
		var fetchStartValue = PerformanceDataCollector.fetchStart();
		var responseEndValue = PerformanceDataCollector.responseEnd();

		if (responseEndValue === "" || fetchStartValue === "") {
			return "";
		} else {
			// network transfer duration - we got all the aspx bytes
			return responseEndValue - fetchStartValue;
		}
	}

	function getDomParseDuration() {
		var responseEndValue = PerformanceDataCollector.responseEnd();
		var loadEventEndValue = PerformanceDataCollector.loadEventEnd();

		if (loadEventEndValue === "" || responseEndValue === "") {
			return "";
		} else {
			// domCompleted - bytes recieved (main aspx) , dom parsed including js on main page
			return loadEventEndValue - responseEndValue;
		}
	}

	function getApplicationStartDuration(eventData) {
		var loadEventEndValue = PerformanceDataCollector.loadEventEnd();

		if (loadEventEndValue === "") {
			return "";
		} else {
			// Duration until application is started
			return PerformanceDataCollector.Timestamps[eFxNetEvents.Init] - loadEventEndValue;
		}
	}

	function getLoginDuration() {
		var fetchStartValue = PerformanceDataCollector.fetchStart();
		if (fetchStartValue === "") {
			return "";
		} else {
			// Duration from login
			return PerformanceDataCollector.Timestamps[eFxNetEvents.ExposeUi] - fetchStartValue;
		}
	}

	self["socket-connection-test"] = function () {
		eventRaiser.eventData.event = "socket-connection-test";

		//eventRaiser.eventData.socketFirstFrameDuration = Preloader.Timestamps.getSocketFirstFrameDuration();

		//eventRaiser.eventData.socketFirstQuoteDuration = Preloader.Timestamps.getSocketFirstQuoteDuration();

		// from expose UI to getting the first quote MAX(0, First Quote time - ExposeUI time)
		//eventRaiser.eventData.fromExposeUiToFirstQuote = Math.max(0, Preloader.Timestamps.webSocketFirstQuote - PerformanceDataCollector.Timestamps[eFxNetEvents.ExposeUi]);

		//eventRaiser.eventData.fromWebSocketTosAjaxFirstQuote = Math.max(0, Preloader.Timestamps.webSocketFirstQuote - PerformanceDataCollector.Timestamps[eFxNetEvents.FirstQuoteEvent]);

		eventRaiser.raiseEvent();
	};

	self["deal-slip-view"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-view";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Instrument = options.instrument;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.DisplayMode = options.displayMode;
		eventRaiser.eventData.InstrumentStatus = options.instrumentStatus;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;

		eventRaiser.eventData.SearchResult = options.SearchResult;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-interaction"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-interaction";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Element = options.element;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-submit"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-submit";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Instrument = options.instrument;
		eventRaiser.eventData.DealSize = options.dealSize;
		eventRaiser.eventData.StopLossType = options.stopLossType;
		eventRaiser.eventData.TakeProfitType = options.takeProfitType;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.EnableSLLimit = options.enableSLLimit;
		eventRaiser.eventData.EnableTPLimit = options.enableTPLimit;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;
		eventRaiser.eventData.Chart = options.chart;
		eventRaiser.eventData.Theme = ThemeSettings.GetTheme();

		eventRaiser.eventData.SearchResult = options.SearchResult;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["switch-main-view"] = function (options) {
		eventRaiser.eventData.event = "switch-main-view";

		eventRaiser.raiseEvent();
	};

	self["new-deal-dragged"] = function (options) {
		eventRaiser.eventData.event = "new-deal-dragged";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-switch-instrument"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-switch-instrument";

		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-switch-tab"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-switch-tab";

		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-expand-limit"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-expand-limit";

		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-collapse-limit"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-collapse-limit";

		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-expand-tools"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-expand-tools";

		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;

		eventRaiser.raiseEvent();
	};

	self["deal-slip-collapse-tools"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-collapse-tools";

		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;

		eventRaiser.raiseEvent();
	};

	self["deal-chart-collapse-trade-ticket"] = function () {
		eventRaiser.eventData.event = "deal-chart-collapse-trade-ticket";
		eventRaiser.raiseEvent();
	};

	self["deal-chart-expand-trade-ticket"] = function () {
		eventRaiser.eventData.event = "deal-chart-expand-trade-ticket";
		eventRaiser.raiseEvent();
	};

	self["new-limit-view"] = function (options) {
		eventRaiser.eventData.event = "new-limit-view";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Instrument = options.instrument;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.DisplayMode = options.displayMode;
		eventRaiser.eventData.InstrumentStatus = options.instrumentStatus;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["new-limit-submit"] = function (options) {
		eventRaiser.eventData.event = "new-limit-submit";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["limit-slip-interaction"] = function (options) {
		eventRaiser.eventData.event = "limit-slip-interaction";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Element = options.element;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;

		eventRaiser.eventData.SearchResult = options.SearchResult;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["witdrawal-view"] = function () {
		eventRaiser.eventData.event = "withdrawal-view";
		eventRaiser.raiseEvent();
	};

	self["withdrawal-interaction"] = function () {
		eventRaiser.eventData.event = "withdrawal-interaction";
		eventRaiser.raiseEvent();
	};

	self["withdrawal-submit"] = function () {
		eventRaiser.eventData.event = "withdrawal-submit";
		eventRaiser.raiseEvent();
	};

	self["withdrawal-cancel"] = function () {
		eventRaiser.eventData.event = "withdrawal-cancel";
		eventRaiser.raiseEvent();
	};

	self["withdrawal-print"] = function () {
		eventRaiser.eventData.event = "withdrawal-print";
		eventRaiser.raiseEvent();
	};

	self["deposit-view"] = function () {
		eventRaiser.eventData.event = "deposit-view";
		eventRaiser.raiseEvent();
	};

	self["deposit-interaction"] = function () {
		eventRaiser.eventData.event = "deposit-interaction";
		eventRaiser.raiseEvent();
	};

	self["agreement-view"] = function () {
		eventRaiser.eventData.event = "agreement-view";
		eventRaiser.raiseEvent();
	};

	self["agreement-first-interaction"] = function () {
		eventRaiser.eventData.event = "agreement-first-interaction";
		eventRaiser.raiseEvent();
	};

	self["agreement-submit"] = function () {
		eventRaiser.eventData.event = "agreement-submit";
		eventRaiser.raiseEvent();
	};

	self["agreement-success"] = function () {
		eventRaiser.eventData.event = "agreement-success";
		eventRaiser.raiseEvent();
	};

	self["registration-success"] = function () {
		eventRaiser.eventData.event = "registration-success";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["login-success"] = function (isAutologin) {
		eventRaiser.eventData.event = "login-success";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.eventData.IsAutologin =
			!general.isEmptyType(isAutologin) && JSON.parse(isAutologin) === true ? true : false;
		eventRaiser.raiseEvent();
	};

	self["forgot-password-success"] = function () {
		eventRaiser.eventData.event = "forgot-password-success";
		eventRaiser.raiseEvent();
	};

	self["withdrawal-success"] = function () {
		eventRaiser.eventData.event = "withdrawal-success";
		eventRaiser.raiseEvent();
	};

	self["View"] = function () {
		var currentViewId = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.event = "View";
		eventRaiser.eventData.ViewId = currentViewId;
		eventRaiser.eventData.RefferingView = window.tradingEventsHandler.getRefferingView();
		eventRaiser.eventData.ActionSource = window.tradingEventsHandler.data.actionSource;
		window.tradingEventsHandler.data.actionSource = "Other";
		window.tradingEventsHandler.updateRefferingView(currentViewId);
		eventRaiser.raiseEvent();
	};

	self["instrument-advanced"] = function () {
		eventRaiser.eventData.event = "instrument-advanced";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["instrument-simple"] = function () {
		eventRaiser.eventData.event = "instrument-simple";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["information-maximize"] = function () {
		eventRaiser.eventData.event = "information-maximize";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["information-minimize"] = function () {
		eventRaiser.eventData.event = "information-minimize";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["account-summary-advanced"] = function () {
		eventRaiser.eventData.event = "account-summary-advanced";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["account-summary-simple"] = function () {
		eventRaiser.eventData.event = "account-summary-simple";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["summary-available-margin"] = function () {
		eventRaiser.eventData.event = "account-summary-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Element = "available margin";
		eventRaiser.raiseEvent();
	};

	self["summary-pending-withdrawals"] = function () {
		eventRaiser.eventData.event = "account-summary-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Element = "pending withdrawals";
		eventRaiser.raiseEvent();
	};

	self["summary-used-margin"] = function () {
		eventRaiser.eventData.event = "account-summary-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Element = "used margin";
		eventRaiser.raiseEvent();
	};

	self["summary-margin-utilization"] = function () {
		eventRaiser.eventData.event = "account-summary-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Element = "margin utilization";
		eventRaiser.raiseEvent();
	};

	self["cashback-from-wallet"] = function () {
		eventRaiser.eventData.event = "account-summary-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Element = "cash back";
		eventRaiser.raiseEvent();
	};

	self["cashback-extra-info"] = function () {
		eventRaiser.eventData.event = "cash-back-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Element = "cash back extra-info";
		eventRaiser.raiseEvent();
	};

	self["net-exposure-one-currency"] = function () {
		eventRaiser.eventData.event = "net-exposure-one-currency";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Currency = customer.prop.selectedCcyName();
		eventRaiser.eventData.Element = "pending bonus";
		eventRaiser.raiseEvent();
	};

	self["net-exposure-original-currency"] = function () {
		eventRaiser.eventData.event = "net-exposure-original-currency";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["deal-slip-success"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-success";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.DisplayMode = options.displayMode;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.EnableSLLimit = options.enableSLLimit;
		eventRaiser.eventData.EnableTPLimit = options.enableTPLimit;
		eventRaiser.eventData.Instrument = options.instrument;
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.DealSize = options.dealSize;
		eventRaiser.eventData.StopLossType = options.stopLossType;
		eventRaiser.eventData.TakeProfitType = options.takeProfitType;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["new-limit-success"] = function (options) {
		eventRaiser.eventData.event = "new-limit-success";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Instrument = options.instrument;
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.DealSize = options.dealSize;
		eventRaiser.eventData.AdvancedView = options.advancedView;
		eventRaiser.eventData.ExpirationType = options.expirationType;
		eventRaiser.eventData.StopLossType = options.stopLossType;
		eventRaiser.eventData.TakeProfitType = options.takeProfitType;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["change-currency"] = function () {
		eventRaiser.eventData.event = "change-currency";
		eventRaiser.eventData.Currency = customer.prop.selectedCcyName();
		eventRaiser.raiseEvent();
	};

	self["change-language"] = function () {
		eventRaiser.eventData.event = "change-language";
		eventRaiser.eventData.Language = CookieHandler.ReadCookie("Language");
		eventRaiser.raiseEvent();
	};

	self["sign-out"] = function () {
		eventRaiser.eventData.event = "sign-out";
		eventRaiser.raiseEvent();
	};

	self["cancel-limit"] = function () {
		eventRaiser.eventData.event = "cancel-limit";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["update-limit"] = function () {
		eventRaiser.eventData.event = "update-limit";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["close-deal-selected"] = function () {
		eventRaiser.eventData.event = "close-deal-selected";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Method = "selected";
		eventRaiser.raiseEvent();
	};

	self["close-deal"] = function (options) {
		eventRaiser.eventData.event = "close-deal";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Method = "deal";
		eventRaiser.eventData.Chart = options.chart;
		eventRaiser.raiseEvent();
	};

	self["close-deal-success"] = function () {
		eventRaiser.eventData.event = "close-deal-success";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.Method = "deal";
		eventRaiser.raiseEvent();
	};

	self["switch-tab"] = function (options) {
		eventRaiser.eventData.event = "switch-tab";
		eventRaiser.eventData.CurrentView = options.viewId;
		eventRaiser.eventData.TabName = options.presetName;

		if (options.hasOwnProperty("hierarchy")) {
			eventRaiser.eventData.Hierarchy = options.hierarchy;
		}

		eventRaiser.raiseEvent();
	};

	self["deal-slip-error"] = function (options) {
		eventRaiser.eventData.event = "deal-slip-error";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Referrer = options.referrer;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Limit = options.Limit;
		eventRaiser.eventData.Tools = options.Tools;
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		eventRaiser.eventData.NewDeal = eNewDealValue.Popup;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;

		eventRaiser.raiseEvent();
	};

	self["new-limit-error"] = function (options) {
		eventRaiser.eventData.event = "new-limit-error";

		eventRaiser.eventData.Version = options.version;
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		eventRaiser.eventData.ElapsedTime = options.ElapsedTime;
		eventRaiser.eventData.SlipExpandedInfoAreas = options.SlipExpandedInfoAreas;
		eventRaiser.raiseEvent();
	};

	self["deposit-submit"] = function () {
		eventRaiser.eventData.event = "deposit-submit";
		eventRaiser.eventData.DepositType = window.tradingEventsHandler.data.depositType;
		eventRaiser.raiseEvent();
	};

	self["deposit-success"] = function () {
		eventRaiser.eventData.event = "deposit-success";
		eventRaiser.eventData.DepositType = window.tradingEventsHandler.data.depositType;
		eventRaiser.raiseEvent();
	};

	self["deposit-error"] = function (options) {
		eventRaiser.eventData.event = "deposit-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.DepositType = window.tradingEventsHandler.data.depositType;

		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = encodeURI(options.errorMessage);
		}

		if (options.hasOwnProperty("errorMessageKey")) {
			eventRaiser.eventData.ErrorMessageKey = encodeURI(options.errorMessageKey);
		}

		eventRaiser.raiseEvent();
	};

	self["withdrawal-error"] = function (options) {
		eventRaiser.eventData.event = "withdrawal-error";
		eventRaiser.eventData.Reason = options.reason;
		eventRaiser.raiseEvent();
	};

	self["message-view"] = function (messageDetails) {
		eventRaiser.eventData.event = "message-view";
		eventRaiser.eventData.Text = messageDetails.text;
		eventRaiser.eventData.Type = messageDetails.type;
		eventRaiser.raiseEvent();
	};

	self["sb-view-offer-clicked"] = function (messageDetails) {
		eventRaiser.eventData.event = "sb-view-offer-clicked";
		eventRaiser.eventData.Text = messageDetails.text;
		eventRaiser.eventData.Type = messageDetails.type;
		eventRaiser.raiseEvent();
	};

	self["sb-deposit-clicked"] = function (messageDetails) {
		eventRaiser.eventData.event = "sb-deposit-clicked";
		eventRaiser.eventData.Text = messageDetails.text;
		eventRaiser.raiseEvent();
	};

	self["reward-cta-clicked"] = function (messageDetails) {
		eventRaiser.eventData.event = "reward-cta-clicked";
		eventRaiser.raiseEvent();
	};

	self["instrument-show-more"] = function (options) {
		eventRaiser.eventData.event = "instrument-show-more";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Hierarchy = options.tabHierarchy;
		eventRaiser.raiseEvent();
	};

	self["instrument-show-less"] = function (options) {
		eventRaiser.eventData.event = "instrument-show-less";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;
		eventRaiser.eventData.TabName = options.TabName;
		eventRaiser.eventData.Hierarchy = options.tabHierarchy;
		eventRaiser.raiseEvent();
	};

	self["show-sunday-banner-main"] = function (bannerDetails) {
		eventRaiser.eventData.event = "show-sunday-banner-main";
		eventRaiser.eventData.Element = bannerDetails.Element;
		eventRaiser.raiseEvent();
	};

	self["click-sunday-banner-button-main"] = function (bannerDetails) {
		eventRaiser.eventData.event = "click-sunday-banner-button-main";
		eventRaiser.eventData.Element = bannerDetails.Element;
		eventRaiser.raiseEvent();
	};

	self["search"] = function (eventData) {
		eventRaiser.eventData.event = "search";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;

		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.raiseEvent();
	};

	self["search-interaction"] = function (eventData) {
		eventRaiser.eventData.event = "search-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;

		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.raiseEvent();
	};

	self["deal-slip-search"] = function (eventData) {
		eventRaiser.eventData.event = "deal-slip-search";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;

		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.raiseEvent();
	};

	self["deal-slip-search-interaction"] = function (eventData) {
		eventRaiser.eventData.event = "deal-slip-search-interaction";
		eventRaiser.eventData.CurrentView = window.tradingEventsHandler.data.viewId;

		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.raiseEvent();
	};

	self["tutorial-events"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);
		eventRaiser.eventData.ViewID = window.tradingEventsHandler.data.viewId;
		eventRaiser.raiseEvent();
	};

	self["signals-menu-click"] = function () {
		eventRaiser.eventData.event = "signals-menu-click";
		eventRaiser.raiseEvent();
	};

	self["signals-drill-down"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "signals-drill-down";
		eventRaiser.raiseEvent();
	};

	self["signals-view-more"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "signals-view-more";
		eventRaiser.raiseEvent();
	};

	self["signals-detail-new-deal"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "signals-detail-new-deal";
		eventRaiser.raiseEvent();
	};

	self["short-term-signal-chart"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "short-term-signal-chart";
		eventRaiser.raiseEvent();
	};

	self["economic-calendar-menu-click"] = function () {
		eventRaiser.eventData.event = "economic-calendar-menu-click";
		eventRaiser.raiseEvent();
	};

	self["questionnaire-navigation"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "questionnaire-navigation";
		eventRaiser.raiseEvent();
	};

	self["questionnaire-question"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "questionnaire-question";
		eventRaiser.raiseEvent();
	};

	self["questionnaire-start"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "questionnaire-start";
		eventRaiser.raiseEvent();
	};

	self["questionnaire-quiz-start"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "questionnaire-quiz-start";
		eventRaiser.raiseEvent();
	};

	self["questionnaire-faq"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "questionnaire-faq";
		eventRaiser.raiseEvent();
	};

	self["deposit-faq"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "deposit-faq";
		eventRaiser.raiseEvent();
	};

	self["upload-documents-faq"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "upload-documents-faq";
		eventRaiser.raiseEvent();
	};

	self["support-interaction"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "support-interaction";
		eventRaiser.raiseEvent();
	};

	self["deal-slip-chart-interaction"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);
		eventRaiser.eventData.event = "deal-slip-chart-interaction";

		eventRaiser.raiseEvent();
	};

	self["chart-interaction"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "chart-interaction";

		eventRaiser.raiseEvent();
	};

	self["favorite-instruments-add"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "favorite-instruments-add";

		eventRaiser.raiseEvent();
	};

	self["favorite-instruments-remove"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "favorite-instruments-remove";

		eventRaiser.raiseEvent();
	};

	self["favorite-instruments-reorder"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "favorite-instruments-reorder";

		eventRaiser.raiseEvent();
	};

	self["view-sentiments"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "view-sentiments";
		eventRaiser.raiseEvent();
	};

	self["closed-deals-events"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData.data);

		eventRaiser.eventData.event = eventData.event + "-closed-deals";
		eventRaiser.raiseEvent();
	};

	self["notifications-settings-change"] = function (eventData) {
		eventRaiser.eventData.Element = eventData;

		eventRaiser.eventData.event = "notifications-settings-change";
		eventRaiser.raiseEvent();
	};

	self["chart-performance"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.chartInitDuration =
			PerformanceDataCollector.Timestamps[eFxNetEvents.ChartInitComplete] -
			PerformanceDataCollector.Timestamps[eFxNetEvents.ChartInit];
		eventRaiser.eventData.chartGeselftoryDuration =
			PerformanceDataCollector.Timestamps[eFxNetEvents.ChartGeselftoryResponse] -
			PerformanceDataCollector.Timestamps[eFxNetEvents.ChartGeselftoryRequest];
		eventRaiser.eventData.chartStartDuration =
			PerformanceDataCollector.Timestamps[eFxNetEvents.ChartStartComplete] -
			PerformanceDataCollector.Timestamps[eFxNetEvents.ChartStart];

		eventRaiser.raiseEvent();
	};

	self["tools-chart"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "tools-chart-" + eventRaiser.eventData.event;

		eventRaiser.raiseEvent();
	};

	self["start-callback-request-chat"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "start-callback-request-chat";

		eventRaiser.raiseEvent();
	};

	self["hub-menu-close"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "hub-menu-close";

		eventRaiser.raiseEvent();
	};

	self["hub-menu-open"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "hub-menu-open";

		eventRaiser.raiseEvent();
	};

	self["hub-map-expand"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);

		eventRaiser.eventData.event = "hub-map-expand";

		eventRaiser.raiseEvent();
	};

	self["hub-map-collapse"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);
		eventRaiser.eventData.event = "hub-map-collapse";
		eventRaiser.raiseEvent();
	};

	self["price-alerts-menu-view"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);
		eventRaiser.eventData.event = "price-alerts-menu-view";
		eventRaiser.raiseEvent();
	};

	self["price-alert-create"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);
		eventRaiser.eventData.event = "price-alert-create";
		eventRaiser.raiseEvent();
	};

	self["price-alert-error"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);
		eventRaiser.eventData.event = "price-alert-error";
		eventRaiser.raiseEvent();
	};

	self["deal-slip-change-highlow-term"] = function (eventData) {
		eventRaiser.eventData.Element = eventData;
		eventRaiser.eventData.event = "deal-slip-change-highlow-term";
		eventRaiser.raiseEvent();
	};

	self["help-center"] = function (eventData) {
		if (eventData.element) {
			eventRaiser.eventData.element = eventData.element;
		}

		if (eventData.tab) {
			eventRaiser.eventData.tab = eventData.tab;
		}

		eventRaiser.eventData.event = "help-center-" + eventData.event;
		eventRaiser.raiseEvent();
	};

	self["economic-calendar-trade-cta"] = function (eventData) {
		Object.assign(eventRaiser.eventData, eventData);
		eventRaiser.eventData.event = "economic-calendar-trade-cta";
		eventRaiser.raiseEvent();
	};

	var registerEvents = function (eEvents) {
		Object.keys(eEvents).forEach(function (eKey) {
			var eName = eEvents[eKey];

			self[eName] = function (eventData) {
				if (eventData) {
					Object.assign(eventRaiser.eventData, eventData);
				}

				eventRaiser.eventData.event = eName;
				eventRaiser.eventData.SlipExpandedInfoAreas = eventData.SlipExpandedInfoAreas;
				eventRaiser.raiseEvent();
			};
		});
	};

	registerEvents(eMarketInfoEvents);

	return self;
});
