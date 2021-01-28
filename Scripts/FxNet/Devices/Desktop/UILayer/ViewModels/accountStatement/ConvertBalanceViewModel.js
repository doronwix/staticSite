/* eslint no-alert: 0*/
define(
    "deviceviewmodels/accountstatement/convertbalanceviewmodel",
    [
        'require',
        'knockout',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'devicemanagers/ViewModelsManager',
        'handlers/AmountConverter',
        'initdatamanagers/Customer',
        'Dictionary',
        'dataaccess/Backoffice/dalAccountStatement',
        'dataaccess/dalConversion',
        'LoadDictionaryContent!AccountStatementBackOffice'
    ],
    function (require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            AmountConverter = require("handlers/AmountConverter"),
            customer = require('initdatamanagers/Customer'),
            Dictionary = require("Dictionary"),
            dalAccountStatement = require("dataaccess/Backoffice/dalAccountStatement"),
            dalConversion = require("dataaccess/dalConversion");

        var ConvertBalanceViewModel = general.extendClass(KoComponentViewModel, function ConvertBalanceViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                savedComment = "";

            function init() {
                parent.init.call(self); // inherited from KoComponentViewModel

                var args = viewModelsManager.VManager.GetViewArgs(eViewTypes.vConvertBalance);

                setObservables(args);
                setComputables();
                setSubscribers();

                getData();
            }

            function getData() {
                dalAccountStatement.getSymbols().then(onGetSymbols).done();
                dalAccountStatement.getCustomerBalances().then(onGetCustomerBalances).done();
            }

            function setObservables(args) {
                data.isSaveSpinnerOn = ko.observable(true);
                data.isFormVisible = ko.observable(true);
                data.convertBalanceDone = ko.observable(false);
                data.accountTransactionId = ko.observable(args.id);
                data.accountNumber = ko.observable(customer.prop.accountNumber);
                data.symbols = ko.observableArray([]);
                data.selectedToCcy = ko.observable();
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

                data.quoteFormCcyToCcy = ko.observable({
                    ask: ko.observable(1),
                    bid: ko.observable(1),
                    instrumentFactor: 1,
                    isOppositeInstrumentFound: false
                });

                data.balances = ko.observableArray([]);
                data.selectedBalance = ko.observable({
                    SymbolID: 0,
                    SymbolName: 0,
                    Amount: 0,
                });
                data.comment = ko.observable("").extend({ dirty: true });
            }

            function refreshData() {
                if (general.isNullOrUndefined(data.selectedToCcy()) ||
                    general.isNullOrUndefined(data.selectedBalance()) ||
                    !data.selectedBalance().SymbolID ||
                    !data.selectedToCcy().SymbolID) {
                    return;
                }

                populateInBetweenQuoteAndExchangeRate();
                updateComment();
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedToCcy, refreshData);

                self.subscribeTo(data.selectedBalance, refreshData);

                self.subscribeTo(data.exchangeRate, function () {
                    updateComment();
                });

                self.subscribeTo(data.amount, function () {
                    updateComment();
                });
            }

            function setComputables() {
                data.amount = self.createComputed(function () {
                    if (general.isNullOrUndefined(data.selectedBalance())) {
                        return 0;
                    }

                    return data.selectedBalance().Amount;
                });

                data.convertedAmount = self.createComputed(function () {
                    data.quoteFormCcyToCcy().bid(data.exchangeRate());
                    data.quoteFormCcyToCcy().ask(data.exchangeRate());

                    var convertedAmount = AmountConverter.Convert(data.amount(), data.quoteFormCcyToCcy());

                    return convertedAmount;
                });
            }

            function updateComment() {
                if (!general.isNullOrUndefined(data.selectedToCcy()) && !general.isEmpty(data.selectedToCcy().SymbolName) && !general.isNullOrUndefined(data.selectedBalance()) && !general.isEmpty(data.selectedBalance().SymbolName) && !general.isEmpty(data.exchangeRate())) {
                    var formatedComment = String.format(Dictionary.GetItem('txtCommentBalance', 'AccountStatementBackOffice'), Format.toAmount(data.amount(), 2), data.selectedBalance().SymbolName, data.selectedToCcy().SymbolName, data.exchangeRate());
                    savedComment = formatedComment;
                    data.comment(formatedComment);
                }
            }

            function onGetSymbols(symbols) {
                data.symbols(symbols.filter(function (symbol) {
                    return symbol.IsAccountBase === true;
                }));

                data.selectedToCcy(symbols.find(function (s) {
                    return s.SymbolName === customer.prop.baseCcyName();
                }));
            }

            function onGetCustomerBalances(balances) {
                data.isSaveSpinnerOn(false);
                data.balances(balances);
                data.selectedBalance(balances[0]);
            }

            function populateInBetweenQuoteAndExchangeRate() {
                var inBetweenQuote = null;

                if (data.selectedBalance().SymbolID === data.selectedToCcy().SymbolID) {
                    inBetweenQuote = {
                        ask: ko.observable(1),
                        bid: ko.observable(1),
                        instrumentFactor: 1,
                        isOppositeInstrumentFound: false
                    };
                    data.exchangeRate(1);
                    data.quoteFormCcyToCcy(inBetweenQuote);
                } else {
                    dalConversion.getConversionRateFormated(data.selectedBalance().SymbolID, data.selectedToCcy().SymbolID, data.selectedBalance().SymbolName, data.selectedToCcy().SymbolName).then(function (response) {
                        var result = response.result;
                        if (result) {
                            var rate = result.formattedRate;

                            inBetweenQuote = {
                                ask: ko.observable(rate),
                                bid: ko.observable(rate),
                                instrumentFactor: result.instrumentFactor,
                                isOppositeInstrumentFound: result.isOppositeInstrumentFound
                            };

                            data.exchangeRate(rate);
                            data.quoteFormCcyToCcy(inBetweenQuote);
                        }
                    }).done();
                }
            }

            function saveClick() {
                if (data.isSaveSpinnerOn()) {
                    return;
                }

                if (data.convertBalanceDone()) {
                    return;
                }

                if (Math.abs(data.amount()) < 0.01 && Math.abs(data.convertedAmount()) < 0.01) {
                    alert(Dictionary.GetItem('txtAmountAlert', 'AccountStatementBackOffice'));
                    return;
                }

                if (general.isEmpty(data.exchangeRate())) {
                    alert(Dictionary.GetItem('txtRateAlert', 'AccountStatementBackOffice'));
                    return;
                }

                if (data.selectedBalance().SymbolName === data.selectedToCcy().SymbolName) {
                    alert(Dictionary.GetItem('txtSymbolAlert', 'AccountStatementBackOffice'));
                    return;
                }

                if (data.comment() != savedComment) {
                    if (!confirm(Dictionary.GetItem('txtConfirmComment', 'AccountStatementBackOffice'))) {
                        return;
                    }
                }

                var convertBalanceRequest = {
                    Amount: data.amount(),
                    Currency: data.selectedBalance().SymbolName,
                    ToCurrency: data.selectedToCcy().SymbolName,
                    ToAmount: data.convertedAmount(),
                    Comment: { Text: data.comment(), HasDefaultComment: true },
                    ConvertRate: data.exchangeRate()
                };

                dalAccountStatement.saveConvertBalance(convertBalanceRequest)
                    .then(onSaveConvertBalance)
                    .fail(function () { data.isSaveSpinnerOn(false); })
                    .done();

                data.isSaveSpinnerOn(true);
            }


            function onSaveConvertBalance(response) {
                data.isSaveSpinnerOn(false);

                if (response && response.Status === eOperationStatus.Success) {
                    data.convertBalanceDone(true);
                    data.isFormVisible(false);
                } else {
                    alert(Dictionary.GetItem('txtFailedAlert', 'AccountStatementBackOffice'));
                }
            }

            return {
                init: init,
                Data: data,
                saveClick: saveClick
            };
        });

        var createViewModel = function () {
            var viewModel = new ConvertBalanceViewModel();

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    });
