define(
    'FxNet/LogicLayer/Deal/SentimentsConnManager',
    [
        'configuration/initconfiguration',
        'FxNet/LogicLayer/GeneralManager/TradingInfoConnManager',
        'StateObject!SentimentsConnManager',
    ],
    function SentimentsConnManager(initConfiguration, tradingInfoConnManager, stateObject) {
        var hubname = initConfiguration.MarketInfoConfiguration.hubname,
            clientCallback,
            subscribeGroups = {}; //the key is instrumentid

        function messageReceivedCallback(message, instrumentid) {
            if (!subscribeGroups[instrumentid]) {
                return;
            }

            subscribeGroups[instrumentid].done = true;

            if (!message) {
                return;
            }

            if (typeof clientCallback === "function") {
                clientCallback(message);
            }
        }

        function setMessageReceivedCallback(callback) {
            clientCallback = callback;
        }

        function reSubscribe() {
            for (var instrumentId in subscribeGroups) {
                if (subscribeGroups.hasOwnProperty(instrumentId)) {
                    subscribeGroups[instrumentId].done = false;
                    tradingInfoConnManager.Subscribe(hubname, subscribeGroups[instrumentId].args);
                }
            }
        }

        function subscribe(brokerId, instrumentId) {
            var args = [brokerId, instrumentId];

            subscribeGroups[instrumentId] = {
                args: args,
                done: false
            };

            tradingInfoConnManager.Subscribe(hubname, args);
        }

        function unsubscribe(brokerId, instrumentId) {
            var args = [brokerId, instrumentId];

            tradingInfoConnManager.Unsubscribe(hubname, args);
        }

        function dispose() {
            stateObject.unset('IsServiceAvailable');
            tradingInfoConnManager.Dispose();
        }

        function serviceAvailableCallback(stateAvalilableValue) {
            var serviceAvailablilityPreviousStatus = stateObject.get('IsServiceAvailable'),
                serviceAvailablilityCurrentStatus = !!stateAvalilableValue;

            stateObject.update('IsServiceAvailable', serviceAvailablilityCurrentStatus);

            if (!serviceAvailablilityPreviousStatus && serviceAvailablilityCurrentStatus) {
                reSubscribe();
            }
        }

        function init() {
            stateObject.set('IsServiceAvailable', false);
            tradingInfoConnManager.UpdateCallbacks(hubname, messageReceivedCallback, serviceAvailableCallback);
        }

        init();

        return {
            SetMessageReceivedCallback: setMessageReceivedCallback,
            Subscribe: subscribe,
            Unsubscribe: unsubscribe,
            Dispose: dispose
        };
    }
);
