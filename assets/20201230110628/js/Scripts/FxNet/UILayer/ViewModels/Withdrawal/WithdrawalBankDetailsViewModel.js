define(
    'viewmodels/Withdrawal/WithdrawalBankDetailsViewModel',
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
        'FxNet/LogicLayer/Withdrawals/LastWithdrawalRequest',
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
            dalWithdrawal = require('dataaccess/dalWithdrawal'),
            LastWithdrawalRequest = require('FxNet/LogicLayer/Withdrawals/LastWithdrawalRequest'),
            systemInfo = require('modules/systeminfo'),
            WithdrawalCommonViewModel = require('viewmodels/Withdrawal/WithdrawalCommonViewModel');

        var WithdrawalBankDetailsViewModel = general.extendClass(KoComponentViewModel, function WithdrawalBankDetailsViewModelClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                withdrawalDetails,
                depositCurrencies,
                baseSymbol,
                commonViewModel = new WithdrawalCommonViewModel({});

            data.withdrawalForm = {};
            data.withdrawalInfo = {};

            function init () {
                commonViewModel.init();

                var paramsData = ko.utils.unwrapObservable(params.data);

                withdrawalDetails = paramsData.withdrawalDetails;
                depositCurrencies = commonViewModel.getCurrenciesFromWrapper(paramsData.withdrawal.CurrencyIds);
                baseSymbol = paramsData.baseSymbol;

                data.withdrawalInfo.allowedWithdrawal = paramsData.allowedWithdrawal;
                data.withdrawalInfo.isBackOffice = paramsData.isBackOffice;

                setwithdrawalObject();
                setComputables();

                setWithdrawalDetails();
            }

            function setwithdrawalObject() {
                populateCountriesObservableArray();

                data.withdrawalForm.isValidationEnabled = ko.observable(false);

                data.withdrawalInfo.ccyList = ko.observableArray([]);
                data.withdrawalInfo.countries = data.countries;
                data.withdrawalInfo.saveWithdrawal = saveWithdrawalRequest;
                data.withdrawalInfo.defaultCcy = customer.prop.defaultCcy();
                data.withdrawalInfo.MaxWithdrawalAmount = ko.observable();
                data.withdrawalInfo.TaxAmount = ko.observable();
                data.withdrawalInfo.hasAmount = ko.observable(false);
                data.withdrawalInfo.hasNoAmount = ko.observable(false);
                data.withdrawalInfo.hasTaxAmount = ko.observable(false);

                data.withdrawalInfo.toggleWithdrawalInstructions = toggleWithdrawalInstructions;

                data.withdrawalForm.onFormEnable = ko.observable(true);
                data.withdrawalForm.isProcessing = ko.observable(false);
                data.withdrawalForm.WithdrawalStatus = 1;
                data.withdrawalForm.SymbolID = ko.observable();
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
                data.withdrawalForm.BankName = ko.observable().extend({
                    required: {
                        value: true,
                        message: Dictionary.GetItem("wRequest_reqBankName"),
                        onlyIf: data.withdrawalForm.isValidationEnabled
                    }
                });
                data.withdrawalForm.BankBranch = ko.observable('').extend({ alphanumeric: { message: Dictionary.GetItem("notAlphanumericValidation"), onlyIf: data.withdrawalForm.isValidationEnabled } });
                data.withdrawalForm.BankBeneficiary = ko.observable().extend({
                    required: {
                        value: true,
                        message: Dictionary.GetItem("wRequest_reqBankBeneficiary"),
                        onlyIf: data.withdrawalForm.isValidationEnabled
                    }
                });
                data.withdrawalForm.BankAccount = ko.observable().extend({
                    required: {
                        value: true,
                        message: Dictionary.GetItem("wRequest_reqBankAccount"),
                        onlyIf: data.withdrawalForm.isValidationEnabled
                    }
                });
                data.withdrawalForm.BankAddress = ko.observable('');
                data.withdrawalForm.BankCountryID = ko.observable();
                data.withdrawalForm.BankCountryName = ko.observable();
                data.withdrawalForm.Details = ko.observable('');
                data.withdrawalForm.SwiftCode = ko.observable('');

                data.withdrawalInfo.isWithdrawalRequestVisible = ko.observable(true);
                data.withdrawalInfo.isWithdrawalInstructionsVisible = ko.observable(true);
                data.withdrawalInfo.isAllowedAmountVisible = ko.observable(false);

                self.subscribeTo(data.withdrawalForm.Amount, function () { noErrors(); });
                self.subscribeTo(data.withdrawalForm.BankName, function () { noErrors(); });
                self.subscribeTo(data.withdrawalForm.BankBeneficiary, function () { noErrors(); });
                self.subscribeTo(data.withdrawalForm.BankAccount, function () { noErrors(); });
                self.subscribeTo(data.withdrawalForm.BankBranch, function () { noErrors(); });
                self.subscribeTo(data.withdrawalForm.SwiftCode, function () { noErrors(); });
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
            }

            function cleanForm() {
                viewModelsManager.VmHelpers.CleanKoObservableSimpleObject(data.withdrawalForm);
                setBankCountryToCustomersCountry();
                LastWithdrawalRequest.clearValue();
            }

            function setBankCountryToCustomersCountry() {
                data.withdrawalForm.BankCountryID(customer.prop.countryID);
            }

            function noErrors() {
                var errors = ko.utils.unwrapObservable(ko.validation.group(data.withdrawalForm));

                if (errors.length > 0) {
                    data.withdrawalForm.onFormEnable(false);
                } else {
                    data.withdrawalForm.onFormEnable(true);
                }
            }

            function setWithdrawalDetails() {
                data.withdrawalInfo.ccyList(depositCurrencies);

                var symbolId = general.isNullOrUndefined(baseSymbol) ? "" : baseSymbol.SymbolID.toString();
                data.withdrawalForm.SymbolID(commonViewModel.getSymbolIdOrDefault(symbolId, depositCurrencies));

                var lastWithdrawalRequest = withdrawalDetails;
                if (lastWithdrawalRequest) {
                    data.withdrawalForm.BankCountryID(lastWithdrawalRequest.BankCountryID);
                    data.withdrawalForm.BankName(lastWithdrawalRequest.BankName);
                    data.withdrawalForm.BankBranch(lastWithdrawalRequest.BankBranch);
                    data.withdrawalForm.BankBeneficiary(lastWithdrawalRequest.BankBeneficiary);
                    data.withdrawalForm.BankAccount(lastWithdrawalRequest.BankAccount);
                    data.withdrawalForm.BankAddress(lastWithdrawalRequest.BankAddress);
                    data.withdrawalForm.BankCountryName(lastWithdrawalRequest.BankCountryName);
                    data.withdrawalForm.Details(lastWithdrawalRequest.Details);
                    data.withdrawalForm.SwiftCode(lastWithdrawalRequest.SwiftCode);

                    if (general.isNullOrUndefined(baseSymbol)) {
                        data.withdrawalForm.SymbolID(commonViewModel.getSymbolIdOrDefault(lastWithdrawalRequest.SymbolID.toString(), depositCurrencies));
                    }
                } else {
                    setBankCountryToCustomersCountry();
                }

                LastWithdrawalRequest.storeValue(lastWithdrawalRequest);

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
                data.withdrawalForm.IsAgreeTradingBonusTakeout = typeof isAgree === 'boolean' ? isAgree : false;
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

            function toggleWithdrawalInstructions() {
                data.withdrawalInfo.isWithdrawalInstructionsVisible(!data.withdrawalInfo.isWithdrawalInstructionsVisible());
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
            var viewModel = new WithdrawalBankDetailsViewModel(params || {});
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
