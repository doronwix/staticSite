define(
    'managers/PopUpManager',
    [
        'require',
        'handlers/general',
        'viewmodels/dialogs/DialogViewModel'
    ],
    function PopUpManagerDef(require) {
        var general = require('handlers/general'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel');

        var PopUpManager = function PopUpManagerClass() {
            function openAsPopup(viewType, args) {
                if (viewType != eViewTypes.vClientQuestionnaire) {
                    return;
                }

                var options = {
                    title: args.title,
                    modal: true,
                    draggable: true,
                    resizable: false,
                    width: 950,
                    persistent: false,
                    dialogClass: 'fx-dialog'
                };

                general.extendType(options, args);

                if (general.isDefinedType(DialogViewModel)) {
                    DialogViewModel.openAsync(eAppEvents.cddStatusLoadedEvent, eDialog.ClientQuestionnaire, options, eViewTypes.vClientQuestionnaire);
                }
                else {
                    AlertsManager.UpdateAlert(AlertTypes.PopupClientQuestionnaire, null, null, null);
                    AlertsManager.PopAlert(AlertTypes.PopupClientQuestionnaire);
                }
            }

            function closePopup() {
                if (general.isDefinedType(window.DialogViewModel)) {
                    window.DialogViewModel.close();
                    return;
                }

                if (AlertsManager.GetAlert(AlertTypes.PopupClientQuestionnaire).visible()) {
                    AlertsManager.GetAlert(AlertTypes.PopupClientQuestionnaire).visible(false);
                    return;
                }
            }

            function isPopupOpen() {
                if (general.isDefinedType(DialogViewModel)) {
                    return DialogViewModel.isOpen();
                } else {
                    return (AlertsManager.HasAlert());
                }
            }

            return {
                OpenAsPopup: openAsPopup,
                ClosePopup: closePopup,
                IsPopupOpen: isPopupOpen
            };
        };

        var module = window.PopUpManager = new PopUpManager();
        return module;
    }
);