define(
    'devicecustomdeeplinks/DepositActionHandler',
    [
        'require',
        'managers/viewsmanager',
        'managers/ViewsRouterManager'
    ],
    function DepositActionHandler() {
        function redirectToDepositForm(args) {
            var ViewsManager = require('managers/viewsmanager'),
                ViewsRouterManager = require('managers/ViewsRouterManager');

            var redirectView = ViewsRouterManager.GetFormToRedirect(eForms.Deposit, args).viewType;

            if (redirectView !== eForms.Deposit) {
                ViewsManager.SwitchViewVisible(redirectView, args);
            }
        }

        function redirectToDepositFormWhenReady(data) {
            var componentsLoadedSubscriber = window.componentsLoaded.subscribe(function (loaded) {
                if (!loaded) {
                    return;
                }

                componentsLoadedSubscriber.dispose();
                redirectToDepositForm(data);
            });

            window.componentsLoaded.notifySubscribers(window.componentsLoaded());
        }

        return {
            HandleDeepLink: redirectToDepositFormWhenReady
        };
    }
);