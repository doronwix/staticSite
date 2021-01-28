/* global ProChart_Loader Logger */
define("managers/AdvinionChart/AdvinionChartsManager", [
	"require",
	"Q",
	"knockout",
	"handlers/Logger",
	"ProChart_Loader",
	"handlers/general",
	"modules/ThemeSettings",
], function AdvinionChartsManagerDef(require) {
	var Q = require("Q"),
		ko = require("knockout"),
		logger = require("handlers/Logger"),
		prochart_loader = require("ProChart_Loader"),
		ThemeSettings = require("modules/ThemeSettings"),
		general = require("handlers/general");

	var AdvinionChartsManager = (function AdvinionChartsManagerClass() {
		var loadDefer = Q.defer(),
			prochartloader = null,
			isChartManagerLoaded = ko.observable(false);

		function init(advinionChartConfiguration) {
			var selectedTheme = ThemeSettings.GetTheme();
			advinionChartConfiguration = advinionChartConfiguration || {};

			prochartloader = prochart_loader();
			prochartloader.init.rootpath = advinionChartConfiguration.rootPath;
			prochartloader.init.loadercss.push(
				advinionChartConfiguration.cssLoaderPath + "chart." + selectedTheme + ".css"
			);

			prochartloader.navigator.properties.xdrMinIE = 11;

			prochartloader.init.timeupdateVersioncore = "time456";
			prochartloader.init.timeupdateVersiongui = "time456";

			prochartloader.init.loaderremovefrom.push({ key: "jquery.ui" });
			prochartloader.init.getrequirejs = false;

			prochartloader.LoaderInitComplete = onLoaderInitComplete;

			prochartloader.init.cache = true;
			prochartloader.LoaderInitCombine(); // - for production / qa - chart files loaded as a bundle
		}

		function onLoaderInitComplete() {
			if (general.isFunctionType(window.ProChart_InitLayout)) {
				// Resolve the load promise, it can be used to delay any chart operation until the Charts are loaded
				loadDefer.resolve();
				isChartManagerLoaded(true);
			} else {
				loadDefer.reject();
				logger.log(
					"managers/AdvinionChart/AdvinionChartsManager",
					"ProChart_Loader: Fail Load/Init chart",
					null,
					eErrorSeverity.critical
				);
			}
		}

		return {
			Init: init,
			IsChartManagerLoaded: isChartManagerLoaded,
			IsLoaded: loadDefer.promise,
			ServerPeriods: null,
		};
	})();

	return AdvinionChartsManager;
});
