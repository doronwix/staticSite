define('alerts/DealAddServerResponseAlert', [
    "require",
    'handlers/general',
    'devicealerts/Alert',
    "FxNet/LogicLayer/Deal/DealLifeCycle",
    "Dictionary"
], function (require) {
    var AlertBase = require('devicealerts/Alert'),
        general = require('handlers/general'),
        lifeCycleModule = require("FxNet/LogicLayer/Deal/DealLifeCycle"),
        Dictionary = require("Dictionary");

    var DealAddServerResponseAlert = function () {

        var inheritedAlertInstance = new AlertBase(),
            resourceName = "alerts_deals";

        var init = function () {
            inheritedAlertInstance.alertName = "DealAddServerResponseAlert";
            inheritedAlertInstance.visible(false);
            inheritedAlertInstance.prepareForShow = prepareForShow;
            createButtons();
        };

        var parseExtraInfo = function (result, properties, messagesArr) {
            var instrument = properties.instrument,
                valueDate = result.arguments && result.arguments.length > 0 ? result.arguments[0] : null;

            if (instrument && instrument.isFuture) {

                if (lifeCycleModule.futuresIsRolloverDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getInstrumentRolloverDate(), valueDate)) {
                    messagesArr.push(String.format(Dictionary.GetItem("FutureSuccess"), instrument.eventDate));
                }

                return;
            }
            if (instrument && instrument.isShare) {

                if (lifeCycleModule.sharesIsCorporateActionDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getCorporateActionDate(), valueDate)) {
                    messagesArr.push(String.format(Dictionary.GetItem("shareSuccessHasDate"), instrument.getCorporateActionDate()));
                } else if (lifeCycleModule.sharesIsDividendDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getInstrumentDividendDate(), instrument.getCorporateActionDate(), valueDate)) {
                    messagesArr.push(String.format(Dictionary.GetItem("ShareDividendSuccess"), instrument.getInstrumentDividendDate()));
                } else {
                    messagesArr.push(String.format(Dictionary.GetItem("ShareSuccess2"), $instrumentTranslationsManager.Long(instrument.id)));
                }


                return;
            }
        }
        var prepareForShow = function () {
            this.resourceName = resourceName;
            this.title(Dictionary.GetItem("OpenDeal"));
            this.messages.removeAll();

            var serverResults = this.properties.serverResponses;
            for (var idx = 0; idx < serverResults.length; idx++) {
                var data = serverResults[idx],
                    instrument = $instrumentsManager.GetInstrument(data.instrumentId);

                parseExtraInfo(data, this.properties, this.messages);


                general.extendType(data, {
                    dealAmount: data.usdValue,
                    openedRate: data.rateCalc,
                    orderDir: data.direction ? "1closed" : "0closed",
                    pl: '',
                    baseSymbolId: instrument ? instrument.baseSymbol : '',
                    otherSymbolId: instrument ? instrument.otherSymbol : '',
                    slRate: Format.toRate(parseFloat(this.properties.requestData.slRate), false, data.instrumentId) || '',
                    tpRate: Format.toRate(parseFloat(this.properties.requestData.tpRate), false, data.instrumentId) || ''
                });
            }

            this.body(Dictionary.GetItem("SuccessDealOpen")); //"Your deal was opened successfully"));
            this.dataRecords = serverResults;
        };

        var createButtons = function () {
            inheritedAlertInstance.buttons.removeAll();

            // override base on Back => onOk
            var onOk = inheritedAlertInstance.onBack = function () {
                var redirectToViewType,
                    viewArgs = inheritedAlertInstance.properties.redirectToViewArgs || "";

                if (!general.isEmptyValue(inheritedAlertInstance.properties.redirectToView)) {
                    redirectToViewType = inheritedAlertInstance.properties.redirectToView;
                }

                if (general.isFunctionType(inheritedAlertInstance.properties.okButtonCallback)) {
                    inheritedAlertInstance.properties.okButtonCallback();
                }

                inheritedAlertInstance.visible(false);

                if (!general.isEmptyValue(redirectToViewType)) {
                    if (redirectToViewType === 'exit') {
                        dalCommon.Logout(eLoginLogoutReason.dealAddServerResponseAlert_exit);
                    } else {
                        require(['devicemanagers/ViewModelsManager'], function (viewModelsManager) {
                            viewModelsManager.VManager.SwitchViewVisible(redirectToViewType, viewArgs);
                        });
                        
                    }
                }
            };

            inheritedAlertInstance.buttons.push(
                new inheritedAlertInstance.buttonProperties(
                    Dictionary.GetItem("ok"),
                    onOk,
                    'btnOk'
                )
            );
        };

        return {
            Init: init,
            GetAlert: inheritedAlertInstance
        };
    };
    return DealAddServerResponseAlert;
});