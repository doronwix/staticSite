
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

