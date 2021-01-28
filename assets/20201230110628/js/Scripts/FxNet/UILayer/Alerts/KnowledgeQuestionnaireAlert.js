define("alerts/KnowledgeQuestionnaireAlert", ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary");

    var KnowledgeQuestionnaireAlert = function () {
        var self = AlertBase.call(this),
            alertsContents = {
                titles: ["pleaseNoteTitle", "tradingKnowledgeTitle", "tradingKnowledgeTitle", "tradingKnowledgeTitle", "questionnaireTitle"],
                messages: [["KYC_Knowledge_Retry_p1"], ["KYC_Knowledge_Review_p1"], ["KYC_Knowledge_Tested_p1"], ["KYC_Knowledge_Inappropriate_p1"], ["KYC_Knowledge_Unsuitable_p1"]],
                buttons: ["btnRetry", "btnContinue", "btnRetry", "btnContinue", "btnContinue"]
            };

        self.alertName = "ClientKnowledgeQuestionnaire";
        self.visible(false);

        self.Init = function () { };

        self.popAlert = function (kycKnowledgeCallback, knowledgeAlertType) {
            var buttonProperties = self.buttonProperties,
                translatedMessages = [], i, len;

            self.buttons.removeAll();

            self.buttons.push(buttonProperties(
                Dictionary.GetItem(alertsContents.buttons[knowledgeAlertType]),
                function () {
                    self.visible(false);
                    kycKnowledgeCallback();
                })
            );

            for (i = 0, len = alertsContents.messages[knowledgeAlertType].length; i < len; i++) {
                translatedMessages.push(Dictionary.GetItem(alertsContents.messages[knowledgeAlertType][i]));
            }

            AlertsManager.UpdateAlert(
                AlertTypes.ClientKnowledgeQuestionnaire,
                Dictionary.GetItem(alertsContents.titles[knowledgeAlertType]),
                '',
                translatedMessages
            );

            AlertsManager.PopAlert(AlertTypes.ClientKnowledgeQuestionnaire);
        };

        self.GetAlert = self;

        return self;
    };

    return KnowledgeQuestionnaireAlert;
});
