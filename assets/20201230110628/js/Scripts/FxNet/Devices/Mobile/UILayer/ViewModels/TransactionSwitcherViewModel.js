define(
    'deviceviewmodels/TransactionSwitcherViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Q',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/Customer',
        'cachemanagers/QuotesManager',
        'generalmanagers/RegistrationManager',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'modules/BuilderForInBetweenQuote',
        'StateObject!Transaction'
    ],
    function TransactionSwitcherDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            Q = require('Q'),
            ViewModelsManager = require('devicemanagers/ViewModelsManager'),
            customer = require('initdatamanagers/Customer'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            RegistrationManager = require('generalmanagers/RegistrationManager'),
            StatesManager = require('devicemanagers/StatesManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            stateObject = require('StateObject!Transaction');

        var TransactionSwitcherViewModel = general.extendClass(KoComponentViewModel, function TransactionSwitcherClass() {
            var self = this,
                parent = this.parent,
                data = this.Data || {},
                quoteIsReady = Q.defer(),
                usdCcy = 47,
                handlers = {},
                stateObjectSubscriptions = [];

            function init(params) {
                parent.init.call(self, params); // inherited from KoComponentViewModel

                setObservables();
                setComputables();
                setSubscribers();
                setHandlers();
                updateObservables();
                checkQuoteAvailability();
                populateInQuoteForUsdCcyToAccountCcy();

                Q.when(quoteIsReady.promise)
                    .then(updateSelectedTab)
                    .done();
            }

            function checkQuoteAvailability() {
                var isActiveQuote = ViewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vTransactionSwitcher, 'isActiveQuote');
                var quoteState = ViewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vTransactionSwitcher, 'quoteState');

                if (!general.isNullOrUndefined(isActiveQuote) && !general.isNullOrUndefined(quoteState)) {
                    quoteIsReady.resolve({
                        isActiveQuote: isActiveQuote,
                        quoteState: quoteState
                    });
                }
            }

            function updateSelectedTab(quoteData) {
                var transactionTab = ViewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vTransactionSwitcher, 'transactionTab'),
                    isMarketClosed = StatesManager.States.IsMarketClosed(),
                    tabToSelect;

                if (customer.prop.brokerAllowLimitsOnNoRates && (quoteData.quoteState === eQuoteStates.Disabled || isMarketClosed)) {
                    tabToSelect = eTransactionSwitcher.NewLimit;
                } else {
                    tabToSelect = (general.isDefinedType(transactionTab) && general.isDefinedType(eTransactionSwitcher[transactionTab]))
                        ? eTransactionSwitcher[transactionTab]
                        : eTransactionSwitcher.NewDeal;
                }

                stateObject.update('selectedTab', tabToSelect);
            }

            function setObservables() {
                data.hasToolsDataUpdated = stateObject.set('hasToolsDataUpdated', ko.observable(false));
                data.quoteForOtherCcyToAccountCcy = stateObject.set('quoteForOtherCcyToAccountCcy', ko.observable(''));
                data.quoteForBaseCcyToAccountCcy = stateObject.set('quoteForBaseCcyToAccountCcy', ko.observable(''));
                data.quoteForUsdCcyToAccountCcy = stateObject.set('quoteForUsdCcyToAccountCcy', ko.observable(''));
                data.instrumentId = ko.observable();
                data.orderDir = ko.observable();
                data.selectedTransactionTab = ko.observable();
                data.selectedTransactionTab(stateObject.update('selectedTab', ''));

                stateObjectSubscriptions.push({
                    unsubscribe: stateObject.subscribe('selectedTab', function (value) {
                        data.selectedTransactionTab(value);
                    })
                });
                data.ToolsData = null; // to be refactored
            }

            function setComputables() {
                data.isShowNewDeal = self.createComputed(function () {
                    return data.selectedTransactionTab() === eTransactionSwitcher.NewDeal;
                });

                data.isShowNewLimit = self.createComputed(function () {
                    return data.selectedTransactionTab() === eTransactionSwitcher.NewLimit;
                });

                data.showTools = self.createComputed(function () {
                    return data.hasToolsDataUpdated() && (data.selectedTransactionTab() === eTransactionSwitcher.NewDeal || data.selectedTransactionTab() === eTransactionSwitcher.NewLimit);
                });
            }

            function setSubscribers() {
                self.subscribeTo(data.instrumentId,
                    function (instrumentId) {
                        var updateQuote = function () {
                            var activeQuote = QuotesManager.Quotes.GetItem(instrumentId);

                            if (activeQuote) {
                                // From this point we don't need to get updates for this quote
                                QuotesManager.OnChange.Remove(updateQuote);
                                quoteIsReady.resolve({
                                    isActiveQuote: activeQuote.isActive(),
                                    quoteState: activeQuote.state
                                });

                                return true;
                            }

                            return false;
                        };

                        QuotesManager.OnChange.Add(updateQuote);

                        if (updateQuote() === false) {
                            RegistrationManager.Update(eRegistrationListName.SingleQuote, instrumentId);
                        }

                        var instrument = InstrumentsManager.GetInstrument(instrumentId);
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

            function setHandlers() {
                handlers.newDealBtnClick = function () {
                    stateObject.update('selectedTab', eTransactionSwitcher.NewDeal);
                };

                handlers.newLimitBtnClick = function () {
                    stateObject.update('selectedTab', eTransactionSwitcher.NewLimit);
                };
            }

            function updateObservables() {
                var args = ViewModelsManager.VManager.GetViewArgs(eViewTypes.vTransactionSwitcher) || {};

                if (!general.isNullOrUndefined(args.orderDir) && args.instrumentId && InstrumentsManager.GetInstrument(args.instrumentId).isStock && args.orderDir === eOrderDir.Sell) {
                    args.orderDir = eOrderDir.None;
                }

                data.instrumentId(args.instrumentId);
                if (args.orderDir === eOrderDir.Buy || args.orderDir === eOrderDir.Sell) {
                    data.orderDir(args.orderDir);
                } else {
                    data.orderDir(eOrderDir.None);
                }
            }

            function dispose() {
                var selectedAmount = stateObject.get('selectedDealAmount');

                if (selectedAmount) {
                    selectedAmount('');
                }

                while (stateObjectSubscriptions.length > 0) {
                    stateObjectSubscriptions
                        .pop()
                        .unsubscribe();
                }

                stateObject.clear();

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Handlers: handlers,
                Data: data
            };
        });

        function createViewModel(params) {
            var viewModel = new TransactionSwitcherViewModel(params);
            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
