define(
    'viewmodels/questionnaire/question/radio-question',
    [
        'require',
        'knockout',
        'viewmodels/questionnaire/question/open-question'
    ],
    function RadioQuestionDef(require) {
        var ko = require('knockout'),
            openQuestion = require('viewmodels/questionnaire/question/open-question');

        var createViewModel = function RadioQuestionClass(params) {
            var self = openQuestion.viewModel.createViewModel(params);

            if (self.optionalAnswers) {
                self.optionalAnswers.forEach(function processAnswers(item) {
                    if (item.popup)
                        item.popup.visible = ko.observable(false);
                });
            }

            self.closeAllPopups = function onCloseAllPopus() {
                self.optionalAnswers.forEach(function processAnswer(item) {
                    if (item.popup)
                        item.popup.visible(false);
                });
            }

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
