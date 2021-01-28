/*global OneSignal*/
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("OneSignalModule", ["knockout", 'handlers/general', "Dictionary", "ScmmSettingsModule"], factory);
    } else {
        root.Requester = factory(root.ko, root.General, root.Dictionary, root.scmmSettingsModule);
    }
}(this, function(ko, general, dictionary, scmmSettingsModule) {
    var oneSignalModule = {}

    ko.postbox.subscribe(eFxNetEvents.GtmConfigurationSet,
        function(gmtConfig) {
            if (!general.isDefinedType(gmtConfig) || true !== gmtConfig.oneSignal) {
                return;
            }

            var oneSignal = window.OneSignal || (window.OneSignal = []);
            if (general.isFunctionType(oneSignal)) {
                //prevent OneSignal init twice
                return;
            }

            if (dictionary.ValueIsEmpty("oneSignalAppId")) {
                return null;
            }

            var appId = dictionary.GetItem("oneSignalAppId");

            var config = {
                appId: appId,
                path: "/WebPL3/Scripts/Vendor/OneSignal/",
                autoRegister: true,
                notifyButton: {
                    enable: false,
                    offset: { right: "150px" },
                    displayPredicate: function() {
                        return OneSignal.isPushNotificationsEnabled()
                            .then(function(isPushEnabled) {
                                /* The user is subscribed, so we want to return "false" to hide the notify button */
                                return !isPushEnabled;
                            });
                    }
                }
            };
            oneSignal.push(function() {
                // Be sure to call this code *before* you initialize the web SDK

                // This registers the workers at the root scope, which is allowed by the HTTP header "Service-Worker-Allowed: /"
                OneSignal.SERVICE_WORKER_PARAM = { scope: "/" };
            });

            oneSignal.push(["init", config]);

            // Add Code to send our server the UserID
            oneSignal.push(function() {
                OneSignal.on("subscriptionChange",
                    function(isSubscribed) {
                        OneSignal.getUserId(function(userId) {
                            scmmSettingsModule
                                .updateCustomerPushNotificationToken(userId,
                                    isSubscribed ? 1 : 0,
                                    "",
                                    "",
                                    scmmSettingsModule.deviceType.ChromeDesktop);

                        });
                    });
            });

            require(["OneSignalSDK"]);
        });

    return oneSignalModule;
}));
