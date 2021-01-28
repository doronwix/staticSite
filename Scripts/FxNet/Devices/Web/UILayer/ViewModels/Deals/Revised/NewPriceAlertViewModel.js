define('deviceviewmodels/Deals/Revised/NewPriceAlertViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'modules/NewPriceAlertModule',
        'Dictionary',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'configuration/initconfiguration',
        'StateObject!Transaction',
        'initdatamanagers/Customer',
        'modules/BuilderForInBetweenQuote'
    ], function NewPriceAlertDefault(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            config = require('configuration/initconfiguration'),
            dynamicTitleKey = config.DynamicTitleConfiguration.dynamicTitleKey,
            settings = config.PriceAlertConfiguration,
            Dictionary = require('Dictionary'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            stateObject = require('StateObject!Transaction'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            NewPriceAlertModule = require('modules/NewPriceAlertModule'),
            customer = require('initdatamanagers/Customer'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote');

        var NewPriceAlertViewModel = general.extendClass(NewPriceAlertModule.ViewModel, function NewPriceAlertClass() {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init(customSettings) {
                parent.init.call(self, customSettings);

                data.showTransaction = stateObject.get('showTransaction') || stateObject.set('showTransaction', ko.observable(true));
                setObservables();
                setDynamicTitle();
                setSubscribers();
                setChartProperties();
            }

            function setObservables() {
                data.quoteForOtherCcyToAccountCcy = stateObject.get("quoteForOtherCcyToAccountCcy") ||
                    stateObject.set('quoteForOtherCcyToAccountCcy', ko.observable(''));
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedInstrument, function (instrumentId) {
                    var instrument = instrumentsManager.GetInstrument(instrumentId);
                    if (instrument) {
                        stateObject.update(dynamicTitleKey, getTitle(instrumentId));
                        populateInBetweenQuotes(instrument);
                    }
                });
            }

            function populateInBetweenQuotes(instrument) {
                BuilderForInBetweenQuote.GetInBetweenQuote(instrument.otherSymbol, customer.prop.baseCcyId())
                    .then(function (response) {
                        data.quoteForOtherCcyToAccountCcy(response);
                    })
                    .done();
            }

            function setChartProperties() {
                stateObject.update('chart', settings.chart);
            }

            function setDynamicTitle() {
                if (!stateObject.containsKey(dynamicTitleKey)) {
                    stateObject.set(dynamicTitleKey, getTitle(data.selectedInstrument()));
                } else {
                    stateObject.update(dynamicTitleKey, getTitle(data.selectedInstrument()));
                }
            }

            function getTitle(instrId) {
                var firstPart = Dictionary.GetItem('titlePriceAlert', 'dialogsTitles');

                return String.format(firstPart, instrumentTranslationsManager.Long(instrId));
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NewPriceAlertViewModel();

            var currentSettings = Object.assign(settings, params);
            viewModel.init(currentSettings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }); 