define(
    'modules/permissionsmodule',
    [
        'require',
        'modules/systeminfo',
        'devicecustommodules/SeamlessPermissionsModule'
    ],
    function PermissionsModule(require) {
        var systemInfo = require('modules/systeminfo'),
            seamlessPermissionsModule = require('devicecustommodules/SeamlessPermissionsModule');

        var actions = [
            'commonLogout',
            'uploadDocuments',
            'chat',
            'deposit',
            'tutorials',
            'apiIM',
            'gtm',
            'customerProfile',
            'changePassword',
            'notificationsSettings',
            'addEditRemovePriceAlert',
            'requestTradingSignalsAccess'
        ];

        function checkPermissions(actionName) {
            if (isRestrictedUser() &&
                actions.indexOf(actionName) !== -1) {
                return false;
            }

            return true;
        }

        function checkActionAllowed(actionName, popAlert, actionArgs) {
            if (seamlessPermissionsModule.IsActionRestricted(actionName)) {
                if (popAlert) {
                    seamlessPermissionsModule.PopAlert(null, actionName, actionArgs);
                }

                return false;
            }

            return true;
        }

        function checkFormPermissions(form, popAlert, formArgs) {
            if (seamlessPermissionsModule.IsFormRestricted(form)) {
                if (popAlert) {
                    seamlessPermissionsModule.PopAlert(form, null, formArgs);
                }

                return false;
            }

            if (seamlessPermissionsModule.IsFormVisibleRestricted(form)) {
                seamlessPermissionsModule.PopAlert(form, null, formArgs);
            }

            return true;
        }

        function isRestrictedUser() {
            return systemInfo.get('isRestrictedUser', false);
        }

        function hasTradingPermission() {
            return systemInfo.get('hasTradingPermission', false);
        }

        function isTradingUser() {
            return isRestrictedUser() && hasTradingPermission();
        }

        function registerLeadType() {
            seamlessPermissionsModule.RegisterLeadType();
        }

        return {
            CheckPermissions: checkPermissions,
            CheckFormPermissions: checkFormPermissions,
            CheckActionAllowed: checkActionAllowed,
            IsRestrictedUser: isRestrictedUser,
            RegisterLeadType: registerLeadType,
            IsTradingUser: isTradingUser
        };
    }
);