define(
    'viewmodels/Withdrawal/AmountRequestedViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!withdrawal'
    ],
    function AmountRequestedDef(require) {
        var general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            withdrawalState = require('StateObject!withdrawal');

        var AmountRequestedViewModel = general.extendClass(KoComponentViewModel, function AmountRequestedClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data,
                withdrawalData = withdrawalState.get('withdrawal');

            function init() {
                data.Amount = withdrawalData.amount;
                data.Currency = withdrawalData.currencyLabel;
            }

            function dispose() {
                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new AmountRequestedViewModel(params);
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
