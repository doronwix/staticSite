define(
    'deviceviewmodels/Deals/DynamicTitleSlip',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!Transaction',
        'configuration/initconfiguration',
    ],
    function DynamicTitleSlipDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            stateObject = require('StateObject!Transaction'),
            dynamicTitleKey = require('configuration/initconfiguration').DynamicTitleConfiguration.dynamicTitleKey,
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var DynamicTitleSlip = general.extendClass(KoComponentViewModel, function DynamicTitleSlipClass() {
            var data = this.Data;

            function setObservables() {
                data.dynamicTitle = ko.observable(stateObject.get(dynamicTitleKey));
            }

            function setSubscribers() {
                stateObject.subscribe(dynamicTitleKey, function (value) {
                    data.dynamicTitle(value);
                });
            }

            function init() {
                setObservables();
                setSubscribers();
            }

            return {
                Data: data,
                init: init
            }
        });

        var createViewModel = function () {
            var viewModel = new DynamicTitleSlip();

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
