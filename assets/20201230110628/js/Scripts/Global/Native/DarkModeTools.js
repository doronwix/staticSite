var DarkModeTools = {
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
     DarkModeTools.receivedEvent('deviceready');
     console.log('DarkMode onDeviceReady');
     //alert('DarkMode onDeviceReady');
},
receivedEvent: function(id) {
    console.log('Received Event: ' + id);
},
DarkModeisAvailable: function() {
    console.log('DarkModeisAvailable Function');
    try {
        cordova.plugins.ThemeDetection.isAvailable(successisAvailable, errorisAvailable);
    } catch (err) {
        // nada for now
        console.log("cordova.plugins.ThemeDetection Doesnt exists. err is: " + err);
       // alert("catch error: " + err);
    }
    
    function successisAvailable(success) {
              console.log(success);
            //  alert(success.message);
        }

    function errorisAvailable(error) {
              console.log(error);
              //alert("error is: " + error);
        }
},
DarkModeisEnabled: function() {
    console.log('DarkModeisEnabled Function');
    try {
        cordova.plugins.ThemeDetection.isDarkModeEnabled(successisEnabled, errorisEnabled);
    } catch (err) {
        // nada for now
        console.log("cordova.plugins.ThemeDetection Doesnt exists. err is: " + err);
       // alert("catch error: " + err);
    }

    function successisEnabled(success) {
              console.log(success);
              //alert(success.message);
        }

    function errorisEnabled(error) {
              console.log(error);
             // alert("error is: " + error);
        }
}

};

DarkModeTools.initialize();

