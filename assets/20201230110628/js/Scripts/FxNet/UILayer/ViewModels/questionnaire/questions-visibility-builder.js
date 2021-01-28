define(
    'viewmodels/questionnaire/questions-visibility-builder',
    [
        'require',
        'knockout'
    ],
    function (require) {
        var ko = require('knockout');

        function questionsVisibilityBuilder(question, questionnaireItemsDictionary) {
            //case overridable
            if (question.componentName === "fx-overridable-question") {
                return ko.pureComputed(function () {
                    var parentQuestion = questionnaireItemsDictionary[question.parentQuestionTemplateID];

                    var chosenParentAnswer = parentQuestion.optionalAnswers.find(function (optionalAnswer) {
                        return optionalAnswer.answerValue === parentQuestion.answer();
                    });
                    return chosenParentAnswer && chosenParentAnswer.childQuestionIsVisible;
                });
            }

            //else case only if question
            if (question.onlyIf) {
                return ko.computed(function () {
                    var show = parseInt(questionnaireItemsDictionary[question.onlyIf.questionName].answer()) === parseInt(question.onlyIf.answerValue) &&
                        ko.unwrap(questionnaireItemsDictionary[question.onlyIf.questionName].visible);
                    if (!show) {
                        question.answer(null);
                    }
                    return show;
                });
            }

            //else default
            return true;
        }

        return questionsVisibilityBuilder;
    }
);
