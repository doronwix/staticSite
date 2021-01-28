define("deviceviewmodels/PaymentSelectionBehaviors", [
	"require",
	"knockout",
	"enums/paymentsconfigsettings",
	"initdatamanagers/Customer",
	"Dictionary",
	"managers/viewsmanager",
	"devicemanagers/AlertsManager",
], function (require) {
	var ko = require("knockout"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings"),
		Customer = require("initdatamanagers/Customer"),
		Dictionary = require("Dictionary"),
		ViewsManager = require("managers/viewsmanager"),
		AlertsManager = require("devicemanagers/AlertsManager");

	var resetObjects = function () {
		if (paymentsConfigSettings && paymentsConfigSettings.length > 0) {
			paymentsConfigSettings.forEach(function (paymentConfig) {
				if (!paymentConfig.ShowInMobile) return;

				if (paymentConfig.ViewType)
					ViewsManager.ChangeViewState(eViewTypes[paymentConfig.ViewType], eViewState.Stop);

				if (paymentConfig.SubViews) {
					paymentConfig.SubViews.forEach(function (subview) {
						if (subview.ViewType)
							ViewsManager.ChangeViewState(eViewTypes[subview.ViewType], eViewState.Stop);
					});
				}
			});
		}
	};

	//-------------------------------------------------------
	var paymentSelectedChanged = function (methodId, paymentDataViewType) {
		resetObjects();
		var paymentConfig = paymentsConfigSettings.filter(function (pm) {
			return pm.Id.toString() === methodId.toString();
		});

		if (paymentConfig[0].SubViews) {
			var s = paymentConfig[0].SubViews.filter(function (subview) {
				return subview.ViewId === paymentDataViewType;
			});

			ViewsManager.ChangeViewState(eViewTypes[s[0].ViewType], eViewState.Start);
			ko.postbox.publish("deposit-type-changed", { depositType: s[0].DepositType });
		} else {
			if (paymentConfig && paymentConfig.length > 0) {
				ViewsManager.ChangeViewState(eViewTypes[paymentConfig[0].ViewType], eViewState.Start);
				ko.postbox.publish("deposit-type-changed", { depositType: paymentConfig[0].DepositType });
			} else {
				AlertsManager.UpdateAlert(
					AlertTypes.ServerResponseAlert,
					null,
					Dictionary.GetItem("DepositNoPaymentMethods"),
					null,
					{ redirectToView: eForms.Quotes }
				);
				AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
			}
		}
	};

	var getDefaultInstructions = function () {
		return [];
	};

	var filterAvailablePayments = function (allPaymentTypes) {
		return filterOutRegularIfDR(allPaymentTypes).filter(function (pt) {
			var supportedPayment = paymentsConfigSettings.filter(function (pb) {
				return pb.Id.toString() === pt.methodID.toString();
			});
			return supportedPayment && supportedPayment.length > 0;
		});
	};

	var filterOutRegularIfDR = function (allPaymentTypes) {
		var drPayment = allPaymentTypes.find(function (pt) {
			return pt.methodID === eDepositingActionType.SafechargePPP;
		});

		if (!drPayment) {
			return allPaymentTypes;
		}

		return allPaymentTypes.filter(function (pt) {
			return pt.methodID !== eDepositingActionType.Regular;
		});
	};

	var checkMissingCustomerInformation = function () {
		if (Customer.prop.hasMissingInformation) {
			ko.postbox.publish("trading-event", "agreement-view");
			ViewsManager.ChangeViewState(eViewTypes.vMissingCustomerInformation, eViewState.Start);
		} else {
			ViewsManager.ChangeViewState(eViewTypes.vMissingCustomerInformation, eViewState.Stop);
		}
	};

	var onCustomerSuccessfullUpdate = function () {
		ko.postbox.publish("trading-event", "agreement-success");
		ViewsManager.ChangeViewState(eViewTypes.vMissingCustomerInformation, eViewState.Stop);
	};

	return {
		Stop: resetObjects,
		ShowSelectedBehavior: paymentSelectedChanged,
		GetDefaultInstructions: getDefaultInstructions,
		FilterAvailablePayments: filterAvailablePayments,
		CheckMissingCustomerInformation: checkMissingCustomerInformation,
		OnCustomerSuccessfullUpdate: onCustomerSuccessfullUpdate,
		CloseMissingDetailsDialog: function () {},
	};
});
