define("devicealerts/ExitAlert", [
	"require",
	"devicealerts/Alert",
	"dataaccess/dalCommon",
	"Dictionary",
	"enums/loginlogoutreasonenum",
], function ExitAlertDef(require) {
	var AlertBase = require("devicealerts/Alert"),
		dalCommon = require("dataaccess/dalCommon"),
		eLoginLogoutReason = require("enums/loginlogoutreasonenum"),
		Dictionary = require("Dictionary");

 var ExitAlert = function ExitAlertClass() {
		var inheritedAlertInstance = new AlertBase();

		var init = function () {
			inheritedAlertInstance.alertName = "ExitAlert";
			inheritedAlertInstance.visible(false);
			inheritedAlertInstance.body(Dictionary.GetItem("areyousurelogout"));

			createButtons();
		};

		var createButtons = function () {
			inheritedAlertInstance.buttons.removeAll();

			inheritedAlertInstance.buttons.push(
				new inheritedAlertInstance.buttonProperties(
					Dictionary.GetItem("ok"),
					function () {
						dalCommon.Logout(eLoginLogoutReason.mobile_exitAlert);
					},
					"Ok"
				),
				new inheritedAlertInstance.buttonProperties(
					Dictionary.GetItem("cancel"),
					function () {
						inheritedAlertInstance.hide();
					},
					"Cancel"
				)
			);
		};

		return {
			Init: init,
			GetAlert: inheritedAlertInstance,
		};
	};
	return ExitAlert;
});
