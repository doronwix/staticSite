define('deviceviewmodels/QuestionMarkViewModel',
    [
        'require',
        'managers/viewsmanager',
        'devicemanagers/AlertsManager',
        'Dictionary'
    ],
    function (require) {
        var viewsManager = require('managers/viewsmanager'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary');

        var QuestionMarkViewModel = function QuestionMarkViewModelClass(params) {
            function showView(options) {
                viewsManager.SwitchViewVisible(options.formToShow, options);
            }

            function showAlert(options) {
                var title = dictionary.GetItem(options.titleKey);

                alertsManager.UpdateAlert(options.alertType, title, null, null, options);
                alertsManager.PopAlert(options.alertType)
            }

            function onClick() {
                if (params.alertType) {
                    showAlert(params);
                } else {
                    if (params.formToShow) {
                        showView(params);
                    }
                }
            }

            return {
                faqKey: params.faqKey,
                formToShow: params.formToShow,
                onClick: onClick
            }
        }

        var createViewModel = function (params) {
            var viewModel = new QuestionMarkViewModel(params);

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    });