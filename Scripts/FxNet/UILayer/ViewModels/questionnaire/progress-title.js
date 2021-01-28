define('viewmodels/questionnaire/progress-title',
    [
        'require'
    ],
    function () {
        var createViewModel = function (params) {
            var self = {};

            self.pager = params.pager;
            self.questionnaireType = params.questionnaireType();

            self.currentPageTitle = "";
            self.titleSmallComment = "";
            self.subtitle = "";

            if (self.questionnaireType === eQuestionnaireType.CDD) {
                if (self.pager.pageNumber() === 1) {
                    self.currentPageTitle = Dictionary.GetItem("page1title", "client_questionnaire", "Get started: basic information %");
                    self.titleSmallComment = Dictionary.GetItem("titleSmallComment", "client_questionnaire", "Please provide %");
                }

                if (self.pager.pageNumber() === 2) {
                    self.currentPageTitle = Dictionary.GetItem("page2title", "client_questionnaire", "Personal information %");
                }
            }

            if (self.questionnaireType === eQuestionnaireType.KYC) {
                self.currentPageTitle = Dictionary.GetItem("page3title", "client_questionnaire", "Trading experience %");
            }

            if (self.questionnaireType === eQuestionnaireType.MIFID) {
                self.currentPageTitle = Dictionary.GetItem("tradingKnowledgeTitle", "client_questionnaire", "Trading knowledge %");
                self.subtitle = Dictionary.GetItem("KYC_Knowledge_subtitle", "client_questionnaire", "Please provide %");
            }

            self.isTitleCommentVisible = self.questionnaireType === eQuestionnaireType.CDD && self.pager.pageNumber() === 1;
            self.isSubtitleVisible = self.questionnaireType === eQuestionnaireType.MIFID;
            self.isPageCounterVisible = self.questionnaireType !== eQuestionnaireType.MIFID && self.pager.pages().length > 1;

            return self;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
