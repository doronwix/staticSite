var TrackingCommonData = function () {
	return function (storage) {
		var _sessionStorage = storage;

		function getCountryNameByIp() {
			if (typeof systemInfo !== "undefined") return systemInfo.countryNameByIP;
			if (window.Model !== "undefined") return window.Model.CountryNameByIP;

			return "";
		}

		function getBrowserPropertyValue() {
			if (window.CookieHandler) {
				if (
					window.CookieHandler.ReadCookie("NativeIosApp") !== null &&
					window.CookieHandler.ReadCookie("NativeIosApp") === "true"
				) {
					return "App iPhone";
				}

				if (
					window.CookieHandler.ReadCookie("NativeAndroidApp") != null &&
					window.CookieHandler.ReadCookie("NativeAndroidApp") === "true"
				) {
					return "App Android";
				}
			}

			return Browser.getBrowserName();
		}

		function getDevice() {
			return window.environmentData && window.environmentData.isDesktop
				? "Desktop"
				: CookieHandler.ReadCookie("ViewMode");
		}

		function renewTrackingSessionId() {
			var newTrackingSessionId = Math.random();
			_sessionStorage.setItem("TrackingSessionId", newTrackingSessionId.toString());
		}

		function getTrackingSessionId() {
			if (_sessionStorage.getItem("TrackingSessionId") == null) {
				renewTrackingSessionId();
			}

			return _sessionStorage.getItem("TrackingSessionId");
		}

		return {
			IPCountry: getCountryNameByIp(),
			ResolutionScreen: Browser.getScreenResolution(),
			OS: Browser.getOperatingSystemName(),
			OSVersion: Browser.getOperatingSystemNameAndVersion(),
			Browser: getBrowserPropertyValue(),
			BrowserVersion: Browser.getBrowserVersion(),
			Device: getDevice(),
			TrackingSessionId: getTrackingSessionId(),
			Language: CookieHandler.ReadCookie("Language"),
		};
	};
};

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals
		root = factory();
	}
})(typeof self !== "undefined" ? self : this, function () {
	// Use b in some fashion.

	// Just return a value to define the module export.
	// This example returns an object, but the module
	// can return a function as the exported value.
	return TrackingCommonData();
});
