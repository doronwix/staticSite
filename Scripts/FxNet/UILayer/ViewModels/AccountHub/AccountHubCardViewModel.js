define(
    [
        "require",
        "knockout",
        "handlers/general",
        "helpers/KoComponentViewModel",
        "StateObject!AccountHub",
        "StateObject!userFlow",
        "managers/viewsmanager",
        "modules/permissionsmodule",
        "devicemanagers/AlertsManager",
        "initdatamanagers/Customer",
        "dataaccess/dalCommon",
        "managers/CustomerProfileManager",
        "devicemanagers/StatesManager",
        "StateObject!Setting",
        "Dictionary",
    ],
    function (require) {
        var KoComponentViewModel = require("helpers/KoComponentViewModel"),
            ko = require("knockout"),
            general = require("handlers/general"),
            stateObjectAccountHub = require("StateObject!AccountHub"),
            ViewsManager = require("managers/viewsmanager"),
            permissionsModule = require("modules/permissionsmodule"),
            AlertsManager = require("devicemanagers/AlertsManager"),
            Customer = require("initdatamanagers/Customer"),
            dalCommon = require("dataaccess/dalCommon"),
            customerProfileManager = require("managers/CustomerProfileManager"),
            statesManager = require("devicemanagers/StatesManager"),
            settingStateObject = require("StateObject!Setting"),
            stateObjectUserFlow = require("StateObject!userFlow"),
            dictionary = require("Dictionary");

        var AccountHubCardViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                Data = this.Data,
                stateObjectAccountHubUnsubscribe,
                stateObjectAccountHubUnsubscribeDisplay,
                visibilitySet = 0,
                stateObjectUserFlowUnsubscribe;

            function updateVisibilityOnLogin(userStatus) {
                if (visibilitySet) {
                    return;
                }

                visibilitySet = 1;

                if (Customer.prop.isDemo === true) {
                    return;
                }

                if (userStatus !== eUserStatus.Active) {
                    stateObjectAccountHub.update("visible", true);
                }
                else {
                    var profileCustomer = customerProfileManager.ProfileCustomer();

                    if (!profileCustomer.activeFirstLogin) {
                        profileCustomer.activeFirstLogin = 1;
                        stateObjectAccountHub.update("visible", true);
                        customerProfileManager.ProfileCustomer(profileCustomer);
                    }
                    else {
                        if (profileCustomer.activeFirstLogin === 1) {
                            profileCustomer.activeFirstLogin = -1;
                            customerProfileManager.ProfileCustomer(profileCustomer);
                        }
                    }
                }

            }

            function tryUpdateVisibilityOnLogin(userStatus) {
                if (userStatus !== eUserStatus.NA) {
                    updateVisibilityOnLogin(userStatus);
                }
            }

            function init() {
                if (!settingStateObject.get("AccountHubSetting")) {
                    settingStateObject.set("AccountHubSetting", null);
                }

                setObservables();
                setStates();

                var userFlow = stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged);

                setSubscribers();

                tryUpdateVisibilityOnLogin(userFlow ? userFlow.userStatus : eUserStatus.NA);
            }

            function setObservables() {
                Data.visible = ko.observable(false);
                Data.none = ko.observable(false);
            }

            function setStates() {
                stateObjectAccountHub.set('visible', false);
                stateObjectAccountHub.set('displayNone', true);
            }

            function setSubscribers() {
                stateObjectAccountHubUnsubscribe = stateObjectAccountHub.subscribe("visible", function (value) {
                    Data.visible(value);
                });

                stateObjectAccountHubUnsubscribeDisplay = stateObjectAccountHub.subscribe("displayNone", function (value) {
                    Data.none(value);
                });

                stateObjectUserFlowUnsubscribe = stateObjectUserFlow.subscribe(
                    eStateObjectTopics.UserFlowChanged,
                    function (newModel) {
                        tryUpdateVisibilityOnLogin(newModel.userStatus);
                    }
                );
            }

            function switchView(view, args) {
                ViewsManager.RedirectToForm(view, args);
                settingStateObject.update("AccountHubSetting", args);
                hideAccountHub();
            }

            function register() {
                permissionsModule.RegisterLeadType();
            }

            function hideAccountHub() {
                Data.visible(false);
                stateObjectAccountHub.update("visible", false);
            }

            function logOut() {
                hideAccountHub();

                if (!permissionsModule.CheckPermissions("commonLogout")) {
                    return;
                }

                AlertsManager.UpdateAlert(AlertTypes.ExitAlert);
                AlertsManager.PopAlert(AlertTypes.ExitAlert);
            }

            function switchFromDemoToReal() {
                if (Customer.prop.isDemo) {
                    dalCommon.SwitchAccount();
                }
            }

            function switchFromRealToDemo() {
                if (!Customer.prop.isDemo) {
                    dalCommon.SwitchAccount();
                }
            }

            function close() {
                ko.postbox.publish("hub-menu-close");
                stateObjectAccountHub.update("visible", false);
            }

            function dispose() {
                if (stateObjectAccountHubUnsubscribe) {
                    stateObjectAccountHubUnsubscribe();
                }

                if (stateObjectUserFlowUnsubscribe) {
                    stateObjectUserFlowUnsubscribe();
                }

                if (stateObjectAccountHubUnsubscribeDisplay) {
                    stateObjectAccountHubUnsubscribeDisplay();
                }

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            function hasDemoBlock() {
                return Customer.prop.hasActiveDemo || Customer.prop.isDemo;
            }

            function showLogoutButton() {
                return permissionsModule.CheckActionAllowed("logout");
            }

            function changePassword() {
                if (permissionsModule.CheckPermissions("changePassword")) {
                    switchView(eForms.Settings, eViewTypes.vChangePassword);
                }
                else {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, dictionary.GetItem("GenericAlert"), dictionary.GetItem("Forbidden"), null);
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            }

            return {
                init: init,
                dispose: dispose,
                Data: Data,
                Close: close,
                SwitchView: switchView,
                Logout: logOut,
                Register: register,
                permissionsModule: permissionsModule,
                switchFromDemoToReal: switchFromDemoToReal,
                switchFromRealToDemo: switchFromRealToDemo,
                IsDemo: statesManager.States.IsDemo,
                hasDemoBlock: hasDemoBlock,
                showLogoutButton: showLogoutButton,
                ChangePassword: changePassword
            };
        });

        function createViewModel(params) {
            var viewModel = new AccountHubCardViewModel(params || {});
            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel,
            },
        };
    }
);
