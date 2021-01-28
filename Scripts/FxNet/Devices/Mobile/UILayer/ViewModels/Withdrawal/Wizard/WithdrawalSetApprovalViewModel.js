define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetApprovalViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetApprovalViewModel'
    ],
    function WithdrawalSetApprovalDef(require) {
        var general = require('handlers/general'),
            BaseWithdrawalSetApprovalViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetApprovalViewModel');

        var WithdrawalSetApprovalViewModel = general.extendClass(BaseWithdrawalSetApprovalViewModel, function WithdrawalSetApprovalClass() {
            var data = this.Data,
                parent = this.parent;

            return {
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
