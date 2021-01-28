/* eslint no-alert: 0*/
define(
    'deviceviewmodels/currencies/currencyconverterviewmodel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'dataaccess/Backoffice/dalCurrencyConverter',
        'Dictionary',
        'enums/enums'
    ],
    function CurrencyConverterViewModelDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            dalCurrencyConverter = require('dataaccess/Backoffice/dalCurrencyConverter'),
            dictionary = require('Dictionary');

        var CurrencyConverterViewModel = general.extendClass(koComponentViewModel, function currencyConverterViewModel() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                dictionaryResourceName = 'CurrencyConverterBackOffice';

            function setObservables() {
                data.availableCurrencies = ko.observable([]);
                data.from = ko.observable();
                data.to = ko.observable();
                data.amount = ko.observable();
                data.result = ko.observable();
                data.rate = ko.observable();
            }

            function setSubscribers() {
                self.subscribeTo(data.from, resetCalculedFields);
                self.subscribeTo(data.to, resetCalculedFields);
                self.subscribeTo(data.amount, resetCalculedFields);
            }

            function init() {
                parent.init.call(self); // inherited from KoComponentViewModel

                getSymbols();
                setObservables();
                setSubscribers();
            }

            function onGetCurrenciesError() {
                alert('cannotLoadCurrenciesFromServer', dictionaryResourceName);
            }

            function parseCurrencies(response) {
                if (response.Status === eOperationStatus.Success) {
                    var symbols = response.Result;

                    symbols.sort(function (s1, s2) {
                        return s1.SymbolName < s2.SymbolName ? -1 : (s1.SymbolName > s2.SymbolName ? 1 : 0);
                    });

                    var reMapped = symbols
                        .map(function (s) {
                            return {
                                symbolId: s.SymbolID,
                                symbolName: s.SymbolName
                            };
                        });

                    data.availableCurrencies(reMapped);
                }
                else {
                    onGetCurrenciesError();
                }
            }

            function getSymbols() {
                dalCurrencyConverter
                    .GetCurrencies()
                    .then(parseCurrencies)
                    .fail(onGetCurrenciesError);
            }

            function resetCalculedFields() {
                data.rate(null);
                data.result(null);
            }

            function isValid() {
                if (!data.from()) {
                    alert(dictionary.GetItem('fromCurrencyIsMissing', dictionaryResourceName));
                    return false;
                }

                if (!data.to()) {
                    alert(dictionary.GetItem('toCurrencyIsMissing', dictionaryResourceName));
                    return false;
                }

                var numericAmount = Number(data.amount());
                if (isNaN(numericAmount) || 0 >= numericAmount || countDecimals(numericAmount) > 2) {
                    alert(dictionary.GetItem('amountToConvertIsMissing', dictionaryResourceName));
                    return false;
                }

                return true;
            }

            function countDecimals(value) {
                if ((value % 1) != 0)
                    return value.toString().split(".")[1].length;
                return 0;
            }

            function onGetResultError() {
                alert('cannotLoadResultFromServer', dictionaryResourceName);
            }

            function parseConvertResponse(response) {
                if (response.Status === eOperationStatus.Success) {
                    data.result(response.Result.Amount.toFixed(2));
                    data.rate(response.Result.Rate.toFixed(response.Result.DecimalDigits));
                }
                else {
                    onGetResultError();
                }
            }

            function convert() {
                if (!isValid()) {
                    return;
                }

                dalCurrencyConverter.Convert(data.from().symbolId, data.to().symbolId, Number(data.amount()))
                    .then(parseConvertResponse)
                    .fail(onGetResultError);
            }

            return {
                init: init,
                Data: data,
                DoConversion: convert
            };
        });

        function createViewModel() {
            var viewModel = new CurrencyConverterViewModel();

            viewModel.init();

            return viewModel;
        }


        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
