define(
    'devicealerts/serverevents/PortfolioAlertKycStatus',
    [
        'require',
        'devicealerts/Alert',
        'Dictionary'
    ],
    function PortfolioAlertKycStatusDef(require) {
        var AlertBase = require('devicealerts/Alert');
        var Dictionary = require('Dictionary');

        var PortfolioAlertKycStatus = function PortfolioAlertKycStatusClass() {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'PortfolioAlertKycStatus';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.body(Dictionary.GetItem('lblP1'));
                inheritedAlertInstance.title(Dictionary.GetItem('lblImportent'));

                createButtons();
            };

            var createButtons = function () {
                inheritedAlertInstance.buttons.removeAll();

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem('btnCompleteQuestionnaire'),
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

        return PortfolioAlertKycStatus;
    }
);
