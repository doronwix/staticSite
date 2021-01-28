define("deviceviewmodels/deposit/forceddepositviewmodel", [
    'require',
    'knockout',
    'handlers/general',
    'Q',
    'helpers/KoComponentViewModel',
    'devicemanagers/AlertsManager',
    'configuration/initconfiguration',
    'dataaccess/dalDeposit',
    'devicemanagers/StatesManager',
    'Dictionary',
    'initdatamanagers/Customer',
    'viewmodels/Payments/PaymentResultProcessor'
], function (require) {

    var ko = require("knockout"),
        general = require('handlers/general'),
        Q = require('Q'),
        KoComponentViewModel = require('helpers/KoComponentViewModel'),
        AlertsManager = require('devicemanagers/AlertsManager'),
        initConfiguration = require('configuration/initconfiguration'),
        StatesManager = require('devicemanagers/StatesManager'),
        Dictionary = require('Dictionary'),
        dalDeposit = require('dataaccess/dalDeposit'),
        customer = require('initdatamanagers/Customer'),
        PaymentResultProcessor = require('viewmodels/Payments/PaymentResultProcessor');

    var ForcedDepositViewModel = general.extendClass(KoComponentViewModel, function (params) {
        var self = this,
            parent = this.parent, // inherited from KoComponentViewModel
            data = this.Data, // inherited from KoComponentViewModel
            handlers = {},
            defaultCurrency;

        var init = function (settings) {
            parent.init.call(self, settings); // inherited from KoComponentViewModel

            setObservables();
            setSubscribers();
            setHandlers();

            data.isDepositInProgress(true);

            getData();
        };

        var setObservables = function () {
            data.selectedForcedClearer = ko.observable('');
            data.forcedClearers = ko.observableArray([]);
            data.forcedClearerCurrencies = ko.observableArray([]);
            data.selectedForcedClearerCurrency = ko.observable();
            data.amount = ko.observable('').extend({ required: true, number: true, min: 0 });
            data.cardHolder = ko.observable('');
            data.lastDigits = ko.observable('').extend({ required: true, number: true, minLength: 4, maxLength: 4 });
            data.confirmationCode = ko.observable('')
                .extend({
                    required: true,
                    pattern: '^[0-9a-zA-Z]+$'
                });
            data.isDepositInProgress = ko.observable(false);
            data.wasAmlAlertShown = ko.observable(false);
            data.isFormVisible = ko.observable(true);
            data.doneText = ko.observable("");
        };

        var setSubscribers = function () {
            self.subscribeTo(data.selectedForcedClearer, function (clearerId) {
                if (!general.isDefinedType(clearerId)) {
                    return;
                }

                data.forcedClearerCurrencies(data.forcedClearers().filter(function (currentClearer) {
                    return currentClearer.ClearerID === clearerId;
                })[0].Currencies);
            });

            self.subscribeTo(data.forcedClearerCurrencies, function (currencies) {
                var selectedCCy;

                if (defaultCurrency) {
                    selectedCCy = currencies.find(function (c) {
                        return c.CurrencyID === defaultCurrency;
                    });
                }

                if (!selectedCCy) {
                    selectedCCy = currencies.find(function (c) {
                        return c.CurrencyID === customer.prop.baseCcyId();
                    });
                }

                data.selectedForcedClearerCurrency(selectedCCy ? selectedCCy : currencies[0]);
            });
        };

        var showAlert = function (title, message, props) {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, title, message, '', props);
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
        }

        var startForcedDeposit = function () {
            data.isDepositInProgress(true);

            dalDeposit.submitForcedDeposit({
                Amount: data.amount(),
                DepositCurrency: data.selectedForcedClearerCurrency().CurrencyID,
                CardHolderName: data.cardHolder(),
                ClearerID: data.selectedForcedClearer(),
                ConfirmationCode: data.confirmationCode(),
                LastDigits: data.lastDigits()
            })
                .then(function (result) {
                    var resultProcessor =
                        new PaymentResultProcessor(
                            self.getSettings(),
                            processResponseResult,
                            {
                                amount: data.amount(),
                                depositCurrency: data.selectedForcedClearerCurrency().CurrencyID
                            }
                        );

                    resultProcessor.ProcessPaymentFinalResponse(result, 1);
                })
                .fail(function (error) {
                    showAlert('Error', error, {});
                })
                .done();
        };

        var processResponseResult = function (req) {
            data.isDepositInProgress(false);
            if (general.isArrayType(req.depositMessages) && req.depositMessages.length > 0) {
                if (req.succeeded) {
                    data.isFormVisible(false);
                    data.doneText(req.depositMessages[0]);
                }
            }
        }

        var confirmationCallback = function (result) {
            if (result) {
                data.wasAmlAlertShown(true);
                startForcedDeposit();
            }
        };

        var setHandlers = function () {
            handlers.depositClick = function () {
                if (data.isDepositInProgress()) {
                    return;
                }

                if (!data.amount.isValid()) {
                    showAlert(Dictionary.GetItem('lblInvalidInput', 'DepositBackOffice'), Dictionary.GetItem('lblInvalidAmount', 'DepositBackOffice'), {});
                    return;
                }

                if (!data.lastDigits.isValid()) {
                    showAlert(Dictionary.GetItem('lblInvalidInput', 'DepositBackOffice'), Dictionary.GetItem('lblInvalidDigits', 'DepositBackOffice'), {});
                    return;
                }

                if (!data.confirmationCode.isValid()) {
                    showAlert(Dictionary.GetItem('lblInvalidInput', 'DepositBackOffice'), Dictionary.GetItem('lblInvalidCode', 'DepositBackOffice'), {});
                    return;
                }

                if ((StatesManager.States.IsAmlRestricted() || StatesManager.States.IsKycStatusRequired()) && !data.wasAmlAlertShown()) {
                    showAlert(Dictionary.GetItem('btnDeposit', 'DepositBackOffice'), Dictionary.GetItem('lblAmlRestricted', 'DepositBackOffice'), { showAsConfirmation: true, confirmationCallback: confirmationCallback });
                } else {
                    startForcedDeposit();
                }
            };
        };

        function getData() {
            Q.all([dalDeposit.getLastSuccesfullDepositCurrency(), dalDeposit.getForcedClearers()])
                .then(processData)
                .fail(general.emptyFn)
                .done();
        }

        function processData(results) {
            var lastSuccesfullDepositCcyId = results[0],
                forcedClearersResponse = results[1];

            lastSuccesfullDepositCcyId = parseInt(lastSuccesfullDepositCcyId);

            if (!isNaN(lastSuccesfullDepositCcyId)) {
                defaultCurrency = lastSuccesfullDepositCcyId;
            }

            if (!general.isNullOrUndefined(forcedClearersResponse)) {
                data.forcedClearers(forcedClearersResponse.ForcedClearers);
            }

            data.isDepositInProgress(false);
        }

        return {
            init: init,
            Handlers: handlers
        };
    });

    var createViewModel = function (params) {
        params = params || {};

        var viewModel = new ForcedDepositViewModel(params);
        viewModel.init(initConfiguration.ForcedDepositConfiguration);

        return viewModel;
    };

    return {
        viewModel: { createViewModel: createViewModel }
    };
});