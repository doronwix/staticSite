define(
    'devicecustomdeeplinks/NetExposureActionHandler',
    [
        'require',
        'viewmodels/dialogs/DialogViewModel',
        'Dictionary'
    ],
    function NetExposureActionHandler(require) {
        var dialogViewModel = require('viewmodels/dialogs/DialogViewModel'), Dictionary = require('Dictionary');
        function openNetExposurePopup() {
            dialogViewModel.open(
                eDialog.NetExposuresSummaryDialog,
                { title: Dictionary.GetItem('lblNetExposureTitle','summaryview_accountsummaryextended'), dialogClass: 'netexposure fx-dialog' },
                eViewTypes.vNetExposure
            );
        }

        function openPopupWhenReady() {
            if (window.componentsLoaded()) {
                openNetExposurePopup();
                return;
            }

            var componentsLoadedSubscriber = window.componentsLoaded.subscribe(function () {
                componentsLoadedSubscriber.dispose();
                openNetExposurePopup();
            });
        }

        return {
            HandleDeepLink: openPopupWhenReady
        };
    }
);