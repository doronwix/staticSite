/*eslint no-unused-vars: 0*/
var AccountMarketViewModel = function (ko) {
    var quotesIsAdvanced = ko.observable(false),
        accountSummaryIsAdvanced = ko.observable(false),
        isCollapsed = ko.observable(false),
        useTransitions = ko.observable(false);

    function init() {
        registerObservableStartUpEvent();
    }

    function accSummarySwitchView(newValue) {
        accountSummaryIsAdvanced(newValue);
    }

    function registerObservableStartUpEvent() {
        // set initial value
        accSummarySwitchView(
            $customerProfileManager.ProfileCustomer().advancedWalletView === 1
        );

        // subscribe to changes
        $customerProfileManager.ProfileCustomer.subscribe(function (pc) {
            var isAdvanced = pc.advancedWalletView === 1;
            accSummarySwitchView(isAdvanced);
        });
    }

    function collapsedToggle() {
        isCollapsed(!isCollapsed());
    }

    return {
        Init: init,
        QuotesIsAdvanced: quotesIsAdvanced,
        AccountSummaryIsAdvanced: accountSummaryIsAdvanced,
        IsCollapsed: isCollapsed,
        UseTransitions: useTransitions,
        CollapsedToggle: collapsedToggle,
    };
};
