define(
    "dataaccess/dalKycClientQuestionnaire",
    [
        "require",
        "handlers/Ajaxer",
        'JSONHelper',
        'handlers/general'
    ],
    function (require) {
        var self = {},
            callerInfo = 'dalKycClientQuestionnaire',
            JSONHelper = require('JSONHelper'),
            general = require('handlers/general'),
            ajaxer = require('handlers/Ajaxer');

        // public service api
        self.post = function (customerAnswers, successFn, errorFn) {
            var customerAnswersUrl = "compliance/KycCustomerAnswers";

            new ajaxer().jsonPost(callerInfo, customerAnswersUrl, JSON.stringify(customerAnswers),
                function (response) {
                    var model = JSONHelper.STR2JSON("dalKycClientQuestionnaire:post", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(model);
                    }
                },
                function (responseError) {
                    if (general.isFunctionType(errorFn)) {
                        errorFn(responseError);
                    }
                });
        };

        // public service api
        self.postKycKnowledgeQuestionnaire = function (customerAnswers, successFn, errorFn) {
            var customerAnswersUrl = "compliance/KycKnowledgeCustomerAnswers";

            new ajaxer().jsonPost(callerInfo, customerAnswersUrl, JSON.stringify(customerAnswers),
                function (response) {
                    var model = JSONHelper.STR2JSON("dalKycClientQuestionnaire:postKycKnowledgeQuestionnaire", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(model);
                    }
                },
                function (responseError) {
                    if (general.isFunctionType(errorFn)) {
                        errorFn(responseError);
                    }
                });
        };

        self.postCustomerFailedAware = function (onResponse) {
            var customerFailedAwareUrl = "compliance/CustomerFailedAware";

            new ajaxer().jsonPost(callerInfo, customerFailedAwareUrl, null, function (response) {
                if (onResponse) {
                    var responseObj = JSONHelper.STR2JSON("dalKycClientQuestionnaire:postCustomerFailedAware", response);

                    onResponse(responseObj);
                }
            });
        };

        self.get = function (successFn, errorFn) {
            var getCustomerAnswersUrl = "compliance/CustomerAnswers";

            new ajaxer().get(
                callerInfo,
                getCustomerAnswersUrl,
                null,
                function (response) {
                    var serverModel = JSONHelper.STR2JSON("dalKycClientQuestionnaire:selfGet", response);

                    if (general.isFunctionType(successFn)) {
                        successFn(serverModel);
                    }
                },
                function (error) {
                    if (general.isFunctionType(errorFn)) {
                        errorFn(error);
                    }

                    throw new Error("Client Questionnaire Dal- ajax request failed:" + getCustomerAnswersUrl);
                }
            );
        };

        return self;
    }
);
