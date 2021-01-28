define(
    'deviceviewmodels/Deals/Modules/EditClosingLimitModule',
    [
        'require',
        'Dictionary',
        'knockout',
        'handlers/general',
        'managers/CustomerProfileManager',
        'cachemanagers/activelimitsmanager',
        'StateObject!Transaction',
        'viewmodels/Deals/EditClosingLimitBaseViewModel'
    ],
    function EditClosingLimitModuleDefault(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            activeLimitsManager = require('cachemanagers/activelimitsmanager'),
            stateObject = require('StateObject!Transaction'),
            EditClosingLimitBaseViewModel = require('viewmodels/Deals/EditClosingLimitBaseViewModel');

        var EditClosingLimitModule = general.extendClass(EditClosingLimitBaseViewModel, function EditClosingLimitModuleClass() {
            var self = this,
                parent = this.parent, // inherited from EditClosingLimitBaseViewModel
                data = this.Data, // inherited from EditClosingLimitBaseViewModel
                validationModel = {},
                expirationDateModel = parent.ExpirationDate,
                setLimitsModel = parent.SetLimitsModel;

            var init = function (customSettings) {
                if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                    stateObject.set('stateObjectIsReadyDefer', Q.defer());
                }

                parent.init.call(self, customSettings);

                setObservables();
                setComputables();
                setSubscribers();

                updateViewModelData();

                setLimitsModel.Start(setLimitsModelDependencies);

                setViewByUserProfile();

                stateObject.get('stateObjectIsReadyDefer').resolve();
            };

            var setObservables = function () {
                data.enableSLLimit = ko.observable(false);
                data.enableTPLimit = ko.observable(false);
                data.showTools = stateObject.set('showTools', ko.observable(false));
            };

            var setComputables = function () {
                data.focusOnSlRate = self.createComputed(function () {
                    return setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Rate;
                });

                data.focusOnTpRate = self.createComputed(function () {
                    return setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Rate;
                });
            };

            var setSubscribers = function () {
                self.subscribeTo(data.showTools, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();
                    profileCustomer.editClosingLimitTools = Number(isExpanded);
                    customerProfileManager.ProfileCustomer(profileCustomer);
                });
            };

            var updateViewModelData = function () {
                parent.updateViewModelData();

                if (data.selectedDeal()) {
                    var closingLimitId;

                    if (data.limitType() === eLimitType.StopLoss) {
                        closingLimitId = data.selectedDeal().slID;
                    }
                    else {
                        closingLimitId = data.selectedDeal().tpID;
                    }

                    data.closingLimit(activeLimitsManager.limits.GetItem(closingLimitId));

                    if (!general.isNullOrUndefined(data.closingLimit()) && !general.isEmptyValue(data.closingLimit().expirationDate)) {
                        expirationDateModel.SetOrder(closingLimitId);
                    }
                }
            };

            var setViewByUserProfile = function () {
                var profileCustomer = customerProfileManager.ProfileCustomer();
                data.showTools(profileCustomer.editClosingLimitTools === 1);
            };

            var setLimitsModelDependencies = function () {
                validationModel.Limits = parent.getLimitsValidationModel();

                parent.createAmountFieldsWrappers();

                var slRateTooltip = ko.observable(false);
                var tpRateTooltip = ko.observable(false);

                // SL rate tooltip validation
                setLimitsModel.Data.stopLossRate.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curSlActiveTab() === eSetLimitsTabs.Rate || setLimitsModel.Data.curSlActiveTab() === setLimitsModel.Data.defaultTab) && slRateTooltip();
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

                // TP rate tooltip validation
                setLimitsModel.Data.takeProfitRate.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsModel.Data.curTpActiveTab() === eSetLimitsTabs.Rate || setLimitsModel.Data.curTpActiveTab() === setLimitsModel.Data.defaultTab) && tpRateTooltip();
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

                // reset toolpip visibility
                self.addDisposable(
                    ko.postbox.subscribe('edit-deal-limit-show-validation-tooltips', function () {
                        slRateTooltip(true);
                        tpRateTooltip(true);
                    })
                );

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

        return {
            ViewModel: EditClosingLimitModule
        };
    }
);
