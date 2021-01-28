define("configuration/PaymentsConfiguration", [
	"require",
	"knockout",
	"enums/paymentsconfigsettings",
	"configuration/initconfiguration",
	"managers/PopupInNewWindowManager",
	"managers/PopupInAlertManager",
], function (require) {
	var ko = require("knockout"),
		initConfiguration = require("configuration/initconfiguration"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings"),
		popupInNewWindowManager = require("managers/PopupInNewWindowManager"),
		popupInAlertManager = require("managers/PopupInAlertManager");

	function setupConfiguration() {
		var paymentsConfiguration = {
			prepare3rdPartyView: popupInNewWindowManager,
			formToDisplayForSuccessfulPayments: eForms.DepositSuccess,
			formToDisplayForPendingPayments: eForms.DepositPending,
			supportLastPaymentCategory: false,
			redirectToLastPaymentOnLoad: true,
			viewTypeForExistingCC: "genericcreditcard",
			getClaimsTimeoutInMiliseconds: 30000,
			missingPaymentsRedirect: eForms.Quotes,
		};

		var popupInNewWindowConfiguration = {
			prepare3rdPartyView: popupInNewWindowManager,
			formToDisplayForSuccessfulPayments: eForms.DepositSuccess,
			formToDisplayForPendingPayments: eForms.DepositPending,
		};

		var risingSunAPMConfiguration = Object.assign({}, paymentsConfiguration, {
			prepare3rdPartyView: popupInAlertManager,
		});

		var safeChargeCashierPaymentConfiguration = {
			prepare3rdPartyView: popupInNewWindowManager,
			formToDisplayForSuccessfulPayments: eForms.DepositSuccess,
			formToDisplayForPendingPayments: eForms.DepositPending,
			currencySortPropertyName: "name",
		};

		var wireTransferConfiguration = {
			formToDisplayForSuccessfulPayments: eForms.WireTransferSuccess,
			formToDisplayForPendingPayments: eForms.Deals,
			formToDisplayForFailedPayments: eForms.RegularWireTransfer,
		};

		//payments
		initConfiguration.PaymentsConfiguration = paymentsConfiguration;
		initConfiguration.PaymentInNewWindowConfiguration = popupInNewWindowConfiguration;
		initConfiguration.PaymentWithCCConfiguration = paymentsConfiguration;
		initConfiguration.SafeChargeCashierPaymentConfiguration = safeChargeCashierPaymentConfiguration;
		initConfiguration.AstropayConfiguration = popupInNewWindowConfiguration;
		initConfiguration.AstropayCardConfiguration = paymentsConfiguration;
		initConfiguration.RisingSunAPMConfiguration = risingSunAPMConfiguration;
		initConfiguration.WireTransferConfiguration = wireTransferConfiguration;
	}

	function buildDeps(requiredDeps) {
		var commonContentDeps = ["payments_general"],
			currentContentDeps = [];

		currentContentDeps = [].concatUnique(requiredDeps);
		currentContentDeps = currentContentDeps.concatUnique(commonContentDeps);

		return currentContentDeps;
	}

	function registerComponentsForConcretePayments() {
		if (!paymentsConfigSettings) {
			return;
		}

		paymentsConfigSettings.forEach(function registerComponent(payment) {
			if (!payment.ShowInMobile || payment.SkipComponentGeneration) {
				return;
			}

			var vmPath = "viewmodels/Payments/{0}ViewModel";
			var mobileVmPath = "deviceviewmodels/{0}ViewModel";

			if (payment.SubViews) {
				payment.SubViews.forEach(function registerSubComponent(subview) {
					var componentName = String.format(
							"fx-payment-{0}-{1}",
							subview.Name.toLowerCase(),
							subview.ViewId.toLowerCase()
						),
						componentDef = {
							viewModel: {
								require: String.format(
									subview.MobileName ? mobileVmPath : vmPath,
									subview.MobileName || subview.ViewModel || subview.Name
								),
							},
							template: {
								require: payment.Templates
									? "text!FxNet/Devices/Mobile/UILayer/Views/Deposit/PaymentTemplates.html"
									: String.format(
											"text!partial-views/mobile-payments-{0}.html",
											subview.ControllerAction
									  ),
							},
							deps: buildDeps(payment.Resources || []).map(function (contentKey) {
								return "LoadDictionaryContent!" + contentKey;
							}),
						};

					ko.components.register(componentName, componentDef);
				});

				return;
			}

			var componentName = String.format("fx-payment-{0}", payment.Name.toLowerCase()),
				componentDef = {
					viewModel: {
						require: String.format(
							payment.MobileName ? mobileVmPath : vmPath,
							payment.MobileName || payment.ViewModel || payment.Name
						),
					},
					template: {
						require: payment.Templates
							? "text!FxNet/Devices/Mobile/UILayer/Views/Deposit/PaymentTemplates.html"
							: String.format(
									"text!partial-views/mobile-payments-{0}.html",
									payment.ControllerAction || payment.Name.toLowerCase()
							  ),
					},
					deps: buildDeps(payment.Resources || []).map(function (contentKey) {
						return "LoadDictionaryContent!" + contentKey;
					}),
				};

			ko.components.register(componentName, componentDef);
		});
	}

	function registerComponentsForNotes() {
		ko.components.register("fx-componet-creditcard-regular-note", {
			template: { require: "text!mobileHtml/statichtml/creditcard/creditcard-regular-note.html" },
			deps: ["LoadDictionaryContent!views_vMobilePaymentTypes"],
		});

		ko.components.register("fx-componet-ecopayz-note", {
			template: { require: "text!mobileHtml/statichtml/creditcard/ecopayz-note.html" },
			deps: ["LoadDictionaryContent!payment_ewallet"],
		});

		ko.components.register("fx-deposit-notice", {
			viewModel: { require: "viewmodels/Payments/NoticeViewModel" },
			template: { require: "text!partial-views/mobile-payments-deposit-notice.html" },
		});
	}

	function registerComponentsForListOfPayments() {
		ko.components.register("fx-component-payment-types", {
			template: { require: "text!mobileHtml/statichtml/Deposit/PaymentTypes.html" },
		});

		ko.components.register("fx-concrete-payments", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentsViewModel" },
			template: { require: "text!mobileHtml/statichtml/Deposit/Payments.html" },
			deps: [
				"LoadDictionaryContent!payments_concreteView",
				"LoadDictionaryContent!FAQDEPOSIT",
				"LoadDictionaryContent!payments_concreteNames",
			],
		});

		ko.components.register("fx-concrete-payments-form", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentFormViewModel" },
			template: { require: "text!mobileHtml/statichtml/Deposit/PaymentsForm.html" },
			deps: [
				"LoadDictionaryContent!payments_concreteView",
				"LoadDictionaryContent!FAQDEPOSIT",
				"LoadDictionaryContent!payments_concreteNames",
			],
		});

		ko.components.register("fx-component-deposit-success-thankyou", {
			viewModel: { require: "viewmodels/deposit/ThankYouViewModel" },
			template: { require: "text!mobileHtml/statichtml/Deposit/thankyou-success.html" },
			deps: [
				"LoadDictionaryContent!FAQDEPOSITTHANKYOU",
				"LoadDictionaryContent!deposit_thankyou",
				"LoadDictionaryContent!deposit_thankyou_success",
			],
		});

		ko.components.register("fx-component-deposit-pending-thankyou", {
			viewModel: { require: "viewmodels/deposit/ThankYouViewModel" },
			template: { require: "text!mobileHtml/statichtml/Deposit/thankyou-pending.html" },
			deps: [
				"LoadDictionaryContent!FAQDEPOSITTHANKYOU",
				"LoadDictionaryContent!deposit_thankyou",
				"LoadDictionaryContent!deposit_thankyou_pending",
			],
		});

		ko.components.register("fx-concrete-payment-subtitle", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentSubtitleViewModel" },
			template: { require: "text!partial-views/mobile-payments-deposit-subtitle.html" },
		});
	}

	function registerComponentsForAlerts() {
		ko.components.register("fx-component-questionnaire-alert", {
			viewModel: { require: "deviceviewmodels/QuestionnaireAlertViewModel" },
			template: { require: "text!mobileHtml/statichtml/deposit-questionnaire-alert.html" },
		});
	}

	function registerDepositComponents() {
		setupConfiguration();

		registerComponentsForConcretePayments();
		registerComponentsForNotes();
		registerComponentsForListOfPayments();
		registerComponentsForAlerts();
	}

	return {
		RegisterDepositComponents: registerDepositComponents,
	};
});
