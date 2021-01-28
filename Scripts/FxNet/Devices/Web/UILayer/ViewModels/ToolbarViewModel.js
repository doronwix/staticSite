define("deviceviewmodels/ToolbarViewModel", [
	"require",
	"helpers/KoComponentViewModel",
	"handlers/general",
	"devicecustommodules/ToolbarModule"
], function ToolbarDef(require) {
	var general = require("handlers/general"),
		KoComponentViewModel = require('helpers/KoComponentViewModel'),
		toolbarModule = require("devicecustommodules/ToolbarModule");

	var ToolbarViewModel = general.extendClass(KoComponentViewModel, function ToolbarClass() {
		var self = this,
			parent = this.parent;
		
		function init() {
			toolbarModule.Init();
		}

		function dispose() {
			toolbarModule.dispose();
			parent.dispose.call(self);  // inherited from KoComponentViewModel
		}

		return {
			Init: init,
			dispose: dispose,
			ToolbarInfo: toolbarModule.ToolbarInfo,
			NewDealHandler: toolbarModule.NewDealHandler,
			NewLimitHandler: toolbarModule.NewLimitHandler,
			CloseDealHandler: toolbarModule.CloseDealHandler,
			OpenInDialog: toolbarModule.OpenInDialogDelegate
		};
	});

	var createViewModel = function (params) {
		var viewModel = new ToolbarViewModel();

		viewModel.Init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel
		}
	};
});
