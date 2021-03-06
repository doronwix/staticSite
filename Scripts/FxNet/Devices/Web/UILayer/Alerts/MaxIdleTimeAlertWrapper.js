define('devicealerts/MaxIdleTimeAlertWrapper', ["require", 'devicealerts/Alert', "knockout", "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary"),
        ko = require("knockout");

    var MaxIdleTimeAlertWrapper = function() {
        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = 'MaxIdleTimeAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.body = ko.observable(Dictionary.GetItem('MaxIdleTimeAlert'));
            inheritedAlertInstance.title = Dictionary.GetItem("maxIdleTimeAlertTitle");

            inheritedAlertInstance.onCloseAction.Add(ActivitySupervisor.UpdateStay);

            createButtons();
        };

        var createButtons = function() {
            inheritedAlertInstance.buttons.removeAll();

            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem("exit"),
                    function() {
                        inheritedAlertInstance.hide();
                        ActivitySupervisor.Exit();
                    },
                    'Exit colored'
                ),
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem("stay"),
                    function () {
                        inheritedAlertInstance.hide();
                        ActivitySupervisor.UpdateStay();
                    },
                    'Stay'
                )
            );
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return MaxIdleTimeAlertWrapper;
});