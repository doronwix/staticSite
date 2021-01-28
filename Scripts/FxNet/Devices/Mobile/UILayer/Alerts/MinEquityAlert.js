define("devicealerts/MinEquityAlert", ["require", 'handlers/general', "Dictionary", "cachemanagers/PortfolioStaticManager"], function (require) {
    var Dictionary = require("Dictionary"),
        general = require('handlers/general'),
        portfolioManager = require("cachemanagers/PortfolioStaticManager");


    var MinEquityAlert = (function () {
        var hasPendingWithdrawals = function () {
            return portfolioManager.Portfolio.pendingWithdrawals.sign() > 0;
        };

        var show = function (response, instrumentCcyPair) {
            AlertsManager.UpdateAlert(
                AlertTypes.MinEquityAlert,
                '',
                Dictionary.GetItem(response.msgKey),
                getAlertMessages(response, instrumentCcyPair),
                null,
                true
            );

            AlertsManager.PopAlert(AlertTypes.MinEquityAlert);
        };

        var isDealMaxSizeApplicable = function (instrumentCcyPair, amountToDeposit) {
            return !general.isEmptyValue(instrumentCcyPair) && amountToDeposit > 0;
        };

        var getAlertMessages = function (response, instrumentCcyPair) {
            var infoMaxSizeContent = Dictionary.GetItem('MarginTipInfoContent_MaxSize'), // 'Based on the Available Margin in your account, the maximum deal size you can execute on the instrument you selected is {0} {1}.'
                infoMaxSizeText = isDealMaxSizeApplicable(instrumentCcyPair, response.maxAllowedAmount)
                    ? String.format(infoMaxSizeContent, response.maxAllowedAmount, instrumentCcyPair)
                    : '',
                infoFundContent = hasPendingWithdrawals()
                    ? Dictionary.GetItem('MarginTipInfoContent_Fund_Withdrawal') // 'You may execute this transaction by funding your account with at least {2} {3} or by canceling your Pending Withdrawals.'
                    : Dictionary.GetItem('MarginTipInfoContent_Fund'), // 'Alternatively, you may execute this transaction by funding your account with at least {2} {3}.'
                infoFundText = String.format(infoFundContent, '', '', response.amountToDeposit, $customer.prop.defaultCcy());

            var result = [
                infoMaxSizeText,
                infoFundText
            ];

            return result.filter(function (item) { return !general.isNullOrUndefined(item) && !general.isEmptyValue(item) });
        };

        return {
            Show: show
        };
    })();
    return MinEquityAlert;
});