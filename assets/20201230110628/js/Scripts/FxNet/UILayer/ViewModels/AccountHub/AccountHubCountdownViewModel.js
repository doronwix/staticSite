define(
    'viewmodels/accounthub/AccountHubCountdownViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'userflow/UserFlowBroker1'
    ],
    function AccountHubCountdownViewModelDef(require) {
        var KoComponentViewModel = require('helpers/KoComponentViewModel'),
            ko = require('knockout'),
            general = require('handlers/general');

        var AccountHubCountdownViewModel = general.extendClass(KoComponentViewModel, function AccountHubCountdownViewModelClass(params) {
            var self = this,
                parent = this.parent,
                data = this.Data, // inherited from KoComponentViewModel
                lastDaysForUpdate = 4;

            function init() {
                setData();
            }

            function setData() {
                data.daysCounter = params.daysCounter;
                data.maxDaysCounter = params.maxDaysCounter;
                data.userMessage = params.userMessage;
                data.userStatus = params.userStatus;
                data.stepClick = params.stepClick;
                data.remainingDaysUpdateMsg = params.remainingDaysUpdateMsg;

                data.requireUpdateCssClass = data.daysCounter > lastDaysForUpdate ? '' : 'updateRequireColor';
                data.isProgressBarVisible = data.daysCounter <= data.maxDaysCounter ? 1 : 0;
            }

            function dispose() {
                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        function createViewModel(params) {
            var viewModel = new AccountHubCountdownViewModel(params || {});

            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
