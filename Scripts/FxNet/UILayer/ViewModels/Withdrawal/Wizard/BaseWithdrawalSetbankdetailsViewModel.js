define(
    'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetbankdetailsViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'modules/WithdrawalCommon',
        'StateObject!wizardState',
        'StateObject!withdrawal',
        'modules/systeminfo',
        'initdatamanagers/Customer'
    ],
    function (require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            wizardState = require('StateObject!wizardState'),
            systemInfo = require('modules/systeminfo'),
            customer = require('initdatamanagers/Customer'),
            withdrawalState = require('StateObject!withdrawal');

        var BaseWithdrawalSetbankdetailsViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                stepData = wizardState.get('stepData'),
                isDataReady = ko.observable(false),
                withdrawalData = withdrawalState.get('withdrawal');

            function init(settings) {
                parent.init.call(self, settings);

                if (!componentReady()) {
                    return withdrawalCommon.goToDefaultPage();
                } else {
                    isDataReady(true);
                }

                setObservables();
                setComputables();
                setSubscribers();
                loadSharedData();
                buildWizardStep();
            }

            function componentReady() {
                if (general.isEmptyValue(withdrawalData) || general.isEmptyValue(withdrawalData.amount) || general.isEmptyValue(withdrawalData.currencyLabel)) {
                    return false;
                }
                return true;
            }

            function setObservables() {
                data.countries = systemInfo.get("countries");

                data.bankName = ko.observable().extend({
                    dirty: false,
                    required: {
                        value: true,
                        message: Dictionary.GetItem("wRequest_reqBankName")
                    }
                });

                data.beneficiaryName = ko.observable().extend({
                    dirty: false,
                    required: {
                        value: true,
                        message: Dictionary.GetItem("wRequest_reqBankBeneficiary")
                    }
                });

                data.bankAccount = ko.observable().extend({
                    dirty: false,
                    required: {
                        value: true,
                        message: Dictionary.GetItem("wRequest_reqBankAccount")
                    }
                });

                data.bankAddress = ko.observable();
                data.bankCountryID = ko.observable(customer.prop.countryID);
                data.branchCode = ko.observable();
                data.swiftCode = ko.observable();
                data.showSkippedStepInfo = general.isNullOrUndefined(withdrawalData.withDrawalMethod);
            }

            function setComputables() {
                data.isValidStep = self.createComputed(function () {
                    return data.bankName.isValid() && data.beneficiaryName.isValid() && data.bankAccount.isValid();
                }, self, true);
            }

            function setSubscribers() {
                self.subscribeTo(data.isValidStep, function (value) {
                    stepData.nextStep.valid = value;
                    wizardState.update('stepData', stepData);
                });
            }

            function loadSharedData() {
                var lastBankDetails = withdrawalData.bankDetails || withdrawalData.lastBankWithdrawal;

                if (lastBankDetails) {
                    data.bankName(lastBankDetails.BankName);
                    data.bankAccount(lastBankDetails.BankAccount);
                    data.branchCode(lastBankDetails.BankBranch);
                    data.swiftCode(lastBankDetails.SwiftCode);
                    data.beneficiaryName(lastBankDetails.BankBeneficiary);
                    data.bankCountryID(general.isNullOrUndefined(lastBankDetails.BankCountryID) ? customer.prop.countryID : lastBankDetails.BankCountryID);
                    data.bankAddress(lastBankDetails.BankAddress);
                }
            }

            function continueWithWithdrawal() {
                if (!data.isValidStep()) {
                    return;
                }

                updateSharedState();
                wizardState.update('step', eWithdrawalSteps.setApproval);
            }

            function buildWizardStep() {
                params.setStepActions(continueWithWithdrawal);
            }

            function updateSharedState() {
                var stateData = withdrawalState.get('withdrawal'),
                    bankDetails = {
                        BankName: data.bankName(),
                        BankAccount: data.bankAccount(),
                        BankBranch: data.branchCode(),
                        SwiftCode: data.swiftCode(),
                        BankBeneficiary: data.beneficiaryName(),
                        BankCountryID: data.bankCountryID(),
                        BankCountryName: data.countries[data.bankCountryID()],
                        BankAddress: data.bankAddress()
                    };

                stateData.bankDetails = bankDetails;
                withdrawalState.update('withdrawal', stateData);
            }

            function dispose() {
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                isDataReady: isDataReady
            };
        });

        return BaseWithdrawalSetbankdetailsViewModel;
    }
);
