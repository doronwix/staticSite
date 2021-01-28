define("viewmodels/CashBackViewModel", [
	"require",
	"knockout",
	"handlers/general",
	"Q",
	"dataaccess/dalorder",
	"initdatamanagers/Customer",
	"helpers/KoComponentViewModel",
	"initdatamanagers/InstrumentsManager",
	"managers/instrumentTranslationsManager",
	"managers/viewsmanager",
	"viewmodels/dialogs/DialogViewModel",
	"cachemanagers/PortfolioStaticManager",
	"global/UrlResolver",
	"cachemanagers/bonusmanager",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		Q = require("Q"),
		dalOrders = require("dataaccess/dalorder"),
		Customer = require("initdatamanagers/Customer"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		InstrumentsManager = require("initdatamanagers/InstrumentsManager"),
		InstrumentTranslationsManager = require("managers/instrumentTranslationsManager"),
		ViewsManager = require("managers/viewsmanager"),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel"),
		PortfolioStaticManager = require("cachemanagers/PortfolioStaticManager"),
		UrlResolver = require("global/UrlResolver"),
		bonusManager = require("cachemanagers/bonusmanager");

	var CashBackViewModel = general.extendClass(KoComponentViewModel, function (params) {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data; // inherited from KoComponentViewModel

		function setObservables() {
			data.Summary = {
				EndDate: ko.observable(""),
				CashBack: ko.observable(""),
				Volume: ko.observable(""),
				MaxCashBack: ko.observable(""),
				MaxVolume: ko.observable(""),
			};
			data.Enhanced = ko.observableArray();
			data.Regular = ko.observableArray();
			data.isDataLoaded = ko.observable(false);
			data.customerSymbolId = ko.observable(Customer.prop.baseCcyId());
			data.hasWeightedVolumeFactor = ko.observable(Customer.prop.hasWeightedVolumeFactor);

			startNewDeal.enabled = ko.observable(!!params.enableNewDeal);
		}

		function setComputables() {
			data.hasEnhancedInstruments = ko.computed(function () {
				return data.Enhanced() && data.Enhanced().length > 0;
			});
			data.hasRegularInstruments = ko.computed(function () {
				return data.Regular() && data.Regular().length > 0;
			});
			data.hasVolumes = ko.computed(function () {
				return data.hasEnhancedInstruments() || data.hasRegularInstruments();
			});
		}

		function setSummaryData(summaryData) {
			var vol = general.toNumeric(summaryData.WeightedVolume),
				maxCb = general.toNumeric(summaryData.PendingBonusAmount),
				maxVol = general.toNumeric(summaryData.ConditionalVolume),
				cb = maxVol === 0 ? 0 : (maxCb * vol) / maxVol;

			cb = Math.min(cb, maxCb);
			data.Summary.CashBack(cb);
			data.Summary.MaxCashBack(maxCb);
			data.Summary.Volume(vol);
			data.Summary.MaxVolume(maxVol);
			data.Summary.EndDate(summaryData.PendingBonusEnd);
		}

		function setIntrumentsCashBack(volumes) {
			volumes.forEach(function (row, index) {
				var estimatedCb = (row.USDAmountWeighted / data.Summary.MaxVolume()) * data.Summary.MaxCashBack();
				if (isNaN(estimatedCb)) {
					estimatedCb = 0;
				}

				volumes[index].usdAmount = general.formatNumber(String(row.USDAmount));
				volumes[index].usdAmountWeighted = general.formatNumber(String(row.USDAmountWeighted));
				volumes[index].estimatedCashBack = parseFloat(estimatedCb).toFixed(2);
			});
		}

		function setVolumesData(result) {
			setSummaryData(result[0].Summary);
			setIntrumentsCashBack(result[0].EnhancedInstruments);

			for (var i = 0; i < result[0].EnhancedInstruments.length; i++) {
				var enhancedInstrument = InstrumentsManager.GetInstrument(
					result[0].EnhancedInstruments[i].InstrumentId
				);
				result[0].EnhancedInstruments[i].baseSymbolId = enhancedInstrument.baseSymbol;
				result[0].EnhancedInstruments[i].otherSymbolId = enhancedInstrument.otherSymbol;
			}

			data.Enhanced(result[0].EnhancedInstruments);
			setIntrumentsCashBack(result[0].RegularInstruments);

			for (var counter = 0; counter < result[0].RegularInstruments.length; counter++) {
				var regularInstrument = InstrumentsManager.GetInstrument(
					result[0].RegularInstruments[counter].InstrumentId
				);
				result[0].RegularInstruments[counter].baseSymbolId = regularInstrument.baseSymbol;
				result[0].RegularInstruments[counter].otherSymbolId = regularInstrument.otherSymbol;
			}

			data.Regular(result[0].RegularInstruments);
		}

		function setContentForNoVolumeButHasWeightedVolume() {
			var enhancedInstrumentList, maxMultiplier, randomEnhancedInstrument, enhancedInstrumentNames;

			enhancedInstrumentList = InstrumentsManager.GetEnhancedInstruments().map(function (instrument) {
				return {
					id: instrument.id,
					name: InstrumentTranslationsManager.Short(instrument.id),
					multiplier: instrument.weightedVolumeFactor,
				};
			});

			if (enhancedInstrumentList.length === 0) {
				return;
			}

			enhancedInstrumentNames = enhancedInstrumentList
				.map(function (instr) {
					return instr.name;
				})
				.join(", ");
			maxMultiplier = Math.round(
				Math.max.apply(
					Math,
					enhancedInstrumentList.map(function (instr) {
						return instr.multiplier;
					})
				) * 100
			);
			randomEnhancedInstrument =
				enhancedInstrumentList[Math.floor(Math.random() * enhancedInstrumentList.length)];

			data.enhancedInstruments = enhancedInstrumentList;
			data.maxMultiplier = maxMultiplier;
			data.randomEnhancedInstrument = {
				name: randomEnhancedInstrument.name,
				equivalentVolume: Math.round(randomEnhancedInstrument.multiplier * 100),
			};
			data.enhancedInstrumentNames = enhancedInstrumentNames;
		}

		function init(customSettings) {
			// if coming from deep link and no cash back pending bonus
			if (
				PortfolioStaticManager.Portfolio.pendingBonusType !== ePendingBonusType.cashBack ||
				bonusManager.bonus().amountBase <= 0
			) {
				ViewsManager.SwitchViewVisible(Customer.prop.mainPage, {});

				return;
			}

			parent.init.call(self, customSettings); // inherited from KoComponentViewModel

			setObservables();
			setComputables();

			dalOrders
				.CashBackVolumesInfo()
				.then(function (result) {
					setVolumesData(result);
					data.isDataLoaded(true);
				})
				.done();

			setContentForNoVolumeButHasWeightedVolume();
		}

		function dispose() {
			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		function closePopup() {
			return Q.fcall(function () {
				if (general.isDefinedType(DialogViewModel) && DialogViewModel.close) {
					DialogViewModel.close();
				}
			}).delay(10);
		}

		function startNewDeal(objInstrument, event) {
			if (!startNewDeal.enabled()) {
				return;
			}
			if (objInstrument && objInstrument.id) {
				closePopup()
					.then(function () {
						ViewsManager.RedirectToURL(
							UrlResolver.combine(
								UrlResolver.getRedirectPath(),
								"/NewDeal?instrumentId=" + objInstrument.id
							)
						);
					})
					.done();
			}
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			ClosePopup: closePopup,
			StartNewDeal: startNewDeal,
		};
	});

	// params contains all data from CashBackViewModel, it has been passed from component data binding
	function createViewModel(params) {
		var viewModel = new CashBackViewModel(params || {});
		viewModel.init();

		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
