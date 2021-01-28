define('devicealerts/CddQuestionnaireAlert', ["require", 'handlers/general','devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        general = require('handlers/general'),
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
                    'btnCancel'
                )
            );
        };

        var closeDialog = function () {
            if (general.isDefinedType(DialogViewModel)) {
                DialogViewModel.close();
            }
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };

    };
    return CddQuestionnaireAlert;
});

