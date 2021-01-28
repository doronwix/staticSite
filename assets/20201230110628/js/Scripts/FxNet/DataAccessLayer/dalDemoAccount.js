'use strict';

var TDALDemoAccount = function () {
    var dataAjaxer = new TAjaxer();

    var processDemoDeposit = function (onComplete) {
        dataAjaxer.get(
            "TDALDemoAccount/processDemoDeposit",
			"DemoAccount/ProcessDemoDeposit",
			"",
			onComplete,
            function (error) {
                ErrorManager.onError("TDALDemoAccount/processDemoDeposit", error.message, eErrorSeverity.low);
            },
            0, null, null, false
       );
    };

    return {
        processDemoDeposit: processDemoDeposit
    }
};