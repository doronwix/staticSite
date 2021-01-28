define(
    'devicecustomdeeplinks/DepositActionHandler',
    [
        'require',
        'managers/viewsmanager',
        'managers/ViewsRouterManager'
    ],
    function DepositActionHandler() {
        function redirectToDepositForm() {
            var ViewsManager = require('managers/viewsmanager'),
                ViewsRouterManager = require('managers/ViewsRouterManager');

            var redirectView = ViewsRouterManager.GetFormToRedirect(eForms.Deposit).viewType;

            if (redirectView !== eForms.Deposit) {
                ViewsManager.SwitchViewVisible(redirectView);
            }
        }

        function redirectToDepositFormWhenReady() {
            var componentsLoadedSubscriber = window.componentsLoaded.subscribe(function (loaded) {
                if (!loaded) {
                    return;
                }

                componentsLoadedSubscriber.dispose();
                redirectToDepositForm();
            });

            window.componentsLoaded.notifySubscribers(window.componentsLoaded());
        }

        return {
            HandleDeepLink: redirectToDepositFormWhenReady
        };
    }
);