var pushNotification,pushNotificationToken;!function(){var e=navigator.userAgent,n="cordova-android-raw.js";e.match(/CDV8.1.0/)?n="cordova-android-raw-8.1.0.js":e.match(/CDV7.1.0/)?n="cordova-android-raw-7.1.0.js":e.match(/CDV5.1.1/)&&(n="cordova-android-raw-5.1.1.js");e=document.createElement("script");e.type="text/javascript",e.src=UrlResolver.getStaticJSPath(n),document.getElementsByTagName("head")[0].appendChild(e)}();var app=function(){function n(){navigator.network.connection.type==Connection.NONE&&(confirm("Internet Connection Lost!\nTry to Reconnect?")?window.setTimeout(n,5e3):navigator.app.exitApp())}function o(){window.location.assign(window.location.href)}function t(e){e.preventDefault(),0<window.location.href.toLowerCase().indexOf("/account/login")?navigator.app.exitApp():$viewModelsManager.VManager.History.GoBack()}return{offLine:n,online:o,onDeviceReady:function(){document.addEventListener("online",o,!1),document.addEventListener("offline",n,!1),document.addEventListener("backbutton",t,!1),pushNotification=window.plugins.pushNotification;try{navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/PG_Andr_FXNET/)?navigator.userAgent.match(/CDV7.1.0/)||navigator.userAgent.match(/CDV8.1.0/)?((e=PushNotification.init({android:{senderID:"1"},browser:{},ios:{sound:!0,vibration:!0,badge:!0},windows:{}})).on("registration",function(e){localStorage.getItem("registrationId")!==e.registrationId&&localStorage.setItem("registrationId",e.registrationId),0<e.registrationId.length&&(pushNotificationToken=e.registrationId,isNotificationEnabled=e.isNotificationEnabled,null==isNotificationEnabled&&(isNotificationEnabled=""),versionCode=e.versionCode,null==versionCode&&(versionCode=""),bundleName=e.bundleName,null==bundleName&&(bundleName=""),isNotificationEnabled=1==isNotificationEnabled?1:0,scmmSettingsModule.updateCustomerPushNotificationToken(pushNotificationToken,isNotificationEnabled,versionCode,bundleName,scmmSettingsModule.deviceType.Android),console.log(" scmmSettingsModule.updateCustomerPushNotificationToken has finished sucessfully "))}),e.on("error",function(e){console.log("push error = "+e.message)}),e.on("notification",function(e){e=e.additionalData;""!=e.deeplink&&e.deeplink})):pushNotification.register(onNotification,onNotification,{senderID:"1",ecb:"onNotification"}):pushNotification.register(tokenHandler,errorHandler,{badge:"true",sound:"true",alert:"true",ecb:"onNotificationAPN"})}catch(e){}var e},setDisplayNone:function(e){document.getElementById(e)&&(document.getElementById(e).style.display="none")},onBackKeyDown:t}}();document.addEventListener("backbutton",app.onBackKeyDown,!1),document.addEventListener("deviceready",app.onDeviceReady,!1);var scmmSettingsModule=function(r){return r.deviceType={Android:1,iOS:2,ChromeDesktop:3},r.sendData=function(e,n,o,t,i){jQuery.ajax({type:e,dataType:n,data:o,url:t,async:!0,success:function(e,n,o){i&&"function"==typeof i&&i(e)}})},r.updateCustomerPushNotificationToken=function(e,n,o,t,i){r.sendData("POST","json",{token:e,pushEnabled:n,versionAppCode:o,deviceBundleName:t,deviceType:i},"ScmmSettings/UpdateCustomerPushNotificationToken",null)},r}(scmmSettingsModule||{}),eLoginMethods={Password:1,Fingerprint:2},deviceSupportErrorEnum={SUPPORTED:"10",NOT_SUPPORTS_FINGERPRINT:"1",DEVICE_HAS_NO_ENROLLED_FINGERPRINT:"2",OTHER_REASON:"3",MINIMUM_SDK_VERSION_23_REQUIRED:"4",BIOMETRY_IS_LOCKED_OUT:"5",IOS_FACE_INSTEADOF_FINGERPTINT:"6"},tokenErrorEnum={WRONG_ACCOUNT_NUMBER:"1"},iOSDeviceSupportErrorEnum={ErrorTouchIDNotEnrolled:-7,BiometryIsLockedOut:-8};function translateIOSErrorToGeneralMessage(e){switch(e.code){case iOSDeviceSupportErrorEnum.ErrorTouchIDNotEnrolled:return deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT;case iOSDeviceSupportErrorEnum.BiometryIsLockedOut:return deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT;default:return deviceSupportErrorEnum.NOT_SUPPORTS_FINGERPRINT}}!function(e,n){"use strict";"function"==typeof define&&define.amd?define("global/native/FingerprintTools",["generalmanagers/ErrorManager"],n):e.FingerprintTools=n(e.ErrorManager)}("undefined"!=typeof self?self:this,function(s){return window.FingerprintTools=new function(){var i,o="fingerPrint",n="fingerprintSupport";function r(e,n){s&&s.onError("CFingerprintTools/"+e,n)}function c(e){localStorage.setItem(n,e)}function t(){localStorage.removeItem(o)}function a(){t();try{Fingerprint.DeleteToken(function(e){return t(),e},function(e){r("DeleteTokenError",e)})}catch(e){}}return{DeviceSupportErrorEnum:window.deviceSupportErrorEnum,IsDeviceSupportFingerprint:function(n,o){try{Fingerprint.IsDeviceSupportFingerprint(function(e){null!=e&&"face"===e?t(deviceSupportErrorEnum.IOS_FACE_INSTEADOF_FINGERPTINT):(c(window.deviceSupportErrorEnum.SUPPORTED),n(e))},t)}catch(e){o(deviceSupportErrorEnum.OTHER_REASON)}function t(e){e===window.deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT?(a(),c(e)):e===window.deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT&&c(e),o(e)}},GetToken:function(o,t,i){Fingerprint.GetToken(function(e){if(e&&"0"!==e){var n=JSON.parse(e);return 0===o||n.account===o?t(n.token):i(tokenErrorEnum.WRONG_ACCOUNT_NUMBER)}return i(e)},function(e){return r("GetTokenError",e),i(e)})},SetToken:function(e,n){Fingerprint.SetToken(JSON.stringify({token:n,account:e}),function(e){return localStorage.setItem(o,"1"),e},function(e){r("SetTokenError",e)})},DeleteToken:a,ShowSetFingerprint:function(e,n,o,t){i=t,t=function(e){for(var n="",o="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",t=o.length,i=0;i<e;i++)n+=o.charAt(Math.floor(Math.random()*t));return n}(32),Fingerprint.show({clientId:"FingerprintPluginForApp",clientSecret:t,disableBackup:!0,title:e.title,message:e.message,description:e.message,cancel:e.cancel,cancelButtonTitle:e.cancel,fingerprint_not_recognized:e.fingerprint_not_recognized,fingerprint_success:e.fingerprint_success,secure_lock_screen_required:e.secure_lock_screen_required,finger_moved_too_fast:e.finger_moved_too_fast,too_many_attempts:e.too_many_attempts},function(){n()},function(e){e&&"string"==typeof e&&"Cancelled"===e&&o(e,!0);return e&&"string"==typeof e&&0<=e.indexOf("IllegalBlockSizeException: null")?n():o(e,!1)})},IsFingerprintSet:function(){var e=localStorage.getItem(o);return!(null==e)},FingerprintScanCancel:function(e,n){Fingerprint.scanCancel(e,n)},onScanError:function(e){i&&i(e)},RetrieveFingerprintSupport:function(){var e=localStorage.getItem(n);return null==e?null:e},Init:function(){localStorage.removeItem(n)}}}});var NativeLogsTools={initialize:function(){this.bindEvents()},bindEvents:function(){document.addEventListener("deviceready",this.onDeviceReady,!1)},onDeviceReady:function(){NativeLogsTools.receivedEvent("deviceready")},receivedEvent:function(e){console.log("Received Event: "+e)},GetLogs:function(){console.log("GetLogs... ");try{NativeLogs.getLog(500,!1,function(e){return console.log("GetLogsSuccess - result is: "+e),e},function(e){console.log("GetLogsError: "+e)})}catch(e){}},GetCustomerID:function(){console.log("GetCustomerID on NativeLogsTools... ");try{var n="";try{n=null==$customer.prop.accountNumber?0:$customer.prop.accountNumber}catch(e){n=0}console.log("customerID is: "+n),NativeLogs.getCustomerID(n,function(e){return console.log("GetCustomerIDSuccess - result is: "+e),e},function(e){console.log("GetCustomerIDError: "+e)})}catch(e){}}};NativeLogsTools.initialize();var DarkModeTools={initialize:function(){this.bindEvents()},bindEvents:function(){document.addEventListener("deviceready",this.onDeviceReady,!1)},onDeviceReady:function(){DarkModeTools.receivedEvent("deviceready"),console.log("DarkMode onDeviceReady")},receivedEvent:function(e){console.log("Received Event: "+e)},DarkModeisAvailable:function(){console.log("DarkModeisAvailable Function");try{cordova.plugins.ThemeDetection.isAvailable(function(e){console.log(e)},function(e){console.log(e)})}catch(e){console.log("cordova.plugins.ThemeDetection Doesnt exists. err is: "+e)}},DarkModeisEnabled:function(){console.log("DarkModeisEnabled Function");try{cordova.plugins.ThemeDetection.isDarkModeEnabled(function(e){console.log(e)},function(e){console.log(e)})}catch(e){console.log("cordova.plugins.ThemeDetection Doesnt exists. err is: "+e)}}};DarkModeTools.initialize(),function(e,n){"use strict";"function"==typeof define&&define.amd?define("global/devices/native/LastLoginMethod",[],n):e.LastLoginMethod=n()}("undefined"!=typeof self?self:this,function(){return window.LastLoginMethod=new function(){var n="lastLoginMethod";function o(e){localStorage.setItem(n,e)}return{SetLastLoginMethod:o,GetLastLoginMethod:function(){var e=localStorage.getItem(n);return null==e&&(e=eLoginMethods.Password),o(e),e}}}});
//# sourceMappingURL=nativeandroidmain.js.map