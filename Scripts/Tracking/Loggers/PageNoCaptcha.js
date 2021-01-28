/*global trackingData*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/pagenocaptcha', ['tracking/loggers/datalayer', 'tracking/loggers/gglanalyticslogger'], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.pageNoCaptcha = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {
    function init() {
        var attempts = 0;
        var waitForAccountNumber = function () {
            attempts += 1;
            if (attempts > 40) return;
            if (
              typeof trackingData == "undefined" ||
              typeof trackingData.getProperties == "undefined" ||
              typeof trackingData.getProperties().AccountNumber == "undefined"
            ) {
                window.setTimeout(waitForAccountNumber, 250);
            } else {
                var data;
                if (trackingData.getProperties().SAProcess) {
                    var userid = trackingData.getProperties().AccountNumber;
                    data = {
                        event: "load-google-analytics",
                        gauserid: userid,
                        gaclientid: ""
                    };
                } else {
                    data = {
                        event: "load-google-analytics",
                        gauserid: "",
                        gaclientid: ""
                    };
                }

                dataLayer.push(data);
            }
        };

        if (null === window.location.href.match(/\/Parse/i)) {
            if (document.location.href.match(/\/login/i)) {
                if (document.location.search.match(/sauser=true/)) {
                    try {
                        window.localStorage.setItem("sauser", true);
                    } catch (e) { }
                }

                var gaclientid = "";
                try {
                    gaclientid = window.localStorage.getItem("gaclientid") || "";
                } catch (e) { }
                var data = {
                    event: "load-google-analytics",
                    gauserid: "",
                    gaclientid: gaclientid
                };

                dataLayer.push(data);
            } else {
                waitForAccountNumber();
            }
        }
    }

    return {
        init: init
    };
}));
