define(
    'deviceviewmodels/PriceAlertsViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Limits/PriceAlertsModule'
    ],
    function PriceAlertsDef(require) {
        var general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            PriceAlertsModule = require('viewmodels/Limits/PriceAlertsModule');

        var PriceAlertsViewModel = general.extendClass(KoComponentViewModel, function PriceAlertsClass() {
            var self = this,
                parent = this.parent; // inherited from KoComponentViewModel

            function init(params) {
                parent.init.call(self, params);
            }

            function dispose() {
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                model: PriceAlertsModule
            };
        });

        var createViewModel = function (params) {
            var viewModel = new PriceAlertsViewModel();
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
