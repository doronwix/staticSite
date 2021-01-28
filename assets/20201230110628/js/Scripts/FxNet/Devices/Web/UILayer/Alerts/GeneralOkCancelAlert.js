define('devicealerts/GeneralOkCancelAlert', ["require", 'devicealerts/Alert', "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary");

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

                        cleanUpOnclose();
                        if (typeof inheritedAlertInstance.properties.okButtonCallback === "function" && !inheritedAlertInstance.overwriteNavFlow) {
                            inheritedAlertInstance.properties.okButtonCallback();
                        }
                    },
                    'btnOk'
                ));

            if (!inheritedAlertInstance.properties.hideCancelButton === true)
                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        inheritedAlertInstance.properties.cancelButtonCaption || Dictionary.GetItem("cancel"),
                        function () {
                            inheritedAlertInstance.overwriteNavFlow = false;
                            inheritedAlertInstance.visible(false);

                            cleanUpOnclose();
                            if (jQuery.isFunction(inheritedAlertInstance.properties.cancelButtonCallback)) {
                                inheritedAlertInstance.properties.cancelButtonCallback();
                            }
                        },
                        'btnCancel colored'
                    )
                );
        };

        var cleanUpOnclose = function () {
            inheritedAlertInstance.body('');
            inheritedAlertInstance.title('');
            inheritedAlertInstance.messages.removeAll();
        };

        var onClose = function () {
            inheritedAlertInstance.visible(false);
            cleanUpOnclose();

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
