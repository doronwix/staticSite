define(
    'deviceviewmodels/Deals/Revised/EditClosingLimitViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'deviceviewmodels/Deals/Modules/EditClosingLimitModule',
        'Dictionary',
        'managers/instrumentTranslationsManager',
        'configuration/initconfiguration',
        'StateObject!Transaction'
    ],
    function EditClosingLimitDefault(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            config = require('configuration/initconfiguration'),
            dynamicTitleKey = config.DynamicTitleConfiguration.dynamicTitleKey,
            settings = config.NewDealConfiguration,
            Dictionary = require('Dictionary'),
            stateObject = require('StateObject!Transaction'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            EditClosingLimitModule = require('deviceviewmodels/Deals/Modules/EditClosingLimitModule');

        var EditClosingLimitViewModel = general.extendClass(EditClosingLimitModule.ViewModel, function EditClosingLimitClass() {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init(customSettings) {
                parent.init.call(self, customSettings);

                data.showTransaction = stateObject.get('showTransaction') || stateObject.set('showTransaction', ko.observable(true));
                setDynamicTitle();
                setSubscribers();
            }

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
                var firstPart = '';

                if (data.limitType() == eLimitType.StopLoss) {
                    firstPart = Dictionary.GetItem('titleAddStopLoss', 'dialogsTitles');
                } else if (data.limitType() == eLimitType.TakeProfit) {
                    firstPart = Dictionary.GetItem('titleAddTakeProfit', 'dialogsTitles');
                }

                return String.format(firstPart, instrumentTranslationsManager.Long(instrId));
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new EditClosingLimitViewModel();

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
