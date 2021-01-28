define(
    'viewmodels/Content/FaqQuestionViewModel',
    ['handlers/general'],
    function(general) {
        var createViewModel = function(params, componentInfo) {
            return {
                question: componentInfo.templateNodes[0].innerText,
                answer: componentInfo.templateNodes[1].innerHTML,
                id: general.createGuid()
            }
        };
        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    });