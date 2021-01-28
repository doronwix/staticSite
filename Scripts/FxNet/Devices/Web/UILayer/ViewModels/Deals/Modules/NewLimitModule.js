define(
    'deviceviewmodels/Deals/Modules/NewLimitModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'Q',
        'configuration/initconfiguration',
        'dataaccess/dalorder',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/Customer',
        'managers/CustomerProfileManager',
        'modules/permissionsmodule',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/StatesManager',
        'FxNet/LogicLayer/Deal/DealLifeCycle',
        'viewmodels/Limits/AmountFieldsWrapper',
        'viewmodels/Limits/LimitBaseViewModel',
        'StateObject!Transaction',
        'LoadDictionaryContent!deals_newlimit',
        'devicemanagers/AlertsManager',
        'handlers/limit'
    ],
    function NewLimitModuleDefault(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            settings = require('configuration/initconfiguration').NewLimitConfiguration,
            Q = require('Q'),
            dalOrders = require('dataaccess/dalorder'),
            customer = require('initdatamanagers/Customer'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            permissionsModule = require('modules/permissionsmodule'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            statesManager = require('devicemanagers/StatesManager'),
            dealLifeCycle = require('FxNet/LogicLayer/Deal/DealLifeCycle'),
            AmountFieldsWrapper = require('viewmodels/Limits/AmountFieldsWrapper'),
            LimitBaseViewModel = require('viewmodels/Limits/LimitBaseViewModel'),
            stateObject = require('StateObject!Transaction'),
            limit = require('handlers/limit'),
            AlertsManager = require('devicemanagers/AlertsManager');

        var NewLimitModule = general.extendClass(LimitBaseViewModel, function NewLimitModuleClass() {
            var self = this,
                parent = this.parent, // inherited from LimitBaseViewModel
                data = this.Data, // inherited from LimitBaseViewModel
                validationModel = {},
                fieldWrappers = new AmountFieldsWrapper(),
                baseOrder = parent.BaseOrder,
                expirationDateModel = parent.ExpirationDate,
                setLimitsModel = parent.SetLimitsModel,
                selectedInstrumentWrapper;

            function init(customSettings) {
                if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                    stateObject.set('stateObjectIsReadyDefer', Q.defer());
                }

                parent.init.call(self, customSettings); // inherited from LimitBaseViewModel
                data.chartStationPage = customSettings.chartStationPage;

                setObservables();
                setComputables();
                setSubscribers();
                setValidators();

                parent.registerToDispatcher();
                setLimitsModel.Start(setLimitsModelDependencies);
                setChartProperties();
                stateObject.get('stateObjectIsReadyDefer').resolve();
                ko.postbox.publish('new-limit-view', { instrument: data.ccyPair(), instrumentStatus: data.isActiveQuote() ? 'live' : 'disabled' });
            }

            function setObservables() {
                data.sharesDividendDate = ko.observable();
                data.corporateActionDate = ko.observable();
                data.showShareCorporateActionDealInfo = ko.observable();
                data.showShareDividendDealInfo = ko.observable();
                data.showFutureRolloverDealInfo = ko.observable("");
                data.futuresRolloverDate = ko.observable("");
                data.showLimits = ko.observable(customerProfileManager.ProfileCustomer().newLimitOrders === 1).extend({ notify: "always" });
                data.showLimitsSlideCompleted = ko.observable(false);
                data.toggleLimitsSection = function () {
                    var currentValue = !!data.showLimits();
                    data.showLimits(!currentValue);
                };
            }

            function setComputables() {
                data.showForexNonIslamicDealInfo = self.createComputed(function () {
                    return data.isForex() && customer.prop.dealPermit !== eDealPermit.Islamic;
                });

                data.isOvernightOnForex = self.createComputed(function () {
                    return customer.prop.isOvernightOnForex;
                });

                data.showSLSummary = self.createComputed(function () {
                    var displaySummary = !!ko.utils.unwrapObservable(setLimitsModel.Data.displaySLSummary);

                    return !data.showLimits() && data.enableSLLimit() && displaySummary;
                });

                data.showTPSummary = self.createComputed(function () {
                    var displaySummary = !!ko.utils.unwrapObservable(setLimitsModel.Data.displayTPSummary);

                    return !data.showLimits() && data.enableTPLimit() && displaySummary;
                });

                data.showLimitsSummary = self.createComputed(function () {
                    return data.showSLSummary() || data.showTPSummary();
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

                data.OrderButtonEnabled = self.createComputed(function () {
                    var isMarketClosed = statesManager.States.IsMarketClosed(),
                        isValidInstrument = data.selectedInstrument.isValid(),
                        viewModelReady = data.hasInstrument() && data.limitsReady() && data.quotesAvailable(),
                        isLimitLevelValid = data.openLimit ? data.openLimit.isValid() : false,
                        isActiveQuote = data.isActiveQuote(),
                        isBrokerAllowLimitsOnNoRates = customer.prop.brokerAllowLimitsOnNoRates,
                        isExpirationDateTimeValid = expirationDateModel.IsValid(),
                        isOrderDirSelected = data.isShowBuyBox() || data.isShowSellBox(),
                        hasDealMinMaxAmounts = data.dealMinMaxAmounts().length > 0;


                    return (!data.isProcessing() && (isBrokerAllowLimitsOnNoRates || (!isMarketClosed && isActiveQuote)) &&
                        isOrderDirSelected && isValidInstrument && viewModelReady && isExpirationDateTimeValid &&
                        isLimitLevelValid && hasDealMinMaxAmounts);
                });

                selectedInstrumentWrapper = self.createComputed(function () {
                    return data.selectedInstrument();
                });
            }

            function setSubscribers() {
                self.subscribeAndNotify(selectedInstrumentWrapper, function (instrumentId) {
                    var instrument = instrumentsManager.GetInstrument(instrumentId);

                    if (instrument) {
                        if (!data.chartStationPage) {
                            parent.setLimitTabsFromClientProfile();
                        }

                        data.sharesDividendDate(general.str2Date(instrument.eventDate, "d/m/Y H:M"));
                        data.corporateActionDate(general.str2Date(instrument.getCorporateActionDate(), "d/m/Y H:M"));
                        data.futuresRolloverDate(general.str2Date(instrument.eventDate, "d/m/Y H:M"));

                        data.showShareCorporateActionDealInfo(dealLifeCycle.sharesIsCorporateActionDateSignificant_BeforeDeal(customer.prop.dealPermit, instrument.assetTypeId, instrument.getCorporateActionDate()));
                        data.showShareDividendDealInfo(dealLifeCycle.sharesIsDividendDateSignificant_BeforeDeal(customer.prop.dealPermit, instrument.assetTypeId, instrument.getCorporateActionDate(), instrument.getInstrumentDividendDate()));
                        data.showFutureRolloverDealInfo(dealLifeCycle.futuresIsRolloverDateSignificant_BeforeDeal(customer.prop.dealPermit, instrument.assetTypeId, instrument.getInstrumentRolloverDate()));
                    }
                });

                self.subscribeTo(data.showTools, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();
                    profileCustomer.tools = Number(isExpanded);
                    customerProfileManager.ProfileCustomer(profileCustomer);
                });

                self.subscribeTo(data.showLimits, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();
                    profileCustomer.newLimitOrders = Number(isExpanded);
                    customerProfileManager.ProfileCustomer(profileCustomer);

                    data.showLimitsSlideCompleted(false);

                    if (!isExpanded && data.ViewModelReady()) {
                        // SL
                        setLimitsModel.Data.stopLossRate.closeTooltip();
                        fieldWrappers.Data.stopLossInCustomerCcy.closeTooltip();
                        setLimitsModel.Data.stopLossPercent.closeTooltip();

                        // TP
                        setLimitsModel.Data.takeProfitRate.closeTooltip();
                        fieldWrappers.Data.takeProfitInCustomerCcy.closeTooltip();
                        setLimitsModel.Data.takeProfitPercent.closeTooltip();
                    }
                });

                self.subscribeTo(data.showLimitsSlideCompleted, function (slideCompleted) {
                    if (slideCompleted && data.showLimits()) {
                        // SL
                        setLimitsModel.Data.stopLossRate.resetTooltip();
                        fieldWrappers.Data.stopLossInCustomerCcy.resetTooltip();
                        setLimitsModel.Data.stopLossPercent.resetTooltip();

                        // TP
                        setLimitsModel.Data.takeProfitRate.resetTooltip();
                        fieldWrappers.Data.takeProfitInCustomerCcy.resetTooltip();
                        setLimitsModel.Data.takeProfitPercent.resetTooltip();
                    }
                });
            }

            function setLimitsModelDependencies() {
                validationModel.Limits = ko.validatedObservable({
                    stopLossAmount: setLimitsModel.Data.stopLossAmount,
                    takeProfitAmount: setLimitsModel.Data.takeProfitAmount,
                    ccySLAmount: setLimitsModel.Data.ccySLAmount,
                    ccyTPAmount: setLimitsModel.Data.ccyTPAmount,
                    stopLossRate: setLimitsModel.Data.stopLossRate,
                    takeProfitRate: setLimitsModel.Data.takeProfitRate,
                    stopLossPercent: setLimitsModel.Data.stopLossPercent,
                    takeProfitPercent: setLimitsModel.Data.takeProfitPercent
                });

                fieldWrappers.init(setLimitsModel, data);

                var slAmountTooltip = ko.observable(false);
                var slRateTooltip = ko.observable(false);
                var slPercentTooltip = ko.observable(false);
                var tpAmountTooltip = ko.observable(false);
                var tpRateTooltip = ko.observable(false);
                var tpPercentTooltip = ko.observable(false);

                // SL amount tooltip validation
                fieldWrappers.Data.stopLossInCustomerCcy.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curSlActiveTab() == eSetLimitsTabs.Amount || setLimitsModel.Data.curSlActiveTab() == setLimitsModel.Data.defaultTab) && slAmountTooltip();
                        }
                    }
                });

                self.subscribeTo(fieldWrappers.Data.stopLossInCustomerCcy.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        slAmountTooltip(false);
                    }
                });

                self.subscribeTo(fieldWrappers.Data.stopLossInCustomerCcy, function () {
                    slAmountTooltip(false);
                });

                // SL rate tooltip validation
                setLimitsModel.Data.stopLossRate.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curSlActiveTab() == eSetLimitsTabs.Rate || setLimitsModel.Data.curSlActiveTab() == setLimitsModel.Data.defaultTab) && slRateTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsModel.Data.stopLossRate.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        slRateTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsModel.Data.stopLossRate, function () {
                    slRateTooltip(false);
                });

                // SL percent tooltip validation
                setLimitsModel.Data.stopLossPercent.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Percent || setLimitsModel.Data.curSlActiveTab() === setLimitsModel.Data.defaultTab) && slPercentTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsModel.Data.stopLossPercent.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        slPercentTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsModel.Data.stopLossPercent, function () {
                    slPercentTooltip(false);
                });

                // TP amount tooltip validation
                fieldWrappers.Data.takeProfitInCustomerCcy.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Amount || setLimitsModel.Data.curTpActiveTab() == setLimitsModel.Data.defaultTab) && tpAmountTooltip();
                        }
                    }
                });

                self.subscribeTo(fieldWrappers.Data.takeProfitInCustomerCcy.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        tpAmountTooltip(false);
                    }
                });

                self.subscribeTo(fieldWrappers.Data.takeProfitInCustomerCcy, function () {
                    tpAmountTooltip(false);
                });

                // TP rate tooltip validation
                setLimitsModel.Data.takeProfitRate.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curTpActiveTab() == eSetLimitsTabs.Rate || setLimitsModel.Data.curTpActiveTab() == setLimitsModel.Data.defaultTab) && tpRateTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsModel.Data.takeProfitRate.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        tpRateTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsModel.Data.takeProfitRate, function () {
                    tpRateTooltip(false);
                });

                // TP percent tooltip validation
                setLimitsModel.Data.takeProfitPercent.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Percent || setLimitsModel.Data.curTpActiveTab() === setLimitsModel.Data.defaultTab) && tpPercentTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsModel.Data.takeProfitPercent.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        tpPercentTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsModel.Data.takeProfitPercent, function () {
                    tpPercentTooltip(false);
                });

                // reset toolpip visibility
                self.addDisposable(
                    ko.postbox.subscribe('deal-slip-show-validation-tooltips', function () {
                        slAmountTooltip(true);
                        slRateTooltip(true);
                        slPercentTooltip(true);
                        tpAmountTooltip(true);
                        tpRateTooltip(true);
                        tpPercentTooltip(true);
                    })
                );

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

            function setValidators() {
                data.selectedInstrument.extend({ validatable: false });
                data.selectedInstrument.extend({
                    validation: {
                        validator: function (selectedInstrument) {
                            var isQuoteActive = data.isActiveQuote();
                            var isAllowLimits = customer.prop.brokerAllowLimitsOnNoRates || (!statesManager.States.IsMarketClosed() && isQuoteActive);

                            return general.isEmptyValue(selectedInstrument) || general.isEmptyValue(isQuoteActive) || isAllowLimits;
                        },
                        message: Dictionary.GetItem("InstrumentInactive")
                    }
                });

                data.selectedInstrument.extend({
                    tooltipValidation: {
                        notify: 'always'
                    }
                });
            }

            function orderButtonHandler() {
                if (!data.OrderButtonEnabled()) {
                    return;
                }

                var isSelectedDealAmountValid = general.isFunctionType(data.selectedDealAmount.isValid) ? data.selectedDealAmount.isValid() : false,
                    limitsErrors = setLimitsModel.Validate();

                if (limitsErrors.length || !isSelectedDealAmountValid) {
                    // expand set limits section if there are errors
                    if (limitsErrors.length) {
                        data.showLimits(true);
                    }

                    ko.postbox.publish('deal-slip-show-validation-tooltips');
                    return;
                }

                if (!permissionsModule.CheckActionAllowed('newLimit', true, { register: registerParams.traderInstrumentId + data.selectedInstrument() + registerParams.traderOrderDir + (data.orderDir() === 0 ? "Sell" : "Buy") }))
                    return;

                if (statesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    return;
                }

                if (baseOrder.LimitValidateQuote(data.selectedInstrument())) {
                    var newLimit = new limit();
                    parent.fillData(newLimit);

                    if (invalidEnableSlTpLimit(newLimit)) {
                        return enabledSltpValidationError();
                    }

                    data.isProcessing(true);
                    data.hasInstrument(false);
                    dalOrders.AddLimit(newLimit, parent.onOpenLimit);
                    ko.postbox.publish('new-limit-details', { tradingDirection: newLimit.orderDir === eOrderDir.Buy ? 'Buy' : newLimit.orderDir === eOrderDir.Sell ? 'Sell' : 'None', dealSize: newLimit.amount, isAdvancedView: setLimitsModel.ViewProperties.isAdvancedView().toString(), expirationType: expirationDateModel.Data.expirationDateSelector.IsGoodTillCancelChecked() ? "Good Till Cancel" : "Specific Date" });
                }
            }

            function invalidEnableSlTpLimit(newLimit) {
                return data.enableSLLimit() && newLimit.ifDoneSLRate === 0 || data.enableTPLimit() && newLimit.ifDoneTPRate === 0;
            }

            function ignoreSltpValidationError() {
                data.enableSLLimit(false);
                data.enableTPLimit(false);
                orderButtonHandler();
            }

            function enabledSltpValidationError() {
                AlertsManager.UpdateAlert(
                    AlertTypes.GeneralOkAlert,
                    Dictionary.GetItem('pleaseNoteTitle'),
                    Dictionary.GetItem('sltpValidationMsg', 'deals_NewLimit'),
                    null,
                    { okButtonCallback: ignoreSltpValidationError }
                );
                AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
            }

            function setChartProperties() {
                stateObject.update('stopLossRate', setLimitsModel.Data.stopLossRate);
                stateObject.update('takeProfitRate', setLimitsModel.Data.takeProfitRate);
                stateObject.update('switchToRate', switchToRate);
                stateObject.update('chart', settings.chart);

                stateObject.set('transactionType', ko.observable());
                stateObject.get('transactionType')(eTransactionSwitcher.NewLimit);
            }

            function switchToRate() {
                setLimitsModel.SetActiveTab(eSetLimitsTabs.Rate);
            }

            function resetChartProperties() {
                if (!stateObject.containsKey('openLimit')) {
                    return;
                }

                stateObject.get('openLimit')('');
                stateObject.unset('openLimit');
            }

            function dispose() {
                setLimitsModel.Stop();
                fieldWrappers.dispose();
                fieldWrappers = null;
                resetChartProperties();
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                BaseOrder: baseOrder,
                OrderButtonHandler: orderButtonHandler,
                ExpirationDate: expirationDateModel,
                TPField: setLimitsModel.TPField,
                SLField: setLimitsModel.SLField,
                SetLimitsInfo: setLimitsModel.ObservableSetLimitsObject,
                LimitLevelField: parent.LimitLevelField,
                FieldWrappers: fieldWrappers
            };
        });

        return {
            ViewModel: NewLimitModule
        };
    }
);
