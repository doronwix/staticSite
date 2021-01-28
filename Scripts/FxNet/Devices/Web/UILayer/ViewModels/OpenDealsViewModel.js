define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"deviceviewmodels/OpenDealsModule",
	"deviceviewmodels/OpenDealsModule",
	"managers/viewsmanager",
	"Dictionary",
	"viewmodels/dialogs/DialogViewModel",
	"managers/PrintExportManager",
	"StateObject!Positions",
	"StateObject!DealsTabs",
	"configuration/initconfiguration",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		openDealsModule = require("deviceviewmodels/OpenDealsModule"),
		customer = require("initdatamanagers/Customer"),
		ViewsManager = require("managers/viewsmanager"),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel"),
		Dictionary = require("Dictionary"),
		printExportManager = require("managers/PrintExportManager"),
		positionsCache = require("StateObject!Positions"),
		openDealsGridSettings = require("configuration/initconfiguration").OpenDealsConfiguration;

	var Model = new openDealsModule();
	Model.Init(openDealsGridSettings);
	var OpenDealsViewModel = general.extendClass(KoComponentViewModel, function OpenDealsViewModelClass(params) {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = parent.Data,
			subscribers = [];

		function init(settings) {
			parent.init.call(self, settings);

			if (settings.isHeaderComponent) {
				return;
			}

			setObservables();
			setSubscribers();
			initExport();
		}

		function setObservables() {
			var ofhPositionNumber = positionsCache.set("ofhPositionNumber", null),
				plPositionNumber = positionsCache.set("plPositionNumber", null);

			data.selectedOFHPositionNumber = ko.observable(ofhPositionNumber);
			data.selectedPLPositionNumber = ko.observable(plPositionNumber);
		}

		function setSubscribers() {
			subscribers.push({
				dispose: positionsCache.subscribe("ofhPositionNumber", selectedOFHPositionNumberUpdater),
			});
			subscribers.push({
				dispose: positionsCache.subscribe("plPositionNumber", selectedPLPositionNumberUpdater),
			});
		}

		function selectedOFHPositionNumberUpdater(ofhPositionNumber) {
			data.selectedOFHPositionNumber(ofhPositionNumber);
		}

		function selectedPLPositionNumberUpdater(plPositionNumber) {
			data.selectedPLPositionNumber(plPositionNumber);
		}

		function initExport() {
			self.subscribeTo(Model.HasRecords, monitorData);

			monitorData(Model.HasRecords());
		}

		function monitorData(hasData) {
			ko.postbox.publish("printableDataAvailable", {
				dataAvailable: hasData,
				viewType: ViewsManager.ActiveFormType(),
				viewModel: "OpenDealsViewModel",
			});
		}

		function closeDeal(position) {
			if (
				!position.quoteIsActive() ||
				Model.FlagsState.isMarketClosed() ||
				!window.componentsLoaded() ||
				printExportManager.IsWorkingNow()
			) {
				return;
			}
			var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
				dialogClass = "deal-slip" + (revisedSlip ? " revised-slip" : " closeDeal"),
				dialogTitle = !revisedSlip ? Dictionary.GetItem("CloseDealRequest", "dialogsTitles", " ") + ":" : "";

			DialogViewModel.open(
				eDialog.CloseDeal,
				{
					title: dialogTitle,
					customTitle: "CloseDealPosNum",
					width: 555,
					persistent: false,
					dialogClass: dialogClass,
				},
				eViewTypes.vCloseDeal,
				{
					orderId: position.orderID,
					isStartNavigator: false,
				}
			);
		}

		function setComponentReady() {
			if (general.isFunctionType(params.SetComponentReady)) {
				params.SetComponentReady(eViewTypes.vOpenDeals);
			}
		}

		function dispose() {
			positionsCache.unset("ofhPositionNumber");
			positionsCache.unset("plPositionNumber");

			while (subscribers.length > 0) {
				subscribers.pop().dispose();
			}

			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			model: Model,
			closeDeal: closeDeal,
			SetComponentReady: setComponentReady,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new OpenDealsViewModel(params);

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
