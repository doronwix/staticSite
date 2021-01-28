/*global trackingData*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/pagewithcaptcha',
            ['tracking/loggers/datalayer', 'tracking/loggers/gglanalyticslogger'],
            factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.pageWithCaptcha = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {
    function init() {
        var attempts = 0;

        var waitForMeta = function () {
            attempts += 1;
            if (attempts > 40) return;
            if (
              typeof trackingData == "undefined" ||
              typeof trackingData.getProperties == "undefined" ||
              typeof trackingData.getProperties().Meta == "undefined"
            ) {
                window.setTimeout(waitForMeta, 250);
            } else {
                var meta = trackingData.getProperties().Meta;
                if (meta.gaclientid) {
                    try {
                        window.localStorage.setItem("gaclientid", meta.gaclientid);
                    } catch (e) { }
                }
                var data = {
                    event: "load-google-analytics",
                    gauserid: "",
                    gaclientid: meta.gaclientid || ""
                };

                dataLayer.push(data);
            }
        };

        if (null !== window.location.href.match(/\/Parse/i)) {
            waitForMeta();
        }
    }

    return {
        init: init
    };
}));
