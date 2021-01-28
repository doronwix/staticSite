define(
    'devicecustomdeeplinks/CashBackActionHandler',
    [
        'require',
        'deviceviewmodels/WalletModule'
    ],
    function CashBackActionHandler(require) {
        var walletModule = require('deviceviewmodels/WalletModule');

        function openCashBackPopup() {
            walletModule.WalletInfo.showCashBack();
        }

        function openCashBackPopuppWhenReady() {
            var componentsLoadedSubscriber = window.componentsLoaded.subscribe(function (loaded) {
                if (!loaded) {
                    return;
                }

                componentsLoadedSubscriber.dispose();
                openCashBackPopup();
            });

            window.componentsLoaded.notifySubscribers(window.componentsLoaded());
        }

        return {
            HandleDeepLink: openCashBackPopuppWhenReady
        };
    }
);