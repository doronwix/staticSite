define(
    'deviceviewmodels/SignalsViewModel',
    [
        'knockout',
        'handlers/general',
        'viewmodels/BaseSignalsViewModel',
        'configuration/initconfiguration',
        'helpers/CustomKOBindings/InfiniteScrollBinding',
    ],
    function SignalsDef(ko, general, BaseSignalsViewModel, config) {
        var SignalsViewModel = general.extendClass(BaseSignalsViewModel, function SignalsClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                handlers = this.Handlers,
                signalsConfig = config.SignalsConfiguration;

            var init = function (settings) {
                setObservables();
                parent.init.call(self, settings);   // inherited from KoComponentViewModel
                setComputables();
                setHandlers();
            };

            var setObservables = function () {
                data.pageIndex = ko.observable(1);
                data.totalRecords = ko.observable(0);
            };

            var setComputables = function () {
                data.scrollingEnabled = self.createComputed(function () {
                    return data.pageIndex() * signalsConfig.pageSize < data.totalRecords();
                });
            };

            var setHandlers = function () {
                handlers.scrolled = function () {
                    data.pageIndex(data.pageIndex() + 1);
                    ko.postbox.publish('signals-view-more', { pageIndex: data.pageIndex() });
                    parent.updateSignalsList();
                };
            };

            return {
                init: init,
                Handlers: handlers,
                PermissionsModule: parent.permissionsModule
            };
        });

        var createViewModel = function (params) {
            params = params || {};

            var viewModel = new SignalsViewModel(params.filterData || {});
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
