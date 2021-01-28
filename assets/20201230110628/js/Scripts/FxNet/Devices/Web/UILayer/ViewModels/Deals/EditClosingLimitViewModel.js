define(
    'deviceviewmodels/Deals/EditClosingLimitViewModel',
    [
        'require',
        'configuration/initconfiguration',
        'deviceviewmodels/Deals/Modules/EditClosingLimitModule'
    ],
    function EditClosingLimitDef(require) {
        var settings = require('configuration/initconfiguration').EditClosingLimitConfiguration,
            Module = require('deviceviewmodels/Deals/Modules/EditClosingLimitModule');

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
