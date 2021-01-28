define("configuration/PaymentsConfiguration", [
	"require",
	"knockout",
	"configuration/initconfiguration",
	"enums/paymentsconfigsettings",
	"devicemanagers/ViewModelsManager",
	"managers/PopupInNewWindowManager",
], function (require) {
	var ko = require("knockout"),
		initConfiguration = require("configuration/initconfiguration"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings"),
		PopupInNewWindowManager = require("managers/PopupInNewWindowManager"),
		ViewModelsManager = require("devicemanagers/ViewModelsManager");

	function setupConfiguration() {
		var paymentsConfiguration = {
			prepare3rdPartyView: PopupInNewWindowManager,
			formToDisplayForSuccessfulPayments: eForms.DepositSuccess,
			formToDisplayForPendingPayments: eForms.DepositPending,
			supportLastPaymentCategory: false,
			viewTypeForExistingCC: "genericcreditcard",
			showAllowedCreditCards: false,
			getClaimsTimeoutInMiliseconds: 30000,
			missingPaymentsRedirect: eForms.Deals,
		};

		var safeChargeCashierPaymentConfiguration = {
			prepare3rdPartyView: PopupInNewWindowManager,
			formToDisplayForSuccessfulPayments: eForms.DepositSuccess,
			formToDisplayForPendingPayments: eForms.DepositPending,
			currencySortPropertyName: "name",
		};

		var wireTransferConfiguration = {
			formToDisplayForSuccessfulPayments: eForms.WireTransferSuccess,
			formToDisplayForPendingPayments: eForms.Deals,
			formToDisplayForFailedPayments: eForms.RegularWireTransfer,
		};

		// payments
		initConfiguration.PaymentsConfiguration = paymentsConfiguration;
		initConfiguration.PaymentInNewWindowConfiguration = paymentsConfiguration;
		initConfiguration.PaymentWithCCConfiguration = paymentsConfiguration;
		initConfiguration.SafeChargeCashierPaymentConfiguration = safeChargeCashierPaymentConfiguration;
		initConfiguration.AstropayConfiguration = paymentsConfiguration;
		initConfiguration.AstropayCardConfiguration = paymentsConfiguration;
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
			if (payment.SkipComponentGeneration) {
				return;
			}

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
									"viewmodels/Payments/{0}ViewModel",
									subview.ViewModel || subview.Name
								),
							},
							template: {
								require: payment.Templates
									? "text!FxNet/Devices/Web/UILayer/Views/Deposit/PaymentTemplates.html"
									: String.format(
											"text!partial-views/web-payments-{0}.html",
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
						require: String.format("viewmodels/Payments/{0}ViewModel", payment.ViewModel || payment.Name),
					},
					template: {
						require: payment.Templates
							? "text!FxNet/Devices/Web/UILayer/Views/Deposit/PaymentTemplates.html"
							: String.format(
									"text!partial-views/web-payments-{0}.html",
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
			template: { require: "text!webHtml/statichtml/creditcard/creditcard-regular-note.html" },
			deps: [
				"LoadDictionaryContent!payments_creditcardregular",
				"LoadDictionaryContent!payments_genericcreditcard",
			],
		});

		ko.components.register("fx-componet-wiretransfer-regular-note", {
			template: { require: "text!webHtml/statichtml/creditcard/wiretransfer-regular-note.html" },
			deps: ["LoadDictionaryContent!payments_regularWireTransfer"],
		});

		ko.components.register("fx-componet-ecopayz-note", {
			template: { require: "text!webHtml/statichtml/creditcard/ecopayz-note.html" },
			deps: ["LoadDictionaryContent!payments_regularWireTransfer", "LoadDictionaryContent!payments_general"],
		});

		ko.components.register("fx-deposit-notice", {
			viewModel: { require: "viewmodels/Payments/NoticeViewModel" },
			template: { require: "text!partial-views/web-payments-deposit-notice.html" },
		});
	}

	function registerComponentForListOfPayments() {
		ko.components.register("fx-concrete-payments", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentsViewModel" },
			template: { require: "text!webHtml/statichtml/Deposit/Payments.html" },
			deps: ["LoadDictionaryContent!payments_concreteView", "LoadDictionaryContent!payments_concreteNames"],
		});

		ko.components.register("fx-concrete-payments-form", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentFormViewModel" },
			template: { require: "text!webHtml/statichtml/Deposit/PaymentsForm.html" },
			deps: ["LoadDictionaryContent!payments_concreteView"],
		});

		ko.components.register("fx-component-payments-title", {
			viewModel: { instance: ViewModelsManager },
			template: { require: "text!webHtml/statichtml/Deposit/PaymentsTitle.html" },
			deps: ["LoadDictionaryContent!general_pagetitle"],
		});

		ko.components.register("fx-component-deposit-success-thankyou", {
			viewModel: { require: "viewmodels/deposit/ThankYouViewModel" },
			template: { require: "text!webHtml/statichtml/Deposit/thankyou-success.html" },
			deps: [
				"LoadDictionaryContent!FAQDEPOSITTHANKYOU",
				"LoadDictionaryContent!deposit_thankyou",
				"LoadDictionaryContent!deposit_thankyou_success",
			],
		});

		ko.components.register("fx-component-deposit-pending-thankyou", {
			viewModel: { require: "viewmodels/deposit/ThankYouViewModel" },
			template: { require: "text!webHtml/statichtml/Deposit/thankyou-pending.html" },
			deps: [
				"LoadDictionaryContent!FAQDEPOSITTHANKYOU",
				"LoadDictionaryContent!deposit_thankyou",
				"LoadDictionaryContent!deposit_thankyou_pending",
			],
		});

		ko.components.register("fx-component-wire-transfer-success", {
			viewModel: { require: "viewmodels/deposit/WireTransferSuccessViewModel" },
			template: { require: "text!webHtml/statichtml/Deposit/wire-transfer-success.html" },
			deps: ["LoadDictionaryContent!payments_regularWireTransferDeposit"],
		});

		ko.components.register("fx-concrete-payment-subtitle", {
			viewModel: { require: "viewmodels/Payments/ConcretePaymentSubtitleViewModel" },
			template: { require: "text!partial-views/web-payments-deposit-subtitle.html" },
		});

		ko.components.register("fx-component-deposit-container", {
			template: { element: "fx-template-deposit-container" },
		});
	}

	function registerComponentsForAlerts() {
		ko.components.register("fx-component-questionnaire-alert", {
			viewModel: { require: "deviceviewmodels/QuestionnaireAlertViewModel" },
			template: { require: "text!webHtml/statichtml/deposit-questionnaire-alert.html" },
		});
	}

	function registerDepositComponents() {
		setupConfiguration();

		registerComponentsForConcretePayments();
		registerComponentsForNotes();
		registerComponentForListOfPayments();
		registerComponentsForAlerts();
	}

	return {
		RegisterDepositComponents: registerDepositComponents,
	};
});
