/*global trackingData, SnapEngage, isNullOrUndefined */
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/snapengagechat', ['tracking/loggers/datalayer',
            'LoadDictionaryContent!SnapEngageConfig', 'handlers/general', 'trackingIntExt/TrackingData'
        ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.snapEngageChat = factory(root.dataLayer, root.fxTracking.trackingConfig.snapengageconfig, { isNullOrUndefined: isNullOrUndefined }, root.trackingData);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer, snapEngageConfig, general, trackingData) {
    function isSAUser() {
        var sauser;
        try {
            sauser = window.localStorage.getItem("sauser");
        } catch (e) { }

        if (document.location.search.match(/sauser=true/) ||
            trackingData.getProperties().SAProcess ||
            !!sauser) {
            return true;
        }

        return false;
    }

    function getSnapEngageWidgetId() {
        if (isSAUser() && snapEngageConfig.SnapEngageWidgetID_sauser) {
            return snapEngageConfig.SnapEngageWidgetID_sauser
        }

        return snapEngageConfig.SnapEngageWidgetID;
    }

    function getCallbackWidgetId() {
        return snapEngageConfig.CallbackWidgetId
    }

    function loadSnapEngage() {
        var se = document.createElement("script"),
            SnapEngageWidgetId = getSnapEngageWidgetId();

        se.type = "text/javascript";
        se.async = true;
        se.src = "//storage.googleapis.com/code.snapengage.com/js/" + SnapEngageWidgetId + ".js";
        var done = false;
        se.onload = se.onreadystatechange = function () {
            if (
                !done &&
                (!this.readyState ||
                    this.readyState === "loaded" ||
                    this.readyState === "complete")
            ) {
                done = true;
                if (general.isNullOrUndefined(SnapEngageWidgetId)) {
                    var accountNumber = trackingData.getProperties().AccountNumber;
                    if (!general.isNullOrUndefined(accountNumber) && !general.isNullOrUndefined(SnapEngage)) {
                        SnapEngage.setUserName(trackingData.getProperties().AccountNumber);
                        SnapEngage.setUserEmail(accountNumber + "@trader.com");
                    }
                }
            }
        };
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(se, s);
    }

    function dataLayerEventHandler(obj) {
        if (!(obj && obj.event) ||
            (0 > ['start-chat', 'start-callback-request-chat', 'start-proactive-chat'].indexOf(obj.event)) ||
            typeof SnapEngage == "undefined") {

            return;
        }

        var ipCountry = trackingData.getProperties().IPCountry;

        switch (obj.event) {
            case 'start-chat':
                if (ipCountry.match(/(Poland|Italy|France|Spain|Greece|Holland|Germany)/i)) {
                    SnapEngage.setWidgetId(getCallbackWidgetId());
                } else {
                    SnapEngage.setWidgetId(getSnapEngageWidgetId());
                }
                SnapEngage.startLink();
                break;
            case 'start-callback-request-chat':
                try {
                    SnapEngage.setWidgetId(getCallbackWidgetId());
                    SnapEngage.startLink();
                } catch (e) { /*console && console.error(arguments); */ }
                break;
            case 'start-proactive-chat':
                var message = obj['snapengage_message'];
                SnapEngage.openProactiveChat(true, false, message);
                break;
        }
    }

    var attempts = 0;
    function waitForTrackingData() {
        attempts += 1;
        if (attempts > 40) return;

        if (
            typeof trackingData == "undefined" ||
            typeof trackingData.getProperties == "undefined"
        ) {
            window.setTimeout(waitForTrackingData, 250);
        } else {
            loadSnapEngage();

            dataLayer.subscribers.push(dataLayerEventHandler);
        }
    }

    function init() {
        if (!window.SnapEngage) {
            if (document.readyState === 'loading') {  // Loading hasn't finished yet
                document.addEventListener('DOMContentLoaded', waitForTrackingData);
            } else {  // `DOMContentLoaded` has already fired
                waitForTrackingData();
            }
        }
    }

    return {
        init: init
    };
}));