/*global trackingData */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/fbeventslogger', ['tracking/loggers/datalayer'], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.fbEventsLogger = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {

    function loadFB(f, b, e, v, n, t, s) {
        if (!f.fbq) {// return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = "2.0";
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);

            f.fbq('init', '871141973245420');
            f.fbq('track', "PageView");

            dataLayer.push({ "event": "fb-ready" });
        }

        if (window["fbq"]) {
            window.fbq("track", "ViewContent", {
                value: trackingData.getProperties().NumberOfDeposits
            });
        }
    }

    function dataLayerEventHandler(obj) {
        if (!(obj && obj.event && obj.event && obj.event.toLowerCase() == 'login-success')) {
            return;
        }

        loadFB(window, document, "script", "//connect.facebook.net/en_US/fbevents.js");
    }

    function init() {
        if (0 > dataLayer.indexOf(function (e) { return e.event && e.event && e.event.toLowerCase() === 'login-success' })) {
            dataLayer.subscribers.push(dataLayerEventHandler);
        } else {
            loadFB(window, document, "script", "//connect.facebook.net/en_US/fbevents.js");
        }
    }

    return {
        init: init
    };
}));
