define(
    'devicecustomdeeplinks/NewLimitActionHandler',
    [
        'require',
        'handlers/general',
        'devicecustommodules/ToolbarModule'
    ],
    function NewLimitActionHandler(require) {
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
        function openNewLimitPopup() {
            toolbarModule.Init();
            toolbarModule.NewLimitHandler(getNewDealParameters());
        }

        //------------------------------------------
        function openPopupWhenReady(data) {
            deepLinkProperties = data;

            var componentsLoadedSubscriber = window.componentsLoaded.subscribe(function (componentsLoaded) {
                if (componentsLoaded) {
                    componentsLoadedSubscriber.dispose();
                    openNewLimitPopup();
                }
            });
            window.componentsLoaded.notifySubscribers(window.componentsLoaded());
        }

        return {
            HandleDeepLink: openPopupWhenReady
        };
    }
);