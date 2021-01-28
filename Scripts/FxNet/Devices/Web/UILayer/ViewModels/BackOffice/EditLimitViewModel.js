define(
    'deviceviewmodels/BackOffice/EditLimitViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'configuration/initconfiguration',
        'Dictionary',
        'StateObject!Transaction',
        'viewmodels/Limits/EditLimitBaseViewModel',
        'cachemanagers/activelimitsmanager',
        'managers/viewsmanager',
        'viewmodels/dialogs/DialogViewModel',
        'LoadDictionaryContent!deals_EditLimit',
        'initdatamanagers/InstrumentsManager',
        'deviceviewmodels/BaseOrder',
        'dataaccess/dalTransactions',
        'devicemanagers/AlertsManager',
        'handlers/limit'
    ],
    function ExtendedEditLimitViewModelDef(require) {
        var general = require('handlers/general'),
            settings = require('configuration/initconfiguration').EditLimitSettingsConfiguration,
            dictionary = require('Dictionary'),
            stateObject = require('StateObject!Transaction'),
            EditLimitBaseViewModel = require('viewmodels/Limits/EditLimitBaseViewModel'),
            ActiveLimitsManager = require('cachemanagers/activelimitsmanager'),
            ViewsManager = require('managers/viewsmanager'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            dalTransactions = require('dataaccess/dalTransactions'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            tLimit = require('handlers/limit'),
            selectedLimit = null;

        var ExtendedEditLimitViewModel = general.extendClass(
            EditLimitBaseViewModel,
            function ExtendedEditLimitViewModelClass() {
                var self = this,
                    parent = this.parent, // inherited from EditLimitBaseViewModel
                    data = this.Data, // inherited from EditLimitBaseViewModel
                    expirationDateModel = parent.ExpirationDate,
                    fieldWrappers = parent.FieldWrappers,
                    setLimitsViewModel = parent.SetLimitsViewModel,
                    baseOrder = new BaseOrder();

                function init(customSettings) {
                    if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                        stateObject.set('stateObjectIsReadyDefer', Q.defer());
                    }

                    parent.init.call(self, customSettings); // inherited from EditLimitBaseViewModel 
                    baseOrder.Init({}, data);
                    setComputables();
                    extendEditRemoveLimit();

                    setLimitsViewModel.Start(setLimitsModelDependencies);
                    setSlTpActiveTab(eSetLimitsTabs.Rate);

                    stateObject.get('stateObjectIsReadyDefer').resolve();
                }

                function setComputables() {
                    data.EditLimitReady = self.createComputed(function () {
                        var isDirtyOpenLimit = data.openLimit.isDirty(),
                            isDirtyLimitsModel = !!data.setLimitsIsDirty(),
                            isDirtyExpirationDateTime = expirationDateModel.Data.isExpirationDateDirty(),
                            isLimitLevelValid = data.openLimit && data.openLimit() > 0,
                            isDirty = (isDirtyOpenLimit || isDirtyLimitsModel || isDirtyExpirationDateTime),
                            isGuiContextAvailable = data.onSaveLimitEnable(),
                            isExpirationDateTimeValid = expirationDateModel.IsValid();

                        return isGuiContextAvailable && isExpirationDateTimeValid && isDirty && isLimitLevelValid;
                    }).extend({ notify: 'always' });
                }

                function editLimitInternal() {
                    if (!data.EditLimitReady()) {
                        return;
                    }

                    onSaveLimit();
                }

                var editLimit = debounce(editLimitInternal);

                function onRemoveLimit() {
                    if (!data.onRemoveLimitEnable()) {
                        return;
                    }

                    if (validate()) {
                        selectedLimit = ActiveLimitsManager.limits.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditLimit).orderId);

                        if (baseOrder.LimitValidateWithoutTradingStatus(selectedLimit.instrumentID) && baseOrder.LimitValidateQuote(selectedLimit.instrumentID)) {
                            var limit = new tLimit(selectedLimit.orderID),
                                deleteLimitConfig = { failCallback: onDeleteLimitFail };
                            parent.FillLimitData(limit);

                            data.isProcessing(true);
                            data.onRemoveLimitEnable(false);

                            dalTransactions.DeleteLimit(limit, onRemoveLimitReturn, deleteLimitConfig);
                        }
                    }
                }

                function onRemoveLimitReturn(result, callerId, requestData) {
                    data.onRemoveLimitEnable(true);
                    data.isProcessing(false);

                    var instrument = InstrumentsManager.GetInstrument(data.instrumentID());

                    if (instrument) {
                        baseOrder.OnActionReturn(result, callerId, instrument, { redirectToView: eForms.Limits, requestData: requestData });
                    }
                }

                function extendEditRemoveLimit() {
                    parent.EditLimit = editLimit;
                    parent.DeleteLimit = onRemoveLimit;
                }

                function onSaveLimitFail() {
                    data.isProcessing(false);
                }

                function onDeleteLimitFail() {
                    data.onRemoveLimitEnable(true);
                }

                function onSaveLimit() {
                    if (validate()) {
                        selectedLimit = ActiveLimitsManager.limits.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditLimit).orderId);

                        if (baseOrder.LimitValidateWithoutTradingStatus(selectedLimit.instrumentID) && baseOrder.LimitValidateQuote(selectedLimit.instrumentID)) {
                            var limit = new tLimit(selectedLimit.orderID),
                                editLimitConfig = { failCallback: onSaveLimitFail };
                            parent.FillLimitData(limit);

                            if (limit.ifDoneSLRate === 'NA' || limit.ifDoneTPRate === 'NA') {
                                var alertError = Dictionary.GetItem('txtRateValidationTooltip', null, '').split(".");
                                AlertsManager.UpdateAlert(AlertTypes.GeneralOkAlert, dictionary.GetItem("pleaseNoteTitle"), alertError.length ? alertError[0] : '', null, {});
                                AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
                                return;
                            }

                            limit.removedIfDoneSLRate = (0 == parseFloat(limit.ifDoneSLRate) && 0 < parseFloat(selectedLimit.slRate));
                            limit.removedIfDoneTPRate = (0 == parseFloat(limit.ifDoneTPRate) && 0 < parseFloat(selectedLimit.tpRate));

                            data.onSaveLimitEnable(false);
                            data.isProcessing(true);

                            dalTransactions.EditLimit(limit, onSaveLimitReturn, editLimitConfig);
                        }
                    }
                }

                function onSaveLimitRetry(requestData) {
                    var editLimitConfig = { forceRetry: true, failCallback: onSaveLimitFail, parsedData: true };
                    dalTransactions.EditLimit(requestData, onSaveLimitReturn, editLimitConfig);
                }

                function onSaveLimitReturn(result, callerId, requestData) {
                    data.onSaveLimitEnable(true);

                    selectedLimit = ActiveLimitsManager.limits.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditLimit).orderId);
                    var instrument = InstrumentsManager.GetInstrument(selectedLimit.instrumentID);
                    var onActionReturnArgs = {
                        requestData: requestData,
                        tradingEnabledRetry: onSaveLimitRetry
                    };

                    if (instrument) {
                        data.isProcessing(false);
                        setLimitsViewModel.MarkClean();
                        baseOrder.OnActionReturn(result, callerId, instrument, general.extendType({ redirectToView: eForms.Limits }, onActionReturnArgs));
                    }
                }

                function validate() {
                    selectedLimit = ActiveLimitsManager.limits.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditLimit).orderId);

                    if (!selectedLimit) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, String.format("{0}", Dictionary.GetItem("OrderError7")), null, { redirectToView: eForms.Limits });
                        AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                        return false;
                    }

                    return true;
                }

                function setSlTpActiveTab(limitTab) {
                    setLimitsViewModel.SetSlActiveTab(limitTab);
                    setLimitsViewModel.SetTpActiveTab(limitTab);
                }

                function setLimitsModelDependencies() {
                    // ------------------------------------------------------------
                    // Stop Loss
                    // ------------------------------------------------------------
                    self.subscribeTo(data.enableSLLimit, function (enabled) {
                        if (!enabled) {
                            setLimitsViewModel.Data.stopLossRate("");
                            setLimitsViewModel.Data.stopLossAmount("");
                            setLimitsViewModel.Data.stopLossPercent("");
                            fieldWrappers.Data.stopLossInCustomerCcy("");
                        }
                    });

                    self.subscribeTo(setLimitsViewModel.Data.curSlActiveTab, function (activeTab) {
                        data.isSlRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                        data.isSlAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                        data.isSlPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                    });

                    self.subscribeTo(setLimitsViewModel.Data.stopLossPercent, function (stopLossPercent) {
                        data.displaySlPercentSymbol(!general.isEmptyValue(stopLossPercent) && stopLossPercent !== "NA");
                    });

                    self.subscribeTo(fieldWrappers.Data.stopLossInCustomerCcy, function (stopLossInCustomerCcy) {
                        data.displaySlAmountCcySymbol(!general.isEmptyValue(stopLossInCustomerCcy) && stopLossInCustomerCcy !== "NA");
                    });

                    // ------------------------------------------------------------
                    // Take Profit
                    // ------------------------------------------------------------
                    self.subscribeTo(data.enableTPLimit, function (enabled) {
                        if (!enabled) {
                            setLimitsViewModel.Data.takeProfitRate("");
                            setLimitsViewModel.Data.takeProfitAmount("");
                            setLimitsViewModel.Data.takeProfitPercent("");
                            fieldWrappers.Data.takeProfitInCustomerCcy("");
                        }
                    });

                    self.subscribeTo(setLimitsViewModel.Data.curTpActiveTab, function (activeTab) {
                        data.isTpRateActiveTab(activeTab === eSetLimitsTabs.Rate);
                        data.isTpAmountActiveTab(activeTab === eSetLimitsTabs.Amount);
                        data.isTpPercentActiveTab(activeTab === eSetLimitsTabs.Percent);
                    });

                    self.subscribeTo(setLimitsViewModel.Data.takeProfitPercent, function (takeProfitPercent) {
                        data.displayTpPercentSymbol(!general.isEmptyValue(takeProfitPercent) && takeProfitPercent !== "NA");
                    });

                    self.subscribeTo(fieldWrappers.Data.takeProfitInCustomerCcy, function (takeProfitInCustomerCcy) {
                        data.displayTpAmountCcySymbol(!general.isEmptyValue(takeProfitInCustomerCcy) && takeProfitInCustomerCcy !== "NA");
                    });

                    // Update the limits ready flag
                    data.limitsReady(true);
                }

                function dispose() {
                    parent.dispose.call(self);
                }

                return {
                    init: init,
                    Data: data,
                    dispose: dispose
                };
            });

        function handleInvalidViewModel() {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, dictionary.GetItem("GenericAlert"), dictionary.GetItem('OrderError7'));
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

            DialogViewModel.close();
        }

        function validateViewModel() {
            selectedLimit = ActiveLimitsManager.limits.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditLimit).orderId);
            return selectedLimit !== null && typeof selectedLimit !== 'undefined';
        }

        var createViewModel = function () {
            if (!validateViewModel()) {
                handleInvalidViewModel();
                return { _valid: false };
            }

            var viewModel = new ExtendedEditLimitViewModel();

            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    });