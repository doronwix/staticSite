define(
    'viewmodels/MarketClosedViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'devicemanagers/StatesManager',
        'generalmanagers/ErrorManager',
        "dataaccess/dalMarketState"
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            statesManager = require('devicemanagers/StatesManager'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            dalMarketState = require("dataaccess/dalMarketState");

        var MarketClosedViewModel = general.extendClass(KoComponentViewModel, function (parameters) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setValues();
                setObservables();
                setSubscribers();
            }

            function setValues() {
                data.postboxTopic = parameters.postboxTopic;
                data.marketState = null;
            }

            function setObservables() {
                data.isReady = ko.observable(false);
            }

            function setSubscribers() {
                data.isVisibleMarketClosedBanner = self.createComputed(function () {
                    var isMarketClosedBannerVisible = statesManager.States.IsMarketClosed() && !statesManager.States.IsPortfolioInactive();

                    if (isMarketClosedBannerVisible) {
                        getData();
                    }

                    return isMarketClosedBannerVisible;
                });
            }

            function getData() {
                dalMarketState.GetData()
                    .then(setData)
                    .fail(onError)
                    .done();
            }

            function setData(marketState) {
                data.marketState = marketState;
                data.isReady(true);
            }

            function onError(error) {
                ErrorManager.onError('MarketClosedViewModel.getData', '', eErrorSeverity.high);

                throw error;
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new MarketClosedViewModel(params);

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
