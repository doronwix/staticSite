var app = function () {

    function onDeviceReady() {
        document.addEventListener("backbutton", onBackKeyDown, false);
        
         if ((navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/PG_Andr_FXNET/))) {
                if (navigator.userAgent.match(/CDV7.1.0/) || navigator.userAgent.match(/CDV8.1.0/) || navigator.userAgent.match(/CDV9.0.0/)) {
                    // new Cordova 7.1.0 OR 8.1.0 OR 9.0.0 + new Push (2.X) and FCM
                    // new push FCM
                    // Init Push
                     PushNotification.init({
                        "android": {
                        "senderID": "1"
                        }
                    });   
                }
         }
    }

    // test eyal 1
  
    function onBackKeyDown(e) {
        e.preventDefault();
        if (window.location.href.toLowerCase().indexOf("/account/login") > 0) {
            navigator.app.exitApp();
        }
        else {
            window.location.replace("/Account/Login");
        }
    }
    return {

        onDeviceReady: onDeviceReady,
        onBackKeyDown: onBackKeyDown
    };
}();

//on ios this will do nothing, because we dont have a "back button"
document.addEventListener("backbutton", app.onBackKeyDown, false);

document.addEventListener('deviceready', app.onDeviceReady, false);

