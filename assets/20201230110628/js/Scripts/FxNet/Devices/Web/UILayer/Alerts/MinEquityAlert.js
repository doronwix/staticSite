define("devicealerts/MinEquityAlert", ["require", 'handlers/general', "Dictionary", "cachemanagers/PortfolioStaticManager","initdatamanagers/Customer"], function (require) {
    var Dictionary = require("Dictionary"),
        general = require('handlers/general'),
        portfolioManager = require("cachemanagers/PortfolioStaticManager"),
        customer = require("initdatamanagers/Customer");

    var MinEquityAlert = (function () {
        var hasPendingWithdrawals = function() {
            return portfolioManager.Portfolio.pendingWithdrawals.sign() > 0;
        };

        var show = function(result, instrumentCcyPair) {
            var properties = getContentPieces(result, instrumentCcyPair);

            AlertsManager.UpdateAlert(AlertTypes.MinEquityAlert, '', '', '', properties, true);
            AlertsManager.PopAlert(AlertTypes.MinEquityAlert);
        };

        var getAlertContent = function (result, instrumentCcyPair, ignorePendingWithdrawals) {
            var msgKeys = ['alertText', 'infoMaxSizeText', 'infoFundText'],
                messages = '',
                alertMsgs = getContentPieces(result, instrumentCcyPair, ignorePendingWithdrawals),
                isMessageAvailable = function (key) {
                    return alertMsgs && alertMsgs.hasOwnProperty(key) && alertMsgs[key] && alertMsgs[key].length;
                };
            for (var i = 0; i < msgKeys.length; i++) {
                messages += isMessageAvailable(msgKeys[i]) ? alertMsgs[msgKeys[i]] + '\n' : '';
            }
            return messages;
        };

        var isDealMaxSizeApplicable = function(instrumentCcyPair, amountToDeposit) {
            return !general.isEmptyValue(instrumentCcyPair) && amountToDeposit > 0;
        };

        var getContentPieces = function(result, instrumentCcyPair, ignorePendingWithdrawals) {
            var alertContentKey, infoMaxSizeContentKey, infoFundContentKey, infoFundWithdrawalContentKey, maxAllowedAmount, amountToDeposit;

            alertContentKey = 'MarginTipAlertContent';
            infoMaxSizeContentKey = 'MarginTipInfoContent_MaxSize';
            infoFundContentKey = 'MarginTipInfoContent_Fund';
            infoFundWithdrawalContentKey = 'MarginTipInfoContent_Fund_Withdrawal';
            maxAllowedAmount = result.maxAllowedAmount;
            amountToDeposit = result.amountToDeposit;

            var alertContent = Dictionary.GetItem(alertContentKey),
                infoMaxSizeContent = Dictionary.GetItem(infoMaxSizeContentKey),
                infoFundContent = Dictionary.GetItem(hasPendingWithdrawals() && !ignorePendingWithdrawals ? infoFundWithdrawalContentKey : infoFundContentKey),
                infoMaxSizeText = null;

            if (isDealMaxSizeApplicable(instrumentCcyPair, maxAllowedAmount)) {
                infoMaxSizeText = String.format(infoMaxSizeContent, maxAllowedAmount, instrumentCcyPair);
            }

            return {
                alertText: alertContent,
                infoMaxSizeText: infoMaxSizeText,
                infoFundText: String.format(infoFundContent, "", "", amountToDeposit, customer.prop.defaultCcy())
            };
        };

        return {
            Show: show,
            GetAlertContent: getAlertContent
        };
    })();
    return MinEquityAlert;
});