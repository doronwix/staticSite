define(
    'deviceviewmodels/TileTransactionSwitcherViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'managers/viewsmanager',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'cachemanagers/QuotesManager',
        'initdatamanagers/Customer',
        'modules/BuilderForInBetweenQuote',
        'StateObject!Transaction',
        'generalmanagers/RegistrationManager',
        'managers/ChartSettingManager',
        'managers/ChartLayoutSettings'
    ],
    function TransactionSwitcherDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            dictionary = require('Dictionary'),
            viewsManager = require('managers/viewsmanager'),
            statesManager = require('devicemanagers/StatesManager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            quotesManager = require('cachemanagers/QuotesManager'),
            customer = require('initdatamanagers/Customer'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            stateObject = require('StateObject!Transaction'),
            registrationManager = require('generalmanagers/RegistrationManager'),
            chartSettingManager = require('managers/ChartSettingManager'),
            chartLayoutSettings = require('managers/ChartLayoutSettings');

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

                chartLayoutSettings.Init();
                registerInstruments();

                setDefaultObservables();
                setComputables();
                setSubscribers();

                populateInQuoteForUsdCcyToAccountCcy();
            }

            function setDefaultObservables() {
                data.quoteForOtherCcyToAccountCcy = stateObject.set('quoteForOtherCcyToAccountCcy', ko.observable(''));
                data.quoteForBaseCcyToAccountCcy = stateObject.set('quoteForBaseCcyToAccountCcy', ko.observable(''));
                data.quoteForUsdCcyToAccountCcy = stateObject.set('quoteForUsdCcyToAccountCcy', ko.observable(''));
                data.instrumentId = stateObject.set('selectedInstrument', ko.observable(''));
                data.transactionsList = ko.observableArray(transactionsList);
                data.selectedTransactionTab = ko.observable();
                data.selectedTransactionTab(stateObject.update('selectedTransactionTab', {}));
                stateObjectSubscriptions.push({
                    unsubscribe: stateObject.subscribe('selectedTransactionTab', function (value) {
                        data.selectedTransactionTab(value)
                    })
                });
                data.isReady = ko.observable(false);
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
                    populateInBetweenQuotes(instrument);
                });

                subscribeToQuotesManager();
            }

            function populateInBetweenQuotes(instrument) {
                BuilderForInBetweenQuote.GetInBetweenQuote(instrument.otherSymbol, customer.prop.baseCcyId()).then(function (response) {
                    data.quoteForOtherCcyToAccountCcy(response);
                });

                BuilderForInBetweenQuote.GetInBetweenQuote(instrument.baseSymbol, customer.prop.baseCcyId()).then(function (response) {
                    data.quoteForBaseCcyToAccountCcy(response);
                });
            }

            function populateInQuoteForUsdCcyToAccountCcy() {
                BuilderForInBetweenQuote.GetInBetweenQuote(usdCcy, customer.prop.baseCcyId()).then(function (response) {
                    data.quoteForUsdCcyToAccountCcy(response);
                }).done();
            }

            function getTransactionTab(quote) {
                var transactionType = viewsManager.GetViewArgsByKeyName(eViewTypes.vTransactionSwitcher, 'transactionType') || eTransactionSwitcher.NewDeal,
                    tabToSelect = general.isDefinedType(transactionType) && general.objectContainsValue(eTransactionSwitcher, transactionType) ? transactionType : eTransactionSwitcher.NewDeal,
                    isMarketClosed = statesManager.States.IsMarketClosed();

                if (customer.prop.brokerAllowLimitsOnNoRates && (quote.state === eQuoteStates.Disabled || isMarketClosed)) {
                    tabToSelect = eTransactionSwitcher.NewLimit;
                }

                return getTransactionProperties(tabToSelect);
            }

            function getTransactionProperties(transactionType) {
                return ko.utils.arrayFirst(transactionsList, function (item) {
                    return item.transactionType === transactionType;
                });
            }

            function subscribeToQuotesManager() {
                var activeChartInstrumentId = getActiveTileInstrumentId();

                function updateQuote() {
                    var quote = quotesManager.Quotes.GetItem(activeChartInstrumentId);

                    if (!quote) {
                        return;
                    }

                    data.instrumentId(activeChartInstrumentId);

                    quotesManager.OnChange.Remove(updateQuote);

                    setInitialTransactionTab(quote);
                }

                quotesManager.OnChange.Add(updateQuote);
                updateQuote();
            }

            function registerInstruments() {
                registrationManager.Update(eRegistrationListName.ContractQuotesTable, chartLayoutSettings.GetTileInstruments());
            }

            function setInitialTransactionTab(quote) {
                var transactionTab = getTransactionTab(quote);
                stateObject.update('selectedTransactionTab', transactionTab);
                data.isReady(true);
            }

            function getActiveTileInstrumentId() {
                var tileSettings = chartSettingManager.Chart().tileSettings || {},
                    activeTileId = tileSettings.activeTileId || 0,
                    activeChartSettings = chartLayoutSettings.GetSettings(activeTileId) || {};

                return activeChartSettings.instrumentId;
            }

            function dispose() {
                while (stateObjectSubscriptions.length > 0) {
                    stateObjectSubscriptions.pop()
                        .unsubscribe();
                }
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
