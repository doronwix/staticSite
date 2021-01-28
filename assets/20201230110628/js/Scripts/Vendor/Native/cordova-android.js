(function cordovaAndroidLoader() {
    var deviceAgent = navigator.userAgent;
    // default
    var cordovaFile = "cordova-android-raw.js";

    if (deviceAgent.match(/CDV9.0.0/)) {
        cordovaFile = "cordova-android-raw-9.0.0.js";
    }
    else
    if (deviceAgent.match(/CDV8.1.0/)) {
        cordovaFile = "cordova-android-raw-8.1.0.js";
    }
    else if (deviceAgent.match(/CDV7.1.0/)) {
        cordovaFile = "cordova-android-raw-7.1.0.js";
    }
    else if (deviceAgent.match(/CDV5.1.1/)) {
        cordovaFile = "cordova-android-raw-5.1.1.js";
    }
    else {
        // default - cordova-android-raw.js (cordova version 3.6.4)
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = UrlResolver.getStaticJSPath(cordovaFile);
    document.getElementsByTagName("head")[0].appendChild(script);
})();