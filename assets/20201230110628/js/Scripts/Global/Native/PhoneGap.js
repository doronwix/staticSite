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