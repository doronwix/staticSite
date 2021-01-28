define("devicealerts/PopupClientQuestionnaireAlert", ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var PopupClientQuestionnaireAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = "PopupClientQuestionnaire";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.title(Dictionary.GetItem('lblImportent'));

        };


        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };

    };
    return PopupClientQuestionnaireAlert;
});