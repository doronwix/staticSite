define("devicealerts/serverevents/ClientStateAlertExposureCoverageAlert", ["require", 'devicealerts/Alert', "knockout", "Dictionary", 'initdatamanagers/Customer'], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var customer = require('initdatamanagers/Customer');
    var ko = require("knockout");
    var Dictionary = require("Dictionary");

    var ClientStateAlertExposureCoverageAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            var isMarginMaintenance = customer.prop.maintenanceMarginPercentage > 0;

            inheritedAlertInstance.alertName = "ClientStateAlertExposureCoverageAlert";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem(isMarginMaintenance ? "lowMarginCallAlert2" : "lowMarginCallAlert"));
            inheritedAlertInstance.popCounter = ko.observable(0);
            inheritedAlertInstance.prepareForShow = prepareForShow;

        };

        var prepareForShow = function () {
            inheritedAlertInstance.injectDepositButtons();
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return ClientStateAlertExposureCoverageAlert;
});