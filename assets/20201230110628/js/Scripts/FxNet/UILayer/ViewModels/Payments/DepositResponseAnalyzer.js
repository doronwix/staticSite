/*globals eDepositEngineStatus, eDepositMessageTypes, eDepositingRequest3DSecureStatus*/
define(
    "viewmodels/payments/DepositResponseAnalyzer",
    [
        'handlers/general',
        'deposit/DepositMessagesManager'
    ],
    function DepositResponseAnalyzerClass(general, DepositMessagesManager) {
        function isValidDeposit(responseJson) {
            return responseJson[eDepositResponse.ValidationStatusID] === eDepositValidationStatus.Valid;
        }

        function isSuccessfulDeposit(responseJson) {
            var engineStatusId = responseJson[eDepositResponse.EngineStatusID];

            return isValidDeposit(responseJson)
                && (engineStatusId === eDepositEngineStatus.Success
                    || engineStatusId === eDepositEngineStatus.CCStored
                    || engineStatusId === eDepositEngineStatus.Finished);
        }

        function analyzeSecureFlow(responseJson) {
            if (isSuccessfulDeposit(responseJson)) {
                return eDepositMessageTypes.none;
            }

            if (is3DSecureDeposit(responseJson)) {
                if (isCardEnrolled(responseJson)) {
                    var d3SecureURL = responseJson[eDepositResponse.D3SecureURL];
                    return general.isEmptyValue(d3SecureURL) ? eDepositMessageTypes.d3secureNotAllowed : eDepositMessageTypes.d3ProcessStarted;
                } else {
                    return notClearesSupporting3DSecure(responseJson) ?
                        eDepositMessageTypes.noSupportedClearers : eDepositMessageTypes.notEnrolledCard;
                }
            }

            return eDepositMessageTypes.none;
        }

        function isCardEnrolled(responseJson) {
            return responseJson[eDepositResponse.DepositingRequest3DSecureStatusID] === eDepositingRequest3DSecureStatus.Enrolled;
        }

        function notClearesSupporting3DSecure(responseJson) {
            return responseJson[eDepositResponse.DepositingRequest3DSecureStatusID] === eDepositingRequest3DSecureStatus.NoSupportedClearers;
        }

        function is3DSecureDeposit(responseJson) {
            return responseJson[eDepositResponse.CreditCardAuthenticationModeID] === ePaymentAuthMode.D3Secure;
        }

        function analyzeValidationStatus(responseJson) {
            return DepositMessagesManager.getMessageTypeForValidationStatusId(responseJson[eDepositResponse.ValidationStatusID]);
        }

        function analyzeClearingStatusID(responseJson) {
            return DepositMessagesManager.getMessageTypeForClearingStatusId(responseJson[eDepositResponse.ClearingStatusID]);
        }

        function analyzeDepositEngineStatusID(responseJson) {
            return DepositMessagesManager.getMessageTypeForDepositEngineStatusId(responseJson[eDepositResponse.EngineStatusID]);
        }

        function getMessageType(responseJson) {

            var messageType = eDepositMessageTypes.none;

            if (isValidDeposit(responseJson)) {
                messageType = analyzeSecureFlow(responseJson);
                if (messageType === eDepositMessageTypes.d3ProcessStarted) {
                    return messageType;
                }
            }

            if (!messageType) {
                messageType = analyzeValidationStatus(responseJson);
            }

            if (!messageType) {
                messageType = analyzeClearingStatusID(responseJson);
            }

            if (!messageType) {
                messageType = analyzeDepositEngineStatusID(responseJson);
            }

            return messageType;
        }

        return {
            GetMessageType: getMessageType,
            IsValidDeposit: isValidDeposit,
            IsSuccessfulDeposit: isSuccessfulDeposit
        };
    }
);