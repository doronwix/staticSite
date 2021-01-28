define("deviceviewmodels/PaymentSelectionBehaviors", [
	"require",
	"knockout",
	"handlers/general",
	"enums/paymentsconfigsettings",
	"initdatamanagers/Customer",
	"managers/viewsmanager",
	"viewmodels/dialogs/DialogViewModel",
	"objects/Funds/Deposit/DepositPopupControl",
	"dataaccess/dalDeposit",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings"),
		Customer = require("initdatamanagers/Customer"),
		ViewsManager = require("managers/viewsmanager"),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel"),
		DepositPopupControl = require("objects/Funds/Deposit/DepositPopupControl"),
		dalDeposit = require("dataaccess/dalDeposit");

	var userControl;

	var resetObjects = function () {
		if (userControl) {
			userControl.dispose();
		}

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
	}; //-------------------------------------------------------

	var paymentSelectedChanged = function (methodID, paymentDataViewType) {
		resetObjects();

		var paymentConfig = paymentsConfigSettings.filter(function (pm) {
			return pm.Id.toString() === methodID.toString();
		});

		if (paymentConfig[0].SubViews) {
			var s = paymentConfig[0].SubViews.filter(function (subview) {
				return subview.ViewId === paymentDataViewType;
			});

			initializeUserControl(s[0]);
			initializeView(s[0]);

			ko.postbox.publish("deposit-type-changed", { depositType: s[0].DepositType });
		} else {
			if (paymentConfig && paymentConfig.length > 0) {
				initializeUserControl(paymentConfig[0]);
				initializeView(paymentConfig[0]);

				ko.postbox.publish("deposit-type-changed", { depositType: paymentConfig[0].DepositType });
			}
		}

		if (!general.isEmptyType(userControl)) {
			userControl.show();
		}
	};

	var initializeView = function (paymentConfig) {
		if (paymentConfig.ViewType) {
			ViewsManager.ChangeViewState(eViewTypes[paymentConfig.ViewType], eViewState.Start);
		}
	};

	var initializeUserControl = function (paymentConfig) {
		if (paymentConfig.UserControl) {
			if (paymentConfig.UserControl.Method) {
				userControl = new DepositPopupControl({
					dalMethod: dalDeposit[paymentConfig.UserControl.Method],
				});
			} else {
				userControl = new window[paymentConfig.UserControl.Name]();
			}
		} else {
			userControl = null;
		}
	};

	var getDefaultInstructions = function () {
		var wireTransferInstruction = [99, 20, 1, "", 1, 0, "eDepositingActionTypeText_20", 0, 0, "2"];

		return [wireTransferInstruction];
	};

	var filterAvailablePayments = function (paymentTypes) {
		return paymentTypes;
	};

	var checkMissingCustomerInformation = function () {};

	var closeMissingDetailsDialog = function () {
		if (Customer.prop.hasMissingInformation && general.isDefinedType(DialogViewModel)) {
			DialogViewModel.close();
		}
	};

	var onCustomerSuccessfullUpdate = function () {
		if (general.isDefinedType(DialogViewModel)) {
			DialogViewModel.close();
		} else {
			window.external.CloseHostForm();
		}

		ViewsManager.ChangeViewState(eViewTypes.vMissingCustomerInformation, eViewState.Stop);
	};

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
