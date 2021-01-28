define(
    'dataaccess/dalCompliance',
    [
        'require',
        'Q',
        'handlers/general',
        'handlers/Ajaxer',
        'JSONHelper'
    ],
    function (require) {
        var Q = require('Q'),
            JSONHelper = require('JSONHelper'),
            general = require('handlers/general'),
            TAjaxer = require('handlers/Ajaxer');

        function onDalAjaxError(error, callerInfo) {
            //using window. to avoid cyclic failure in r.js
            window.ErrorManager.onError(callerInfo, error.message, eErrorSeverity.medium);
        }

        function setPepStatus(pepStatus, onLoadComplete) {
            if (!general.isFunctionType(onLoadComplete)) {
                onLoadComplete = general.emptyFn;
            }

            var ajaxer = new TAjaxer(),
                params = 'dataPep=' + pepStatus;

            ajaxer.post(
                'TDALRegulation/setPepStatus',
                'Compliance/SetPepComplianceStatus',
                params,
                onLoadComplete,
                function (error) {
                    window.ErrorManager.onError('DalCompliance/setPepStatus', error.message, eErrorSeverity.medium);
                }
            );
        }

        function getPepStatus(onLoadComplete) {
            if (!general.isFunctionType(onLoadComplete)) {
                onLoadComplete = general.emptyFn;
            }

            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                'TDALRegulation/getPepStatus',
                'Compliance/GetPepComplianceStatus',
                null,
                onLoadComplete,
                function () {
                    window.ErrorManager.onError('DalCompliance/getPepStatus', '', eErrorSeverity.medium);
                }
            );
        }

        function getNotificationsSettings(onLoadComplete) {
            if (!general.isFunctionType(onLoadComplete)) {
                onLoadComplete = general.emptyFn;
            }

            var ajaxer = new TAjaxer();

            return ajaxer.promises.get(
                'TDALRegulation/getNotificationsSettings',
                'Compliance/GetNotificationsSettings',
                '',
                onLoadComplete,
                function () {
                    window.ErrorManager.onError('DalCompliance/getNotificationsSettings', '', eErrorSeverity.medium);
                }
            );
        }

        function setNotificationsSettings(notificationsSettings, onLoadComplete) {
            if (!general.isFunctionType(onLoadComplete)) {
                onLoadComplete = general.emptyFn;
            }

            var params = JSON.stringify(notificationsSettings);
            var ajaxer = new TAjaxer();

            return ajaxer.promises.jsonPost(
                'TDALRegulation/setNotificationsSettings',
                'Compliance/SetNotificationsSettings',
                params,
                onLoadComplete,
                function (error) {
                    window.ErrorManager.onError('DalCompliance/setNotificationsSettings', error.message, eErrorSeverity.medium);
                }
            );
        }

        function logUploadResult(params, onLoadComplete) {
            var ajaxer = new TAjaxer();

            ajaxer.jsonPost(
                'TDALCompliance/LogUploadedDocsActionResult',
                'Compliance/LogUploadedDocsActionResult',
                JSON.stringify(params),
                onLoadComplete,
                function (error) {
                    window.ErrorManager.onError('DalCompliance/LogUploadedDocsActionResult', error.message, eErrorSeverity.medium);
                }
            );
        }

        function logUserShouldCompleteCdd(getRequestData) {
            var ajaxer = new TAjaxer();
            var requestData = JSON.stringify(getRequestData());
            var customerFailedAwareUrl = 'compliance/LogUserShouldCompleteCdd';

            ajaxer.jsonPost(
                'TDALCompliance/LogUserShouldCompleteCdd',
                customerFailedAwareUrl,
                requestData,
                null,
                function (error) {
                    window.ErrorManager.onError('DalCompliance/LogUserShouldCompleteCdd', error.message, eErrorSeverity.medium);
                }
            );
        }

        function getVerificationDocumentUrl(uploadDocType) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .get('TDALCompliance/getVerificationDocumentUrl', 'Compliance/GetVerificationDocumentUrl?uploadDocType=' + uploadDocType)
                .fail(function (error) {
                    window.ErrorManager.onError('DalCompliance/getVerificationDocumentUrl', error.message, eErrorSeverity.medium);
                });
        }

        function getUploadDocumentsData() {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .post('TDALCompliance/getUploadDocumentsData', 'Compliance/GetUploadDocumentsData', null)
                .fail(function (error) {
                    window.ErrorManager.onError('DalCompliance/getUploadDocumentsData', error.message, eErrorSeverity.medium);
                });
        }

        function getDocumentsDataForAccountHub() {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .post('TDALCompliance/getDocumentsDataForAccountHub', 'Compliance/GetDocumentsDataForAccountHub', null)
                .fail(function (error) {
                    window.ErrorManager.onError('DalCompliance/getDocumentsDataForAccountHub', error.message, eErrorSeverity.medium);
                });
        }

        function getwithdrawalrequeststatus(onLoadComplete) {
            if (!general.isFunctionType(onLoadComplete)) {
                onLoadComplete = general.emptyFn;
            }

            var ajaxer = new TAjaxer();

            ajaxer.post(
                'TDALCompliance/getwithdrawalrequeststatus',
                'Compliance/GetWithdrawalRequestStatus',
                null,
                function (result) { onLoadComplete(JSONHelper.STR2JSON('WithdrawalViewModel/onLoadComplete', result, eErrorSeverity.medium)); },
                function (error) {
                    window.ErrorManager.onError('DalCompliance/getwithdrawalrequeststatus', error.message, eErrorSeverity.medium);
                }
            );
        }

        function sendDepositConfirmation(onLoadComplete) {
            if (!general.isFunctionType(onLoadComplete)) {
                onLoadComplete = general.emptyFn;
            }

            var ajaxer = new TAjaxer();

            ajaxer.post(
                'TDALCompliance/sendDepositConfirmation',
                'Compliance/SendDepositConfirmation',
                null,
                onLoadComplete,
                function (error) {
                    window.ErrorManager.onError('DalCompliance/SendDepositConfirmation', error.message, eErrorSeverity.medium);
                }
            );
        }

        function sendExposureCoverage(coverage, onLoadComplete) {
            if (!general.isFunctionType(onLoadComplete)) {
                onLoadComplete = general.emptyFn;
            }

            var ajaxer = new TAjaxer();

            ajaxer.post(
                'TDALCompliance/SendExposureCoverage',
                'Compliance/SendExposureCoverage',
                coverage.toString(),
                onLoadComplete,
                function (error) {
                    window.ErrorManager.onError('DalCompliance/SendExposureCoverage', error.message, eErrorSeverity.medium);
                }
            );
        }

        function sendRequestAccess(requestAccessType) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .jsonPost(
                    'TDALCompliance/RequestAccess',
                    'Compliance/RequestAccess/?' + Math.random(),
                    JSON.stringify({ RequestType: requestAccessType })
                )
                .then(JSON.parse)
                .fail(function (error) {
                    onDalAjaxError(error, 'TDALCompliance/RequestAccess');
                    return Q.reject();
                });
        }

        return {
            setPepStatus: setPepStatus,
            getPepStatus: getPepStatus,
            logUploadResult: logUploadResult,
            getNotificationsSettings: getNotificationsSettings,
            setNotificationsSettings: setNotificationsSettings,
            logUserShouldCompleteCdd: logUserShouldCompleteCdd,
            getUploadDocumentsData: getUploadDocumentsData,
            getDocumentsDataForAccountHub: getDocumentsDataForAccountHub,
            getwithdrawalrequeststatus: getwithdrawalrequeststatus,
            sendDepositConfirmation: sendDepositConfirmation,
            sendExposureCoverage: sendExposureCoverage,
            sendRequestAccess: sendRequestAccess,
            getVerificationDocumentUrl: getVerificationDocumentUrl
        };
    }
);