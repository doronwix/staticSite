define('userflow/UserFlowManager',
    [
        'require',
        'knockout',
        'devicemanagers/StatesManager',
        'StateObject!userFlow',
        "global/UrlResolver",
    ],
    function (require) {
        var ko = require('knockout'),
            statesManager = require('devicemanagers/StatesManager'),
            stateObjectUserFlow = require('StateObject!userFlow'),
            urlResolver = require('global/UrlResolver');

        stateObjectUserFlow.set(eStateObjectTopics.UserFlowChanged, null);
        stateObjectUserFlow.set(eStateObjectTopics.ScmmFddLoaded, false);

        statesManager.StartGetCustomerData();

        require(['userflow/UserFlowBroker' + urlResolver.getBroker()], function (ufb) {
            ko.computed(function () {
                var model = ufb();
                stateObjectUserFlow.update(eStateObjectTopics.UserFlowChanged, model);

                ko.postbox.publish('account-state', model.userStatus);
            });
        });
    }
);
