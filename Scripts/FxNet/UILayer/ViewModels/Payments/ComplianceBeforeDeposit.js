define('payments/ComplianceBeforeDeposit', [
    'require',
    'knockout',
    'devicemanagers/StatesManager',
    'managers/PopUpManager',
    'managers/AmlPopupManager',
    'devicemanagers/AlertsManager',
    'dataaccess/dalCompliance',
    'Dictionary',
], function ComplianceBeforeDeposit(require) {
    var ko = require('knockout'),
        StatesManager = require('devicemanagers/StatesManager'),
        PopUpManager = require('managers/PopUpManager'),
        AlertsManager = require('devicemanagers/AlertsManager'),//not loaded yet, use global AlertsManager
        AmlPopupManager = require('managers/AmlPopupManager'),
        dalCompliance = require('dataaccess/dalCompliance'),
        Dictionary = require('Dictionary');

    var title = Dictionary.GetItem('ClientQuestionnaireTitle');

    function isKycStatusFailCannotDeposit() {
        return (
            StatesManager.States.KycStatus() === eKYCStatus.Failed &&
            StatesManager.States.KycReviewStatus() === eKYCReviewStatus.Appropriate
        );
    }

    function showKycWarningAlert() {
        var questionnaireAlertManager = AlertsManager.GetAlert(AlertTypes.ClientQuestionnaire);

        questionnaireAlertManager.popAlert().done();
    }

    function isCddBeforeDeposit() {
        return (
            Dictionary.GetItem('preDepositRequired', 'application_configuration', '0') === '1' &&
            (
                StatesManager.States.IsCddStatusNotComplete() ||
                StatesManager.States.IsKycStatusRequired() ||
                StatesManager.States.IsKycReviewStatusRequired()
            )
        );
    }

    function isMoveToCddFullNoPopupBeforeDeposit() {
        return (
            Dictionary.GetItem('showCompliancePageBeforeDeposit', 'application_configuration', '0') === '1' &&
            (
                StatesManager.States.IsCddStatusNotComplete() ||
                StatesManager.States.IsKycStatusRequired() ||
                StatesManager.States.IsKycReviewStatusRequired()
            )
        );
    }

    function showMifidPopupBeforeDeposit() {
        if (Dictionary.GetItem('showCompliancePageBeforeDeposit', 'application_configuration', '0') !== '1') {
            return false;
        }

        var mifidAlertManager = AlertsManager.GetAlert(AlertTypes.ClientKnowledgeQuestionnaire);

        var knowledgeAlertType;

        switch (StatesManager.States.KycReviewStatus()) {
            case eKYCReviewStatus.Review:
                knowledgeAlertType = KnowledgeAlertTypes.Review;
                break;

            case eKYCReviewStatus.Tested:
                knowledgeAlertType = KnowledgeAlertTypes.Tested;
                break;

            case eKYCReviewStatus.Inappropriate:
                knowledgeAlertType = KnowledgeAlertTypes.Inappropriate;
                break;

            case eKYCReviewStatus.Unsuitable:
                knowledgeAlertType = KnowledgeAlertTypes.Unsuitable;
                break;

            default:
                knowledgeAlertType = null;
                break;
        }

        if (knowledgeAlertType !== null) {
            mifidAlertManager.popAlert(function () {
                return true;
            }, knowledgeAlertType);

            return true;
        }

        return false;
    }

    function openCdd(getRequestData, depositCallback) {
        dalCompliance.logUserShouldCompleteCdd(getRequestData);
        PopUpManager.OpenAsPopup(eViewTypes.vClientQuestionnaire, {
            dialogClass: 'deal-slip PopupClientQuestionnaire',
            title: title,
        });

        var sub = ko.postbox.subscribe('thankyou-continue-clicked', function onThankYouContinueClicked() {
            depositCallback();
            sub.dispose();
        });
    }

    function isAmlRestricted() {
        return StatesManager.States.AmlStatus() === eAMLStatus.Restricted;
    }

    function showAmlPopup() {
        AmlPopupManager.show();
    }

    return {
        isCddBeforeDeposit: isCddBeforeDeposit,
        showMifidPopupBeforeDeposit: showMifidPopupBeforeDeposit,
        isMoveToCddFullNoPopupBeforeDeposit: isMoveToCddFullNoPopupBeforeDeposit,
        openCdd: openCdd,
        isKycStatusFailCannotDeposit: isKycStatusFailCannotDeposit,
        showKycWarningAlert: showKycWarningAlert,
        isAmlRestricted: isAmlRestricted,
        showAmlPopup: showAmlPopup,
    };
});
