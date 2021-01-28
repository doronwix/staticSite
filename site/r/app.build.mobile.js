({
	baseUrl: "../../scripts/",
	paths: {
		knockout: "vendor/knockout-3.5.1",
		Q: "vendor/q",
		managers: "fxnet/uilayer/managers",
		devicemanagers: "fxnet/devices/mobile/uilayer/managers",
		widgets: "fxnet/uilayer/objects",
		devicewidgets: "fxnet/devices/mobile/uilayer/objects",
		generalmanagers: "fxnet/LogicLayer/GeneralManager",
		cachemanagers: "fxnet/logiclayer/cachemanagers",
		calculators: "fxnet/LogicLayer/LimitCalculator",
		userflow: "fxnet/logiclayer/userflows",
		withdrawal: "fxnet/logiclayer/withdrawal",
		modules: "fxnet/uilayer/modules",
		devicecustommodules: "fxnet/devices/mobile/modules",
		currentAppFolder: "fxnet/devices/mobile",
		LoadDictionaryContent: "FxNet/uilayer/modules/LoadDictionaryContent",
		viewmodels: "FxNet/uilayer/viewmodels",
		deviceviewmodels: "FxNet/devices/mobile/uilayer/viewmodels",
		devicecustommodules: "fxnet/devices/mobile/modules",
		payments: "FxNet/uilayer/viewmodels/payments",
		Dictionary: "fxnet/LogicLayer/GeneralManager/Dictionary",

		JSONHelper: "fxnet/common/utils/handlers/jsonhelper",
		dataaccess: "fxnet/dataaccesslayer",
		devicealerts: "fxnet/devices/mobile/uilayer/alerts",
		deviceviews: "fxnet/devices/mobile/uilayer/views",
		initdatamanagers: "fxnet/logiclayer/initialdatamanagers",
		configuration: "fxnet/devices/mobile/configuration",
		alerts: "fxnet/uilayer/alerts",
		handlers: "fxnet/common/utils/handlers",
		helpers: "fxnet/uilayer/uilayerhelpers",
		devicehelpers: "fxnet/devices/mobile/uilayer/uilayerhelpers",
		StateObject: "fxnet/uilayer/modules/StateObject",
		deepLinks: "fxnet/LogicLayer/DeepLink",
		extensions: "fxnet/Common/Utils/Extensions",
		enums: "fxnet/Common/constants/enums",
		tutorials: "tutorials",
		constsenums: "fxnet/common/constants/consts",
		customEnums: "fxnet/devices/mobile/enums",
		ProChart_Loader: "AdvinionChart/ChartUI/init/prochart.loader.min",
		trackingIntExt: "Tracking/Internal",
		deposit: "FxNet/LogicLayer/Deposit",
		CreditCard: "FxNet/LogicLayer/Deposit/CreditCard/CreditCard",
	},
	map: {
		"*": {
			jquery: "vendor/jquery-3.5.1",
			"vendor/jquery.signalR": "vendor/jquery.signalR-2.2.2.2",
		},
	},
	modules: [
		{
			name: "preloader-mobile",
			include: [
				"vendor/require",
				"fxnet/preloader",
				"fxnet/devices/mobile/configuration/require.config",
				"handlers/websocketconnection",
				"fxnet/devices/mobile/configuration/app",
			],
			create: true,
			insertRequire: ["fxnet/preloader"],
		},
	],

	mainConfigFile: "../../scripts/fxnet/common/config/common.config.js",
	bundlesConfigOutFile: "./fxnet/common/config/bundles.mobile.config.js",
	logLevel: 2,
	generateSourceMaps: true,
	preserveLicenseComments: false,
	// test options
	skipDirOptimize: true,
	keepBuildDir: true,
	allowSourceOverWrites: true,

	// new keys
	removeCombined: true,

	// this was changed
	optimize: "none",

	writeBuildTxt: false,
});
