define(
    "dataaccess/dalClientState",
    [
        "require",
        'generalmanagers/ErrorManager',
        'handlers/SyncRequestHelper',
        'handlers/Logger',
        "handlers/Ajaxer"
    ],
    function (require) {
        var ErrorManager = require('generalmanagers/ErrorManager'),
            SyncRequestHelper = require('handlers/SyncRequestHelper'),
            Logger = require('handlers/Logger');

        function TDALClientState() {
            var dataAjaxer = new TAjaxer(),
                quotesAjaxer = new TAjaxer(),
                clientStateSlaTimeout = systemInfo.slaTimeout || 1000,
                maxRetries = 1000;

            function logWrittenSuccessfully() {
                clientStateSlaTimeout += 1000;
            }

            function checkAjaxerStatus(status) {
                status.State = status.State || eAjaxerState.None;

                if (status.State === eAjaxerState.SlaCompromised) {
                    status.Data = status.Data || {};
                    var warningMessage = "SLA has been compromised: " + JSON.stringify(status);

                    if (typeof Logger !== 'undefined') {
                        Logger.warn("TDALClientState", warningMessage, logWrittenSuccessfully, eErrorSeverity.warning);
                    }
                }
                else if (status.State === eAjaxerState.Retry) {
                    // console.log("Retry the last request: " + JSON.stringify(status.Data));
                }
            }

            function getData(requestMode, OnLoadComplete) {
                var promise = dataAjaxer.promises.get(
                    "TDALClientState/getData",
                    "api/clientstate/GetData/" + requestMode + '/' + $initialDataManager.prop.csmg,
                    "",
                    OnLoadComplete,
                    function () {
                        ErrorManager.onError("TDALClientState/getData", "", eErrorSeverity.high);
                    },
                    0,
                    maxRetries,
                    clientStateSlaTimeout
                );

                promise.progress(checkAjaxerStatus)
                    .done();
            }

            function getQuotesData(requestMode, OnLoadComplete) {
                var promise = quotesAjaxer.promises.get(
                    "TDALClientState/getQuotesData",
                    "api/clientstate/GetQuotesData/" + requestMode + '/' + $initialDataManager.prop.csmg,
                    "",
                    OnLoadComplete,
                    function () {
                        ErrorManager.onError("TDALClientState/getQuotesData", "", eErrorSeverity.high);
                    },
                    0,
                    maxRetries,
                    clientStateSlaTimeout
                );

                promise.progress(checkAjaxerStatus)
                    .done();
            }

            function register(list) {
                var params = "SecurityToken=" + systemInfo.securityToken;

                return quotesAjaxer.promises.post("api/ClientState/Register",
                    "api/clientstate/Register/" + $initialDataManager.prop.csmg + "?instruments=" + JSON.stringify(list),
                    params)
                    .then(function (response) {
                        return response.toString() === eOperationStatus.Success.toString();
                    });
            }

            function unregister() {
                var params = "SecurityToken=" + systemInfo.securityToken;
                return quotesAjaxer.promises.post("api/ClientState/Unregister",
                    "api/clientstate/Unregister/" + $initialDataManager.prop.csmg,
                    params)
                    .then(function (response) {
                        return response.toString() === eOperationStatus.Success.toString();
                    });
            }

            function setDisplaySymbol(symbolId) {
                var params = "SecurityToken=" + systemInfo.securityToken;
                var response = SyncRequestHelper("api/clientstate/SetDisplaySymbol/" + $initialDataManager.prop.csmg + "/" + symbolId, params);

                if (response && response.status == 200) {
                    return response.responseText == eOperationStatus.Success;
                }

                return false;
            }

            function getclientStateSlaTimeout() {
                return clientStateSlaTimeout;
            }

            return {
                GetData: getData,
                GetQuotesData: getQuotesData,
                Register: register,
                Unregister: unregister,
                SetDisplaySymbol: setDisplaySymbol,
                GetclientStateSlaTimeout: getclientStateSlaTimeout
            };
        }

        return new TDALClientState();
    }
);
