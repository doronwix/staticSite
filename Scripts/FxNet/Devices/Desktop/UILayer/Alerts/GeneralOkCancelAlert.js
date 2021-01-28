define('devicealerts/GeneralOkCancelAlert', ["require", 'devicealerts/Alert', "Dictionary"], function(require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var GeneralOkCancelAlert = function() {

        var inheritedAlertInstance = new AlertBase();

        var init = function() {
            inheritedAlertInstance.alertName = 'GeneralOkCancelAlert';
            inheritedAlertInstance.visible(false);
            createButtons();
        };

        var createButtons = function() {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem(inheritedAlertInstance.properties.okButtonCaption || "proceed"),
                    function() {
                        inheritedAlertInstance.visible(false);

                        if (jQuery.isFunction(inheritedAlertInstance.properties.okButtonCallback)) {
                            inheritedAlertInstance.properties.okButtonCallback();
                        }
                    },
                    'btnOk'
                ),
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem(inheritedAlertInstance.properties.cancelButtonCaption || "cancel"),
                    function() {
                        inheritedAlertInstance.visible(false);

                        if (jQuery.isFunction(inheritedAlertInstance.properties.cancelButtonCallback)) {
                            inheritedAlertInstance.properties.cancelButtonCallback();
                        }
                    },
                    'btnCancel'
                )
            );
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };

    return GeneralOkCancelAlert;
});