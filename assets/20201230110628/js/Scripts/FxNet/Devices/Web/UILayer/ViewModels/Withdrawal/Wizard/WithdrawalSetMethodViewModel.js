define(
    'deviceviewmodels/Withdrawal/Wizard/WithdrawalSetMethodViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetMethodViewModel',
        'StateObject!wizardState'
    ],
    function WithdrawalSetMethodDef(require) {
        var general = require('handlers/general'),
            wizardState = require('StateObject!wizardState'),
            BaseWithdrawalSetMethodViewModel = require('viewmodels/Withdrawal/Wizard/BaseWithdrawalSetMethodViewModel');

        var WithdrawalSetMethodViewModel = general.extendClass(BaseWithdrawalSetMethodViewModel, function WithdrawalSetMethodClass(params) {
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
                wizardState.update('step', eWithdrawalSteps.setAmount);
            }

            return {
                init: init,
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
