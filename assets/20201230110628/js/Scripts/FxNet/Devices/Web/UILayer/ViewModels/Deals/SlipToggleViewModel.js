define(
    'deviceviewmodels/Deals/SlipToggleViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!Transaction',
        'managers/CustomerProfileManager'
    ],
    function SlipToggleDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            stateObject = require('StateObject!Transaction'),
            customerProfileManager = require('managers/CustomerProfileManager');

        var SlipToggleViewModel = general.extendClass(KoComponentViewModel, function SlipToggleClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                options = Object.assign({}, params);

            function init() {
                parent.init.call(self);   // inherited from KoComponentViewModel
                setObservables();
                setToolsVisibilityByProfile();
                setSubscribers();
            }

            function setObservables() {
                data.showTransaction = stateObject.set('showTransaction', ko.observable(true));
                data.showTools = stateObject.get('showTools') || stateObject.set('showTools', ko.observable(true));
                data.chartFullScreen = stateObject.get('isFullScreen') || stateObject.set('isFullScreen', ko.observable(false));
            }

            function setSubscribers() {
                self.subscribeTo(data.chartFullScreen, function (isFullScreen) {
                    if (!isFullScreen && !options.chartStationPage) {
                        data.showTransaction(true);
                    }
                });
            }

            function setToolsVisibilityByProfile() {
                var profileCustomer = customerProfileManager.ProfileCustomer();
                data.showTools(profileCustomer.tools === 1);
            }

            function toggleTools() {
                var toolsStatus = data.showTools() ? 'minimized' : 'maximized';

                ko.postbox.publish(data.showTools() ? 'deal-slip-collapse-tools' : 'deal-slip-expand-tools', { tools: toolsStatus });
                data.showTools(!data.showTools());
            }

            function toggleTransaction() {
                if (options.chartStationPage) {
                    ko.postbox.publish('tools-chart', { event: 'main-chart-transaction-toggle', isExpanded: !data.showTransaction() });
                }
                else {
                    ko.postbox.publish(data.showTransaction() ? 'deal-chart-collapse-trade-ticket' : 'deal-chart-expand-trade-ticket');
                }

                data.showTransaction(!data.showTransaction());
            }

            return {
                init: init,
                Data: data,
                ToggleTools: toggleTools,
                ToggleTransaction: toggleTransaction,
                options: options
            };
        });

        var createViewModel = function (params) {
            var viewModel = new SlipToggleViewModel(params);
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
