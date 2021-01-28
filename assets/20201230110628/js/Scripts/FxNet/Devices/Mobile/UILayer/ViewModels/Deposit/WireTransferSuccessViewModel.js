"use strict";
/*eslint no-console:off*/
define(
    "deviceviewmodels/Deposit/WireTransferSuccessViewModel",
    [
        "require",
        "knockout",
        'handlers/general',
        "Dictionary",
        "LoadDictionaryContent!payments_regularWireTransferDeposit",
        'devicemanagers/StatesManager'
    ],
    function (require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            dictionary = require("Dictionary"),
            statesManager = require('devicemanagers/StatesManager'), 
            formObs = {
                amount: ko.observable(),
                accName: ko.observable(),
                accNumber: ko.observable(),
                bankAccNumber: ko.observable(),
                telephone: ko.observable(),
                depCurrency: ko.observable(),
                depAmount: ko.observable(),
                beneficiary: ko.observable(),
                bank: ko.observable(),
                bankCity: ko.observable(),
                bankCountry: ko.observable(),
                iban: ko.observable(),
                swift: ko.observable(),
                paymentRef: ko.observable(),
                specialID: ko.observable(),
                GClogoVisible: ko.observable(false),
                tooltip: ko.observable(dictionary.GetItem('lblIbanDesc', 'payments_regularWireTransferDeposit')),
                shouldShowCddNotice: ko.observable()
            };

        var WireTransferSuccessViewModel = function () {
            function MapDataToView(data) {
                formObs.amount(data.amount);
                formObs.accName(data.accName);
                formObs.accNumber(data.accNumber);
                formObs.bankAccNumber(data.bankAccNumber);
                formObs.telephone(data.telephone);
                formObs.depCurrency(data.depCurrency);
                formObs.depAmount(data.depAmount);
                formObs.beneficiary(data.beneficiary);
                formObs.bank(data.bank);
                formObs.bankCity(data.bankCity);
                formObs.bankCountry(data.bankCountry);
                formObs.iban(data.iban);
                formObs.swift(data.swift);
                formObs.paymentRef(data.paymentRefForView);
                formObs.specialID(data.specialID);
                formObs.GClogoVisible(data.GClogoVisible);
                formObs.tooltip(dictionary.GetItem('lblIbanDesc', 'payments_regularWireTransferDeposit'));
                formObs.shouldShowCddNotice(statesManager.States.CddStatus() === eCDDStatus.NotComplete);
            }

            function init(params) {
                if (general.isDefinedType(params) && general.isDefinedType(params.data)) {
                    MapDataToView(params.data);
                }
            }

            return {
                init: init,
                Form: formObs
            };
        }
        var createViewModel = function (params) {
            var viewModel = new WireTransferSuccessViewModel();

            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);