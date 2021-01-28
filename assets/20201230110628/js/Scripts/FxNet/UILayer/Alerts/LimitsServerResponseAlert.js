define(
    "alerts/LimitsServerResponseAlert",
    [
        "require",
        'handlers/general',
        'devicealerts/Alert',
        "FxNet/LogicLayer/Deal/DealLifeCycle",
        "Dictionary",
        'initdatamanagers/InstrumentsManager'
    ],
    function LimitsServerResponseAlertDef(require) {
        var AlertBase = require('devicealerts/Alert'),
            general = require('handlers/general'),
            lifeCycleModule = require("FxNet/LogicLayer/Deal/DealLifeCycle"),
            Dictionary = require("Dictionary"),
            $instrumentsManager = require('initdatamanagers/InstrumentsManager');

        var LimitsServerResponseAlert = function LimitsServerResponseAlertClass() {
            var inheritedAlertInstance = new AlertBase();

            var init = function () {
                inheritedAlertInstance.alertName = "LimitsServerResponseAlert";
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = prepareForShow;
                createButtons();
            };

            var prepareForShowSuccessLimitAdd = function (data, properties, messagesArr) {
                var instrument = properties.instrument,
                    valueDate = data.arguments && data.arguments.length > 0 ? data.arguments[0] : null;

                if (general.isEmptyValue(valueDate) && !general.isEmptyValue(properties.valueDate)) {
                    valueDate = properties.valueDate;
                }

                if (instrument && instrument.isFuture) {
                    if (lifeCycleModule.futuresIsRolloverDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getInstrumentRolloverDate(), valueDate)) {
                        messagesArr.push(String.format(Dictionary.GetItem("FutureSuccess"), instrument.eventDate));
                    }

                    return;
                }

                if (instrument && instrument.isShare) {
                    if (lifeCycleModule.sharesIsCorporateActionDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getCorporateActionDate(), valueDate)) {
                        messagesArr.push(String.format(Dictionary.GetItem("shareSuccessHasDate"), instrument.getCorporateActionDate()));
                    }
                    else {
                        if (lifeCycleModule.sharesIsDividendDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getInstrumentDividendDate(), instrument.getCorporateActionDate(), valueDate)) {
                            messagesArr.push(String.format(Dictionary.GetItem("ShareDividendSuccess"), instrument.getInstrumentDividendDate()));
                        }
                        else {
                            messagesArr.push(String.format(Dictionary.GetItem("ShareSuccess2"), $instrumentTranslationsManager.Long(instrument.id)));
                        }
                    }

                    return;
                }
            };

            var prepareForSuccessLimitEdit = function (data, properties, messagesArr) {
                var instrument = properties.instrument,
                    valueDate = data.arguments && data.arguments.length > 0 ? data.arguments[0] : null;

                if (general.isEmptyValue(valueDate) && !general.isEmptyValue(properties.valueDate)) {
                    valueDate = properties.valueDate;
                }

                if (instrument && instrument.isFuture) {
                    if (lifeCycleModule.futuresIsRolloverDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getInstrumentRolloverDate(), valueDate)) {
                        messagesArr.push(String.format(Dictionary.GetItem("FutureSuccess"), instrument.eventDate));
                    }

                    return;
                }

                if (instrument && instrument.isShare) {
                    if (lifeCycleModule.sharesIsCorporateActionDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getCorporateActionDate(), valueDate)) {
                        messagesArr.push(String.format(Dictionary.GetItem("shareSuccessHasDate"), instrument.getCorporateActionDate()));
                    } else {
                        if (lifeCycleModule.sharesIsDividendDateSignificant_AfterDeal(instrument.assetTypeId, instrument.getInstrumentDividendDate(), instrument.getCorporateActionDate(), valueDate)) {
                            messagesArr.push(String.format(Dictionary.GetItem("ShareDividendSuccess"), instrument.getInstrumentDividendDate()));
                        } else {
                            messagesArr.push(String.format(Dictionary.GetItem("ShareSuccess2"), $instrumentTranslationsManager.Long(instrument.id)));
                        }
                    }

                    return;
                }
            };

            var prepareForShow = function () {
                var serverResults = this.properties.serverResponses;
                this.dataRecords = serverResults;

                if (!serverResults || !serverResults.length) {
                    return;
                }

                var data = serverResults[0],
                    instrument = $instrumentsManager.GetInstrument(data.instrumentId),
                    dataRequested = this.properties.requestData;

                general.extendType(data, {
                    limitAmount: dataRequested.amount,
                    limitLevel: data.limLevel,
                    orderDir: data.direction ? "1" : "0",
                    baseSymbolId: instrument ? instrument.baseSymbol : '',
                    otherSymbolId: instrument ? instrument.otherSymbol : '',
                    messages: [],

                    type: general.isDefinedType(dataRequested.type) ? dataRequested.type : data.type,
                    mode: general.isDefinedType(dataRequested.mode) ? dataRequested.mode : data.mode,
                    action: general.isDefinedType(dataRequested.action) ? dataRequested.action : data.action,
                    removedIfDoneSLRate: dataRequested.removedIfDoneSLRate,
                    removedIfDoneTPRate: dataRequested.removedIfDoneTPRate
                });

                this.messages.removeAll();

                switch (data.msgKey) {
                    case "SuccessLimitAdd":
                        this.title(Dictionary.GetItem(data.type == eLimitType.None ? "NewLimit" : "AddLimit"));
                        this.body(Dictionary.GetItem("YourLimitWasAddedSuccessfully"));
                        prepareForShowSuccessLimitAdd(data, this.properties, this.messages);
                        break;

                    case "SuccessLimitEdit":
                        this.title(Dictionary.GetItem(data.type == eLimitType.None ? "UpdateLimit" : "EditStopLossTakeProfit"));
                        this.body(Dictionary.GetItem(data.type == eLimitType.None ? "YourLimitWasUpdatedSuccessfully" : "YourStopLossTakeProfitWasUpdated"));
                        prepareForSuccessLimitEdit(data, this.properties, this.messages);
                        break;

                    case "SuccessLimitDelete":
                        this.title(Dictionary.GetItem("RemoveLimit"));
                        this.body(Dictionary.GetItem("YourLimitWasRemoveddSuccessfully"));
                        break;
                }
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
                            dalCommon.Logout(eLoginLogoutReason.limitsServerResponseAlert_exit);
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

        return LimitsServerResponseAlert;
    }
);
