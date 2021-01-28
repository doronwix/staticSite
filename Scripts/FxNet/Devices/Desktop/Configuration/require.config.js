define(["require", "modules/environmentData", "global/UrlResolver", "fxnet/common/config/common.config"], function (
	require
) {
	return function () {
		var environmentData = require("modules/environmentData").get(),
			UrlResolver = require("global/UrlResolver"),
			appRelativePath = UrlResolver.getApplicationRelativePath(),
			staticFilePath = UrlResolver.getStaticFilePath(),
			version = "v=" + (environmentData.version || window.version || "");

		var coreAssetsPaths = {};

		var baseConfig = {
			onNodeCreated: function (node) {
				node.setAttribute("crossorigin", "anonymous");
			},
			urlArgs: version,
			baseUrl: UrlResolver.combine(UrlResolver.getStaticJSPath(), "scripts"),
			config: {
				text: {
					useXhr: function () {
						return true;
					},
				},
			},
			map: {
				"*": {
					jquery: "vendor/jquery-3.5.1",
					"vendor/jquery.signalR": "vendor/jquery.signalR-2.2.2.2",
				},
			},
			paths: generatePath(),
			waitSeconds: 0,
			deps: ["vendor/jquery-migrate-3.3.1"],
		};

		function generatePath() {
			var corePath = {
				knockout: "vendor/knockout-3.5.1",
				Q: "vendor/q",
				managers: "fxnet/uilayer/managers",
				devicemanagers: "fxnet/devices/desktop/uilayer/managers",
				widgets: "fxnet/uilayer/objects",
				devicewidgets: "fxnet/devices/desktop/uilayer/objects",
				generalmanagers: "fxnet/LogicLayer/GeneralManager",
				cachemanagers: "fxnet/logiclayer/cachemanagers",
				calculators: "fxnet/LogicLayer/LimitCalculator",
				userflow: "fxnet/logiclayer/userflows",
				withdrawal: "fxnet/logiclayer/withdrawal",
				modules: "fxnet/uilayer/modules",
				currentAppFolder: "fxnet/devices/desktop",
				LoadDictionaryContent: "FxNet/uilayer/modules/LoadDictionaryContent",
				viewmodels: "FxNet/uilayer/viewmodels",
				deviceviewmodels: "FxNet/devices/desktop/uilayer/viewmodels",
				deviceviews: "fxnet/devices/desktop/uilayer/views",
				devicecustommodules: "fxnet/devices/desktop/modules",
				payments: "FxNet/uilayer/viewmodels/payments",
				Dictionary: "fxnet/LogicLayer/GeneralManager/Dictionary",
				JSONHelper: "fxnet/common/utils/handlers/jsonhelper",
				dataaccess: "fxnet/dataaccesslayer",
				devicealerts: "fxnet/devices/desktop/uilayer/alerts",
				initdatamanagers: "fxnet/logiclayer/initialdatamanagers",
				configuration: "fxnet/devices/desktop/configuration",
				alerts: "fxnet/uilayer/alerts",
				handlers: "fxnet/common/utils/handlers",
				helpers: "fxnet/uilayer/uilayerhelpers",
				devicehelpers: "fxnet/devices/desktop/uilayer/uilayerhelpers",
				StateObject: "fxnet/uilayer/modules/StateObject",
				deepLinks: "FxNet/LogicLayer/DeepLink",
				extensions: "FxNet/Common/Utils/Extensions",
				enums: "FxNet/Common/constants/enums",
				constsenums: "fxnet/common/constants/consts",
				customEnums: "fxnet/devices/desktop/enums",
				ProChart_Loader: "AdvinionChart/ChartUI/init/prochart.loader.min",
				trackingIntExt: "tracking/internal",
				deposit: "FxNet/LogicLayer/Deposit",
				"partial-views": staticFilePath,
				controllers: appRelativePath,
				assets: UrlResolver.getAssetsPath(),
				webHtml: UrlResolver.combine(staticFilePath, "scripts/fxnet/devices/desktop/uilayer/views"),
				html: UrlResolver.combine(staticFilePath, "scripts/fxnet/uilayer/viewmodels"),
				emily: UrlResolver.combine(UrlResolver.getStaticJSPath(), "emily"),
				"fx-core-api": UrlResolver.combine(UrlResolver.getStaticJSPath(), "fx-core-api"),
			};

			return Object.assign(corePath, coreAssetsPaths);
		}

		requirejs.config(baseConfig);
	};
});
