define('devicealerts/DepositSuccessAlert',
    [
        "require",
        'knockout',
        'devicealerts/Alert',
        'dataaccess/dalCommon',
        "Dictionary"
    ],
    function (require) {
        var AlertBase = require('devicealerts/Alert'),
            general = require('handlers/general'),
            dalCommon = require('dataaccess/dalCommon'),
            Dictionary = require("Dictionary");

        var DepositSuccessAlert = function () {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = 'devicealerts/DepositSuccessAlert';
                inheritedAlertInstance.visible(false);
                createButtons();
            };

            var createButtons = function () {
                inheritedAlertInstance.buttons.removeAll();

                // override base on Back => onOk
                var onOk = inheritedAlertInstance.hide = function () {
                    var redirectToViewType,
                        viewArgs = inheritedAlertInstance.properties.redirectToViewArgs || "";

                    if (!general.isEmptyValue(inheritedAlertInstance.properties.redirectToView)) {
                        redirectToViewType = inheritedAlertInstance.properties.redirectToView;
                    }

                    if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                        inheritedAlertInstance.properties.okButtonCallback();
                    }

                    inheritedAlertInstance.visible(false);

                    if (!general.isEmptyValue(redirectToViewType)) {
                        if (redirectToViewType === 'exit') {
                            dalCommon.Logout(eLoginLogoutReason.serverResponseAlert_exit);
                        } else {
                            require(['devicemanagers/ViewModelsManager'], function (viewModelsManager) {
                                viewModelsManager.VManager.SwitchViewVisible(redirectToViewType, viewArgs);
                            });
                        }
                    }
                };

                inheritedAlertInstance.buttons.push(
                    new inheritedAlertInstance.buttonProperties(
                        Dictionary.GetItem("ok"),
                        onOk,
                        'btnOk'
                    )
                );
            };

            return {
                Init: init,
                GetAlert: inheritedAlertInstance
            };
        };
        return DepositSuccessAlert;
    });