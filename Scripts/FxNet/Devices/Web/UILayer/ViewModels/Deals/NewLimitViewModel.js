define(
    'deviceviewmodels/Deals/NewLimitViewModel',
    [
        'require',
        'configuration/initconfiguration',
        'deviceviewmodels/Deals/Modules/NewLimitModule'
    ],
    function NewDealSlipDefault(require) {
        var settings = require('configuration/initconfiguration').NewLimitConfiguration,
            Module = require('deviceviewmodels/Deals/Modules/NewLimitModule');

        var createViewModel = function (params) {
            var viewModel = new Module.ViewModel();

            var currentSettings = Object.assign(settings, params);
            viewModel.init(currentSettings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
