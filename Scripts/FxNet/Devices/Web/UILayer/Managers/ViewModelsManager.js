define("devicemanagers/ViewModelsManager", [
	"require",
	"knockout",
	"helpers/ObservableHelper",
	"configuration/initconfiguration",
	"managers/viewsmanager",
	"viewmodels/QuotesViewModel",
	"viewmodels/QuotesPresetViewModel",
	"viewmodels/ViewAndPrintWithdrawalViewModel",
	"viewmodels/BalanceViewModel",
	"viewmodels/NetExposureViewModel",
	"viewmodels/AccountMarketViewModel",
	"viewmodels/ActivityLogViewModel",
	"viewmodels/MarginStatusViewModel",
	"viewmodels/TradingSignalsTutorialsViewModel",

	"managers/historymanager",
	"initdatamanagers/Customer",

	"viewmodels/dialogs/DialogViewModel",
	"viewmodels/AccountBalanceViewModel",
	"viewmodels/relatedPositionViewModel",
], function ViewModelsManagerDef(require) {
	var initConfiguration = require("configuration/initconfiguration"),
		ko = require("knockout"),
		Customer = require("initdatamanagers/Customer"),
		vmDialog = require("viewmodels/dialogs/DialogViewModel"),
		vmHelpers = require("helpers/ObservableHelper"),
		vmRelatedPosition = require("viewmodels/relatedPositionViewModel"),
		vmViewAndPrintWithdrawal = require("viewmodels/ViewAndPrintWithdrawalViewModel"),
		vmBalance = require("viewmodels/BalanceViewModel"),
		vmNetExposure = require("viewmodels/NetExposureViewModel"),
		vmQuotesPreset = require("viewmodels/QuotesPresetViewModel"),
		vmAccountMarket = require("viewmodels/AccountMarketViewModel"),
		vmActivityLog = require("viewmodels/ActivityLogViewModel"),
		vmMarginStatus = require("viewmodels/MarginStatusViewModel"),
		vmTradingSignalTutorials = require("viewmodels/TradingSignalsTutorialsViewModel"),
		vmQuotes = require("viewmodels/QuotesViewModel"),
		vManager = require("managers/viewsmanager"),
		vmAccountBalance = require("viewmodels/AccountBalanceViewModel");

	function ViewModelsManager() {
		function onActiveFormChanged(formType) {
			//reset Idle Activity Time
			ActivitySupervisor.ResetTimeRequest();

			if (!vmDialog.persistent()) {
				vmDialog.close();
			}

			if (
				formType == eForms.Deals &&
				(formType == Customer.prop.startUpForm || formType == Customer.prop.mainPage)
			) {
				vmAccountMarket.UseTransitions(false);
				vmAccountMarket.IsCollapsed(false);
				vmAccountMarket.UseTransitions(true);
			} else {
				vmAccountMarket.UseTransitions(false);
				vmAccountMarket.IsCollapsed(true);
				vmAccountMarket.UseTransitions(true);
			}
		}

		//------------------ View Model Manager -------------
		function init(uiVersion, startUpForm) {
			vManager.Init(uiVersion);
			vManager.OnActiveFormChanged.Add(onActiveFormChanged);

			vmDialog.OnPreload.Add(function onPreload(dialogName, view, args) {
				vManager.ChangeViewState(view, eViewState.Start, args);
			});

			vmDialog.OnOpen.Add(function onDialogOpen(dialogName, view, args) {
				if (vManager.GetViewState(view) !== eViewState.Start) {
					vManager.ChangeViewState(view, eViewState.Start, args);
				}

				HistoryManager.PushPopupState(ePopupType.Dialog, dialogName);
			});

			vmDialog.OnClose.Add(function onDialogClose(dialogName, view) {
				vManager.ChangeViewState(view, eViewState.Stop);
				ko.postbox.publish(eAppEvents.dialogClosed);

				if (HistoryManager.HasDialog(dialogName)) {
					HistoryManager.Back();
				}
			});

			HistoryManager.OnStateChanged.Add(function (state) {
				// if more than 1 dialog is opened
				if (state.type === eHistoryStateType.CloseDialog) {
					vmDialog.close(state.popupId);
				}
			});

			vmQuotes.Init(initConfiguration.QuotesGridConfiguration);
			vmQuotes.OpenInDialog.Add(function (name, options, eView, args) {
				vmDialog.open(name, options, eView, args);
			});

			vmBalance.Init(initConfiguration.BalanceConfiguration);

			vmNetExposure.Init();
			vmRelatedPosition.Init();

			vmQuotesPreset.Init(initConfiguration.QuotesPresetConfiguration);
			vmViewAndPrintWithdrawal.Init(initConfiguration.ViewAndPrintWithdrawal);

			vmAccountMarket.Init();
			vmActivityLog.Init();

			vmMarginStatus.Init();

			vmTradingSignalTutorials.Init();

			vmAccountBalance.Init();

			start(startUpForm);
		}

		function start(startUpForm) {
			vManager.Start(startUpForm);
		}

		function isReactEnabled() {
			var configuration = Customer.prop.abTestings.configuration;
			return configuration["react-store"] === true;
		}

		function reactComponentsEnabled() {
			var configuration = Customer.prop.abTestings.configuration;
			var reactEnabled = isReactEnabled();
			return {
				"fx-core-api/summaryView": reactEnabled && configuration["fx-react-account-summary"] === true,
				"fx-core-api/quotesGrid": reactEnabled && configuration["fx-react-quotes-grid"] === true,
			};
		}

		return {
			Init: init,
			VmDialog: vmDialog,
			VmQuotes: vmQuotes,
			VmBalance: vmBalance,

			VmViewAndPrintWithdrawal: vmViewAndPrintWithdrawal,
			VmNetExposure: vmNetExposure,

			VmRelatedPosition: vmRelatedPosition,
			VmHelpers: vmHelpers,

			VManager: vManager,

			VmQuotesPreset: vmQuotesPreset,

			VmActivityLog: vmActivityLog,
			VmAccountMarket: vmAccountMarket,

			VmMarginStatus: vmMarginStatus,
			VmTradingSignalsTutorials: vmTradingSignalTutorials,

			VmAccountBalance: vmAccountBalance,
			IsReactEnabled: isReactEnabled,
			ReactComponentsEnabled: reactComponentsEnabled,
		};
	}

	var module = (window.$viewModelsManager = new ViewModelsManager());

	return module;
});
