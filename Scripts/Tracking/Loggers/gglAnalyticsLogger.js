/*global trackingData */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/gglanalyticslogger', [
            'tracking/loggers/datalayer',
            'tracking/loggers/pagenocaptcha',
            'tracking/loggers/pagewithcaptcha'
        ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.gglAnalyticsLogger = factory(root.dataLayer, root.fxTracking.pageNoCaptcha, root.fxTracking.pageWithCaptcha);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer, pageNoCaptcha, pageWithCaptcha) {

    function _loadAnalytics() {
        // store the name of the Analytics object
        window.GoogleAnalyticsObject = 'ga';

        // check whether the Analytics object is defined
        if (!('ga' in window)) {

            // define the Analytics object
            window.ga = function () {

                // add the tasks to the queue
                window.ga.q.push(arguments);

            };

            // create the queue
            window.ga.q = [];

        }

        // store the current timestamp
        window.ga.l = (new Date()).getTime();

        // create a new script element
        var script = document.createElement('script');
        script.src = '//www.google-analytics.com/analytics.js';
        script.async = true;

        // insert the script element into the document
        var firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
    }

    function loadAnalytics(obj) {
        if (!(obj && obj.event === 'load-google-analytics')) {
            return;
        }

        _loadAnalytics();

        var gaclientid = obj.gaclientid || '',
            gauserid = obj.gauserid || '',
            sauser;
        try {
            sauser = window.localStorage.getItem("sauser");
        } catch (e) { }

        if (gaclientid != "") {
            window.ga("create", "UA-20661807-41", {
                clientId: gaclientid
            });
        } else if (gauserid != "") {
            window.ga("create", "UA-20661807-41", "auto", {
                userId: gauserid
            });
        } else if (sauser) {
            window.ga("create", "UA-20661807-41", "auto");
        } else {
            window.ga("create", "UA-20661807-28", "auto");
        }

        if (typeof window.__gaq != "undefined") {
            if (window.__gaq.q) {
                for (var i = 0; i < window.__gaq.q.length; i++) {
                    window.ga.apply(window, window.__gaq.q[i]);
                }
            }
        }

        window.__gaq = function () {
            window.ga.apply(window, arguments);
        };

        try {
            var properties = trackingData.getProperties();
            if (properties.AccountNumber) {
                window._gadimensions = {
                    "2": "AccountNumber",
                    "4": "Broker",
                    "5": "DepositCategory",
                    "6": "FirstDealDate",
                    "7": "FolderType",
                    "8": "NumberOfDeals",
                    "9": "NumberOfDeposits",
                    "10": "Serial",
                    "11": "VolumeCategory"
                };

                var dimensions = {};
                for (var gadimension in window._gadimensions) {
                    if (typeof window._gadimensions[gadimension] != "string") {
                        continue;
                    }

                    if (properties[window._gadimensions[gadimension]]) {
                        dimensions["dimension" + gadimension] = properties[window._gadimensions[gadimension]];
                        delete window._gadimensions[gadimension];
                    }
                }

                window.ga("set", dimensions);
            }
        } catch (e) { /*console && console.error(arguments); */ }

        window.ga("send", "pageview");
    }

    function init() {
        dataLayer.subscribers.push(loadAnalytics);

        if (null !== window.location.href.match(/\/Parse/i)) {
            pageWithCaptcha.init();
        } else {
            pageNoCaptcha.init();
        }
    }

    return {
        init: init
    };
}));
