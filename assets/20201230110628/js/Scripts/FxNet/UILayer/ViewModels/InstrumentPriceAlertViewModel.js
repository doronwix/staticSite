define([
	"require",
	"handlers/general",
	"cachemanagers/activelimitsmanager",
	"helpers/KoComponentViewModel",
	"knockout",
], function (require) {
	var activeLimitsManager = require("cachemanagers/activelimitsmanager"),
		ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel");

	var InstrumentPriceAlertViewModel = general.extendClass(KoComponentViewModel, function (params) {
		var self = this,
			parent = this.parent,
			Data = this.Data;

		if (!params.instrumentId) {
			throw new Error("Missing instrument id paramerter");
		}

		Data.isOn = params.isOnObservable || ko.observable();
		Data.isOn(activeLimitsManager.HasPriceAlerts(ko.unwrap(params.instrumentId)));

		function onChange() {
			Data.isOn(activeLimitsManager.HasPriceAlerts(ko.unwrap(params.instrumentId)));
		}

		activeLimitsManager.OnChange.Add(onChange);
		if (ko.isObservable(params.instrumentId)) {
			params.instrumentId.subscribe(function () {
				onChange();
			});
		}

		function dispose() {
			parent.dispose.call(self);
			activeLimitsManager.OnChange.Remove(onChange);
		}

		function onPriceAlertClick() {
			if (params.hasOwnProperty("onPriceAlertClick") && general.isFunctionType(params.onPriceAlertClick)) {
				params.onPriceAlertClick({ instrumentId: params.instrumentId });
			}
		}

		return {
			dispose: dispose,
			Data: Data,
			OnPriceAlertClick: onPriceAlertClick,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new InstrumentPriceAlertViewModel(params);
		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
