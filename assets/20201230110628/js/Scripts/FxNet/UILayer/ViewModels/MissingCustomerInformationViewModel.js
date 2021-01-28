define(
    'viewmodels/MissingCustomerInformationViewModel',
    [
        'require',
        'knockout',
        'initdatamanagers/Customer',
        "dataaccess/dalcustomer",
        'deviceviewmodels/PaymentSelectionBehaviors',
        'Dictionary',
        'devicemanagers/AlertsManager',
        'JSONHelper'
    ],
    function (require) {
        var ko = require('knockout'),
            Customer = require('initdatamanagers/Customer'),
            dalCustomer = require("dataaccess/dalcustomer"),
            PaymentSelectionBehaviors = require('deviceviewmodels/PaymentSelectionBehaviors'),
            Dictionary = require('Dictionary'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            JSONHelper = require('JSONHelper');

        var createMissingCustomerInformationViewModel = function () {
            var validators = {
                firstName: { required: true },
                lastName: { required: true },
                phone: { required: true, pattern: /^( ?-?\d){5,}$/ },
                signAgreementDate: { equal: true },
                gender: { required: true, in: [eGender.Female, eGender.Male, eGender.Female.toLowerCase(), eGender.Male.toLowerCase()] },
                dateOfBirth: { required: true },
                idNumber: {
                    required: true,
                    number: true,
                    minLength: 9,
                    maxLength: 9,
                    asyncValidation: { asyncFunction: dalCustomer.IsIdNumberValid }
                },
                address: { required: true, pattern: /^.*[^0-9].*$/ }
            };

            var self = {
                customerForm: {
                    firstName: ko.observable("").extend({ initialyVisible: false }),
                    lastName: ko.observable("").extend({ initialyVisible: false }),
                    phone: ko.observable("").extend({ initialyVisible: false }),
                    signAgreementDate: ko.observable(!Customer.HasMissingAgreement()).extend({ initialyVisible: false }),
                    gender: ko.observable("").extend({ initialyVisible: false }),
                    dateOfBirth: ko.observable("").extend({ initialyVisible: false }),
                    idNumber: ko.observable("").extend({ initialyVisible: false }),
                    isLoading: ko.observable(true).extend({ equal: false }),
                    address: ko.observable("").extend({ initialyVisible: false })
                }
            };

            dalCustomer.GetCustomerDetails()
                .then(function (response) {
                    var serverModel = JSONHelper.STR2JSON("MissingCustomerInformationViewModel:GetCustomerDetails", response);

                    self.customerForm.firstName(serverModel.contactFirst);
                    self.customerForm.lastName(serverModel.contactLast);
                    self.customerForm.phone(serverModel.phone);
                    self.customerForm.gender(serverModel.gender);
                    self.customerForm.dateOfBirth(serverModel.dateOfBirth);
                    self.customerForm.idNumber(serverModel.idNumber);
                    self.customerForm.address(serverModel.address);
                })
                .done();

            self.firstFieldInteractionDone = false;

            self.fieldInteraction = function () {
                if (self.firstFieldInteractionDone === false) {
                    ko.postbox.publish('trading-event', 'agreement-first-interaction');
                    self.firstFieldInteractionDone = true;
                }
            };

            self.formValidation = ko.validatedObservable(self.customerForm);
            self.dateOfBirthInfo = { minDate: minDate(), maxDate: maxDate(), yearRange: minDate().getFullYear() + ':' + maxDate().getFullYear() };
            self.agreementPhrase = ko.observable("");

            dalCustomer.GetCustomerAgreementPhrase(function (data) {
                self.agreementPhrase(data);
            });

            function maxDate() {
                var max = new Date();

                max.setFullYear(max.getFullYear() - 18);

                return max;
            }

            function minDate() {
                var min = new Date();

                min.setFullYear(min.getFullYear() - 150);

                return min;
            }

            self.updateMissingFields = function () {
                ko.postbox.publish('trading-event', 'agreement-submit');

                if (!self.formValidation.isValid()) {
                    self.formValidation.errors.showAllMessages();

                    return;
                }

                var info = {
                    FirstName: self.customerForm.firstName(),
                    LastName: self.customerForm.lastName(),
                    Phone: self.customerForm.phone(),
                    HasSignedAgreement: self.customerForm.signAgreementDate(),
                    Gender: self.customerForm.gender(),
                    DateOfBirth: self.customerForm.dateOfBirth(),
                    IdNumber: self.customerForm.idNumber(),
                    Address: self.customerForm.address()
                };

                dalCustomer.UpdateMissingInformation(
                    info,
                    function (data) {
                        var response = JSONHelper.STR2JSON("updateMissingCustomerInformation", data);

                        if (response.Status === eOperationStatus.ValidationFailed) {
                            AlertsManager.ShowAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem("GenericAlert"), Dictionary.GetItem("ServerError"), null);
                            return;
                        }

                        Customer.UpdateMissingInformation(response.CustomerUpdated);
                        PaymentSelectionBehaviors.OnCustomerSuccessfullUpdate();
                    }
                );
            };

            self.formValidation.errors.showAllMessages();

            dalCustomer.GetRequiredFieldsForDeposit(function (data) {
                var response = JSONHelper.STR2JSON("getRequiredFieldsForDeposit", data);

                response.forEach(function (el) {
                    self.customerForm[el].extend(validators[el]);
                    self.customerForm[el].isVisible(true);
                });

                self.customerForm.isLoading(false);
            });

            return self;
        };

        return {
            viewModel: {
                createViewModel: createMissingCustomerInformationViewModel
            }
        };
    }
);
