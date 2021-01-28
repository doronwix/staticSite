define([
	"require",
	"knockout",
	"enums/enums",
	"helpers/KoComponentViewModel",
	"handlers/general",
], function SpinnerBoxDef(require) {
	var ko = require("knockout"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		general = require("handlers/general");

	var SpinnerBox = general.extendClass(KoComponentViewModel, function spinnerBoxViewModel() {
		return {
			isSpinnerVisible: ko.observable().subscribeTo(ePostboxTopic.SetSpinnerVisibility),
		};
	});

	var createViewModel = function () {
		var viewModel = new SpinnerBox();

		viewModel.init();

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
