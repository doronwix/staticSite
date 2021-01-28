define('viewmodels/questionnaire/question/questions-wrapper',
    [],
    function () {
       
        var createViewModel = function(params) {
            var self = {};
            var questionOrder = params.questionOrder;
            self.questionnaireItemsDictionary = params.questionnaireItemsDictionary;
            self.questions = [];
            var inlineOrder = params.inlineOrder;
            if (inlineOrder && inlineOrder !== "2") {
                var questions = params.pageQuestions;
                var questionsForRender = (questions.filter(function(item) {
                    return item.questionOrder === questionOrder;
                }));
                var model;
                questionsForRender.forEach(function(item) {
                    model = self.questionnaireItemsDictionary[item.name];
                    if (model.inlineOrder === "0")
                        model.css = "";
                    if (model.inlineOrder === "1")
                        model.css = "col left";
                    if (model.inlineOrder === "2")
                        model.css = "col right";
                    self.questions.push(model);
                });
            }
            return self;
        };

        return {
            createViewModel: createViewModel
        };
    }
);