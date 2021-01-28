define(
    'deviceviewmodels/EditClosingLimitViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'configuration/initconfiguration',
        'managers/CustomerProfileManager',
        'viewmodels/Deals/EditClosingLimitBaseViewModel',
        'StateObject!Transaction',
        'managers/viewsmanager',
        'Dictionary',
        'cachemanagers/dealsmanager'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            settings = require('configuration/initconfiguration').EditClosingLimitConfiguration,
            customerProfileManager = require('managers/CustomerProfileManager'),
            EditClosingLimitBaseViewModel = require('viewmodels/Deals/EditClosingLimitBaseViewModel'),
            stateObject = require('StateObject!Transaction'),
            ViewsManager = require('managers/viewsmanager'),
            dictionary = require('Dictionary'),
            dealsManager = require('cachemanagers/dealsmanager');

        var EditClosingLimitViewModel = general.extendClass(EditClosingLimitBaseViewModel, function () {
            var self = this,
                parent = this.parent, // inherited from EditClosingLimitBaseViewModel
                data = this.Data, // inherited from EditClosingLimitBaseViewModel
                validationModel = {},
                setLimitsModel = parent.SetLimitsModel;

            function init(customSettings) {
                stateObject.update(eStateObjectTopics.ReadyForUse, false);
                parent.init.call(self, customSettings);

                setObservables();
                setSubscribers();

                updateViewModelData();

                setLimitsModel.Start(setLimitsModelDependencies);

                setViewByUserProfile();
                stateObject.update(eStateObjectTopics.ReadyForUse, true);
                stateObject.update('PageName', data.PageName);
            }

            function setObservables() {
                data.showTools = ko.observable(true);
                data.isAdditionalInfoExpanded = ko.observable(false);
            }

            function setSubscribers() {
                self.subscribeTo(data.isAdditionalInfoExpanded,
                    function (isExpanded) {
                        var profileCustomer = customerProfileManager.ProfileCustomer();
                        profileCustomer.isAdditionalInfoExpanded = Number(isExpanded);
                        customerProfileManager.ProfileCustomer(profileCustomer);
                    });
            }

            function updateViewModelData() {
                parent.updateViewModelData();
            }

            function setLimitsModelDependencies() {
                validationModel.Limits = parent.getLimitsValidationModel();

                parent.createAmountFieldsWrappers();

                setStopLossDependencies();
                setTakeProfitDependencies();

                data.limitsReady(true);
            }

            function setStopLossDependencies() {
                self.subscribeTo(setLimitsModel.Data.stopLossPercent, function (stopLossPercent) {
                    data.displaySlPercentSymbol(!general.isEmptyValue(stopLossPercent) && stopLossPercent !== "NA");
                });

                self.subscribeTo(data.stopLossInCustomerCcy, function (stopLossInCustomerCcy) {
                    data.displaySlAmountCcySymbol(!general.isEmptyValue(stopLossInCustomerCcy) && stopLossInCustomerCcy !== "NA");
                });
            }

            function setTakeProfitDependencies() {
                self.subscribeTo(setLimitsModel.Data.takeProfitPercent, function (takeProfitPercent) {
                    data.displayTpPercentSymbol(!general.isEmptyValue(takeProfitPercent) && takeProfitPercent !== "NA");
                });

                self.subscribeTo(data.takeProfitInCustomerCcy, function (takeProfitInCustomerCcy) {
                    data.displayTpAmountCcySymbol(!general.isEmptyValue(takeProfitInCustomerCcy) && takeProfitInCustomerCcy !== "NA");
                });
            }

            function setViewByUserProfile() {
                var profileCustomer = customerProfileManager.ProfileCustomer();
                data.isAdditionalInfoExpanded(profileCustomer.isAdditionalInfoExpanded === 1);
            }

            function toggleAdditionalInfoExpanded() {
                data.isAdditionalInfoExpanded(!data.isAdditionalInfoExpanded());
            }

            return {
                init: init,
                Data: data,
                TPField: setLimitsModel.TPField,
                SLField: setLimitsModel.SLField,
                SetLimitsInfo: setLimitsModel.Data,
                SetLimitsViewProperties: setLimitsModel.ViewProperties,
                ToggleAdditionalInfoExpanded: toggleAdditionalInfoExpanded
            };
        });

        function handleInvalidViewModel() {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert,
                dictionary.GetItem("GenericAlert"),
                dictionary.GetItem('OrderError7'),
                null,
                { redirectToView: eForms.OpenDeals });
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
        }

        function validateViewModel() {
            var selectedDeal = dealsManager.Deals.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditClosingLimit).orderId);
            return selectedDeal !== null && typeof selectedDeal !== 'undefined';
        }

        var createViewModel = function () {
            if (!validateViewModel()) {
                handleInvalidViewModel();
                return { _valid: false };
            }

            var viewModel = new EditClosingLimitViewModel();

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
