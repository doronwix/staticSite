define("modules/PresetsManager", [
	"require",
	"Q",
	"handlers/general",
	"initdatamanagers/Customer",
	"generalmanagers/ErrorManager",
	"handlers/Logger",
	"dataaccess/dalInstruments",
	"global/UrlResolver",
	"devicemanagers/StatesManager",
], function PresetsManager(require) {
	var Q = require("Q"),
		general = require("handlers/general"),
		Customer = require("initdatamanagers/Customer"),
		ErrorManager = require("generalmanagers/ErrorManager"),
		Logger = require("handlers/Logger"),
		dalInstruments = require("dataaccess/dalInstruments"),
		StatesManager = require("devicemanagers/StatesManager"),
		UrlResolver = require("global/UrlResolver");

	var presetsRefreshTimeoutMiliseconds = 5 * 60 * 1000,
		defer = Q.defer(),
		isStarted = false,
		availableScreens = [],
		hasData = defer.promise,
		presetInstrumentsList = [],
		onPresetsUpdated = new TDelegate();

	var QuotesPresetsError = ErrorManager.createErrorType("QuotesPresetsError", function errorHandler() {
		// this keyword refers to the istance of thrown InitialDataError
		Logger.log("TDALClientState", this.getFullExceptionMessage(), function () {});
	});

	function load() {
		loadPresets(Customer.prop).then(processPresets).catch(onError).finally(setPresetsRefreshTimer).done();
	}

	function onError(error) {
		throw new QuotesPresetsError("PresetsManager: Error on load/parse presets: " + error.message);
	}

	function loadPresets(customerProperties) {
		return dalInstruments.GetPresets({
			folderId: getFolderId(),
			brokerId: customerProperties.brokerID,
			futuresPermission: customerProperties.futureStatus,
			stocksPermission: customerProperties.shareStatus,
		});
	}

	function getFolderId() {
		var folder = StatesManager.States.Folder;
		var folderId;

		if (!general.isNullOrUndefined(folder) && !general.isNullOrUndefined(folder()) && folder() !== -1) {
			folderId = folder();
		} else {
			folderId = UrlResolver.getFolderForInstruments();
		}

		return folderId;
	}

	function processPresets(presets) {
		if (!presets) {
			throw new QuotesPresetsError("ServerError: Presets could not be loaded");
		}

		var cfdScreens = [];

		for (var key in presets) {
			if (presets.hasOwnProperty(key)) {
				var presetId = parseInt(key);
				if (isNaN(presetId)) {
					continue;
				}

				cfdScreens.push(presetId);
			}
		}

		setPresetLoaded(presets, cfdScreens);
	}

	function setPresetsRefreshTimer() {
		setTimeout(load, presetsRefreshTimeoutMiliseconds);
	}

	function getDefaultCfdScreenId() {
		var cfdScreens = this.GetAvailableScreens();

		return getCfdDefaultScreenId(cfdScreens);
	}

	function setAvailableScreens(screens) {
		availableScreens = availableScreens.concatUnique(screens);
	}

	function getAvailableScreens() {
		return availableScreens || [];
	}

	function getPresetInstruments() {
		return presetInstrumentsList;
	}

	function setPresetLoaded(presets, cfdScreens) {
		presetInstrumentsList = Object.assign({}, presets);
		setAvailableScreens(cfdScreens);

		onPresetsUpdated.Invoke(presets, cfdScreens);

		defer.resolve(this);
	}

	function start() {
		if (!isStarted) {
			load();
		}

		isStarted = true;
	}

	function getCfdDefaultScreenId(cfdScreens) {
		if (0 <= cfdScreens.indexOf(ePresetType.PresetMostPopular)) {
			return ePresetType.PresetMostPopular;
		}

		if (0 <= cfdScreens.indexOf(ePresetType.PresetMostPopularWithoutShares)) {
			return ePresetType.PresetMostPopularWithoutShares;
		}

		if (0 <= cfdScreens.indexOf(ePresetType.PresetMostPopularWithoutFutures)) {
			return ePresetType.PresetMostPopularWithoutFutures;
		}

		if (0 <= cfdScreens.indexOf(ePresetType.PresetMostPopularWithoutFuturesWithoutShares)) {
			return ePresetType.PresetMostPopularWithoutFuturesWithoutShares;
		}

		if (0 <= cfdScreens.indexOf(ePresetType.PresetMostPopularCurrencies)) {
			return ePresetType.PresetMostPopularCurrencies;
		}

		return -1;
	}

	return {
		HasData: hasData,
		GetDefaultCFDScreenId: getDefaultCfdScreenId,
		SetAvailableScreens: setAvailableScreens,
		GetAvailableScreens: getAvailableScreens,
		Start: start,
		OnPresetsUpdated: onPresetsUpdated,
		GetPresetInstruments: getPresetInstruments,
	};
});
