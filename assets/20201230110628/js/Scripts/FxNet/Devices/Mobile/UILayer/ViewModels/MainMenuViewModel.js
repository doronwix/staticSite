define(
    'deviceviewmodels/MainMenuViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/viewsmanager',
        'devicemanagers/AlertsManager',
        'cachemanagers/PortfolioStaticManager',
        'modules/permissionsmodule',
        'cachemanagers/activelimitsmanager',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            viewsManager = require('managers/viewsmanager'),
            alertsManager = require('devicemanagers/AlertsManager'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager'),
            permissionsModule = require('modules/permissionsmodule'),
            activeLimitsManager = require('cachemanagers/activelimitsmanager'),
            dictionary = require("Dictionary");

        var MainMenuViewModel = general.extendClass(KoComponentViewModel, function() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            function registerToDispatcher() {
                portfolioManager.OnChange.Add(onClientPortfolioStateChange);
            }

            function init(customSettings) {
                parent.init.call(self, customSettings); // inherited from KoComponentViewModel

                setObservableCustomerObject();
                registerToDispatcher();
            }

            function dispose() {
                unRegisterFromDispatcher();

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            function setObservableCustomerObject() {
                data.pendingWithdrawals = ko.observable(portfolioManager.Portfolio.pendingWithdrawals);
            }

            function unRegisterFromDispatcher() {
                activeLimitsManager.OnChange.Remove(onClientPortfolioStateChange);
            }

            function onClientPortfolioStateChange() {
                var portfolio = portfolioManager.Portfolio;
                data.pendingWithdrawals(portfolio.pendingWithdrawals);
            }

            function logout() {
                if (!(permissionsModule.CheckPermissions("commonLogout"))) {
                    return;
                }

                alertsManager.UpdateAlert(AlertTypes.ExitAlert);
                alertsManager.PopAlert(AlertTypes.ExitAlert);

                ko.postbox.publish('trading-event', 'sign-out');
            }

            function register() {
                permissionsModule.RegisterLeadType();
            }

            function switchView(view, actionSourceTracking) {
                if (actionSourceTracking) {
                    ko.postbox.publish(actionSourceTracking);
                }
                ko.postbox.publish('action-source', 'SideMenu'); 
                viewsManager.RedirectToForm(view);
            }

            function switchViewWithArgs(view, viewArgs, actionSourceTracking) {
                if (actionSourceTracking) {
                    ko.postbox.publish(actionSourceTracking);
                }
                ko.postbox.publish('action-source', 'SideMenu'); 
                viewsManager.RedirectToForm(view, viewArgs);
            }

            function isVisible(view) {
                return viewsManager.GetActiveFormViewProperties(view).visible();
            }

            var changePasswordClick = function () {
                if (permissionsModule.CheckPermissions("changePassword"))
                    switchView(eForms.ChangePassword);
                else {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, dictionary.GetItem('Forbidden'), null);
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            };

            return {
                init: init,
                dispose: dispose,
                Data: data,
                SwitchView: switchView,
                SwitchViewWithArgs: switchViewWithArgs,
                IsVisible: isVisible,
                Logout: logout,
                Register: register,
                permissionsModule: permissionsModule,
                ChangePasswordClick: changePasswordClick
            };
        });

        // params contains all data from CashBackViewModel, it has been passed from component data binding
        var createViewModel = function(params) {
            var viewModel = new MainMenuViewModel(params);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);