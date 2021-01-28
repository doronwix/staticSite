define(
    'deviceviewmodels/ClosedDealsFilterViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Deals/ClosedDealsModule',
        'managers/historymanager',
        'helpers/CustomKOBindings/DatePickerRangerBinding',
        'StateObject!ClosedDeals'
    ],
    function(require) {
        var general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            ClosedDealsModule = require('viewmodels/Deals/ClosedDealsModule'),
            HistoryManager = require('managers/historymanager'),
            stateObject = require('StateObject!ClosedDeals');

        var ClosedDealsFilterViewModel = general.extendClass(KoComponentViewModel, function ClosedDealsFilterViewModelClass() {
            var self = this,
                parent = this.parent; // inherited from KoComponentViewModel

            function init(params) {
                parent.init.call(self, params);
            }

            function close() {
                HistoryManager.Back();
            }

            function clearSelectedInstrument() {
                ClosedDealsModule.Filter.Instrument(null);
            }

            function dispose() {
                stateObject.update(eStateObjectTopics.ClosedDealsUseFilters, true);
                parent.dispose.call(self);
            }
            return {
                init: init,
                dispose: dispose,
                model: ClosedDealsModule,
                Close: close,
                ClearSelectedInstrument: clearSelectedInstrument
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ClosedDealsFilterViewModel();
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