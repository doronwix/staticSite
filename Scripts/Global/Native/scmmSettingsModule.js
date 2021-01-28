var scmmSettingsModule = (function (module) {

    module.deviceType = {
        Android: 1,
        iOS: 2,
        ChromeDesktop: 3
    }

    module.sendData = function (varType, varDataType, varData, urlMethod, returnFunction) {
        jQuery.ajax({
            type: varType,
            dataType: varDataType,
            data: varData,
            url: urlMethod,
            async: true,
            success: function (data, textStatus, XMLHttpRequest) {
                if (returnFunction && typeof (returnFunction) == "function") {
                    returnFunction(data);
                }
            }
        });
    }

    module.updateCustomerPushNotificationToken = function (token, pushEnabled, versionAppCode, deviceBundleName, deviceType) {
        module.sendData("POST", "json", { token: token, pushEnabled: pushEnabled, versionAppCode: versionAppCode, deviceBundleName: deviceBundleName, deviceType: deviceType }, "ScmmSettings/UpdateCustomerPushNotificationToken", null);
    }

    return module;

}(scmmSettingsModule || {}));