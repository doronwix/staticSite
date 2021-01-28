define(
    'devicecustomdeeplinks/AccountSummaryAdvancedViewActionHandler',
    [],
    function AccountSummaryAdvancedViewActionHandler() {
        var ensureAdvancedViewIsVisible = function () {
            window.$customerProfileManager.UpdateIsAdvancedView(true);
        };

        return {
            HandleDeepLink: ensureAdvancedViewIsVisible,
        };
    }
);
