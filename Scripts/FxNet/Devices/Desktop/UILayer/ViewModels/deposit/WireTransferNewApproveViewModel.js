/* eslint no-alert: 0 */
define(
    "deviceviewmodels/deposit/wiretransfernewapproveviewmodel",
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'dataaccess/Backoffice/dalWireTransfer',
        'initdatamanagers/Customer',
        'handlers/AmountConverter',
        'dataaccess/dalConversion'
    ],
    function WireTransferNewApproveDef(require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            dalWireTransfer = require("dataaccess/Backoffice/dalWireTransfer"),
            Customer = require('initdatamanagers/Customer'),
            AmountConverter = require("handlers/AmountConverter"),
            dalConversion = require("dataaccess/dalConversion"),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var WireTransferNewApproveViewModel = general.extendClass(KoComponentViewModel, function WireTransferNewApproveClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            var init = function () {
                parent.init.call(self); // inherited from KoComponentViewModel

                setObservables();
                setSubscribers();
                setComputables();

                dalWireTransfer.getWireTransferBanks().then(onGetWireTransferBanks).done();

                if (params.selectedWireTransfer) {
                    populateDataWithWireTransferProps(params.selectedWireTransfer);
                } else {
                    data.accountNumber(Customer.prop.accountNumber);
                }
            };

            function setObservables() {
                data.selectedComment = ko.observable();
                data.isSaveSpinnerOn = ko.observable(false);
                data.accountNumber = ko.observable(0);
                data.isApprovedChecked = ko.observable(false);
                data.brokerId = ko.observable(Customer.prop.brokerID);
                data.brokerName = ko.observable(Customer.prop.brokerName);
                data.banks = ko.observableArray([]);
                data.banksForSelectedBroker = ko.observableArray([]);
                data.selectedBank = ko.observable(null);
                data.selectedCcy = ko.observable(null);
                data.currenciesForSelectedBank = ko.observableArray([]);
                data.amount = ko.observable("").extend({
                    toNumericLength: {
                        ranges: [
                            {
                                from: 0,
                                to: Number.MAX_SAFE_INTEGER,
                                decimalDigits: 0
                            }
                        ]
                    }
                });
                data.customerBaseCcyId = Customer.prop.baseCcyId();
                data.hasSelectedWireTransfer = ko.observable(false);
                data.hasUpdateRate = false;
                data.exchangeRate = ko.observable(1).extend({
                    toNumericLength: {
                        ranges: [
                            {
                                from: 0,
                                to: Number.MAX_SAFE_INTEGER,
                                decimalDigits: Number.MAX_SAFE_INTEGER
                            }
                        ]
                    }
                });
                data.quoteForSelectedCcyToAccountCcy = ko.observable({
                    ask: ko.observable(1),
                    bid: ko.observable(1),
                    instrumentFactor: 1,
                    isOppositeInstrumentFound: false
                });
                data.customerSymbolName = Customer.prop.baseCcyName();
                data.valueDate = ko.observable((new Date()).ExtractDate());
                data.maxDate = ko.observable((new Date()).ExtractDate());
                data.isDisabledExchangeRate = ko.observable(false);
                data.isGetBanksInProgress = ko.observable(true);
                data.isApproveViewVisible = params.isApproveViewVisible || ko.observable(true);
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedBank, function (bank) {
                    if (bank) {
                        data.currenciesForSelectedBank(bank.bankCurrencies);

                        var selectedCCy;

                        if (params.selectedWireTransfer) {
                            selectedCCy = bank.bankCurrencies.find(function (currency) {
                                return currency.CurrencyID === params.selectedWireTransfer().currencyId;
                            });

                            data.selectedCcy(selectedCCy);
                        }
                        else {
                            selectedCCy = bank.bankCurrencies.find(function (c) {
                                return c.CurrencyID === Customer.prop.baseCcyId();
                            });

                            data.selectedCcy(selectedCCy ? selectedCCy : bank.bankCurrencies[0]);
                        }
                    }
                });

                self.subscribeTo(data.selectedCcy, function (selectedCcy) {
                    if (selectedCcy) {
                        populateInBetweenQuoteAndExchangeRate(selectedCcy.CurrencyID, selectedCcy.Name);
                        data.isDisabledExchangeRate(selectedCcy.CurrencyID === data.customerBaseCcyId);
                    }
                });
            }

            function setComputables() {
                data.convertedAmount = self.createComputed(function () {
                    data.quoteForSelectedCcyToAccountCcy().bid(data.exchangeRate());
                    data.quoteForSelectedCcyToAccountCcy().ask(data.exchangeRate());

                    var convertedAmount = AmountConverter.Convert(data.amount(), data.quoteForSelectedCcyToAccountCcy());

                    return convertedAmount;
                });
            }

            function populateDataWithWireTransferProps(selectedWireTransfer) {
                data.accountNumber(selectedWireTransfer().accountNumber);
                data.selectedComment(selectedWireTransfer().comment);
                data.exchangeRate(selectedWireTransfer().exchangeRate);
                data.amount(selectedWireTransfer().amount);
                data.hasSelectedWireTransfer(true);
                data.isApprovedChecked(true);
            }

            function onGetWireTransferBanks(banks) {
                var arr = [];

                banks.forEach(function (bank) {
                    var bankRow = {
                        id: bank.BankID,
                        name: bank.Name,
                        fullName: bank.FullName,
                        brokerId: bank.BrokerID,
                        bankCurrencies: bank.WireTransferBankCurrencies
                    };

                    arr.push(bankRow);
                });

                arr.sort(function (l, r) { return l.name > r.name ? 1 : -1; });
                data.banks(arr);
                setBanksForBroker();

                data.isGetBanksInProgress(false);
            }

            function setBanksForBroker() {
                var banks = data.banks().filter(function (bank) {
                    return bank.brokerId == data.brokerId();
                });

                data.banksForSelectedBroker(banks);

                if (params.selectedWireTransfer) {
                    var selectedBank = banks.find(function (bank) {
                        return bank.id === params.selectedWireTransfer().bankId;
                    });

                    data.selectedBank(selectedBank);
                }
                else {
                    data.selectedBank(banks[0]);
                }
            }

            function populateInBetweenQuoteAndExchangeRate(selectedCcyId, selectedCcyName) {
                var inBetweenQuote = null;

                if (!data.hasUpdateRate && (selectedBankIsNotEqualWithWireTransferBank() || selectedCcyIsNotEqualWithWireTransferCcy(selectedCcyId))) {
                    return;
                }

                if (selectedCcyId === Customer.prop.baseCcyId()) {
                    inBetweenQuote = {
                        ask: ko.observable(1),
                        bid: ko.observable(1),
                        instrumentFactor: 1,
                        isOppositeInstrumentFound: false
                    };

                    data.exchangeRate(1);
                    data.quoteForSelectedCcyToAccountCcy(inBetweenQuote);
                    data.hasUpdateRate = true;
                }
                else {
                    dalConversion
                        .getConversionRateFormated(selectedCcyId, data.customerBaseCcyId, selectedCcyName, data.customerSymbolName)
                        .then(function (response) {
                            var result = response.result;

                            if (result) {
                                var rate;

                                if (!data.hasUpdateRate && data.exchangeRate() != 1) {
                                    rate = data.exchangeRate();
                                }
                                else {
                                    rate = result.formattedRate;
                                }

                                inBetweenQuote = {
                                    ask: ko.observable(rate),
                                    bid: ko.observable(rate),
                                    instrumentFactor: result.instrumentFactor,
                                    isOppositeInstrumentFound: result.isOppositeInstrumentFound
                                };

                                data.exchangeRate(rate);
                                data.quoteForSelectedCcyToAccountCcy(inBetweenQuote);
                                data.hasUpdateRate = true;
                            }
                        })
                        .done();
                }
            }

            function selectedBankIsNotEqualWithWireTransferBank() {
                return !general.isNullOrUndefined(data.selectedBank()) && !general.isNullOrUndefined(params.selectedWireTransfer) && data.selectedBank().id != params.selectedWireTransfer().bankId;
            }

            function selectedCcyIsNotEqualWithWireTransferCcy(selectedCcyId) {
                return !general.isNullOrUndefined(params.selectedWireTransfer) && selectedCcyId != params.selectedWireTransfer().currencyId;
            }

            function saveClick() {
                var wireTransferComment = data.selectedComment();

                if (data.isSaveSpinnerOn()) {
                    return;
                }

                if (data.selectedComment() === "-- Selected bank --") {
                    wireTransferComment = data.selectedBank().fullName;
                }

                var wireTransfer = {
                    BankID: data.selectedBank().id,
                    BankName: data.selectedBank().fullName,
                    CurrencyID: data.selectedCcy().CurrencyID,
                    CurrencyName: data.selectedCcy().Name,
                    Comment: wireTransferComment,
                    ExchangeRate: data.exchangeRate(),
                    Amount: data.amount()
                };

                if (data.hasSelectedWireTransfer()) {
                    wireTransfer.RecordID = params.selectedWireTransfer().recordId;
                    wireTransfer.TransferID = params.selectedWireTransfer().transferId;
                    wireTransfer.DepositingRequestID = params.selectedWireTransfer().depositingRequestId;
                    wireTransfer.AccountingTransctionID = params.selectedWireTransfer().accountingTransctionId;
                    wireTransfer.LastUpdate = general.str2Date(params.selectedWireTransfer().lastUpdate, "d/m/Y H:M");
                    wireTransfer.IsEdited = params.selectedWireTransfer().isEdited;
                    wireTransfer.ValueDate = general.str2Date(data.valueDate());
                    wireTransfer.StatusID = eWireTransferStatus.Approved;
                }
                else {
                    if (data.isApprovedChecked()) {
                        wireTransfer.ValueDate = general.str2Date(data.valueDate());
                        wireTransfer.StatusID = eWireTransferStatus.ApprovalOnPending;
                    }
                    else {
                        wireTransfer.StatusID = eWireTransferStatus.Pending;
                    }
                }

                dalWireTransfer
                    .saveWireTransfer(wireTransfer)
                    .then(onSaveWireTransfer)
                    .fail(function () { data.isSaveSpinnerOn(false); })
                    .done();

                data.isSaveSpinnerOn(true);
            }

            function closeClick() {
                data.isApproveViewVisible(false);
            }

            function onSaveWireTransfer(response) {
                data.isSaveSpinnerOn(false);

                if (response < 0) {
                    window.alert("An error occurred. Please try again.");

                    return;
                }
                else {
                    data.isApproveViewVisible(false);

                    if (general.isFunctionType(params.refreshWireTransfer)) {
                        setTimeout(function () { params.refreshWireTransfer(); }, 2000);
                    }
                }
            }

            function dispose() {
                parent.dispose.call(self);  // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                saveClick: saveClick,
                closeClick: closeClick
            };
        });

        var createViewModel = function (params) {
            var viewModel = new WireTransferNewApproveViewModel(params);

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
