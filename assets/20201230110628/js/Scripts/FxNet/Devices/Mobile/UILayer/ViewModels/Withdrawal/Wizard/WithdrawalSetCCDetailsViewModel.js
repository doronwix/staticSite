define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetCCDetailsViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetCCDetailsViewModel'
    ],
    function WithdrawalSetCCDetailsDef(require) {
        var general = require('handlers/general'),
            BaseWithdrawalSetCCDetailsViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetCCDetailsViewModel');

        var WithdrawalSetCCDetailsViewModel = general.extendClass(BaseWithdrawalSetCCDetailsViewModel, function WithdrawalSetCCDetailsClass() {
            var parent = this.parent,
                data = this.Data;

            return {
                Data: data,
                GetLast4: parent.GetLast4,
                GetCCName: parent.GetCCName,
                OnSelectCC: parent.OnSelectCC,
                OnClickRemoveCard: parent.OnClickRemoveCard,
                isDataReady: parent.isDataReady
            };
        });

        var createViewModel = function (params) {
            params = params || {};
            Object.assign(params, {
                notApprovedCcMessages: [
                    Dictionary.GetItem('txt_ccNotApprovedAlertP1', 'views_vMobileWithdrawal'),
                    Dictionary.GetItem('txt_ccNotApprovedAlertP2', 'views_vMobileWithdrawal'),
                    Dictionary.GetItem('txt_ccNotApprovedAlertP3', 'views_vMobileWithdrawal')
                ]
            });

            var viewModel = new WithdrawalSetCCDetailsViewModel(params);
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
