define(
    'deviceviewmodels/DropdownInstrumentSearchViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'viewmodels/BaseInstrumentSearchViewModel'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            instrumentSearchViewModel = require('viewmodels/BaseInstrumentSearchViewModel');


        var ClosedDealsInstrumentSearchViewModel = general.extendClass(instrumentSearchViewModel, function ClosedDealsInstrumentSearchViewModelClass() {
            var self = this,
                parent = this.parent; // inherited from KoComponentViewModel

            self.searchFocus = ko.observable(true);

            self.onFocus = function () {
                self.searchFocus(true);
            };

            function init(settings) {
                parent.init.call(self, settings);
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