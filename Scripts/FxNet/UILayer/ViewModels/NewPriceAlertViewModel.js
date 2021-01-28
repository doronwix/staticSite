define(
    'viewmodels/NewPriceAlertViewModel',
    [
        'require',
        'configuration/initconfiguration',
        'modules/NewPriceAlertModule'
    ], function NewPriceAlertDef(require) {
        var settings = require("configuration/initconfiguration").NewLimitConfiguration,
            Module = require('modules/NewPriceAlertModule');

        var createViewModel = function (params) {
            var viewModel = new Module.ViewModel();
            var currentSettings = Object.assign(settings, params);

            viewModel.init(currentSettings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            },
        };
    }
);
