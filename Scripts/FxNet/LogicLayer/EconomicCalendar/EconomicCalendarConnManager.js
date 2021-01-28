define(
    'FxNet/LogicLayer/EconomicCalendar/EconomicCalendarConnManager',
    [
        'Q',
        'configuration/initconfiguration',
        'FxNet/LogicLayer/GeneralManager/TradingInfoConnManager',
        'StateObject!EconomicCalendarConnManager',
        'handlers/general'
    ],
    function EconomicCalendarConnManager(Q, config, tradingInfoConnManager, stateObject, general) {
        var economicCalendarConfig = config.EconomicCalendarConfiguration,
            hubname = economicCalendarConfig.hubname,
            clientMessageReceivedCallbacks = {}, //dictionary, the key is view name
            subscribeGroups = {}; //dictionary, the key is groupId

        function messageReceivedCallback(message, groupId, mode) {
            if (subscribeGroups[groupId]) {
                var clientViewNameOfGroup = subscribeGroups[groupId].name;
                var clientMessageCallback = clientMessageReceivedCallbacks[clientViewNameOfGroup];

                subscribeGroups[groupId].done = true;

                if (typeof clientMessageCallback === 'function') {
                    clientMessageCallback(message, mode);
                }
            }
        }

        function setMessageReceivedCallback(clientName, callback) {
            clientMessageReceivedCallbacks[clientName] = callback;
        }

        function reSubscribe() {
            for (var groupId in subscribeGroups) {
                if (subscribeGroups.hasOwnProperty(groupId)) {
                    subscribeGroups[groupId].done = false;
                    tradingInfoConnManager.SubscribeByGroup(hubname, subscribeGroups[groupId].args, groupId);
                }
            }
        }

        function serviceAvailableCallback(stateAvalilableValue) {
            var serviceAvailablilityPreviousStatus = stateObject.get('IsServiceAvailable'),
                serviceAvailablilityCurrentStatus = !!stateAvalilableValue;

            stateObject.update('IsServiceAvailable', serviceAvailablilityCurrentStatus);

            if (!serviceAvailablilityPreviousStatus && serviceAvailablilityCurrentStatus) {
                reSubscribe();
            }
        }

        function subscribe(clientName, args) {
            args = args || {};

            var groupid = general.createGuid();

            subscribeGroups[groupid] = { name: clientName, args: args, done: false };

            tradingInfoConnManager.SubscribeByGroup(hubname, args, groupid);

            return groupid;
        }

        function unsubscribe(groupid) {
            delete subscribeGroups[groupid];

            tradingInfoConnManager.Unsubscribe(hubname, groupid);
        }

        function dispose() {
            stateObject.unset('IsServiceAvailable');
            tradingInfoConnManager.Dispose();
        }

        function init() {
            stateObject.set('IsServiceAvailable', false);
            tradingInfoConnManager.UpdateCallbacks(hubname, messageReceivedCallback, serviceAvailableCallback);
        }

        function whenAvailable() {
            var defer = Q.defer(),
                unsubscribeFromStateObject;

            var isAvailable = stateObject.get('IsServiceAvailable');

            if (isAvailable) {
                defer.resolve(true);
            }
            else {
                unsubscribeFromStateObject = stateObject.subscribe('IsServiceAvailable', function (status) {
                    unsubscribeFromStateObject();

                    if (status) {
                        defer.resolve(true);
                    }
                    else {
                        defer.resolve(false);
                    }
                });
            }

            return defer.promise;
        }

        init();

        return {
            Init: init,
            WhenAvailable: whenAvailable,
            SetMessageReceivedCallback: setMessageReceivedCallback,
            Subscribe: subscribe,
            Unsubscribe: unsubscribe,
            Dispose: dispose
        };
    }
);
