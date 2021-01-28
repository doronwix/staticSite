define('viewmodels/questionnaire/welcome-client-questionnaire',
    [
        'Dictionary'
    ],
    function(Dictionary) {

        var createViewModel = function (params) {
            return {
                closeWelcome: params.closeWelcome,
                title1: Dictionary.GetItem('welcome_title1', 'client_questionnaire', ' '),
                title2: Dictionary.GetItem('welcome_title2', 'client_questionnaire', ' '),
                title3: Dictionary.GetItem('welcome_title3', 'client_questionnaire', ' '),
                title4: Dictionary.GetItem('welcome_title4', 'client_questionnaire', ' '),
                title5: Dictionary.GetItem('welcome_title5', 'client_questionnaire', ' '),
                btnLetsStart: Dictionary.GetItem('welcome_btnLetsStart', 'client_questionnaire', ' ')
            };
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
    