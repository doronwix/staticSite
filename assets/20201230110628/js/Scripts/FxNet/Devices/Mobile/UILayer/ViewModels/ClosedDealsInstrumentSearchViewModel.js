define(
    'deviceviewmodels/ClosedDealsInstrumentSearchViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'viewmodels/BaseInstrumentSearchViewModel'
    ],
    function ClosedDealsInstrumentSearchDef(require) {
        var general = require('handlers/general'),
            instrumentSearchViewModel = require('viewmodels/BaseInstrumentSearchViewModel');

        var ClosedDealsInstrumentSearchViewModel = general.extendClass(instrumentSearchViewModel, function ClosedDealsInstrumentSearchClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            function init(settings) {
                parent.init.call(self, settings);

                setSubscribers(settings);
            }

            function setSubscribers(settings) {
                if (!settings.instrumentId || !general.isFunctionType(settings.instrumentId)) {
                    return;
                }

                resetInstrumentId(settings);

                self.subscribeTo(data.selected, function (selected) {
                    settings.instrumentId(selected.id);
                });
            }

            function resetInstrumentId(settings) {
                settings.instrumentId(Number.MAX_SAFE_INTEGER);
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ClosedDealsInstrumentSearchViewModel();
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
