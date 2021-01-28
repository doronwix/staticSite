define(
    'devicemanagers/ViewModelsManager',
    [
        'require',
        'handlers/general',
        'helpers/ObservableHelper',
        'configuration/initconfiguration',
        'managers/viewsmanager',
        'managers/historymanager',
        'initdatamanagers/Customer',
        'modules/systeminfo',
        'viewmodels/ViewModelBase',
        'viewmodels/dialogs/DialogViewModel',
        'viewmodels/ViewAndPrintWithdrawalViewModel',
        'viewmodels/TradingSignalsTutorialsViewModel',
    ],
    function (require) {
        var initConfiguration = require('configuration/initconfiguration'),
            ViewsManager = require('managers/viewsmanager'),
            general = require('handlers/general'),
            VmHelpers = require('helpers/ObservableHelper'),
            HistoryManager = require('managers/historymanager'),
            Customer = require('initdatamanagers/Customer'),
            vmViewAndPrintWithdrawal = require('viewmodels/ViewAndPrintWithdrawalViewModel'),
            vmTradingSignalTutorials = require('viewmodels/TradingSignalsTutorialsViewModel'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel');

        function ViewModelsManager() {
            var vmDialog = DialogViewModel;
            var vmHelpers = VmHelpers;
            var vManager = ViewsManager;

            // withdrawal desktop sc shared form

            function onActiveFormChanged() {
                if (vmDialog && !vmDialog.persistent()) {
                    vmDialog.close();
                }
            }

            function init(uiVersion, startUpForm) {
                vManager.Init(uiVersion);
                vManager.OnActiveFormChanged.Add(onActiveFormChanged);

                vmDialog.OnPreload.Add(function onPreload(dialogName, view, args) {
                    vManager.ChangeViewState(view, eViewState.Start, args);
                });

                vmDialog.OnOpen.Add(function onDialogOpen(dialogName, view, args) {
                    if (vManager.GetViewState(view) !== eViewState.Start) {
                        vManager.ChangeViewState(view, eViewState.Start, args);
                    }

                    HistoryManager.PushPopupState(ePopupType.Dialog, dialogName);
                });

                vmDialog.OnClose.Add(function onDialogClose(dialogName, view) {
                    vManager.ChangeViewState(view, eViewState.Stop);

                    if (HistoryManager.HasDialog(dialogName)) {
                        HistoryManager.Back();
                    }
                });

                HistoryManager.OnStateChanged.Add(function (state) {
                    if (state.type === eHistoryStateType.CloseDialog) {
                        vmDialog.close(state.popupId);
                    }
                });

                vmViewAndPrintWithdrawal.Init(initConfiguration.ViewAndPrintWithdrawal);
                vmTradingSignalTutorials.Init();

                start(startUpForm);
            }

            function start(startUpForm) {
                var redirectPageName = Object.keys(eForms).find(function (key) {
                    return eForms[key] === startUpForm;
                });

                if (shouldRedirect(startUpForm)) {
                    vManager.RedirectToURL(
                        '/account/redirect/' + redirectPageName + location.search
                    );
                    return;
                }

                vManager.Start(startUpForm || Customer.prop.startUpForm);
            }

            function shouldRedirect(startUpForm) {
                var formName = Object.keys(eAccountRedirectForms).find(function (key) {
                    return eForms[key] === startUpForm;
                });

                return !general.isNullOrUndefined(formName);
            }

            return {
                Init: init,
                VmDialog: vmDialog,
                VmViewAndPrintWithdrawal: vmViewAndPrintWithdrawal,
                VmTradingSignalsTutorials: vmTradingSignalTutorials,
                VManager: vManager,
                VmHelpers: vmHelpers,
            };
        }

        var module = (window.$viewModelsManager = new ViewModelsManager());

        return module;
    }
);
