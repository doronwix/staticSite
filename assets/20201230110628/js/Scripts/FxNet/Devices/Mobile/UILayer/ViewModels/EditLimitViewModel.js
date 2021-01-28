define(
    'deviceviewmodels/EditLimitViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'configuration/initconfiguration',
        'managers/CustomerProfileManager',
        'Dictionary',
        'viewmodels/Limits/EditLimitBaseViewModel',
        'StateObject!Transaction',
        'cachemanagers/activelimitsmanager',
        'managers/viewsmanager'
    ],
    function EditLimitClassDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            settings = require('configuration/initconfiguration').EditLimitSettingsConfiguration,
            customerProfileManager = require('managers/CustomerProfileManager'),
            dictionary = require('Dictionary'),
            EditLimitBaseViewModel = require('viewmodels/Limits/EditLimitBaseViewModel'),
            stateObject = require('StateObject!Transaction'),
            ActiveLimitsManager = require('cachemanagers/activelimitsmanager'),
            ViewsManager = require('managers/viewsmanager');

        var EditLimitViewModel = general.extendClass(EditLimitBaseViewModel, function EditLimitClass() {
            var self = this,
                parent = this.parent, // inherited from EditLimitBaseViewModel
                data = this.Data, // inherited from EditLimitBaseViewModel
                validationModel = parent.ValidationModel,
                fieldWrappers = parent.FieldWrappers,
                setLimitsViewModel = parent.SetLimitsViewModel;

            function init(customSettings) {
                stateObject.update(eStateObjectTopics.ReadyForUse, false);

                parent.init.call(self, customSettings); // inherited from EditLimitBaseViewModel

                setObservables();
                setSubscribers();

                setLimitsViewModel.Start(setLimitsModelDependencies);
                setViewByUserProfile();
                stateObject.update(eStateObjectTopics.ReadyForUse, true);
                stateObject.update('PageName', data.PageName);
            }

            function setObservables() {
                data.showTools = ko.observable(true);
                data.isAdditionalInfoExpanded = ko.observable(false);
            }

            function setSubscribers() {
                self.subscribeTo(data.isAdditionalInfoExpanded, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();

                    profileCustomer.isEditLimitInfoExpanded = Number(isExpanded);
                    customerProfileManager.ProfileCustomer(profileCustomer);
                });
            }

            function setViewByUserProfile() {
                var profileCustomer = customerProfileManager.ProfileCustomer();
                data.isAdditionalInfoExpanded(profileCustomer.isEditLimitInfoExpanded === 1);
            }

            function setLimitsModelDependencies() {
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

                    setLimitsViewModel.Data.stopLossRate("");
                    setLimitsViewModel.Data.stopLossAmount("");
                    setLimitsViewModel.Data.stopLossPercent("");
                    fieldWrappers.Data.stopLossInCustomerCcy("");
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
            }

            function setTakeProfitDependencies() {
                self.subscribeTo(data.enableTPLimit, function (enabled) {
                    if (enabled) {
                        return;
                    }

                    setLimitsViewModel.Data.takeProfitRate("");
                    setLimitsViewModel.Data.takeProfitAmount("");
                    setLimitsViewModel.Data.takeProfitPercent("");
                    fieldWrappers.Data.takeProfitInCustomerCcy("");
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
            }

            function toggleAdditionalInfoExpanded() {
                data.isAdditionalInfoExpanded(!data.isAdditionalInfoExpanded());
            }

            return {
                init: init,
                Data: data,
                ToggleAdditionalInfoExpanded: toggleAdditionalInfoExpanded
            };
        });

        function handleInvalidViewModel() {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert,
                dictionary.GetItem('GenericAlert'),
                dictionary.GetItem('OrderError7'),
                null,
                { redirectToView: eForms.Limits });
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
        }

        function validateViewModel() {
            var selectedLimit = ActiveLimitsManager.limits.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditLimit).orderId);

            return selectedLimit !== null && typeof selectedLimit !== 'undefined';
        }

        var createViewModel = function () {
            if (!validateViewModel()) {
                handleInvalidViewModel();

                return { _valid: false };
            }

            var viewModel = new EditLimitViewModel();

            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
