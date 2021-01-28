define("viewmodels/BaseSignalsViewModel", [
	"require",
	"knockout",
	"handlers/general",
	"helpers/ObservableHashTable",
	"Dictionary",
	"helpers/KoComponentViewModel",
	"dataaccess/dalTradingSignals",
	"initdatamanagers/Customer",
	"initdatamanagers/InstrumentsManager",
	"devicemanagers/AlertsManager",
	"handlers/Cookie",
	"JSONHelper",
	"managers/instrumentTranslationsManager",
	"modules/permissionsmodule",
	"managers/viewsmanager",
	"global/UrlResolver",
	"generalmanagers/RegistrationManager",
	"modules/ThemeSettings",
	"customEnums/Consts",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		Dictionary = require("Dictionary"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		dalTradingSignals = require("dataaccess/dalTradingSignals"),
		customer = require("initdatamanagers/Customer"),
		instrumentsManager = require("initdatamanagers/InstrumentsManager"),
		AlertsManager = require("devicemanagers/AlertsManager"),
		cookieHandler = require("handlers/Cookie"),
		JSONHelper = require("JSONHelper"),
		instrumentTranslationsManager = require("managers/instrumentTranslationsManager"),
		permissionsModule = require("modules/permissionsmodule"),
		ViewsManager = require("managers/viewsmanager"),
		UrlResolver = require("global/UrlResolver"),
		observableHashTable = require("helpers/ObservableHashTable"),
		RegistrationManager = require("generalmanagers/RegistrationManager"),
		themeSetting = require("modules/ThemeSettings"),
		IMAGE_EXTENSION = ".gif",
		IMAGE_DARK_SUFFIX = ".darktheme",
		rx = RegExp(IMAGE_EXTENSION);

	var BaseSignalsViewModel = general.extendClass(KoComponentViewModel, function (_filterData) {
		var self = this,
			filterData = _filterData,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data, // inherited from KoComponentViewModel
			handlers = {};

		function init(settings) {
			parent.init.call(self, settings); // inherited from KoComponentViewModel

			setObservables();
			setHandlers();
			setSubscribers();
			setComputables();

			updateDisclaimerStatus();
			updateSignalsPermissions();
		}

		function setObservables() {
			data.hasAgreedDisclaimer = ko.observable(false);
			data.signalsAreAvailable = ko.observable(false);
			data.isLoading = ko.observable(false);
			data.fetchingData = ko.observable(false);
			data.signalsList = new observableHashTable(ko, general, "signalId", {
				enabled: true,
				sortProperty: "signalId",
				asc: false,
			});
			data.signalsEndDate = ko.observable("");
			data.areSignalsAllowed = ko.observable(false);
			data.pageIndex = ko.observable(1);
			data.totalRecords = ko.observable(0);
			data.signalsPermissionsLoaded = ko.observable(false);
		}

		function setSubscribers() {
			self.subscribeTo(data.areSignalsAllowed, function (areSignalsAllowed) {
				if (areSignalsAllowed) {
					updateSignalsList();
				}
			});

			self.subscribeTo(data.isLoading, function (isLoading) {
				ko.postbox.publish(ePostboxTopic.SetSpinnerVisibility, isLoading);
			});
		}

		function setComputables() {
			data.isShowAgreement = self.createComputed(function () {
				return (
					data.signalsPermissionsLoaded() &&
					!this.hasAgreedDisclaimer() &&
					this.areSignalsAllowed() &&
					!this.isLoading()
				);
			}, self.Data);

			data.isShowSignal = self.createComputed(function () {
				return (
					data.signalsPermissionsLoaded() &&
					this.hasAgreedDisclaimer() &&
					this.signalsAreAvailable() &&
					this.areSignalsAllowed() &&
					!this.isLoading()
				);
			}, self.Data);

			data.isShowSignalUnavailable = self.createComputed(function () {
				return (
					data.signalsPermissionsLoaded() &&
					this.hasAgreedDisclaimer() &&
					!this.signalsAreAvailable() &&
					this.areSignalsAllowed() &&
					!(this.isLoading() || this.fetchingData())
				);
			}, self.Data);

			data.signalsAreDissallowed = self.createComputed(function () {
				return data.signalsPermissionsLoaded() && !this.areSignalsAllowed() && !this.isLoading();
			}, self.Data);
		}

		function dispose() {
			parent.dispose.call(self); // inherited from KoComponentViewModel
			data.signalsList.Clear();
		}

		function updateSignalsList() {
			if (!data.isLoading() && data.hasAgreedDisclaimer() && !(filterData.instrumentId || filterData.signalId)) {
				var result;
				data.fetchingData(data.pageIndex() !== 1);
				data.isLoading(data.pageIndex() == 1);

				dalTradingSignals
					.getSignalsDetailsForTechAnalysis({ symbol: null, pageIndex: data.pageIndex() })
					.then(function (responseText) {
						result = JSONHelper.STR2JSON("getSignalsDetailsForTechAnalysis/onLoadComplete", responseText);
						if (general.isObjectType(result)) {
							data.totalRecords(Number(result.totalRecords));
							updateSignalData(result, data.pageIndex() > 1);
						}
					})
					.done();
			}
		}

		function updateSignalData(result, paged) {
			var instrumentsToRegister = [];
			if (result.status == eResult.Success && result.resultStatus == 0) {
				for (var i = 0; i < result.result.length; i++) {
					var signal = toSignalObject(result.result[i]);
					if (signal) {
						data.signalsList.Add(signal);
						instrumentsToRegister.push(signal.instrument.id);
					} else {
						ErrorManager.onError("viewModels/BaseSignalsViewModel", result.result[i], eErrorSeverity.low);
					}
				}
			}

			data.signalsAreAvailable((result.status == eResult.Success && result.resultStatus == 0) || paged);

			data.fetchingData(false);
			data.isLoading(false);
			if (instrumentsToRegister.length) {
				registerInstruments(instrumentsToRegister);
			}
		}

		function registerInstruments(instrumentIds) {
			RegistrationManager.Update(eRegistrationListName.TradingSignals, instrumentIds);
		}

		function setHandlers() {
			handlers.disclaimerClick = function () {
				AlertsManager.UpdateAlert(
					AlertTypes.ServerResponseAlert,
					Dictionary.GetItem("DisclaimerTitle"),
					Dictionary.GetItem("lblDisclaimerText"),
					null,
					{}
				);
				AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
			};

			handlers.clickDisclaimerAgree = function () {
				cookieHandler.CreateCookie("TsComplianceDate", new Date().toDateString(), new Date().AddMonths(12));
				data.hasAgreedDisclaimer(true);
				updateSignalsList();
			};
		}

		function toSignalObject(_signal) {
			var instrument = instrumentsManager.GetInstrumentBySignalName(_signal[eTradingSignal.symbol]),
				__signal = null;

			if (instrument) {
				var currentUiTheme = themeSetting.GetTheme(),
					_imagePath = _signal[eTradingSignal.imagePath];

				if (currentUiTheme === "dark") {
					_imagePath = _imagePath.replace(rx, IMAGE_DARK_SUFFIX + IMAGE_EXTENSION);
				}

				__signal = {
					signalId: _signal[eTradingSignal.signalId],
					signalTitle: _signal[eTradingSignal.signalTitle],
					signalDate: _signal[eTradingSignal.signalDate],
					imagePath: _imagePath,
					shortTermLevel: _signal[eTradingSignal.shortTerm],
					shortTermText: getAdviceText(_signal[eTradingSignal.shortTerm], true),
					mediumTermLevel: _signal[eTradingSignal.mediumTermLevel],
					mediumTermText: getAdviceText(_signal[eTradingSignal.mediumTermLevel], false),
					weekDelta: _signal[eTradingSignal.weekDelta],
					longTermLevel: _signal[eTradingSignal.longTermLevel],
					longTermText: getAdviceText(_signal[eTradingSignal.longTermLevel], false),
					monthDelta: _signal[eTradingSignal.monthDelta],
					summary: _signal[eTradingSignal.summary],
					instrument: instrument,
					symbol: instrument
						? instrumentTranslationsManager.Long(instrument.id)
						: _signal[eTradingSignal.symbol],
				};
			}

			return __signal;
		}

		function getAdviceText(signalLevel, isShortTerm) {
			var textKey;

			switch (signalLevel) {
				case eSignalTrendsValues.StrongBuy:
					textKey = "lblStrongBuy";
					break;
				case eSignalTrendsValues.Buy:
					textKey = "lblBuy";
					break;
				case eSignalTrendsValues.Sell:
					textKey = "lblSell";
					break;
				case eSignalTrendsValues.StrongSell:
					textKey = "lblStrongSell";
					break;
				default:
					if (isShortTerm) textKey = "lblNotAvailable";
					else textKey = "lblNeutral";
			}

			return textKey;
		}

		function openDeal(signal) {
			if (signal && signal.instrument) {
				ViewsManager.RedirectToURL(
					UrlResolver.getRedirectUrl("NewDeal", "instrumentId=" + signal.instrument.id)
				);
			} else {
				ViewsManager.SwitchViewVisible(eForms.Quotes, {});
			}
		}

		var updateDisclaimerStatus = function () {
			var tsComplianceDate = cookieHandler.ReadCookie("TsComplianceDate");
			data.hasAgreedDisclaimer(tsComplianceDate !== null);
		};

		var updateSignalsPermissions = function () {
			customer.SignalsPermissionsReady.then(function () {
				data.areSignalsAllowed(customer.prop.AreSignalsAllowed);
				data.signalsEndDate(customer.prop.signalsEndDate);
				data.signalsPermissionsLoaded(true);
			});
		};

		return {
			init: init,
			dispose: dispose,
			Handlers: handlers,
			FilterData: filterData,
			toSignalObject: toSignalObject,
			registerInstruments: registerInstruments,
			openDeal: openDeal,
			updateSignalsList: updateSignalsList,
			permissionsModule: permissionsModule,
		};
	});

	return BaseSignalsViewModel;
});
