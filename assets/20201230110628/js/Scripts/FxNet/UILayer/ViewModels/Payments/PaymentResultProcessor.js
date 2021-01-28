/* globals eDepositEngineStatus, eClearingStatus, eDepositMessageTypes, cDepositMessageKeys, DepositMessagesManager  General*/
define("viewmodels/Payments/PaymentResultProcessor", [
	"require",
	"knockout",
	"handlers/general",
	"JSONHelper",
	"managers/CustomerProfileManager",
	"devicemanagers/StatesManager",
	"devicemanagers/AlertsManager",
	"devicemanagers/ViewModelsManager",
	"initdatamanagers/SymbolsManager",
	"deposit/DepositMessagesManager",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		JSONHelper = require("JSONHelper"),
		CustomerProfileManager = require("managers/CustomerProfileManager"),
		StatesManager = require("devicemanagers/StatesManager"),
		AlertsManager = require("devicemanagers/AlertsManager"),
		ViewModelsManager = require("devicemanagers/ViewModelsManager"),
		SymbolsManager = require("initdatamanagers/SymbolsManager"),
		DepositMessagesManager = require("deposit/DepositMessagesManager");

	var PaymentResultProcessor = function (customSettings, resultProcessedCallback, req) {
		var currRequest = req,
			settings = customSettings;

		function processPaymentResponse(responseText, forcedDeposit) {
			var response = JSONHelper.STR2JSON("PaymentResultProcessor/processPaymentResponse", responseText).result;
			var engineStatus = response[eDepositResponse.EngineStatusID];
			var undefinedVar;

			var messageType = eDepositMessageTypes.none;
			var redirectToView = null;

			switch (engineStatus) {
				case eDepositEngineStatus.Failed:
					if (
						response[eDepositResponse.ClearingStatusID] ===
						eClearingStatus.FailedOnMoneybookersRequestCanceled
					)
						messageType = eDepositMessageTypes.moneyBookersDepositRequestCancelled;
					else if (
						response[eDepositResponse.ValidationStatusID] ===
						eDepositValidationStatus.TransactionCancelledByUser
					)
						messageType = eDepositMessageTypes.cancelledByUser;
					else if (
						response[eDepositResponse.ValidationStatusID] === eDepositValidationStatus.RefundableClearer
					)
						messageType = eDepositMessageTypes.refundableClearer;
					else if (forcedDeposit)
						messageType = DepositMessagesManager.getMessageTypeForValidationStatusId(
							response[eDepositResponse.ValidationStatusID]
						);
					else messageType = eDepositMessageTypes.depositFailed;

					ko.postbox.publish("deposit-failed");
					break;

				case eDepositEngineStatus.Finished:
				case eDepositEngineStatus.CCStored:
					CustomerProfileManager.ProfileCustomer().lastSelectedCategory = undefinedVar;
					CustomerProfileManager.ProfileCustomer().lastSelectedPaymentMethodCountry = undefinedVar;

					messageType = eDepositMessageTypes.succeeded;

					redirectToView = shouldRedirectToClientQuestionnaire()
						? eForms.ClientQuestionnaire
						: settings.formToDisplayForSuccessfulPayments;

					break;

				default:
					messageType = eDepositMessageTypes.pendingDepositRequest;
					redirectToView = settings.formToDisplayForPendingPayments;
					break;
			}

			if (forcedDeposit) {
				handleDepositResponseForcedDeposit(messageType, response);
			} else {
				handleDepositResponse(messageType, response, redirectToView);
			}
		}

		function shouldRedirectToClientQuestionnaire() {
			return (
				StatesManager.States.IsTradingBonusGoingToCDDAfterDeposit() === true ||
				StatesManager.States.IsCddStatusNotComplete() === true ||
				StatesManager.States.IsKycStatusRequired() === true ||
				StatesManager.States.IsKycReviewStatusRequired() === true
			);
		}

		function onDepositPaymentStatusTimeout() {
			handleDepositResponse(
				eDepositMessageTypes.pendingDepositRequest,
				{},
				settings.formToDisplayForPendingPayments
			);
		}

		function closePopup() {
			if (!window.paymentsPopup) {
				if (window.external && window.external.CloseHostForm) {
					window.external.CloseHostForm();
				}

				return;
			}

			if (window.paymentsPopup.Close) {
				window.paymentsPopup.Close();
			}

			window.paymentsPopup = null;
		}

		function handleDepositResponse(messageType, response, redirectToView) {
			var messageData = {};

			var depositMessageWrapper = getDepositMessageWrapperAndMessageData(messageType, messageData, response);

			var params = { redirectToView: redirectToView };
			if (shouldRedirectToNextView(messageType)) {
				var viewToShow = customSettings.formToDisplayForPendingPayments;

				if (messageType === eDepositMessageTypes.succeeded) {
					viewToShow = customSettings.formToDisplayForSuccessfulPayments;
					var redirectData = {};

					if (shouldRedirectToClientQuestionnaire()) {
						redirectData = { redirectToView: eForms.ClientQuestionnaire };
					}

					messageData = Object.assign({}, messageData, redirectData);
				}

				switchToView(viewToShow, messageData);
			} else {
				showDepositResponse(depositMessageWrapper, params);
			}

			resultProcessedCallback(currRequest);
			closePopup();
		}

		function getDepositMessageWrapperAndMessageData(messageType, messageData, response) {
			messageData.messageDetails = response[eDepositResponse.MessageDetails];
			messageData.currency =
				currRequest.depositCurrencyName || SymbolsManager.GetTranslatedSymbolById(currRequest.depositCurrency);
			messageData.depositPaymentLast4 = response[eDepositResponse.Last4];
			messageData.amount = currRequest.amount;
			messageData.confirmationCode = response[eDepositResponse.ConfirmationCode];
			messageData.transactionDescriptor = response[eDepositResponse.TransactionDescriptor];
			messageData.baseClearerTypeId = response[eDepositResponse.BaseClearerTypeId];

			var depositMessageWrapper = DepositMessagesManager.getDepositMessageWrapper(messageType, messageData);

			if (general.isArrayType(depositMessageWrapper.messages) && depositMessageWrapper.messages.length > 0) {
				Object.assign(messageData, { depositMessages: depositMessageWrapper.messages });
			}

			return depositMessageWrapper;
		}

		function handleDepositResponseForcedDeposit(messageType, response) {
			var messageData = {};

			var depositMessageWrapper = getDepositMessageWrapperAndMessageData(messageType, messageData, response);

			if (messageType === eDepositMessageTypes.succeeded) {
				if (depositMessageWrapper.message) {
					messageData.depositMessages = [depositMessageWrapper.message];
				}

				currRequest.succeeded = 1;
			} else {
				showDepositResponse(depositMessageWrapper, {});
			}

			currRequest.depositMessages = messageData.depositMessages;
			resultProcessedCallback(currRequest);
		}

		function shouldRedirectToNextView(messageType) {
			return (
				messageType === eDepositMessageTypes.pendingDepositRequest ||
				messageType === eDepositMessageTypes.requestPended ||
				messageType === eDepositMessageTypes.succeeded
			);
		}

		function showDepositResponse(depositMessageWrapper, params) {
			AlertsManager.UpdateAlert(
				AlertTypes.ServerResponseAlert,
				depositMessageWrapper.title,
				depositMessageWrapper.message,
				depositMessageWrapper.messages || "",
				params
			);
			AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
		}

		function preventViewSwitchDueToCustomerActivation() {
			var showAlerts = 1;

			require(["StateObject!PostLoginAlerts"], function (postLoginAlerts) {
				postLoginAlerts.set("SetAlertsBehaviorMode", showAlerts);
			});
		}

		function switchToView(redirectToView, params) {
			preventViewSwitchDueToCustomerActivation();
			ViewModelsManager.VManager.SwitchViewVisible(redirectToView, params);
		}

		return {
			ProcessPaymentFinalResponse: processPaymentResponse,
			OnDepositPaymentStatusTimeout: onDepositPaymentStatusTimeout,
		};
	};

	return PaymentResultProcessor;
});
