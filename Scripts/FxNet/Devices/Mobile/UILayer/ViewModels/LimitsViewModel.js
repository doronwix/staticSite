define(
    'deviceviewmodels/LimitsViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Limits/ActiveLimitsModule'
    ],
    function(require) {
        var general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            ActiveLimitsModule = require('viewmodels/Limits/ActiveLimitsModule');

        var LimitsViewModel = general.extendClass(KoComponentViewModel, function LimitsViewModelClass() {
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
                model: ActiveLimitsModule
            };
        });

        var createViewModel = function (params) {
            var viewModel = new LimitsViewModel();
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