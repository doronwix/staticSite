define("trackingIntExt/TrackingData", [
	"require",
	"knockout",
	"handlers/general",
	"initdatamanagers/Customer",
	"devicemanagers/StatesManager",
	"modules/systeminfo",
	"JSONHelper",
	"handlers/Cookie",
	"global/apiIM",
	"handlers/Logger",
	"tracking/TrackingCommonData",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		customer = require("initdatamanagers/Customer"),
		statesManager = require("devicemanagers/StatesManager"),
		systemInfo = require("modules/systeminfo"),
		JSONHelper = require("JSONHelper"),
		cookie = require("handlers/Cookie"),
		apiIM = require("global/apiIM"),
		logger = require("handlers/Logger"),
		TrackingCommonData = require("tracking/TrackingCommonData"),
		properties = {},
		nonTrackingProperties = {};

	function init() {
		properties = TrackingCommonData(FxNet.SessionStorage);
		updateStaticData();

		var cookieTracking = cookie.ReadCookie("TrackingData");

		if (!general.isNullOrUndefined(cookieTracking)) {
			var trackingData = JSON.parse(cookieTracking);

			Object.assign(properties, trackingData);
		}
	}

	function getProperties() {
		updateRealTimeData();
		return properties;
	}

	function getNonTrackingProperties() {
		return nonTrackingProperties;
	}

	function updateStaticData() {
		var countriesCollection = systemInfo.get("countries");

		properties.AccountNumber = customer.prop.accountNumber;
		properties.Broker = customer.prop.brokerName;
		properties.AccountType = customer.prop.customerType === eCustomerType.TradingBonus ? "Practice" : "Real";

		properties.SAProcess = customer.prop.SAProcess;
		properties.Serial = customer.prop.serial === 0 ? null : customer.prop.serial;
		properties.Country = countriesCollection[customer.prop.countryID];

		properties.GroupName = customer.prop.abTestings.groupsNames;
		properties.TestName = customer.prop.abTestings.testsNames;
	}

	function updateRealTimeData() {
		properties.AML = getAMLStatusName();

		properties.Currency = customer.prop.selectedCcyName();
		properties.FolderType = mapFolderTypeData(
			statesManager.States.FolderTypeId(),
			customer.prop.isLive,
			customer.prop.isPending
		);
	}

	function getErrorTrackingData() {
		var messageObj = {
			Domain: window.location.host,
			Broker: properties.Broker,
			Language: CookieHandler.ReadCookie("Language"),
			Country: properties.Country,
			AmlStatus: properties.AML,
			Browser: properties.Browser,
			OperatingSystem: properties.OS,
			ResolutionScreen: properties.ResolutionScreen,
			OsVersion: properties.OSVersion,
			BrowserVersion: properties.BrowserVersion,
			Device: properties.Device,
			TrackingSessionId: properties.TrackingSessionId,
		};

		return messageObj;
	}

	function updateScmmData() {
		customer.InitialScmmData(dataLoadCompleteFromScmm);
	}

	function dataLoadCompleteFromScmm(scmmResponse) {
		var scmmDataArray = JSONHelper.STR2JSON("TUserTracking.dataLoadCompleteFromScmm", scmmResponse);

		var scmmData = scmmDataArray[0];

		if (scmmData) {
			updateNonTrackingProperties(scmmData);
			removeObsoleteProperties(scmmData);
			Object.assign(properties, scmmData);
		} else {
			logger.warn("Internal/TrackingData", "SCMM data is empty");
		}

		ko.postbox.publish("scmm-data-loaded", true);
	}

	function updateNonTrackingProperties(scmmData) {
		nonTrackingProperties.FolderName = scmmData.FolderName;
		nonTrackingProperties.RetentionPerson = scmmData.RetentionPerson;
		nonTrackingProperties.RetentionEmail = scmmData.RetentionEmail;
		nonTrackingProperties.PotentialValue = scmmData.PotentialValue;
		nonTrackingProperties.SiteTriggerName = scmmData.SiteTriggerName;
	}

	function removeObsoleteProperties(scmmData) {
		if (general.isNullOrUndefined(scmmData)) {
			return;
		}

		delete scmmData.LastDepositDate;
		delete scmmData.LastDealDate;
		delete scmmData.VolumeCategory;
		delete scmmData.DepositCategory;
		delete scmmData.FolderName;
		delete scmmData.RetentionPerson;
		delete scmmData.RetentionEmail;
		delete scmmData.PotentialValue;
		delete scmmData.SiteTriggerName;
		delete scmmData.ActualDealType;
		delete scmmData.TradedCurrencies;
		delete scmmData.TradedMetals;
		delete scmmData.TradedShares;
		delete scmmData.TradedIndices;
		delete scmmData.TradedCommodities;
	}

	function getAMLStatusName() {
		var statusId = statesManager.States.AmlStatus();

		for (var prop in eAMLStatus) {
			if (eAMLStatus.hasOwnProperty(prop) && eAMLStatus[prop] == statusId) {
				return prop.toString();
			}
		}

		return statusId;
	}

	function incrementDealsNumber() {
		if (!properties.hasOwnProperty("NumberOfDeals")) {
			properties.NumberOfDeals = 0;
			return;
		}

		properties.NumberOfDeals = Number(properties.NumberOfDeals) + 1;
	}

	function incrementDepositsNumber() {
		if (!properties.hasOwnProperty("NumberOfDeposits")) {
			properties.NumberOfDeposits = 0;
			return;
		}

		properties.NumberOfDeposits = Number(properties.NumberOfDeposits) + 1;
	}

	function mapFolderTypeData(folderTypeId, isLive, isPending) {
		switch (folderTypeId) {
			case 0:
				return "None";

			case 1:
				return "Other";

			case 2: {
				if (isLive) {
					return "Live";
				}

				if (isPending) {
					return "Pending";
				}

				return "Other";
			}

			case 3:
				return "Other";

			case 4:
				return "Nostro";

			case 5:
				return "PTA";

			case 6:
				return "DebitFraud";

			case 9:
				return "DemoGame";
		}

		return "Other";
	}

	function updateAccountStatus(value) {
		properties.AccountStatus = Object.keys(eUserStatus).find(function (key) {
			return eUserStatus[key] === value;
		});
	}

	return {
		init: init,
		getProperties: getProperties,
		getNonTrackingProperties: getNonTrackingProperties,
		incrementDealsNumber: incrementDealsNumber,
		incrementDepositsNumber: incrementDepositsNumber,
		updateScmmData: updateScmmData,
		getErrorTrackingData: getErrorTrackingData,
		updateAccountStatus: updateAccountStatus,
	};
});
