define(
    'viewmodels/AccountBalanceViewModel',
    [
        'require',
        'knockout',
        'cachemanagers/ClientStateHolderManager'
    ],
    function AccountBalanceViewModel(require) {
        var ko = require('knockout'),
            csHolder = require('cachemanagers/ClientStateHolderManager');

        var viewProperties = {
            accountBalance: ko.observable(),
        };

        var unsubscribeFromCsHolder;

        var init = function () {
            subscribeToCsHolder();
        };

        var subscribeToCsHolder = function () {
            csHolder.OnChange.Add(updateAccountBalance);
            unsubscribeFromCsHolder = function () {
                csHolder.OnChange.Remove(updateAccountBalance);
            };
        };

        var updateAccountBalance = function (data) {
            viewProperties.accountBalance(data.accountBalance);
        };

        var stop = function () {
            if (unsubscribeFromCsHolder) {
                unsubscribeFromCsHolder();
            }
        };

        return {
            Init: init,
            Stop: stop,
            ViewProperties: viewProperties,
        };
    }
);
