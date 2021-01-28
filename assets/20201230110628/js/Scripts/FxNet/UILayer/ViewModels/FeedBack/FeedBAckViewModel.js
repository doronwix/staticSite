define("viewmodels/FeedBack/FeedBackViewModel", [
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"devicemanagers/ViewModelsManager",
	"Dictionary",
	"handlers/Logger",
	"tracking/loggers/datalayer",
	"handlers/languageHelper",
	"FxNet/UILayer/ChatBot/FeedBackManager",
	"trackingIntExt/TrackingData",
	"global/UrlResolver",
], function (
	ko,
	general,
	KoComponentViewModel,
	viewModelsManager,
	dictionary,
	logger,
	dataLayer,
	languageHelper,
	feedBackManager,
	trackingData,
	UrlResolver
) {
	var element_id = "feedback",
		visible = ko.observable(false),
		EVENT_CATEGORY = "fx-feedback",
		RESOURCE_NAME = "emily_feedback",
		HISTORY = null,
		language = languageHelper.GetLanguage();

	function logErrorEvent(data) {
		logger.warn("Chatbot-FeedBack", data);
	}

	function logTrackingEvent(type, name, data) {
		data = data || [];

		var eventProp = {
			section: null,
			text: null,
		};

		for (var i = 0; i < data.length; i++) {
			var property = data[i].split("=");

			if (property.length > 1) {
				if (property[0] === "section") {
					eventProp.section = property[1];
				} else if (property[0] === "text") {
					eventProp.text = property[1];
				}
			}
		}

		if (!general.isNullOrUndefined(eventProp.section) && !general.isNullOrUndefined(eventProp.text)) {
			HISTORY[eventProp.section] = eventProp.text;
		}
	}

	function onCallback(data) {
		var storeLink;

		if (UrlResolver.isNativeIos()) {
			//link_appstore', 'link_googleplay'
			storeLink = dictionary.GetItem("link_appstore", RESOURCE_NAME);
		} else {
			storeLink = dictionary.GetItem("link_googleplay", RESOURCE_NAME);
		}

		logTrackingEvent("click", "", data);

		if (storeLink !== "#") {
			window.open(storeLink, "_blank");
		}

		onClose();
	}

	function onClose() {
		viewModelsManager.VManager.History.GoBack();
	}

	var FeedBackViewModel = general.extendClass(KoComponentViewModel, function (params) {
		var parent = this.parent;

		function init(_params) {
			parent.init(_params);

			HISTORY = {};
			sessionStorage.removeItem("emilyUserData_feedback");

			visible(true);

			var config = {
				startBlockId: 10,
				name: "FeedBack",
				onError: logErrorEvent,
				onLoad: logTrackingEvent,
				onClose: onClose,
				onTrack: logTrackingEvent.bind(this),
				onCallback: onCallback,
				defaultStatus: "show",
				history: "session",
				header: { slogan: "", name: dictionary.GetItem("header_message", RESOURCE_NAME) },
				scrollMode: "start",
			};

			feedBackManager.start(config);
		}

		function addCommonInfoAndSend(history) {
			var toSend = general.cloneHardCopy(history),
				trackingProperties = trackingData.getProperties(),
				feedbackProperties = trackingData.getNonTrackingProperties();

			toSend.event = EVENT_CATEGORY;
			toSend.Language = language;
			toSend.Folder = trackingProperties.FolderType;
			toSend.Broker = trackingProperties.Broker;
			toSend.OS = trackingProperties.OS;
			toSend.OSVersion = trackingProperties.OSVersion;
			toSend.Browser = trackingProperties.Browser;
			toSend.BrowserVersion = trackingProperties.BrowserVersion;
			toSend.ResolutionScreen = trackingProperties.ResolutionScreen;
			toSend.Country = trackingProperties.Country;

			toSend.FolderName = feedbackProperties.FolderName;
			toSend.RetentionPerson = feedbackProperties.RetentionPerson;
			toSend.RetentionEmail = feedbackProperties.RetentionEmail;
			toSend.PotentialValue = feedbackProperties.PotentialValue;
			toSend.SiteTriggerName = feedbackProperties.SiteTriggerName;
			dataLayer.push(toSend);
		}

		function dispose(_params) {
			parent.dispose(_params);

			feedBackManager.dispose();

			if (!general.isNullOrUndefined(HISTORY) && Object.keys(HISTORY).length > 0) {
				addCommonInfoAndSend(HISTORY);
			}

			HISTORY = null;
			sessionStorage.removeItem("emilyUserData_feedback");
		}

		return {
			init: init,
			visible: visible,
			dispose: dispose,
			element_id: element_id,
		};
	});

	function createViewModel(params) {
		var viewModel = new FeedBackViewModel(params || {});

		viewModel.init();

		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
