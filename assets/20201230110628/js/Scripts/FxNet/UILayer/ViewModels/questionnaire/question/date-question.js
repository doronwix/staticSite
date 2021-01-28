define('viewmodels/questionnaire/question/date-question',
    [
        'require',
        'knockout',
        'Dictionary',
        'Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers'
    ],
    function (require) {
        var ko = require('knockout'),
            Dictionary = require('Dictionary'),
            storeQuestionsAnswers = require('Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers');

        var createViewModel = function (params) {
            var self = params.model;

            if (!self) {
                throw new Error("questionnaire component has no value input");
            }

            self.focused = ko.observable();

            self.validationOn = ko.computed(function () {
                return self.focused() === false || self.questionnaireValidationOn();
            });

            self.day = ko.observable();
            self.month = ko.observable();
            self.year = ko.observable();

            (function setPlaceholders() {
                if (self.placeholder === null) {
                    self.placeholderDay = "";
                    self.placeholderMonth = "";
                    self.placeholderYear = "";
                    return;
                }
                var splitted = self.placeholder.split("/");
                self.placeholderDay = splitted[0];
                self.placeholderMonth = splitted[1];
                self.placeholderYear = splitted[2];
            }());

            if (self.answer()) {
                var splitted = self.answer().split('/');
                self.day(splitted[0]);
                self.month(splitted[1]);
                self.year(splitted[2]);
            }

            self.date = ko.computed(function () {
                var d = self.year() + '-' + self.month() + '-' + self.day();
                var answerFormat = self.day() + '/' + self.month() + '/' + self.year();
                if (typeof self.day() === "undefined" ||
                    typeof self.month() === "undefined" ||
                    typeof self.year() === "undefined") {

                    self.answer("");
                } else {
                    self.answer(answerFormat);
                }
                return d;
            });

            self.days = [];
            var i;
            for (i = 1; i <= 31; i++) {
                self.days[i - 1] = i > 9 ? i : "0" + (i);
            }

            self.months = [];
            for (i = 1; i <= 12; i++) {
                self.months[i - 1] = i > 9 ? i : "0" + (i);
            }

            self.years = [];
            var nowYear = new Date().getFullYear();
            var minYear = nowYear - 100;
            i = 1;
            for (var year = nowYear; year >= minYear; year--) {
                self.years[i - 1] = year;
                i = i + 1;
            }

            if (self.required === true) {
                self.answer.extend({
                    required: {
                        onlyIf: function () {
                            return self.validationOn();
                        }
                    }
                });
            } else {

                self.answer.extend({
                    required: false
                });

            }

            self.day.extend({
                validation: {
                    validator: function (value) {
                        return typeof value !== "undefined";
                    },
                    params: self.day
                }
            });

            self.month.extend({
                validation: {
                    validator: function (value) {
                        return typeof value !== "undefined";
                    },
                    params: self.month
                }
            });

            self.year.extend({
                validation: {
                    validator: function (value) {
                        return typeof value !== "undefined";
                    },
                    params: self.year
                }
            });

            self.validationMessage = ko.computed(function () {
                if (!self.validationOn())
                    return "";

                if (!self.month.isValid() || !self.day.isValid() || !self.year.isValid()) {
                    return Dictionary.GetItem('RequiredValidDate', 'client_questionnaire');
                }

                //check invalid dates
                if (!new Date().isValid(parseInt(self.year()), parseInt(self.month()), parseInt(self.day())))
                    return Dictionary.GetItem('RequiredValidDate', 'client_questionnaire');

                if (self.validationName === 'MinAge18')
                    return Dictionary.GetItem('minAge18ValidationMessage', 'client_questionnaire');

                return Dictionary.GetItem('RequiredValidationMessage', 'client_questionnaire');
            });

            if (self.validationName === 'MinAge18') {
                self.answer.extend({
                    minAge18: true
                });
            }

            self.isValid = self.answer.isValid;

            var answerChanged = ko.observable(false);

            self.subscription = self.answer.subscribe(debounce(
                function (newValue) {
                    if (newValue !== "") {
                        answerChanged(true);
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
                self.date.dispose();
                self.subscription.dispose();
            }
            return self;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);