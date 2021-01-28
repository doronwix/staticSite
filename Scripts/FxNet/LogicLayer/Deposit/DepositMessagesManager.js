/* globals eDepositMessageTypes, cDepositMessageKeys, cDepositMessageKeyPrefixes, cDepositMessageTitleKeys, eClearingStatus, eDepositEngineStatus, */
define([
	"require",
	"handlers/general",
	"initdatamanagers/Customer",
	"Dictionary",
	"enums/DepositWithdrawalEnums",
	"enums/DataMembersPositions",
	"constsenums/depositconstants",
], function DepositMessagesManagerDef(require) {
	var general = require("handlers/general"),
		customer = require("initdatamanagers/Customer"),
		dictionary = require("Dictionary");

	var depositKeysByMessageType = [], // [{ messageKey: undefined, messageKeyPrefix: undefined, titleKey: undefined }]
		depositMessageTypeByValidationStatusId = [],
		depositMessageTypeByDepositEngineStatusId = [],
		depositMessageTypeByClearingStatusId = [];

	function init() {
		depositKeysByMessageType[eDepositMessageTypes.none] = null;
		depositKeysByMessageType[eDepositMessageTypes.confirmation] = { messageKey: cDepositMessageKeys.confirmation };
		depositKeysByMessageType[eDepositMessageTypes.succeeded] = {
			messageKey: cDepositMessageKeys.succeeded,
			titleKey: cDepositMessageKeys.succeededTitle,
		};
		depositKeysByMessageType[eDepositMessageTypes.changeGeneratedPasswordAfterFirstDeposit] = {
			messageKey: cDepositMessageKeys.changeGeneratedPasswordAfterFirstDeposit,
		};
		depositKeysByMessageType[eDepositMessageTypes.minDeposit] = {
			messageKey: cDepositMessageKeys.minDeposit,
			titleKey: cDepositMessageTitleKeys.failedDepositMinimumDeposit,
		};
		depositKeysByMessageType[eDepositMessageTypes.maxDeposit] = { messageKey: cDepositMessageKeys.maxDeposit };
		depositKeysByMessageType[eDepositMessageTypes.clearerMaxRangeDeposit] = {
			messageKey: cDepositMessageKeys.clearerMaxRangeDeposit,
		};
		depositKeysByMessageType[eDepositMessageTypes.maxCCAllowed] = { messageKey: cDepositMessageKeys.maxCCAllowed };
		depositKeysByMessageType[eDepositMessageTypes.invalidCardType] = {
			messageKey: cDepositMessageKeys.invalidCardType,
			titleKey: cDepositMessageTitleKeys.failedDepositDoubleCheck,
		};
		depositKeysByMessageType[eDepositMessageTypes.refundableClearer] = {
			messageKey: cDepositMessageKeys.refundableClearer,
		};
		depositKeysByMessageType[eDepositMessageTypes.minMaxBlocked] = {
			messageKey: cDepositMessageKeys.minMaxBlocked,
		};
		depositKeysByMessageType[eDepositMessageTypes.maxCardTypeUSDAmount] = {
			messageKey: cDepositMessageKeys.maxCardTypeUSDAmount,
		};
		depositKeysByMessageType[eDepositMessageTypes.creditCardExpired] = {
			messageKey: cDepositMessageKeys.creditCardExpired,
			titleKey: cDepositMessageTitleKeys.failedDepositExpiryDate,
		};
		depositKeysByMessageType[eDepositMessageTypes.whiteListValidation] = {
			messageKey: cDepositMessageKeys.whiteListValidation,
		};
		depositKeysByMessageType[eDepositMessageTypes.meikoPayMaxAmount] = {
			messageKey: cDepositMessageKeys.meikoPayMaxAmount,
		};
		depositKeysByMessageType[eDepositMessageTypes.depositFailed] = {
			messageKey: cDepositMessageKeys.depositFailed,
		};
		depositKeysByMessageType[eDepositMessageTypes.requestPended] = {
			messageKey: cDepositMessageKeys.requestPended,
		};
		depositKeysByMessageType[eDepositMessageTypes.unableProcessRequest] = {
			messageKey: cDepositMessageKeys.unableProcessRequest,
		};
		depositKeysByMessageType[eDepositMessageTypes.unsupportedCardType] = {
			messageKey: cDepositMessageKeys.unsupportedCardType,
		};
		depositKeysByMessageType[eDepositMessageTypes.d3secureNotAllowed] = {
			messageKey: cDepositMessageKeys.d3secureNotAllowed,
		};
		depositKeysByMessageType[eDepositMessageTypes.noSupportedClearers] = {
			messageKey: cDepositMessageKeys.noSupportedClearers,
		};
		depositKeysByMessageType[eDepositMessageTypes.notEnrolledCard] = {
			messageKey: cDepositMessageKeys.notEnrolledCard,
		};
		depositKeysByMessageType[eDepositMessageTypes.notice3DSecureDeposit] = {
			messageKey: cDepositMessageKeys.notice3DSecureDeposit,
		};
		depositKeysByMessageType[eDepositMessageTypes.d3SecureMissed] = {
			messageKey: cDepositMessageKeys.d3SecureMissed,
		};
		depositKeysByMessageType[eDepositMessageTypes.removeCCMessage] = {
			messageKey: cDepositMessageKeys.removeCCMessage,
		};
		depositKeysByMessageType[eDepositMessageTypes.serverError] = { messageKey: cDepositMessageKeys.serverError };
		depositKeysByMessageType[eDepositMessageTypes.moneyBookersDepositRequestCancelled] = {
			messageKey: cDepositMessageKeys.moneyBookersDepositRequestCancelled,
		};
		depositKeysByMessageType[eDepositMessageTypes.cancelledByUser] = {
			messageKey: cDepositMessageKeys.cancelledByUser,
		};
		depositKeysByMessageType[eDepositMessageTypes.pendingDepositRequest] = {
			messageKey: cDepositMessageKeys.pendingDepositRequest,
		};

		depositKeysByMessageType[eDepositMessageTypes.succeededAdditionalWithDescriptor] = {
			messageKeyPrefix: cDepositMessageKeyPrefixes.succeededAdditionalWithDescriptor,
		};
		depositKeysByMessageType[eDepositMessageTypes.succeededAdditional] = {
			messageKeyPrefix: cDepositMessageKeyPrefixes.succeededAdditional,
		};
		depositKeysByMessageType[eDepositMessageTypes.ccBinCountryBlacklistWithCountryId] = {
			messageKeyPrefix: cDepositMessageKeyPrefixes.ccBinCountryBlacklistWithCountryId,
			titleKey: cDepositMessageTitleKeys.failedDepositSorry,
		};

		depositMessageTypeByValidationStatusId[eDepositValidationStatus.Valid] = eDepositMessageTypes.none;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.MinDeposit] = eDepositMessageTypes.minDeposit;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.MaxDeposit] = eDepositMessageTypes.maxDeposit;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.DepositRangeValidationFailed] =
			eDepositMessageTypes.clearerMaxRangeDeposit;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.MaxCCReached] =
			eDepositMessageTypes.maxCCAllowed;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.InvalidCardType] =
			eDepositMessageTypes.invalidCardType;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.RefundableClearer] =
			eDepositMessageTypes.refundableClearer;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.ExceededLimit] =
			eDepositMessageTypes.showAmlPending;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.MinMaxDepositBlocked] =
			eDepositMessageTypes.minMaxBlocked;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.CCBinCountryBlacklist] =
			eDepositMessageTypes.ccBinCountryBlacklistWithCountryId;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.MeikoPayMaxAmount] =
			eDepositMessageTypes.meikoPayMaxAmount;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.MaxCardTypeUSDAmount] =
			eDepositMessageTypes.maxCardTypeUSDAmount;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.ShowAdditionalPaymentOnFailedDeposit] =
			eDepositMessageTypes.showAdditionalPaymentOnFailedDeposit;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.WhiteList] =
			eDepositMessageTypes.whiteListValidation;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.TransactionCancelledByUser] =
			eDepositMessageTypes.cancelledByUser;
		depositMessageTypeByValidationStatusId[eDepositValidationStatus.CreditCardExpired] =
			eDepositMessageTypes.creditCardExpired;

		depositMessageTypeByDepositEngineStatusId[eDepositEngineStatus.Failed] = eDepositMessageTypes.depositFailed;
		depositMessageTypeByDepositEngineStatusId[eDepositEngineStatus.Success] = eDepositMessageTypes.succeeded;
		depositMessageTypeByDepositEngineStatusId[eDepositEngineStatus.CCStored] = eDepositMessageTypes.succeeded;
		depositMessageTypeByDepositEngineStatusId[eDepositEngineStatus.Finished] = eDepositMessageTypes.succeeded;
		depositMessageTypeByDepositEngineStatusId[eDepositEngineStatus.Pending] = eDepositMessageTypes.requestPended;

		depositMessageTypeByClearingStatusId[eClearingStatus.TransactionApproved] = eDepositMessageTypes.none;
		depositMessageTypeByClearingStatusId[eClearingStatus.FailedOn3DMissing] = eDepositMessageTypes.d3SecureMissed;
		depositMessageTypeByClearingStatusId[eClearingStatus.FailedOnMoneybookersRequestCanceled] =
			eDepositMessageTypes.moneyBookersDepositRequestCancelled;
	}

	function getDepositMessageWrapper(messageType, messageData) {
		var message = getMessage(messageType, messageData);

		return {
			messages: general.isObjectType(message) ? message.messages : "",
			message: general.isStringType(message) ? message : message.message,
			title: getTitle(messageType, messageData),
		};
	}

	function getMessage(messageType, messageData) {
		var messageDetails = messageData.messageDetails;
		var currency = messageData.currency;

		switch (messageType) {
			case eDepositMessageTypes.minDeposit:
			case eDepositMessageTypes.maxDeposit:
				return String.format(
					dictionary.GetItem(depositKeysByMessageType[messageType].messageKey),
					messageDetails,
					currency
				);

			case eDepositMessageTypes.clearerMaxRangeDeposit:
				return String.format(
					dictionary.GetItem(depositKeysByMessageType[messageType].messageKey),
					messageDetails,
					currency
				);

			case eDepositMessageTypes.ccBinCountryBlacklistWithCountryId:
				return dictionary.GetItem(depositKeysByMessageType[messageType].messageKeyPrefix + messageDetails);

			case eDepositMessageTypes.creditCardExpired:
			case eDepositMessageTypes.maxCardTypeUSDAmount:
				return String.format(
					dictionary.GetItem(depositKeysByMessageType[messageType].messageKey),
					messageDetails
				);

			case eDepositMessageTypes.showAdditionalPaymentOnFailedDeposit:
				return dictionary.GetItem(messageDetails);

			case eDepositMessageTypes.succeeded:
			case eDepositMessageTypes.confirmation:
				return getSuccessMessage(messageData);

			default:
				return dictionary.GetItem(depositKeysByMessageType[messageType].messageKey);
		}
	}

	function getTitle(messageType, messageData) {
		messageData = messageData || {};
		var clearerTypeId = messageData.baseClearerTypeId;

		if (depositKeysByMessageType[messageType] && depositKeysByMessageType[messageType].titleKey) {
			var titleKey = depositKeysByMessageType[messageType].titleKey;

			if (clearerTypeId) {
				var specificTitleKey = titleKey + "_" + clearerTypeId;

				if (!dictionary.ValueIsEmpty(specificTitleKey)) {
					return dictionary.GetItem(specificTitleKey);
				}
			}

			var translated =
				dictionary.GetItem(titleKey, "dialogsTitles", " ") !== " "
					? dictionary.GetItem(titleKey, "dialogsTitles", " ")
					: dictionary.GetItem(titleKey);
			return translated;
		} else {
			return null;
		}
	}

	function getMessageTypeForValidationStatusId(validationStatusId) {
		if (!general.isNullOrUndefined(depositMessageTypeByValidationStatusId[validationStatusId])) {
			return depositMessageTypeByValidationStatusId[validationStatusId];
		} else {
			return eDepositMessageTypes.depositFailed;
		}
	}

	function getMessageTypeForDepositEngineStatusId(depositEngineStatusId) {
		if (!general.isNullOrUndefined(depositMessageTypeByDepositEngineStatusId[depositEngineStatusId])) {
			return depositMessageTypeByDepositEngineStatusId[depositEngineStatusId];
		} else {
			return eDepositMessageTypes.unableProcessRequest;
		}
	}

	function getMessageTypeForClearingStatusId(clearingStatusId) {
		if (!general.isNullOrUndefined(depositMessageTypeByClearingStatusId[clearingStatusId])) {
			return depositMessageTypeByClearingStatusId[clearingStatusId];
		} else {
			return eDepositMessageTypes.depositFailed;
		}
	}

	function getSuccessMessage(messageData) {
		var confirmationCode = messageData.confirmationCode;
		var currency = messageData.currency;
		var amount = messageData.amount;

		var message;
		if (confirmationCode) {
			message = String.format(
				dictionary.GetItem(cDepositMessageKeys.confirmation),
				amount,
				currency,
				confirmationCode
			);
		} else {
			message = String.format(dictionary.GetItem(cDepositMessageKeys.succeeded), amount, currency);
		}
		var msg,
			additionalMessages = [];

		msg = getAdditionalSuccessMessage(messageData);
		if (msg) {
			additionalMessages.push(msg);
		}

		msg = getAdditionalChangePasswordMessage();
		if (msg) {
			additionalMessages.push(msg);
		}

		return {
			message: message,
			messages: additionalMessages,
		};
	}

	function getAdditionalChangePasswordMessage() {
		if (customer && customer.prop && customer.prop.showSuggestionChangePassword) {
			if (!dictionary.ValueIsEmpty(cDepositMessageKeys.changeGeneratedPasswordAfterFirstDeposit)) {
				return dictionary.GetItem(cDepositMessageKeys.changeGeneratedPasswordAfterFirstDeposit);
			}
		}

		return "";
	}

	function getAdditionalSuccessMessage(messageData) {
		var baseClearerTypeId = messageData.baseClearerTypeId;
		var transactionDescriptor = messageData.transactionDescriptor;

		if (!baseClearerTypeId) {
			return "";
		}

		var contentKey;
		if (transactionDescriptor) {
			contentKey = cDepositMessageKeyPrefixes.succeededAdditionalWithDescriptor + baseClearerTypeId;
		} else {
			contentKey = cDepositMessageKeyPrefixes.succeededAdditional + baseClearerTypeId;
		}

		if (!dictionary.ValueIsEmpty(contentKey)) {
			return String.format(dictionary.GetItem(contentKey), transactionDescriptor);
		}

		return "";
	}

	init();

	return {
		getMessageTypeForValidationStatusId: getMessageTypeForValidationStatusId,
		getMessageTypeForDepositEngineStatusId: getMessageTypeForDepositEngineStatusId,
		getMessageTypeForClearingStatusId: getMessageTypeForClearingStatusId,
		getDepositMessageWrapper: getDepositMessageWrapper,
	};
});
