define("fxnet/uilayer/viewmodels/payments/validation/amountcurrencyvalidation", [
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"enums/paymentsconfigsettings",
	"managers/viewsmanager",
	"vendor/knockout.validation",
	"LoadDictionaryContent!payments_genericcreditcard",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		koComponentViewModel = require("helpers/KoComponentViewModel"),
		paymentsConfigSettings = require("enums/paymentsconfigsettings"),
		viewsManager = require("managers/viewsmanager");

	var AmountCurrencyValidation = general.extendClass(koComponentViewModel, function (params) {
		var self = this,
			parent = this.parent,
			data = {},
			paymentType = params.paymentType,
			contentResourceName = "payments_genericcreditcard";

		if (!ko.validation.rules["maxAml"]) {
			ko.validation.rules["maxAml"] = {
				validator: function (val, p) {
					var isValid = parseInt(val) <= p.max;

					if (general.isFunctionType(p.observable)) {
						p.observable(isValid);
					}
					return isValid;
				},
				message: "The field must >= {0}",
			};

			ko.validation.registerExtenders();
		}

		function setObservables() {
			/// data.value => amount value
			data.value = ko.observable();
			data.value.isMaxAmlValid = ko.observable(true);

			data.selectedCurrency = ko.observable();

			data.concretePaymentCurrencies = ko.observableArray([]);
			data.currencyList = ko
				.observableArray([])
				.extend({ intersectArray: { withArray: data.concretePaymentCurrencies, prop: "orderId" } });

			data.validationOn = ko.observable(false);
			data.isValid = ko.pureComputed(function () {
				return data.value.isValid() && data.validationOn();
			});

			data.contentResourceName = ko.pureComputed(function () {
				return contentResourceName;
			});
		}

		function buildValidationMessage(contentKey, contentResource, args) {
			return String.format(Dictionary.GetItem(contentKey, contentResource), args);
		}

		function buildBlockedDepositValidationRules(currentCurrency) {
			var rules;

			if (
				currentCurrency &&
				general.isNumberType(currentCurrency.MinAmount) &&
				general.isNumberType(currentCurrency.MaxAmount)
			) {
				if (currentCurrency.MinAmount > currentCurrency.MaxAmount) {
					rules = {};

					rules.min = {
						params: currentCurrency.MinAmount,
						message: buildValidationMessage("depMinMaxBlocked", contentResourceName),
					};

					rules.max = {
						params: currentCurrency.MaxAmount,
						message: buildValidationMessage("depMinMaxBlocked", contentResourceName),
					};
				}
			}

			return rules;
		}

		function buildMinMaxValidationRules(currentCurrency) {
			var rules;

			if (
				currentCurrency &&
				general.isNumberType(currentCurrency.MinAmount) &&
				(general.isNumberType(currentCurrency.MaxAmlAmount) || general.isNumberType(currentCurrency.MaxAmount))
			) {
				rules = {};

				rules.min = {
					params: currentCurrency.MinAmount - 0.01,
					message: buildValidationMessage("reqMinDeposit", contentResourceName, [
						currentCurrency.MinAmount,
						currentCurrency.name,
					]),
				};

				data.value.isMaxAmlValid(true);

				if (
					general.isNumberType(currentCurrency.MaxAmlAmount) &&
					currentCurrency.MaxAmlAmount < currentCurrency.MaxAmount
				) {
					var max = Math.max(0, currentCurrency.MaxAmlAmount);
					rules.maxAml = {
						params: { max: max + 0.01, observable: data.value.isMaxAmlValid },
						message: buildValidationMessage("reqMaxAmlDeposit", contentResourceName, [
							max,
							currentCurrency.name,
						]),
					};
				} else {
					rules.max = {
						params: currentCurrency.MaxAmount + 0.01,
						message: buildValidationMessage("reqMaxDeposit", contentResourceName, [
							currentCurrency.MaxAmount,
							currentCurrency.name,
						]),
					};
				}
			}

			return rules;
		}

		function setValidationRules(currentCurrency) {
			var validationRules = {
				digit: {
					value: true,
					message: buildValidationMessage("rngAmount", contentResourceName),
				},
				required: {
					value: true,
					message: buildValidationMessage("reqAmount", contentResourceName),
				},
			};

			var blockedDepositValidationRule = buildBlockedDepositValidationRules(currentCurrency);

			if (blockedDepositValidationRule) {
				Object.assign(validationRules, blockedDepositValidationRule);
			} else {
				var minMaxValidationRules = buildMinMaxValidationRules(currentCurrency);

				if (minMaxValidationRules) {
					Object.assign(validationRules, minMaxValidationRules);
				}
			}

			if (data.value.rules) {
				data.value.rules.removeAll();
			}

			data.value.extend(validationRules);
		}

		function setSubscribers() {
			self.subscribeTo(data.selectedCurrency, function (currency) {
				setValidationRules(currency);
			});
		}

		function redirectToUploadDocumentsPage() {
			viewsManager.RedirectToForm(eForms.UploadDocuments);
		}

		function resetValueToMaxAml() {
			data.value(Math.max(0, data.selectedCurrency().MaxAmlAmount));
		}

		function init() {
			parent.init.apply(self, arguments);

			if (paymentType) {
				//try get specific content resource name
				var paymentConfig = paymentsConfigSettings.find(function (c) {
					return c.Id === paymentType;
				});

				if (paymentConfig && paymentConfig.Resources) {
					contentResourceName = paymentConfig.Resources[0];
				}
			}

			data.RedirectToUploadDocument = redirectToUploadDocumentsPage;
			data.ResetValueToMaxAml = resetValueToMaxAml;

			setObservables();
			setValidationRules();
			setSubscribers();
		}

		function dispose() {
			parent.dispose();
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
		};
	});

	return AmountCurrencyValidation;
});
