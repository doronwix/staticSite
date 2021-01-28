define("devicealerts/DoubleLoginAlert", [
	"require",
	"devicemanagers/AlertsManager",
	"initdatamanagers/Customer",
	"dataaccess/dalCommon",
	"enums/loginlogoutreasonenum",
], function (require) {
	var dalCommon = require("dataaccess/dalCommon"),
		eLoginLogoutReason = require("enums/loginlogoutreasonenum"),
		customer = require("initdatamanagers/Customer");

	var DoubleLoginAlert = (function DoubleLoginAlertClass() {
		var logoutTimer;

		function show() {
			var AlertsManager = require("devicemanagers/AlertsManager");

			if (!customer.isAutologin()) {
				logoutTimer = setTimeout(function () {
					dalCommon.Logout(eLoginLogoutReason.mobile_doubleLogin1);
				}, 180000);
			}

			AlertsManager.UpdateAlert(AlertTypes.DoubleLoginAlert);
			AlertsManager.PopAlert(AlertTypes.DoubleLoginAlert);
		}

		return {
			Show: show,
			LogoutTimer: logoutTimer,
		};
	})();

	return DoubleLoginAlert;
});
