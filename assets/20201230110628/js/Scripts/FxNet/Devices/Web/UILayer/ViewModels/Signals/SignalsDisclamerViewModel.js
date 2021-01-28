define(
    'deviceviewmodels/Signals/SignalsDisclamerViewModel',
    [
        'helpers/KoComponentViewModel',
        'handlers/general',
    ],
    function (KoComponentViewModel, general) {
        var SignalsDisclamerViewModel = general.extendClass(KoComponentViewModel, function SignalsDisclamerClass() { });

        var createViewModel = function () {
            var viewModel = new SignalsDisclamerViewModel();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
