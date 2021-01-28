/*global trackingData */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/hotjareventslogger', ['tracking/loggers/datalayer',
            'LoadDictionaryContent!HotJarConfig', 'handlers/Logger', 'Q', 'handlers/Cookie'
        ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.hotJarEventsLogger = factory(root.dataLayer, root.fxTracking.trackingConfig.hotjarconfig, root.Logger);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer, hotJarConfig, logger, Q, cookieHandler) {
    var attempts = 0,
        MAX_ATTEMPS = 40,
        TIMEOUT = 250,
        deferer = Q ? Q.defer() : null,
        alreadyStarted = false;

    function waitForTrackingData() {
        attempts += 1;
        if (attempts > MAX_ATTEMPS || alreadyStarted) return;

        alreadyStarted = true;

        if (
            typeof trackingData == "undefined" ||
            typeof trackingData.getProperties == "undefined"
        ) {
            window.setTimeout(waitForTrackingData, TIMEOUT, true);
        } else {
            try {
                (function (h, o, t, j, a, r) {
                    h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
                    h._hjSettings = { hjid: hotJarConfig.hjid, hjsv: hotJarConfig.hjsv, hjdebug: hotJarConfig.hjdebug };
                    if (cookieHandler && "1" === cookieHandler.ReadCookie("fx-enable-hjdebug")) {
                        h._hjSettings.hjdebug = true;
                    }
                    a = o.getElementsByTagName("head")[0];
                    r = o.createElement("script");
                    r.async = 1;
                    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
                    r.onload = function () {
                        logger.warn('tracking/loggers/hotjareventslogger', 'hotjar loaded');
                        if (deferer) {
                            deferer.resolve();
                        }
                    };
                    r.onerror = function (evnt) {
                        logger.warn('tracking/loggers/hotjareventslogger', 'hotjar script load faill', null, 2);
                        if (deferer) {
                            deferer.reject();
                        }
                    };
                    a.appendChild(r);
                })(window, document, "//static.hotjar.com/c/hotjar-", ".js?sv=");
            } catch (e) {
                logger.warn({ e: e });
                if (deferer) {
                    deferer.reject();
                }
            }
        }
    }

    function dataLayerEventHandler(obj) {
        if (attempts > 0 || !(obj && obj.event === 'hotjar-init')) {
            return;
        }

        waitForTrackingData();
    }

    function init(now) {
        if (hotJarConfig.hjid && hotJarConfig.hjid !== '#') {
            if (now)
                waitForTrackingData();//
            else
                dataLayer.subscribers.push(dataLayerEventHandler);
        }

        if (deferer)
            return deferer.promise;
    }

    return {
        init: init
    };
}));
