define(
    'deviceviewmodels/Deals/EditLimitViewModel',
    [
        'require',
        'configuration/initconfiguration',
        'deviceviewmodels/Deals/Modules/EditLimitModule',
        'Dictionary',
        'cachemanagers/activelimitsmanager',
        'managers/viewsmanager',
        'viewmodels/dialogs/DialogViewModel'
    ],
    function EditLimitDefault(require) {
        var settings = require('configuration/initconfiguration').EditLimitSettingsConfiguration,
            Module = require('deviceviewmodels/Deals/Modules/EditLimitModule'),
            dictionary = require('Dictionary'),
            ActiveLimitsManager = require('cachemanagers/activelimitsmanager'),
            ViewsManager = require('managers/viewsmanager'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel');

        function handleInvalidViewModel() {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, dictionary.GetItem("GenericAlert"), dictionary.GetItem('OrderError7'));
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

            DialogViewModel.close();
        }

        function validateViewModel() {
            var selectedLimit = ActiveLimitsManager.limits.GetItem(ViewsManager.GetViewArgs(eViewTypes.vEditLimit).orderId);
            return selectedLimit !== null && typeof selectedLimit !== 'undefined';
        }

        var createViewModel = function () {
            if (!validateViewModel()) {
                handleInvalidViewModel();
                return { _valid: false };
            }

            var viewModel = new Module.ViewModel();

            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
