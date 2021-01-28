define(
    'viewmodels/questionnaire/question/open-question',
    [
        'require',
        'knockout',
        'handlers/general',
        'Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            StoreQuestionsAnswers = require('Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers');

        function createViewModel(params) {
            var self = params.model;

            if (self._isInitialized) {
                return self;
            }

            var questionnaireItemsDictionary = params.questionnaireItemsDictionary;

            self._isInitialized = true;
            self.placeholder = self.placeholder || '';
            self.focused = ko.observable();
            self.validationMessage = ko.observable(Dictionary.GetItem('RequiredValidationMessage', 'client_questionnaire'));

            self.validationOn = ko.pureComputed(function () {
                return self.focused() === false || self.questionnaireValidationOn();
            });

            self.htmlname = ko.pureComputed(function () {
                return self.htmlAutofillName ? self.htmlAutofillName : self.name;
            });

            if (self.validationName === 'PhoneNumber') {
                self.answer.extend({
                    phoneNumber: true
                });
            }

            self.cssname = self.validationName === 'PhoneNumber' ? 'phone' : '';

            // required validation 
            if (self.required === true) {
                self.answer.extend({
                    required: {
                        onlyIf: function () {
                            return self.validationOn();
                        }
                    }
                });
                // only if validation answers and question dependency
            }
            else if (self.onlyIf) {
                self.answer.extend({
                    required: {
                        onlyIf: function () {
                            return self.validationOn() && parseInt(questionnaireItemsDictionary[self.onlyIf.questionName].answer()) === self.onlyIf.answerValue;
                        }
                    }
                });

                // no validation 
            }
            else {
                self.answer.extend({
                    required: false
                });
            }

            // all question validation is their answer validation
            self.isValid = self.answer.isValid;

            var answerChanged = ko.observable(false);

            self.subscription = self.answer.subscribe(debounce(function (newValue) {
                if (!general.isNullOrUndefined(newValue)) {
                    answerChanged(true);
                    StoreQuestionsAnswers.AddQuestionAnswer(eLocalStorageKeys.QuestionsAnswersCDDKYC, self.name, newValue);
                }
            }, 300));

            ko.computed(function () {
                if (self.validationOn() && self.isValid() && answerChanged()) {
                    answerChanged(false);
                    ko.postbox.publish('questionnaire-question', self.name);
                }
            });

            return self;
        }

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
