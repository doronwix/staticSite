define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetAmountViewModel',
    [
        'require',
        'Dictionary',
        'devicemanagers/AlertsManager',
        'handlers/general',
        'Dictionary',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetAmountViewModel'
    ],
    function WithdrawalSetAmountDef(require) {
        var Dictionary = require('Dictionary'),
            general = require('handlers/general'),
            AlertsManager = require('devicemanagers/AlertsManager'),
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
                var props = {
                    showFailAlert: true,
                    overwriteNavFlow: true,
                    okButtonCallback: depositConfirmationUploaded,
                    uploadStringImage: data.uploadVm.UploadStringImage,
                    preventOnCancel: true,
                    preventOnCancelText: Dictionary.GetItem('msg_requiredStep', 'views_vMobileWithdrawal'),
                    withdrawalFlow: true
                };

                AlertsManager.UpdateAlert(AlertTypes.DepositConfirmationSignatureAlert, Dictionary.GetItem('lblDepositConfirmationTitle'), '', null, props);
                AlertsManager.PopAlert(AlertTypes.DepositConfirmationSignatureAlert);
            }

            function depositConfirmationUploaded() {
                data.dcRequired = false;
                parent.UpdateNextStep();
            }

            function dcUploadSuccess() {
                AlertsManager.GetAlert(AlertTypes.DepositConfirmationSignatureAlert).hide();
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
                    fail: Dictionary.GetItem('msg_dcUploadError', 'views_vMobileWithdrawal'),
                    additionalSuccess: Dictionary.GetItem('msg_dcUploadSuccess', 'views_vMobileWithdrawal')
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
