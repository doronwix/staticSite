define(
    'deviceviewmodels/Deals/NewDealViewModel',
    [
        'require',
        'configuration/initconfiguration',
        'deviceviewmodels/Deals/Modules/NewDealModule'
    ],
    function NewDealDefault(require) {
        var settings = require('configuration/initconfiguration').NewDealConfiguration,
            Module = require('deviceviewmodels/Deals/Modules/NewDealModule');

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
