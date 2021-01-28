define(
    'userflow/UserFlowBroker2',
    [
        'modules/UserFlowCommon'
    ],
    function () {
        var commonFlow = require('modules/UserFlowCommon');

        function computeFlow() {
            return commonFlow.EMPTY_USER_FLOW;
        }

        return computeFlow;
    }
);
