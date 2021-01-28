define(
    'generalmanagers/ShutDownHandler',
    [
        'require',
        'StateObject!SystemNotificationEvents'
    ],
    function(require) {
        var stateObject = require('StateObject!SystemNotificationEvents');

        function ShutDownHandler() {
            var areServicesStarted = true;

            function stopRunningServices() {
                if (areServicesStarted) {
                    stateObject.update(eShutDownHandlerTopics.stopClientStateManagerCalls);
                    stateObject.update(eShutDownHandlerTopics.stopKeepAliveCalls);
                    stateObject.update(eShutDownHandlerTopics.stopGetRatesRecentWebCalls);
                    stateObject.update(eShutDownHandlerTopics.stopGetActiveIMCalls);
                }

                areServicesStarted = false;
            }

            function restartStoppedServices() {
                if (!areServicesStarted) {
                    stateObject.update(eShutDownHandlerTopics.restartClientStateManagerCalls);
                    stateObject.update(eShutDownHandlerTopics.restartGetActiveIMCalls);
                    stateObject.update(eShutDownHandlerTopics.restartGetRatesRecentWebCalls);
                    stateObject.update(eShutDownHandlerTopics.restartGetActiveIMCalls);
                }

                areServicesStarted = true;
            }

            return {
                StopRunningServices: stopRunningServices,
                RestartStoppedServices: restartStoppedServices
            };
        }

        return new ShutDownHandler();
    }
);