define(
    'deviceviewmodels/AccountClosedDealsViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Deals/ClosedDealsModule',
        'devicemanagers/ViewModelsManager',
        'configuration/initconfiguration'
    ],
    function AccountClosedDealsDef(require) {
        var general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            closedDealsModule = require('viewmodels/Deals/ClosedDealsModule'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            initConfiguration = require("configuration/initconfiguration").ClosedDealsConfiguration;

        var AccountClosedDealsViewModel = general.extendClass(koComponentViewModel, function AccountClosedDealsClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                originalFilter;

            function init() {
                parent.init.call(self);

                initFilter();

                closedDealsModule.ApplyFilter();
            }

            function initFilter() {
                var posNum = viewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vClosedDealsDialog, 'posNum'),
                    closedDealsModuleFilter = closedDealsModule.Filter;

                if (general.isDefinedType(posNum)) {
                    originalFilter = {
                        position: closedDealsModuleFilter.Position(),
                        instrument: closedDealsModuleFilter.Instrument(),
                        from: closedDealsModuleFilter.From(),
                        to: closedDealsModuleFilter.To()
                    }

                    closedDealsModule.ViewData.isOpenedInDialog(true);
                    closedDealsModuleFilter.Position(posNum);
                    closedDealsModuleFilter.InstrumentId(Number.MAX_SAFE_INTEGER);
                    closedDealsModuleFilter.Instrument();
                    closedDealsModuleFilter.From("");
                    closedDealsModuleFilter.To("");
                }
            }

            function dispose() {
                if (originalFilter) {
                    closedDealsModule.Filter.Position(originalFilter.position);
                    closedDealsModule.Filter.Instrument(originalFilter.instrument);
                    closedDealsModule.Filter.From(originalFilter.from);
                    closedDealsModule.Filter.To(originalFilter.to);

                    closedDealsModule.ViewData.isOpenedInDialog(false);
                }

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                model: closedDealsModule,
                scrollMaxVisible: initConfiguration.scrollMaxVisible,
                IsPrintingNow: function () { return false; }
            };
        });

        var createViewModel = function (params) {
            var viewModel = new AccountClosedDealsViewModel(params);
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
