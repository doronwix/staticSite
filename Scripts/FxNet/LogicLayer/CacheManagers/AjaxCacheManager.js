define(
    'cachemanagers/AjaxCacheManager',
    [
        'require',
        'Q',
        'JSONHelper',
        'dataaccess/dalClientState',
        'handlers/general',
        'generalmanagers/ErrorManager',
        'StateObject!Csm',
        'StateObject!SystemNotificationEvents',
        "handlers/Delegate",
    ],
    function (require) {
        var
            Q = require('Q'),
            JSONHelper = require('JSONHelper'),
            general = require('handlers/general'),
            dalClientState = require('dataaccess/dalClientState'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            csmStateObject = require('StateObject!Csm'),
            stateObject = require("StateObject!SystemNotificationEvents"),
            delegate = require("handlers/Delegate");


        function AjaxCacheManager(clientStateDataProcessor) {
            var requestMode = eRequestMode.Initial,
                stopAll = false,
                csmTimerId = 0,
                regTimerId = 0,
                csmOutOfDateTimerId = 0,
                lastUpdateTime = new Date().getTime(),
                firstLoad = Q.defer(),
                onLoadRequest = new delegate(),
                onRegisterRequest = new delegate(),
                forceInitial = false,
                csmOutOfDateTimeoutCounter = 0;

            function onLoadComplete(defer, mode, responseText) {
                var response = JSONHelper.STR2JSON("CacheManager/onLoadComplete", responseText, eErrorSeverity.high);
                response = response || {};

                if (response.status == eOperationStatus.Success) {
                    response.clientStateResult = response.clientStateResult || eClientStateResult.NotFound;
                    // on error register all
                    if (response.clientStateResult != eClientStateResult.Success) {

                        getRegistrationNextDataCall(function registrationNextDataCall() {
                            onRegisterRequest.Invoke(eSubscriptionRequestFlags.All, true);
                            csmStateObject.update(eStateObjectTopics.CsmOutOfDate, true);
                        });
                        defer.resolve();
                    } else {
                        var isReinitialized = mode === eRequestMode.Initial;

                        processData(response.data, isReinitialized);

                        csmStateObject.update(eStateObjectTopics.CsmOutOfDate, false);
                        if (csmOutOfDateTimerId) {
                            clearTimeout(csmOutOfDateTimerId);
                            csmOutOfDateTimerId = 0;
                        }
                        defer.resolve();
                    }
                }

                getCSMNextDataCall(function csmNextDataCall() {
                    var clientStateLatencyInterval =
                        parseInt(systemInfo.clientApplicationParams[eClientParams.ClientStateLatencyInterval]) +
                        dalClientState.GetclientStateSlaTimeout();

                    onLoadRequest.Invoke();

                    csmOutOfDateTimerId = setTimeout(function onCsmOutOfDate() {
                        csmOutOfDateTimeoutCounter += 1;
                        ErrorManager.onWarning("AjaxerCacheManager", 'CSM out-dated data: latency_of=' +
                            clientStateLatencyInterval + ",counter=" + csmOutOfDateTimeoutCounter);
                        //csmStateObject.update(eStateObjectTopics.CsmOutOfDate, true);
                    }, clientStateLatencyInterval);
                });
            }

            function loadData(reqmode) {
                var mode = general.isDefinedType(reqmode) ? reqmode : requestMode;
                var defer = Q.defer();

                if (!stopAll) {
                    lastUpdateTime = new Date().getTime();
                    dalClientState.GetData(mode, onLoadComplete.bind(this, defer, mode));
                }

                return defer.promise;
            }

            function setDisplaySymbol(newSymbol) {
                if (dalClientState.SetDisplaySymbol(newSymbol)) {
                    reloadInitialData(eSubscriptionRequestFlags.All);
                }
            }

            function setRequestMode(state) {
                if (state == eRequestMode.Initial) {
                    requestMode = eRequestMode.Initial;
                    //do not touch this param, its critical to sync between register and csm threads
                    forceInitial = true;
                } else {
                    requestMode = eRequestMode.Correct;
                }
            }

            function reloadInitialData(flags) {
                switch (flags) {
                    case eSubscriptionRequestFlags.Quotes:
                        dalClientState.GetQuotesData(eRequestMode.Initial, onReLoadQuotesInitialComplete);
                        break;
                    case eSubscriptionRequestFlags.All:
                        setRequestMode(eRequestMode.Initial);
                        break;
                    default:
                        break;
                }
            }

            function onReLoadQuotesInitialComplete(responseText) {
                var response = JSONHelper.STR2JSON("CacheManager/onLoadInitialComplete", responseText, eErrorSeverity.high);

                if (response) {
                    processData(response.data);
                }
            }

            function processData(data, reinitialize) {
                if (data && data.length > 0) {
                    clientStateDataProcessor.processData(data, reinitialize);
                    setRequestMode(eRequestMode.Correct);
                }

                firstLoad.resolve();
            }

            function calculateNextPeriod() {
                var clientInterval = parseInt(systemInfo.clientApplicationParams[eClientParams.Interval]);
                var nowTime = new Date().getTime();
                var diff = nowTime - lastUpdateTime;
                var nextUpdate = clientInterval - diff;
                nextUpdate = nextUpdate < 0 ? 0 : nextUpdate;

                return nextUpdate;
            }

            function getRegistrationNextDataCall(method) {
                if (regTimerId) {
                    clearTimeout(regTimerId);
                    regTimerId = 0;
                }

                regTimerId = setTimeout(method, calculateNextPeriod());
            }

            function getCSMNextDataCall(method) {
                if (csmTimerId) {
                    clearTimeout(csmTimerId);
                    csmTimerId = 0;
                }
                if (forceInitial) {
                    setRequestMode(eRequestMode.Initial);// not neccesery, double check
                    forceInitial = false;
                }
                csmTimerId = setTimeout(method, calculateNextPeriod(), requestMode);
            }

            function register(requestList, flag, isReinitialized) {
                dalClientState.Register(requestList)
                    .then(function (response) {
                        if (response) {
                            reloadInitialData(flag);
                        } else if (isReinitialized) {
                            setTimeout(function retryHandler() {
                                onRegisterRequest.Invoke(eSubscriptionRequestFlags.All, true);
                                csmStateObject.update(eStateObjectTopics.CsmOutOfDate, true);
                            }, systemInfo.clientApplicationParams[eClientParams.Interval]);
                        }
                    })
                    .done();
            }

            function unregister() {
                whenLoadFinished()
                    .then(function () {
                        return dalClientState.Unregister();
                    })
                    .done();
            }

            function whenLoadFinished() {
                return firstLoad.promise;
            }
            stateObject.set(eShutDownHandlerTopics.stopClientStateManagerCalls, null);
            stateObject.subscribe(eShutDownHandlerTopics.stopClientStateManagerCalls, function () {
                stopAll = true;

                if (csmTimerId) {
                    clearTimeout(csmTimerId);
                    csmTimerId = 0;
                }
                if (regTimerId) {
                    clearTimeout(regTimerId);
                    regTimerId = 0;
                }
                if (csmOutOfDateTimerId) {
                    clearTimeout(csmOutOfDateTimerId);
                    csmOutOfDateTimerId = 0;
                }
            });

            return {
                Register: register,
                Unregister: unregister,
                LoadData: loadData,
                SetDisplaySymbol: setDisplaySymbol,
                LoadFinished: whenLoadFinished,

                OnLoadRequest: onLoadRequest,
                OnRegisterRequest: onRegisterRequest
            };
        }

        return AjaxCacheManager;
    }
);