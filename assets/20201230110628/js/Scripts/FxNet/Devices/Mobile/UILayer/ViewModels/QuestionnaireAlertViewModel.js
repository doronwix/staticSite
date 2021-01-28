define('deviceviewmodels/QuestionnaireAlertViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'devicemanagers/AlertsManager',
        'managers/viewsmanager'
    ],
    function (require) {
        var general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            ViewsManager = require('managers/viewsmanager'),
            AlertsManager = require('devicemanagers/AlertsManager');

        var QuestionnaireAlertViewModel = general.extendClass(KoComponentViewModel, function (params) {
            function init() {
                var props = {
                    okButtonCallback: function () {
                        ViewsManager.RedirectToForm(eForms.ClientQuestionnaire);
                    },
                    cancelButtonCallback: function () {
                        params.showQuestionnaireAlert(false);
                    },
                    cancelButtonCaption: Dictionary.GetItem("cancel"),
                    okButtonCaption: Dictionary.GetItem("lblCompleteQuestionnaire"),
                    btnOkClass: 'small-okBtn',
                    btnCancelClass: 'small-cancelBtn'
                };

                AlertsManager.UpdateAlert(
                    AlertTypes.DepositQuestionnaireAlert,
                    null,
                    Dictionary.GetItem("txtCompleteQuestionnaire"),
                    null,
                    props
                );
                AlertsManager.PopAlert(AlertTypes.DepositQuestionnaireAlert);
            }

            return {
                init: init
            }
        });

        var createViewModel = function (params) {
            var viewModel = new QuestionnaireAlertViewModel(params);
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