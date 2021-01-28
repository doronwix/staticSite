/*global eConfigContentValues*/
define("viewmodels/questionnaire/thankyou-client-questionnaire", [
	"require",
	"knockout",
	"handlers/general",
	"devicemanagers/StatesManager",
	"devicemanagers/ViewModelsManager",
	"cachemanagers/ClientStateHolderManager",
	"managers/historymanager",
	"Dictionary",
	"managers/PopUpManager",
	"initdatamanagers/Customer",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		StatesManager = require("devicemanagers/StatesManager"),
		ViewModelsManager = require("devicemanagers/ViewModelsManager"),
		Dictionary = require("Dictionary"),
		ClientStateHolderManager = require("cachemanagers/ClientStateHolderManager"),
		HistoryManager = require("managers/historymanager"),
		PopUpManager = require("managers/PopUpManager"),
		Customer = require("initdatamanagers/Customer");

	var self = {},
		equity,
		s = StatesManager.States;

	var init = function (params) {
		ClientStateHolderManager.OnChange.Add(onClientStateChange);
		self.isActiveAndDeposit =
			s.AmlStatus() == eAMLStatus.Approved &&
			(s.IsActive() || Customer.prop.customerType === eCustomerType.TradingBonus);

		if (self.isActiveAndDeposit) {
			self.title1 = "thankyou_title1";
			self.title2 = "thankyou_title2";
			self.title3 = self.title4 = "";
		} else {
			self.title1 = "thankyou_title1_aml_" + s.AmlStatus();
			self.title2 = "thankyou_title2_aml_" + s.AmlStatus();
			self.title3 = "thankyou_title3_aml_" + s.AmlStatus();
			self.title4 = "thankyou_title4_aml_" + s.AmlStatus();
		}

		if (self.isActiveAndDeposit) {
			self.showUploadDocuments = false;
			self.showReturnToSite = true;
			self.returnTxt = "thankyou_btnContinue";
		} else {
			self.showUploadDocuments =
				[eAMLStatus.Unverified, eAMLStatus.Restricted].contains(s.AmlStatus()) ||
				(eAMLStatus.Pending === s.AmlStatus() &&
					eConfigContentValues.True ===
						Dictionary.GetItem(
							"amlPendingShowUploadDocsInThankYouQuestionaire",
							"application_configuration",
							"0"
						));
			self.showReturnToSite = [eAMLStatus.Approved, eAMLStatus.Pending].contains(s.AmlStatus());
			self.returnTxt = "thankyou_btnReturn";
		}

		if (
			Dictionary.GetItem("preDepositRequired", "application_configuration", "0") === "1" ||
			Dictionary.GetItem("complianceFullPageBeforeDeposit", "application_configuration", "0") === "1"
		) {
			if (eAMLStatus.Restricted === s.AmlStatus()) {
				self.showUploadDocuments = true;
				self.showReturnToSite = false;
			} else {
				self.showUploadDocuments = false;
				self.showReturnToSite = true;
			}
		}

		self.goToUploadDocuments = goToUploadDocuments;
		self.goToSite = goToSite;
		self.dispose = dispose;
	};

	var goToUploadDocuments = function () {
		if (PopUpManager.IsPopupOpen()) {
			PopUpManager.ClosePopup();
		}

		ViewModelsManager.VManager.SwitchViewVisible(eForms.UploadDocuments);
	};

	var goToSite = function () {
		var args = ViewModelsManager.VManager.GetViewArgs(eViewTypes.vClientQuestionnaire);

		if (args && args.from) {
			// if from deposit
			if (args.from.form === eForms.Deposit) {
				ViewModelsManager.VManager.SwitchViewVisible(args.from.form, args.from.viewArgs);
				return;
			}

			// if from new transaction from web
			if (args.from.form === eForms.Deals) {

				require(["deviceviewmodels/ToolbarViewModel"], function (vmToolbar) {
					ViewModelsManager.VManager.SwitchViewVisible(Customer.prop.mainPage, {});
					// if new limit
					if (args.from.viewArgs.transactionType === eTransactionSwitcher.NewLimit) {
							vmToolbar.instance.NewLimitHandler(args.from.viewArgs);
							return;
					}

					// if new deal
					vmToolbar.instance.NewDealHandler(args.from.viewArgs);
					return;
				})
			} else {
				// mobile
				HistoryManager.Back();
				return;
			}
		} else {
			ko.postbox.publish("thankyou-continue-clicked");

			if (PopUpManager.IsPopupOpen()) {
				PopUpManager.ClosePopup();
				return;
			} else {
				if (!self.isActiveAndDeposit && !general.isNullOrUndefined(equity) && equity.toNumeric() <= 0) {
					ViewModelsManager.VManager.SwitchViewVisible(eForms.Deposit);
					return;
				}

				ViewModelsManager.VManager.SwitchViewVisible(Customer.prop.mainPage, {});
				return;
			}
		}
	};

	var onClientStateChange = function () {
		var csHolder = ClientStateHolderManager.CSHolder;
		equity = csHolder.equity;
	};

	var createViewModel = function (params) {
		init(params);
		return self;
	};

	var dispose = function () {
		ClientStateHolderManager.OnChange.Remove(onClientStateChange);
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
