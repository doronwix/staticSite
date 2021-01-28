define(
    'viewmodels/questionnaire/client-questionnaire-base',
    [
        'require',
        'knockout',
        'enums/alertenums',
        'handlers/general',
        'viewmodels/questionnaire/question/questionnaire',
        'initdatamanagers/Customer',
        'devicemanagers/ViewModelsManager',
        'devicemanagers/AlertsManager',
        'Dictionary',
        'viewmodels/questionnaire/trigger-question-builder',
        'viewmodels/questionnaire/questions-visibility-builder'
    ],
    function ClientQuestionnaireBaseDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            questionnaire = require('viewmodels/questionnaire/question/questionnaire'),
            customer = require('initdatamanagers/Customer'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary'),
            buildTriggerQuestion = require('viewmodels/questionnaire/trigger-question-builder'),
            questionsVisibilityBuilder = require('viewmodels/questionnaire/questions-visibility-builder');

        var ClientQuestionnaireBase = function ClientQuestionnaireBaseclass() {
            var self = {},
                // alerts:
                questionnaireAlertManager = alertsManager.GetAlert(AlertTypes.ClientQuestionnaire);

            function showGeneralErrorAlert() {
                return alertsManager.ShowAlert(
                    AlertTypes.ServerResponseAlert,
                    dictionary.GetItem('GenericAlert'),
                    dictionary.GetItem('errorPleaseRefresh'),
                    null,
                    { redirectToView: customer.prop.mainPage }
                );
            }

            function showOrderErrorQuestionnaire() {
                return alertsManager.ShowAlert(
                    AlertTypes.ServerResponseAlert,
                    dictionary.GetItem('GenericAlert'),
                    dictionary.GetItem('OrderErrorQuestionnaire'),
                    null
                );
            }

            // create one shared observable for answers model and the questions answers
            function createAnswersModel(answersHashTable, customerModel, customerAnswers, questionnaireItemsDictionary, questionnaireValidationOn) {
                var qName, qItem, i, len,

                    questionnaireMappings = {
                        CountryId: customer.prop.countryID,
                        MobilePhoneNumber: customerModel.mobile,
                        FirstName: customerModel.firstName,
                        LastName: customerModel.lastName
                    };

                for (i = 0, len = customerAnswers.length; i < len; i += 1) {
                    qName = customerAnswers[i].name;
                    qItem = questionnaireItemsDictionary[qName];

                    for (var property in questionnaireMappings) {
                        if (questionnaireMappings.hasOwnProperty(property)) {
                            if (customerAnswers[i].answer == '@@' + property + '@@') {
                                if (qItem.optionalAnswers) {
                                    var filteredOptionalAnswers = qItem.optionalAnswers.filter(function (optionalAnswer) {
                                        return optionalAnswer.systemId == questionnaireMappings[property];
                                    });

                                    customerAnswers[i].answer = filteredOptionalAnswers.length > 0 ? filteredOptionalAnswers[0].answerValue : questionnaireMappings[property];
                                } else {
                                    customerAnswers[i].answer = questionnaireMappings[property];
                                }
                            }
                        }
                    }

                    qItem.questionnaireValidationOn = ko.computed(function () { return questionnaireValidationOn(); });
                    qItem.answer = customerAnswers[i].answer = ko.observable(customerAnswers[i].answer);
                    qItem.text = customerAnswers[i].title = ko.observable(qItem.text);

                    if (answersHashTable.HasItem(qName)) {
                        var answer = answersHashTable.GetItem(qName);

                        if (!general.isNullOrUndefined(answer)) {
                            qItem.answer(answer);
                        }
                    }
                    // set visibility
                    qItem.visible = questionsVisibilityBuilder(qItem, questionnaireItemsDictionary);

                }

                // nationality as country trigger
                buildTriggerQuestion(questionnaireItemsDictionary);
            }

            function init(params) {
                var serverModel = params.serverModel || {};

                //if not valid response go to main view and show error message 
                if (serverModel.result === 'NOK' || !serverModel.customerAnswers || serverModel.customerAnswers.length <= 0) {
                    self = { isValidResponse: false };
                    viewModelsManager.VManager.SwitchViewVisible(customer.prop.mainPage, {});
                    showGeneralErrorAlert();

                    return self;
                }

                // else SCMM is up and valid model has been received
                self.questionnaireItemsDictionary = serverModel.questionnaire.questionnaireItemsDictionary;

                // this inherits from questionnaire
                self = questionnaire.viewModel.createViewModel({
                    model: serverModel.questionnaire,
                    questionnaireItemsDictionary: self.questionnaireItemsDictionary
                });

                self.isValidResponse = true;

                self.questionnaire = serverModel.questionnaire;
                self.customerAnswers = serverModel.customerAnswers;
                self.popAlert = questionnaireAlertManager.popAlert;

                self.header = self.text;

                self.questionnaireValidationOn = ko.observable(false);

                return self;
            }

            return {
                showGeneralErrorAlert: showGeneralErrorAlert,
                questionnaireAlertManager: questionnaireAlertManager,
                showOrderErrorQuestionnaire: showOrderErrorQuestionnaire,
                init: init,
                createAnswersModel: createAnswersModel
            };
        };

        return ClientQuestionnaireBase;
    }
);
