define(
    'deviceviewmodels/Deals/Revised/NewDealViewModel',
    [
        'require',
        'handlers/general',
        'Dictionary',
        'managers/instrumentTranslationsManager',
        'configuration/initconfiguration',
        'StateObject!Transaction',
        'devicemanagers/StatesManager',
        'deviceviewmodels/Deals/Modules/NewDealModule'
    ],
    function NewDealSlipDefault(require) {
        var general = require('handlers/general'),
            config = require('configuration/initconfiguration'),
            dynamicTitleKey = config.DynamicTitleConfiguration.dynamicTitleKey,
            settings = config.NewDealConfiguration,
            Dictionary = require('Dictionary'),
            stateObject = require('StateObject!Transaction'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            NewDealViewModule = require('deviceviewmodels/Deals/Modules/NewDealModule'),
            statesManager = require('devicemanagers/StatesManager');

        var NewDealViewModel = general.extendClass(NewDealViewModule.ViewModel, function NewDealClass() {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function setSubscribers() {
                self.subscribeTo(data.selectedInstrument, function (value) {
                    stateObject.update(dynamicTitleKey, getTitle(value));
                });
            }

            function setDynamicTitle() {
                if (!stateObject.containsKey(dynamicTitleKey)) {
                    stateObject.set(dynamicTitleKey, getTitle(data.selectedInstrument()));
                } else {
                    stateObject.update(dynamicTitleKey, getTitle(data.selectedInstrument()));
                }
            }

            function getTitle(instrId) {
                var firstPart = Dictionary.GetItem('titleDealSlip', 'dialogsTitles');

                return String.format(firstPart, instrumentTranslationsManager.Long(instrId));
            }

            function setComputables() {
                data.isInstrumentAvailable = self.createComputed(function () {
                    return !statesManager.States.IsMarketClosed() && data.isActiveQuote();
                });
            }

            function init(customSettings) {
                parent.init.call(self, customSettings);

                setDynamicTitle();
                setSubscribers();
                setComputables();
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NewDealViewModel();

            var currentSettings = Object.assign(settings, params);
            viewModel.init(currentSettings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
