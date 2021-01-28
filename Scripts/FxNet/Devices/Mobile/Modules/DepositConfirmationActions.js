define(
    'devicecustommodules/DepositConfirmationActions',
    [
        'require',
        'Dictionary',
        'devicemanagers/AlertsManager'
    ],
    function (require) {
        var AlertsManager = require('devicemanagers/AlertsManager'),
            Dictionary = require('Dictionary');

        var DepositConfirmationActions = function () {
            function openConfirmation(uploadStringImage) {
                AlertsManager.UpdateAlert(AlertTypes.DepositConfirmationSignatureAlert, Dictionary.GetItem('lblDepositConfirmationTitle'), '', null, { uploadStringImage: uploadStringImage });
                AlertsManager.PopAlert(AlertTypes.DepositConfirmationSignatureAlert);
            }

            function closeConfirmation() {
                AlertsManager.GetAlert(AlertTypes.DepositConfirmationSignatureAlert).hide();
            }

            return {
                OpenConfirmation: openConfirmation,
                CloseConfirmation: closeConfirmation
            };
        };

        return new DepositConfirmationActions();
    }
);
