define(
    'viewmodels/questionnaire/kyc-client-questionnaire',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalKycClientQuestionnaire',
        'viewmodels/questionnaire/client-questionnaire-base',
        'devicemanagers/StatesManager',
        'generalmanagers/ErrorManager'
    ],
    function(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalClientQuestionnaire = require('dataaccess/dalKycClientQuestionnaire'),
            statesManager = require('devicemanagers/StatesManager'),
            errorManager = require('generalmanagers/ErrorManager'),
            clientQuestionnaireBase = require('viewmodels/questionnaire/client-questionnaire-base');


        var createViewModel = general.extendClass(clientQuestionnaireBase, function (params) {
            var parent = this.parent,
                self = parent.init(params);

            function post (completedPromise, onResponse) {
                // save answers from view model to the post model
                var postCustomerAnswers = ko.toJS(self.customerAnswers);

                dalClientQuestionnaire.post(
                    postCustomerAnswers,
                    function (response) {
                        // basic validation
                        if (!response || response.status !== 1) {
                            parent.showGeneralErrorAlert();
                            throw new Error('client questionnaire: server return error on post');
                        }

                        // specific request's response handler
                        if (onResponse) {
                            onResponse(completedPromise, response);
                        }
                    }
                );
            }

            function onErrorResponse (responseError) {
                if (responseError.httpStatus && responseError.httpStatus === 403)
                    errorManager.onError('compliance/CddCustomerAnswers', responseError.message, eErrorSeverity.medium);
                else {
                    throw new Error('client questionnaire: invalid server response to post answers');
                }
            }

            function onSubmitResponse (completedPromise, response) {
                var responseResult = JSONHelper.STR2JSON("kycClientQuestionnaire:onSubmitResponse", response.result);
                if (responseResult.ValidationError === true) {
                    parent.showGeneralErrorAlert();
                    return;
                }
                switch (responseResult.StatusId) {
                    case eKYCStatus.GaveUp: //fall through
                    case eKYCStatus.Failed: //fall through
                    case eKYCStatus.NotComplete:
                        // update response
                        statesManager.States.KycStatus(responseResult.StatusId);

                        statesManager.States.KycReviewStatus(responseResult.KycReviewStatusId);

                        // failed aware popup
                        if (responseResult.KycReviewStatusId === eKYCReviewStatus.Appropriate) {
                            self.popAlert().then(completedPromise.resolve()).done();
                        } else {
                            completedPromise.resolve();
                        }
                        break;
                    case eKYCStatus.Complete:
                    case eKYCStatus.Passed:
                        completedPromise.resolve();
                        statesManager.States.KycStatus(responseResult.StatusId);
                        break;
                    default:
                        onErrorResponse();
                        break;
                }
            }

            self.post = function (completedPromise) {
                post(completedPromise, onSubmitResponse);
            };

            self.createAnswersModel = function (answersHashTable, customerModel) {
                parent.createAnswersModel(answersHashTable, customerModel, self.customerAnswers, self.questionnaireItemsDictionary, self.questionnaireValidationOn);
            };

            return self;
        });

      
        // return ko component factory view model
        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);