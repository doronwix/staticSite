define(
    'deviceviewmodels/Deals/CloseDealViewModel',
    [
        'require',
        'configuration/initconfiguration',
        'deviceviewmodels/Deals/Modules/CloseDealModule'
    ],
    function (require) {
        var settings = require('configuration/initconfiguration').CloseDealSettingsConfiguration,
            Module = require('deviceviewmodels/Deals/Modules/CloseDealModule');

        var createViewModel = function () {
            var viewModel = new Module.ViewModel();

            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);