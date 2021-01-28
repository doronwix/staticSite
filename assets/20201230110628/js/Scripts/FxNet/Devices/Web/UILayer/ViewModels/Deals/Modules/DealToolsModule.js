define(
    'deviceviewmodels/Deals/Modules/DealToolsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'viewmodels/Deals/DealToolsBaseViewModel',
        'StateObject!TradingEnabled',
        'StateObject!Transaction'
    ],
    function DealToolsDefault(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            stateObject = require('StateObject!Transaction'),
            stateTradingEnabled = require('StateObject!TradingEnabled'),
            baseViewModel = require('viewmodels/Deals/DealToolsBaseViewModel');

        var DealToolsModule = general.extendClass(baseViewModel.DealToolsViewModel, function DealToolsModuleClass() {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init(settings) {
                parent.init.call(self, settings);

                stateObject.set("stateObjectIsReadyDefer", Q.defer())
                    .promise
                    .then(updateReadyForUse)
                    .done();

                setObservables();
            }

            function setObservables() {
                data.showToolsWhenTradingDisabled = stateTradingEnabled.containsKey('TradingEnabled')
                    ? ko.observable(stateTradingEnabled.get('TradingEnabled'))
                    : ko.observable(false);
            }

            function updateReadyForUse() {
                stateObject.update(eStateObjectTopics.ReadyForUse, true);
            }

            return {
                init: init,
                Handlers: parent.Handlers,
                DealData: parent.DealData
            };
        });

        return {
            ViewModel: DealToolsModule
        };
    }
);
