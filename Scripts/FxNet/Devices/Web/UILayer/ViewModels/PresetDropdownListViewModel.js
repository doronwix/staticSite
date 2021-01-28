define(["require", "knockout", "handlers/general", "helpers/KoComponentViewModel"], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel");

	var PresetDropdownListViewModel = general.extendClass(KoComponentViewModel, function PresetDropdownListViewModel() {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = parent.Data;

		function init(settings) {
			parent.init.call(self, settings);

			setObservables();
			setInitialData(settings);
		}

		function setInitialData(presetData) {
			data.category = presetData.data();
			data.selectedPreset = presetData.selected();
			data.key = presetData.data().Key.toLowerCase();
		}

		function setObservables() {
			data.isVisible = ko.observable(false);
		}

		function toggleVisibility() {
			data.isVisible(!data.isVisible());
		}

		function selectPreset(groupedPreset) {
			data.isVisible(false);
			groupedPreset.Select(groupedPreset.Id);
			ko.postbox.publish("sub-tab-click");
		}

		function hide() {
			data.isVisible(false);
		}

		function dispose() {
			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			ToggleVisibility: toggleVisibility,
			SelectPreset: selectPreset,
			Hide: hide,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new PresetDropdownListViewModel();

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
