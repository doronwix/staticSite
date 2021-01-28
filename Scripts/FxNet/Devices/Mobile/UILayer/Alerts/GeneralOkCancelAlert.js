define('devicealerts/GeneralOkCancelAlert', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert');
    var Dictionary = require("Dictionary");

    var GeneralOkCancelAlert = function () {
        var inheritedAlertInstance = new AlertBase();

        var prepareForShow = function () {
            createButtons();
        };

        var init = function () {
            inheritedAlertInstance.alertName = 'GeneralOkCancelAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.onClose = onClose;
            inheritedAlertInstance.prepareForShow = prepareForShow;

            createButtons();
        };

        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();

            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    inheritedAlertInstance.properties.okButtonCaption || Dictionary.GetItem("proceed"),
                    function () {
                        inheritedAlertInstance.overwriteNavFlow = inheritedAlertInstance.properties.overwriteNavFlow;
                        inheritedAlertInstance.visible(false);
                        if (jQuery.isFunction(inheritedAlertInstance.properties.okButtonCallback) && !inheritedAlertInstance.overwriteNavFlow) {
                            inheritedAlertInstance.properties.okButtonCallback();
                        }
                    },
                    inheritedAlertInstance.properties.btnOkClass || 'btnOk'
                ),
                new inheritedAlertInstance.buttonProperties(
                    inheritedAlertInstance.properties.cancelButtonCaption || Dictionary.GetItem("cancel"),
                    function () {
                        inheritedAlertInstance.overwriteNavFlow = false;
                        inheritedAlertInstance.visible(false);

                        if (jQuery.isFunction(inheritedAlertInstance.properties.cancelButtonCallback)) {
                            inheritedAlertInstance.properties.cancelButtonCallback();
                        }
                    },
                    inheritedAlertInstance.properties.btnCancelClass || 'btnCancel'
                )
            );
        };

        var onClose = function () {
            inheritedAlertInstance.visible(false);

            if (jQuery.isFunction(inheritedAlertInstance.properties.onClose)) {
                inheritedAlertInstance.properties.onClose();
            }
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };

    return GeneralOkCancelAlert;
});
