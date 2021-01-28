define(
    'devicecustomdeeplinks/NewDealActionHandler',
    [
        'require',
        'handlers/general',
        'devicecustommodules/ToolbarModule'
    ],
    function NewDealActionHandler(require) {
        var toolbarModule = require('devicecustommodules/ToolbarModule'),
            general = require('handlers/general'),
            deepLinkProperties = {};

        //------------------------------------------
        function getNewDealParameters() {
            var newDealParameters = {
                instrumentId: deepLinkProperties.instrumentId
            };

            if (!general.isEmptyType(deepLinkProperties.orderDir)) {
                newDealParameters.orderDir = deepLinkProperties.orderDir;
            }

            if (!general.isEmptyType(deepLinkProperties.tab)) {
                newDealParameters.tab = deepLinkProperties.tab;
            }

            return newDealParameters;
        }

        //------------------------------------------
        function openNewDealPopup() {
            var preventWhenCddRedirect = true;
            toolbarModule.Init();
            toolbarModule.NewDealHandler(getNewDealParameters(), preventWhenCddRedirect);
        }

        //------------------------------------------
        function openPopupWhenReady(data) {
            deepLinkProperties = data;

            var componentsLoadedSubscriber = window.componentsLoaded.subscribe(function(loaded) {
                if (!loaded) {
                    return;
                }

                componentsLoadedSubscriber.dispose();
                openNewDealPopup();
            });

            window.componentsLoaded.notifySubscribers(window.componentsLoaded());
        }

        return {
            HandleDeepLink: openPopupWhenReady
        };
    }
);