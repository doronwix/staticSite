({
	baseUrl: "../../scripts/",
	paths: {
		"fxnet/fxnet": "fxnet/devices/desktop/fxnet",
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
		devicecustommodules: "fxnet/devices/desktop/modules",
		payments: "FxNet/uilayer/viewmodels/payments",
		Dictionary: "fxnet/LogicLayer/GeneralManager/Dictionary",

		JSONHelper: "fxnet/common/utils/handlers/jsonhelper",
		dataaccess: "fxnet/dataaccesslayer",
		devicealerts: "fxnet/devices/desktop/uilayer/alerts",
		deviceviews: "fxnet/devices/desktop/uilayer/views",
		initdatamanagers: "fxnet/logiclayer/initialdatamanagers",
		configuration: "fxnet/devices/desktop/configuration",
		alerts: "fxnet/uilayer/alerts",
		handlers: "fxnet/common/utils/handlers",
		helpers: "fxnet/uilayer/uilayerhelpers",
		devicehelpers: "fxnet/devices/desktop/uilayer/uilayerhelpers",
		StateObject: "fxnet/uilayer/modules/StateObject",
		deepLinks: "fxnet/LogicLayer/DeepLink",
		extensions: "fxnet/Common/Utils/Extensions",
		enums: "fxnet/Common/constants/enums",
		tutorials: "tutorials",
		constsenums: "fxnet/common/constants/consts",
		customEnums: "fxnet/devices/desktop/enums",
		ProChart_Loader: "AdvinionChart/ChartUI/init/prochart.loader.min",
		trackingIntExt: "Tracking/Internal",
		deposit: "FxNet/LogicLayer/Deposit",
		CreditCard: "FxNet/LogicLayer/Deposit/CreditCard/CreditCard",
	},
	map: {
		"*": {
			jquery: "vendor/jquery-3.5.1",
			"vendor/jquery.signalR": "vendor/jquery.signalR-2.2.2.2",
			"generalmanagers/ErrorManager": "fxnet/devices/desktop/logiclayer/generalmanager/errormanager",
		},
	},
	modules: [
		{
			name: "preloader-desktop",
			include: [
				"vendor/require",
				"fxnet/preloader",
				"fxnet/devices/desktop/configuration/require.config",
				"fxnet/devices/desktop/configuration/app",
			],
			create: true,
			insertRequire: ["fxnet/preloader"],
		},
	],

	mainConfigFile: "../../scripts/fxnet/common/config/common.config.js",

	bundlesConfigOutFile: "./fxnet/common/config/bundles.desktop.config.js",
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
