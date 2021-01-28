/* eslint no-alert: 0*/
define("deviceviewmodels/accountstatement/convertaccountlineviewmodel", [
    'require',
    'knockout',
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

        var ConvertAccountLineViewModel = general.extendClass(KoComponentViewModel, function ConvertAccountLineViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                savedComment = "";

            function init() {
                parent.init.call(self); // inherited from KoComponentViewModel

                var args = viewModelsManager.VManager.GetViewArgs(eViewTypes.vConvertAccountLine);

                setObservables(args);
                setSubscribers();
                setComputables();

                getData();
            }

            function getData() {
                dalAccountStatement.getSymbols().then(onGetSymbols).done();
                dalAccountStatement.getActionDetails(data.accountTransactionId()).then(onGetActionDetails).done();
            }

            function setObservables(args) {
                data.accountTransactionId = ko.observable(args.id);
                data.isSaveSpinnerOn = ko.observable(true);
                data.isFormVisible = ko.observable(true);
                data.convertAccountLineDone = ko.observable(false);
                data.accountNumber = ko.observable(customer.prop.accountNumber);
                data.amount = ko.observable(0);
                data.symbolId = ko.observable(0);
                data.symbolName = ko.observable("");
                data.isCredit = ko.observable(true);
                data.sign = ko.observable(1);
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

                data.disableSaveButton = ko.observable(true);
                data.comment = ko.observable("");
            }

            function refreshData() {
                if (general.isNullOrUndefined(data.selectedToCcy()) ||
                    general.isEmpty(data.symbolName()) ||
                    !data.symbolId ||
                    !data.selectedToCcy().SymbolID) {
                    return;
                }

                populateInBetweenQuoteAndExchangeRate();
                updateComment();
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedToCcy, refreshData);

                self.subscribeTo(data.symbolName, refreshData);

                self.subscribeTo(data.exchangeRate, function () {
                    updateComment();
                });

                self.subscribeTo(data.amount, function () {
                    updateComment();
                });
            }

            function setComputables() {
                data.convertedAmount = self.createComputed(function () {
                    data.quoteFormCcyToCcy().bid(data.exchangeRate());
                    data.quoteFormCcyToCcy().ask(data.exchangeRate());

                    var convertedAmount = AmountConverter.Convert(data.amount(), data.quoteFormCcyToCcy());

                    return convertedAmount;
                });
            }

            function onGetActionDetails(action) {
                if (!general.isNullOrUndefined(action)) {
                    data.isSaveSpinnerOn(false);
                    data.symbolId(action.SymbolID);
                    data.symbolName(action.SymbolName);
                    data.amount(action.Balance);
                    data.isCredit(action.IsCredit);
                    data.sign(action.IsCredit === true ? 1 : -1 );
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

            function updateComment() {
                if (!general.isNullOrUndefined(data.selectedToCcy()) && !general.isEmpty(data.selectedToCcy().SymbolName) && !general.isEmpty(data.symbolName()) && !general.isEmpty(data.amount()) && !general.isEmpty(data.exchangeRate())) {
                    var formatedComment = String.format(Dictionary.GetItem('txtConvertAccountLine', 'AccountStatementBackOffice'), Format.toAmount(data.amount(), 2), data.symbolName(), data.selectedToCcy().SymbolName, data.exchangeRate());
                    savedComment = formatedComment;
                    data.comment(formatedComment);
                }
            }

            function populateInBetweenQuoteAndExchangeRate() {
                var inBetweenQuote = null;

                if (data.symbolId() === data.selectedToCcy().SymbolID) {
                    inBetweenQuote = {
                        ask: ko.observable(1),
                        bid: ko.observable(1),
                        instrumentFactor: 1,
                        isOppositeInstrumentFound: false
                    };
                    data.exchangeRate(1);
                    data.quoteFormCcyToCcy(inBetweenQuote);
                } else {
                    dalConversion.getConversionRateFormated(data.symbolId(), data.selectedToCcy().SymbolID, data.symbolName(), data.selectedToCcy().SymbolName).then(function (response) {
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

                if (data.convertAccountLineDone()) {
                    return;
                }

                if (Math.abs(data.amount) < 0.01 && Math.abs(data.convertedAmount()) < 0.01) {
                    alert(Dictionary.GetItem('txtAmountAlert', 'AccountStatementBackOffice'));
                    return;
                }

                if (general.isEmpty(data.exchangeRate())) {
                    alert(Dictionary.GetItem('txtRateAlert', 'AccountStatementBackOffice'));
                    return;
                }

                if (data.symbolName() === data.selectedToCcy().SymbolName) {
                    alert(Dictionary.GetItem('txtSymbolAlert', 'AccountStatementBackOffice'));
                    return;
                }

                if (data.comment() != savedComment) {
                    if (!confirm(Dictionary.GetItem('txtConfirmComment', 'AccountStatementBackOffice'))) {
                        return;
                    }
                }

                var amount = data.sign() * data.amount();

                var ConvertAccountLineRequest = {
                    Amount: amount,
                    Currency: data.symbolName(),
                    ToCurrency: data.selectedToCcy().SymbolName,
                    ToAmount: data.convertedAmount(),
                    Comment: { Text: data.comment(), HasDefaultComment: true },
                    ConvertRate: data.exchangeRate(),
                    AccountTransactionID: data.accountTransactionId()
                };

                dalAccountStatement.saveConvertAccountLine(ConvertAccountLineRequest)
                    .then(onConvertAccountLine)
                    .fail(function () { data.isSaveSpinnerOn(false); })
                    .done();

                data.isSaveSpinnerOn(true);
            }


            function onConvertAccountLine(response) {
                data.isSaveSpinnerOn(false);

                if (response && response.Status === eOperationStatus.Success) {
                    data.convertAccountLineDone(true);
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
            var viewModel = new ConvertAccountLineViewModel();

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    });
