/* globals eDepositMessageTypes */
define([
	"require",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"StateObject!PaymentType",
	"StateObject!PostLoginAlerts",
	"managers/viewsmanager",
	"global/UrlResolver",
	"devicemanagers/StatesManager",
	"devicemanagers/ViewModelsManager",
	"configuration/initconfiguration",
], function (require) {
	var general = require("handlers/general"),
		customer = require("initdatamanagers/Customer"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		viewsManager = require("managers/viewsmanager"),
		urlResolver = require("global/UrlResolver"),
		paymentTypeStateObject = require("StateObject!PaymentType"),
		postLoginAlerts = require("StateObject!PostLoginAlerts"),
		statesManager = require("devicemanagers/StatesManager"),
		viewModelsManager = require("devicemanagers/ViewModelsManager"),
		thankYouConfiguration = require("configuration/initconfiguration").ThankYouConfiguration;

	var ThankYouViewModel = general.extendClass(KoComponentViewModel, function ThankYouViewModel() {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data, // inherited from KoComponentViewModel
			vmType;

		function init(customSettings) {
			parent.init.call(self, customSettings); // inherited from KoComponentViewModel
			vmType = customSettings.type;
			data.depositAmount = "0";

			if (!customSettings.data || !paymentTypeStateObject.get(vmType)) {
				viewsManager.RedirectToURL(urlResolver.getRedirectUrl("Deals"));
				return;
			}

			setInitialData(customSettings);
			setComputables();
		}

		function setInitialData(depositInfo) {
			var paymentTypeInfo = paymentTypeStateObject.get(vmType);

			data.depositData = depositInfo.data;
			data.depositCurrency = depositInfo.data.currency;
			data.depositAmount = depositInfo.data.amount;
			data.depositConfirmationCode = depositInfo.data.confirmationCode;
			data.depositPaymentLast4 = depositInfo.data.depositPaymentLast4;
			data.originalPaymentName = paymentTypeInfo.originalPaymentName;
			data.isCCDeposit = depositInfo.data.isCCDeposit;
			data.paymentTypeId = paymentTypeInfo ? paymentTypeInfo.paymentType : -1;
			data.depositMessages = depositInfo.data.depositMessages;
			data.shouldShowChangePassword = customer.prop.showSuggestionChangePassword;
			data.signAgreementDate = customer.prop.signAgreementDate
				? customer.prop.signAgreementDate
				: statesManager.States.signAgreementDate()
				? statesManager.States.signAgreementDate()
				: null;
			data.countDownDays =
				data.signAgreementDate === null
					? -1
					: 14 - Math.floor((new Date().getTime() - data.signAgreementDate.getTime()) / (1000 * 3600 * 24));
		}

		function isCustomerBroker(brokerId) {
			return brokerId === customer.prop.brokerID;
		}

		function setComputables() {
			data.shouldShowAmlNotice = self.createComputed(function () {
				return (
					thankYouConfiguration.brokersThatShouldShowAmlNotice.some(isCustomerBroker) &&
					general.isDefinedType(data.signAgreementDate) &&
					data.countDownDays >= 0 &&
					statesManager.States.AmlStatus() === eAMLStatus.Pending
				);
			});

			data.shouldShowCddNotice = self.createComputed(function () {
				return statesManager.States.CddStatus() === eCDDStatus.NotComplete;
			});

			data.shouldShowKycNotice = self.createComputed(function () {
				return statesManager.States.KycStatus() === eKYCStatus.NotComplete;
			});

			data.existsNoticesToShow = self.createComputed(function () {
				return (
					data.shouldShowCddNotice() ||
					data.shouldShowKycNotice() ||
					data.shouldShowChangePassword ||
					data.shouldShowAmlNotice()
				);
			});
		}

		function disablePostLoginAlerts() {
			var doNotShowAlerts = 0;
			postLoginAlerts.update("SetAlertsBehaviorMode", doNotShowAlerts);
		}

		function onContinue() {
			disablePostLoginAlerts();
			viewModelsManager.VManager.SwitchViewVisible(
				data.depositData.redirectToView || eForms.Deals || eForms.Quotes
			);
		}

		function dispose() {
			paymentTypeStateObject.unset(vmType);
			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		return {
			Data: data,
			onContinue: onContinue,
			init: init,
			dispose: dispose,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new ThankYouViewModel();
		viewModel.init(params || {});

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
