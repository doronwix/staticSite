define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"devicemanagers/StatesManager",
	"StateObject!userFlow",
	"deviceviewmodels/account/UserFlowCTA",
	"userflow/UserFlowManager",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		Customer = require("initdatamanagers/Customer"),
		StatesManager = require("devicemanagers/StatesManager"),
		stateObjectUserFlow = require("StateObject!userFlow"),
		UserFlowCTA = require("deviceviewmodels/account/UserFlowCTA");

	var AccountSummaryNotActiveViewModel = general.extendClass(KoComponentViewModel, function (params) {
		var self = this,
			parent = this.parent,
			Data = this.Data,
			userFlowUnsubscribe;

		var ctaText = ko.observable("");
		var cta = null;
		var isVisible = ko.observable(false);

		function updateFromStateObject(model) {
			if (model) {
				ctaText(model.ctaText);
				cta = model.cta;
			}
		}

		function init() {
			updateFromStateObject(stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged));
			userFlowUnsubscribe = stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
				updateFromStateObject(model);
			});
			setDefaultObservables();
			isVisible(!(StatesManager.States.IsActive() || Customer.prop.customerType === eCustomerType.TradingBonus));
		}

		function setDefaultObservables() {
			Data.ctaClick = ctaClick;
		}

		function dispose() {
			if (userFlowUnsubscribe) userFlowUnsubscribe();
			parent.dispose.call(self);
		}

		self.subscribeTo(StatesManager.States.IsActive, function (value) {
			isVisible(!(value || Customer.prop.customerType === eCustomerType.TradingBonus));
		});

		function ctaClick() {
			if (cta !== eCta.ContactUs) {
				ko.postbox.publish("action-source", "FinancialSummaryCTA");
			}
			UserFlowCTA.getUserFlowAction(cta)();
		}

		return {
			init: init,
			dispose: dispose,
			Data: Data,
			isVisible: isVisible,
			ctaText: ctaText,
			statesManager: StatesManager,
			customer: Customer,
		};
	});

	function createViewModel(params) {
		var viewModel = new AccountSummaryNotActiveViewModel(params || {});
		viewModel.init();
		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
