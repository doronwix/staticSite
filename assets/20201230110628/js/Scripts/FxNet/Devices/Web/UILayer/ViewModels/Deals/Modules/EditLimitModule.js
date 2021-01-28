define(
    'deviceviewmodels/Deals/Modules/EditLimitModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/CustomerProfileManager',
        'StateObject!Transaction',
        'viewmodels/Limits/EditLimitBaseViewModel'
    ],
    function EditLimitModuleDefault(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            stateObject = require('StateObject!Transaction'),
            EditLimitBaseViewModel = require('viewmodels/Limits/EditLimitBaseViewModel');

        var EditLimitModule = general.extendClass(EditLimitBaseViewModel, function EditLimitModuleClass() {
            var self = this,
                parent = this.parent, // inherited from EditLimitBaseViewModel
                data = this.Data, // inherited from EditLimitBaseViewModel
                validationModel = parent.ValidationModel,
                isValid = ko.observable(false),
                fieldWrappers = parent.FieldWrappers,
                setLimitsViewModel = parent.SetLimitsViewModel;

            var init = function (customSettings) {
                if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                    stateObject.set('stateObjectIsReadyDefer', Q.defer());
                }

                parent.init.call(self, customSettings); // inherited from EditLimitBaseViewModel    

                setObservables();
                setComputables();
                setSubscribers();

                setLimitsViewModel.Start(setLimitsModelDependencies);

                setViewByUserProfile();

                stateObject.get('stateObjectIsReadyDefer').resolve();
            };

            var setObservables = function () {
                data.showLimitsSlideCompleted = ko.observable(false);

                //Limits
                data.toggleLimitsSection = function () {
                    var currentValue = !!data.showLimits();
                    data.showLimits(!currentValue);
                };

                //Tools
                data.showTools = stateObject.set('showTools', ko.observable(false));

                data.corporateActionDate(general.str2Date(data.corporateActionDate(), "d/m/Y H:M"));
            };

            var setComputables = function () {
                data.showSLSummary = self.createComputed(function () {
                    var displaySummary = !!ko.utils.unwrapObservable(setLimitsViewModel.Data.displaySLSummary);

                    return !data.showLimits() && data.enableSLLimit() && displaySummary;
                });

                data.showTPSummary = self.createComputed(function () {
                    var displaySummary = !!ko.utils.unwrapObservable(setLimitsViewModel.Data.displayTPSummary);

                    return !data.showLimits() && data.enableTPLimit() && displaySummary;
                });

                data.showLimitsSummary = self.createComputed(function () {
                    return data.showSLSummary() || data.showTPSummary();
                });

            };

            var setSubscribers = function () {
                self.subscribeTo(data.showTools, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();
                    profileCustomer.editLimitTools = Number(isExpanded);
                    customerProfileManager.ProfileCustomer(profileCustomer);
                });

                self.subscribeTo(data.EditLimitReady, (function (value) {
                    isValid(value);
                }));

                self.subscribeTo(data.showLimits, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();
                    profileCustomer.editLimitIfDoneExpanded = Number(isExpanded);
                    customerProfileManager.ProfileCustomer(profileCustomer);

                    data.showLimitsSlideCompleted(false);

                    if (!isExpanded && data.ViewModelReady()) {
                        // SL
                        setLimitsViewModel.Data.stopLossRate.closeTooltip();
                        fieldWrappers.Data.stopLossInCustomerCcy.closeTooltip();
                        setLimitsViewModel.Data.stopLossPercent.closeTooltip();

                        // TP
                        setLimitsViewModel.Data.takeProfitRate.closeTooltip();
                        fieldWrappers.Data.takeProfitInCustomerCcy.closeTooltip();
                        setLimitsViewModel.Data.takeProfitPercent.closeTooltip();
                    }
                });

                self.subscribeTo(data.showLimitsSlideCompleted, function (slideCompleted) {
                    if (slideCompleted && data.showLimits()) {
                        // SL
                        setLimitsViewModel.Data.stopLossRate.resetTooltip();
                        fieldWrappers.Data.stopLossInCustomerCcy.resetTooltip();
                        setLimitsViewModel.Data.stopLossPercent.resetTooltip();

                        // TP
                        setLimitsViewModel.Data.takeProfitRate.resetTooltip();
                        fieldWrappers.Data.takeProfitInCustomerCcy.resetTooltip();
                        setLimitsViewModel.Data.takeProfitPercent.resetTooltip();
                    }
                });
            };

            var setViewByUserProfile = function () {
                var profileCustomer = customerProfileManager.ProfileCustomer();
                data.showTools(profileCustomer.editLimitTools === 1);
            };

            var setLimitsModelDependencies = function () {
                validationModel.Limits = ko.validatedObservable({
                    stopLossAmount: setLimitsViewModel.Data.stopLossAmount,
                    takeProfitAmount: setLimitsViewModel.Data.takeProfitAmount,
                    ccySLAmount: setLimitsViewModel.Data.ccySLAmount,
                    ccyTPAmount: setLimitsViewModel.Data.ccyTPAmount,
                    stopLossRate: setLimitsViewModel.Data.stopLossRate,
                    takeProfitRate: setLimitsViewModel.Data.takeProfitRate,
                    stopLossPercent: setLimitsViewModel.Data.stopLossPercent,
                    takeProfitPercent: setLimitsViewModel.Data.takeProfitPercent
                });

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
                            return (setLimitsViewModel.Data.curSlActiveTab() == eSetLimitsTabs.Amount || setLimitsViewModel.Data.curSlActiveTab() == setLimitsViewModel.Data.defaultTab) && slAmountTooltip();
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
                setLimitsViewModel.Data.stopLossRate.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsViewModel.Data.curSlActiveTab() == eSetLimitsTabs.Rate || setLimitsViewModel.Data.curSlActiveTab() == setLimitsViewModel.Data.defaultTab) && slRateTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.stopLossRate.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        slRateTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.stopLossRate, function () {
                    slRateTooltip(false);
                });

                // SL percent tooltip validation
                setLimitsViewModel.Data.stopLossPercent.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsViewModel.Data.curSlActiveTab() === eSetLimitsTabs.Percent || setLimitsViewModel.Data.curSlActiveTab() === setLimitsViewModel.Data.defaultTab) && slPercentTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.stopLossPercent.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        slPercentTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.stopLossPercent, function () {
                    slPercentTooltip(false);
                });

                // TP amount tooltip validation
                fieldWrappers.Data.takeProfitInCustomerCcy.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsViewModel.Data.curTpActiveTab() === eSetLimitsTabs.Amount || setLimitsViewModel.Data.curTpActiveTab() == setLimitsViewModel.Data.defaultTab) && tpAmountTooltip();
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
                setLimitsViewModel.Data.takeProfitRate.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsViewModel.Data.curTpActiveTab() == eSetLimitsTabs.Rate || setLimitsViewModel.Data.curTpActiveTab() == setLimitsViewModel.Data.defaultTab) && tpRateTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.takeProfitRate.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        tpRateTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.takeProfitRate, function () {
                    tpRateTooltip(false);
                });

                // TP percent tooltip validation
                setLimitsViewModel.Data.takeProfitPercent.extend({
                    tooltipValidation: {
                        message: Dictionary.GetItem("txtRateValidationTooltip", null, ""),
                        showTooltip: function () {
                            return (setLimitsViewModel.Data.curTpActiveTab() === eSetLimitsTabs.Percent || setLimitsViewModel.Data.curTpActiveTab() === setLimitsViewModel.Data.defaultTab) && tpPercentTooltip();
                        }
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.takeProfitPercent.tooltipClosed, function (isClosed) {
                    if (isClosed) {
                        tpPercentTooltip(false);
                    }
                });

                self.subscribeTo(setLimitsViewModel.Data.takeProfitPercent, function () {
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
                parent.setLimitTabsFromClientProfile();
            };
            var dispose = function () {
                parent.dispose.call(self);
            };

            return {
                init: init,
                Data: data,
                dispose: dispose,
                IsValid: isValid
            };
        });

        return {
            ViewModel: EditLimitModule
        };
    }
);
