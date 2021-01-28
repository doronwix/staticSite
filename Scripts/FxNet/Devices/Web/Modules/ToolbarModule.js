define('devicecustommodules/ToolbarModule',
    [
		'require',
		"require",
		"knockout",
		"handlers/general",
		"devicemanagers/StatesManager",
		"StateObject!PostLoginAlerts",
		"initdatamanagers/Customer",
		"viewmodels/dialogs/DialogViewModel",
		"cachemanagers/dealsmanager",
		"managers/viewsmanager"
    ],
	function ToolbarModule(require) {
		var ko = require("knockout"),
			DealsManager = require("cachemanagers/dealsmanager"),
			general = require("handlers/general"),
			StatesManager = require("devicemanagers/StatesManager"),
			postLoginAlerts = require("StateObject!PostLoginAlerts"),
			customer = require("initdatamanagers/Customer"),
			vmDialog = require("viewmodels/dialogs/DialogViewModel"),
			ViewsManager = require("managers/viewsmanager"),
			toolbarInfo = {};

		function init() {
			setDefaultObservables();
			updateData();
		}

		function setDefaultObservables() {
			toolbarInfo.allowRefreshBtn = ko.observable(false);
			toolbarInfo.hasDeals = ko.observable(false);

			toolbarInfo.tradingClosed = ko.computed(function () {
				var states = StatesManager.GetStates();
				return states.IsMarketClosed() || states.IsPortfolioInactive();
			});

			toolbarInfo.disableNewTransaction = ko.computed(function () {
				return !window.componentsLoaded();
			});

			// Close Deal
			toolbarInfo.showCloseDeal = ko.computed(function () {
				return !ViewsManager.GetActiveFormViewProperties(eViewTypes.vOpenDeals).visible();
			});

			toolbarInfo.disableCloseDeal = ko.computed(function () {
				return !window.componentsLoaded() || !toolbarInfo.hasDeals() || toolbarInfo.tradingClosed();
			});

			// Close Selected
			toolbarInfo.hideCloseSelectedDeals = ko.computed(function () {
				return !ViewsManager.GetActiveFormViewProperties(eViewTypes.vOpenDeals).visible();
			});

			// Refresh
			toolbarInfo.hideRefresh = ko.computed(function () {
				return (
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vOpenDeals).visible() ||
					(ViewsManager.GetActiveFormViewProperties(eViewTypes.vLimits).visible() &&
						!toolbarInfo.allowRefreshBtn()) ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vClientQuestionnaire).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vTradingSignals).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vPersonalDetails).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vCharts).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vAdvinionChart).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vChangePassword).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vUploadDocuments).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vWithdrawal).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vTutorials).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vEducationalTutorials).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vPaymentTypes).visible() ||
					ViewsManager.GetActiveFormViewProperties(eViewTypes.vNotificationsSettings).visible()
				);
			});
		}

		function updateData() {
			toolbarInfo.hasDeals(DealsManager.Deals.count() > 0);

			registerToDispatcher();
		}

		function registerToDispatcher() {
			DealsManager.OnDealsChange.Add(onDealsChange);
		}

		function unRegisterFromDispatcher() {
			DealsManager.OnDealsChange.Remove(onDealsChange);
		}

		function onDealsChange() {
			toolbarInfo.hasDeals(DealsManager.Deals.count() > 0);
		}

		function openTransactionSwitcherDialog(transactionParameters) {
			var dialogClass =
				"deal-slip" + (customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised) ? " revised-slip" : "");

			if (general.isNullOrUndefined(transactionParameters.instrumentId)) {
				transactionParameters.instrumentId = $instrumentsManager.GetUserDefaultInstrumentId();
			}

			vmDialog.open(
				eDialog.TransactionSwitcher,
				{
					title: "",
					width: 700,
					dragStart: function () {
						ko.postbox.publish("new-deal-dragged", {});
					},
					customTitle: "TransactionDropDown",
					persistent: false,
					dialogClass: dialogClass,
				},
				eViewTypes.vTransactionSwitcher,
				transactionParameters
			);
		}

		function newDealHandler(newDealParameters, preventWhenCddRedirect) {
			newDealParameters = newDealParameters || {};
			newDealParameters.transactionType = eTransactionSwitcher.NewDeal;
			ko.postbox.publish("new-deal-click");

			if (toolbarInfo.disableNewTransaction()) {
				return;
			}

			if (
				!general.isNullOrUndefined(preventWhenCddRedirect) &&
				StatesManager.States.shouldCddRedirect() &&
				!postLoginAlerts.get("SetAlertsBehaviorMode")
			) {
				return;
			}

			openTransactionSwitcherDialog(newDealParameters);
		}

		function newLimitHandler(newLimitParametes) {
			newLimitParametes = newLimitParametes || {};
			newLimitParametes.transactionType = eTransactionSwitcher.NewLimit;

			if (toolbarInfo.disableNewTransaction()) {
				return;
			}

			openTransactionSwitcherDialog(newLimitParametes);
		}

		function closeDealHandler() {
			if (toolbarInfo.disableCloseDeal()) {
				return;
			}
			var revisedDs = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
				dialogTitle = !revisedDs ? Dictionary.GetItem("CloseDeal", "dialogsTitles", " ") : '',
				dialogClass = "deal-slip" + (revisedDs ? " revised-slip" : " closeDeal");

			if (toolbarInfo.hasDeals()) {
				vmDialog.open(
					eDialog.CloseDeal,
					{
						title: dialogTitle,
						customTitle: "CloseDealPosNum",
						width: 555,
						persistent: false,
						dialogClass: dialogClass,
					},
					eViewTypes.vCloseDeal
				);
			}
		}

		function dispose() {
			unRegisterFromDispatcher();
		}

		return {
			Init: init,
			dispose: dispose,
			ToolbarInfo: toolbarInfo,
			NewDealHandler: newDealHandler,
			NewLimitHandler: newLimitHandler,
			CloseDealHandler: closeDealHandler
		};
    }
);