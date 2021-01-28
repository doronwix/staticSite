define(
    'generalmanagers/SessionSupervisor',
    [
        'require',
        'JSONHelper',
        'dataaccess/dalCommon',
        'generalmanagers/ErrorManager',
        'generalmanagers/ShutDownHandler',
        'modules/systeminfo',
        'StateObject!SessionSupervisor',
        'StateObject!SystemNotificationEvents',
        'global/storagefactory',
        'enums/DataMembersPositions'
    ],
    function(require) {
        var JSONHelper = require('JSONHelper'),
            dalCommon = require('dataaccess/dalCommon'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            ShutDownHandler = require('generalmanagers/ShutDownHandler'),
            systemInfo = require('modules/systeminfo'),
            stateObject = require('StateObject!SessionSupervisor'),
            stateObjectNotificationsEvents = require('StateObject!SystemNotificationEvents'),
            storageFactory = require('global/storagefactory');

        function SessionSupervisor() {
            var timer = null,
                timeout = 60000,
                stopAll = false,
                sessionStorage = storageFactory(storageFactory.eStorageType.session);

            function start() {
                stateObjectNotificationsEvents.set(eShutDownHandlerTopics.stopKeepAliveCalls, null);
                stateObjectNotificationsEvents.subscribe(eShutDownHandlerTopics.stopKeepAliveCalls, stopDataCalls);

                keepAlive();
            }

            function keepAlive() {
                if (!stopAll) {
                    dalCommon.KeepAlive(onKeepAliveComplete);
                }
            }

            function stopDataCalls() {
                stopAll = true;

                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
            }

            function onKeepAliveComplete(responseText) {
                var response = JSONHelper.STR2JSON('SessionSupervisor/onKeepAliveComplete', responseText, eErrorSeverity.low);

                if (response && response.result != 'SecurityError' && response.result != 'ServerError') {
                    if (response.result[eKeepAlive.Success]) {
                        systemInfo.save('securityToken', response.securityToken);

                        stateObject.update('userLoggedIn', response.userLoggedIn);

                        if (response.isSessionGap) {
                            sessionStorage.removeItem('TrackingSessionId');
                        }

                        if (!stopAll) {
                            if (timer) {
                                clearTimeout(timer);
                                timer = null;
                            }

                            timer = setTimeout(keepAlive, timeout);
                        }
                    }
                    else {
                        switch (response.result[eKeepAlive.Error]) {
                            case eKeepAliveError.SessionMissingOrDuplicate:
                                ShutDownHandler.StopRunningServices();

                                require(['devicealerts/DoubleLoginAlert'], function showDoubleLoginAlert(DoubleLoginAlert) {
                                    DoubleLoginAlert.Show();
                                });                                
                                break;

                            case eKeepAliveError.HttpContextRequired:
                                ErrorManager.onError('Keepalive', 'HttpContextRequired', eErrorSeverity.low);
                                dalCommon.Login(eLoginLogoutReason.sessionSupervisor_keepAliveHttpContextRequired);
                                break;
                        }
                    }
                }
                else {
                    // not logout for caseses of rememeberme
                    dalCommon.Login(eLoginLogoutReason.sessionSupervisor_keepAliveCompleteError);
                }
            }

            return {
                Start: start
            };
        }

        return SessionSupervisor;
    }
);
