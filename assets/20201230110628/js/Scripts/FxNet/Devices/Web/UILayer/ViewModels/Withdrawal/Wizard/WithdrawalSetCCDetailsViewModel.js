define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetCCDetailsViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetCCDetailsViewModel',
        'modules/WithdrawalCommon'
    ],
    function WithdrawalSetCCDetailsDef(require) {
        var general = require('handlers/general'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            BaseWithdrawalSetCCDetailsViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetCCDetailsViewModel');

        var WithdrawalSetCCDetailsViewModel = general.extendClass(BaseWithdrawalSetCCDetailsViewModel, function WithdrawalSetCCDetailsClass(params) {
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
                    Dictionary.GetItem('txt_ccNotApprovedAlertP1', 'withdrawal_withdrawalrequest'),
                    Dictionary.GetItem('txt_ccNotApprovedAlertP2', 'withdrawal_withdrawalrequest'),
                    Dictionary.GetItem('txt_ccNotApprovedAlertP3', 'withdrawal_withdrawalrequest')
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
