/* globals eUploadDocumentStatus , eUserFlowSteps, eUserStatus, eStepStatus */
define(
    'viewmodels/account/UserFlowBaseViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'StateObject!userFlow',
        'helpers/KoComponentViewModel',
        'initdatamanagers/Customer',
        'managers/CustomerProfileManager',
        'userflow/UserFlowManager'
    ],
    function UserFlowBaseDef(require) {
        var ko = require('knockout'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            general = require('handlers/general'),
            stateObjectUserFlow = require('StateObject!userFlow'),
            customer = require('initdatamanagers/Customer'),
            customerProfileManager = require('managers/CustomerProfileManager');

        var UserFlowBaseViewModel = general.extendClass(koComponentViewModel, function UserFlowBaseClass() {
            var self = this,
                parent = self.parent,
                data = this.Data || {},
                stateObjectUnsubscribe,
                userFlowStepsStatuses,
                currentStep,
                documentProofOfResidenceStatus,
                documentProofOfIDStatus,
                collapsedContentKey = 'collapsedContent';

            function init() {
                setDefaultObservables();
                updateFromStateObject(stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged));

                if (data.userStatus() === eUserStatus.Active) {
                    toggleUserFlow();
                }

                stateObjectUnsubscribe = stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
                    updateFromStateObject(model);
                });
            }

            function setDefaultObservables() {
                var collapsed = stateObjectUserFlow.get(collapsedContentKey);
                userFlowStepsStatuses = ko.observableArray([ko.observable(), ko.observable(), ko.observable(), ko.observable(), ko.observable(), ko.observable()]);
                currentStep = ko.observable();
                documentProofOfResidenceStatus = ko.observable();
                documentProofOfIDStatus = ko.observable();

                data.userMessage = ko.observable('');
                data.ctaTxt = ko.observable('');
                data.cta = ko.observable(eCta.None);
                data.userStatus = ko.observable();
                data.generalStatusName = ko.observable('');
                data.isLocked = ko.observable(false);
                data.isRestricted = ko.observable(false);

                data.stepStatus = stepStatus;
                data.isAvailable = isAvailable;
                data.isCurrent = isCurrent;
                data.isHidden = isHidden;
                data.isComplete = isComplete;
                data.poiState = poiState;
                data.generalStatusIcon = generalStatusIcon;
                data.generalStatusColor = generalStatusColor;

                data.userFlowToggle = ko.observable(general.isNullOrUndefined(collapsed) ? collapsed : false);
                data.toggleUserFlow = toggleUserFlow;
                data.stepClick = stepClick;
                data.ctaClick = ctaClick;

                data.tooltipIdToggle = ko.observable(false);
                data.tooltipAddrToggle = ko.observable(false);
                data.tooltipNumToggle = ko.observable(false);

                data.daysCounter = ko.observable();
                data.maxDaysCounter = ko.observable();
                data.remainingDaysUpdateMsg = ko.observable('');
                data.countdownCta = ko.observable('');

                data.isVisible = !customer.prop.isDemo;// !Demo

                data.isCDDClickable = ko.observable(true);
                data.isCtaButtonEnabled = ko.observable(true);
                data.ctaVisible = ko.pureComputed( function () { return data.ctaTxt() != '' && data.isCtaButtonEnabled(); });
            }

            function updateFromStateObject(model) {
                if (!model || model.userStatus === eUserStatus.NA)
                    return;

                model.userFlowStepsStatuses.forEach(function (value, i) {
                    userFlowStepsStatuses()[i](value);
                });

                data.userStatus(model.userStatus);
                data.generalStatusName('flow_' + general.getKeyByValue(eUserStatus, model.userStatus));
                data.isLocked(model.userStatus === eUserStatus.Locked);
                data.isRestricted(model.userStatus === eUserStatus.Restricted);
                data.userMessage(model.userMessage);
                currentStep(model.currentStep);
                data.ctaTxt(model.ctaText);
                data.cta(model.cta);
                documentProofOfResidenceStatus(model.documentProofOfResidenceStatus);
                documentProofOfIDStatus(model.documentProofOfIDStatus);

                data.maxDaysCounter(model.maxDaysCounter);
                data.daysCounter(model.daysCounter);
                data.remainingDaysUpdateMsg(model.remainingDaysUpdateMsg);
                data.countdownCta(model.countdownCta);

                data.isCDDClickable(!model.isCDDRestricted);
                if (!general.isNullOrUndefined(model.isCtaButtonEnabled)) {
                    data.isCtaButtonEnabled(model.isCtaButtonEnabled);
                }
            }

            function generalStatusIcon() {
                switch (data.userStatus()) {
                    case eUserStatus.NotActivated:
                        return 'ico-not-active redColor';

                    case eUserStatus.ReadyToTrade:
                    case eUserStatus.ActiveLimited:
                        return 'ico-limited orangeColor';

                    case eUserStatus.Active:
                        return 'ico-active greenColor';

                    case eUserStatus.Restricted:
                        return 'ico-restricted redColor';

                    case eUserStatus.Locked:
                        return 'ico-locked redColor';

                    default:
                        break;
                }
            }

            function generalStatusColor() {
                switch (data.userStatus()) {
                    case eUserStatus.ReadyToTrade:
                    case eUserStatus.ActiveLimited:
                        return 'yellowBackground';

                    case eUserStatus.Active:
                        return 'greenBackground';

                    case eUserStatus.Locked:
                    case eUserStatus.NotActivated:
                    case eUserStatus.Restricted:
                        return 'redBackground';

                    default:
                        break;
                }
            }

            function stepStatus(stepName) {
                //Class by Status of Step => flowCurrent / flowDisabled / flowError / flowRestricted / flowDone
                switch (userFlowStepsStatuses()[eUserFlowSteps[stepName]]()) {
                    case eStepStatus.Error:     // red x
                        return 'ico-milestone-error redColor';

                    case eStepStatus.Restricted: // red no entry
                        return 'ico-milestone-restricted redColor';

                    case eStepStatus.Available: // blue
                        return 'ico-milestone blueColor';

                    case eStepStatus.Complete: // green
                        if (eUserFlowSteps[stepName] === 0 || eUserFlowSteps[stepName] === userFlowStepsStatuses().length - 1) {
                            return 'ico-milestone-dot greenColor';
                        }

                        return 'ico-milestone-done greenColor';

                    case eStepStatus.Seamless:
                        if (eUserFlowSteps[stepName] === 0) {
                            return 'ico-milestone-dot blueColor';
                        }

                        return 'ico-milestone grayColor';

                    case eStepStatus.Hidden: //gray
                    case eStepStatus.NotActive:
                    default:
                        if (eUserFlowSteps[stepName] === 0 || eUserFlowSteps[stepName] === userFlowStepsStatuses().length - 1) {
                            return 'ico-milestone-dot grayColor';
                        }

                        return 'ico-milestone grayColor';
                }
            }

            function isAvailable(stepName, skipLocked) {
                if (data.userStatus() === eUserStatus.Locked && !skipLocked) {
                    return false;
                }

                return userFlowStepsStatuses()[eUserFlowSteps[stepName]]() === eStepStatus.Available;
            }

            function isCurrent(stepName) {
                //Case open => seamless only. 
                return eUserFlowSteps[stepName] === currentStep();
            }

            function isComplete(stepName) {
                return userFlowStepsStatuses()[eUserFlowSteps[stepName]]() === eStepStatus.Complete;
            }

            function isHidden(stepName) {
                return userFlowStepsStatuses()[eUserFlowSteps[stepName]]() === eStepStatus.Hidden;
            }

            function poiState(poiType) {
                /*
                    Blue color for status “Awaiting Signature/Not Yet Received”.
                    Green color + V icon – Document was uploaded by the user and approved by compliance (“Approved” status).
                    Light Red color + ! icon – Document was uploaded by the user got “Incomplete” status from compliance.
                    Yellow color + clock icon – Document was uploaded by the user and got “processing” status from compliance.
                 */
                var poiStatus = -1;

                switch (poiType) {
                    case 'id':
                        poiStatus = documentProofOfIDStatus();
                        break;

                    case 'addr':
                        poiStatus = documentProofOfResidenceStatus();
                        break;

                    case 'num': /*NA - TBD*/
                    default:
                        break;
                }

                switch (poiStatus) {
                    case eUploadDocumentStatus.Approved:
                        return 'ico-poi-' + poiType + '-done greenColor';

                    case eUploadDocumentStatus.Incomplete:
                        return 'ico-poi-' + poiType + '-error redColor';

                    case eUploadDocumentStatus.Processing:
                        return 'ico-poi-' + poiType + '-pending orangeColor';

                    case eUploadDocumentStatus.AwaitingDocument:
                        if (data.daysCounter() >= 0) {
                            return 'ico-poi-' + poiType + '-error redColor';
                        }

                        if (userFlowStepsStatuses()[eUserFlowSteps['ProofOfIdentity']]() === eStepStatus.NotActive) {
                            break;
                        }

                        return 'ico-poi-' + poiType + ' blueColor';

                    case eUploadDocumentStatus.AwaitingSignature:
                        return 'ico-poi-' + poiType + ' blueColor';

                    default:
                        break;
                }

                return 'ico-poi-' + poiType + ' grayColor';
            }

            function toggleUserFlow() {
                var newValue = !data.userFlowToggle(),
                    profileCustomer = customerProfileManager.ProfileCustomer(),
                    toggleOnLogin = general.isNullOrUndefined(stateObjectUserFlow.get(collapsedContentKey));

                if (data.userStatus() === eUserStatus.Active && (profileCustomer.activeFirstLogin !== -1) && toggleOnLogin) {
                    newValue = !newValue;
                }

                data.userFlowToggle(newValue);
                stateObjectUserFlow.update(collapsedContentKey, data.userStatus() === eUserStatus.Active ? !newValue : newValue);

                if (data.userFlowToggle() === false) {
                    ko.postbox.publish('hub-map-expand');
                }
                else {
                    ko.postbox.publish('hub-map-collapse');
                }
            }

            function stepClick() { } //Abstract

            function ctaClick() { } //Abstract

            function dispose() {
                if (stateObjectUnsubscribe) {
                    stateObjectUnsubscribe();
                }

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                data: data
            };
        });

        return UserFlowBaseViewModel;
    }
);
