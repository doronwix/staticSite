define(
    'deviceviewmodels/MainChartViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/ChartSettingManager',
        'managers/AdvinionChart/AdvinionChartsManager',
        'configuration/initconfiguration',
        'StateObject!Transaction'
    ],
    function MainChartDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            AdvinionChartsManager = require('managers/AdvinionChart/AdvinionChartsManager'),
            chartSettingManager = require('managers/ChartSettingManager'),
            advinionChartSettings = require("configuration/initconfiguration").AdvinionChartConfiguration,
            stateObject = require('StateObject!Transaction');

        var MainChartViewModel = general.extendClass(koComponentViewModel, function MainChartClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data,
                defaultIsExpandedValue = true; // inherited from KoComponentViewModel

            //-------------------------------------------------------
            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                if (!AdvinionChartsManager.IsChartManagerLoaded()) {
                    AdvinionChartsManager.Init(advinionChartSettings);
                }

                setDefaultObservables();
                setSubscribers();
            }

            //-------------------------------------------------------
            function setDefaultObservables() {
                data.showTransaction = stateObject.set('showTransaction', ko.observable(getIsExpandedInitialValue()));
                data.isTransactionContainerExpanded = stateObject.get('showTransaction');
            }

            //-------------------------------------------------------
            function setSubscribers() {
                self.subscribeTo(data.isTransactionContainerExpanded, persistIsExpanded);
            }

            //-------------------------------------------------------
            function getIsExpandedInitialValue() {
                var isExpanded = chartSettingManager.Chart().isTransactionContainerExpanded;

                if (general.isBooleanType(isExpanded)) {
                    return isExpanded;
                } else {
                    persistIsExpanded(defaultIsExpandedValue);

                    return defaultIsExpandedValue;
                }
            }

            //-------------------------------------------------------
            function persistIsExpanded(isExpanded) {
                chartSettingManager.Chart().isTransactionContainerExpanded = isExpanded;
                chartSettingManager.SaveChart();
            }

            //-------------------------------------------------------
            function toggleTransactionContainer() {
                data.isTransactionContainerExpanded(!data.isTransactionContainerExpanded());
            }

            function dispose() {
                data.showTransaction(true);
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                ToggleTransactionContainer: toggleTransactionContainer,
                AdvinionChartsManager: AdvinionChartsManager
            };
        });

        function createViewModel(params) {
            var viewModel = new MainChartViewModel();

            viewModel.init(params);

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
