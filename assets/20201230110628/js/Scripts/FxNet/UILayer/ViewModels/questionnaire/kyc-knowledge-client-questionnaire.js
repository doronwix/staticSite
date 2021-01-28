define('viewmodels/questionnaire/kyc-knowledge-client-questionnaire',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalKycClientQuestionnaire',
        'viewmodels/questionnaire/client-questionnaire-base',
        'initdatamanagers/Customer',
        'devicemanagers/StatesManager',
        'devicemanagers/AlertsManager',
        'generalmanagers/ErrorManager',
        'viewmodels/questionnaire/questions-visibility-builder'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalClientQuestionnaire = require('dataaccess/dalKycClientQuestionnaire'),
            statesManager = require('devicemanagers/StatesManager'),
            alertsManager = require('devicemanagers/AlertsManager'),
            errorManager = require('generalmanagers/ErrorManager'),
            clientQuestionnaireBase = require('viewmodels/questionnaire/client-questionnaire-base'),
            questionsVisibilityBuilder = require('viewmodels/questionnaire/questions-visibility-builder');

        var createViewModel = general.extendClass(clientQuestionnaireBase, function (params) {
            var parent = this.parent,
                self = parent.init(params),

                questionnaireRetryAlert = alertsManager.GetAlert(AlertTypes.ClientKnowledgeQuestionnaire),
                questionnaireValidationAlert = alertsManager.GetAlert(AlertTypes.ClientQuestionnaire),
                defaultAnswers = [];

            // user action of submit or skip
            function post(onResponse) {
                // save answers from view model to the post model
                var postCustomerAnswers = ko.toJS(self.customerAnswers);

                dalClientQuestionnaire.postKycKnowledgeQuestionnaire(
                    postCustomerAnswers,
                    function (response) {
                        // basic validation
                        if (!response || response.status !== 1) {
                            self.showGeneralErrorAlert();
                            throw new Error("client questionnaire: server return error on post");
                        }

                        // specific request's response handler
                        if (onResponse) {
                            onResponse(response);
                        }
                    }
                );
            }

            function onErrorResponse(responseError) {
                if (responseError.httpStatus && responseError.httpStatus === 403)
                    errorManager.onError("compliance/KycKnowledgeCustomerAnswers", responseError.message, eErrorSeverity.medium);
                else {
                    throw new Error("client questionnaire: invalid server response to post answers");
                }
            }

            function onSubmitResponse(response) {
                var responseResult = JSONHelper.STR2JSON("kycKnowledgeClientQuestionnaire:onSubmitResponse", response.result);

                if (responseResult.ValidationError === true) {
                    self.showGeneralErrorAlert();
                    return;
                }

                statesManager.States.KycReviewStatus(responseResult.StatusId);

                switch (responseResult.StatusId) {
                    case eKYCReviewStatus.Appropriate:
                        self.popValidationAlert().then(params.completedCallback(responseResult.StatusId)).done();
                        break;

                    case eKYCReviewStatus.Tested:
                        self.popRetryAlert(function () {
                            params.completedCallback(responseResult.StatusId);
                        }, KnowledgeAlertTypes.Retry);
                        break;

                    case eKYCReviewStatus.Inappropriate:
                        params.completedCallback(responseResult.StatusId);
                        break;

                    case eKYCReviewStatus.Unsuitable:
                        params.completedCallback(responseResult.StatusId);
                        break;

                    default:
                        onErrorResponse();
                        break;
                }
            }

            function createAnswersModel(customerAnswers, questionnaireItemsDictionary, questionnaireValidationOn) {
                var qName, qItem, i, len;

                defaultAnswers = [];

                for (i = 0, len = customerAnswers.length; i < len; i += 1) {

                    qName = customerAnswers[i].name;
                    qItem = questionnaireItemsDictionary[qName];

                    qItem.questionnaireValidationOn = questionnaireValidationOn;

                    qItem.answer = customerAnswers[i].answer = ko.observable(customerAnswers[i].answer);
                    defaultAnswers.push(qItem.answer());
                    qItem.text = customerAnswers[i].title = ko.observable(qItem.text);

                    // set visibility
                    qItem.visible = questionsVisibilityBuilder(qItem, questionnaireItemsDictionary);

                }
            }

            function resetAnswers(customerAnswers, questionnaireItemsDictionary) {
                var i, len;
                for (i = 0, len = customerAnswers.length; i < len; i += 1) {
                    questionnaireItemsDictionary[customerAnswers[i].name].answer(null);
                    questionnaireItemsDictionary[customerAnswers[i].name].focused(true);
                }
            }

            self.createAnswersModel = function () {
                createAnswersModel(self.customerAnswers, self.questionnaireItemsDictionary, self.questionnaireValidationOn);
            };


            self.resetAnswers = function () {
                resetAnswers(self.customerAnswers, self.questionnaireItemsDictionary);
            };

            self.popRetryAlert = questionnaireRetryAlert.popAlert;
            self.popValidationAlert = questionnaireValidationAlert.popAlert;

            self.post = function () {
                post(onSubmitResponse);
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
