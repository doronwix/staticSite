define("modules/NewPriceAlertModule", [
	"require",
	"knockout",
	"handlers/general",
	"Q",
	"dataaccess/dalorder",
	"devicemanagers/ViewModelsManager",
	"initdatamanagers/Customer",
	"managers/CustomerProfileManager",
	"modules/permissionsmodule",
	"initdatamanagers/InstrumentsManager",
	"devicemanagers/StatesManager",
	"viewmodels/Limits/AmountFieldsWrapper",
	"viewmodels/Limits/LimitBaseViewModel",
	"StateObject!Transaction",
	"handlers/limit",
	"modules/environmentData",
], function NewPriceAlerModuletDefault(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		Q = require("Q"),
		dalOrders = require("dataaccess/dalorder"),
		customer = require("initdatamanagers/Customer"),
		customerProfileManager = require("managers/CustomerProfileManager"),
		permissionsModule = require("modules/permissionsmodule"),
		instrumentsManager = require("initdatamanagers/InstrumentsManager"),
		statesManager = require("devicemanagers/StatesManager"),
		LimitBaseViewModel = require("viewmodels/Limits/LimitBaseViewModel"),
		stateObject = require("StateObject!Transaction"),
		LimitValuesCalculator = require("calculators/LimitValuesCalculator"),
		limit = require("handlers/limit"),
		environmentData = require("modules/environmentData").get();

	var NewPriceAlertModule = general.extendClass(LimitBaseViewModel, function NewPriceAlertModuleClass() {
		var self = this,
			parent = this.parent,
			data = this.Data,
			baseOrder = parent.BaseOrder,
			selectedInstrumentWrapper,
			lastSubmit = 0;

		function init(customSettings) {
			if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
				stateObject.set("stateObjectIsReadyDefer", Q.defer());
			}

			setObservables();
			parent.init.call(self, customSettings);
			setValidators();
			setComputables();
			setSubscribers();
			parent.registerToDispatcher();
			stateObject.get("stateObjectIsReadyDefer").resolve();
			data.showTools(false);
			data.orderDir(eOrderDir.Buy);
		}

		function setObservables() {
			data.showLimits = ko
				.observable(customerProfileManager.ProfileCustomer().newLimitOrders === 1)
				.extend({ notify: "always" });
			data.showLimitsSlideCompleted = ko.observable(false);
			data.toggleLimitsSection = function () {
				var currentValue = !!data.showLimits();

				data.showLimits(!currentValue);
			};
			data.priceAlertExist = ko.observable(false);
			data.priceAlertExceedAmount = ko.observable(false);
			data.percentageFromMarketRate = ko.observable();
		}

		function setComputables() {
			self.parent.subscribeTo(data.openLimit, self.updateDistances);

			data.showForexNonIslamicDealInfo = self.createComputed(function () {
				return data.isForex() && customer.prop.dealPermit !== eDealPermit.Islamic;
			});

			data.OrderButtonEnabled = self.createComputed(function () {
				var isValidInstrument = data.selectedInstrument.isValid(),
					viewModelReady = data.hasInstrument() && data.quotesAvailable(),
					isActiveQuote = data.isActiveQuote(),
					isBrokerAllowLimitsOnNoRates = customer.prop.brokerAllowLimitsOnNoRates,
					isOrderDirSelected = data.isShowBuyBox() || data.isShowSellBox(),
					hasDealMinMaxAmounts = data.dealMinMaxAmounts().length > 0;

				return (
					data.openLimit.isValid() &&
					!data.isProcessing() &&
					(isBrokerAllowLimitsOnNoRates || isActiveQuote) &&
					isOrderDirSelected &&
					isValidInstrument &&
					viewModelReady &&
					hasDealMinMaxAmounts
				);
			});

			selectedInstrumentWrapper = self.createComputed(function () {
				return data.selectedInstrument();
			});
		}

		function setSubscribers() {
			self.subscribeAndNotify(selectedInstrumentWrapper, function (instrumentId) {
				var instrument = instrumentsManager.GetInstrument(instrumentId);

				if (instrument) {
					parent.setLimitTabsFromClientProfile();
				}
			});
		}

		function setValidators() {
			data.selectedInstrument.extend({ validatable: false });
			data.selectedInstrument.extend({
				validation: {
					validator: function (selectedInstrument) {
						var isQuoteActive = data.isActiveQuote();
						var isAllowLimits =
							customer.prop.brokerAllowLimitsOnNoRates ||
							(!statesManager.GetStates().IsMarketClosed() && isQuoteActive);

						return (
							general.isEmptyValue(selectedInstrument) ||
							general.isEmptyValue(isQuoteActive) ||
							isAllowLimits
						);
					},
					message: Dictionary.GetItem("InstrumentInactive"),
				},
			});

			data.selectedInstrument.extend({
				tooltipValidation: {
					notify: "always",
				},
			});
		}

		//override
		var baseUpdateDistance = parent.updateDistances;

		parent.updateDistances = self.updateDistances = function () {
			baseUpdateDistance();
			if (data.openLimit()) {
				if (data.orderDir() === eOrderDir.Sell) {
					data.percentageFromMarketRate(
						Format.toPercent(
							LimitValuesCalculator.CalculatePercentFromRate(data.openLimit(), data.activeQuote.ask)
						)
					);
				} else if (data.orderDir() === eOrderDir.Buy) {
					data.percentageFromMarketRate(
						Format.toPercent(
							LimitValuesCalculator.CalculatePercentFromRate(data.openLimit(), data.activeQuote.bid)
						)
					);
				} else {
					data.percentageFromMarketRate("");
				}
			} else {
				data.percentageFromMarketRate("");
			}

			if (lastSubmit != data.orderDir() + data.openLimit()) {
				data.priceAlertExist(false);
			}
		};

		function orderButtonHandler() {
			if (!data.OrderButtonEnabled()) {
				return;
			}

			if (
				!permissionsModule.CheckActionAllowed("newLimit", true, {
					register:
						registerParams.traderInstrumentId +
						data.selectedInstrument() +
						registerParams.traderOrderDir +
						(data.orderDir() === 0 ? "Sell" : "Buy"),
				})
			) {
				return;
			}

			if (statesManager.GetStates().fxDenied() == true) {
				baseOrder.ValidateOnlineTradingUser();
				return;
			}

			if (baseOrder.LimitValidateQuote(data.selectedInstrument())) {
				var newLimit = new limit();

				parent.fillData(newLimit);
				newLimit.mode = eLimitMode.PriceAlert;
				newLimit.amount = 0;

				data.isProcessing(true);
				data.hasInstrument(false);
				dalOrders.AddLimit(newLimit, onPriceAlertCreate);
			}
		}

		function onPriceAlertCreate(result, callerId, instrumentid, requestData) {
			data.hasInstrument(true);
			data.isProcessing(false);

			lastSubmit = data.orderDir() + data.openLimit();

			switch (result[0].msgKey) {
				case "OrderError20":
					ko.postbox.publish("price-alert-error", {
						message: environmentData.maxPriceAlertsCount + " price alert limit reached",
					});
					result[0].result = eResult.Success;
					break;

				case "OrderError21":
					ko.postbox.publish("price-alert-error", { message: "price alert exist" });
					data.priceAlertExist(true);
					return;

				case "OrderError22":
					ko.postbox.publish("price-alert-error", { message: "general server error" });
					result[0].result = eResult.Success;
					break;

				case "SuccessPriceAlertAdd":
					ko.postbox.publish("price-alert-create");
					break;

				default:
					break;
			}

			var instrument = instrumentsManager.GetInstrument(instrumentid);

			baseOrder.OnActionReturn(result, callerId, instrument, {
				redirectToView: eForms.PriceAlerts,
				requestData: requestData,
				backFormTarget: eForms.Quotes,
			});

			if (instrument) {
				instrumentsManager.SetInstrumentDealAmount(instrumentid, instrument.defaultDealSize);
			}
		}

		function resetChartProperties() {
			if (!stateObject.containsKey("openLimit")) {
				return;
			}

			stateObject.get("openLimit")("");
			stateObject.unset("openLimit");
		}

		function dispose() {
			resetChartProperties();

			parent.dispose.call(self);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			BaseOrder: baseOrder,
			OrderButtonHandler: orderButtonHandler,
		};
	});

	return {
		ViewModel: NewPriceAlertModule
	};
});
