define(
    'deviceviewmodels/ClosedDealsViewModel',
    [
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Deals/ClosedDealsModule',
        'StateObject!ClosedDeals',
        'helpers/CustomKOBindings/InfiniteScrollBinding'
    ],
    function (general, KoComponentViewModel, closedDealsModule, stateObject) {
        var ClosedDealsViewModel = general.extendClass(KoComponentViewModel, function ClosedDealsViewModelClass() {
            var self = this,
                parent = this.parent; // inherited from KoComponentViewModel

            function init() {
                parent.init.call(self);

                var useFilters = stateObject.set(eStateObjectTopics.ClosedDealsUseFilters, false);

                if (useFilters) {
                    stateObject.update(eStateObjectTopics.ClosedDealsUseFilters, false)
                    closedDealsModule.ApplyFilter();
                } else {
                    closedDealsModule.ApplyFilter(true);
                }
            }

            return {
                init: init,
                model: closedDealsModule
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ClosedDealsViewModel(params);
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