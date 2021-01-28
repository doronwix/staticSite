/*global trackingData */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define("tracking/loggers/fxeventslogger",
            [
                "tracking/loggers/datalayer",
                "tracking/loggers/gglanalitycsconfigs"
            ],
            factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.fxEventsLogger = factory(root.dataLayer, root.fxTracking.gglAnalitycsConfigs);
    }
}(typeof self !== "undefined" ? self : this, function (dataLayer, gglAnalyticsConfig) {
    var ignoredEvents = [
        "fb-ready",
        "create-helpwidget",
        "load-google-analytics",
        "trackingdata-loaded",
        "interaction",
        "hotjar-init",
        "self-activation-user"
    ];
    var interactionViews = [2, 3, 4, 6, 9, 15, 17, 18, 19, 20, 21];
    var interactionEvents = ["deal-slip-interaction", "account-summary-interaction", "new-limit-view"];

    var biServiceURL;

    function _e2vp(eventSection, eventAction, eventName, eventCategory, viewId) {
        // maps events to virtual page views (there are cases we want to send the event as a pageview for different reasons)
        if (eventSection == "Help" && eventAction == "Show")
            return "vp_help-widget-start";
        if (eventName == "questionnaire-navigation") {
            switch (eventCategory) {
                case "Cdd part 1":
                    return "vp_cdd-page-1";
                case "Cdd part 2":
                    return "vp_cdd-page-2";
                case "Kyc":
                    return "vp_cdd-submit";
            }
        }
        if (eventName == "View" && (viewId == 10 || viewId == 27))
            return "vp_cdd-start";
        if (eventName.match(/^agreement/) && (viewId == 6 || viewId == 15))
            return "vp_missing-information" + eventName.replace(/^agreement/, "");
        if (eventName.match(/^deposit/)) return "vp_" + eventName;
        return null;
    }

    function trace() {
        try {
            /*console.info.apply(console, arguments);*/
        } catch (e) { /*console && console.error(arguments); */ }
    }

    function getproperties(eventname) {
        // returns an object with all the properties that were sent along with the event
        var i = dataLayer.length;
        while (i--) {
            if (dataLayer[i].event && dataLayer[i].event == eventname) {
                var obj = {};
                for (var x in dataLayer[i]) {
                    if (x != "event") obj[x] = dataLayer[i][x];
                }
                return obj;
            }
        }
        return {};
    }

    function dataLayerEventHandler(obj) {
        var eventName = obj.event;
        if (eventName.match(/^[gtm|_]/ig) || (eventName === "interaction" && obj.artificial === true)) {
            return;
        }

        var viewId = obj.ViewId,
            eventSection = gglAnalyticsConfig.GetSection(eventName),
            eventAction = obj.action,
            eventCategory = obj.category,
            interactionView = interactionViews.indexOf(viewId) >= 0,
            interactionEvent = interactionEvents.indexOf(eventName) >= 0,
            ignoreEvent = ignoredEvents.indexOf(eventName) >= 0;

        window.__gaq = window.__gaq || function () {
            window.__gaq.q = window.__gaq.q || [];
            window.__gaq.q.push(arguments);
        };

        try {
            var eventdata = getproperties(eventName);

            // look for the TrackingSessionId and store it in localStorage in case later events will be sent without it
            if (eventdata.TrackingSessionId) {
                window.sessionStorage.setItem("TrackingSessionId", eventdata.TrackingSessionId);
            } else {
                eventdata.TrackingSessionId = window.sessionStorage.getItem("TrackingSessionId");
            }

            // check if SAProcess is passed with the event and store for later use (not all events are sent with the SAProcess)
            if (eventdata.SAProcess) {
                window.sessionStorage.setItem("SAProcess", eventdata.SAProcess);
            } else {
                eventdata.SAProcess = window.sessionStorage.getItem("SAProcess");
            }

            var eventname = eventName;

            if (!eventname || (typeof eventname !== "string") || (eventname.replace(/ /g, "") == "")) {
                dataLayer.push({ event: "unknown" });
                return;
            }

            // look for the ChatBot agent name in the 'personalguide4helpcenter-ready' events
            if (eventName == "personalguide4helpcenter-ready") {
                var agentName = obj.agentName;

                if (agentName && typeof window.hj !== "undefined") {
                    window.__gaq("send", "pageview", "/virtual-pages/" + agentName);
                    window.hj("tagRecording", [agentName]);
                }
            }

            // add the account number to the event
            var accountnumber = trackingData.getProperties().AccountNumber;
            if (accountnumber) eventdata.AccountNumber = accountnumber;

            // when we initiate the Google Analytics tag we also store in memory (window._gadimensions) the list of dimensions we should send back to Google Analytics with each event
            try {
                if (window._gadimensions) {
                    var properties = trackingData.getProperties();
                    var dimensions = {};
                    for (var i in window._gadimensions) {
                        if (typeof window._gadimensions[i] !== "string") continue;
                        if (properties[window._gadimensions[i]]) {
                            dimensions["dimension" + i] = properties[window._gadimensions[i]];
                            delete window._gadimensions[i];
                        }
                    }

                    if (typeof window.hj !== "undefined") {
                        // if HotJar is present, save userId into dimension14 in Google Analytics
                        try {
                            dimensions["dimension14"] = window.hj.pageVisit.property.get("userId");
                        } catch (e) { /*console && console.error(arguments); */ }
                    }
                    window.__gaq("set", dimensions);
                }
            } catch (e) { /*console && console.error(arguments); */ }

            if (eventName == "registration-interaction" && document.location.href.match(/\/Confirm/)) {
                // if here, we should be able to grab the UserWithExperience checkbox. Store it in localStorage for later use
                var userWithExperience = document.getElementsByName(
                    "UserWithExperience"
                );
                if (userWithExperience.length > 0) {
                    for (var idx = 0; idx < userWithExperience.length; idx++) {
                        if (userWithExperience[idx].checked) {
                            window.sessionStorage.setItem(
                                "hasExperience",
                                userWithExperience[idx].value
                            );
                            break;
                        }
                    }
                }
            } else if (trackingData.getProperties().SAProcess) {
                // if SA user, send virtual page with the user's experience
                var hasExperience = window.sessionStorage.getItem("hasExperience");
                window.sessionStorage.removeItem("hasExperience");
                if (hasExperience) {
                    window.__gaq("set", "dimension12", hasExperience);
                    window.__gaq("send", "pageview", "/virtual-pages/vp_experience_" + (hasExperience == "True" ? "true" : "false"));

                    try {
                        window.hj =
                            window.hj ||
                            function () {
                                (window.hj.q = window.hj.q || []).push(arguments);
                            };
                        window.hj("tagRecording", [
                            "vp_experience_" + (hasExperience == "True" ? "true" : "false")
                        ]);
                    } catch (e) {
                        trace();
                    }
                }
            }

            if (eventName == "View") {
                var gglViewName = gglAnalyticsConfig.GetName(viewId);

                window.__gaq("set", {
                    page: "/view/" + viewId + "/" + gglViewName,
                    title: gglViewName
                });
                window.__gaq("send", "pageview");
                eventdata["ItemName"] = gglViewName;
            } else if (eventSection != "None") {
                var eventLabel = eventName === "demo-click" ? "Practice" : eventName === "real-click" ? "Real" : "";

                if (eventSection == "Help" && eventAction == "Click") {
                    var itemName = itemName;
                    var itemType = itemType;
                    if (itemName || itemType)
                        eventLabel += (itemName || "") + " " + (itemType || "");
                }

                window.__gaq("send", "event", eventSection, eventAction, eventLabel);
            }

            var virtualpage = _e2vp(eventSection, eventAction, eventName, eventCategory, viewId);

            if (virtualpage) {
                window.__gaq("send", "pageview", "/virtual_pages/" + virtualpage);
                if (typeof window.hj !== "undefined") {
                    window.hj("tagRecording", [virtualpage]);
                }
            }

            if (!ignoreEvent) {
                var props = [];
                for (var d in eventdata) {
                    props.push(d + "=" + eventdata[d]);
                }
                var img = new Image();
                img.src = biServiceURL + "?name=" + eventname + "&" + props.join("&") + "&random=" + Math.random();
            }

            if (eventName != "interaction" &&
                ((eventName == "View" && interactionView) || interactionEvent)) {
                dataLayer.push({ event: "interaction", artificial: true });
            }
        } catch (e) {
            /*console.error("error in general", e);*/
        }
    }

    function init(_biServiceUrl) {
        biServiceURL = _biServiceUrl;

        dataLayer.subscribers.push(dataLayerEventHandler);
    }

    return {
        init: init
    };
}));