define(
    'deviceviewmodels/FavoritesInstrumentSearchViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/BaseInstrumentSearchViewModel',
        'LoadDictionaryContent!EditFavoriteInstruments'
    ],
    function FavoritesInstrumentSearchDef(require) {
        var general = require('handlers/general'),
            instrumentSearchViewModel = require('viewmodels/BaseInstrumentSearchViewModel');

        var FavoritesInstrumentSearchViewModel = general.extendClass(instrumentSearchViewModel, function FavoritesInstrumentSearchClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            function init(settings) {
                parent.init.call(self, settings);

                setSubscribers(settings);
            }

            function setSubscribers(settings) {
                if (!settings.instrumentSelectedHandler || !general.isFunctionType(settings.instrumentSelectedHandler)) {
                    return;
                }

                self.subscribeTo(data.selected, settings.instrumentSelectedHandler);
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new FavoritesInstrumentSearchViewModel();
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
