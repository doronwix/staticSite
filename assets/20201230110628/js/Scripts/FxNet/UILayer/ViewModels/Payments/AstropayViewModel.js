'use strict';
define(
    'viewmodels/Payments/AstropayViewModel',
    [
        "require",
        "knockout",
        "jquery",
        'handlers/general',
        'configuration/initconfiguration',
        'viewmodels/Payments/eWalletPaymentFlow',
        'dataaccess/dalDeposit',
        "initdatamanagers/Customer",
        'viewmodels/Payments/EwalletComponentViewModel',
        "dataaccess/dalcustomer"
    ],
    function AstropayViewModelDefs(require) {
        var ko = require("knockout"),
            $ = require("jquery"),
            general = require('handlers/general'),
            initConfiguration = require('configuration/initconfiguration'),
            paymentFlow = require('viewmodels/Payments/eWalletPaymentFlow'),
            daldeposit = require('dataaccess/dalDeposit'),
            customer = require("initdatamanagers/Customer"),
            EwalletComponentViewModel = require('viewmodels/Payments/EwalletComponentViewModel'),
            dalCustomer = require("dataaccess/dalcustomer");

        function AstropayViewModel() {
            var infoObs = {
                    paymentMethods: ko.observableArray([]),
                    showPaymentMethodsSelect: ko.observable(true)
                },
                formObs = {
                    idNumber: ko.observable(""),
                    countries: ko.observableArray([]),
                    selectedCountry: ko.observable(),
                    selectedPayment: ko.observable()
                },
                subscribers = [];

            dalCustomer
                .GetCustomerDetails()
                .then(function onCustomerDetailsFulfilled(response) {
                    var serverModel = JSONHelper.STR2JSON("AstropayViewModel:GetCustomerDetails", response);
                    formObs.idNumber(serverModel.idNumber);
                })
                .done();

            var ewalletVM = new EwalletComponentViewModel(paymentFlow, eDepositingActionType.Astropay, initConfiguration.AstropayConfiguration);

            ewalletVM.AddAdditionalValidations({
                selectedCountry: formObs.selectedCountry.extend({ required: true }),
                idNumber: formObs.idNumber.extend({ required: { params: true, onlyIf: ewalletVM.Form.isDepositClicked } }),
                selectedPayment: formObs.selectedPayment.extend({ required: { params: true, onlyIf: ewalletVM.Form.isDepositClicked } })
            });

            subscribers.push(ko.postbox.subscribe(ePostboxTopic.ConcretePaymentData, function onPostboxNotification(newValue) {
                formObs.selectedCountry(newValue.paymentCountry);
                formObs.selectedPayment(newValue.paymentData);
                infoObs.showPaymentMethodsSelect(!newValue.paymentData);
            }, true));

            formObs.paymentMethods = ko.computed(function computePaymentMethods() {
                if (!infoObs.showPaymentMethodsSelect() || !formObs.selectedCountry()) {
                    return [];
                }

                var selectedCountryResult = formObs.countries().filter(function findSelectedCountry(country) {
                    return country.code.toLowerCase() === formObs.selectedCountry().code.toLowerCase();
                });

                if (!selectedCountryResult || selectedCountryResult.length === 0) {
                    return [];
                }

                return selectedCountryResult[0].paymentMethods;
            }).extend({ throttle: 1 });

            subscribers.push(formObs.paymentMethods.subscribe(function onPaymentMethodsChanged() {
                setTimeout(function onPaymentMethodsChangedDelayed() {
                    var payments = formObs.paymentMethods();
                    formObs.selectedPayment(payments.length > 0 ? payments[0].code : "");
                }, 100);
            }));

            function init() {
                subscribers.push(ko.postbox.subscribe(ePostboxTopic.PaymentDeposit, deposit));
                ewalletVM.init(resetData, true);
                $.extend(infoObs, ewalletVM.Info);
                $.extend(formObs, ewalletVM.Form);
            }

            function resetData(cachedData) {
                setDefaultObservables();

                var paymentCountry = formObs.selectedCountry() ? formObs.selectedCountry().code : (cachedData ? cachedData.paymentCountry : '');

                initPayments(paymentCountry);

                if (cachedData) {
                    restoreData(cachedData);
                }
            }

            function restoreData(selectedData) {
                formObs.idNumber(selectedData.idNumber);
            }

            function initPayments(paymentCountry) {
                if (formObs.selectedPayment()) {
                    return;
                }

                daldeposit
                    .getAstropayPaymentMethods()
                    .then(function onPaymentsReceived(result) {
                        var countriesResult = JSONHelper.STR2JSON("AstropayViewModel:initPayments", result);

                        formObs.countries(countriesResult);
                        selectDefaultCountry(countriesResult, paymentCountry);
                    })
                    .fail(general.emptyFn)
                    .done();
            }

            function selectDefaultCountry(countriesResult, selectedCountry) {
                if (!countriesResult || countriesResult.length === 0) {
                    return;
                }

                var countryDetails = countriesResult.filter(function findCountry(country) {
                    if (selectedCountry) {
                        return country.code.toLowerCase() === selectedCountry.toLowerCase();
                    }

                    return country.id.toString() === customer.prop.countryID;
                });

                var defaultCountry = countryDetails.length > 0 ? countryDetails[0] : null;

                formObs.selectedCountry(defaultCountry);
            }

            function setDefaultObservables() {
                formObs.idNumber(customer.prop.idNumber);
            }

            function deposit() {
                formObs.isDepositClicked(true);

                if (!formObs.formValidation.isValid()) {
                    formObs.formValidation.errors.showAllMessages();
                    return;
                }

                ewalletVM.Deposit(buildRequest());
            }

            function buildRequest() {
                return $.extend({
                    idNumber: formObs.idNumber(),
                    paymentMethod: formObs.selectedPayment(),
                    paymentCountry: formObs.selectedCountry().code
                }, ewalletVM.buildRequest());
            }

            function dispose() {
                subscribers.forEach(function (subscriber) { subscriber.dispose(); });
                subscribers.length = 0;
                ewalletVM.dispose();
            }

            init();

            return {
                Deposit: deposit,
                Form: formObs,
                Info: infoObs,
                Amount: ewalletVM.Amount,
                dispose: dispose
            };
        }

        return AstropayViewModel;
    }
);
