define('viewmodels/questionnaire/trigger-question-builder',
    [
        'require',
        'knockout'
    ],
    function (require) {
        var ko = require('knockout');

        function buildTriggerQuestion(questionnaireItemsDictionary) {
            //////////////////////////////////////
            /// nationality  trigger

            // check if question is trigger
            var triggerQ = null,
                question;

            for (question in questionnaireItemsDictionary) {
                if (questionnaireItemsDictionary.hasOwnProperty(question)) {
                    if (questionnaireItemsDictionary[question].triggerGetValueFromQuestion > 0 && questionnaireItemsDictionary[question].type === 'checkbox') {
                        triggerQ = questionnaireItemsDictionary[question];
                        break;
                    }
                }
            }

            if (!triggerQ) {
                return;
            }

            // trigger is on when optional answer is:
            var triggerAnswer = triggerQ.optionalAnswers.find(function (item) {
                return item.triggergGetValue === true;
            });

            var answerQuestionSourceName = triggerQ.triggerGetValueFromQuestion;
            var answerQuestionSource = questionnaireItemsDictionary[answerQuestionSourceName];
            var relatedQuestions = [];

            // collect related questions 
            for (question in questionnaireItemsDictionary) {
                if (questionnaireItemsDictionary.hasOwnProperty(question)) {
                    if (questionnaireItemsDictionary[question].getValueFromQuestion === answerQuestionSourceName) {
                        relatedQuestions.push(questionnaireItemsDictionary[question]);
                    }
                }
            }

            // set related questions visibility
            relatedQuestions.forEach(function (item) {
                // set visibility
                item.visible = ko.pureComputed(function () {
                    return parseInt(triggerQ.answer()) !== parseInt(triggerAnswer.answerValue);
                });
            });

            ko.computed(function () {
                if (parseInt(triggerQ.answer()) === parseInt(triggerAnswer.answerValue)) {

                    // set related questions answer as source
                    (function setRelatedAnswersAsSourceAnswer() {
                        var optionalSelectedAnswer = answerQuestionSource.optionalAnswers.find(function (optionalAnswer) {
                            return optionalAnswer.answerValue === answerQuestionSource.answer();
                        });

                        if (!optionalSelectedAnswer) {
                            return;
                        }

                        // same answer by system id
                        relatedQuestions.forEach(function (item) {
                            var relatedOptionalQuestion = item.optionalAnswers.find(function (optionalAnswer) {
                                return optionalAnswer.systemId === optionalSelectedAnswer.systemId;
                            });

                            if (relatedOptionalQuestion) {
                                item.answer(relatedOptionalQuestion.answerValue);
                            }
                        });
                    }());
                }
            });
        }

        return buildTriggerQuestion;
    }
);
