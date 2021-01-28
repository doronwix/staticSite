define(
    'deviceviewmodels/Deals/Revised/NewLimitViewModel',
    [
        'require',
        'handlers/general',
        'deviceviewmodels/Deals/Modules/NewLimitModule',
        'Dictionary',
        'managers/instrumentTranslationsManager',
        'configuration/initconfiguration',
        'StateObject!Transaction'
    ],
    function RevisedNewDealSlipDef(require) {
        var general = require('handlers/general'),
            config = require('configuration/initconfiguration'),
            dynamicTitleKey = config.DynamicTitleConfiguration.dynamicTitleKey,
            settings = config.NewDealConfiguration,
            Dictionary = require('Dictionary'),
            stateObject = require('StateObject!Transaction'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            NewLimitModule = require('deviceviewmodels/Deals/Modules/NewLimitModule');

        var NewLimitViewModel = general.extendClass(NewLimitModule.ViewModel, function NewLimitClass() {
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
                }
                else {
                    stateObject.update(dynamicTitleKey, getTitle(data.selectedInstrument()));
                }
            }

            function getTitle(instrId) {
                var firstPart = Dictionary.GetItem('titleDealSlip', 'dialogsTitles');

                return String.format(firstPart, instrumentTranslationsManager.Long(instrId));
            }

            function init(customSettings) {
                parent.init.call(self, customSettings);

                setDynamicTitle();
                setSubscribers();
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NewLimitViewModel();

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
