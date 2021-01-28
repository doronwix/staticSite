define("devicealerts/IframeAlert", ["require", 'devicealerts/Alert', 'handlers/general'], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        general = require('handlers/general');

    var IframeAlert = function () {

        var inheritedAlertInstance = new AlertBase();

        var init = function () {
            inheritedAlertInstance.alertName = "IframeAlert";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.prepareForShow = prepareForShow;
        };

        var prepareForShow = function () {
            this.onClose = function () {
                inheritedAlertInstance.visible(false);

                if (general.isFunctionType(this.properties.onCloseCallback)) {
                    this.properties.onCloseCallback();
                }
            };
        }

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };

    return IframeAlert;
});