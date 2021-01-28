define(
    'deviceviewmodels/HelpViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'LoadDictionaryContent!Support'
    ],
    function HelpQuestionnaireDef(require) {
        var general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var HelpQuestionnaireViewModel = general.extendClass(KoComponentViewModel, function HelpQuestionnaireClass(params) {
            var self = this,
                parent = this.parent,
                data = this.Data;

            parent.init.call(self, params); // inherited from KoComponentViewModel
            data.faqKey = params.faqKey;
            data.openEventName = params.openEventName;

            return {
                data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new HelpQuestionnaireViewModel(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
