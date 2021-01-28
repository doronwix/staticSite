define(
    'viewmodels/questionnaire/question/overridable-question',
    [
        'require',
        'knockout',
        'handlers/general',
        'Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            storeQuestionsAnswers = require('Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers');

        var createViewModel = function (params) {

            var self = params.model;
            var questionnaireItemsDictionary = params.questionnaireItemsDictionary;
            var commonDictionary = params.model.commonDictionary;
            self.focused = ko.observable();
            self.validationOn = ko.computed(function () {
                return self.focused() === false || self.questionnaireValidationOn();
            });
            if (typeof self.originalText === "undefined")
                self.originalText = self.text();

            self.cssname = '';
            self.htmlname = self.name;

            self.validationMessage = ko.computed(function () {
                return self.validationOn() ? Dictionary.GetItem('RequiredValidationMessage', 'client_questionnaire') : "";
            });

            var parentQuestion = questionnaireItemsDictionary[self.parentQuestionTemplateID];

            function chosenParentAnswerOptions(parentAnswer) {
                var parentAnswersOptions = parentQuestion.optionalAnswers.find(function (optionalAnswer) {
                    return optionalAnswer.answerValue === parentAnswer;
                });
                return parentAnswersOptions;
            }

            var chosenParentAnswerOption = ko.computed(function () {
                var parentAnswer = parentQuestion.answer();
                return chosenParentAnswerOptions(parentAnswer);
            });

            self.text = ko.computed(function () {
                var chosenParentAnswer = chosenParentAnswerOption();
                if (chosenParentAnswer && chosenParentAnswer.childQuestionContentKey && commonDictionary[chosenParentAnswer.childQuestionContentKey])
                    return commonDictionary[chosenParentAnswer.childQuestionContentKey];
                else
                    return self.originalText;
            });

            self.answer.extend({
                required: {
                    onlyIf: function () {
                        var parentAnswer = chosenParentAnswerOptions(parentQuestion.answer());
                        var isRequired = self.visible() && self.validationOn() && parentAnswer && parentAnswer.childQuestionIsMandatory;
                        return isRequired;
                    }
                }
            });

            // all question validation is their answer validation
            self.isValid = self.answer.isValid;

            var answerChanged = ko.observable(false);

            self.subscription = self.answer.subscribe(debounce(
                function (newValue) {
                    answerChanged(true);
                    if (!general.isNullOrUndefined(newValue)) {
                        storeQuestionsAnswers.AddQuestionAnswer(eLocalStorageKeys.QuestionsAnswersCDDKYC, self.name, newValue);
                    }
                }, 300)
            );

            ko.computed(function () {
                if (self.validationOn() && self.isValid() && answerChanged()) {
                    answerChanged(false);
                    ko.postbox.publish('questionnaire-question', self.name);
                }
            });

            self.dispose = function () {
                self.validationOn.dispose();
                self.validationMessage.dispose();
                chosenParentAnswerOption.dispose();
                self.text.dispose();
                self.subscription.dispose();
            }

            return self;
        };

        return {
            createViewModel: createViewModel
        };
    }
);
