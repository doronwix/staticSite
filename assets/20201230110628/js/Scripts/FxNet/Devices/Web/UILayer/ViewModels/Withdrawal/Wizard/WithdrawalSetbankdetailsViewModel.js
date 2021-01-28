define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetbankdetailsViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetbankdetailsViewModel',
        'StateObject!wizardState',
        'StateObject!withdrawal'
    ],
    function WithdrawalSetBankDetailsDef(require) {
        var wizardState = require('StateObject!wizardState'),
            general = require('handlers/general'),
            withdrawalState = require('StateObject!withdrawal'),
            BaseWithdrawalSetbankdetailsViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetbankdetailsViewModel');

        var WithdrawalSetbankdetailsViewModel = general.extendClass(BaseWithdrawalSetbankdetailsViewModel, function WithdrawalSetBankDetailsClass(params) {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init() {
                parent.init.call(self);

                buildWizardStep();
            }

            function buildWizardStep() {
                params.setStepActions(null, continueWithPrevious);
            }

            function continueWithPrevious() {
                var stateData = withdrawalState.get('withdrawal'),
                    prevStep = stateData.hasCcWithdrawal ? eWithdrawalSteps.setMethod : eWithdrawalSteps.setAmount;

                wizardState.update('step', prevStep);
            }

            return {
                init: init,
                Data: data,
                isDataReady: parent.isDataReady
            };
        });

        var createViewModel = function (params) {
            var viewModel = new WithdrawalSetbankdetailsViewModel(params);
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
