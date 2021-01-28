define('devicealerts/GeneralOkAlert', ["require", 'devicealerts/Alert', "knockout", "Dictionary"], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        Dictionary = require("Dictionary");
        
    var GeneralOkAlert = function() {

        var inheritedAlertInstance = new AlertBase();

        var prepareForShow = function() {
            createButtons();
        };

        var init = function() {
            inheritedAlertInstance.alertName = 'GeneralOkAlert';
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.onClose = onClose;
            inheritedAlertInstance.prepareForShow = prepareForShow;

            createButtons();
        };

        var createButtons = function() {
            inheritedAlertInstance.buttons.removeAll();
            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    inheritedAlertInstance.properties.okButtonCaption || Dictionary.GetItem("ok"),
                    function() {
                        inheritedAlertInstance.visible(false);

                        //on close do a cleanup
                        inheritedAlertInstance.body('');
                        inheritedAlertInstance.title('');
                        inheritedAlertInstance.messages.removeAll();

                        if (jQuery.isFunction(inheritedAlertInstance.properties.okButtonCallback)) {
                            inheritedAlertInstance.properties.okButtonCallback();
                        }
                    },
                    'btnOk'
                ));
        };

        var onClose = function() {
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
    return GeneralOkAlert;
});