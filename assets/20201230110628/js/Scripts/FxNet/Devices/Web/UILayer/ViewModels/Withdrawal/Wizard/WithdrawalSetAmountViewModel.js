define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetAmountViewModel',
    [
        'require',
        'handlers/general',
        'Dictionary',
        'viewmodels/dialogs/DialogViewModel',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetAmountViewModel'
    ],
    function WithdrawalSetAmountDef(require) {
        var general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            BaseWithdrawalSetAmountViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetAmountViewModel');

        var WithdrawalSetAmountViewModel = general.extendClass(BaseWithdrawalSetAmountViewModel, function WithdrawalSetAmountClass() {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init() {
                parent.init.call(self);
                setDcHandlers();
            }

            function setDcHandlers() {
                Object.assign(parent.DcHandlers, {
                    dcShowAlert: showDepositConfirmation,
                    dcUploadSuccess: dcUploadSuccess
                });
            }

            function showDepositConfirmation() {
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
                        useDialogPosition: true,
                        preventClose: {
                            canClose: false,
                            actionOnPrevent: preventCloseDc
                        }
                    },
                    args = {
                        uploadStringImage: data.uploadVm.UploadStringImage,
                        withdrawalFlow: true
                    };

                DialogViewModel.openAsync(eAppEvents.depositConfirmationLoadedEvent,
                    eDialog.DepositConfirmation,
                    options,
                    eViewTypes.vDepositConfirmation,
                    args);
            }

            function preventCloseDc() {
                var props = {
                    overwriteNavFlow: true,
                    okButtonCallback: forceCloseDc,
                    okButtonCaption: Dictionary.GetItem("ok"),
                    cancelButtonCaption: Dictionary.GetItem("cancel"),
                    btnOkClass: 'small-okBtn',
                    btnCancelClass: 'small-cancelBtn'
                };

                AlertsManager.UpdateAlert(AlertTypes.GeneralOkCancelAlert, Dictionary.GetItem('titleAlertImportant', 'dialogsTitles', ' '), null, [Dictionary.GetItem('msg_requiredStep', 'withdrawal_withdrawalrequest')], props);
                AlertsManager.PopAlert(AlertTypes.GeneralOkCancelAlert);
            }

            function forceCloseDc() {
                var currentDialog = DialogViewModel.dialogs().find(function (dialog) {
                    return dialog.name === eDialog.DepositConfirmation;
                });

                currentDialog.options.preventClose.canClose = true;
                DialogViewModel.close(eDialog.DepositConfirmation);
            }

            function dcUploadSuccess() {
                data.dcRequired = false;
                parent.UpdateNextStep();
                DialogViewModel.close(eDialog.DepositConfirmation);
            }

            return {
                init: init,
                WithdrawalInfo: data.withdrawalInfo,
                Data: data
            };
        });

        var createViewModel = function (params) {
            params = params || {};

            Object.assign(params, {
                dcUploadMessages: {
                    fail: Dictionary.GetItem('msg_dcUploadError', 'withdrawal_withdrawalrequest'),
                    additionalSuccess: Dictionary.GetItem('msg_dcUploadSuccess', 'withdrawal_withdrawalrequest')
                }
            });

            var viewModel = new WithdrawalSetAmountViewModel(params);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
