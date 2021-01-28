define('viewmodels/questionnaire/progress-bar-a',
    [
        'require',
        'knockout'
    ],
    function (require) {
        var ko = require('knockout');

        var createViewModel = function (params) {

            var self = {};

            self.categories = params.categories;

            self.pager = params.pager;

            // click on progress bar step
            self.navigation = params.navigation;

            self.questionnaireType = params.questionnaireType;

            self.currentCSS = ko.pureComputed(function () {
                var cssClass = "progress-steps";
                if (self.questionnaireType() === eQuestionnaireType.CDD) {
                    if (self.pager.pages().length === 2)
                        cssClass += " two-steps";

                    if (self.pager.pages().length === 3)
                        cssClass += " three-steps";

                    if (self.pager.pageNumber() === 1)
                        cssClass += " _step_1";

                    if (self.pager.pageNumber() === 2)
                        cssClass += " _step_2";
                }
                else
                    cssClass += " three-steps _step_3";

                return cssClass;
            });

            self.category = ko.pureComputed(function () {
                return self.pager.currentPage().category;
            });

            self.dispose = function () {
                self.category.dispose();
            };

            return self;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
