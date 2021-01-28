define("devicemanagers/ViewModelsManager", [
	"require",
	"knockout",
	"helpers/ObservableHelper",
	"configuration/initconfiguration",
	"managers/viewsmanager",
	"viewmodels/QuotesViewModel",
	"viewmodels/QuotesPresetViewModel",
	"viewmodels/BalanceViewModel",
	"viewmodels/NetExposureViewModel",
	"viewmodels/AccountMarketViewModel",
	"viewmodels/ActivityLogViewModel",
	"viewmodels/MarginStatusViewModel",
	"modules/permissionsmodule",
	"FxNet/LogicLayer/Deal/DealPermissions",
	"viewmodels/ClosedDealDetailsViewModel",
	"viewmodels/AccountBalanceViewModel",
], function ViewModelsManagerDef(require) {
	var initConfiguration = require("configuration/initconfiguration"),
		vManager = require("managers/viewsmanager"),
		vmHelpers = require("helpers/ObservableHelper"),
		vmQuotes = require("viewmodels/QuotesViewModel"),
		vmQuotesPreset = require("viewmodels/QuotesPresetViewModel"),
		vmBalance = require("viewmodels/BalanceViewModel"),
		vmNetExposure = require("viewmodels/NetExposureViewModel"),
		vmAccountMarket = require("viewmodels/AccountMarketViewModel"),
		DealPermissions = require("FxNet/LogicLayer/Deal/DealPermissions"),
		vmClosedDealDetails = require("viewmodels/ClosedDealDetailsViewModel"),
		vmAccountBalance = require("viewmodels/AccountBalanceViewModel"),
		vmMarginStatus = require("viewmodels/MarginStatusViewModel");

	function ViewModelsManager() {
		function init(uiVersion, startUpForm) {
			vManager.Init(uiVersion);
			vmQuotes.Init(initConfiguration.FavoriteInstrumentsConfiguration);
			vmClosedDealDetails.Init(DealPermissions);
			vmQuotesPreset.Init(initConfiguration.QuotesPresetConfiguration);
			vmBalance.Init(initConfiguration.BalanceConfiguration);
			vmNetExposure.Init();

			vmAccountMarket.Init();
			vmMarginStatus.Init();
			vmAccountBalance.Init();

			start(startUpForm);
		}

		function start(startUpForm) {
			vManager.Start(startUpForm);
		}

		return {
			Init: init,
			VManager: vManager,
			VmQuotes: vmQuotes,
			VmQuotesPreset: vmQuotesPreset,
			VmHelpers: vmHelpers,
			VmClosedDealDetails: vmClosedDealDetails,
			VmBalance: vmBalance,
			VmNetExposure: vmNetExposure,
			VmAccountMarket: vmAccountMarket,
			VmMarginStatus: vmMarginStatus,
			VmAccountBalance: vmAccountBalance,
		};
	}

	var module = (window.$viewModelsManager = new ViewModelsManager());

	return module;
});
