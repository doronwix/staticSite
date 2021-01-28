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
	"StateObject!PostLoginAlerts",
	"enums/loginlogoutreasonenum",
  ],
    function PostLoginAlertControllerDef(require) {
	var ko = require("knockout"),
		dalCommon = require("dataaccess/dalCommon"),
		AlertTypes = require("enums/alertenums"),
		AlertsManager = require("devicemanagers/AlertsManager"),
		StatesManager = require("devicemanagers/StatesManager"),
		Customer = require("initdatamanagers/Customer"),
		ViewsManager = require("managers/viewsmanager"),
		Dictionary = require("Dictionary"),
		environmentData = require("modules/environmentData").get(),
		postLoginAlerts = require("StateObject!PostLoginAlerts"),
		eLoginLogoutReason = require("enums/loginlogoutreasonenum"),
		subscriptions = [];

	function PostLoginAlertController() {
		var observablePostLoginAlertObject = {},
			self,
			silentMode = ko.observable(0);

		var flagState = {
			Initial: -1,
			NotActive: 0,
			Active: 1,
		};

		var silentModeEnum = {
			Off: 0,
			On: 1,
		};

		function init() {
			self = this;

			setComputedDisplayAlerts();

			subscribeToCSFlags();
			subscribeToPortfolioFlags();
			subscribeToServerErrors();

			subscriptions.push(
				postLoginAlerts.subscribe("SetAlertsBehaviorMode", function (mode) {
					silentMode(mode);
				})
			);
		}

		//---------------Client State Flags---------------
		function subscribeToCSFlags() {
			StatesManager.States.ExposureAlert.subscribe(function (flagValue) {
				if (flagValue == eCSFlagStates.Active) {
					var alert = AlertsManager.GetAlert(PostClientStatesLoginsAlerts.ExposureAlert);

					AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.ExposureAlert);
					alert.popCounter(alert.popCounter() + 1);

					if (alert.popCounter() < 2) {
						AlertsManager.PopAlert(PostClientStatesLoginsAlerts.ExposureAlert);
					}
				}
			});

			StatesManager.States.ExposureCoverageAlert.subscribe(function (flagValue) {
				if (flagValue == eCSFlagStates.Active) {
					var alert = AlertsManager.GetAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);

					AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
					alert.popCounter(alert.popCounter() + 1);

					if (alert.popCounter() < 2) {
						AlertsManager.PopAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
					}
				}
			});

			StatesManager.States.MarketState.subscribe(function (flagValue) {
				if (flagValue == eCSFlagStates.NotActive) {
					AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.MarketState);
					AlertsManager.PopAlert(PostClientStatesLoginsAlerts.MarketState);
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

					default:
						break;
				}
			});
		}

		//----------------Portfolio Flags-----------
		function subscribeToPortfolioFlags() {
			StatesManager.States.IsDemo.subscribe(function (flagValue) {
				if (environmentData.switchToPlatform === ePlatformSwitch.Demo && flagValue == flagState.Active) {
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
					ViewsManager.SwitchViewVisible(eForms.Aml, {});
				}
			});

			observablePostLoginAlertObject.displayCddKycAlert.subscribe(function (flagValue) {
				if (flagValue === true) {
					// redirect to cdd alert will be visible only if the aml has no status
					ViewsManager.SwitchViewVisible(eForms.ClientQuestionnaire, {});
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
					Dictionary.GetItem("GenericAlert"),
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
						dalCommon.Logout(eLoginLogoutReason.mobile_postLoginAlertController_serverError);
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
				if (
					(StatesManager.States.IsCddStatusNotComplete() === true ||
						StatesManager.States.IsKycStatusRequired() === true ||
						StatesManager.States.IsKycReviewStatusRequired() === true) &&
					silentMode() === silentModeEnum.Off &&
					StatesManager.States.IsActiveButNotSinceTradingBonus() === true
				) {
					return true;
				}

				return false;
			}, self);

			observablePostLoginAlertObject.displayActiveAlert = ko.computed(function () {
				if (StatesManager.States.IsActive() == flagState.NotActive) {
					return true;
				}
				return false;
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
			dispose: dispose,
		};
	}

	return new PostLoginAlertController();
});
