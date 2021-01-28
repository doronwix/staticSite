/*global eConfigContentValues*/
define('viewmodels/questionnaire/unsuccessful-client-questionnaire',
    [
        "require",
        'devicemanagers/StatesManager',
        "Dictionary"
    ],
    function (require) {
        var StatesManager = require('devicemanagers/StatesManager'),
            Dictionary = require("Dictionary");

        var createViewModel = function () {
            var self = {};

            self.title1 = Dictionary.GetItem('unsuccessful_title1_kycreview_' + StatesManager.States.KycReviewStatus(), 'client_questionnaire', ' ');
            self.title2 = Dictionary.GetItem('unsuccessful_title2_kycreview_' + StatesManager.States.KycReviewStatus(), 'client_questionnaire', ' ');
            self.title3 = Dictionary.GetItem('unsuccessful_title3_kycreview_' + StatesManager.States.KycReviewStatus(), 'client_questionnaire', ' ');
            self.title4 = Dictionary.GetItem('unsuccessful_title4', 'client_questionnaire', ' ');

            self.lblCompliancePhone = Dictionary.GetItem('lblCompliancePhone', 'client_questionnaire', ' ');
            self.lblComplianceEmail = Dictionary.GetItem('lblComplianceEmail', 'client_questionnaire', ' ');

            self.dispose = function () { };

            return self;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
