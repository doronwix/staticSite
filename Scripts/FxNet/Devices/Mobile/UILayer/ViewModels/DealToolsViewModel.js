define(
    'deviceviewmodels/DealToolsViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/Deals/DealToolsBaseViewModel',
        'StateObject!Transaction',
        'helpers/CustomKOBindings/SwipeTabs'
    ],
    function DealToolsDef(require) {
        var baseViewModel = require('viewmodels/Deals/DealToolsBaseViewModel'),
            general = require('handlers/general'),
            stateObject = require('StateObject!Transaction');

        var DealToolsViewModel = general.extendClass(baseViewModel.DealToolsViewModel, function DealToolsClass(params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                dealData = params.toolsData || stateObject.getAll();

            function init(settings) {
                settings = settings || {};
                settings.view = settings.view || eViewTypes.vNewDeal;
                settings.transArgs = params.transArgs;

                parent.init.call(self, settings);

                setSubscribers();
            }

            function setSubscribers() {
                self.subscribeAndNotify(data.isDataLoaded, isDataLoadedChanged);
            }

            function isDataLoadedChanged(isDataLoaded) {
                if (!isDataLoaded) {
                    return;
                }

                setHandlers();

                data.showTools(true);
            }

            function setHandlers() {
                self.Handlers.swipeLeft = onSwipeLeft;
                self.Handlers.swipeRight = onSwipeRight;
            }

            function onSwipeLeft() {
                var selectedTab = data.selectedToolTab();

                switch (selectedTab) {
                    case eNewDealTool.MarketLiveInfo:
                        data.selectedToolTab(eNewDealTool.Signals);
                        return true;

                    case eNewDealTool.Signals:
                        data.selectedToolTab(eNewDealTool.Chart);
                        return true;
                }

                return false;
            }

            function onSwipeRight() {
                var selectedTab = data.selectedToolTab();

                switch (selectedTab) {
                    case eNewDealTool.MarketLiveInfo:
                        data.selectedToolTab(eNewDealTool.Chart);
                        return true;

                    case eNewDealTool.Signals:
                        data.selectedToolTab(eNewDealTool.MarketLiveInfo);
                        return true;
                }

                return false;
            }

            return {
                init: init,
                NewDealData: dealData
            };
        });

        var createViewModel = function(params) {
            var viewModel = new DealToolsViewModel(params);

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
