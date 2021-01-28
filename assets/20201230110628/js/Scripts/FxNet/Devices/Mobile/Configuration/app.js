define([
	"require",
	"knockout",
	"Q",
	"fxnet/fxnet",
	"generalmanagers/ErrorManager",
	"modules/KoComponentLoader",
	"currentAppFolder/Configuration/config",
	"LoadDictionaryContent!contentdata",
], function (require) {
	var ko = require("knockout"),
		Q = require("Q"),
		FxNet = require("fxnet/fxnet"),
		ErrorManager = require("generalmanagers/ErrorManager"),
		KoComponentLoader = require("modules/KoComponentLoader"),
		config = require("currentAppFolder/Configuration/config");

	function startApp(components) {
		window.onerror = ErrorManager.onException;
		requirejs.onError = ErrorManager.onRequireError;
		window.componentsLoaded = ko.observable(false);
		var isReact = false;

            if (isReact){
			require(["fxnet/Store", "modules/ReactComponentLoader"], function (store, ReactComponentLoader) {
				ReactComponentLoader.Register(store);
			});
		}

		KoComponentLoader.Register();
		FxNet.Init()
			.then(function () {
				var promisesArr = [];
				for (var i = 0, length = components.length; i < length; i++) {
					if (KoComponentLoader.Exists(components[i])) {
						promisesArr.push(KoComponentLoader.Preload(components[i]));
					}
				}
				return Q.all(promisesArr).then(function () {
					window.componentsLoaded(true);
				});
			})
			.done();
	}

	return startApp.bind(null, config.componentsToPreload || []);
});
