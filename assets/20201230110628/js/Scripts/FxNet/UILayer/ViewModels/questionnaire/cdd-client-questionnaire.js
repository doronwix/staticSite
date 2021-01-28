define(
    'viewmodels/questionnaire/cdd-client-questionnaire',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalCddClientQuestionnaire',
        'viewmodels/questionnaire/client-questionnaire-base',
        'initdatamanagers/Customer',
        'devicemanagers/StatesManager',
        'generalmanagers/ErrorManager',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalClientQuestionnaire = require('dataaccess/dalCddClientQuestionnaire'),
            customer = require('initdatamanagers/Customer'),
            statesManager = require('devicemanagers/StatesManager'),
            errorManager = require('generalmanagers/ErrorManager'),
            clientQuestionnaireBase = require('viewmodels/questionnaire/client-questionnaire-base'),
            dictionary = require('Dictionary'),
            cddUsePreviousAnswerValue = dictionary.GetItem('cddUsePreviousAnswerValue', 'application_configuration', '0') === '1',
            loadPreviousAnswers = loadAnswers();

        function loadAnswers() {
            if (cddUsePreviousAnswerValue && (statesManager.States.CddStatus() === eCDDStatus.Complete)) {
                return dalClientQuestionnaire
                    .LoadCddPreviousAnswers()
                    .then(function setCustomerPreviousAnswers(data) {
                        if (general.isArrayType(data.customerAnswers)) {
                            return data.customerAnswers;
                        } else {
                            return [];
                        }
                    })
            }

            return Q.resolve([]);
        }

        var createViewModel = general.extendClass(clientQuestionnaireBase, function (params) {
            var parent = this.parent,
                self = parent.init(params);

            // cdd error handling.
            function onErrorResponse(responseError) {
                if (responseError.httpStatus && responseError.httpStatus === 403)
                    errorManager.onError("compliance/CddCustomerAnswers", responseError.message, eErrorSeverity.medium);
                else {
                    parent.showGeneraErrorAlert();
                    throw new Error("client questionnaire: invalid server response to post answers");
                }
            }

            // user action of submit or skip
            function post(completedPromise, onResponse, onError) {
                // save answers from view model to the post model
                var postCustomerAnswers = ko.toJS(self.customerAnswers);

                dalClientQuestionnaire
                    .post(postCustomerAnswers)
                    .then(function (response) {
                        // basic validation
                        if (!response || response.status !== 1) {
                            parent.showGeneralErrorAlert();
                            throw new Error("client questionnaire: server return error on post");
                        }

                        // specific request's response handler
                        if (onResponse) {
                            onResponse(completedPromise, response);
                        }

                    })
                    .fail(onError || onErrorResponse)
                    .done();
            }

            function onSubmitResponse(completedPromise, response) {
                if (!response.result) {
                    parent.showOrderErrorQuestionnaire();
                    return;
                }

                var responseResult = JSONHelper.STR2JSON("cddClientQuestionaire:onSubmitResponse", response.result);

                if (responseResult.ValidationError === true) {
                    parent.showGeneralErrorAlert();
                    return;
                }

                statesManager.States.AmlStatus(responseResult.AmlStatusId);

                if (responseResult.StatusId === eCDDStatus.Complete) {
                    statesManager.States.CddStatus(eCDDStatus.Complete);
                    completedPromise.resolve();
                    customer.UpdateHasMissingInformation();
                } else {
                    parent.showGeneralErrorAlert();
                }
            }

            function mergePreviusValuesToAnswersHashTable(answersHashTable) {
                if (loadPreviousAnswers === null) {
                    loadPreviousAnswers = loadAnswers();
                }

                return loadPreviousAnswers
                    .then(function (customerPreviousAnswers) {
                        customerPreviousAnswers.forEach(function (item) {
                            if (!answersHashTable.HasItem(item.name)) {
                                answersHashTable.SetItem(item.name, item.answer);
                            }
                        });

                        loadPreviousAnswers = null;
                    });
            }

            self.post = function (completedPromise) {
                post(completedPromise, onSubmitResponse);
            };

            self.createAnswersModel = function (answersHashTable, customerModel) {
                return mergePreviusValuesToAnswersHashTable(answersHashTable)
                    .then(function () {
                        parent.createAnswersModel(answersHashTable, customerModel, self.customerAnswers, self.questionnaireItemsDictionary, self.questionnaireValidationOn);
                    });
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
