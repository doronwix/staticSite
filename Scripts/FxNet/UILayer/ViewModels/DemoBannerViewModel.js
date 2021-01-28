define("viewmodels/DemoBannerViewModel", [
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"Dictionary",
	"global/UrlResolver",
	"LoadDictionaryContent!demo_banners",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		koComponentViewModel = require("helpers/KoComponentViewModel"),
		customer = require("initdatamanagers/Customer"),
		dictionary = require("Dictionary"),
		UrlResolver = require("global/UrlResolver");

	var DemoBannerViewModel = general.extendClass(koComponentViewModel, function DemoBannerViewModelClass() {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data, // inherited from DealBaseViewModel
			realAccountMode = 2;

		function init(params) {
			parent.init.call(self); // inherited from KoComponentViewModel

			setDefaultObservables();
			setMessagesAndUrl(params);
		}

		function setDefaultObservables() {
			data.isVisible = ko.observable(customer.prop.isDemo);
			data.message = ko.observable(String.empty);
			data.buttonMessage = ko.observable(String.empty);
			data.urlToRedirect = ko.observable(String.empty);
		}

		function setMessagesAndUrl(params) {
			var recordsCount = params.dataRecords.length,
				profitSum = params.dataRecords.reduce(function (sum, value) {
					return sum + Number(value.pandLCalc);
				}, 0);

			switch (params.alertName) {
				case "DealAddServerResponseAlert":
					onOpeningDeal(params.dataRecords[0].instrumentId);
					break;

				case "DealsClosedServerResponseAlert":
					if (params.dataRecords[0].status != 1) {
						data.isVisible(false);
						return;
					}
					if (recordsCount === 1) {
						if (profitSum >= 0) {
							onCloseSingleDealWithProfit();
						} else {
							onCloseSingleDealWithNoProfit();
						}
					} else {
						onCloseMultipleDeals();
					}
					break;

				default:
					data.isVisible(false);
					break;
			}
		}

		function onOpeningDeal(instrumentId) {
			data.message(dictionary.GetItem("OpenDealMessage", "demo_banners"));
			data.buttonMessage(dictionary.GetItem("OpenDealButtonMessage", "demo_banners"));
			data.urlToRedirect(
				UrlResolver.getRedirectUrl(
					"NewDeal",
					String.format("Mode={0}&instrumentId={1}", realAccountMode, instrumentId)
				)
			);
		}

		function onCloseSingleDealWithProfit() {
			data.message(dictionary.GetItem("CloseOneDealWithProfitMessage", "demo_banners"));
			data.buttonMessage(dictionary.GetItem("CloseOneDealWithProfitButtonMessage", "demo_banners"));
			data.urlToRedirect(UrlResolver.getRedirectUrl("Deals", String.format("Mode={0}", realAccountMode)));
		}

		function onCloseSingleDealWithNoProfit() {
			data.message(dictionary.GetItem("CloseOneDealWithLossOrNoProfitMessage", "demo_banners"));
			data.buttonMessage(String.empty);
			data.urlToRedirect(String.empty);
		}

		function onCloseMultipleDeals() {
			data.message(dictionary.GetItem("CloseMultipleDealsMessage", "demo_banners"));
			data.buttonMessage(dictionary.GetItem("CloseMultipleDealsButtonMessage", "demo_banners"));
			data.urlToRedirect(UrlResolver.getRedirectUrl("Deals", String.format("Mode={0}", realAccountMode)));
		}

		function dispose() {
			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new DemoBannerViewModel();

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
