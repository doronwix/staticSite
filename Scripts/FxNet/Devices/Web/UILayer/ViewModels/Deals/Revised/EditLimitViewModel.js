define('deviceviewmodels/Deals/Revised/EditLimitViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        'managers/instrumentTranslationsManager',
        'configuration/initconfiguration',
        'StateObject!Transaction',
        'deviceviewmodels/Deals/Modules/EditLimitModule'
    ], function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            config = require('configuration/initconfiguration'),
            dynamicTitleKey = config.DynamicTitleConfiguration.dynamicTitleKey,
            settings = config.NewDealConfiguration,
            Dictionary = require('Dictionary'),
            stateObject = require('StateObject!Transaction'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            EditLimitModule = require('deviceviewmodels/Deals/Modules/EditLimitModule');

        var EditLimitViewModel = general.extendClass(EditLimitModule.ViewModel, function EditLimitClass() {
            var self = this,
                parent = this.parent,
                data = this.Data,
                SetLimitsInfo = this.SetLimitsInfo;

            function init(customSettings) {
                parent.init.call(self, customSettings);

                data.showTransaction = stateObject.get('showTransaction') || stateObject.set('showTransaction', ko.observable(true));
                enableSlTpLimit();
                setDynamicTitle();
                setSubscribers();
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedInstrument, function (value) {
                    stateObject.update(dynamicTitleKey, getTitle(value));
                });
            }

            function enableSlTpLimit() {
                if (SetLimitsInfo.stopLossRate() !== String.empty) {
                    data.enableSLLimit(true);
                }

                if (SetLimitsInfo.takeProfitRate() !== String.empty) {
                    data.enableTPLimit(true);
                }
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

                if (data.addSlTpType() == eLimitType.StopLoss) {
                    firstPart = Dictionary.GetItem('titleAddStopLoss', 'dialogsTitles');
                } else if (data.addSlTpType() == eLimitType.TakeProfit) {
                    firstPart = Dictionary.GetItem('titleAddTakeProfit', 'dialogsTitles');
                } else {
                    firstPart = Dictionary.GetItem('titleUpdateRemoveLimit', 'dialogsTitles');
                }

                return String.format(firstPart, instrumentTranslationsManager.Long(instrId));
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new EditLimitViewModel();

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