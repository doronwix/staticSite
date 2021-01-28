define("devicealerts/DoubleLoginAlertWrapper", [
	"require",
	"devicealerts/Alert",
	"initdatamanagers/Customer",
	"dataaccess/dalCommon",
	"Dictionary",
	"handlers/general",
	"devicealerts/DoubleLoginAlert",
	"enums/loginlogoutreasonenum",
], function DoubleLoginAlertWrapperDef(require) {
	var AlertBase = require("devicealerts/Alert"),
		dalCommon = require("dataaccess/dalCommon"),
		customer = require("initdatamanagers/Customer"),
		dictionary = require("Dictionary"),
		general = require("handlers/general"),
		eLoginLogoutReason = require("enums/loginlogoutreasonenum"),
		doubleLoginAlert = require("devicealerts/DoubleLoginAlert");

	var DoubleLoginAlertWrapper = function DoubleLoginAlertWrapperClass() {
		var inheritedAlertInstance = new AlertBase();
		var exitInProcess = false;
		var alertBody = customer.isAutologin()
			? dictionary.GetItem("loginDoubleLogin") + " " + dictionary.GetItem("loginDoubleLogin_Qus2")
			: dictionary.GetItem("loginDoubleLogin");

		function init() {
			inheritedAlertInstance.alertName = "DoubleLoginAlert";
			inheritedAlertInstance.visible(false);
			inheritedAlertInstance.body(alertBody);
			createButtons();
		}

		function createButtons() {
			inheritedAlertInstance.buttons.removeAll();
			inheritedAlertInstance.hide = exit;

			if (customer.isAutologin()) {
				inheritedAlertInstance.buttons.push(
					new inheritedAlertInstance.buttonProperties(
						dictionary.GetItem("doubleLoginReconnect"),
						goToLogin,
						"Login"
					)
				);

				inheritedAlertInstance.buttons.push(
					new inheritedAlertInstance.buttonProperties(dictionary.GetItem("exit"), exit, "Exit")
				);
			} else {
				inheritedAlertInstance.buttons.push(
					new inheritedAlertInstance.buttonProperties(
						dictionary.GetItem("doubleLoginReconnect"),
						exit,
						"Exit"
					)
				);
			}
		}

		function goToLogin() {
			clearTimer();
			window.location = "Account/Login/" + "?reason=" + eLoginLogoutReason.mobile_doubleLogin2;
		}

		function exit() {
			if (exitInProcess) {
				return;
			}

			exitInProcess = true;
			clearTimer();

			dalCommon.Exit(eLoginLogoutReason.mobile_doubleLogin3);
		}

		function clearTimer() {
			if (general.isDefinedType(doubleLoginAlert.LogoutTimer)) {
				clearTimeout(doubleLoginAlert.LogoutTimer);
			}
		}

		return {
			Init: init,
			GetAlert: inheritedAlertInstance,
		};
	};

	return DoubleLoginAlertWrapper;
});
