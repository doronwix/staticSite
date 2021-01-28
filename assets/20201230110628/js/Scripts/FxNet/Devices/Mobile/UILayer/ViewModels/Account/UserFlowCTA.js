define(
    'deviceviewmodels/account/UserFlowCTA',
    [
        'require',
        'modules/permissionsmodule',
        'managers/viewsmanager'
    ],
    function (require) {
        var permissionsModule = require('modules/permissionsmodule'),
            ViewsManager = require('managers/viewsmanager');

        function getUserFlowAction(action) {
            switch (action) {
                case eCta.Seamless:
                    return permissionsModule.RegisterLeadType;

                case eCta.ContactUs:
                    return ViewsManager.SwitchViewVisible.bind(null, eForms.InternalContactUs);

                case eCta.ClientQuestionnaire:
                    return ViewsManager.SwitchViewVisible.bind(null, eForms.ClientQuestionnaire);

                case eCta.Deposit:
                    return ViewsManager.SwitchViewVisible.bind(null, eForms.Deposit);

                case eCta.UploadDocuments:
                    return ViewsManager.SwitchViewVisible.bind(null, eForms.UploadDocuments);

                case eCta.None:
                default:
                    return function () { };
            }
        }

        var module = {
            getUserFlowAction: getUserFlowAction
        };

        return module;
    }
);
