/* globals eUploadDocumentType, eUploadDocumentStatus , eUserFlowSteps, eUserStatus, eStepStatus*/
define('userflow/UserFlowBroker3',
    [
        'require',
        'devicemanagers/StatesManager',
        "initdatamanagers/Customer",
        'modules/UserFlowCommon'
    ],
    function (require) {
        var StatesManager = require('devicemanagers/StatesManager'),
            customer = require("initdatamanagers/Customer"),
            commonFlow = require('modules/UserFlowCommon');

        var userFlowStepsStatuses,
            userStatus,
            userMessage,
            currentStep,
            ctaText,
            cta,
            activationRequired = false,
            state = StatesManager.States;

        var maxDaysCounter = 14;

        function computeFlow() {
            var generalInfoComplete, quizzPassed,
                daysCounter = -1,
                didFirstDeposit = false,
                UploadDocumentsAfterFirstDepositCountdown = state.UploadDocumentsAfterFirstDepositCountdown(),
                signAgreementCountdown = state.SignAgreementCountdown(),
                remainingDaysUpdateMsg;

            if (!commonFlow.isReady()) {
                return commonFlow.EMPTY_USER_FLOW; //Preventing update of 'false' data on StatesManager load
            }

            if (UploadDocumentsAfterFirstDepositCountdown && UploadDocumentsAfterFirstDepositCountdown > -1) {
                didFirstDeposit = true;
            }

            if (customer.prop.isSeamless) { //1
                userStatus = eUserStatus.NotActivated;
                userMessage = "registerToStartTarde";
                cta = eCta.Seamless;
                currentStep = eUserFlowSteps.OpenedAnAccount;
                ctaText = "registerNow";
                userFlowStepsStatuses = [
                    eStepStatus.Seamless, eStepStatus.NotActive, eStepStatus.Hidden,
                    eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                ];
            }
            else if (state.KycReviewStatus() === eKYCReviewStatus.Inappropriate) { //2
                userStatus = eUserStatus.Locked;
                userFlowStepsStatuses = [
                    eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Error,
                    eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                ];
                userMessage = "quizFailed";
                cta = eCta.ContactUs;
                currentStep = eUserFlowSteps.TradingKnowledgeQuiz;
                ctaText = "contactUs";
            }
            else if (state.KycReviewStatus() === eKYCReviewStatus.Unsuitable) { //2
                userStatus = eUserStatus.Locked;
                userFlowStepsStatuses = [
                    eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Error,
                    eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                ];
                userMessage = "unsuitable";
                cta = eCta.ContactUs;
                currentStep = eUserFlowSteps.TradingKnowledgeQuiz;
                ctaText = "contactUs";
            }
            else if (!commonFlow.isMinDepositGroupBlocked() && !commonFlow.isFraud()) { //3
                if (state.CddStatus() === eCDDStatus.NotComplete && state.KycStatus() === eKYCStatus.NotComplete) { //4
                    userStatus = eUserStatus.NotActivated;
                    userMessage = "activateToStartTarde";
                    cta = eCta.ClientQuestionnaire;
                    currentStep = eUserFlowSteps.GeneralInforamtionQuestionnaire;
                    ctaText = "activateYourAccount";
                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.Available, eStepStatus.Hidden,
                        eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                    ];
                }
                else if (state.CddStatus() !== eCDDStatus.NotComplete && state.IsKycReviewStatusRequired()) { //5
                    userStatus = eUserStatus.NotActivated;
                    userMessage = "quizToStartTarde";
                    cta = eCta.ClientQuestionnaire;
                    currentStep = eUserFlowSteps.TradingKnowledgeQuiz;
                    ctaText = "completeQuiz";
                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Available,
                        eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                    ];
                }
                else if (!state.IsActive() || (!state.IsActiveButNotSinceTradingBonus() && !didFirstDeposit)) { //6
                    userStatus = eUserStatus.ReadyToTrade;
                    userMessage = "fundAccount";
                    cta = eCta.Deposit;
                    currentStep = eUserFlowSteps.FundYourAccount;
                    ctaText = "fundTxt";
                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                        eStepStatus.Available, eStepStatus.Available, eStepStatus.NotActive
                    ];
                }
                else if (!(state.AmlStatus() !== eAMLStatus.Restricted && commonFlow.isOnlineTrading())) { //7
                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                        eStepStatus.Available, eStepStatus.Complete, eStepStatus.Restricted
                    ];
                    userStatus = eUserStatus.Restricted;
                    userMessage = "contactComplianceProgress";
                    ctaText = "contactUs";
                    cta = eCta.ContactUs;
                    currentStep = eUserFlowSteps.Trade;
                } else {
                    userMessage = "enjoyTrading";
                    cta = eCta.None;
                    ctaText = "";
                    if (state.AmlStatus() === eAMLStatus.Approved || state.AmlStatus() === eAMLStatus.NotRequired) { //8
                        userStatus = eUserStatus.Active;
                        currentStep = eUserFlowSteps.Trade;
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete
                        ];

                        if (state.AmlStatus() === eAMLStatus.NotRequired) {
                            state.docProofOfID(eUploadDocumentStatus.NotRequired);
                            state.docProofOfResidence(eUploadDocumentStatus.NotRequired);
                        }
                    } else {
                        userStatus = eUserStatus.ActiveLimited;
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Available, eStepStatus.Complete, eStepStatus.Complete
                        ];
                        currentStep = eUserFlowSteps.ProofOfIdentity;
                        if (state.docProofOfID() === eUploadDocumentStatus.Incomplete || state.docProofOfResidence() === eUploadDocumentStatus.Incomplete) { //9
                            cta = eCta.ContactUs;
                            ctaText = "contactUs";
                        } else {
                            if (state.docProofOfID() === eUploadDocumentStatus.AwaitingDocument || state.docProofOfResidence() === eUploadDocumentStatus.AwaitingDocument) { //10
                                userFlowStepsStatuses = [
                                    eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                                    eStepStatus.Available, eStepStatus.Complete, eStepStatus.Complete
                                ];
                                cta = eCta.UploadDocuments;
                                ctaText = "uploadDocuments";
                            } else if (state.docProofOfID() === eUploadDocumentStatus.Approved && state.docProofOfResidence() === eUploadDocumentStatus.Approved) { //11
                                userFlowStepsStatuses = [
                                    eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                                    eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete
                                ];
                                cta = eCta.ContactUs;
                                ctaText = "contactUs";
                            }
                        }
                    }
                }
            }
            else if (state.AmlStatus() !== eAMLStatus.Restricted && !commonFlow.isFraud() && commonFlow.isOnlineTrading()) { //12
                userFlowStepsStatuses = [
                    eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                    eStepStatus.Available, eStepStatus.Restricted, eStepStatus.NotActive
                ];
                userStatus = eUserStatus.Restricted;
                userMessage = "contactComplianceProgress";
                cta = eCta.ContactUs;
                currentStep = eUserFlowSteps.FundYourAccount;
                ctaText = "contactUs";
            } else {
                userStatus = eUserStatus.Locked;
                if (state.docProofOfID() === eUploadDocumentStatus.Incomplete || state.docProofOfResidence() === eUploadDocumentStatus.Incomplete) { //13
                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                        eStepStatus.Complete, eStepStatus.Error, eStepStatus.NotActive
                    ];
                    userMessage = "contactComplianceActivation";
                    cta = eCta.ContactUs;
                    currentStep = eUserFlowSteps.FundYourAccount;
                    ctaText = "contactUs";
                } else if (state.docProofOfID() === eUploadDocumentStatus.AwaitingDocument || state.docProofOfResidence() === eUploadDocumentStatus.AwaitingDocument) { //15
                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                        eStepStatus.Available, eStepStatus.NotActive, eStepStatus.NotActive
                    ];
                    userMessage = "accountBlockedDocuments";
                    cta = eCta.UploadDocuments;
                    currentStep = eUserFlowSteps.ProofOfIdentity;
                    ctaText = "uploadDocuments";
                } else { //14
                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                        eStepStatus.Complete, eStepStatus.Error, eStepStatus.NotActive
                    ];
                    userMessage = "contactComplianceActivation";
                    cta = eCta.ContactUs;
                    currentStep = eUserFlowSteps.FundYourAccount;
                    ctaText = "contactUs";
                }
            }
            // Is Quiz hidden
            if ((state.KycStatus() !== eKYCStatus.Failed && state.KycStatus() !== eKYCStatus.FailedAware)
                || (state.IsQuizPassed() === false && state.KycStatus() !== eKYCStatus.Failed)
                || state.KycReviewStatus() === eKYCReviewStatus.Unsuitable) {
                userFlowStepsStatuses[eUserFlowSteps.TradingKnowledgeQuiz] = eStepStatus.Hidden;
            }

            generalInfoComplete = userFlowStepsStatuses[eUserFlowSteps.GeneralInforamtionQuestionnaire] === eStepStatus.Complete;
            quizzPassed = [eStepStatus.Hidden, eStepStatus.Complete].contains(userFlowStepsStatuses[eUserFlowSteps.TradingKnowledgeQuiz]);
            if (generalInfoComplete && quizzPassed) {
                userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Available;
                if (state.AmlStatus() === eAMLStatus.Approved) {
                    userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
                    currentStep = currentStep === eUserFlowSteps.ProofOfIdentity ? eUserFlowSteps.None : currentStep;
                }
            }

            // Set Counter && message for Countdown
            if (userStatus !== eUserStatus.Locked &&
                state.AmlStatus() === eAMLStatus.Pending &&
                signAgreementCountdown &&
                signAgreementCountdown > -1 &&
                signAgreementCountdown <= maxDaysCounter) {
                daysCounter = signAgreementCountdown;
                remainingDaysUpdateMsg = 'daysCounterMsg';
            }

            if (!state.IsCddOrKycRequired()) {
                userFlowStepsStatuses[eUserFlowSteps.GeneralInforamtionQuestionnaire] = eStepStatus.NotActive;
            }
            activationRequired = !(state.IsActive() || customer.prop.customerType === eCustomerType.TradingBonus) && !customer.prop.isDemo;

            return {
                documentProofOfResidenceStatus: state.docProofOfResidence(),
                documentProofOfIDStatus: state.docProofOfID(),
                currentStep: currentStep,
                userStatus: userStatus,
                daysCounter: daysCounter,
                maxDaysCounter: maxDaysCounter,
                userMessage: userMessage,
                ctaText: ctaText,
                cta: cta,
                userFlowStepsStatuses: userFlowStepsStatuses,
                activationRequired: activationRequired,
                remainingDaysUpdateMsg: remainingDaysUpdateMsg
            };
        }

        return computeFlow;
    });