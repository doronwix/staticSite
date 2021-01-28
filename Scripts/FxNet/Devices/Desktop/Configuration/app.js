define([
	"require",
	"fxnet/fxnet",
	"generalmanagers/ErrorManager",
	"modules/KoComponentLoader",
	"LoadDictionaryContent!contentdata",
	"handlers/general",
	"devicemanagers/AlertsManager",
	"customEnums/AlertEnums",
], function (require) {
	var FxNet = require("fxnet/fxnet"),
		ErrorManager = require("generalmanagers/ErrorManager"),
		KoComponentLoader = require("modules/KoComponentLoader"),
		general = require("handlers/general");

	function startApp(currentForm, callback) {
		window.onerror = ErrorManager.onException;
		requirejs.onError = ErrorManager.onRequireError;

		if (!general.isFunctionType(callback)) {
			callback = function () {};
		}

		// register custom component loader
		KoComponentLoader.Register();

		FxNet.Init(currentForm).done(callback);
	}

	return startApp;
});
