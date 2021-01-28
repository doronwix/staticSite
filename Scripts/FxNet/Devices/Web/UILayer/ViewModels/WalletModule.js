define([
	"require",
	"handlers/general",
	"viewmodels/WalletModuleBase",
	"managers/CustomerProfileManager",
	"StateObject!DealerParams",
	"cachemanagers/ClientStateHolderManager",
], function (require) {
	var general = require("handlers/general"),
		WalletModuleBase = require("viewmodels/WalletModuleBase"),
		customerProfileManager = require("managers/CustomerProfileManager"),
		stateObjectDealerParams = require("StateObject!DealerParams"),
		csHolderManager = require("cachemanagers/ClientStateHolderManager");

	var WalletModule = general.extendClass(WalletModuleBase, function NewWalletModuleClass(_params) {
		var self = this,
			parent = self.parent;

		function init() {
			parent.Init();

			setObservableCustomerObject();

			registerToDispatcher();

			setInitialAdvancedViewMode();
		}

		function setInitialAdvancedViewMode() {
			parent.ViewProperties.isAdvancedView(
				!!(
					stateObjectDealerParams.get(eDealerParams.DealerAdvancedWalletView) ||
					customerProfileManager.ProfileCustomer().advancedWalletView
				)
			);
		}

		function setObservableCustomerObject() {
			var csHolder = csHolderManager.CSHolder;
			parent.WalletInfo.marginLevel = parent.util.toObservable(calculateMarginLevel(csHolder), function (val) {
				var naVal = general.toNumeric("NA");
				return parent.ViewProperties.isAdvancedView() && naVal !== val && 0 < val;
			});
		}

		function dispose() {
			parent.Dispose();
			unregisterFromDispatcher();
		}

		function registerToDispatcher() {
			csHolderManager.OnChange.Add(onClientStateChange);
		}

		function unregisterFromDispatcher() {
			csHolderManager.OnChange.Remove(onClientStateChange);
		}
		//-------------------------------------------------------
		function calculateMarginLevel(csHolder) {
			var usedMargin = general.toNumeric(csHolder.usedMargin);
			var totalEquity = general.toNumeric(csHolder.totalEquity);
			var naVal = general.toNumeric("NA");

			if (naVal === usedMargin || naVal === totalEquity || 0 === usedMargin || 0 === totalEquity) {
				return naVal;
			}

			return general.toNumeric(totalEquity / usedMargin);
		}

		function onClientStateChange() {
			var csHolder = csHolderManager.CSHolder;
			parent.WalletInfo.marginLevel.value(calculateMarginLevel(csHolder));
		}
		return {
			Init: init,
			WalletInfo: parent.WalletInfo,
			ViewProperties: parent.ViewProperties,
			OpenInDialog: parent.OpenInDialog,
			Dispose: dispose,
		};
	});

	return new WalletModule();
});
