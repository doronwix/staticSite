define('viewmodels/questionnaire/question/checkbox-question',
    [
        'knockout',
        'viewmodels/questionnaire/question/open-question'
    ],
    function (ko, openQuestion) {

        var createViewModel = function (params) {
            var self = openQuestion.viewModel.createViewModel(params);

            self.checkBoxValue = ko.observable(false);

            var defaultOptionalAnswer = self.optionalAnswers.find(function(op) {
                return op.answerValue === parseInt(self.answer());
            });
            
            // if default answer
            if (defaultOptionalAnswer) {
                self.checkBoxValue(defaultOptionalAnswer.booleanValue);
            } 

            self.checkBoxValue.subscribe(function (value) {
                var optionalAnswer = self.optionalAnswers.find(function (oa) {
                    return oa.booleanValue === value;
                });
                self.answer(optionalAnswer.answerValue);
            });

            if (self.validationName === 'IsTrue') {
                self.validationMessage = ko.computed(function () {
                    return self.validationOn() ? Dictionary.GetItem('IsTrueValidationMessage', 'client_questionnaire') : "";
                });
                var optionalAnswer = self.optionalAnswers.find(function (oa) {
                    return oa.booleanValue === true;
                });
                self.answer.extend({
                    equal: optionalAnswer.answerValue
                });
            }

            self.isValid = self.answer.isValid;

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);