define("devicealerts/Alert", [
	"require",
	"knockout",
	"handlers/general",
	"Dictionary",
	"initdatamanagers/Customer",
	"handlers/Delegate",
	"cachemanagers/PortfolioStaticManager",
	"enums/loginlogoutreasonenum",
], function AlertBaseDef(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		Dictionary = require("Dictionary"),
		customer = require("initdatamanagers/Customer"),
		delegate = require("handlers/Delegate"),
		eLoginLogoutReason = require("enums/loginlogoutreasonenum"),
		portfolioManager = require("cachemanagers/PortfolioStaticManager");
	var AlertBase = function AlertBaseClass() {
		var visible = ko.observable(false),
			title = ko.observable(""),
			body = ko.observable(""),
			messages = ko.observableArray([]),
			disableThisAlertByCookie = ko.observable(false),
			caller = ko.observable(""),
			buttons = ko.observableArray([]),
			links = ko.observableArray([]),
			theme = ko.observable(),
			onCloseAction = new delegate();

		var injectDepositButtons = function () {
			var thisAlert = this;
			thisAlert.buttons.removeAll();
			thisAlert.links.removeAll();

			if (!customer.prop.isDemo) {
				if (portfolioManager.Portfolio.pendingWithdrawals.sign() > 0) {
					thisAlert.buttons.push(
						new thisAlert.buttonProperties(
							Dictionary.GetItem("ViewCancel"),
							function () {
								thisAlert.visible(false);

								require(["devicemanagers/ViewModelsManager"], function (viewModelsManager) {
									viewModelsManager.VManager.SwitchViewVisible(eForms.PendingWithdrawal);
								});
							},
							"Pending"
						)
					);
				}

				thisAlert.buttons.push(
					new thisAlert.buttonProperties(
						Dictionary.GetItem("DepositeNow"),
						function () {
							require(["devicemanagers/ViewModelsManager"], function (viewModelsManager) {
								ko.postbox.publish("action-source", "InsufficientAvailableMarginPopUp");
								if (Browser.isChromeOnIOS()) {
									viewModelsManager.VManager.RedirectToForm(eForms.Deposit);
									thisAlert.visible(false);
								} else {
									thisAlert.visible(false);
									viewModelsManager.VManager.RedirectToForm(eForms.Deposit);
								}
							});
						},
						"Deposite"
					)
				);
			}

			thisAlert.links.push(
				new thisAlert.linkProperties(
					Dictionary.GetItem("NotNow"),
					function () {
						// patch for:
						if (Browser.isChromeOnIOS()) {
							require(["devicemanagers/ViewModelsManager"], function (viewModelsManager) {
								viewModelsManager.VManager.SwitchViewVisible(customer.prop.mainPage, {});
							});
						}

						thisAlert.visible(false);
					},
					"NotNow"
				)
			);
		};

		var addRedirectButton = function (text, css) {
			var thisAlert = this;
			thisAlert.buttons.push(
				new thisAlert.buttonProperties(
					text,
					function () {
						var properties = thisAlert.properties,
							redirectToViewType,
							viewArgs;

						if (!general.isEmptyValue(properties.redirectToView)) {
							redirectToViewType = properties.redirectToView;
						}

						if (!general.isEmptyValue(properties.redirectToViewArgs)) {
							viewArgs = properties.redirectToViewArgs;
						} else {
							viewArgs = "";
						}

						thisAlert.visible(false);

						if (properties.enableButton) {
							properties.enableButton(true);
						}

						if (!general.isEmptyValue(redirectToViewType)) {
							if (redirectToViewType === "exit") {
								dalCommon.Logout(eLoginLogoutReason.alert_exitApp);
							} else {
								require(["devicemanagers/ViewModelsManager"], function (viewModelsManager) {
									viewModelsManager.VManager.SwitchViewVisible(redirectToViewType, viewArgs);
								});
							}
						}
					},
					css
				)
			);
		};

		// callback function
		var closeMe = function (obj) {
			obj = obj || this;
			obj.visible(false);

			onCloseAction.Invoke();
		};

		return {
			alertName: "devicealerts/Alert",
			theme: theme,
			visible: visible,
			caller: caller,
			title: title,
			icon: "",
			body: body,
			messages: messages,
			properties: {},
			DisableThisAlertByCookie: disableThisAlertByCookie,
			NeedToCreateCookie: true,
			cookieName: "",
			buttons: buttons,
			buttonProperties: function (text, click, cssClass, idprop) {
				return {
					text: text,
					onclick: click,
					css_Class: cssClass,
					idprop: idprop,
				};
			},
			links: links,
			linkProperties: function (text, click, cssClass) {
				return {
					text: text,
					onclick: click,
					css_Class: cssClass,
				};
			},
			injectDepositButtons: injectDepositButtons,
			addRedirectButton: addRedirectButton,
			prepareForShow: function () {},
			// virtual override-able
			hide: function () {
				if (visible()) {
					visible(false);
				}
			},
			show: function () {
				this.theme(this.properties.theme);

				if (this.prepareForShow) {
					this.prepareForShow();
				}
				this.visible(true);
			},
			onCloseAction: onCloseAction,
			onClose: closeMe,
		};
	};
	return AlertBase;
});
