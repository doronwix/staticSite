define("deviceviewmodels/PaymentSelectionBehaviors", [
	"require",
	"knockout",
	"enums/paymentsconfigsettings",
	"initdatamanagers/Customer",
	"Dictionary",
	"managers/viewsmanager",
	"viewmodels/dialogs/DialogViewModel",
], function (require) {
	var ko = require("knockout"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings"),
		Customer = require("initdatamanagers/Customer"),
		Dictionary = require("Dictionary"),
		ViewsManager = require("managers/viewsmanager"),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel");

	function resetObjects() {
		if (paymentsConfigSettings && paymentsConfigSettings.length > 0) {
			paymentsConfigSettings.forEach(function (paymentConfig) {
				if (paymentConfig.ViewType) {
					ViewsManager.ChangeViewState(eViewTypes[paymentConfig.ViewType], eViewState.Stop);
				}

				if (paymentConfig.SubViews) {
					paymentConfig.SubViews.forEach(function (subview) {
						if (subview.ViewType) {
							ViewsManager.ChangeViewState(eViewTypes[subview.ViewType], eViewState.Stop);
						}
					});
				}
			});
		}
	}

	function paymentSelectedChanged(methodID, paymentDataViewType) {
		resetObjects();

		var paymentConfig = paymentsConfigSettings.filter(function (pm) {
			return pm.Id.toString() === methodID.toString();
		});

		if (paymentConfig[0].SubViews) {
			var s = paymentConfig[0].SubViews.filter(function (subview) {
				return subview.ViewId === paymentDataViewType;
			});

			initializeView(s[0]);

			ko.postbox.publish("deposit-type-changed", { depositType: s[0].DepositType });
		} else {
			if (paymentConfig && paymentConfig.length > 0) {
				initializeView(paymentConfig[0]);

				ko.postbox.publish("deposit-type-changed", { depositType: paymentConfig[0].DepositType });
			}
		}
	}

	function initializeView(paymentConfig) {
		if (paymentConfig.ViewType) {
			ViewsManager.ChangeViewState(eViewTypes[paymentConfig.ViewType], eViewState.Start);
		}
	}

	function getDefaultInstructions() {
		var wireTransferInstruction = [99, 20, 1, "", 1, 0, "eDepositingActionTypeText_20", 0, 0, "2"];

		return [wireTransferInstruction];
	}

	function filterAvailablePayments(paymentTypes) {
		return paymentTypes;
	}

	function checkMissingCustomerInformation() {
		if (Customer.prop.hasMissingInformation) {
			if (!DialogViewModel.isOpen()) {
				ko.postbox.publish("trading-event", "agreement-view");

				var options = {
					autoOpen: true,
					modal: true,
					draggable: true,
					resizable: false,
					width: 620,
					closeOnEscape: false,
					dialogClass: "fx-dialog noCloseButton",
					openTimeout: 100,
					title: Dictionary.GetItem("missingCustomerInformationTitle"),
					appendTo: eDialog.MissingCustomerInformationContainer,
					persistent: false,
				};

				DialogViewModel.openAsync(
					eAppEvents.customerInformationLoadedEvent,
					eDialog.MissingCustomerInformation,
					options,
					eViewTypes.vMissingCustomerInformation
				);
			}
		} else {
			ViewsManager.ChangeViewState(eViewTypes.vMissingCustomerInformation, eViewState.Stop);
		}
	}

	function closeMissingDetailsDialog() {
		if (Customer.prop.hasMissingInformation) {
			DialogViewModel.close();
		}
	}

	function onCustomerSuccessfullUpdate() {
		ko.postbox.publish("trading-event", "agreement-success");

		DialogViewModel.close();

		ViewsManager.ChangeViewState(eViewTypes.vMissingCustomerInformation, eViewState.Stop);
		ko.postbox.publish(ePostboxTopic.MissingInfo, false);
	}

	return {
		Stop: resetObjects,
		ShowSelectedBehavior: paymentSelectedChanged,
		GetDefaultInstructions: getDefaultInstructions,
		FilterAvailablePayments: filterAvailablePayments,
		CheckMissingCustomerInformation: checkMissingCustomerInformation,
		OnCustomerSuccessfullUpdate: onCustomerSuccessfullUpdate,
		CloseMissingDetailsDialog: closeMissingDetailsDialog,
	};
});
