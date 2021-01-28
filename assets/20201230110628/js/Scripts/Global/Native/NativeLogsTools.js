
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

