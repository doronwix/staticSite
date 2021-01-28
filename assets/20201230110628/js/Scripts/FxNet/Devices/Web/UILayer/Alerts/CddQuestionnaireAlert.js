define('devicealerts/CddQuestionnaireAlert', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary");

    var CddQuestionnaireAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = "CddClientQuestionnaire";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem('cddNOtCompleteTryOpenDeal'));
            inheritedAlertInstance.title(Dictionary.GetItem('lblImportent'));
            createButtons();
        };

        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
               new inheritedAlertInstance.buttonProperties(
                   Dictionary.GetItem("btnCompleteQuestionnaire"),
                   function () {
                       inheritedAlertInstance.visible(false);
                       closeDialog();
                       require(['devicemanagers/ViewModelsManager'], function ($viewModelsManager) {
                           $viewModelsManager.VManager.SwitchViewVisible(eForms.ClientQuestionnaire);
                       });
                   },
                   'btnCancel colored'
               )
           );
        };

        var closeDialog = function () {
            DialogViewModel.close();
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return CddQuestionnaireAlert;
});

