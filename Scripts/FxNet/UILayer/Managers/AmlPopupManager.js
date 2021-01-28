/* global General */
var AmlPopupManager = (function (amlPopupManager) {
    function showAmlPopup() {
        var option = {
            title: Dictionary.GetItem('AMLStatus','dialogsTitles',' '),
            closeOnEscape: false,
            dialogClass: 'fx-dialog amlPopup',
            width: 620
        };

        if (General.isDefinedType(DialogViewModel)) {
            DialogViewModel.openAsync(eAppEvents.amlStatusLoadedEvent, eDialog.AmlStatus, option, eViewTypes.vAmlStatus, null);
        }
    }

    function showAmlView() {
        $viewModelsManager.VManager.SwitchViewVisible(eForms.Aml, {});
    }
        
    function showAmlWindow() {
        (new PopupInSameWindowForSC()).Navigate({
            ActionUrl: '/webpl3/Compliance/AmlStatusWrapper'
        });

        window.external.ResizeHostForm(651, 588);
    }

    amlPopupManager.show = function () {
        switch(InitConfiguration.ApplicationConfiguration.applicationType) {
            case window.eApplicationTypes.Web:
                showAmlPopup();
                break;

            case window.eApplicationTypes.Mobile:
                showAmlView();
                break;

            default:
                showAmlWindow();
                break;
        }
    };

    return amlPopupManager;
}(window.AmlPopupManager || {}));