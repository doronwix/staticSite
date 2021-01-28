/* globals eUploadDocumentType, eUploadDocumentStatus , eUserFlowSteps, eUserStatus, eStepStatus*/
define('userflow/UserFlowBroker33',
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

        var SMState = StatesManager.States;

        var DAYS_COUNTER = -1,
            MAX_DAYS_COUNTER = 14;

        var userFlowStepsStatuses,
            userStatus,
            userMessage,
            currentStep,
            ctaText,
            cta,
            activationRequired = false;
 
        function computeFlow() {
            if (!commonFlow.isReady()) {
                return commonFlow.EMPTY_USER_FLOW;
            }

            var foundInList = function (value, arrToMatch) {
                return arrToMatch.indexOf(value) !== -1;
            };

            var AMLStatus = SMState.AmlStatus(),
                CDDStatus = SMState.CddStatus(),
                KYCStatus = SMState.KycStatus(),
                KYCRevStatus = SMState.KycReviewStatus(),
                DOCPoid = SMState.docProofOfID(),
                DOCPores = SMState.docProofOfResidence(),
                DOCWaiting = DOCPoid === eUploadDocumentStatus.AwaitingDocument || DOCPores === eUploadDocumentStatus.AwaitingDocument,
                DOCApproved = DOCPoid === eUploadDocumentStatus.Approved && DOCPores === eUploadDocumentStatus.Approved,
                CANDeposit = !commonFlow.isMinDepositGroupBlocked() && !commonFlow.isFraud(),
                AMLNotRequired = AMLStatus === eAMLStatus.NotRequired;

            var canDepositFlow = function () {
                var DIDDeposit = SMState.IsActive() || SMState.IsActiveButNotSinceTradingBonus();
                if (CANDeposit) {
                    if (DIDDeposit) {
                        // ACTIVE
                        userStatus = eUserStatus.Active;
                        userMessage = 'enjoyTrading';
                        currentStep = eUserFlowSteps.Trade;
                        cta = eCta.None;
                        ctaText = '';
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Available, eStepStatus.Complete, eStepStatus.Complete
                        ];

                    } else {
                        // READY TO TRADE
                        // FUND YOUR ACCOUNT
                        userStatus = eUserStatus.ReadyToTrade;
                        userMessage = 'fundAccount';
                        currentStep = eUserFlowSteps.FundYourAccount;
                        cta = eCta.Deposit;
                        ctaText = "fundTxt";
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Available, eStepStatus.Available, eStepStatus.NotActive
                        ];
                    }

                    if (DOCApproved || AMLNotRequired) {
                        userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
                    }

                } else {
                    if (DIDDeposit) {
                        // RESTRICTED
                        userStatus = eUserStatus.Restricted;
                        userMessage = 'contactComplianceProgress';
                        currentStep = eUserFlowSteps.None;
                        cta = eCta.ContactUs;
                        ctaText = 'contactUs';
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Available, eStepStatus.Restricted, eStepStatus.NotActive
                        ];

                        if (DOCApproved || AMLNotRequired) {
                            userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
                        }

                    } else {
                        // NOT ACTIVATED 4
                        userStatus = eUserStatus.NotActivated;
                        currentStep = eUserFlowSteps.ProofOfIdentity;
                        cta = eCta.ContactUs;
                        ctaText = 'contactUs';
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Available, eStepStatus.NotActive, eStepStatus.NotActive
                        ];

                        if (DOCPoid === eUploadDocumentStatus.Incomplete || DOCPores === eUploadDocumentStatus.Incomplete) {
                            userMessage = 'contactToConfirmDetails';
                        } else {
                            if (DOCWaiting) {
                                userMessage = 'uploadIdDocToActivate';
                                cta = eCta.UploadDocuments;
                                ctaText = 'uploadDocuments';
                            } else {
                                if (DOCApproved) {
                                    userMessage = 'contactToConfirmDetails';
                                    userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
                                    currentStep = eUserFlowSteps.None;
                                } else {
                                    userMessage = 'documentsUnderReview';
                                }
                            }
                        }

                        if (AMLNotRequired) {
                            userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
                        }

                    }
                }
            };

            if (customer.prop.isSeamless) { //#1
                userStatus = eUserStatus.NotActivated;
                userMessage = 'registerToStartTarde';
                currentStep = eUserFlowSteps.OpenedAnAccount;
                cta = eCta.Seamless;
                ctaText = 'registerNow';
                userFlowStepsStatuses = [
                    eStepStatus.Seamless, eStepStatus.NotActive, eStepStatus.Hidden,
                    eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                ];

            } else if (foundInList(KYCRevStatus, [eKYCReviewStatus.Inappropriate, eKYCReviewStatus.Unsuitable])) { // #2 #3
                userStatus = eUserStatus.Locked;
                userMessage = SMState.KycReviewStatus() === eKYCReviewStatus.Inappropriate ? 'quizFailed' : 'unsuitable';
                currentStep = eUserFlowSteps.None;
                cta = eCta.ContactUs;
                ctaText = "contactUs";
                userFlowStepsStatuses = [
                    eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Error,
                    eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                ];

            } else {
                if (AMLStatus !== eAMLStatus.Restricted && !commonFlow.isFraud() && commonFlow.isOnlineTrading()) { // #4.TRUE
                    if (CDDStatus !== eCDDStatus.NotComplete &&
                        foundInList(KYCStatus, [eKYCStatus.Passed, eKYCStatus.FailedAware, eKYCStatus.NotRequired])) {  // #4.TRUE.1
                        canDepositFlow();

                    } else if (CDDStatus !== eCDDStatus.NotComplete && KYCStatus === eKYCStatus.Failed) { // #4.TRUE.2
                        if (foundInList(KYCRevStatus, [eKYCReviewStatus.Experienced, eKYCReviewStatus.Appropriate])) {
                            canDepositFlow();
                        } else { // NOT ACTIVATED 3
                            userStatus = eUserStatus.NotActivated;
                            userMessage = 'quizToStartTarde';
                            currentStep = eUserFlowSteps.TradingKnowledgeQuiz;
                            ctaText = 'completeQuiz';
                            cta = eCta.ClientQuestionnaire;
                            userFlowStepsStatuses = [
                                eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Available,
                                eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                            ];
                        }

                    } else { // #4.TRUE.3
                        // NOT ACTIVATED 1
                        userStatus = eUserStatus.NotActivated;
                        userMessage = 'activateToStartTarde';
                        currentStep = eUserFlowSteps.GeneralInforamtionQuestionnaire;
                        cta = eCta.ClientQuestionnaire;
                        ctaText = 'activateYourAccount';
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Available, eStepStatus.Hidden,
                            eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                        ];
                    }

                } else { // #4.FALSE
                    if (CANDeposit) { // #4.FALSE.1
                        userStatus = eUserStatus.Restricted;
                        userMessage = 'contactComplianceProgress';
                        currentStep = eUserFlowSteps.None;
                        cta = eCta.ContactUs;
                        ctaText = 'contactUs';
                        
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Available, eStepStatus.Complete, eStepStatus.Restricted
                        ];

                        if (DOCApproved) {
                            userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
                        }

                    } else { // #4.FALSE.2
                        userStatus = eUserStatus.Locked;
                        userMessage = 'contactComplianceActivation';
                        currentStep = eUserFlowSteps.None;
                        cta = eCta.ContactUs;
                        ctaText = 'contactUs';
                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Complete,
                            eStepStatus.Available, eStepStatus.NotActive, eStepStatus.NotActive
                        ];

                        if (DOCWaiting) {
                            userMessage = 'accountBlockedDocuments';
                            currentStep = eUserFlowSteps.ProofOfIdentity;
                            cta = eCta.UploadDocuments;
                            ctaText = 'uploadDocuments';
                        } else if (DOCApproved) {
                            userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
                        }
                    }
                }
            }

            // Is Quiz hidden
            if ((SMState.KycStatus() !== eKYCStatus.Failed && SMState.KycStatus() !== eKYCStatus.FailedAware) || SMState.KycReviewStatus() === eKYCReviewStatus.Unsuitable) {
                userFlowStepsStatuses[eUserFlowSteps.TradingKnowledgeQuiz] = eStepStatus.Hidden;
            }
            if (!SMState.IsCddOrKycRequired())
                userFlowStepsStatuses[eUserFlowSteps.GeneralInforamtionQuestionnaire] = eStepStatus.NotActive;
            activationRequired = !(SMState.IsActive() || customer.prop.customerType === eCustomerType.TradingBonus) && !customer.prop.isDemo;

            return {
                documentProofOfResidenceStatus: SMState.docProofOfResidence(),
                documentProofOfIDStatus: SMState.docProofOfID(),
                currentStep: currentStep,
                userStatus: userStatus,
                userMessage: userMessage,
                daysCounter: DAYS_COUNTER,
                maxDaysCounter: MAX_DAYS_COUNTER,
                ctaText: ctaText,
                cta: cta,
                userFlowStepsStatuses: userFlowStepsStatuses,
                activationRequired: activationRequired
            };
        }

        return computeFlow;
    });