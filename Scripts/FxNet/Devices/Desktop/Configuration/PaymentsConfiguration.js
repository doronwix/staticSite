define("configuration/PaymentsConfiguration", [
	"require",
	"knockout",
	"enums/paymentsconfigsettings",
	"configuration/initconfiguration",
	"managers/PopupInNewWindowManager",
], function (require) {
	var ko = require("knockout"),
		initConfiguration = require("configuration/initconfiguration"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings"),
		PopupInNewWindowManager = require("managers/PopupInNewWindowManager");

	var paymentsConfiguration = {
		prepare3rdPartyView: PopupInNewWindowManager,
		isSmartClientVersion: true,
		formToDisplayForSuccessfulPayments: "exit",
		getClaimsTimeoutInMiliseconds: 30000,
		missingPaymentsRedirect: eForms.Deals,
	};

	var forcedDepositConfiguration = {
		isSmartClientVersion: false,
		formToDisplayForSuccessfulPayments: eForms.ForcedDeposit,
	};

	var safeChargeCashierPaymentConfiguration = {
		prepare3rdPartyView: PopupInNewWindowManager,
		isSmartClientVersion: true,
		formToDisplayForSuccessfulPayments: "exit",
		currencySortPropertyName: "name",
	};

	initConfiguration.PaymentsConfiguration = paymentsConfiguration;
	initConfiguration.PaymentInNewWindowConfiguration = paymentsConfiguration;
	initConfiguration.PaymentWithCCConfiguration = paymentsConfiguration;
	initConfiguration.ForcedDepositConfiguration = forcedDepositConfiguration;
	initConfiguration.SafeChargeCashierPaymentConfiguration = safeChargeCashierPaymentConfiguration;
	initConfiguration.AstropayConfiguration = paymentsConfiguration;
	initConfiguration.AstropayCardConfiguration = paymentsConfiguration;

	function registerDynamicDepositComponents() {
		if (!paymentsConfigSettings) {
			return;
		}

		paymentsConfigSettings.forEach(function registerComponent(payment) {
			if (payment.SkipComponentGeneration) {
				return;
			}

			var vmPathTemplate = "viewmodels/Payments/{0}ViewModel",
				desktopVmPathTemplate = "deviceviewmodels/{0}ViewModel";

			if (payment.SubViews) {
				payment.SubViews.forEach(function registerSubComponent(subview) {
					var componentName = String.format(
							"fx-payment-{0}-{1}",
							subview.Name.toLowerCase(),
							subview.ViewId.toLowerCase()
						),
						vmName = subview.DesktopName || subview.ViewModel || subview.Name,
						componentDef = {
							viewModel: {
								require: subview.DesktopName
									? String.format(desktopVmPathTemplate, vmName)
									: String.format(vmPathTemplate, vmName),
							},
							template: {
								require: String.format(
									"text!partial-views/web-payments-{0}.html",
									subview.ControllerAction
								),
							},
						};

					ko.components.register(componentName, componentDef);
				});

				return;
			}

			var componentName = String.format("fx-payment-{0}", payment.Name.toLowerCase()),
				vmName = payment.DesktopName || payment.ViewModel || payment.Name,
				componentDef = {
					viewModel: {
						require: payment.DesktopName
							? String.format(desktopVmPathTemplate, vmName)
							: String.format(vmPathTemplate, vmName),
					},
					template: {
						require: String.format(
							"text!partial-views/web-payments-{0}.html",
							payment.ControllerAction || payment.Name.toLowerCase()
						),
					},
				};

			ko.components.register(componentName, componentDef);
		});
	}

	function registerDepositComponents() {
		registerDynamicDepositComponents();

		ko.components.register("fx-deposit-notice", {
			viewModel: { require: "viewmodels/Payments/NoticeViewModel" },
			template: { require: "text!partial-views/web-payments-deposit-notice.html" },
		});

		ko.components.register("fx-concrete-payments", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentsViewModel" },
			template: { require: "text!partial-views/web-payments-deposit-payments.html" },
		});

		ko.components.register("fx-concrete-payment-subtitle", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentSubtitleViewModel" },
			template: { require: "text!partial-views/web-payments-deposit-subtitle.html" },
		});
	}

	return {
		RegisterDepositComponents: registerDepositComponents,
	};
});
