define("FxNet/UILayer/ChatBot/FeedBackManager", [
	"require",
	"Q",
	"assets/js/fx-chatbot/main",
	"initdatamanagers/Customer",
	"handlers/Logger",
	"handlers/languageHelper",
	"global/UrlResolver",
], function (require) {
	var Q = require("Q"),
		logger = require("handlers/Logger"),
		customer = require("initdatamanagers/Customer"),
		languageHelper = require("handlers/languageHelper"),
		urlResolver = require("global/UrlResolver"),
		refElementId = "feedback",
		_chatBot = require("assets/js/fx-chatbot/main").ChatBot,
		chatBotInstance = null,
		templateData,
		isReady = Q.defer();

	function _init() {
		try {
			require(["text!assets/js/fx-chatbot/data/feedback/feedback_" + customer.prop.language + ".js"], function (
				data_txt
			) {
				templateData = JSON.parse(data_txt);

				isReady.resolve(true);
			});
		} catch (e) {
			isReady.reject(false);
			logger.warn("FxNet/UILayer/ChatBot/FeedBackManager", "config template load error");
		}
	}

	function startChatBot(config) {
		isReady.promise.then(function (ready) {
			if (ready) {
				var refElement = document.getElementById(refElementId);
				if (languageHelper.IsRtlLanguage()) {
					config.direction = "rtl";
				}
				config.base_url = urlResolver.getStaticJSPath() + "/fx-chatbot";
				chatBotInstance = _chatBot(templateData, config, refElement);
			}
		});

		return isReady.promise;
	}

	function disposeChatBot() {
		isReady.promise.then(function (ready) {
			if (ready) {
				if (chatBotInstance.dispose) chatBotInstance.dispose();
			}
		});
	}

	_init();

	return {
		start: startChatBot,
		dispose: disposeChatBot,
	};
});
