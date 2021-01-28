define('viewmodels/questionnaire/question-tooltip-balloon',
    [],
    function () {
        var createViewModel = function (params) {
            return {
                headerText: params.headerText,
                bodyText: params.bodyText,
                visible: params.visible,
                close: function() {
                    params.visible(false);
                }
            };
        };

        return {
            createViewModel: createViewModel
        };
    }
);