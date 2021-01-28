define(
    'dataaccess/DalTradingInfoSrv',
    [
        'generalmanagers/ErrorManager',
        "handlers/Delegate",
        'vendor/jquery.signalR',

    ],
    function (ErrorManager, delegate) {
        var eConnectionState = {
            initial: -1,
            connecting: $.signalR.connectionState.connecting, //0
            connected: $.signalR.connectionState.connected, //1
            reconnecting: $.signalR.connectionState.reconnecting, //2
            disconnecting: 3,
            disconnected: $.signalR.connectionState.disconnected //4
        };

        function DalTradingInfoSrv(url) {
            var connection,
                serverUrl = url,
                proxies = [],
                messageCallbacks = [],
                connectionState = eConnectionState.initial,
                ServiceAvailableEvent = new delegate();

            var connect = function (token) {
                connection.qs = { 'authToken': token };

                ErrorManager.onWarning("dalTradingInfoSrv/connect", "token=" + connection.qs.authToken + " connectionState=" + connectionState)

                connection
                    .start()
                    .done(function () {
                        ServiceAvailableEvent.Invoke(true);
                    })
                    .fail(function (error) {
                        ServiceAvailableEvent.Invoke(false);

                        ErrorManager.onError(
                            "dalTradingInfoSrv/connect failed",
                            error,
                            eErrorSeverity.warning);
                    });
            };

            var disconnect = function () {
                ErrorManager.onWarning("dalTradingInfoSrv/disconnect", "disconnect")
                connectionState = eConnectionState.disconnecting;
                connection.stop();
                connection.disconnected();
            };

            var unsubscribe = function (hubName, args) {
                ErrorManager.onWarning("dalTradingInfoSrv/unsubscribe", "unsubscribe hubName=" + hubName + " connectionState=" + connectionState)
                var hubProxy = proxies[hubName];

                if (connectionState === eConnectionState.connected) {
                    hubProxy
                        .invoke('unsubscribe', args)
                        .done(function () { })
                        .fail(function (error) {
                            if (connectionState !== eConnectionState.disconnected && connectionState !== eConnectionState.disconnecting) {
                                ErrorManager.onError(
                                    "dalTradingInfoSrv/unsubscribe failed for hub" + hubName,
                                    error,
                                    eErrorSeverity.warning);
                            }
                        });
                }
            };

            var subscribeByGroup = function (hubName, args, groupId) {
                ErrorManager.onWarning("dalTradingInfoSrv/subscribeByGroup", "subscribeByGroup hubName=" + hubName + " connectionState=" + connectionState)
                var hubProxy = proxies[hubName];

                if (hubProxy && connectionState === eConnectionState.connected) {
                    hubProxy
                        .invoke('subscribe', groupId, args)
                        .done(function () { })
                        .fail(function (error) {
                            if (connectionState !== eConnectionState.disconnected && connectionState !== eConnectionState.disconnecting) {
                                ErrorManager.onError(
                                    "dalTradingInfoSrv/subscribeByGroup failed for hub " + hubName,
                                    error,
                                    eErrorSeverity.warning);
                            }
                        });
                }
            };

            var subscribe = function (hubName, args) {
                ErrorManager.onWarning("dalTradingInfoSrv/subscribe", "subscribe hubName=" + hubName + " connectionState=" + connectionState)
                var hubProxy = proxies[hubName];

                if (hubProxy && connectionState === eConnectionState.connected) {
                    hubProxy
                        .invoke('subscribe', args)
                        .done(function () { })
                        .fail(function (error) {
                            if (connectionState !== eConnectionState.disconnected && connectionState !== eConnectionState.disconnecting) {
                                ErrorManager.onError(
                                    "dalTradingInfoSrv/subscribe failed for hub " + hubName,
                                    error,
                                    eErrorSeverity.warning);
                            }
                        });
                }
            };

            function initConnection(disconectSubscribeHandler) {
                ErrorManager.onWarning("dalTradingInfoSrv/initConnection", "initConnection")
                connection = $.hubConnection(serverUrl);

                connection.stateChanged(function (state) {
                    connectionState = state.newState; //the old is state.oldState
                });

                connection.reconnected(function () {
                    ErrorManager.onWarning("dalTradingInfoSrv", "connection.reconnected triggered")
                    ServiceAvailableEvent.Invoke(true);
                });

                connection.error(function (error) {
                    ServiceAvailableEvent.Invoke(false);

                    ErrorManager.onError(
                        "dalTradingInfoSrv/connect failed",
                        error,
                        eErrorSeverity.warning);
                });

                connection.disconnected(function () {
                    disconectSubscribeHandler();
                });
            }

            function createHub(hubName) {
                var hubProxy = connection.createHubProxy(hubName);

                if (hubProxy) {
                    hubProxy.on('onUpdateClient',
                        function (message, groupId, mode) {
                            messageReceived(hubName, message, groupId, mode);
                        });

                    hubProxy.on('empty',
                        function (groupId, error) {
                            messageReceived(hubName, null, groupId);
                        });
                }

                proxies[hubName] = hubProxy;
            }

            function updateCallbacks(hubName, messageReceivedCallback, serviceAvailableCallback) {
                ErrorManager.onWarning("dalTradingInfoSrv/updateCallbacks", "hubname=" + hubName)
                serviceAvailableCallback(connectionState === eConnectionState.connected);

                ServiceAvailableEvent.Add(serviceAvailableCallback);
                messageCallbacks[hubName] = messageReceivedCallback;
            }

            function messageReceived(hubName, message, groupId, mode) {
                messageCallbacks[hubName](message, groupId, mode);
            }

            return {
                CreateHub: createHub,
                UpdateCallbacks: updateCallbacks,
                InitConnection: initConnection,
                Connect: connect,
                Disconnect: disconnect,
                Subscribe: subscribe,
                SubscribeByGroup: subscribeByGroup,
                Unsubscribe: unsubscribe
            };
        }

        return DalTradingInfoSrv;
    }
);
