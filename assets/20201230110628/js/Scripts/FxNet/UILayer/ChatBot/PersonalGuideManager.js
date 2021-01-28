define("FxNet/UILayer/ChatBot/PersonalGuideManager", [
    "require",
    "Q",
    "knockout",
    "handlers/general",
    "handlers/Logger",
    "tracking/loggers/datalayer",
    "initdatamanagers/Customer",
    "Dictionary",
    "tracking/loggers/hotjareventslogger",
    "handlers/languageHelper",
    "global/UrlResolver",
    "StateObject!HelpcHub",
    "trackingIntExt/TrackingData",
    "LoadDictionaryContent!fx_personal_guide",
    "configuration/initconfiguration",
], function PersonalGuideManager(require) {
    var ko = require("knockout"),
        Q = require("Q"),
        general = require("handlers/general"),
        logger = require("handlers/Logger"),
        dataLayer = require("tracking/loggers/datalayer"),
        customer = require("initdatamanagers/Customer"),
        dictionary = require("Dictionary"),
        hotjar = require("tracking/loggers/hotjareventslogger"),
        trackingData = require("trackingIntExt/TrackingData"),
        languageHelper = require("handlers/languageHelper"),
        stateObjectHelpc = require("StateObject!HelpcHub"),
        urlResolver = require("global/UrlResolver"),
        configuration = require('configuration/initconfiguration').PersonalGuideConfiguration,
        template_data = null,
        refElementId = "personalGuideHelpcenterContainer",
        _chatBot = null,
        chatBotInstance = null,
        isEnabled = Q.defer(),
        config = null,
        isAcceptedSAProcessType = customer.prop.SAProcess === 1,
        storageFactory = StorageFactory(StorageFactory.eStorageType.local),
        helpCenterStorageKey = "help-center-states",
        personalGuideResourceName = "fx_personal_guide",
        isPersonalGuideEnabled = dictionary.GetItem("fx-personal-guide", personalGuideResourceName, "NA") !== "NA",
        personalGuideName = customer.prop.abTestings.configuration["fx-personal-guide"],
        PersonalAssistants = {
            Max: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    title: dictionary.GetItem("fx-personal-guide-max-bubble-title", personalGuideResourceName),
                    message: dictionary.GetItem("fx-personal-guide-max-bubble-message", personalGuideResourceName),
                },
            }, configuration.PersonalAssistants.Max),

            Lexi: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    title: dictionary.GetItem("fx-personal-guide-lexi-bubble-title", personalGuideResourceName),
                    message: dictionary.GetItem("fx-personal-guide-lexi-bubble-message", personalGuideResourceName),
                },
            }, configuration.PersonalAssistants.Lexi),

            MaxSA: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    title: dictionary.GetItem("fx-personal-guide-max-bubble-title", personalGuideResourceName),
                    message: dictionary.GetItem("fx-personal-guide-max-bubble-message", personalGuideResourceName),
                },
            }, configuration.PersonalAssistants.MaxSA),

            LexiTestVariation4: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    message: dictionary.GetItem("fx-personal-guide-lexi-bubble-v4-message", personalGuideResourceName),
                    text: dictionary.GetItem("fx-personal-guide-bubble-v4-common-message", personalGuideResourceName),
                    ctaAbort: dictionary.GetItem("fx-personal-guide-bubble-abort-button", personalGuideResourceName),
                    ctaChatbot: dictionary.GetItem(
                        "fx-personal-guide-bubble-chatbot-button",
                        personalGuideResourceName
                    ),
                }
            }, configuration.PersonalAssistants.LexiTestVariation4),

            MaxTestVariation4: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    message: dictionary.GetItem("fx-personal-guide-max-bubble-v4-message", personalGuideResourceName),
                    text: dictionary.GetItem("fx-personal-guide-bubble-v4-common-message", personalGuideResourceName),
                    ctaAbort: dictionary.GetItem("fx-personal-guide-bubble-abort-button", personalGuideResourceName),
                    ctaChatbot: dictionary.GetItem(
                        "fx-personal-guide-bubble-chatbot-button",
                        personalGuideResourceName
                    ),
                },
            }, configuration.PersonalAssistants.MaxTestVariation4),
        },
        selectedAssistant = null,
        SiteTriggerNameExcluded = ["ib", "cashback", "cashbackaff", "finalcashback", "sageneral", "welcomebonus100_sa"];

    function getPGInteractedStatus() {
        var obj = JSONHelper.STR2JSON(
            "HelpCenterViewModel:getPGInteractedStatus",
            storageFactory.getItem(helpCenterStorageKey)
        ) || { pgInteracted: false };
        return obj.pgInteracted;
    }

    function buildChatBotConfig(chatBotConfig) {
        config = {
            name: chatBotConfig.name.replace(/SA$/, ""),
            onError: function (data) {
                logger.warn("Chatbot-PersonalGuide", data);
            },
            onLoad: function () {
                var eventObj = { event: "personalguide4helpcenter-ready" };

                eventObj.agentName = chatBotConfig.name;
                eventObj.agentVersion = chatBotConfig.version;
                eventObj.agentLanguage = chatBotConfig.language;
                dataLayer.push(eventObj);
            },
            onClose: function () { },
            onTrack: function (type, name, _data) {
                var eventObj = { event: name, eventType: type };

                if (type == "click" && !getPGInteractedStatus()) {
                    stateObjectHelpc.update("pg-interacted", true);
                }

                for (var i = 1; i < _data.length; i++) {
                    var property = _data[i].split("=");
                    if (property.length > 1) eventObj[property[0]] = property[1];
                }
                eventObj.agentName = chatBotConfig.name;
                eventObj.agentVersion = chatBotConfig.version;
                eventObj.agentLanguage = chatBotConfig.language;

                window.emilyCurrentBlock = eventObj.block_id;
                dataLayer.push(eventObj);
            },
            onCallback: function (_data) {
                switch (_data[0]) {
                    case "deposit": {
                        $viewModelsManager.VManager.RedirectToURL("/webpl3/Account/Redirect/Deposit");
                        break;
                    }
                    case "walkthrough": {
                        dataLayer.push({ event: "personalguide4helpcenter-play", walkthroughToPlay: _data[1] });
                        break;
                    }
                    default: {
                        dataLayer.push({
                            event: "personalguide-callback-error",
                            data: (_data[0] || {}).toString(),
                        });
                    }
                }
            },
            defaultStatus: "hide",
            history: true,
        };

        if (languageHelper.IsRtlLanguage()) {
            config.direction = "rtl";
        }

        config.base_url = urlResolver.getStaticJSPath() + "/fx-chatbot";
    }

    function _initChatBot() {
        var assistantName = isAcceptedSAProcessType ? "MaxSA" : personalGuideName;

        if (isPersonalGuideEnabled && assistantName) {
            selectedAssistant = PersonalAssistants[assistantName];
        } else {
            isEnabled.reject(false);
            return;
        }

        require([
            "assets/js/fx-chatbot/main",
            "text!assets/js/fx-chatbot/data/PersonalGuide/" +
            selectedAssistant.name +
            "_" +
            selectedAssistant.version +
            "_" +
            selectedAssistant.language +
            ".js",
        ], function (chatBot, data_txt) {
            _chatBot = chatBot;

            hotjar.init(true)
                .fin(function () {
                    dataLayer.push({ "event": "part-of-test", "variation": selectedAssistant.variation });

                    template_data = JSON.parse(data_txt);

                    buildChatBotConfig(selectedAssistant);

                    isEnabled.resolve(true);
                });
        });
    }

    function startChatBoot() {
        isEnabled.promise.then(function (enabled) {
            if (enabled && _chatBot && general.isFunctionType(_chatBot.ChatBot)) {
                chatBotInstance = _chatBot.ChatBot(template_data, config, document.getElementById(refElementId));
            }
        });
    }

    function showChatBot() {
        isEnabled.promise.then(function (enabled) {
            if (enabled) {
                chatBotInstance.changeStatus("show");
            }
        });
    }

    function dispose() {
        isEnabled.promise.then(function (enabled) {
            if (enabled) {
                chatBotInstance.dispose();
            }
        });

        biCustomerUnsubscribe();
    }

    function _initPersonalGuide(scmmDataLOaded) {
        if (scmmDataLOaded === true) {
            biCustomerUnsubscribe();

            var _trackingData = trackingData.getProperties(),
                _nonTrackingData = trackingData.getNonTrackingProperties();

            if (
                !general.objectContainsKey(_nonTrackingData, "SiteTriggerName") ||
                SiteTriggerNameExcluded.indexOf(_nonTrackingData.SiteTriggerName.toLowerCase()) >= 0 ||
                parseInt(_trackingData.NumberOfDeposits) > 0
            ) {
                isEnabled.reject(false);
                return;
            }

            _initChatBot();
        }
    }

    var sccmDataLoaded, sccmDataLoadedSubscriber;
    function _init() {
        sccmDataLoaded = ko.observable();
        sccmDataLoadedSubscriber = sccmDataLoaded.subscribe(_initPersonalGuide);
        sccmDataLoaded.subscribeTo("scmm-data-loaded", true);
    }

    function biCustomerUnsubscribe() {
        if (sccmDataLoadedSubscriber) {
            sccmDataLoadedSubscriber.dispose();
            sccmDataLoaded.unsubscribeFrom("scmm-data-loaded");
        }
    }

    _init();

    return {
        enabled: isEnabled.promise,
        start: startChatBoot,
        show: showChatBot,
        dispose: dispose,
        getBubbleNessage: function getBubbleNessage() {
            return selectedAssistant.bubbleMessage;
        },
    };
});
