define(
    'viewmodels/Deals/RateRangeIndicatorViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var RateRangeIndicatorViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel
                data.instrumentId = params.instrumentId;
                data.id = params.id;
                setObservables();
                setSubscribers();
                loadValues();
            }

            function setObservables() {
                data.currentRate = params.currentRate;
                data.lowValue = ko.observable('');
                data.highValue = ko.observable('');
                data.range =  ko.observable(0);
            }

            function setSubscribers() {
                self.subscribeTo(data.currentRate, function () {
                    data.range(calculateRange());
                });
            }

            function calculateRange() {
                var low = parseFloat(data.lowValue()),
                    high = parseFloat(data.highValue()),
                    currentRate = parseFloat(data.currentRate()),
                    result = 0;

                if (currentRate < low) {
                    data.lowValue(data.currentRate());
                } else if (currentRate > high) {
                    data.highValue(data.currentRate());
                    result = 100;
                } else {
                    result = low !== high ? parseInt(((currentRate - low) * 100) / (high - low)) : 50;
                }

                return result;
            }

            function loadValues() {
                var periodData = params.periodData.find(function(period) {
                    return period.id === data.id;
                });

                if (periodData) {
                    data.lowValue(periodData.low);
                    data.highValue(periodData.high);
                    data.range(data.currentRate() !== '' ? calculateRange() : 0);
                }
            }
            
            function dispose() {
                parent.dispose.call(self);
            }
        
            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new RateRangeIndicatorViewModel(params);
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