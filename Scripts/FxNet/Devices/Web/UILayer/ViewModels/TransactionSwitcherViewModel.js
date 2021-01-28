define(
    'deviceviewmodels/TransactionSwitcherViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'managers/viewsmanager',
        'initdatamanagers/InstrumentsManager',
        'initdatamanagers/Customer',
        'modules/BuilderForInBetweenQuote',
        'StateObject!Transaction'
    ],
    function TransactionSwitcherDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            dictionary = require('Dictionary'),
            viewsManager = require('managers/viewsmanager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            customer = require('initdatamanagers/Customer'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            stateObject = require('StateObject!Transaction');

        var TransactionSwitcherViewModel = general.extendClass(koComponentViewModel, function TransactionSwitcherClass() {
            var self = this,
                parent = self.parent,
                data = this.Data || {},
                usdCcy = 47,
                transactionsList = [
                    { transactionName: 'fx-component-new-deal-slip', transactionLabel: dictionary.GetItem('NewDeal', 'dialogsTitles', ' '), transactionType: eTransactionSwitcher.NewDeal },
                    { transactionName: 'fx-component-new-limit', transactionLabel: dictionary.GetItem('NewLimit', 'dialogsTitles', ' '), transactionType: eTransactionSwitcher.NewLimit }
                ],
                stateObjectSubscriptions = [];

            function init(customSettings) {
                parent.init.call(self, customSettings);

                setDefaultObservables();
                setComputables();
                setSubscribers();

                populateInQuoteForUsdCcyToAccountCcy();

                setInitialTransactionTab();
            }

            function setDefaultObservables() {
                data.quoteForOtherCcyToAccountCcy = stateObject.set('quoteForOtherCcyToAccountCcy', ko.observable(''));
                data.quoteForBaseCcyToAccountCcy = stateObject.set('quoteForBaseCcyToAccountCcy', ko.observable(''));
                data.quoteForUsdCcyToAccountCcy = stateObject.set('quoteForUsdCcyToAccountCcy', ko.observable(''));
                data.instrumentId = stateObject.set('selectedInstrument', ko.observable(''));
                data.transactionsList = ko.observableArray(transactionsList);
                data.selectedTransactionTab = ko.observable();
                data.selectedTransactionTab(stateObject.update('selectedTransactionTab', {}));
                data.showTransaction = stateObject.get('showTransaction') || stateObject.set('showTransaction', ko.observable(true));
                stateObjectSubscriptions.push({
                    unsubscribe: stateObject.subscribe('selectedTransactionTab', function (value) {
                        data.selectedTransactionTab(value);
                    })
                });
            }

            function setComputables() {
                data.isNewDealVisible = self.createComputed(function () {
                    return data.selectedTransactionTab().transactionType === eTransactionSwitcher.NewDeal;
                });

                data.isNewLimitVisible = self.createComputed(function () {
                    return data.selectedTransactionTab().transactionType === eTransactionSwitcher.NewLimit;
                });
            }

            function setSubscribers() {
                self.subscribeTo(data.instrumentId, function (instrumentId) {
                    var instrument = instrumentsManager.GetInstrument(instrumentId);
                    if (instrument) {
                        populateInBetweenQuotes(instrument);
                    }
                });
            }

            function populateInBetweenQuotes(instrument) {
                BuilderForInBetweenQuote
                    .GetInBetweenQuote(instrument.otherSymbol, customer.prop.baseCcyId())
                    .then(function (response) {
                        data.quoteForOtherCcyToAccountCcy(response);
                    })
                    .done();

                BuilderForInBetweenQuote
                    .GetInBetweenQuote(instrument.baseSymbol, customer.prop.baseCcyId())
                    .then(function (response) {
                        data.quoteForBaseCcyToAccountCcy(response);
                    })
                    .done();
            }

            function populateInQuoteForUsdCcyToAccountCcy() {
                BuilderForInBetweenQuote
                    .GetInBetweenQuote(usdCcy, customer.prop.baseCcyId())
                    .then(function (response) {
                        data.quoteForUsdCcyToAccountCcy(response);
                    })
                    .done();
            }

            function getDefaultTransactionTab() {
                var transactionType = viewsManager.GetViewArgsByKeyName(eViewTypes.vTransactionSwitcher, 'transactionType') || eTransactionSwitcher.NewDeal,
                    tabToSelect = general.isDefinedType(transactionType) && general.objectContainsValue(eTransactionSwitcher, transactionType) ? transactionType : eTransactionSwitcher.NewDeal;

                return getTransactionProperties(tabToSelect);
            }

            function setInitialTransactionTab() {
                var args = viewsManager.GetViewArgs(eViewTypes.vTransactionSwitcher) || {};

                if (!general.isNullOrUndefined(args.orderDir) && args.instrumentId && instrumentsManager.GetInstrument(args.instrumentId).isStock && args.orderDir === eOrderDir.Sell) {
                    args.orderDir = eOrderDir.None;
                }

                stateObject.update('selectedTransactionTab', getDefaultTransactionTab());
            }

            function getTransactionProperties(transactionType) {
                return ko.utils.arrayFirst(transactionsList, function (item) {
                    return item.transactionType === transactionType;
                });
            }

            function dispose() {
                var selectedAmount = stateObject.get("selectedDealAmount");

                if (selectedAmount) {
                    selectedAmount("");
                }

                while (stateObjectSubscriptions.length > 0) {
                    stateObjectSubscriptions.pop()
                        .unsubscribe();
                }

                stateObject.clear();

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new TransactionSwitcherViewModel();
            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
