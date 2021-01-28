define("initdatamanagers/Customer", [
	"require",
	"knockout",
	"handlers/general",
	"initdatamanagers/SymbolsManager",
	"configuration/Containers",
	"dataaccess/dalcustomer",
	"global/UrlResolver",
	"JSONHelper",
	"Q",
	"handlers/Logger",
], function TCustomer(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		logger = require("handlers/Logger"),
		SymbolsManager = require("initdatamanagers/SymbolsManager"),
		Containers = require("configuration/Containers"),
		dalCustomer = require("dataaccess/dalcustomer"),
		JSONHelper = require("JSONHelper"),
		urlResolver = require("global/UrlResolver"),
		Q = require("Q");

	var prop = {},
		_isAuthenticated = false,
		signalsPermissionsPromise = Q.defer();

	function init(profileCustomer, defaultFirstPage, homePage, sjcKey) {
		prop.brokerType = "3";
		prop.email = profileCustomer.Email;
		prop.minPctEQXP = profileCustomer.MinPctEQXP;
		prop.selectedCcyId = ko.observable(profileCustomer.AccountBaseSymbol);
		prop.baseCcyId = ko.observable(profileCustomer.AccountBaseSymbol);
		prop.defaultCcy = ko.observable(SymbolsManager.GetTranslatedSymbolById(profileCustomer.AccountBaseSymbol));
		prop.sjcKey = sjcKey;

		prop.selectedCcyName = ko.computed(function () {
			return SymbolsManager.GetTranslatedSymbolById(prop.selectedCcyId());
		});

		prop.baseCcyName = ko.computed(function () {
			return SymbolsManager.GetTranslatedSymbolById(prop.baseCcyId());
		});

		prop.accountNumber = profileCustomer.AccountNumber;
		prop.language = profileCustomer.Language;
		prop.dealPermit = profileCustomer.DealPermit;

		prop.isQA = profileCustomer.isQA;
		prop.countryID = profileCustomer.CountryID;
		prop.brokerID = profileCustomer.BrokerID;
		prop.shareStatus = profileCustomer.StocksTradingPermission;
		prop.futureStatus = profileCustomer.FuturesTradingPermission;
		prop.interactiveMessagesToken = profileCustomer.InteractiveMessagesToken;
		prop.interactiveMessagesUrl = profileCustomer.InteractiveMessagesUrl;
		prop.ratesServiceHost = profileCustomer.RatesServiceHost;
		prop.hasTransactionsReport = profileCustomer.HasTransactionsReport;

		prop.tradingPermissions = setStartUpAndMainPageAndTradingPermissions(defaultFirstPage, homePage);
		prop.dateAdded = general.str2Date(profileCustomer.DateAdded);
		prop.isLive = Boolean.parse(profileCustomer.IsLive);
		prop.isPending = Boolean.parse(profileCustomer.IsPending);

		prop.isAccountExpired = profileCustomer.IsAccountExpired;
		prop.customerType = profileCustomer.AccountType;

		prop.SAProcess = profileCustomer.SAProcess;
		prop.serial = profileCustomer.Serial;
		prop.brokerName = profileCustomer.BrokerName;
		prop.brokerAllowLimitsOnNoRates = profileCustomer.BrokerAllowLimitsOnNoRates;
		prop.LiquidationPercentage = profileCustomer.LiquidationPercentage;
		prop.isDemo = Boolean.parse(profileCustomer.IsDemo);
		prop.hasActiveDemo = Boolean.parse(profileCustomer.HasActiveDemo);

		prop.signalsEndDate = profileCustomer.SignalsEndDate;
		prop.hasWeightedVolumeFactor = profileCustomer.HasWeightedVolumeFactor;
		prop.autoConvert = profileCustomer.AutoConvert;

		prop.isOvernightOnForex = profileCustomer.IsOvernightOnForex;

		prop.userName = profileCustomer.UserName;
		prop.firstName = profileCustomer.FirstName;
		prop.lastName = profileCustomer.LastName;
		prop.agreementType = profileCustomer.AgreementType;
		prop.signAgreementDate = general.str2Date(profileCustomer.SignAgreementDate);
		prop.hasMissingInformation = Boolean.parse(profileCustomer.HasMissingInformation);
		prop.sjcKey = profileCustomer.sjcKey;

		prop.idByShufti = profileCustomer.IDByShufti;
		prop.ubByShufti = profileCustomer.UBByShufti;

		prop.abTestings = {
			groupsNames: profileCustomer.ABTestings.map(function (ab) {
				return ab.GroupName;
			}),
			testsNames: profileCustomer.ABTestings.map(function (ab) {
				return ab.TestName;
			}),
			configuration: profileCustomer.ABTestings.reduce(function (accumulator, ab) {
				return Object.assign(accumulator, JSON.parse(ab.Configuration));
			}, {}),
		};

		if (systemInfo.isNative && prop.abTestings.configuration["fx-feedback"] !== false) {
			prop.abTestings.configuration["fx-feedback"] = true;
		}

		// for smart client
		prop.compliance = profileCustomer.compliance;
		prop.maintenanceMarginPercentage = profileCustomer.maintenanceMargin;

		_isAuthenticated = true;

		prop.isAutologin = urlResolver.getIsAutoLogin();

		prop.isSeamless = profileCustomer.IsSeamless;

		prop.csmTrace = ko.observable(false);

		updateSignalsPermissions().done();
		updateShouldChangePassword();
	}

	function isAuthenticated() {
		return _isAuthenticated;
	}

  function hasAbTestConfig(propertyName) {
	  return !!prop.abTestings.configuration[propertyName];
  }


	// mainPage: the main form based on client permission
	// startup form - the start up form based on the default form saved in database
	// defaultFirstPage - the saved page on the custoemr profile, should not be used other than this mapping
	function setStartUpAndMainPageAndTradingPermissions(defaultFirstPage, homePage) {
		var tradingPermissions = {};

		if (!homePage) {
			homePage = Containers.MainForm;
		}

		//default not exists in client profile
		if (defaultFirstPage === 0) {
			defaultFirstPage = Containers.MainForm;
		}

		prop.mainPage = homePage;
		tradingPermissions.hasTransactionsReport = prop.hasTransactionsReport == "True";

		tradingPermissions.isOnlyForexCustomer = true;
		prop.startUpForm = defaultFirstPage;

		return tradingPermissions;
	}

  function isAutologin() {
      return !!prop.isAutologin;
  }


	function logout() {
		_isAuthenticated = false;
	}

	function hasMissingAgreement() {
		return prop.signAgreementDate === null && prop.agreementType === 0;
	}

	function updateMissingInformation(customerUpdated) {
		updateCustomerDetails(customerUpdated);
	}

	function updateCustomerDetails(customerUpdated) {
		prop.userName = customerUpdated.UserName;
		prop.fullName = customerUpdated.FullName;
		prop.personalNumber = customerUpdated.PersonalNumber;
		prop.dateOfBirth = customerUpdated.DateOfBirth;
		prop.agreementType = customerUpdated.AgreementType;
		prop.signAgreementDate = general.str2Date(customerUpdated.SignAgreementDate);
		prop.hasMissingInformation = Boolean.parse(customerUpdated.HasMissingInformation);
		prop.idNumber = customerUpdated.IDNumber;
		prop.address = customerUpdated.Address;
	}

	function updateHasMissingInformation() {
		dalCustomer
			.HasMissingInformation()
			.then(function (response) {
				var parsedResponse = JSONHelper.STR2JSON("customer:updateHasMissingInformation", response);
				prop.hasMissingInformation = parsedResponse.HasMissingInformation;
			})
			.done();
	}

	function updateSignalsPermissions() {
		return dalCustomer.getCustomerSignalsPermissions().then(setSignalsPermissions);
	}

	function setSignalsPermissions(signalsData) {
		prop.AreSignalsAllowed = signalsData && signalsData.status == eResult.Success && signalsData.result == "True";
		prop.signalsEndDate = prop.AreSignalsAllowed ? general.str2Date(signalsData.signalsEndDate).ExtractDate() : "";
		signalsPermissionsPromise.resolve();
	}

	function updateShouldChangePassword() {
		dalCustomer.GetShouldChangePassword().then(setShouldChangePassword).done();
	}

	function setShouldChangePassword(data) {
		if (!general.isNullOrUndefined(data)) {
			prop.showSuggestionChangePassword = data.ShouldChangePassword;
		} else {
			logger.warn("Customer", "Cannot set ShouldChangePassword because it is not available");
		}
	}

	function getCustomerDetails() {
		return dalCustomer.GetCustomerDetails();
	}

	function getCustomer() {
		return dalCustomer.getCustomer();
	}

	function getToken() {
		return dalCustomer.GetToken();
	}

  function initialScmmData(callback) {
    return dalCustomer.InitialScmmData(callback);
  }
	var module = (window.$customer = {
		prop: prop,
		Init: init,
		isAuthenticated: isAuthenticated,
		isAutologin: isAutologin,
		Logout: logout,
		HasMissingAgreement: hasMissingAgreement,
		HasAbTestConfig: hasAbTestConfig,
		UpdateMissingInformation: updateMissingInformation,
		UpdateHasMissingInformation: updateHasMissingInformation,
		SignalsPermissionsReady: signalsPermissionsPromise.promise,
		GetCustomer: getCustomer,
		GetCustomerDetails: getCustomerDetails,
		GetToken: getToken,
    InitialScmmData: initialScmmData
	});

	return module;
});
