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