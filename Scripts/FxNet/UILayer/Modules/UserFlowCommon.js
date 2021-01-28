define(
    'modules/UserFlowCommon',
    [
        'require',
        'devicemanagers/StatesManager'
    ],
    function UserFlowCommonDef(require) {
        var StatesManager = require('devicemanagers/StatesManager');

        var BLOCK_DEPOSITS = 103,
            FRAUD_FOLDER = 51;

        var UserFlowCommon = function UserFlowCommonClass() {
            var SMState = StatesManager.States;

            var EMPTY_USER_FLOW = {
                ctaText: '',
                documentProofOfResidenceStatus: null,
                documentProofOfIDStatus: null,
                currentStep: null,
                userStatus: eUserStatus.NA,
                daysCounter: 0,
                maxDaysCounter: 0,
                userMessage: '',
                cta: eCta.None,
                userFlowStepsStatuses: null,
                activationRequired: false
            };

            function isReady() {
                return !(!SMState.IsActive || SMState.IsActive() === -1 || SMState.AmlStatus() === -1 || SMState.KycReviewStatus() === -1 || SMState.KycStatus() === -1
                    || SMState.fxDenied() === -1 || SMState.Folder() === -1 || SMState.minDepositGroup() === -1);
            }

            function isFraud() {
                return SMState.Folder() === FRAUD_FOLDER;
            }

            function isMinDepositGroupBlocked() {
                return SMState.minDepositGroup() === BLOCK_DEPOSITS;
            }

            function isOnlineTrading() {
                return SMState.fxDenied() === false;
            }

            return {
                isReady: isReady,
                isMinDepositGroupBlocked: isMinDepositGroupBlocked,
                isFraud: isFraud,
                isOnlineTrading: isOnlineTrading,
                EMPTY_USER_FLOW: EMPTY_USER_FLOW
            };
        };

        return new UserFlowCommon();
    }
);
