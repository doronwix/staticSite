define('deviceviewmodels/WalletModule',
    [
        'require',
        'handlers/general',
        'viewmodels/WalletModuleBase'
    ],
    function (require) {
        var general = require('handlers/general'),
            WalletModuleBase = require('viewmodels/WalletModuleBase');

        var WalletModule = general.extendClass(WalletModuleBase, function NewWalletModuleClass(_params) {
            var self = this,
                parent = self.parent;

            function init() {
                parent.Init();

                setInitialAdvancedViewMode();
            }

            function setInitialAdvancedViewMode() {
                //mobile always true
                parent.ViewProperties.isAdvancedView(true);
            }

            function dispose() {
                parent.Dispose();
            }
            return {
                Init: init,
                WalletInfo: parent.WalletInfo,
                ViewProperties: parent.ViewProperties,
                OpenInDialog: parent.OpenInDialog,
                Dispose: dispose
            };
        });

        return new WalletModule();
    });