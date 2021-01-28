define(
    'cachemanagers/SocketCacheManager',
    [
        'require',
        'handlers/general',
        'dataaccess/dalsocketclientstate',
        'generalmanagers/ErrorManager',
        'StateObject!SystemNotificationEvents',
        "handlers/Delegate",
        "initdatamanagers/Customer"
    ],
    function (require) {
        var TDALSocketClientState = require('dataaccess/dalsocketclientstate'),
            general = require('handlers/general'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            stateObject = require("StateObject!SystemNotificationEvents"),
            delegate = require("handlers/Delegate"),
            customer = require("initdatamanagers/Customer"),
            csmStateObject = require('StateObject!Csm');

        function SocketCacheManager(clientStateDataProcessor) {
            var dalSocketClientState;
            var firstLoad = Q.defer();
            var onLoadRequest = new delegate();
            var onRegisterRequest = new delegate();
            
            
            // var clientStateBurstInterval = 100;
            var messageGapThreshold = 1;
            var prevMessageId = -1;
            var prevMsgServerTime = null;
            var prevMsgClientTime = null;

            try {
                dalSocketClientState = new TDALSocketClientState();
                dalSocketClientState.registerMessageCallback(onLoadComplete);
                dalSocketClientState.registerReconnectedCallback(onReconnected);
                dalSocketClientState.registerDisconnectedCallback(onDisconnected);

            } catch (e) {
                ErrorManager.onError("SocketCacheManager/SocketCacheManager", "cannot establish socket connection", eErrorSeverity.medium);
                throw e;
            }

            function onReconnected() {
                whenConnectionReady()
                    .then(function () {
                        onRegisterRequest.Invoke(eSubscriptionRequestFlags.All, true);
                    }).then(function () {
                        csmStateObject.update(eStateObjectTopics.CsmOutOfDate, false); 
                    })
                    .done();
            }

            function onDisconnected() {
                csmStateObject.update(eStateObjectTopics.CsmOutOfDate, true); 
            }

            function messageNumberSequenced(msgId, msgServerTime) {
                //if received initial start count again
                //Initial: msgId=0, Update:msgId>0
                if (!general.isNumber(msgId)) {
                    return false;
                }

                var msgClientTime = new Date().toISOString();

                if (msgId > 0 && prevMessageId > -1 && Math.abs(msgId - prevMessageId) > messageGapThreshold) {

                    ErrorManager.onWarning("missed messages," +
                        "\nprevious=" + prevMessageId + ", serverTime: " + prevMsgServerTime + ", clientTime: " + prevMsgClientTime + "," +
                        "\nnext=" + msgId + ", serverTime: " + msgServerTime + ", clientTime: " + msgClientTime);

                    onReconnected();
                    prevMessageId = -1;

                    return false;
                }
                prevMessageId = msgId;
                prevMsgServerTime = msgServerTime;
                prevMsgClientTime = msgClientTime;

                return true;
            }

            function onLoadComplete(msgObj) {
                //error message do not have msgid     
                if (!general.isNullOrUndefined(msgObj.msgId) && !messageNumberSequenced(msgObj.msgId, msgObj.time)) {
                    return;
                }
                var _isReinitialized = msgObj.message === "INITIAL";

                if (_isReinitialized || (customer && customer.prop.csmTrace()) ){
                    ErrorManager.onWarning("msgObj_mode: " + msgObj.message + ", msgObj_id: " + msgObj.msgId + ", msgObj_id: " + msgObj.time);
                }


                onLoadRequest.Invoke();
                processData(msgObj.data, _isReinitialized);
            }

            // supporting cache manager interface with nop that return fulfilled
            function loadData() {
                return Q.all([whenConnectionReady(), firstLoad.promise]);
            }

            function setDisplaySymbol(newSymbol) {
                whenConnectionReady()
                    .then(function () {
                        dalSocketClientState.SetDisplaySymbol(newSymbol);
                    })
                    .done();
            }

            function processData(data, reinitialize) {
                if (data && data.length > 0) {
                    clientStateDataProcessor.processData(data, reinitialize);
                }

                firstLoad.resolve();
            }

            function register(requestList, flag, _isReinitialized) {
                whenConnectionReady()
                    .then(function () {
                        dalSocketClientState.Register(requestList, flag, _isReinitialized);
                    })
                    .done();
            }

            function unregister() {}

            function whenConnectionReady() {
                return dalSocketClientState.HasStarted();
            }

            stateObject.set(eShutDownHandlerTopics.stopClientStateManagerCalls, null);
            stateObject.subscribe(eShutDownHandlerTopics.stopClientStateManagerCalls, function () {
                ErrorManager.onWarning("connection stop eShutDownHandlerTopics.stopClientStateManagerCalls");
                dalSocketClientState.StopConnection();
            });

            return {
                Register: register,
                LoadData: loadData,
                Unregister: unregister,
                SetDisplaySymbol: setDisplaySymbol,
                LoadFinished: loadData,
                OnLoadRequest: onLoadRequest,
                OnRegisterRequest: onRegisterRequest
            };
        }

        return SocketCacheManager;
    }
);