function TrackingExternalEvents(eventRaiser) {
	var self = {};
	self.getCurrentEventData = function () {
		return eventRaiser.eventData;
	};

	function removeParametersFromReferrerUrl(referrerUrl) {
		return referrerUrl.split("?")[0];
	}

	if (window.environmentData && window.environmentData.isDesktop)
		self.raiseEvent = function (name) {
			eventRaiser.eventData.event = name;
			eventRaiser.raiseEvent();
			return;
		};
	// todo temporary patch. smell bad
	// consider to reuse the rest of the specific handling for next drop
	// else regular behavior is used in external

	self["account-type-view"] = function () {
		eventRaiser.eventData.event = "account-type-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["demo-click"] = function () {
		eventRaiser.eventData.event = "demo-click";
		eventRaiser.raiseEvent();
	};

	self["real-click"] = function () {
		eventRaiser.eventData.event = "real-click";
		eventRaiser.raiseEvent();
	};

	self["registration-view"] = function (eventData) {
		if (eventData) {
			Object.assign(eventRaiser.eventData, eventData);
		}
		eventRaiser.eventData.event = "registration-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["registration-interaction"] = function () {
		eventRaiser.eventData.event = "registration-interaction";
		eventRaiser.raiseEvent();
	};

	self["registration-submit"] = function (options) {
		eventRaiser.eventData.event = "registration-submit";

		eventRaiser.eventData.ViewedPassword = window.trackingData.additionalProperties.data.ViewedPassword;
		eventRaiser.eventData.ViewedPrivacy = window.trackingData.additionalProperties.data.ViewedPrivacy;
		eventRaiser.eventData.ViewedAgreement = window.trackingData.additionalProperties.data.ViewedAgreement;
		eventRaiser.eventData.ChangedCountry = window.trackingData.additionalProperties.data.ChangedCountry;
		eventRaiser.eventData.UserWithExperience = window.trackingData.additionalProperties.data.UserWithExperience;
		eventRaiser.eventData.SAProcess = options ? options.saRegistration : 0;
		eventRaiser.raiseEvent();
	};

	self["registration-error"] = function (options) {
		eventRaiser.eventData.event = "registration-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["login-error"] = function (options) {
		eventRaiser.eventData.event = "login-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["request-new-password-error"] = function (options) {
		eventRaiser.eventData.event = "request-new-password-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["forgot-password-error"] = function (options) {
		eventRaiser.eventData.event = "forgot-password-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["registration-success"] = function (options) {
		eventRaiser.eventData.event = "registration-success";
		eventRaiser.eventData.SAProcess = options.saRegistration;
		eventRaiser.eventData.AccountNumber = options.accountNumber;
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["login-view"] = function (eventData) {
		if (eventData) {
			Object.assign(eventRaiser.eventData, eventData);
		}
		eventRaiser.eventData.event = "login-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["login-interaction"] = function () {
		eventRaiser.eventData.event = "login-interaction";
		eventRaiser.raiseEvent();
	};

	self["login-submit"] = function (options) {
		eventRaiser.eventData.event = "login-submit";
		eventRaiser.eventData.IsAutologin = options.isAutologin;
		eventRaiser.eventData.Type = options.type;
		eventRaiser.raiseEvent();
	};

	self["request-new-password-view"] = function () {
		eventRaiser.eventData.event = "request-new-password-view";
		eventRaiser.raiseEvent();
	};

	self["request-new-password-interaction"] = function () {
		eventRaiser.eventData.event = "request-new-password-interaction";
		eventRaiser.raiseEvent();
	};

	self["request-new-password-submit"] = function () {
		eventRaiser.eventData.event = "request-new-password-submit";
		eventRaiser.raiseEvent();
	};

	self["request-new-password-success"] = function () {
		eventRaiser.eventData.event = "request-new-password-success";
		eventRaiser.raiseEvent();
	};

	self["forgot-password-view"] = function () {
		eventRaiser.eventData.event = "forgot-password-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["forgot-password-interaction"] = function () {
		eventRaiser.eventData.event = "forgot-password-interaction";
		eventRaiser.raiseEvent();
	};

	self["forgot-password-submit"] = function () {
		eventRaiser.eventData.event = "forgot-password-submit";
		eventRaiser.raiseEvent();
	};

	self["change-language"] = function () {
		eventRaiser.eventData.event = "change-language";
		eventRaiser.eventData.Language = CookieHandler.ReadCookie("Language");
		eventRaiser.raiseEvent();
	};

	return self;
}
