define(
    'deviceviewmodels/withdrawalautomation/withdrawalautomationviewmodel',
    [
        'require',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/Customer'
    ],
    function (require) {
        var viewModelsManager = require('devicemanagers/ViewModelsManager'),
            customer = require('initdatamanagers/Customer');

        var createViewModel = function () {

            var self = {};

            var args = viewModelsManager.VManager.GetViewArgs(eViewTypes.vWithdrawalAutomation);

            self.accountNumber = customer.prop.accountNumber;
            self.withdrawalId = args.id;

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
