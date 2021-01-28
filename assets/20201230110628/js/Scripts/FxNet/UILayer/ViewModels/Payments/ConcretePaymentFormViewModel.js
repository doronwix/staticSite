define("viewmodels/Payments/ConcretePaymentFormViewModel", [
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"viewmodels/Payments/ConcretePaymentBehavior",
	"devicemanagers/StatesManager",
	"managers/viewsmanager",
	"enums/paymentsconfigsettings",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		ConcretePaymentsBehavior = require("viewmodels/Payments/ConcretePaymentBehavior"),
		statesManager = require("devicemanagers/StatesManager"),
		viewsManager = require("managers/viewsmanager"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings");

	var ConcretePaymentFormViewModel = general.extendClass(
		KoComponentViewModel,
		function ConcretePaymentFormViewModelClass() {
			var self = this,
				parent = this.parent, // inherited from KoComponentViewModel
				data = parent.Data, // inherited from KoComponentViewModel
				formObs = {},
				concretePaymentsBehavior = new ConcretePaymentsBehavior(),
				isDemo = statesManager.States.IsDemo;

			function isVisible(view) {
				return view === formObs.selectedPaymentType();
			}

			function init(settings) {
				parent.init.call(self, settings); // inherited from KoComponentViewModel

				setObservables();
				setSubscribers();
				processViewArgs();
			}

			function setObservables() {
				formObs.selectedPaymentType = ko.observable();
				formObs.paymentTitle = ko.observable();
				formObs.paymentSubtitle = ko.observable();
				formObs.imageClass = ko.observable();
				formObs.name = ko.observable();
				formObs.lastChars = ko.observable();
				formObs.isExistingCC = ko.observable();
				formObs.cardHolder = ko.observable();
				formObs.expirationDate = ko.observable();
				formObs.lastUsed = ko.observable();
				formObs.isGeneric = ko.observable();
				formObs.allowedCreditCards = ko.observableArray([]);
				formObs.paymentsConfigSettings = paymentsConfigSettings;
			}

			function setSubscribers() {
				self.addDisposable(
					ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData, onConcretePaymentDataChanged, true)
				);
			}

			function onConcretePaymentDataChanged(newValue) {
				formObs.selectedPaymentType(newValue.paymentType);
				formObs.paymentTitle(newValue.originalPaymentName);
			}

			function processViewArgs() {
				var viewArgs = viewsManager.GetViewArgs(eViewTypes.vConcretePaymentForm);

				if (!viewArgs) {
					return;
				}

				formObs.imageClass(viewArgs.imageClass || "");
				formObs.name(getConcretePaymentName(viewArgs.payment) || "");
				formObs.lastChars(viewArgs.lastChars || "");
				formObs.paymentSubtitle(getConcretePaymentSubtitle(viewArgs.payment) || "");
				formObs.isExistingCC(!!viewArgs.payment.isExistingCC);
				formObs.cardHolder(viewArgs.cardHolder || "");
				formObs.expirationDate(viewArgs.expirationDate || "");
				formObs.lastUsed(viewArgs.lastUsed || "");
				formObs.isGeneric(viewArgs.isGeneric || "");
				formObs.allowedCreditCards(viewArgs.allowedCreditCards || []);

				concretePaymentsBehavior.showPaymentView(viewArgs.payment, viewArgs.country, "", []);
			}

			function getConcretePaymentName(payment) {
				if (Dictionary.ValueIsEmpty(payment.textContentKey, "payments_concreteNames")) {
					return payment.name;
				}

				payment.name = Dictionary.GetItem(payment.textContentKey, "payments_concreteNames");

				return payment.name;
			}

			function getConcretePaymentSubtitle(payment) {
				if (!payment.subtitleContentKey || Dictionary.ValueIsEmpty(payment.subtitleContentKey)) {
					return "";
				}

				return Dictionary.GetItem(payment.subtitleContentKey);
			}

			return {
				init: init,
				Data: data,
				IsVisible: isVisible,
				IsDemo: isDemo,
				DepositActionTypes: window.eDepositingActionType,
				Form: formObs,
			};
		}
	);

	var createViewModel = function (params) {
		var viewModel = new ConcretePaymentFormViewModel();

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
