define('dataaccess/dalClaims',
    [
        'require',
        'generalmanagers/ErrorManager'
    ],
    function TDALClaims(require) {
        var ErrorManager = require('generalmanagers/ErrorManager');

        function getClaim(actionType, recordType, accountNumber) {
            var ajaxer = TAjaxer(),
                callerInfo = 'Claims/GetUploadClaim';

            return ajaxer.promises
                .jsonPost(
                    'TDALClaims/GetUploadClaim',
                    callerInfo,
                    JSON.stringify({ actionType: actionType, recordType: recordType, account: accountNumber }))
                .fail(onError.bind(null, callerInfo));
        }

        function onError(callerInfo, error) {
            ErrorManager.onError(callerInfo, error.message, eErrorSeverity.medium);
        }

        function postGetCCClaim(actionType, recordTypes, accountNumber) {
            var ajaxer = TAjaxer();

            return ajaxer.promises.jsonPost(
                'TDALClaims/GetCCClaims',
                'Claims/GetCCClaims',
                JSON.stringify({ actionType: actionType, recordTypes: recordTypes, account: accountNumber })
            );
        }

        return {
            getClaim: getClaim,
            postGetCCClaim: postGetCCClaim
        };
    }
);