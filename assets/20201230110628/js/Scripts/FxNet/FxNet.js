/*global Preloader */
define([
	"require",
	"knockout",
	"vendor/knockout.validation",
	"helpers/KOExtensions",
	"Q",
	"generalmanagers/ActivitySupervisor",
	"configuration/PlugInConfiguration",
	"devicemanagers/StatesManager",
	"devicecustommodules/PostLoginAlertController",
	"initdatamanagers/InitialDataManager",
	"managers/RetentionManager",
	"initdatamanagers/Customer",
	"managers/CustomerProfileManager",
	"tracking/PerformanceDataCollector",
	"devicemanagers/ViewModelsManager",
	"cachemanagers/CacheManager",
	"initdatamanagers/InstrumentsManager",
	"initdatamanagers/DealsAmountsManager",
	"cachemanagers/dealsmanager",
	"handlers/Logger",
	"cachemanagers/NotificationsManager",
	"modules/PresetsManager",
	"generalmanagers/SessionSupervisor",
	"modules/permissionsmodule",
	"StateObject!Csm",
	"configuration/initconfiguration",
	"modules/environmentData",
	"tracking/loggers/fxtracking.lib",
	"trackingIntExt/TrackingData",
	"trackingIntExt/TradingEventsHandler",
	"tracking/EventsCollector",
	"global/storagefactory",
	"fxnet/preloader",
], function FxNet(require) {
	//test1022ssss
	var ko = require("knockout"),
		Q = require("Q"),
		PerformanceDataCollector = require("tracking/PerformanceDataCollector"),
		ActivitySupervisor = require("generalmanagers/ActivitySupervisor"),
		PlugInConfiguration = require("configuration/PlugInConfiguration"),
		StatesManager = require("devicemanagers/StatesManager"),
		PostLoginsAlerts = require("devicecustommodules/PostLoginAlertController"),
		InitialDataManager = require("initdatamanagers/InitialDataManager"),
		Customer = require("initdatamanagers/Customer"),
		CustomerProfileManager = require("managers/CustomerProfileManager"),
		RetentionManager = require("managers/RetentionManager"),
		ViewModelsManager = require("devicemanagers/ViewModelsManager"),
		RegistrationManager = require("generalmanagers/RegistrationManager"),
		CacheManager = require("cachemanagers/CacheManager"),
		InstrumentsManager = require("initdatamanagers/InstrumentsManager"),
		DealsAmountsManager = require("initdatamanagers/DealsAmountsManager"),
		dealsManager = require("cachemanagers/dealsmanager"),
		logger = require("handlers/Logger"),
		NotificationManager = require("cachemanagers/NotificationsManager"),
		PresetsManager = require("modules/PresetsManager"),
		SessionSupervisor = require("generalmanagers/SessionSupervisor"),
		permissionsModule = require("modules/permissionsmodule"),
		csmStateObject = require("StateObject!Csm"),
		gtmConfiguration = require("configuration/initconfiguration").GTMConfiguration,
		environmentData = require("modules/environmentData").get(),
		fxTracking = require("tracking/loggers/fxtracking.lib"),
		trackingData = require("trackingIntExt/TrackingData"),
		tradingEventsHandler = require("trackingIntExt/TradingEventsHandler"),
		StorageFactory = require("global/storagefactory"),
		Preloader = require("fxnet/preloader"),
		eventsCollector = require("tracking/EventsCollector");

	var sessionSupervisor = new SessionSupervisor(),
		isLoaded = ko.observable(false),
		isVisible = ko.observable(false),
		isCacheLoaded = ko.observable(false),
		uiRederedDefer = Q.defer(),
		localStorage = StorageFactory(StorageFactory.eStorageType.local),
		sessionStorage = StorageFactory(StorageFactory.eStorageType.session),
		loadingFinished = ko.observable(false),
		csmOutOfDate = ko.observable(false);

	csmStateObject.set(eStateObjectTopics.CsmOutOfDate, false);

	function init() {
		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.Init);

		InitialDataManager.OnTimestamp.Add(function (event) {
			PerformanceDataCollector.registerEventTimestamp(event);
		});
		InitialDataManager.OnInitialScreens.Add(function (screens) {
			PresetsManager.SetAvailableScreens(screens);
		});

		CacheManager.Init();
		StatesManager.Init();
		PostLoginsAlerts.Init();

		csmStateObject.subscribe(eStateObjectTopics.CsmOutOfDate, function (value) {
			csmOutOfDate(value);
		});

		InstrumentsManager.OnUiOrderChanged.Add(RegistrationManager.Update);
		RegistrationManager.OnRegistrationListChanged.Add(CacheManager.Register);
		NotificationManager.OnInstrumentsUpdated.Add(InstrumentsManager.UpdateInstruments);
		NotificationManager.OnMinDealAmountsUpdated.Add(InstrumentsManager.ResetInstrumentsDealAmounts);

		PresetsManager.OnPresetsUpdated.Add(InstrumentsManager.SetPresetIntruments);
		DealsAmountsManager.Init();

    dealsManager.OnDealsRemoved.Add(function logRemovedDeals(removedItems) {
        logger.log('FxNet/logRemovedDeals', removedItems);
    });


		PlugInConfiguration.AdjustCulture();
		//for now implemented only in mobile
		PlugInConfiguration.RegisterContentTemplateComponents();

		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.Start);

		var initialData = InitialDataManager.LoadData().then(function () {
			
			PlugInConfiguration.RegisterComponents(Customer.prop.abTestings.configuration);
			applyBindings();

			PresetsManager.Start();
		});

		return Q.all([waitForHtml(), initialData])
			.then(initUiLayer)
			.then(loadCache)
			.then(exposeUI)
			.then(function () {
				return uiRederedDefer.promise;
			})
			.then(function () {
				ko.postbox.publish("ui-loaded");
			});
	}

	function loadCache() {
		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.CacheLoadStart);

		return CacheManager.LoadData().then(function () {
			PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.CacheLoadEnd);
			isCacheLoaded(true);
		});
	}

	function configTRacking() {
		trackingData.init();
		window.trackingData = trackingData;

		eventsCollector.init(trackingData);

		tradingEventsHandler.init();

		window.tradingEventsHandler = tradingEventsHandler;
	}

	function initUiLayer() {
		return Q.fcall(function () {
			PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.UiLayerStart);

			configTRacking();
			// if not dealer mode
			if (permissionsModule.CheckPermissions("gtm")) {
				var gtmId = Dictionary.GetItem(gtmConfiguration.gtmContentKey, "googleTagManagerId");
				fxTracking.init(gtmId, Customer.prop.abTestings.configuration, environmentData.biServiceURL);
			}

			RetentionManager.UpdateToken()
				.then(function (token) {
					if (permissionsModule.CheckPermissions("apiIM")) {
						RetentionManager.SubscribeToInteractiveMessage(token);
					}

					sessionSupervisor.Start();
					PlugInConfiguration.UpdateScmmTrackingData();
				})
				.done();

			ActivitySupervisor.Start();

			ViewModelsManager.Init(CustomerProfileManager.GetUiVersion(), Customer.prop.startUpForm);
		}).then(function () {
			PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.UiLayerEnd);
		});
	}

	function waitForHtml() {
		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.WaitHtmlStart);

		var defer = Q.defer();

		defer.promise.then(function () {
			PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.WaitHtmlEnd);
		});

		function checkPreloader() {
			if (Preloader.DataObjects.htmlReady) {
				defer.resolve();
				return;
			}

			Preloader.SetHtmlLoadEvent(checkPreloader);
		}

		checkPreloader();

		return defer.promise;
	}

	function applyBindings() {
		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.ApplyBindingsStart);

		PlugInConfiguration.BindKO();

		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.ApplyBindingsEnd);
	}

	function exposeUI() {
		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.SplashScreenRemoved);

		isLoaded(true);

		PlugInConfiguration.AdjustHtml();
		PlugInConfiguration.AddPixel();
		PlugInConfiguration.ExposeUI();

		isVisible(true);
	}

	function uiAfterRender() {
		PerformanceDataCollector.registerEventTimestamp(eFxNetEvents.ExposeUi);
		loadingFinished(true);
		uiRederedDefer.resolve();
	}

	var module = (window.FxNet = {
		Init: init,
		IsLoaded: isLoaded,
		CsmOutOfDate: csmOutOfDate,
		IsVisible: isVisible,
		IsCacheLoaded: isCacheLoaded,
		UiRenderedPromise: uiRederedDefer.promise,
		UiAfterRender: uiAfterRender,
		ViewModelsManager: ViewModelsManager,
		exposeUI: exposeUI,
		hideUI: function () {},
		LocalStorage: localStorage,
		SessionStorage: sessionStorage,
		LoadingFinished: loadingFinished,
	});

	return module;
});
