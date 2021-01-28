/* global eDealerParams Preloader*/
define("initdatamanagers/InitialDataManager", [
	"require",
	"Q",
	"enums/enums",
	"handlers/general",
	"generalmanagers/ErrorManager",
	"handlers/Logger",
	"JSONHelper",
	"dataaccess/dalInitialData",
	"dataaccess/dalCommon",
	"initdatamanagers/Customer",
	"initdatamanagers/SymbolsManager",
	"managers/CustomerProfileManager",
	"initdatamanagers/InstrumentsManager",
	"configuration/initconfiguration",
	"modules/systeminfo",
	"devicemanagers/LocalStoreDoubleTabsListener",
	"StateObject!PerformaceEvents",
	"StateObject!DealerParams",
	"handlers/Delegate",
	"fxnet/preloader",
], function (require) {
	var Q = require("Q"),
		general = require("handlers/general"),
		ErrorManager = require("generalmanagers/ErrorManager"),
		Logger = require("handlers/Logger"),
		dalCommon = require("dataaccess/dalCommon"),
		dalInitialData = require("dataaccess/dalInitialData"),
		JSONHelper = require("JSONHelper"),
		InstrumentsManager = require("initdatamanagers/InstrumentsManager"),
		Customer = require("initdatamanagers/Customer"),
		CustomerProfileManager = require("managers/CustomerProfileManager"),
		SymbolsManager = require("initdatamanagers/SymbolsManager"),
		applicationConfiguration = require("configuration/initconfiguration").ApplicationConfiguration,
		systemInfo = require("modules/systeminfo"),
		localStoreDoubleTabsListener = require("devicemanagers/LocalStoreDoubleTabsListener"),
		stateObject = require("StateObject!PerformaceEvents"),
		stateObjectDealerParams = require("StateObject!DealerParams"),
		Preloader = require("fxnet/preloader"),
		delegate = require("handlers/Delegate");

	function InitialDataManager(timeout) {
		var prop = {
				profileCustomer: null,
				profileInstrument: null,
				defaultFirstPage: -1,
				initialScreen: {
					screenId: -1,
				},
				csmg: "",
				ready: false,
			},
			onTimestamp = new delegate(),
			onInitialScreens = new delegate(),
			InitialDataError = ErrorManager.createErrorType("InitialDataError", function errorHandler() {
				// this keyword refers to the istance of thrown InitialDataError
				Logger.log("TDALClientState", this.getFullExceptionMessage(), function () {
					dalCommon.Logout(eLoginLogoutReason.initialDataManager_dataError);
				});
			});

		function checkInitialData() {
			var defer = Q.defer();

			function checkPreloader() {
				if (Preloader.DataObjects.initialDataReady) {
					defer.resolve(Preloader.DataObjects.initialData);
					return;
				}

				Preloader.SetInitialDataLoadEvent(checkPreloader);
			}

			checkPreloader();

			return defer.promise;
		}

		function loadData() {
			onTimestamp.Invoke(eFxNetEvents.InitialDataStart);

			return checkInitialData().then(setInitialData).then(checkSetInitialDataResult).finally(endInitialData);
		}

		function checkSetInitialDataResult(initialDataSuccess) {
			if (!initialDataSuccess) {
				throw new InitialDataError("ServerError: Initial data could not be loaded");
			}

			prop.ready = true;
		}

		function endInitialData() {
			onTimestamp.Invoke(eFxNetEvents.InitialDataEnd);
		}

		function loadOnlySymbols(onSymbolLoadComplete) {
			dalInitialData
				.GetData()
				.then(parseInitialDataServerResponse)
				.then(function setSymbolsData(data) {
					if (data.status == "ServerError") {
						dalCommon.Logout(eLoginLogoutReason.initialDataManager_symbolsDataError);

						return false;
					} else {
						var newSystemInfo = data.systemInfo || {};
						newSystemInfo.clientApplicationParams = data.clientParams || {};

						systemInfo.save(newSystemInfo);

						return true;
					}
				})
				.then(function checkSymbolData(symbolsDataSuccess) {
					if (symbolsDataSuccess && general.isFunctionType(onSymbolLoadComplete)) {
						onSymbolLoadComplete();
					} else {
						throw new InitialDataError("ServerError: Initial data could not be loaded");
					}
				})
				.done();
		}

		function parseInitialDataServerResponse(response) {
			if (general.isStringType(response)) {
				return JSONHelper.STR2JSON("InitialDataManager/onLoadComplete", response, eErrorSeverity.high);
			}

			return response || {};
		}

		function saveSystemInfo(initialData) {
			var systemInfoValue;
			var countryArray = parseInitialDataServerResponse(initialData.Countries);

			systemInfoValue = initialData.Main.systemInfo || {};
			systemInfoValue.clientApplicationParams = initialData.Main.clientParams || {};
			systemInfoValue.slaTimeout = 1000; // It could be fetched from DB
			systemInfoValue.limitRatePercentage = parseFloat(systemInfoValue.limitRatePercentage || "0.5");
			systemInfoValue.instruments = parseInitialDataServerResponse(initialData.Instruments);
			systemInfoValue.countries = getCountriesAsAnObject(countryArray);
			systemInfoValue.uiExclusionCountries = getCountriesAsAnObject(
				countryArray.filter(function (country) {
					return country[eCountryAttributes.IsActive] === 0;
				})
			);
			systemInfoValue.symbols = parseInitialDataServerResponse(initialData.Symbols);

			systemInfo.save(systemInfoValue);
		}

		function setInitialData(data) {
			var parsedData = parseInitialDataServerResponse(data);

			if (parsedData.Main.status == "ServerError") {
				return false;
			}

			saveSystemInfo(parsedData);

			stateObjectDealerParams.set(eDealerParams.DealerCurrency, window.environmentData.dealerCurrency);
			stateObjectDealerParams.set(
				eDealerParams.DealerAdvancedWalletView,
				window.environmentData.dealerAdvancedWalletView
			);

			setPersonalInfo(parsedData.Main.personalInfo, parsedData.Symbols);

			stateObject.update("InitialDataLoadCompleted", parsedData.Main.initialServerTime);

			return true;
		}

		function getCountriesAsAnObject(countriesArray) {
			var countriesObject = {};

			for (var i = 0, length = countriesArray.length; i < length; i++) {
				countriesObject[countriesArray[i][eCountryAttributes.Id]] = countriesArray[i][eCountryAttributes.Name];
			}

			return countriesObject;
		}

		function setUiVersion(personalInfo) {
			if (applicationConfiguration.applicationType === eApplicationTypes.Web) {
				var prevMainForm = 1;

				personalInfo.profileCustomer.dealSlipVersion = eUIVersion.Default;

				if (personalInfo.profileCustomer.homePage === prevMainForm) {
					personalInfo.profileCustomer.homePage = eForms.Deals;
				}

				if (personalInfo.defaultFirstPage === prevMainForm) {
					personalInfo.defaultFirstPage = eForms.Deals;
				}
			} else {
				personalInfo.profileCustomer.homePage = eForms.Quotes;
			}

			personalInfo.profileCustomer.isAllowedSwitchView = 0;
		}

		function setPersonalInfo(pInfo, symbols) {
			var personalInfo = {
				customer: {},
				defaultFirstPage: 0,
				profileCustomer: {},
				profileInstrument: {},
				customQuotesUIOrder: [],
				initialScreen: [],
				initialQuotesUIOrder: [],
				availableScreens: [],
			};

			Object.assign(personalInfo, pInfo || {});

			setUiVersion(personalInfo);

			prop.profileCustomer = personalInfo.profileCustomer;
			prop.profileInstrument = personalInfo.profileInstrument;
			prop.defaultFirstPage = personalInfo.defaultFirstPage;
			prop.csmg = personalInfo.csmg;
			prop.initialScreen.screenId = personalInfo.initialScreen;
			prop.customQuotesUIOrder = personalInfo.customQuotesUIOrder;

			onInitialScreens.Invoke(personalInfo.availableScreens);

			SymbolsManager.Init(symbols || []);
			Customer.Init(personalInfo.customer, prop.defaultFirstPage, prop.profileCustomer.homePage);

			CustomerProfileManager.Init(
				prop.profileCustomer,
				Customer.prop.startUpForm,
				prop.profileInstrument,
				prop.initialScreen.screenId
			);
			CustomerProfileManager.Events.onStartUpFormChanged.Add(function (value) {
				Customer.prop.startUpForm = value;
				prop.defaultFirstPage = value;
			});
			CustomerProfileManager.Events.onInitialScreenChanged.Add(function (value) {
				prop.initialScreen.screenId = value;
			});

			Customer.prop.selectedCcyId(
				stateObjectDealerParams.get(eDealerParams.DealerCurrency) ||
					CustomerProfileManager.ProfileCustomer().displaySymbol ||
					Customer.prop.selectedCcyId()
			);

			InstrumentsManager.Init({
				customerType: Customer.prop.customerType,
				hasWeightedVolumeFactor: Customer.prop.hasWeightedVolumeFactor,
				isOvernightOnForex: Customer.prop.isOvernightOnForex,
				customUiOrder: personalInfo.customQuotesUIOrder,
				initialUiOrder: personalInfo.initialQuotesUIOrder,
				initialScreenId: prop.initialScreen.screenId,
				initialProfileInstrument: prop.profileInstrument,
			});

			localStoreDoubleTabsListener(prop.csmg, timeout);
		}

		function updateInitialScreen(screenId) {
			prop.initialScreen.screenId = screenId;
		}

		return {
			LoadData: loadData,
			LoadOnlySymbols: loadOnlySymbols,
			UpdateInitialScreen: updateInitialScreen,
			prop: prop,
			OnInitialScreens: onInitialScreens,
			OnTimestamp: onTimestamp,
		};
	}

	window.$initialDataManager = new InitialDataManager(applicationConfiguration.doubleTabListenInterval);

	return window.$initialDataManager;
});
