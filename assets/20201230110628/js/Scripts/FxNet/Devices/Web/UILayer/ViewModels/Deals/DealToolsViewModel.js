define(
    'deviceviewmodels/Deals/DealToolsViewModel',
    [
        'require',
        'deviceviewmodels/Deals/Modules/DealToolsModule'
    ],
    function(require) {
        var Module = require('deviceviewmodels/Deals/Modules/DealToolsModule');

        var createViewModel = function (params) {
            var viewModel = new Module.ViewModel();

            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);