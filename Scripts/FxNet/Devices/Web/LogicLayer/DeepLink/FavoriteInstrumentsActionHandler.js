define(
    'devicecustomdeeplinks/FavoriteInstrumentsActionHandler',
    [
        'require'
    ],
    function FavoriteInstrumentsActionHandler() {
        function showFavoriteInstrumentsPreset() {
            FxNet.ViewModelsManager.VmQuotesPreset.SelectPreset(ePresetType.PresetCustomized);
        }

        function showFavoriteInstrumentsPresetWhenReady() {
            var componentsLoadedSubscriber = window.componentsLoaded.subscribe(function (loaded) {
                if (!loaded) {
                    return;
                }

                componentsLoadedSubscriber.dispose();
                showFavoriteInstrumentsPreset();
            });

            window.componentsLoaded.notifySubscribers(window.componentsLoaded());
        }

        return {
            HandleDeepLink: showFavoriteInstrumentsPresetWhenReady
        };
    }
);