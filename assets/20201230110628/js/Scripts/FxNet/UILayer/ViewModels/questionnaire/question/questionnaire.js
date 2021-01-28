define('viewmodels/questionnaire/question/questionnaire',
    [
        'knockout',
        'handlers/general'
    ],
    function (ko, general) {
        // composition: using recursive function, a questionnaire may contain some questionnaires
        var createViewModel = function (params) {
            var self = params.model,
                qName,
                qItem,
                i,
                len;

            self.questionnaireItemsDictionary = params.questionnaireItemsDictionary;
            self.id = self.name.replace(' ', '-');
            // visibility 
            if (self.required === true && !self.onlyIf) {
                // visibility same logic as is required
                self.visible = true;

            } else {
                // only if:
                var parentAnswerObs = self.questionnaireItemsDictionary[self.onlyIf.questionName].answer;

                self.visible = ko.pureComputed(function () {
                    return parseInt(parentAnswerObs()) === self.onlyIf.answerValue;
                });
            }

            //lazy set questionnaire items
            // for each question name in questionnaire model
            // create appropriate view model with the model and for questionnaire type with questionnaireItemsDictionary
            for (i = 0, len = self.questions.length; i < len; i++) {
                if (!general.isObjectType(self.questions[i])) {
                    qName = self.questions[i];
                    qItem = self.questionnaireItemsDictionary[qName];
                    if (self.commonDictionary)
                        qItem.commonDictionary = self.commonDictionary;

                    // nested questionnaire
                    if (qItem.type === "questionnaire") {
                        // recursive call for this function when nested questionnaire
                        self.questions[i] = createViewModel({
                            model: qItem,
                            questionnaireItemsDictionary: self.questionnaireItemsDictionary
                        });
                    } else {
                        // plain question
                        self.questions[i] = qItem;
                    }
                }
            }

            // is valid when all its visible questions are valid
            self.isValid = ko.pureComputed(function () {
                for (var ii = 0, leng = self.questions.length; ii < leng; ii += 1) {
                    var childQItem = self.questions[ii];
                    if (childQItem.visible && ko.utils.unwrapObservable(childQItem.visible) && !childQItem.isValid()) {
                        return false;
                    }
                }

                return true;
            });

            return self;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
