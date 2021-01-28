define("devicealerts/ExposureCoverageAlert", ["require", 'devicealerts/Alert', "Dictionary", "initdatamanagers/Customer"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary"),
        $customer = require("initdatamanagers/Customer");

    var ExposureCoverageAlert = function () {
        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.name = 'ExposureCoverageAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body(Dictionary.GetItem("lowMarginAlert"));
            createButtons();
        };
        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();
            if (!$customer.prop.isDemo)
                inheritedAlertInstance.buttons.push(new inheritedAlertInstance.buttonProperties(Dictionary.GetItem("DepositeNow"),
                    function () {
                        require(['devicemanagers/ViewModelsManager'], function ($viewModelsManager) {
                            $viewModelsManager.VManager.RedirectToForm(eForms.Deposit);
                        });
                        inheritedAlertInstance.visible(false);
                    }, 'btnOk'));
            inheritedAlertInstance.buttons.push(new inheritedAlertInstance.buttonProperties(Dictionary.GetItem("cancel"), function () {
                inheritedAlertInstance.visible(false);
            }, 'btnCancel'));
        };
        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return ExposureCoverageAlert;
});