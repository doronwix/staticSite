(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/fxtracking.lib',
            [
                'tracking/loggers/datalayer',
                'tracking/googleTagManager',
                'tracking/loggers/fxeventslogger',
                'tracking/loggers/fbeventslogger',
                'tracking/loggers/hotjareventslogger',
                'tracking/loggers/snapengagechat',
                'tracking/loggers/gglanalyticslogger'
            ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};

        root.fxTracking.init = factory(root.dataLayer, root.googleTagManager, root.fxTracking.fxEventsLogger,
                                        root.fxTracking.fbEventsLogger, root.fxTracking.hotJarEventsLogger,
                                        root.fxTracking.snapEngageChat, root.fxTracking.gglAnalyticsLogger)
            .init;
    }
}(typeof self !== 'undefined' ? self : this,
    function (dataLayer, googleTagManager, fxEventsLogger, fbEventsLogger, hotJarEventsLogger, snapEngageChat, gglAnalyticsLogger) {
        function init(gtmId, abTestingConfiguration, biServiceURL) {
            var gtmConfiguration = {},
                libs = {
                    "disable-gtm": 'disableGTM',
                    "disable-gtm-fxtracking": 'disableGTMFXTracking',
                    "disable-gtm-gglanalytics": 'disableGTMGoogleAnalytics',
                    "disable-gtm-fbevents": 'disableGTMFacebookEvents',
                    "disable-gtm-hotjar": 'disableGTMHotjar',
                    "disable-gtm-snapchat": 'disableGTMSnapChat'
                };

            for (var t in libs) {
                if (abTestingConfiguration[t] === true) {
                    gtmConfiguration[libs[t]] = true;
                }
            }

            window.gtmConfiguration = {};

            if (Object.keys(gtmConfiguration).length > 0) {
                window.gtmConfiguration = gtmConfiguration;
            }

            dataLayer.init();

            if ('#' != gtmId && !gtmConfiguration.disableGTM) {
                googleTagManager.Init(gtmId);
            }

            _init(gtmConfiguration, biServiceURL);
        }

        function _init(gtmConfiguration, biServiceURL) {
            if (gtmConfiguration.disableGTMGoogleAnalytics) {
                gglAnalyticsLogger.init();
            }

            if (gtmConfiguration.disableGTMFXTracking) {
                fxEventsLogger.init(biServiceURL);
            }

            if (gtmConfiguration.disableGTMFacebookEvents) {
                fbEventsLogger.init();
            }

            if (gtmConfiguration.disableGTMHotjar) {
                hotJarEventsLogger.init();
            }

            if (gtmConfiguration.disableGTMSnapChat) {
                snapEngageChat.init();
            }
        }

        return {
            init: init
        };

    }));