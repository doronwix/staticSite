define(
    'deviceviewmodels/BackOffice/EditClosingLimitViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'configuration/initconfiguration',
        'cachemanagers/activelimitsmanager',
        'StateObject!Transaction',
        'viewmodels/Deals/EditClosingLimitBaseViewModel',
        'LoadDictionaryContent!deals_EditClosingLimit',
        'cachemanagers/dealsmanager',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'deviceviewmodels/BaseOrder',
        'dataaccess/dalTransactions'
    ],
    function ExtendedEditClosingLimitDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            settings = require('configuration/initconfiguration').EditClosingLimitConfiguration,
            activeLimitsManager = require('cachemanagers/activelimitsmanager'),
            stateObject = require('StateObject!Transaction'),
            EditClosingLimitBaseViewModel = require('viewmodels/Deals/EditClosingLimitBaseViewModel'),
            dealsManager = require('cachemanagers/dealsmanager'),
            StatesManager = require('devicemanagers/StatesManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            dalTransactions = require('dataaccess/dalTransactions');

        var ExtendedEditClosingLimitViewModel = general.extendClass(EditClosingLimitBaseViewModel, function ExtendedEditClosingLimitClass() {
            var self = this,
                parent = this.parent, // inherited from EditClosingLimitBaseViewModel
                data = this.Data, // inherited from EditClosingLimitBaseViewModel
                expirationDateModel = parent.ExpirationDate,
                setLimitsModel = parent.SetLimitsModel,
                baseOrder = new BaseOrder(),
                PositionNotFoundErrorKey = 'OrderError8';

            var init = function (customSettings) {
                if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                    stateObject.set('stateObjectIsReadyDefer', Q.defer());
                }

                parent.init.call(self, customSettings);

                setObservables();
                setComputables();
                extendEditDeleteClosingLimit();

                updateViewModelData();

                setLimitsModel.Start(setLimitsModelDependencies);

                stateObject.get('stateObjectIsReadyDefer').resolve();
            };

            var setObservables = function () {
                data.enableSLLimit = ko.observable(false);
                data.enableTPLimit = ko.observable(false);
            };

            var setComputables = function () {
                data.UpdateButtonEnabled = self.createComputed(function () {
                    var isDirtyLimits = data.setLimitsIsDirty(),
                        viewModelReady = data.limitsReady(),
                        isProcessing = data.isProcessing(),
                        isExpirationDateDirty = expirationDateModel.Data.isExpirationDateDirty(),
                        hasClosingLimit = !general.isNullOrUndefined(data.closingLimit());

                    return (viewModelReady && !isProcessing && (isDirtyLimits || (isExpirationDateDirty && hasClosingLimit)));
                });

                data.focusOnSlRate = self.createComputed(function () {
                    return setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Rate;
                });

                data.focusOnTpRate = self.createComputed(function () {
                    return setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Rate;
                });
            };

            var updateViewModelData = function () {
                parent.updateViewModelData();

                if (data.selectedDeal()) {
                    var closingLimitId;

                    if (data.limitType() === eLimitType.StopLoss) {
                        closingLimitId = data.selectedDeal().slID;
                    } else {
                        closingLimitId = data.selectedDeal().tpID;
                    }

                    data.closingLimit(activeLimitsManager.limits.GetItem(closingLimitId));
                    if (!general.isNullOrUndefined(data.closingLimit()) && !general.isEmptyValue(data.closingLimit().expirationDate)) {
                        expirationDateModel.SetOrder(closingLimitId);
                    }
                }
            };

            var setLimitsModelDependencies = function () {
                createAmountFieldsWrappers();
                // ------------------------------------------------------------
                // Stop Loss
                // ------------------------------------------------------------
                self.subscribeTo(setLimitsModel.Data.stopLossPercent, function (stopLossPercent) {
                    data.displaySlPercentSymbol(!general.isEmptyValue(stopLossPercent) && stopLossPercent !== "NA");
                });

                self.subscribeTo(data.stopLossInCustomerCcy, function (stopLossInCustomerCcy) {
                    data.displaySlAmountCcySymbol(!general.isEmptyValue(stopLossInCustomerCcy) && stopLossInCustomerCcy !== "NA");
                });

                // ------------------------------------------------------------
                // Take Profit
                // ------------------------------------------------------------
                self.subscribeTo(setLimitsModel.Data.takeProfitPercent, function (takeProfitPercent) {
                    data.displayTpPercentSymbol(!general.isEmptyValue(takeProfitPercent) && takeProfitPercent !== "NA");
                });

                self.subscribeTo(data.takeProfitInCustomerCcy, function (takeProfitInCustomerCcy) {
                    data.displayTpAmountCcySymbol(!general.isEmptyValue(takeProfitInCustomerCcy) && takeProfitInCustomerCcy !== "NA");
                });

                data.limitsReady(true);
            };

            var createAmountFieldsWrappers = function () {
                var slAmount = ko.observable(""),
                    tpAmount = ko.observable("");
                // Stop Loss
                self.subscribeTo(setLimitsModel.Data.ccySLAmount, function (value) {
                    var isAmountTabSelected = setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Amount;

                    if (!isAmountTabSelected) {
                        slAmount(value);
                    }
                });

                data.stopLossInCustomerCcy = self.createComputed({
                    read: function () {
                        var isAmountTabSelected = setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Amount,
                            rawValue,
                            amount = "";

                        if (!isAmountTabSelected) {
                            rawValue = setLimitsModel.Data.ccySLAmount();
                        } else {
                            rawValue = slAmount();
                        }

                        if (rawValue === "NA") {
                            return rawValue;
                        }

                        if (rawValue !== "" && !isNaN(rawValue)) {
                            amount = Number(rawValue);
                            amount = amount < 0 ? Math.floor(amount) : Math.ceil(amount);
                        }

                        return amount;
                    }
                });

                self.subscribeTo(setLimitsModel.Data.ccyTPAmount, function (value) {
                    var isAmountTabSelected = setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Amount;

                    if (!isAmountTabSelected) {
                        tpAmount(value);
                    }
                });

                // Take Profit
                data.takeProfitInCustomerCcy = self.createComputed({
                    read: function () {
                        var isAmountTabSelected = setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Amount,
                            rawValue,
                            amount = "";

                        if (!isAmountTabSelected) {
                            rawValue = setLimitsModel.Data.ccyTPAmount();
                        } else {
                            rawValue = tpAmount();
                        }

                        if (rawValue === "NA") {
                            return rawValue;
                        }

                        if (rawValue !== "" && !isNaN(rawValue)) {
                            amount = Number(rawValue);
                            amount = amount < 0 ? Math.floor(amount) : Math.ceil(amount);
                        }

                        return amount;
                    }
                });
            };

            var deleteLimit = function () {
                if (!data.hasRateAdded()) {
                    return;
                }

                if (data.limitType() === eLimitType.StopLoss) {
                    setLimitsModel.Data.stopLossRate("");
                } else if (data.limitType() === eLimitType.TakeProfit) {
                    setLimitsModel.Data.takeProfitRate("");
                } else {
                    return;
                }

                saveLimit();
            };

            var editClosingLimit = function () {
                var selectedDeal = dealsManager.Deals.GetItem(data.orderID());

                if (StatesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    return false;
                }

                if (general.isNullOrUndefined(selectedDeal)) {
                    displayAlert(PositionNotFoundErrorKey);
                    return;
                }

                var limits = parent.FillLimitsData(),
                    editClosingLimitConfig = { failCallback: onEditClosingLimitFail };

                if (!general.isNullOrUndefined(limits) && limits.length > 0) {
                    data.isProcessing(true);
                    dalTransactions.SaveLimits(limits, onActionReturn, editClosingLimitConfig);
                }
            }

            var onEditClosingLimitRetry = function (requestData) {
                var editClosingLimitConfig = { forceRetry: true, failCallback: onEditClosingLimitFail };
                dalTransactions.SaveLimits(requestData, onActionReturn, editClosingLimitConfig);
            };

            var saveLimit = debounce(editClosingLimit, 300, true);

            var onEditClosingLimitFail = function () { data.isProcessing(false); }

            var extendEditDeleteClosingLimit = function () {
                parent.EditLimit = saveLimit;
                parent.DeleteLimit = deleteLimit;
            };

            function onActionReturn(result, callerId, instrumentId, requestData) {
                var selectedDeal = dealsManager.Deals.GetItem(data.orderID());

                if (!selectedDeal) {
                    return;
                }

                var instrument = InstrumentsManager.GetInstrument(selectedDeal.instrumentID);
                if (!instrument) {
                    return;
                }

                data.isProcessing(false);
                var params = {},
                    onActionReturnArgs = {
                        requestData: requestData,
                        tradingEnabledRetry: onEditClosingLimitRetry
                    };

                if (settings.redirectToOpenDeals) {
                    params.redirectToView = eForms.OpenDeals;
                }

                if ('valueDate' in selectedDeal) {
                    params.valueDate = selectedDeal.valueDate;
                }

                baseOrder.OnActionReturn(result, callerId, instrument, general.extendType(params, onActionReturnArgs));
            }

            function displayAlert(key) {
                AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem(key), null, { redirectToView: eForms.OpenDeals });
                AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
            }

            var dispose = function () {
                parent.dispose.call(self);
            };

            return {
                init: init,
                dispose: dispose,
                Data: data,
                TPField: setLimitsModel.TPField,
                SLField: setLimitsModel.SLField,
                SetLimitsInfo: setLimitsModel.Data,
                SetLimitsViewProperties: setLimitsModel.ViewProperties
            };
        });

        var createViewModel = function () {
            var viewModel = new ExtendedEditClosingLimitViewModel();

            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    });