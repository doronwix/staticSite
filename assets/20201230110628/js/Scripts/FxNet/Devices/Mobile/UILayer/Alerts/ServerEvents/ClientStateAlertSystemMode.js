define("devicealerts/serverevents/ClientStateAlertSystemMode", [
	"require",
	"devicealerts/Alert",
	"Dictionary",
	"enums/loginlogoutreasonenum",
], function (require) {
	var AlertBase = require("devicealerts/Alert");
	var Dictionary = require("Dictionary");
	var eLoginLogoutReason = require("enums/loginlogoutreasonenum");

	var ClientStateAlertSystemMode = function () {
		var inheritedAlertInstance = new AlertBase();

		var init = function () {
			inheritedAlertInstance.alertName = "devicealerts/serverevents/ClientStateAlertSystemMode";
			inheritedAlertInstance.visible(false);
			inheritedAlertInstance.body(Dictionary.GetItem("maintenanceAlertContent"));
			createButtons();
		};
		var createButtons = function () {
			inheritedAlertInstance.buttons.removeAll();
			inheritedAlertInstance.buttons.push(
				new inheritedAlertInstance.buttonProperties(
					"Ok",
					function () {
						inheritedAlertInstance.visible(false);
						dalCommon.Logout(eLoginLogoutReason.clientStateError);
					},
					"btnCancel"
				)
			);
		};

		return {
			Init: init,
			GetAlert: inheritedAlertInstance,
		};
	};

	return ClientStateAlertSystemMode;
});
