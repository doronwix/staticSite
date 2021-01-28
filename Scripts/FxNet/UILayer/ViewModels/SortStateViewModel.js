define(
    'viewmodels/SortStateViewModel',
    [
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel'
    ],
    function (ko, general, koComponentViewModel) {
        var SortStateViewModel = general.extendClass(koComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                sortPropertiesObs = params.sortPropertiesObs,
                sortProperty = params.sortProperty,
                setSorting = params.setSorting || function () { },
                sortDir = ko.observable(""),
                defaultAsc = params.defaultAsc || false; /* desc => asc => none*/

            function init() {
                parent.init.call(self);

                self.parent.subscribeTo(params.sortPropertiesObs, function sortSubscription(newValue) {
                    if (newValue.sortProperty === sortProperty) {
                        syncSortStatus(newValue.asc);
                    } else {
                        syncSortStatus();
                    }
                }, self);

                syncSortStatus(sortPropertiesObs().sortProperty === sortProperty ? sortPropertiesObs().asc : null);
            }
            
            function syncSortStatus(asc) {
                var sortDirection = '';

                if (general.isBooleanType(asc)) {
                    sortDirection = asc ? 'up' : 'down';
                } 

                sortDir(sortDirection);
            }

            function onChangeSort(asc) {
                setSorting(true, sortProperty, asc);
            }

            function changeSort() {
                var currentIsAsc = sortPropertiesObs().sortProperty === sortProperty ? sortPropertiesObs().asc : null;

                if (!general.isBooleanType(currentIsAsc)) {
                    onChangeSort(defaultAsc);
                    return;
                }

                onChangeSort(!currentIsAsc);
            }

            init();

            return {
                sortDir: sortDir,
                changeSort: changeSort
            }
        });

        var createViewModel = function (params) {
            var viewModel = new SortStateViewModel(params);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);