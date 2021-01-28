define(
    'generalmanagers/LocalStoreDoubleTabsListener',
    [
        'require',
        'enums/LoginLogoutReasonEnum',
        'handlers/Cookie',
        'dataaccess/dalCommon'
    ],
    function LocalStoreDoubleTabsListenerDef() {
        var cookieHandler = require('handlers/Cookie'),
            dalCommon = require('dataaccess/dalCommon');

        function localStoreDoubleTabsListener(csmg, checkInterval) {
            function doubleTabsFlow(guid) {
                if (guid && guid !== cookieHandler.ReadCookie('csmg')) {
                    return true;
                }

                return false;
            }

            function iedoubleTabsFlow(guid, delay) {
                var isDt = doubleTabsFlow(guid);

                if (isDt) {
                    dalCommon.Exit(eLoginLogoutReason.initialDataManager_dataError);
                } else {
                    setTimeout(iedoubleTabsFlow, (delay * 2), guid, delay);
                }
            }

            if (checkInterval > 0) {
                setTimeout(iedoubleTabsFlow, checkInterval, csmg, checkInterval);
            }

            cookieHandler.CreateCookie('csmg', csmg);
        }

        return localStoreDoubleTabsListener;
    }
);