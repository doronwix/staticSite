define(
    'deepLinks/SettingsActionHandler',
    [
        'require',
        'managers/viewsmanager'
    ],
    function SettingsActionHandler() {
        function redirectToSettingsForm(params) {
            var ViewsManager = require('managers/viewsmanager');

            if (params && params.view) {
                ViewsManager.SwitchViewVisible(params.view.form, params.view.viewId);
            }
        }

        return {
            HandleDeepLink: redirectToSettingsForm
        };
    }
);