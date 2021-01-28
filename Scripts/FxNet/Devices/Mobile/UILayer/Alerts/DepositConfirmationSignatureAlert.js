define(
    'devicealerts/DepositConfirmationSignatureAlert',
    [
        'require',
        'handlers/general',
        'devicealerts/Alert',
        'Dictionary'
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert'),
            general = require('handlers/general'),
            Dictionary = require("Dictionary");

        var DepositConfirmationSignatureAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            function init() {
                inheritedAlertInstance.alertName = "DepositConfirmationSignatureAlert";
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = prepareForShow;
                inheritedAlertInstance.title(Dictionary.GetItem("CloseDeal"));
            }

            function prepareForShow() {
                this.uploadStringImage = this.properties.uploadStringImage;
                this.withdrawalFlow = this.properties.withdrawalFlow;
                this.overwriteNavFlow = this.properties.overwriteNavFlow;
                this.closeAlert = closeAlert;
            }

            function closeAlert() {
                if (!general.isEmptyValue(this.properties.preventOnCancel) && this.properties.preventOnCancel) {
                    preventAlert(this.properties.preventOnCancelText);
                } else {
                    hideAlert();
                }
            }

            function hideAlert() {
                inheritedAlertInstance.overwriteNavFlow = false;
                inheritedAlertInstance.visible(false);
            }

            function preventAlert(message) {
                var props = {
                    overwriteNavFlow: true,
                    okButtonCallback: hideAlert,
                    okButtonCaption: Dictionary.GetItem("ok"),
                    cancelButtonCaption: Dictionary.GetItem("cancel"),
                    btnOkClass: 'small-okBtn',
                    btnCancelClass: 'small-cancelBtn'
                };

                AlertsManager.UpdateAlert(AlertTypes.GeneralOkCancelAlert, '', null, [message], props);
                AlertsManager.PopAlert(AlertTypes.GeneralOkCancelAlert);
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };

        return DepositConfirmationSignatureAlert;
    }
);
