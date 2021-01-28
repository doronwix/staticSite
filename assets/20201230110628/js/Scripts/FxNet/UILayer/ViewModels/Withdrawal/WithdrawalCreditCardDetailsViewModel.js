define(
    'viewmodels/Withdrawal/WithdrawalCreditCardDetailsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'initdatamanagers/Customer',
        'devicemanagers/ViewModelsManager',
        'devicemanagers/StatesManager',
        'devicemanagers/AlertsManager',
        'JSONHelper',
        'initdatamanagers/SymbolsManager',
        'dataaccess/dalWithdrawal',
        'modules/systeminfo',
        'configuration/initconfiguration',
        'viewmodels/Withdrawal/WithdrawalCommonViewModel'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            Dictionary = require('Dictionary'),
            customer = require('initdatamanagers/Customer'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            statesManager = require('devicemanagers/StatesManager'),
            dalWithdrawal = require('dataaccess/dalWithdrawal'),
            systemInfo = require('modules/systeminfo'),
            WithdrawalCommonViewModel = require('viewmodels/Withdrawal/WithdrawalCommonViewModel');

        var WithdrawalCreditCardDetailsViewModel = general.extendClass(KoComponentViewModel, function WithdrawalCreditCardDetailsViewModelClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                baseSymbol,
                commonViewModel = new WithdrawalCommonViewModel({});

            data.withdrawalForm = {};
            data.withdrawalInfo = {};

            var init = function () {
                commonViewModel.init();

                var paramsData = ko.utils.unwrapObservable(params.data);

                baseSymbol = paramsData.baseSymbol;

                data.withdrawalInfo.allowedWithdrawal = paramsData.allowedWithdrawal;
                data.withdrawalInfo.isBackOffice = paramsData.isBackOffice;

                setwithdrawalObject();
                setComputables();

                setSubsribers();

                setWithdrawalDetails();
            }

            function setwithdrawalObject() {
                populateCountriesObservableArray();

                data.withdrawalForm.isValidationEnabled = ko.observable(false);

                data.withdrawalInfo.ccyList = ko.observableArray();

                data.withdrawalInfo.saveWithdrawal = saveWithdrawalRequest;
                data.withdrawalInfo.defaultCcy = customer.prop.defaultCcy();
                data.withdrawalInfo.MaxWithdrawalAmount = ko.observable();                
                data.withdrawalInfo.hasAmount = ko.observable(false);
                data.withdrawalInfo.hasNoAmount = ko.observable(false);
                data.withdrawalForm.onFormEnable = ko.observable(true);
                data.withdrawalForm.isProcessing = ko.observable(false);
                data.withdrawalForm.WithdrawalStatus = 1;
                data.withdrawalForm.SymbolID = ko.observable();
                data.withdrawalForm.CreditCardId = ko.observable(ko.utils.unwrapObservable(params.data).withdrawal.CCId);
                data.withdrawalForm.Withdrawal = ko.observable(ko.utils.unwrapObservable(params.data).withdrawal);

                data.withdrawalForm.Amount = ko.observable().extend({
                    number: { message: Dictionary.GetItem("wRequest_InvalidAmount") },
                    required: {
                        value: true,
                        message: Dictionary.GetItem("wRequest_reqAmount"),
                        onlyIf: data.withdrawalForm.isValidationEnabled
                    },
                    min: { params: 0.99999999, message: Dictionary.GetItem("wRequest_InvalidAmount"), onlyIf: data.withdrawalForm.isValidationEnabled },
                    max: { params: 1000000000, message: Dictionary.GetItem("wRequest_InvalidAmount"), onlyIf: data.withdrawalForm.isValidationEnabled }
                });

                data.withdrawalForm.Details = ko.observable('');

                data.withdrawalInfo.isWithdrawalRequestVisible = ko.observable(true);
                data.withdrawalInfo.isWithdrawalInstructionsVisible = ko.observable(true);
                data.withdrawalInfo.isAllowedAmountVisible = ko.observable(false);

                data.withdrawalForm.clean = cleanForm;
            }

            function populateCountriesObservableArray() {
                data.countries = ko.observableArray();

                var countriesCollection = systemInfo.get("countries");
                var countryIds = Object.keys(countriesCollection);

                for (var i = 0; i < countryIds.length; i++) {
                    var countryId = countryIds[i];
                    data.countries.push({ 'BankCountryID': countryId, 'BankCountryName': countriesCollection[countryId] });
                }
            }

            function setComputables() {
                data.withdrawalInfo.disableSaveButton = self.createComputed(function () {
                    return (!data.withdrawalForm.onFormEnable() || data.withdrawalInfo.hasNoAmount() || 0 < ko.validation.group(data.withdrawalForm)().length);
                }, self, false);

                data.withdrawalInfo.showWithdrawal = self.createComputed(function () {
                    return !statesManager.States.IsPortfolioInactive() && data.withdrawalInfo.hasAmount();
                }, self, false);

                data.withdrawalForm.CardTypeName = self.createComputed(function () {
                    return data.withdrawalForm.Withdrawal().Name + ' ' + data.withdrawalForm.Withdrawal().Last4
                }, self, false);
            }

            function setSubsribers() {
                self.subscribeTo(data.withdrawalForm.Amount, function () { noErrors(); });

                if (ko.isObservable(params.data)) {
                    self.subscribeTo(params.data, function (value) {
                        data.withdrawalForm.CreditCardId(value.withdrawal.CCId);
                        data.withdrawalForm.Withdrawal(value.withdrawal);
                        resetForm();
                        setWithdrawalDetails();
                    });
                }
            }

            function cleanForm() {
                viewModelsManager.VmHelpers.CleanKoObservableSimpleObject(data.withdrawalForm);
            }

            function noErrors() {
                var errors = ko.utils.unwrapObservable(ko.validation.group(data.withdrawalForm));

                if (errors.length > 0) {
                    data.withdrawalForm.onFormEnable(false);
                } else {
                    data.withdrawalForm.onFormEnable(true);
                }
            }

            function resetForm() {
                data.withdrawalForm.isValidationEnabled(false);
                data.withdrawalForm.Amount(null);
                data.withdrawalForm.Details('');
            }

            function setWithdrawalDetails() {
                data.withdrawalInfo.ccyList(commonViewModel.getCurrenciesFromWrapper(ko.utils.unwrapObservable(params.data).withdrawal.CurrencyIds));
                data.withdrawalForm.SymbolID(commonViewModel.getSymbolIdOrDefault(baseSymbol.SymbolID.toString(), data.withdrawalInfo.ccyList()));
                var errors = ko.validation.group(data.withdrawalForm);
                errors.showAllMessages();
            }

            function saveWithdrawalRequest(isAgree) {
                if (data.withdrawalForm.isProcessing())
                    return;
                data.withdrawalForm.isValidationEnabled(true);
                if (data.withdrawalInfo.disableSaveButton()) {
                    return;
                }

                data.withdrawalForm.isValidationEnabled(false);

                var amount = data.withdrawalForm.Amount();
                data.withdrawalForm.Amount(amount ? amount : 0);
                data.withdrawalForm.IsAgreeTradingBonusTakeout = typeof isAgree == 'boolean' ? isAgree : false;
                var withdrawalFormData = ko.toJSON(data.withdrawalForm);

                data.withdrawalForm.onFormEnable(false);
                data.withdrawalForm.isProcessing(true);

                if (data.withdrawalInfo.isBackOffice) {
                    dalWithdrawal.saveWithdrawalBackOfficeRequest(onSaveWithdrawalRequestComplete, withdrawalFormData);
                } else {
                    dalWithdrawal.saveWithdrawalRequest(onSaveWithdrawalRequestComplete, withdrawalFormData);
                }
            }

            function onSaveWithdrawalRequestComplete(responseText) {
                data.withdrawalForm.onFormEnable(true);
                data.withdrawalForm.isProcessing(false);

                commonViewModel.handleSaveWithdrawalResponse(responseText, data.withdrawalForm.SymbolID(), saveWithdrawalRequest);
            }

            function dispose() {
                stop();
                commonViewModel.dispose();

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            function stop() {
                cleanForm();

                data.withdrawalInfo.hasAmount(false);
                data.withdrawalInfo.hasNoAmount(false);
            }

            return {
                init: init,
                dispose: dispose,
                WithdrawalForm: data.withdrawalForm,
                WithdrawalInfo: data.withdrawalInfo
            };
        });

        var createViewModel = function (params) {
            var viewModel = new WithdrawalCreditCardDetailsViewModel(params || {});
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);