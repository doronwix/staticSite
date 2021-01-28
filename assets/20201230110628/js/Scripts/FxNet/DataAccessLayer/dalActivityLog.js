var dalActivityLog = function (ErrorManager, general) {
	//---------------------------------------------------------
	// loadActivityLog
	//---------------------------------------------------------

	// var loadActivityLog = function (FilterTypes, From, To, Page, PageSize, OnLoadComplete) {
	var loadActivityLog = function (params, onLoadComplete) {
		var ajaxer = new TAjaxer();

		params = params || {};

		ajaxer.post(
			"TDALHistoricalData/loadActivityLog",
			"api/activitylog/GetData",
			general.urlEncode(params),
			onLoadComplete,
			function () {
				ErrorManager.onError("TDALHistoricalData/loadActivityLog", "", eErrorSeverity.medium);
			},
			0
		);
	};

	return {
		LoadActivityLog: loadActivityLog,
	};
};

define(["generalmanagers/errormanager", "handlers/general"], function (Errormanager, general) {
	return dalActivityLog(Errormanager, general);
});
