define(
    'deviceviewmodels/Deals/MarketInfoSummaryViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!Transaction'
    ],
    function (require) {
        var KoComponentViewModel = require('helpers/KoComponentViewModel'),
            general = require('handlers/general'),
            stateObject = require('StateObject!Transaction');

        var MarketInfoSummaryViewModel = general.extendClass(KoComponentViewModel, function () {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                newDealData = stateObject.getAll();

            function init(settings) {
                parent.init.call(self, settings); 

                setComputables();
            }

            function setComputables() {
                data.change = self.createComputed(function () {
                    var currentSell = newDealData.bid(),
                        previousCloseSell = newDealData.close();

                    return Format.toRate(currentSell - previousCloseSell, true, newDealData.selectedInstrument());
                });
            }

            return {
                init: init,
                Data: data,
                NewDealData: newDealData
            };
        });

        var createViewModel = function () {
            var viewModel = new MarketInfoSummaryViewModel();

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