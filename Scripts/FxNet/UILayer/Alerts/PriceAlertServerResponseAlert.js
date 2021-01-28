define("alerts/PriceAlertServerResponseAlert", [
	"require",
	"handlers/general",
	"devicealerts/Alert",
	"FxNet/LogicLayer/Deal/DealLifeCycle",
	"Dictionary",
	"handlers/Cookie",
	"initdatamanagers/InstrumentsManager",
	"modules/environmentData",
], function PriceAlertServerResponseAlertDef(require) {
	var AlertBase = require("devicealerts/Alert"),
		general = require("handlers/general"),
		Dictionary = require("Dictionary"),
		CookieHandler = require("handlers/Cookie"),
		instrumentsManager = require("initdatamanagers/InstrumentsManager"),
		environmentData = require("modules/environmentData").get();

	var PriceAlertServerResponseAlert = function PriceAlertServerResponseAlertClass() {
		var inheritedAlertInstance = new AlertBase();

		function init() {
			inheritedAlertInstance.alertName = "PriceAlertServerResponseAlert";
			inheritedAlertInstance.visible(false);
			inheritedAlertInstance.prepareForShow = prepareForShow;
			createButtons();
		}

		function prepareForShow() {
			var serverResults = this.properties.serverResponses;
			this.dataRecords = serverResults;

			if (!serverResults || !serverResults.length) {
				return;
			}

			var data = serverResults[0],
				instrument = instrumentsManager.GetInstrument(data.instrumentId),
				dataRequested = this.properties.requestData;

			general.extendType(data, {
				limitLevel: data.limLevel,
				orderDir: data.direction ? "1" : "0",
				baseSymbolId: instrument ? instrument.baseSymbol : "",
				otherSymbolId: instrument ? instrument.otherSymbol : "",
				messages: [],
				type: general.isDefinedType(dataRequested.type) ? dataRequested.type : data.type,
				mode: general.isDefinedType(dataRequested.mode) ? dataRequested.mode : data.mode,
				action: general.isDefinedType(dataRequested.action) ? dataRequested.action : data.action,
			});

			this.messages.removeAll();

			switch (data.msgKey) {
				case "OrderError20":
					this.title(Dictionary.GetItem("PleaseNote"));
					this.body("");
					this.messages.push(
						String.format(Dictionary.GetItem("priceAlertExceedAmount"), environmentData.maxPriceAlertsCount)
					);
					this.dataRecords.pop();
					break;

				case "OrderError22":
					this.title(Dictionary.GetItem("newPriceAlert"));
					this.body("");
					this.messages.push(
						String.format(
							Dictionary.GetItem("generalPriceAlertFailure"),
							environmentData.maxPriceAlertsCount
						)
					);
					this.dataRecords.pop();
					break;

				default:
					//SuccessPriceAlertAdd
					this.title(Dictionary.GetItem("priceAlertSet"));
					this.body(Dictionary.GetItem("priceAlertSetSuccessfully"));
					this.messages.push(Dictionary.GetItem("priceAlertNotificationsEnableNote"));
					break;
			}
		}

		function createButtons() {
			inheritedAlertInstance.buttons.removeAll();

			// override base on Back => onOk
			var onOk = (inheritedAlertInstance.onBack = function () {
				var redirectToViewType,
					viewArgs = inheritedAlertInstance.properties.redirectToViewArgs || "";

				// redirect to price alert grid only on mobile
				if (
					CookieHandler.ReadCookie("ViewMode").toLowerCase() === "mobile" &&
					!general.isEmptyValue(inheritedAlertInstance.properties.redirectToView)
				) {
					redirectToViewType = inheritedAlertInstance.properties.redirectToView;
				}

				if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
					inheritedAlertInstance.properties.okButtonCallback();
				}

				inheritedAlertInstance.visible(false);

				if (!general.isEmptyValue(redirectToViewType)) {
					if (redirectToViewType === "exit") {
						dalCommon.Logout(eLoginLogoutReason.limitsServerResponseAlert_exit);
					} else {
						require(["devicemanagers/ViewModelsManager"], function ($viewModelsManager) {
							$viewModelsManager.VManager.SwitchViewVisible(redirectToViewType, viewArgs);
						});
					}
				}
			});

			inheritedAlertInstance.buttons.push(
				new inheritedAlertInstance.buttonProperties(Dictionary.GetItem("ok"), onOk, "btnOk")
			);
		}

		return {
			Init: init,
			GetAlert: inheritedAlertInstance,
		};
	};

	return PriceAlertServerResponseAlert;
});
