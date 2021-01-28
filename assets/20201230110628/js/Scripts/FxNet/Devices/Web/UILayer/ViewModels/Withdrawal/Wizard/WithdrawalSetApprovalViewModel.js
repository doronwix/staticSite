define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetApprovalViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetApprovalViewModel',
        'modules/WithdrawalCommon'
    ],
    function WithdrawalSetApprovalDef(require) {
        var general = require('handlers/general'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            BaseWithdrawalSetApprovalViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetApprovalViewModel');

        var WithdrawalSetApprovalViewModel = general.extendClass(BaseWithdrawalSetApprovalViewModel, function WithdrawalSetApprovalClass(params) {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init() {
                parent.init.call(self);

                buildWizardStep();
            }

            function buildWizardStep() {
                params.setStepActions(null, withdrawalCommon.goBack);
            }

            return {
                init: init,
                Data: data,
                isDataReady: parent.isDataReady
            };
        });

        var createViewModel = function (params) {
            var viewModel = new WithdrawalSetApprovalViewModel(params);
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
