define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetMethodViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetMethodViewModel'
    ],
    function WithdrawalSetMethodDef(require) {
        var general = require('handlers/general'),
            BaseWithdrawalSetMethodViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetMethodViewModel');

        var WithdrawalSetMethodViewModel = general.extendClass(BaseWithdrawalSetMethodViewModel, function WithdrawalSetMethodClass() {
            var data = this.Data;

            return {
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new WithdrawalSetMethodViewModel(params);
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
