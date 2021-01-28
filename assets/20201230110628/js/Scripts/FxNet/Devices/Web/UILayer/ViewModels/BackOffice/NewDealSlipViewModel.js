/*global eNewDealLimitType  */
define(
    'deviceviewmodels/BackOffice/NewDealSlipViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'handlers/Deal',
        'Q',
        'configuration/initconfiguration',
        'Dictionary',
        'initdatamanagers/Customer',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/ViewModelsManager',
        'modules/permissionsmodule',
        'generalmanagers/DealTypeManager',
        'dataaccess/dalTransactions',
        'FxNet/LogicLayer/Deal/DealLifeCycle',
        'viewmodels/Limits/AmountFieldsWrapper',
        'viewmodels/Deals/DealBaseViewModel',
        'StateObject!Transaction',
        'LoadDictionaryContent!deals_newdeal',
        'devicemanagers/AlertsManager'
    ],
    function NewDealSlipDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            TDeal = require('handlers/Deal'),
            Q = require('Q'),
            settings = require('configuration/initconfiguration').NewDealConfiguration,
            Dictionary = require('Dictionary'),
            Customer = require('initdatamanagers/Customer'),
            dalTransactions = require('dataaccess/dalTransactions'),
            statesManager = require('devicemanagers/StatesManager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            permissionsModule = require('modules/permissionsmodule'),
            dealLifeCycle = require('FxNet/LogicLayer/Deal/DealLifeCycle'),
            AmountFieldsWrapper = require('viewmodels/Limits/AmountFieldsWrapper'),
            DealBaseViewModel = require('viewmodels/Deals/DealBaseViewModel'),
            DealTypeManager = require('generalmanagers/DealTypeManager'),
            stateObject = require('StateObject!Transaction'),
            AlertsManager = require('devicemanagers/AlertsManager');

        var NewDealSlipViewModel = general.extendClass(DealBaseViewModel, function NewDealSlipClass() {
            var self = this,
                parent = this.parent,                       // inherited from DealBaseViewModel
                data = this.Data,                           // inherited from DealBaseViewModel
                baseOrder = parent.BaseOrder,
                fieldWrappers = new AmountFieldsWrapper(),
                setLimitsModel = parent.SetLimitsModel,
                selectedInstrumentWrapper,
                rateValueDisposables = [];

            function init(customSettings) {
                if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                    stateObject.set('stateObjectIsReadyDefer', Q.defer());
                }

                parent.init.call(self, customSettings);     // inherited from DealBaseViewModel

                setObservables();
                setComputables();
                setSubscribers();
                setValidators();

                parent.registerToDispatcher();

                setLimitsModel.Start(setLimitsModelDependencies);

                setLimitsModel.SetSlActiveTab(eSetLimitsTabs.Rate);
                setLimitsModel.SetTpActiveTab(eSetLimitsTabs.Rate);

                stateObject.get('stateObjectIsReadyDefer').resolve();
            }

            function setObservables() {
                data.expirationDate = ko.observable();
                data.sharesDividendDate = ko.observable();
                data.corporateActionDate = ko.observable();
                data.showShareCorporateActionDealInfo = ko.observable();
                data.showShareDividendDealInfo = ko.observable();
                data.showFutureRolloverDealInfo = ko.observable("");
                data.futuresRolloverDate = ko.observable("");
                data.sellAmount = ko.observable("");
                data.buyAmount = ko.observable("");
                data.showLastRate = ko.observable(false);
            }

            function setValidators() {
                data.selectedInstrument.extend({
                    validation: {
                        validator: function (selectedInstrument) {
                            return general.isEmptyValue(selectedInstrument) || !statesManager.States.IsMarketClosed();
                        },
                        message: Dictionary.GetItem("InstrumentInactive")
                    }
                });

                data.sellAmount.extend({
                    toNumericLength: {
                        ranges: [
                            { from: 0, to: Number.MAX_SAFE_INTEGER }
                        ],
                        isAllowNAValue: true
                    },
                    amountValidation: data.dealMinMaxAmounts().length > 0
                });

                data.buyAmount.extend({
                    toNumericLength: {
                        ranges: [
                            { from: 0, to: Number.MAX_SAFE_INTEGER }
                        ],
                        isAllowNAValue: true
                    },
                    amountValidation: data.dealMinMaxAmounts().length > 0
                });

                data.selectedInstrument.extend({
                    tooltipValidation: {
                        notify: 'always'
                    }
                });
            }

            function setComputables() {
                data.DealButtonEnabled = self.createComputed(function () {
                    var isValidInstrument = data.selectedInstrument.isValid(),
                        viewModelReady = data.hasInstrument() && data.limitsReady() && data.quotesAvailable(),
                        isOrderDirSelected = data.isShowBuyBox() || data.isShowSellBox(),
                        hasDealMinMaxAmounts = data.dealMinMaxAmounts().length > 0,
                        hasLastRate = data.showLastRate() ? data.sellAmount() > 0 && data.buyAmount() > 0 : true;

                    return (!data.isProcessing() && hasDealMinMaxAmounts &&
                        isOrderDirSelected && hasLastRate && isValidInstrument && viewModelReady);
                });

                data.focusOnSlRate = self.createComputed(function () {
                    return data.enableSLLimit() && setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Rate;
                });

                data.focusOnSlAmount = self.createComputed(function () {
                    // Focus by default the amount field
                    return data.enableSLLimit() && (setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Amount || setLimitsModel.Data.curSlActiveTab() === setLimitsModel.Data.defaultTab);
                });

                data.focusOnSlPercent = self.createComputed(function () {
                    return data.enableSLLimit() && setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Percent;
                });

                data.focusOnTpRate = self.createComputed(function () {
                    return data.enableTPLimit() && setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Rate;
                });

                data.focusOnTpAmount = self.createComputed(function () {
                    // Focus by default the amount field
                    return data.enableTPLimit() && (setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Amount || setLimitsModel.Data.curTpActiveTab() === setLimitsModel.Data.defaultTab);
                });

                data.focusOnTpPercent = self.createComputed(function () {
                    return data.enableTPLimit() && setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Percent;
                });

                selectedInstrumentWrapper = self.createComputed(function () {
                    return data.selectedInstrument();
                });
            }

            function setSubscribers() {
                self.subscribeAndNotify(selectedInstrumentWrapper, function (instrumentId) {
                    var instrument = instrumentsManager.GetInstrument(instrumentId);

                    if (instrument) {
                        parent.setLimitTabsFromClientProfile();

                        data.expirationDate(instrument.expirationDate);
                        data.sharesDividendDate(general.str2Date(instrument.eventDate, "d/m/Y H:M"));
                        data.corporateActionDate(general.str2Date(instrument.getCorporateActionDate(), "d/m/Y H:M"));
                        data.futuresRolloverDate(general.str2Date(instrument.eventDate, "d/m/Y H:M"));

                        data.showShareCorporateActionDealInfo(dealLifeCycle.sharesIsCorporateActionDateSignificant_BeforeDeal(Customer.prop.dealPermit, instrument.assetTypeId, instrument.getCorporateActionDate()));
                        data.showShareDividendDealInfo(dealLifeCycle.sharesIsDividendDateSignificant_BeforeDeal(Customer.prop.dealPermit, instrument.assetTypeId, instrument.getCorporateActionDate(), instrument.getInstrumentDividendDate()));
                        data.showFutureRolloverDealInfo(dealLifeCycle.futuresIsRolloverDateSignificant_BeforeDeal(Customer.prop.dealPermit, instrument.assetTypeId, instrument.getInstrumentRolloverDate()));
                    }

                    DealTypeManager.Init();

                    if (instrument.isFuture) {
                        DealTypeManager.ConsumeEvent('future');
                    }
                    else if (instrument.isShare) {
                        DealTypeManager.ConsumeEvent('share');
                    }
                    else {
                        DealTypeManager.ConsumeEvent();
                    }
                });

                self.subscribeTo(data.showLastRate, function (value) {
                    if (value) {
                        data.sellAmount(data.bid());
                        data.buyAmount(data.ask());
                        setLastRates();
                    }
                    else {
                        setMarketRates();
                    }
                });

                self.subscribeTo(data.orderDir, function () {
                    data.showLastRate(false);
                });
            }

            function setLastRates() {
                parent.unRegisterFromDispatcher();

                var sellDisposable = self.subscribeTo(data.sellAmount, function (subscribedValue) {
                        data.bid(subscribedValue);
                    }),
                    buyDisposable = self.subscribeTo(data.buyAmount, function (subscribedValue) {
                        data.ask(subscribedValue);
                    });

                rateValueDisposables.push(sellDisposable, buyDisposable);
            }

            function setMarketRates() {
                parent.registerToDispatcher();

                rateValueDisposables.forEach(function (disposable) {
                    disposable.dispose();
                    rateValueDisposables.pop(disposable);
                });
            }

            function showLastRate(value) {
                data.showLastRate(value);
            }

            function setLimitsModelDependencies() {
                fieldWrappers.init(setLimitsModel, data);

                setStopLossDependencies();
                setTakeProfitDependencies();

                data.limitsReady(true);
                parent.setLimitTabsFromClientProfile();
            }

            function setStopLossDependencies() {
                self.subscribeTo(data.enableSLLimit, function (enabled) {
                    if (enabled) {
                        return;
                    }

                    setLimitsModel.Data.stopLossRate("");
                    setLimitsModel.Data.stopLossAmount("");
                    setLimitsModel.Data.stopLossPercent("");
                    fieldWrappers.Data.stopLossInCustomerCcy("");
                });

                self.subscribeTo(setLimitsModel.Data.curSlActiveTab, function (activeTab) {
                    data.isSlRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                    data.isSlAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                    data.isSlPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                });

                self.subscribeTo(setLimitsModel.Data.stopLossPercent, function (stopLossPercent) {
                    data.displaySlPercentSymbol(!general.isEmptyValue(stopLossPercent) && stopLossPercent !== "NA");
                });

                self.subscribeTo(fieldWrappers.Data.stopLossInCustomerCcy, function (stopLossInCustomerCcy) {
                    data.displaySlAmountCcySymbol(!general.isEmptyValue(stopLossInCustomerCcy) && stopLossInCustomerCcy !== "NA");
                });
            }

            function setTakeProfitDependencies() {
                self.subscribeTo(data.enableTPLimit, function (enabled) {
                    if (enabled) {
                        return;
                    }

                    setLimitsModel.Data.takeProfitRate("");
                    setLimitsModel.Data.takeProfitAmount("");
                    setLimitsModel.Data.takeProfitPercent("");
                    fieldWrappers.Data.takeProfitInCustomerCcy("");
                });

                self.subscribeTo(setLimitsModel.Data.curTpActiveTab, function (activeTab) {
                    data.isTpRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                    data.isTpAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                    data.isTpPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                });

                self.subscribeTo(setLimitsModel.Data.takeProfitPercent, function (takeProfitPercent) {
                    data.displayTpPercentSymbol(!general.isEmptyValue(takeProfitPercent) && takeProfitPercent !== "NA");
                });

                self.subscribeTo(fieldWrappers.Data.takeProfitInCustomerCcy, function (takeProfitInCustomerCcy) {
                    data.displayTpAmountCcySymbol(!general.isEmptyValue(takeProfitInCustomerCcy) && takeProfitInCustomerCcy !== "NA");
                });
            }

            function openDeal() {
                var deal = new TDeal(),
                    dealSellAmount = data.sellAmount() > 0 && data.showLastRate() === true ? data.sellAmount() : data.activeQuote.bid,
                    dealBuyAmount = data.buyAmount() > 0 && data.showLastRate() === true ? data.buyAmount() : data.activeQuote.ask,
                    invalidSlRate = false,
                    invalidTpRate = false;

                deal.dealType = DealTypeManager.GetStatus();
                deal.instrumentID = data.selectedInstrument();
                deal.amount = data.selectedDealAmount();
                deal.marketRate = data.orderDir() === eOrderDir.Sell ? dealSellAmount : dealBuyAmount;
                deal.otherRateSeen = data.orderDir() === eOrderDir.Sell ? dealBuyAmount : dealSellAmount;
                deal.orderDir = data.orderDir();
                deal.slRate = 0;
                deal.tpRate = 0;
                deal.expirationDate = data.expirationDate();

                if (data.enableSLLimit()) {
                    deal.slRate = setLimitsModel.Data.stopLossRate() === "" ? 0 : setLimitsModel.Data.stopLossRate();
                    invalidSlRate = deal.slRate === 'NA';
                }

                if (data.enableTPLimit()) {
                    deal.tpRate = setLimitsModel.Data.takeProfitRate() === "" ? 0 : setLimitsModel.Data.takeProfitRate();
                    invalidTpRate = deal.tpRate === 'NA';
                }

                if (invalidSlRate || invalidTpRate) {
                    var alertError = Dictionary.GetItem('txtRateValidationTooltip', null, '').split(".");
                    AlertsManager.UpdateAlert(AlertTypes.GeneralOkAlert, Dictionary.GetItem("pleaseNoteTitle"), alertError.length ? alertError[0] : '', null, {});
                    AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
                    return;
                }

                data.hasInstrument(false);
                data.isProcessing(true);

                dalTransactions.OpenDeal(deal, onOpenDeal);
            }

            function onOpenDeal(result, callerId, instrumentId, requestData) {
                data.hasInstrument(true);
                data.isProcessing(false);

                var instrument = instrumentsManager.GetInstrument(instrumentId);
                var redirectToView = self.getSettings().onSuccessRedirectTo;

                var onActionReturnArgs = {
                    requestData: requestData,
                    tradingEnabledRetry: openDealRetry
                };

                if (instrument) {
                    if (baseOrder.ResultStatusSuccess(result)) {
                        resetDealValues();
                    }

                    // Check if redirect is required
                    if (redirectToView) {
                        baseOrder.OnActionReturn(result, callerId, instrument, general.extendType({ redirectToView: redirectToView }, onActionReturnArgs));
                    } else {
                        baseOrder.OnActionReturn(result, callerId, instrument, onActionReturnArgs);
                    }
                }
            }

            function onOpenDealFail() {
                data.isProcessing(false);
            }

            function openDealRetry(requestData) {
                data.hasInstrument(false);
                data.isProcessing(true);

                dalTransactions.OpenDeal(requestData, onOpenDeal, { forceRetry: true, failCallback: onOpenDealFail });
            }

            function setOrderDir(orderDir) {
                if (orderDir != eOrderDir.Buy && orderDir != eOrderDir.Sell && orderDir != eOrderDir.None) {
                    orderDir = eOrderDir.None;
                }

                data.orderDir(orderDir);
            }

            function resetDealValues() {
                setLimitsModel.Data.stopLossRate(String.empty);
                setLimitsModel.Data.takeProfitRate(String.empty);

                data.enableSLLimit(false);
                data.enableTPLimit(false);
                setOrderDir(eOrderDir.None);
            }

            function dealButtonHandler() {
                if (!data.DealButtonEnabled()) {
                    return;
                }

                if (!permissionsModule.CheckActionAllowed('newDeal', true, { register: registerParams.traderInstrumentId + data.selectedInstrument() + registerParams.traderOrderDir + (data.orderDir() === 0 ? "Sell" : "Buy") })) {
                    return;
                }

                var isSelectedDealAmountValid = general.isFunctionType(data.selectedDealAmount.isValid) ? data.selectedDealAmount.isValid() : false;

                if (!isSelectedDealAmountValid) {
                    ko.postbox.publish('deal-slip-show-validation-tooltips');
                    return;
                }

                openDeal();
            }

            function dispose() {
                setLimitsModel.Stop();
                fieldWrappers.dispose();
                fieldWrappers = null;

                parent.dispose.call(self);                  // inherited from DealViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BaseOrder: baseOrder,
                DealButtonHandler: dealButtonHandler,
                ShowLastRate: showLastRate,
                TPField: setLimitsModel.TPField,
                SLField: setLimitsModel.SLField,
                SetLimitsInfo: setLimitsModel.ObservableSetLimitsObject,
                SetLimitsViewProperties: setLimitsModel.ViewProperties,
                FieldWrappers: fieldWrappers
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NewDealSlipViewModel();

            var currentSettings = $.extend(settings, params);
            viewModel.init(currentSettings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
