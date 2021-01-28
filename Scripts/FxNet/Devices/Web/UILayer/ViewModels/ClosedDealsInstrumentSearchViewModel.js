define(
    'deviceviewmodels/ClosedDealsInstrumentSearchViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        'viewmodels/BaseInstrumentSearchViewModel'
    ],
    function ClosedDealsInstrumentSearchDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dictionary = require('Dictionary'),
            baseViewModel = require('viewmodels/BaseInstrumentSearchViewModel');

        var ClosedDealsInstrumentSearchViewModel = general.extendClass(baseViewModel, function ClosedDealsInstrumentSearchClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            self.searchFocus = ko.observable(true);

            self.onFocus = function () {
                self.searchFocus(true);
            };

            function init(settings) {
                parent.init.call(self, settings);


                setValues();
            }

            function setValues() {
                var instruments = data.list();

                instruments.unshift({
                    id: Number.MAX_SAFE_INTEGER,
                    name: dictionary.GetItem('All_Instruments', 'deals_CloseDeal'),
                    shortTranslation: dictionary.GetItem('All_Instruments', 'deals_CloseDeal')
                });

                data.list(instruments);
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
