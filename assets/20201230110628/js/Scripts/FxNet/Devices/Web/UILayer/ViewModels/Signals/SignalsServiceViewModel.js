define(
    'deviceviewmodels/Signals/SignalsServiceViewModel',
    [
        'knockout',
        'helpers/KoComponentViewModel',
        'handlers/general'
    ],
    function SignalsServiceDef(ko, KoComponentViewModel, general) {
        var SignalsServiceViewModel = general.extendClass(KoComponentViewModel, function SignalsServiceClass(_params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                params = _params;

            var init = function (settings) {
                parent.init.call(self, settings);
                data.signalsEndDate = ko.observable(params.signalsEndDate || "");
            };

            return {
                init: init,
                Data: data
            };
        });

        var createViewModel = function (_params) {
            var params = _params || {};
            var viewModel = new SignalsServiceViewModel(params);
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
