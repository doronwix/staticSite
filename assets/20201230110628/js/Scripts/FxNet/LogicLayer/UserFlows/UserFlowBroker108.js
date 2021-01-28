/* globals eUploadDocumentType, eUploadDocumentStatus , eUserFlowSteps, eUserStatus, eStepStatus*/
define('userflow/UserFlowBroker108',
    [
        'require',
        'devicemanagers/StatesManager',
        'initdatamanagers/Customer',
        'modules/UserFlowCommon',
        'StateObject!userFlow',
    ],
    function (require) {
        var StatesManager = require('devicemanagers/StatesManager'),
            customer = require('initdatamanagers/Customer'),
            commonFlow = require('modules/UserFlowCommon');

        var tradingBonusFolder = 166,
            maxDaysCounter = 30,
            extendedMaxDaysCounter = 60;

        var SMState = StatesManager.States,
            userFlowStepsStatuses,
            userStatus,
            userMessage,
            currentStep,
            ctaText,
            cta,
            activationRequired = false,
            isCDDRestricted = false,
            isCtaButtonEnabled = true,
            remainingDaysUpdateMsg = 'daysCounterMsg';

        function computeFlow() {
            if (!commonFlow.isReady()) {
                return commonFlow.EMPTY_USER_FLOW;
            }

            var daysCounter = -1,
                generalInfoComplete,
                accountFundedOrRestricted,
                AMLStatus = SMState.AmlStatus(),
                CDDStatus = SMState.CddStatus(),
                DOCPoid = SMState.docProofOfID(),
                DOCPores = SMState.docProofOfResidence(),
                DOCWaiting = DOCPoid === eUploadDocumentStatus.AwaitingDocument || DOCPores === eUploadDocumentStatus.AwaitingDocument,
                DOCNotIncomplete = DOCPoid !== eUploadDocumentStatus.Incomplete && DOCPores !== eUploadDocumentStatus.Incomplete,
                CANTrade = AMLStatus !== eAMLStatus.Restricted && !commonFlow.isFraud() && commonFlow.isOnlineTrading(),
                CANDeposit = !commonFlow.isMinDepositGroupBlocked() && !commonFlow.isFraud(),
                DIDDeposit = SMState.IsActive() && SMState.Folder() !== tradingBonusFolder,
                NeedCDD = SMState.CddStatus() === eCDDStatus.NotComplete,
                specificStatus = {
                    generalInfo: CDDStatus === eCDDStatus.Complete ? eStepStatus.Complete : eStepStatus.Available,
                    fundAccount: CDDStatus === eCDDStatus.Complete && DIDDeposit ? eStepStatus.Complete : eStepStatus.Available
                },
                cddRenewalCountdown = SMState.CDDRenewalCountdown(),
                UploadDocumentsAfterFirstDepositCountdown = SMState.UploadDocumentsAfterFirstDepositCountdown(),
                countdownCta,
                isCddCounterVisible;

            isCDDRestricted = SMState.IsCDDRestricted();

            function restrictedDocumentsCheck() {
                if (DOCWaiting && DOCNotIncomplete) {
                    userMessage = 'restricted_uploadDocuments';
                    userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Available;
                    ctaText = 'uploadDocuments';
                    cta = eCta.UploadDocuments;
                }
            }

            function restrictedAccountFlow() {
                currentStep = eUserFlowSteps.None;
                userStatus = eUserStatus.Restricted;
                userMessage = 'contactUs';
                cta = eCta.ContactUs;
                ctaText = 'contactUs';

                userFlowStepsStatuses = [
                    eStepStatus.Complete, specificStatus.generalInfo, eStepStatus.Hidden,
                    eStepStatus.Available, specificStatus.fundAccount, eStepStatus.Restricted
                ];
                restrictedDocumentsCheck();
            }

            if (customer.prop.isSeamless) {
                userStatus = eUserStatus.NotActivated;
                userMessage = 'registerToStartTarde';
                currentStep = eUserFlowSteps.OpenedAnAccount;
                cta = eCta.Seamless;
                ctaText = 'registerNow';
                userFlowStepsStatuses = [
                    eStepStatus.Seamless, eStepStatus.NotActive, eStepStatus.Hidden,
                    eStepStatus.NotActive, eStepStatus.NotActive, eStepStatus.NotActive
                ];
            }
            else if (CANDeposit) {
                if (DIDDeposit) {
                    if (NeedCDD) {
                        currentStep = eUserFlowSteps.GeneralInforamtionQuestionnaire;
                        userStatus = eUserStatus.NotActivated;
                        userMessage = 'completeQuestionnaire';
                        ctaText = 'goToQuestionnaire';
                        cta = eCta.ClientQuestionnaire;

                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Available, eStepStatus.Hidden,
                            eStepStatus.NotActive, eStepStatus.Complete, eStepStatus.NotActive
                        ];

                        if (AMLStatus === eAMLStatus.Unverified) { // NOT ACTIVATED 4
                            userMessage = 'toDealCompleteQuestionnaire';
                        }

                        if (isCDDRestricted) {
                            isCtaButtonEnabled = false;
                        }
                    }
                    else if (CANTrade) {
                        currentStep = eUserFlowSteps.None;
                        userStatus = eUserStatus.ActiveLimited;
                        userMessage = 'trading_fixDocuments';
                        ctaText = 'contactUs';
                        cta = eCta.ContactUs;

                        userFlowStepsStatuses = [
                            eStepStatus.Complete, eStepStatus.Complete, eStepStatus.Hidden,
                            eStepStatus.Available, eStepStatus.Complete, eStepStatus.Complete
                        ];

                        if (AMLStatus === eAMLStatus.Approved) { //L7
                            userStatus = eUserStatus.Active;
                            userMessage = 'enjoyTrading';
                            ctaText = '';
                            cta = eCta.None;
                            userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;

                            if (cddRenewalCountdown >= 0 && cddRenewalCountdown <= extendedMaxDaysCounter) {
                                userStatus = eUserStatus.ActiveLimited;
                                userMessage = 'questionaire_require_update';
                                ctaText = 'goToQuestionnaire';
                                cta = eCta.ClientQuestionnaire;
                                remainingDaysUpdateMsg = 'daysCounterCDDMsg';
                                isCddCounterVisible = true;
                                daysCounter = cddRenewalCountdown;
                                countdownCta = eCta.ClientQuestionnaire;
                            }
                        }
                        else if (DOCPoid !== eUploadDocumentStatus.Incomplete &&
                            DOCPores !== eUploadDocumentStatus.Incomplete &&
                            (DOCPoid === eUploadDocumentStatus.AwaitingDocument ||
                                DOCPores === eUploadDocumentStatus.AwaitingDocument)) {
                            userMessage = 'trading_fixRestrictions';
                            ctaText = 'uploadDocuments';
                            cta = eCta.UploadDocuments;
                        }
                    }
                    else {
                        restrictedAccountFlow(); //L12 L13
                    }
                }
                else if (CANTrade) { // NOT ACTIVATED (1) OR READY TO TRADE
                    userStatus = NeedCDD ? eUserStatus.NotActivated : eUserStatus.ReadyToTrade;
                    userMessage = 'simplyFund';
                    currentStep = eUserFlowSteps.FundYourAccount;
                    cta = eCta.Deposit;
                    ctaText = "fundTxt";

                    userFlowStepsStatuses = [
                        eStepStatus.Complete, eStepStatus.NotActive, eStepStatus.Hidden,
                        eStepStatus.NotActive, eStepStatus.Available, eStepStatus.NotActive
                    ];
                }
                else {
                    restrictedAccountFlow(); //L12 L13
                }
            }
            else {
                if (CANTrade) { //L11 RESTRICTED
                    currentStep = eUserFlowSteps.None;
                    userStatus = eUserStatus.Restricted;
                    userMessage = 'contactUs';
                    cta = eCta.ContactUs;
                    ctaText = 'contactUs';

                    userFlowStepsStatuses = [
                        eStepStatus.Complete, specificStatus.generalInfo, eStepStatus.Hidden,
                        eStepStatus.NotActive, eStepStatus.Restricted, eStepStatus.NotActive
                    ];

                    restrictedDocumentsCheck();
                }
                else { //L15 LOCKED
                    currentStep = eUserFlowSteps.None;
                    userStatus = eUserStatus.Locked;
                    userMessage = 'contactComplianceActivation';
                    cta = eCta.ContactUs;
                    ctaText = 'contactUs';

                    userFlowStepsStatuses = [
                        eStepStatus.Complete, specificStatus.generalInfo, eStepStatus.Hidden,
                        eStepStatus.Available, specificStatus.fundAccount, eStepStatus.Restricted
                    ];

                    if (DOCWaiting && DOCNotIncomplete) {//L14
                        userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Available;
                    }
                }
            }

            generalInfoComplete = userFlowStepsStatuses[eUserFlowSteps.GeneralInforamtionQuestionnaire] === eStepStatus.Complete;
            accountFundedOrRestricted = [eStepStatus.Complete, eStepStatus.Restricted].contains(userFlowStepsStatuses[eUserFlowSteps.FundYourAccount]);

            if (generalInfoComplete && accountFundedOrRestricted && AMLStatus === eAMLStatus.Approved) {
                userFlowStepsStatuses[eUserFlowSteps.ProofOfIdentity] = eStepStatus.Complete;
            }

            if (!SMState.IsCddOrKycRequired()) {
                userFlowStepsStatuses[eUserFlowSteps.GeneralInforamtionQuestionnaire] = eStepStatus.Hidden;
            }

            userFlowStepsStatuses[eUserFlowSteps.TradingKnowledgeQuiz] = eStepStatus.Hidden;
            activationRequired = !(SMState.IsActive() || customer.prop.customerType === eCustomerType.TradingBonus) && !customer.prop.isDemo;

            var isUploadDocsCountdownVisible = userStatus !== eUserStatus.Locked &&
                SMState.AmlStatus() === eAMLStatus.Pending &&
                UploadDocumentsAfterFirstDepositCountdown &&
                UploadDocumentsAfterFirstDepositCountdown > -1;

            if (!isCddCounterVisible && isUploadDocsCountdownVisible) {
                daysCounter = UploadDocumentsAfterFirstDepositCountdown;
                countdownCta = eCta.UploadDocuments;
            }

            return {
                documentProofOfResidenceStatus: SMState.docProofOfResidence(),
                documentProofOfIDStatus: SMState.docProofOfID(),
                currentStep: currentStep,
                userStatus: userStatus,
                userMessage: userMessage,
                daysCounter: daysCounter,
                maxDaysCounter: maxDaysCounter,
                ctaText: ctaText,
                cta: cta,
                userFlowStepsStatuses: userFlowStepsStatuses,
                activationRequired: activationRequired,
                isCDDRestricted: isCDDRestricted,
                isCtaButtonEnabled: isCtaButtonEnabled,
                remainingDaysUpdateMsg: remainingDaysUpdateMsg,
                countdownCta: countdownCta
            };
        }

        return computeFlow;
    }
);
