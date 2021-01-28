define("managers/RetentionManager", [
	"require",
	"knockout",
	"handlers/general",
	"handlers/Delegate",
	"modules/environmentData",
	"initdatamanagers/Customer",
	"dataaccess/dalRetention",
	"managers/viewsmanager",
	"StateObject!SessionSupervisor",
	"Q",
	"global/apiIM",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		environmentData = require("modules/environmentData").get(),
		Customer = require("initdatamanagers/Customer"),
		dalRetention = require("dataaccess/dalRetention"),
		ViewsManager = require("managers/viewsmanager"),
		stateObject = require("StateObject!SessionSupervisor"),
		onSmartBannerDelegate = require("handlers/Delegate"),
		Q = require("Q"),
		apiIM = require("global/apiIM"),
		CurrentToken;

	var IMRequestIntervalModes = {
		PreLogin: -1,
		Login: 0,
		InSession: 1,
		AccountSwitch: 2,
	};

	function RetentionManager() {
		var onSmartBanner = new onSmartBannerDelegate(),
			isTokenReceived = Q.defer(),
			isApiImAlreadyInitialized = false;

		var subscribeToInteractiveMessage = function (token) {
			stateObject.set("userLoggedIn", false);

			stateObject.subscribe("userLoggedIn", function (value) {
				if (!isApiImAlreadyInitialized || value === true) {
					window.JSON2 = JSON;

					var requestIntervalMode;
					if (environmentData.switchToPlatform) {
						requestIntervalMode = IMRequestIntervalModes.AccountSwitch;
					} else if (value) {
						requestIntervalMode = IMRequestIntervalModes.Login;
					} else {
						requestIntervalMode = IMRequestIntervalModes.InSession;
					}

					var uiActionCallbacks = {
						deposit: depositCallback,
						accept: acceptCallback,
						walkthrough: walkThroughCallback,
						privacypolicy: privacypolicyCallback,
						imClosedDeals: imClosedDealsCallback,
						imOpenDeals: imOpenDealsCallback,
						imNewDeal: imNewDealCallback,
					};

					apiIM.InitAll(
						token,
						Customer.prop.interactiveMessagesUrl,
						Customer.prop.language,
						15000,
						uiActionCallbacks,
						requestIntervalMode,
						"false",
						invokeSmartBanner
					);
					apiIM.InitAll(
						token,
						Customer.prop.interactiveMessagesUrl,
						Customer.prop.language,
						36000000,
						uiActionCallbacks,
						IMRequestIntervalModes.InSession,
						"true",
						invokeSmartBanner
					);

					isApiImAlreadyInitialized = true;
				}
			});
		};

		var invokeSmartBanner = function () {
			var apiImArgs = general.argsToArray(arguments);
			onSmartBanner.Invoke.apply(null, apiImArgs);
		};

		var updateCurrentToken = function (responseText) {
			if (responseText.indexOf("ServerError") === -1 && general.containsHtmlTags(responseText) !== true) {
				CurrentToken = responseText;
				isTokenReceived.resolve(responseText);
			}
		};

		var updateToken = function () {
			return dalRetention.GetToken(updateCurrentToken);
		};

		var getCurrentToken = function () {
			return CurrentToken;
		};

		var depositCallback = function (args) {
			// go to deposit page
			sendRewardClickedEvent();

			if (!Customer.prop.isDemo) {
				ViewsManager.RedirectToForm(eForms.Deposit, {});
			}
		};

		var acceptCallback = function () {
			sendRewardClickedEvent();
		};

		var privacypolicyCallback = function () {
			sendRewardClickedEvent();
		};

		var imClosedDealsCallback = function () {
			sendRewardClickedEvent();
		};

		var imNewDealCallback = function () {
			sendRewardClickedEvent();
		};

		var imOpenDealsCallback = function () {
			sendRewardClickedEvent();
		};

		var walkThroughCallback = function () {
			if (typeof window.__walkthroughwidget != "undefined") window.__walkthroughwidget.play(2425);
		};

		var sendRewardClickedEvent = function () {
			ko.postbox.publish("reward-cta-clicked", {});
		};

		return {
			OnSmartBanner: onSmartBanner,
			SubscribeToInteractiveMessage: subscribeToInteractiveMessage,
			UpdateToken: updateToken,
			GetCurrentToken: getCurrentToken,
		};
	}

	return new RetentionManager();
});
