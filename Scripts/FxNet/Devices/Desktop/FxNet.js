define([
	"require",
	"Q",
	"knockout",
	"vendor/knockout.validation",
	"configuration/PlugInConfiguration",
	"devicemanagers/StatesManager",
	"initdatamanagers/InitialDataManager",
	"devicemanagers/ViewModelsManager",
	"initdatamanagers/Customer",
	"handlers/general",
	"global/storagefactory",
], function FxNet(require) {
	var ko = require("knockout"),
		Q = require("Q"),
		PlugInConfiguration = require("configuration/PlugInConfiguration"),
		StatesManager = require("devicemanagers/StatesManager"),
		InitialDataManager = require("initdatamanagers/InitialDataManager"),
		ViewModelsManager = require("devicemanagers/ViewModelsManager"),
		general = require("handlers/general"),
		StorageFactory = require("global/storagefactory"),
		Customer = require("initdatamanagers/Customer");

	var currentForm,
		preLoadInitialData = true,
		isLoaded = ko.observable(false),
		isVisible = ko.observable(false),
		uiRederedDefer = Q.defer(),
		localStorage = StorageFactory(StorageFactory.eStorageType.local),
		sessionStorage = StorageFactory(StorageFactory.eStorageType.session);

	function init(form) {
		currentForm = form;

		StatesManager.Init();

		PlugInConfiguration.RegisterComponents();
		PlugInConfiguration.RegisterContentTemplateComponents();

		return InitialDataManager.LoadData(preLoadInitialData)
			.then(function () {
				StatesManager.InitFromCustomer(Customer.prop.compliance);
			})
			.then(initUiLayer)
			.then(exposeUI);
	}

	function initUiLayer() {
		PlugInConfiguration.GoogleTagManagerInit();
		ViewModelsManager.Init(eUIVersion.Default, currentForm);
		PlugInConfiguration.BindKO();
	}

	function exposeUI() {
		isLoaded(true);

		general.ref("splashScreen").style.display = "none";
		general.ref("sharedformBody").style.display = "block";

		isVisible(true);
	}

	function uiAfterRender() {
		uiRederedDefer.resolve();
	}

	var module = (window.FxNet = {
		Init: init,
		IsLoaded: isLoaded,
		IsVisible: isVisible,
		UiAfterRender: uiAfterRender,
		ViewModelsManager: ViewModelsManager,
		exposeUI: exposeUI,
		hideUI: function () {},
		LocalStorage: localStorage,
		SessionStorage: sessionStorage,
	});

	return module;
});
