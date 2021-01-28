define(
    'deviceviewmodels/account/UserFlowViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'StateObject!userFlow',
        'viewmodels/account/UserFlowBaseViewModel',
        'deviceviewmodels/account/UserFlowCTA',
    ],
    function UserFlowDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            UserFlowBaseViewModel = require('viewmodels/account/UserFlowBaseViewModel'),
            UserFlowCTA = require('deviceviewmodels/account/UserFlowCTA');

        var UserFlowViewModel = general.extendClass(UserFlowBaseViewModel, function UserFlowClass() {
            var self = this,
                parent = self.parent;

            function init(customSettings) {
                parent.init(customSettings);

                parent.data.stepClick = function (step) {
                    ko.postbox.publish('action-source', 'HubMap');
                    UserFlowCTA.getUserFlowAction(step)();
                };

                parent.data.ctaClick = function () {
                    ko.postbox.publish('action-source', 'HubCTA');
                    UserFlowCTA.getUserFlowAction(parent.data.cta())();
                };
            }

            return {
                init: init,
                dispose: parent.dispose,
                data: parent.data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new UserFlowViewModel();
            viewModel.init(params);
            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
