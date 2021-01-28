/* tutorials from signals page */
var TradingSignalsTutorialsViewModel = function (ko, ViewModelBase, general) {
    var self,
        tutorial = {},
        inheritedInstance = general.clone(ViewModelBase);

    var init = function (customSettings) {
        self = this;
        inheritedInstance.setSettings(self, customSettings);
        registerObservableStartUpEvent();
        tutorial.url = ko.observable("");
    };

    var registerObservableStartUpEvent = function () {
        $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vTradingSignalsTutorials).state.subscribe(function (state) {
            switch (state) {
                case eViewState.Start:
                    start();
                    break;

                case eViewState.Stop:
                    stop();
                    break;
                default:
            }
        });
    };

    var start = function () {
        var tradingTutorialsParameters = $viewModelsManager.VManager.GetViewArgs(eViewTypes.vTradingSignalsTutorials);
        tutorial.url(tradingTutorialsParameters.url);
    };

    var stop = function () {
        tutorial.url("");
    };

    return {
        Init: init,
        Tutorial: tutorial
    };
}
