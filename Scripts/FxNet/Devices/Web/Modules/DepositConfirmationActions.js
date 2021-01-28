define(
    'devicecustommodules/DepositConfirmationActions',
    [
        'require',
        'Dictionary',
        'viewmodels/dialogs/DialogViewModel'
    ],
    function (require) {
        var DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            Dictionary = require('Dictionary');

        var DepositConfirmationActions = function () {
            function openConfirmation(uploadStringImage) {
                var options = {
                        title: Dictionary.GetItem('lblDepositConfirmationTitle'),
                        width: 695,
                        height: 850,
                        dialogClass: 'fx-dialog deposit-confirmation-dialog',
                        modal: true,
                        draggable: true,
                        resizable: false,
                        left: (window.innerWidth - 695) / 2,
                        top: 146,
                        offset: 695,
                        useDialogPosition: true
                    },
                    args = {
                        uploadStringImage: uploadStringImage
                    };

                DialogViewModel.openAsync(eAppEvents.depositConfirmationLoadedEvent,
                    eDialog.DepositConfirmation,
                    options,
                    eViewTypes.vDepositConfirmation,
                    args);
            }

            function closeConfirmation() {
                DialogViewModel.close(eDialog.DepositConfirmation);
            }

            return {
                OpenConfirmation: openConfirmation,
                CloseConfirmation: closeConfirmation
            };
        };

        return new DepositConfirmationActions();
    }
);