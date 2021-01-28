define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"managers/CustomerProfileManager",
	"dataaccess/dalDemoAccount",
	"dataaccess/dalCommon",
	"handlers/AmountConverter",
	"Dictionary",
	"modules/BuilderForInBetweenQuote",
	"modules/systeminfo",
	"JSONHelper",
], function (require) {
	var ko = require("knockout"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		general = require("handlers/general"),
		Customer = require("initdatamanagers/Customer"),
		CustomerProfileManager = require("managers/CustomerProfileManager"),
		dalDemoAccount = require("dataaccess/dalDemoAccount"),
		AmountConverter = require("handlers/AmountConverter"),
		Dictionary = require("Dictionary"),
		BuilderForInBetweenQuote = require("modules/BuilderForInBetweenQuote"),
		JSONHelper = require("JSONHelper"),
		systemInfo = require("modules/systeminfo");

	var DemoDepositIconViewModel = general.extendClass(KoComponentViewModel, function DemoDepositIconViewModelClass(
		_params
	) {
		var self = this,
			parent = this.parent,
			params = _params,
			obs = {
				quoteForUSDCcyToSelectedAccuntCcy: ko.observable(""),
				isProcessing: ko.observable(false),
				shouldWaitForInBetweenQuote: ko.observable(false),
			};

		var usdCcy = 47,
			firstAmoutToDeposit;

		var amoutToDeposit = self
			.createComputed(function () {
				if (general.isNullOrUndefined(firstAmoutToDeposit) && obs.quoteForUSDCcyToSelectedAccuntCcy() != "") {
					firstAmoutToDeposit = AmountConverter.Convert(
						CustomerProfileManager.ProfileCustomer().demoDepositAmount,
						obs.quoteForUSDCcyToSelectedAccuntCcy()
					);
				}

				return firstAmoutToDeposit;
			})
			.extend({ deferred: true });

		var getFormattedMessage = function (key) {
			return String.format(
				Dictionary.GetItem(key),
				Format.toNumberWithCurrency(amoutToDeposit(), { currencyId: Customer.prop.selectedCcyId() })
			);
		};

		var tooltipMessage = self.createComputed(function () {
			return getFormattedMessage("demoDepositToolTip");
		});

		var isCustomerDemo = Customer.prop.isDemo;

		var isAlreadyDisplayed = false,
			wasDepositMade = false,
			isInBetweenQuoteChanging = false,
			waitForInBetweenQuoteInterval;

		var getMaxAmount = function () {
			if (isInBetweenQuoteChanging === true) {
				obs.shouldWaitForInBetweenQuote(true);
				waitForInBetweenQuoteInterval = setInterval(waitForInBetweenQuote, 500);

				return 0;
			}

			return AmountConverter.Convert(
				systemInfo.get("config").MaxEquityForDemoDepositInUsd,
				obs.quoteForUSDCcyToSelectedAccuntCcy.peek()
			);
		};

		var waitForInBetweenQuote = function () {
			if (!isInBetweenQuoteChanging) {
				if (waitForInBetweenQuoteInterval) clearInterval(waitForInBetweenQuoteInterval);
				obs.shouldWaitForInBetweenQuote(false);
			}
		};

		var getEquity = function () {
			return Number.fromStr(params.equity());
		};

		var isEligableToDemoDeposit = self
			.createComputed(function () {
				if (wasDepositMade === true) {
					return false;
				}

				if (isAlreadyDisplayed === true && !obs.isProcessing()) {
					return true;
				}

				if (!isCustomerDemo || obs.isProcessing()) {
					return false;
				}

				if (obs.shouldWaitForInBetweenQuote() === true) {
					return false;
				}

				isAlreadyDisplayed = getEquity() < getMaxAmount();

				return isAlreadyDisplayed;
			})
			.extend({ deferred: true });

		var onComplete = function (response) {
			var result = JSONHelper.STR2JSON("demo-deposit-icon:onComplete", response);
			if (result.isSuccessful === true) {
				wasDepositMade = true;
			}
			obs.isProcessing(false);
		};

		var onClick = function () {
			obs.isProcessing(true);
			dalDemoAccount.processDemoDeposit(onComplete);
		};

		var saveInBetweenQuote = function (response) {
			if (response) {
				obs.quoteForUSDCcyToSelectedAccuntCcy(response);
				isInBetweenQuoteChanging = false;
			}
		};

		var setInBetweenQuote = function () {
			isInBetweenQuoteChanging = true;

			BuilderForInBetweenQuote.GetInBetweenQuote(usdCcy, Customer.prop.selectedCcyId())
				.then(saveInBetweenQuote)
				.done();
		};

		var setSubscribers = function () {
			self.subscribeTo(Customer.prop.selectedCcyId, function () {
				setInBetweenQuote();
			});
		};

		var dispose = function () {
			parent.dispose.call(self);
		};

		var init = function (settings) {
			parent.init.call(self, settings);
			setInBetweenQuote();
			setSubscribers();
		};

		return {
			init: init,
			dispose: dispose,
			tooltipMessage: tooltipMessage,
			isCustomerDemo: isCustomerDemo,
			isEligableToDemoDeposit: isEligableToDemoDeposit,
			onClick: onClick,
			obs: obs,
		};
	});

	var createViewModel = function (_params) {
		var params = _params || {};

		var viewModel = new DemoDepositIconViewModel(params);
		viewModel.init();

		return viewModel;
	};

	return {
		createViewModel: createViewModel,
	};
});
