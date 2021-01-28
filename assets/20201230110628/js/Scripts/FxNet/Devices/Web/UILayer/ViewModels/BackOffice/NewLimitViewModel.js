/* global eStartSpinFrom */
define(
    'deviceviewmodels/BackOffice/NewLimitViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'Q',
        'configuration/initconfiguration',
        'dataaccess/dalTransactions',
        'initdatamanagers/Customer',
        'modules/permissionsmodule',
        'initdatamanagers/InstrumentsManager',
        'FxNet/LogicLayer/Deal/DealLifeCycle',
        'viewmodels/Limits/AmountFieldsWrapper',
        'viewmodels/Limits/LimitBaseViewModel',
        'StateObject!Transaction',
        'LoadDictionaryContent!deals_newlimit',
        'Dictionary',
        'devicemanagers/AlertsManager',
        'handlers/limit'
    ],
    function NewLimitDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            settings = require('configuration/initconfiguration').NewLimitConfiguration,
            Q = require('Q'),
            dalTransactions = require('dataaccess/dalTransactions'),
            customer = require('initdatamanagers/Customer'),
            permissionsModule = require('modules/permissionsmodule'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            dealLifeCycle = require('FxNet/LogicLayer/Deal/DealLifeCycle'),
            AmountFieldsWrapper = require('viewmodels/Limits/AmountFieldsWrapper'),
            LimitBaseViewModel = require('viewmodels/Limits/LimitBaseViewModel'),
            stateObject = require('StateObject!Transaction'),
            Dictionary = require('Dictionary'),
            limit = require('handlers/limit'),
            AlertsManager = require('devicemanagers/AlertsManager');

        var NewLimitViewModel = general.extendClass(LimitBaseViewModel, function NewLimitClass() {
            var self = this,
                parent = this.parent, // inherited from LimitBaseViewModel
                data = this.Data, // inherited from LimitBaseViewModel
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
                setObservables();
                setValidators();
                setComputables();
                setSubscribers();
                parent.registerToDispatcher();
                setLimitsModel.Start(setLimitsModelDependencies);
                stateObject.get('stateObjectIsReadyDefer').resolve();
            }

            function setObservables() {
                data.sharesDividendDate = ko.observable();
                data.corporateActionDate = ko.observable();
                data.showShareCorporateActionDealInfo = ko.observable();
                data.showShareDividendDealInfo = ko.observable();
                data.showFutureRolloverDealInfo = ko.observable("");
                data.futuresRolloverDate = ko.observable("");
            }

            function setComputables() {
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
                    var viewModelReady = data.hasInstrument() && data.limitsReady() && data.quotesAvailable(),
                        isLimitLevelValid = data.openLimit() > 0,
                        isBrokerAllowLimitsOnNoRates = customer.prop.brokerAllowLimitsOnNoRates,
                        isExpirationDateTimeValid = expirationDateModel.IsValid(),
                        isOrderDirSelected = data.isShowBuyBox() || data.isShowSellBox(),
                        hasDealMinMaxAmounts = data.dealMinMaxAmounts().length > 0;

                    return (!data.isProcessing() && (isBrokerAllowLimitsOnNoRates) &&
                        isOrderDirSelected && viewModelReady && isLimitLevelValid && isExpirationDateTimeValid &&
                        hasDealMinMaxAmounts);
                });

                selectedInstrumentWrapper = self.createComputed(function () {
                    return data.selectedInstrument();
                });
            }

            function setSubscribers() {
                self.subscribeAndNotify(selectedInstrumentWrapper, function (instrumentId) {
                    var instrument = instrumentsManager.GetInstrument(instrumentId);

                    if (instrument) {
                        data.sharesDividendDate(general.str2Date(instrument.eventDate, "d/m/Y H:M"));
                        data.corporateActionDate(general.str2Date(instrument.getCorporateActionDate(), "d/m/Y H:M"));
                        data.futuresRolloverDate(general.str2Date(instrument.eventDate, "d/m/Y H:M"));

                        data.showShareCorporateActionDealInfo(dealLifeCycle.sharesIsCorporateActionDateSignificant_BeforeDeal(customer.prop.dealPermit, instrument.assetTypeId, instrument.getCorporateActionDate()));
                        data.showShareDividendDealInfo(dealLifeCycle.sharesIsDividendDateSignificant_BeforeDeal(customer.prop.dealPermit, instrument.assetTypeId, instrument.getCorporateActionDate(), instrument.getInstrumentDividendDate()));
                        data.showFutureRolloverDealInfo(dealLifeCycle.futuresIsRolloverDateSignificant_BeforeDeal(customer.prop.dealPermit, instrument.assetTypeId, instrument.getInstrumentRolloverDate()));
                    }
                });
            }

            function setLimitsModelDependencies() {
                fieldWrappers.init(setLimitsModel, data);

                setStopLossDependencies();
                setTakeProfitDependencies();

                data.limitsReady(true);
                setInitialLimitsActiveTab(eSetLimitsTabs.Rate);
            }

            function setInitialLimitsActiveTab(activeTab) {
                setLimitsModel.Data.curSlActiveTab(activeTab);
                setLimitsModel.Data.curTpActiveTab(activeTab);
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
                            var isAllowLimits = customer.prop.brokerAllowLimitsOnNoRates;
                            return general.isEmptyValue(selectedInstrument) || isAllowLimits;
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

                if (!permissionsModule.CheckActionAllowed('newLimit', true, { register: registerParams.traderInstrumentId + data.selectedInstrument() + registerParams.traderOrderDir + (data.orderDir() === 0 ? "Sell" : "Buy") })) {
                    return;
                }

                var isSelectedDealAmountValid = general.isFunctionType(data.selectedDealAmount.isValid) ? data.selectedDealAmount.isValid() : false;

                if (!isSelectedDealAmountValid) {
                    ko.postbox.publish('deal-slip-show-validation-tooltips');
                    return;
                }

                if (baseOrder.LimitValidateQuote(data.selectedInstrument())) {
                    addLimit();
                }
            }

            function addLimit() {
                var newLimit = new limit();
                parent.fillData(newLimit);

                if (newLimit.ifDoneSLRate === 'NA' || newLimit.ifDoneTPRate === 'NA') {
                    var alertError = Dictionary.GetItem('txtRateValidationTooltip', null, '').split(".");
                    AlertsManager.UpdateAlert(AlertTypes.GeneralOkAlert, Dictionary.GetItem("pleaseNoteTitle"), alertError.length ? alertError[0] : '', null, {});
                    AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
                    return;
                }

                data.isProcessing(true);
                data.hasInstrument(false);
                dalTransactions.AddLimit(newLimit, onAddLimit);
            }

            function setOrderDir(orderDir) {
                if (orderDir != eOrderDir.Buy && orderDir != eOrderDir.Sell && orderDir != eOrderDir.None) {
                    orderDir = eOrderDir.None;
                }

                data.orderDir(orderDir);
            }

            function resetDealValues() {
                data.openLimit(String.empty);
                setOrderDir(eOrderDir.None);

                setLimitsModel.Data.stopLossRate(String.empty);
                setLimitsModel.Data.takeProfitRate(String.empty);

                data.enableSLLimit(false);
                data.enableTPLimit(false);
            }

            function onAddLimit(result, callerId, instrumentid, requestData) {
                data.hasInstrument(true);
                data.isProcessing(false);

                var instrument = instrumentsManager.GetInstrument(instrumentid),
                    redirectToView = self.getSettings().onSuccessRedirectTo;

                var onActionReturnArgs = {
                    requestData: requestData,
                    tradingEnabledRetry: addLimitRetry
                };

                if (instrument) {
                    if (baseOrder.ResultStatusSuccess(result)) {
                        resetDealValues();
                    }

                    if (redirectToView) {
                        baseOrder.OnActionReturn(result, callerId, instrument, general.extendType({ redirectToView: redirectToView }, onActionReturnArgs));
                    } else {
                        baseOrder.OnActionReturn(result, callerId, instrument, onActionReturnArgs);
                    }
                }
            }

            function onAddLimitFail() {
                data.isProcessing(false);
            }

            function addLimitRetry(requestData) {
                data.hasInstrument(false);
                data.isProcessing(true);

                dalTransactions.AddLimit(requestData, onAddLimit, { forceRetry: true, failCallback: onAddLimitFail });
            }

            function dispose() {
                setLimitsModel.Stop();
                fieldWrappers.dispose();
                fieldWrappers = null;
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

        var createViewModel = function (params) {
            var viewModel = new NewLimitViewModel();

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