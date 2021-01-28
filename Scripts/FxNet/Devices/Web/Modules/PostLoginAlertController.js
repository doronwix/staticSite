define("devicecustommodules/PostLoginAlertController", [
	"require",
	"knockout",
	"customEnums/ViewsEnums",
	"dataaccess/dalCommon",
	"enums/alertenums",
	"devicemanagers/AlertsManager",
	"devicemanagers/StatesManager",
	"initdatamanagers/Customer",
	"managers/viewsmanager",
	"Dictionary",
	"modules/environmentData",
	"viewmodels/dialogs/DialogViewModel",
	"StateObject!PostLoginAlerts",
],
    function PostLoginAlertControllerDef(require) {
	var ko = require("knockout"),
		dalCommon = require("dataaccess/dalCommon"),
		AlertsManager = require("devicemanagers/AlertsManager"),
		StatesManager = require("devicemanagers/StatesManager"),
		Customer = require("initdatamanagers/Customer"),
		ViewsManager = require("managers/viewsmanager"),
		Dictionary = require("Dictionary"),
		environmentData = require("modules/environmentData").get(),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel"),
		postLoginAlerts = require("StateObject!PostLoginAlerts");

        var PostLoginAlertController = function PostLoginAlertControllerClass() {
		var observablePostLoginAlertObject = {},
			self,
			silentMode = ko.observable(0),
			subscriptions = [];

		var silentModeEnum = {
			Off: 0,
			On: 1,
		};

		function init() {
			self = this;

			setComputedDisplayAlerts();

			subscribToCSFlags();
			subscribeToPortfolioFlags();
			subscribeToServerErrors();

			subscriptions.push(
				postLoginAlerts.subscribe("SetAlertsBehaviorMode", function (mode) {
                        silentMode(mode);
				})
			);
		}

		function alertNotDisplayedThisSession(alert) {
			alert.popCounter(alert.popCounter() + 1);

			if (alert.popCounter() < 2) {
				return true;
			}

			return false;
		}

		//---------------Client State Flags---------------
		function subscribToCSFlags() {
			StatesManager.States.ExposureCoverageAlert.subscribe(function (flagValue) {
				if (flagValue == eCSFlagStates.Active) {
					AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);

					var alert = AlertsManager.GetAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);

					if (alertNotDisplayedThisSession(alert)) {
						AlertsManager.PopAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
					}
				}
			});

			StatesManager.States.SystemMode.subscribe(function (flagValue) {
				if (Customer.prop.isQA) {
					return;
				}

				switch (flagValue) {
					case 2:
						AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.SystemModeApplicationClosing);
						AlertsManager.PopAlert(PostClientStatesLoginsAlerts.SystemModeApplicationClosing);
						break;

					case 3:
						AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.SystemMode);
						AlertsManager.PopAlert(PostClientStatesLoginsAlerts.SystemMode);
						break;

					case 4:
						AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.SystemModeApplicationShutDown);
						AlertsManager.PopAlert(PostClientStatesLoginsAlerts.SystemModeApplicationShutDown);
						break;

					default:
						break;
				}
			});
		}

		//----------------Portfolio Flags-----------
		function subscribeToPortfolioFlags() {
			StatesManager.States.IsDemo.subscribe(function (flagValue) {
				if (environmentData.switchToPlatform === ePlatformSwitch.Demo && flagValue === true) {
					AlertsManager.UpdateAlert(PostPortfoliosLoginsAlerts.IsDemo);
					AlertsManager.PopAlert(PostPortfoliosLoginsAlerts.IsDemo);
				}
			});

			StatesManager.States.IsActive.subscribe(function () {
				if (environmentData.switchToPlatform === ePlatformSwitch.Real && Customer.prop.hasActiveDemo) {
					AlertsManager.UpdateAlert(PostPortfoliosLoginsAlerts.IsReal);
					AlertsManager.PopAlert(PostPortfoliosLoginsAlerts.IsReal);
				}
			});

			observablePostLoginAlertObject.displayAmlAlert.subscribe(function (flagValue) {
				if (flagValue === true) {
					var option = {
						title: Dictionary.GetItem("AMLStatus", "dialogsTitles", " "),
						closeOnEscape: false,
						width: 620,
						dialogClass: "fx-dialog amlPopup",
					};

					DialogViewModel.openAsync(
						eAppEvents.amlStatusLoadedEvent,
						eDialog.AmlStatus,
						option,
						eViewTypes.vAmlStatus,
						null
					);
				}
			});

			observablePostLoginAlertObject.displayCddKycAlert.subscribe(function (flagValue) {
				if (flagValue === true) {
					// redirect to cdd alert will be visible only if the aml has no status
					ViewsManager.SwitchViewVisible(eForms.ClientQuestionnaire);
				}
			});
		}

		function subscribeToServerErrors() {
			StatesManager.States.Forbidden.subscribe(function () {
				if (!Customer.isAuthenticated()) {
					return;
				}

				AlertsManager.UpdateAlert(
					AlertTypes.ServerResponseAlert,
					Dictionary.GetItem("GenericAlert", "dialogsTitles", " "),
					Dictionary.GetItem("Forbidden"),
					null
				);
				AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
			});

			StatesManager.States.ServerErrorStatus.subscribe(function (flagValue) {
				if (flagValue != eErrorSeverity.critical && !Customer.isAuthenticated()) {
					return;
				}

				switch (flagValue) {
					case eErrorSeverity.critical:
						dalCommon.Logout(eLoginLogoutReason.web_postLoginAlertController_serverError);
						break;

					case eErrorSeverity.high:
						AlertsManager.UpdateAlert(
							AlertTypes.SessionEndedAlert,
							Dictionary.GetItem("sessionEndedLogoutAlertTitle"),
							Dictionary.GetItem("sessionEndedLogout"),
							null,
							{
								onCloseAction: function () {
									dalCommon.Logout(eLoginLogoutReason.alert_exitApp);
								},
							}
						);
						AlertsManager.PopAlert(AlertTypes.SessionEndedAlert);
						break;

					case eErrorSeverity.medium:
						AlertsManager.UpdateAlert(
							AlertTypes.SessionEndedAlert,
							Dictionary.GetItem("sessionEndedAlertTitle"),
							Dictionary.GetItem("sessionEnded"),
							null
						);
						AlertsManager.PopAlert(AlertTypes.SessionEndedAlert);
						break;

					default:
						break;
				}
			});
		}

		function setComputedDisplayAlerts() {
			observablePostLoginAlertObject.displayCddKycAlert = ko.computed(function () {
				return StatesManager.States.shouldCddRedirect() && silentMode() === silentModeEnum.Off;
			}, self);

			observablePostLoginAlertObject.displayAmlAlert = ko.computed(function () {
				if (
					StatesManager.States.IsAmlRestricted() == true &&
					StatesManager.States.IsCddStatusNotComplete() == false &&
					StatesManager.States.IsActiveButNotSinceTradingBonus() == true &&
					silentMode() == silentModeEnum.Off
				) {
					return true;
				}

				return false;
			}, self);
		}

		function dispose() {
			subscriptions.forEach(function (subscriber) {
				subscriber();
			});
		}

		return {
			Init: init,
			SubscribToCSFlags: subscribToCSFlags,
			SubscribeToPortfolioFlags: subscribeToPortfolioFlags,
			SubscribeToServerErrors: subscribeToServerErrors,
			dispose: dispose,
		};
	};

	return new PostLoginAlertController();
});
