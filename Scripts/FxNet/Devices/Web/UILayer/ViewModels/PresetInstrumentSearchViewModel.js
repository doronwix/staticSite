define([
	"require",
	"handlers/general",
	"devicemanagers/ViewModelsManager",
	"viewmodels/BaseInstrumentSearchViewModel",
], function PresetInstrumentSearchDef(require) {
	var general = require("handlers/general"),
		viewModelsManager = require("devicemanagers/ViewModelsManager"),
		baseViewModel = require("viewmodels/BaseInstrumentSearchViewModel");

	var PresetInstrumentSearchViewModel = general.extendClass(baseViewModel, function PresetInstrumentSearchClass() {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data; // inherited from KoComponentViewModel

		function init(settings) {
			parent.init.call(self, settings);

			setSubscribers();
		}

		function setSubscribers() {
			self.subscribeTo(data.selected, function onSelectedInstrumentChanged(instrument) {
				viewModelsManager.VmQuotesPreset.SelectPreset(instrument.presetId);
			});
		}

		return {
			init: init,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new PresetInstrumentSearchViewModel();
		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
