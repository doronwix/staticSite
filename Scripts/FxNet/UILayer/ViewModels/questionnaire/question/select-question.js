define('viewmodels/questionnaire/question/select-question',
    [
        'knockout',
        'viewmodels/questionnaire/question/open-question'
    ],
    function (ko, openQuestion) {
        var createViewModel = function(params) {
            params.model.answer(parseInt(params.model.answer()));
            var self = openQuestion.viewModel.createViewModel(params);
            self.popup = {};
            self.popup.headerText = ko.observable("");
            self.popup.bodyText = ko.observable("");
            self.popup.visible = ko.observable(false);

            var updatePopup = function(popup, visible) {
                self.popup.headerText(popup.headerText);
                self.popup.bodyText(popup.bodyText);
                self.popup.visible(visible);
            }
            self.showPopup = function () {
                var chosenOption = self.optionalAnswers.find(function (optionalAnswer) {
                    return optionalAnswer.answerValue === self.answer();
                });
                if (chosenOption && chosenOption.popup) {
                    updatePopup(chosenOption.popup, true);
                } else {
                    updatePopup({ headerText: "", bodyText: "" }, false);
                }
            }
            return self;

        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);