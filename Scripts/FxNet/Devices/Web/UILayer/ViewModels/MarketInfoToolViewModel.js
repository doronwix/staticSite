define(
    'deviceviewmodels/MarketInfoToolViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Deals/BaseMarketInfoToolViewModel'
    ],
    function (require) {
        var general = require('handlers/general'),
            BaseMarketInfoToolViewModel = require('viewmodels/Deals/BaseMarketInfoToolViewModel');

        var MarketInfoToolViewModel = general.extendClass(BaseMarketInfoToolViewModel, function (_newDealData) {
            var parent = this.parent;

            return {
                init: parent.init,
                dispose: parent.dispose,
                NewDealData: parent.NewDealData,
                ViewSentimentsButtonHandler: parent.ViewSentimentsButtonHandler
            };
        });

        var createViewModel = function (params) {
            var viewModel = new MarketInfoToolViewModel(params);

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