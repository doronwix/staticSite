define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetbankdetailsViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetbankdetailsViewModel'
    ],
    function WithdrawalSetBankDetailsDef(require) {
        var general = require('handlers/general'),
            BaseWithdrawalSetbankdetailsViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetbankdetailsViewModel');

        var WithdrawalSetBankDetailsViewModel = general.extendClass(BaseWithdrawalSetbankdetailsViewModel, function WithdrawalSetBankDetailsClass() {
            var data = this.Data,
                parent = this.parent;

            return {
                Data: data,
                isDataReady: parent.isDataReady
            };
        });

        var createViewModel = function (params) {
            var viewModel = new WithdrawalSetBankDetailsViewModel(params);
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
