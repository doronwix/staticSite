define(
    'deviceviewmodels/Deals/Revised/DealToolsViewModel',
    [
        'require',
        'handlers/general',
        'global/storagefactory',
        'deviceviewmodels/Deals/Modules/DealToolsModule',
        'StateObject!Transaction'
    ],
    function (require) {
        var general = require('handlers/general'),
            StorageFactory = require('global/storagefactory'),
            Module = require('deviceviewmodels/Deals/Modules/DealToolsModule'),
            stateObject = require('StateObject!Transaction');

        var DealToolsViewModel = general.extendClass(Module.ViewModel, function DealToolsClass() {
            var self = this,
                parent = this.parent,
                data = this.Data,
                stateObjectSubscriptions = [],
                slipVisitedKey = 'slipVisited',
                storageFactory = StorageFactory(StorageFactory.eStorageType.local);

            function init(params) {
                parent.init.call(self, params);

                stateObjectSubscriptions.push({
                    unsubscribe: stateObject.subscribe(eStateObjectTopics.ReadyForUse, function (isReady) {
                        if (isReady) {
                            handleVisibilityOnFirstView();
                        }
                    })
                });
            }

            function handleVisibilityOnFirstView() {
                var slipVisited = storageFactory.getItem(slipVisitedKey);

                if (!slipVisited) {
                    storageFactory.setItem(slipVisitedKey, true);
                    data.showTools(true);
                }
            }

            function dispose() {
                while (stateObjectSubscriptions.length > 0) {
                    stateObjectSubscriptions.pop().unsubscribe();
                }

                parent.dispose.call(self);  // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose
            };
        });

        var createViewModel = function (params) {
            var viewModel = new DealToolsViewModel();

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