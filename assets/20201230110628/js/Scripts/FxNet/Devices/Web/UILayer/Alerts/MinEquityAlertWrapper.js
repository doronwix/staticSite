define('devicealerts/MinEquityAlertWrapper', ["require", 'devicealerts/Alert', "knockout", "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary"),
        ko = require("knockout");

    var MinEquityAlertWrapper = function() {
        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = "MinEquityAlert";
            inheritedAlertInstance.title(Dictionary.GetItem('MarginTipTitle'));

            inheritedAlertInstance.marginTipAlert = ko.observable("");
            inheritedAlertInstance.marginTipInfoMaxSize = ko.observable("");
            inheritedAlertInstance.marginTipInfoFund = ko.observable("");

            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.prepareForShow = prepareForShow;
        };

        var prepareForShow = function() {
            inheritedAlertInstance.injectDepositButtons(true);
            inheritedAlertInstance.marginTipAlert(inheritedAlertInstance.properties.alertText);
            inheritedAlertInstance.marginTipInfoMaxSize(inheritedAlertInstance.properties.infoMaxSizeText);
            inheritedAlertInstance.marginTipInfoFund(inheritedAlertInstance.properties.infoFundText);
        };

        return {
            GetAlert: inheritedAlertInstance,
            Init: init
        };
    };
    return MinEquityAlertWrapper;
});