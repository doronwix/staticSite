define(
    'viewmodels/ChangePasswordViewModel',
    [
        'require',
        'knockout',
        'registration/ChangePasswordModule',
        'modules/permissionsmodule',
        'initdatamanagers/Customer',
        'devicemanagers/ViewModelsManager',
        'StateObject!Setting'
    ],
    function (require) {
        var ko = require('knockout'),
            ChangePassword = require('registration/ChangePasswordModule'),
            permissionsModule = require('modules/permissionsmodule'),
            customer = require("initdatamanagers/Customer"),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            settingStateObject = require('StateObject!Setting');

        function createViewModel() {
            var isCollapsed = ko.observable(true);

            ChangePassword.init(true);

            isOpenCollapsed();

            if (!settingStateObject.get("AccountHubSetting")) {
                settingStateObject.set("AccountHubSetting", null);
            }

            settingStateObject.subscribe("AccountHubSetting", function (view) {
                isCollapsed(view !== eViewTypes.vChangePassword);
            });

            function isOpenCollapsed() {
                if (customer.prop.isDemo) {
                    return isCollapsed(true);
                }

                if (viewModelsManager.VManager.GetViewArgs(eViewTypes.vChangePassword) === eViewTypes.vChangePassword) {
                    isCollapsed(false);
                }
            }

            function collapsedToggle() {
                if (customer.prop.isDemo) {
                    viewModelsManager.VManager.RedirectToForm(eForms.Settings, eViewTypes.vChangePassword);
                    return;
                }

                var isPermitted = permissionsModule.CheckPermissions("changePassword");

                if (!isPermitted) {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem("GenericAlert"), Dictionary.GetItem('Forbidden'), null);
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
                else {
                    isCollapsed(!isCollapsed());
                }
            }

            function isVisible() {
                return permissionsModule.CheckPermissions("changePassword");
            }

            return {
                dispose: ChangePassword.unsetDomEvents,
                CollapsedToggle: collapsedToggle,
                isCollapsed: isCollapsed,
                IsVisible: isVisible
            };
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);