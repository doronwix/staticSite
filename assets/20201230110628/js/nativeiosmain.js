/*!
 Version = 20201230110628 2021-01-27 11:45:06 
*/
(function cordovaIOSLoader() {
    var deviceAgent = navigator.userAgent;
    // default - old ios version - 3.5.0
    var cordovaFile = "cordova-ios-raw.js";
    
    if (deviceAgent.match(/CDV6.1.1/)) {
    	cordovaFile = "cordova-ios-raw-6.1.1.js";
    }
    else
    if (deviceAgent.match(/CDV5.1.1/)) {
    	cordovaFile = "cordova-ios-raw-5.1.1.js";
    }
    else if (deviceAgent.match(/CDV4.5.4.IOS9/)) {
    	cordovaFile = "cordova-ios-raw-4.5.4.IOS9.js";
    }
    else if (deviceAgent.match(/CDV4.5.4/)) {
    	cordovaFile = "cordova-ios-raw-4.5.4.js";
        // console.log("cordova version 4.5.4");
    }
    else if (deviceAgent.match(/CDV4.1.1/)) {
    	cordovaFile = "cordova-ios-raw-4.1.1.js";
        // console.log("cordova version 4.1.1");
    } else {
        // default - old cordova ios
        // console.log("cordova version 3.5.0");
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = UrlResolver.getStaticJSPath(cordovaFile);
    document.getElementsByTagName("head")[0].appendChild(script);
})();
;
var pushNotification;
var pushNotificationToken;
var app = function () {
    function offLine() {
        if (navigator.network.connection.type == Connection.NONE) {
            if (confirm('Internet Connection Lost!\nTry to Reconnect?'))
                window.setTimeout(offLine, 5000);
            else
                navigator.app.exitApp();
        }
    }

    function onLine() {
        window.location.assign(window.location.href);

    }
    
     function setupPush() {
        // console.log('calling push init');
        var push = PushNotification.init({
            "android": {
                "senderID": "1"
            },
            "browser": {},
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        // console.log('after init');

        push.on('registration', function(data) {
           // console.log('registration event: ' + data.registrationId);

            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }

            
            if (data.registrationId.length > 0) {
                // Your FCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                pushNotificationToken = data.registrationId;

                isNotificationEnabled = data.isNotificationEnabled;

                // support old versions
                if (isNotificationEnabled == undefined)
                    isNotificationEnabled = "";
                    
                versionCode = data.versionCode;
                
                // support old versions
                if (versionCode == undefined)
                    versionCode = "";
                
                bundleName = data.bundleName;
                
                // support old versions
                if (bundleName == undefined)
                	bundleName = "";
                
                /*
                console.log("onNotification Server side regID = " + pushNotificationToken);
                console.log("onNotification Server side isNotificationEnabled = " + isNotificationEnabled);
                console.log("versionCode Server side = " + versionCode);
                console.log("bundleName Server side = " + bundleName);
                */

                if (isNotificationEnabled == true) {
                    isNotificationEnabled = 1;
                } else {
                    isNotificationEnabled = 0;
                }

                // console.log("onNotification that we really send: = " + isNotificationEnabled);

                scmmSettingsModule.updateCustomerPushNotificationToken(pushNotificationToken, isNotificationEnabled, versionCode, bundleName, scmmSettingsModule.deviceType.Android);
                
                console.log(" scmmSettingsModule.updateCustomerPushNotificationToken has finished sucessfully ");

            }
            
            
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            // console.log('notification event');
            
            var additionalData = data.additionalData;
            var coldstart = '';
            var deeplink = '';
            var dismissed = '';
            var foreground = '';
            var silent = '';
            var time_to_live = '';
     
     
     if (additionalData.deeplink != '') {
        deeplink = additionalData.deeplink;
     }
     
     /*
     if (deeplink != '') {
        alert('deeplink is: ' + deeplink);
     }
            
            
            alert(
                data.message,         // message
                null,                 // callback
                data.title,           // title
                'Ok'                  // buttonName
            );
            */
       });
    }
    
    function onDeviceReady() {
        document.addEventListener('online', onLine, false);
        document.addEventListener('offline', offLine, false);
        document.addEventListener("backbutton", onBackKeyDown, false);
        //Push notification plugin's code.
        // old push GCM
        pushNotification = window.plugins.pushNotification;

        try {

            if ((navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/PG_Andr_FXNET/))) {
                if (navigator.userAgent.match(/CDV7.1.0/) || navigator.userAgent.match(/CDV8.1.0/) || navigator.userAgent.match(/CDV9.0.0/)) {
                    // new Cordova 7.1.0 OR 8.1.0 OR 9.0.0 new Push (2.X) and FCM
                    // new push FCM
                    // console.log('calling setup push');
                    setupPush();
                 } else
                 {
                    // old push GCM
                    pushNotification.register(
                    onNotification,
                    onNotification,
                    {
                        "senderID": "1",
                        "ecb": "onNotification"
                    });
                }
            }
            else {
                // PG_iOS_FXNET

                // register
                pushNotification.register(
						tokenHandler,
						errorHandler,
						{
						    "badge": "true",
						    "sound": "true",
						    "alert": "true",
						    "ecb": "onNotificationAPN"
						});

            }

        }
        catch (e) {
            // Nada. Continue with your life without the push.
        }


    }
    function setDisplayNone(id) {
        if (document.getElementById(id))
        { document.getElementById(id).style.display = 'none'; }
    }
    function onBackKeyDown(e) {
        e.preventDefault();
        if (window.location.href.toLowerCase().indexOf("/account/login") > 0) {
            navigator.app.exitApp();
        }
        else {
            $viewModelsManager.VManager.History.GoBack();
        }
    }
    return {
        offLine: offLine,
        online: onLine,
        onDeviceReady: onDeviceReady,
        setDisplayNone: setDisplayNone,
        onBackKeyDown: onBackKeyDown
    };
}();

//on ios this will do nothing, because we dont have a "back button"
document.addEventListener("backbutton", app.onBackKeyDown, false);

document.addEventListener('deviceready', app.onDeviceReady, false);
;
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
;
var eLoginMethods = {
    Password: 1,
    Fingerprint: 2
};

// is Device Support Fingerprint general API and Android specific
var deviceSupportErrorEnum = {
    SUPPORTED: "10",
    NOT_SUPPORTS_FINGERPRINT: "1",
    DEVICE_HAS_NO_ENROLLED_FINGERPRINT: "2",
    OTHER_REASON: "3",
    MINIMUM_SDK_VERSION_23_REQUIRED: "4",
    BIOMETRY_IS_LOCKED_OUT: "5", // iOS too many failed attempts 
    IOS_FACE_INSTEADOF_FINGERPTINT: "6"
};

var tokenErrorEnum = {
    WRONG_ACCOUNT_NUMBER: "1"
}
// is Device Support Fingerprint iOS specific API
var iOSDeviceSupportErrorEnum = {
    ErrorTouchIDNotEnrolled: -7,
    BiometryIsLockedOut: -8
};

function translateIOSErrorToGeneralMessage(err) {

    switch (err.code) {
        case iOSDeviceSupportErrorEnum.ErrorTouchIDNotEnrolled:
            return deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT;
        case iOSDeviceSupportErrorEnum.BiometryIsLockedOut:
            return deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT;
        default:
            return deviceSupportErrorEnum.NOT_SUPPORTS_FINGERPRINT;
    }
}
;
(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("global/native/FingerprintTools", ['generalmanagers/ErrorManager'], factory);
    } else {
        root.FingerprintTools = factory(root.ErrorManager);
    }
}(typeof self !== 'undefined' ? self : this, function (errorManager) {
    function FingerprintToolsClass() {
        var fingerPrintKey = "fingerPrint",
            fingerprintSupportKey = "fingerprintSupport";

        function init() {
            removeFingerprintSupportLS();
        }

        function onError(name, message) {
            if (errorManager) {
                errorManager.onError("CFingerprintTools/" + name, message);
            }
        }

        function isDeviceSupportFingerprint(successCallback, errorCallback) {
            try {
                Fingerprint.IsDeviceSupportFingerprint(isDeviceSupportFingerprintSuccess, isDeviceSupportFingerprintError);
            } catch (e) {
                errorCallback(deviceSupportErrorEnum.OTHER_REASON);
            }

            function isDeviceSupportFingerprintSuccess(fpType) {
                if (!(typeof fpType === "undefined" || fpType === null) && fpType === 'face') {
                    isDeviceSupportFingerprintError(deviceSupportErrorEnum.IOS_FACE_INSTEADOF_FINGERPTINT);
                }
                else {
                    storeFingerprintSupport(window.deviceSupportErrorEnum.SUPPORTED);
                    successCallback(fpType);
                }
            }

            function isDeviceSupportFingerprintError(message) {
                if (message === window.deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT) {
                    //delete token and local storage in case of removed fingerprint
                    deleteToken();
                    storeFingerprintSupport(message);
                }
                else if (message === window.deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                    storeFingerprintSupport(message);
                }

                errorCallback(message);
            }
        }

        function storeFingerprintSupport(supportValue) {
            localStorage.setItem(fingerprintSupportKey, supportValue);
        }

        function retrieveFingerprintSupport() {
            var fingerprintSupport = localStorage.getItem(fingerprintSupportKey);

            if (typeof fingerprintSupport === "undefined" || fingerprintSupport === null) {
                return null;
            }

            return fingerprintSupport;
        }

        function removeFingerprintSupportLS() {
            localStorage.removeItem(fingerprintSupportKey);
        }

        function getToken(account, successCallback, errorCallback) {
            Fingerprint.GetToken(GetTokenSuccess, GetTokenError);

            function GetTokenSuccess(result) {
                if (result && result !== "0") {
                    var tokenObj = JSON.parse(result);

                    //on login account === 0
                    if (account === 0 || tokenObj.account === account) {
                        return successCallback(tokenObj.token);
                    }

                    return errorCallback(tokenErrorEnum.WRONG_ACCOUNT_NUMBER);
                }

                return errorCallback(result);
            }

            function GetTokenError(message) {
                onError("GetTokenError", message);

                return errorCallback(message);
            }
        }

        function setFingerprintSet() {
            localStorage.setItem(fingerPrintKey, "1");
        }

        function isFingerprintSet() {
            var fingerPrintSet = localStorage.getItem(fingerPrintKey);

            return !(typeof fingerPrintSet === "undefined" || fingerPrintSet === null);
        }

        function removeFingerprintSet() {
            localStorage.removeItem(fingerPrintKey);
        }

        function setToken(account, tokenVar) {
            Fingerprint.SetToken(JSON.stringify({ "token": tokenVar, "account": account }), SetTokenSuccess, SetTokenError);

            function SetTokenSuccess(result) {
                setFingerprintSet();
                return result;
            }

            function SetTokenError(message) {
                onError("SetTokenError", message);
            }
        }

        function deleteToken() {
            removeFingerprintSet();

            try {
                Fingerprint.DeleteToken(DeleteTokenSuccess, DeleteTokenError);
            }
            catch (e) { }

            function DeleteTokenSuccess(result) {
                removeFingerprintSet();
                return result;
            }

            function DeleteTokenError(message) {
                onError("DeleteTokenError", message);
            }
        }

        var _onScanError;

        function onScanErrorCallback(error) {
            if (_onScanError) {
                _onScanError(error);
            }
        }

        function randomClientSecret(len) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var charactersLength = characters.length;

            for (var i = 0; i < len; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }

        function showSetFingerprint(config, successCallback, errorCallback, onScanError) {
            _onScanError = onScanError;

            var clientSecret = randomClientSecret(32);

            Fingerprint.show({
                clientId: "FingerprintPluginForApp",
                clientSecret: clientSecret, // Necessary for Android - Use random secret key.
                disableBackup: true,
                title: config.title,
                message: config.message, // Necessary for IOS Touch ID
                description: config.message, // Necessary for Android upgraded to 3.0.0
                cancel: config.cancel, // Necessary for IOS Touch ID
                cancelButtonTitle: config.cancel, //  // Necessary for Android upgraded to 3.0.0
                fingerprint_not_recognized: config.fingerprint_not_recognized,
                fingerprint_success: config.fingerprint_success,
                secure_lock_screen_required: config.secure_lock_screen_required,
                finger_moved_too_fast: config.finger_moved_too_fast,
                too_many_attempts: config.too_many_attempts

            }, _successCallback, _errorCallback);

            function _successCallback() {
                successCallback();
            }

            function _errorCallback(err) {
                if (err && typeof err === "string" && err === "Cancelled") {
                    errorCallback(err, true)
                }
                if (err && typeof err === "string" && err.indexOf("IllegalBlockSizeException: null") >= 0) {
                    return successCallback();
                }

                return errorCallback(err, false);
            }
        }

        function fingerprintScanCancel(successCallback, errorCallback) {
            Fingerprint.scanCancel(successCallback, errorCallback);
        }

        return {
            DeviceSupportErrorEnum: window.deviceSupportErrorEnum,
            IsDeviceSupportFingerprint: isDeviceSupportFingerprint,
            GetToken: getToken,
            SetToken: setToken,
            DeleteToken: deleteToken,
            ShowSetFingerprint: showSetFingerprint,
            IsFingerprintSet: isFingerprintSet,
            FingerprintScanCancel: fingerprintScanCancel,
            onScanError: onScanErrorCallback,
            RetrieveFingerprintSupport: retrieveFingerprintSupport,
            Init: init
        }
    };

    // FingerprintTools must be exposed on the global window for cordova to call window.FingerprintTools.onScanError
    var module = window.FingerprintTools = new FingerprintToolsClass();
    return module;
}));
;

var AppRateTools = {
    // Application Constructor
initialize: function() {
    this.bindEvents();
},
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
onDeviceReady: function() {
     AppRateTools.receivedEvent('deviceready');
    //alert('AppRate onDeviceReady');
},
receivedEvent: function(id) {
    console.log('Received Event: ' + id);
},
ShowInAppRating: function() {
    console.log('ShowInAppRating... ');
    //alert('ShowInAppRating');
    try {
        AppRate.navigateToAppStore(IsNavigateToAppStoreSuccess, IsNavigateToAppStoreSuccessFailure);
    }
    catch (err) {
        // nada for now
    }
    
    function IsNavigateToAppStoreSuccess(result) {
        //alert("IsNavigateToAppStoreSuccess - Launch method is: " + result);
    }
    
    function IsNavigateToAppStoreSuccessFailure(message) {
        //alert("IsNavigateToAppStoreSuccessFailure: message is" + message);
    }
    
}
};

AppRateTools.initialize();


;

var NativeLogsTools = {
    // Application Constructor
initialize: function() {
    this.bindEvents();
},
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
onDeviceReady: function() {
     NativeLogsTools.receivedEvent('deviceready');
    //alert('NativeLogsTools onDeviceReady');
},
receivedEvent: function(id) {
    console.log('Received Event: ' + id);
},
GetLogs: function() {
    
    console.log('GetLogs... ');
                                      
    try {
        NativeLogs.getLog(500,false,GetLogsSuccess,GetLogsError);
    }
    catch (err) {
        // nada for now
    }

    function GetLogsSuccess(result) {
        //alert("GetLogsSuccess - result is: " + result);
        console.log("GetLogsSuccess - result is: " + result);
        return result;
    }

    function GetLogsError(message) {
       //alert("GetLogsError: " + message);
       console.log("GetLogsError: " + message);
     }

},
GetCustomerID: function() {

    console.log('GetCustomerID on NativeLogsTools... ');

    try {
        //var customerID = "123456"; // $customer.prop.accountNumber

        var customerID = ""
        try {
                if ($customer.prop.accountNumber == undefined) {
                    customerID = 0;
                } else {
                    customerID = $customer.prop.accountNumber;
                }
            }
            catch (err) {
              // alert('not defined');
               customerID = 0;
            }

            //alert("customerID is: " + customerID);
            console.log("customerID is: " + customerID);

            NativeLogs.getCustomerID(customerID, GetCustomerIDSuccess, GetCustomerIDError);
    }
    catch (err) {
        // nada for now
    }

    function GetCustomerIDSuccess(result) {
        //alert("GetCustomerIDSuccess - result is: " + result);
        console.log("GetCustomerIDSuccess - result is: " + result);
        return result;
    }

    function GetCustomerIDError(message) {
       //alert("GetCustomerIDError: " + message);
       console.log("GetCustomerIDError: " + message);
     }

}
};

NativeLogsTools.initialize();


;
(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("global/devices/native/LastLoginMethod", [], factory);
    }
    else {
        root.LastLoginMethod = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function LastLoginMethodClass() {
        var lastLoginKey = "lastLoginMethod";

        function setLastLoginMethod(loginMethod) {
            localStorage.setItem(lastLoginKey, loginMethod);
        }

        function getLastLoginMethod() {
            var loginMethod = localStorage.getItem(lastLoginKey);

            if (typeof loginMethod === "undefined" || loginMethod === null) {
                loginMethod = eLoginMethods.Password;
            }

            setLastLoginMethod(loginMethod);

            return loginMethod;
        }

        return {
            SetLastLoginMethod: setLastLoginMethod,
            GetLastLoginMethod: getLastLoginMethod
        };
    }

    var module = window.LastLoginMethod = new LastLoginMethodClass();

    return module;
}));
//# sourceMappingURL=nativeiosmain.js.map