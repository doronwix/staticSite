/* global eStartSpinFrom */
define(["require", "handlers/general", "helpers/KoComponentViewModel", "deviceviewmodels/WalletModule"], function (
	require
) {
	var general = require("handlers/general"),
		WalletModule = require("deviceviewmodels/WalletModule"),
		KoComponentViewModel = require("helpers/KoComponentViewModel");

	var WalletViewModel = general.extendClass(KoComponentViewModel, function WalletViewModel() {
		var self = this,
			parent = this.parent,
			data = this.Data;

		function init() {
			parent.init.call(self);

			data.WalletInfo = WalletModule.WalletInfo;
			data.ViewProperties = WalletModule.ViewProperties;

			WalletModule.Init();
		}

		function dispose() {
			WalletModule.Dispose();
			parent.dispose.call(self);
		}

		return {
			Data: data,
			Init: init,
			dispose: dispose,
		};
	});

	var createViewModel = function () {
		var viewModel = new WalletViewModel();

		viewModel.Init();

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
