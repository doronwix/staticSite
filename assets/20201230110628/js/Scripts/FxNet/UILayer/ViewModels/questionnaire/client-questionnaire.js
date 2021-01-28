define(
    'viewmodels/questionnaire/client-questionnaire',
    [
        'require',
        'knockout',
        'handlers/general',
        'Q',
        'viewmodels/questionnaire/cdd-client-questionnaire',
        'viewmodels/questionnaire/kyc-client-questionnaire',
        'viewmodels/questionnaire/kyc-knowledge-client-questionnaire',
        'viewmodels/questionnaire/pager',
        'managers/viewsmanager',
        'devicemanagers/StatesManager',
        'managers/PopUpManager',
        'text!partial-views/compliance-getallquestionnaires.json',
        'text!controllers/customer/customerDetailsQuestionnaire',
        'Dictionary',
        'initdatamanagers/Customer',
        'Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers',
        'devicemanagers/AlertsManager',
        'generalmanagers/ErrorManager'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Q = require('Q'),
            cddQuestionnaireViewModel = require('viewmodels/questionnaire/cdd-client-questionnaire'),
            kycQuestionnaireViewModel = require('viewmodels/questionnaire/kyc-client-questionnaire'),
            kycKnowledgeQuestionnaireViewModel = require('viewmodels/questionnaire/kyc-knowledge-client-questionnaire'),
            createPagerViewModel = require('viewmodels/questionnaire/pager'),
            viewsManager = require('managers/viewsmanager'),
            statesManager = require('devicemanagers/StatesManager'),
            popUpManager = require('managers/PopUpManager'),
            questionnaireModelJson = require('text!partial-views/compliance-getallquestionnaires.json'),
            customerModelJson = require('text!controllers/customer/customerDetailsQuestionnaire'),
            storeQuestionsAnswers = require('Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers'),
            dictionary = require('Dictionary'),
            customer = require('initdatamanagers/Customer'),
            alertsManager = require('devicemanagers/AlertsManager'),  
            errorManager = require('generalmanagers/ErrorManager');

        var createViewModel = function (params) {

            var questionnairePages = {
                cddPage1: 0,
                cddPage2: 1,
                kycPage1: 0,
                mifidPage1: 0
            };

            var showGeneralErrorAlert = function () {
                return alertsManager.ShowAlert(
                    AlertTypes.ServerResponseAlert,
                    Dictionary.GetItem('GenericAlert'),
                    Dictionary.GetItem('ServerError'),
                    null, {
                        redirectToView: customer.prop.mainPage
                    }
                );
            };

            var serverModel = JSONHelper.STR2JSON("cddQuestionaire:createViewModel", questionnaireModelJson) || {};

            var customerModel = JSONHelper.STR2JSON("cddQuestionaire:createViewModel", customerModelJson) || {};

            var self = {},
                i,
                len;

            self.categories = [];

            var cddQuestionnaire = null;
            var storedAnswers;
            var kycQuestionnaire = null;
            var firstQuestionnaire;
            var kycKnowledgeQuestionnaire = null;

            function createObservables() {
                self.showWelcomePage = ko.observable(true);
                self.showThankYou = ko.observable(false);
                self.showUnsuccessful = ko.observable(false);
                self.isProcessing = ko.observable(false);

                self.faqKey = ko.observable();
                self.faqKey.extend({ empty: true });
                self.isLoading = ko.observable(params && general.isFunctionType(params.isLoading) ? params.isLoading() : false);
            }

            function createPromises() {
                self.cddCompleted = Q.defer();
                self.kycCompleted = Q.defer();
                self.kycKnowledgeCompleted = Q.defer();
            }

            function createSubscribers() {
                statesManager.States.IsCDDRestricted.subscribe(redirectToMainWhenRestricted);
            }

            function redirectToMainWhenRestricted(isCDDRestricted) {
                if (isCDDRestricted && !self.showThankYou()) {
                    viewsManager.SwitchViewVisible(customer.prop.mainPage);
                }
            }

            function createViewModels() {
                statesManager.StartGetCustomerData();

                redirectToMainWhenRestricted(statesManager.States.IsCDDRestricted());

                ////// cdd always available for categories
                var cddParams = {
                    serverModel: serverModel[eQuestionnaireType.CDD]
                };
                cddQuestionnaire = cddQuestionnaireViewModel.viewModel.createViewModel(cddParams);

                var kycParams = {
                    serverModel: serverModel[eQuestionnaireType.KYC]
                };
                // kyc not
                kycQuestionnaire = statesManager.States.IsKycStatusRequired() ?
                    kycQuestionnaireViewModel.viewModel.createViewModel(kycParams) :
                    null;

                var kycKnowledgeParams = {
                    serverModel: serverModel[eQuestionnaireType.MIFID],
                    completedCallback: self.kycKnowledgeCompletedCallback
                };

                // kyc knowledge not
                if ((statesManager.States.IsKycStatusRequired() || statesManager.States.KycStatus() === eKYCStatus.Failed)
                    && (statesManager.States.KycReviewStatus() !== eKYCReviewStatus.Inappropriate
                        && statesManager.States.KycReviewStatus() !== eKYCReviewStatus.Unsuitable &&
                        statesManager.States.KycReviewStatus() !== eKYCReviewStatus.Appropriate))
                    kycKnowledgeQuestionnaire = kycKnowledgeQuestionnaireViewModel.viewModel.createViewModel(kycKnowledgeParams);
            }

            function createAnswerModels() {
                var d = Q.defer();
                storedAnswers = storeQuestionsAnswers.GetQuestionsAnswers(eLocalStorageKeys.QuestionsAnswersCDDKYC);

                if (cddQuestionnaire) {
                    cddQuestionnaire
                        .createAnswersModel(storedAnswers, customerModel)
                        .then(function () { d.resolve(); })
                        .done();
                } else {
                    d.resolve();
                }

                if (kycQuestionnaire) {
                    kycQuestionnaire.createAnswersModel(storedAnswers, customerModel);
                }

                if (kycKnowledgeQuestionnaire) {
                    kycKnowledgeQuestionnaire.createAnswersModel();
                }

                return d.promise;
            }

            function isKycReviewUnsuccessful() {
                return statesManager.States.KycReviewStatus() === eKYCReviewStatus.Inappropriate || statesManager.States.KycReviewStatus() === eKYCReviewStatus.Unsuitable;
            }

            function resolveCompletedPromises() {
                if (!kycQuestionnaire)
                    self.kycCompleted.resolve();
                if (firstQuestionnaire === kycQuestionnaire)
                    self.cddCompleted.resolve();

                if (isKycReviewUnsuccessful()) {
                    self.cddCompleted.resolve();
                    self.kycKnowledgeCompleted.resolve();
                    self.kycCompleted.resolve();
                }

                Q.all([self.cddCompleted.promise, self.kycCompleted.promise]).then(function () {
                    self.isProcessing(false);
                    if (!isKycReviewUnsuccessful()) {
                        storeQuestionsAnswers.DeleteFromLocalStorage(eLocalStorageKeys.QuestionsAnswersCDDKYC);
                        if (statesManager.States.IsKycReviewStatusRequired()) {
                            updateFirstQuestionnaire();
                            self.pager.pages(getUpdatedPages());
                            updateCurrentPage();
                        } else {
                            self.kycKnowledgeCompleted.resolve();
                        }
                    } else {
                        self.kycKnowledgeCompleted.resolve();
                    }
                }).done();

                self.kycKnowledgeCompleted.promise.then(function () {
                    self.isProcessing(false);

                    if (isKycReviewUnsuccessful()) {
                        self.showUnsuccessful(true);
                    } else {
                        if (!statesManager.States.IsActive() &&
                            (statesManager.States.AmlStatus() === eAMLStatus.NotRequired ||
                                statesManager.States.AmlStatus() === eAMLStatus.Pending ||
                                statesManager.States.AmlStatus() === eAMLStatus.Approved)
                            && customer.prop.abTestings.configuration['skipThankYouOnDeposit'] === true) {
                            viewsManager.SwitchViewVisible(eForms.Deposit, {});
                        } else {
                            self.showThankYou(true);
                        }
                    }
                }).done();
            }

            self.kycKnowledgeCompletedCallback = function (kycKnowledgeReviewStatus) {
                self.isProcessing(false);
                if (kycKnowledgeReviewStatus && kycKnowledgeReviewStatus === eKYCReviewStatus.Tested) {
                    kycKnowledgeQuestionnaire.resetAnswers();
                    updateFirstQuestionnaire();
                    self.pager.pages(getUpdatedPages());
                    updateCurrentPage();
                    raisePageEvent();
                    currentQuestionnaire().questionnaireValidationOn(false);
                } else {
                    self.kycKnowledgeCompleted.resolve();
                }
            }

            function buildCategories() {
                for (i = 0, len = cddQuestionnaire.questions.length; i < len; i = i + 1) {
                    self.categories.push(cddQuestionnaire.questions[i].category);
                }

                for (i = 0, len = kycQuestionnaire ? kycQuestionnaire.questions.length : 0; i < len; i = i + 1) {
                    self.categories.push(kycQuestionnaire.questions[i].category);
                }

                if (!kycQuestionnaire && kycKnowledgeQuestionnaire) {
                    for (i = 0, len = kycKnowledgeQuestionnaire ? kycKnowledgeQuestionnaire.questions.length : 0; i < len; i = i + 1) {
                        self.categories.push(kycKnowledgeQuestionnaire.questions[i].category);
                    }
                }

                // padding if kyc not exist
                while (self.categories.length < 3) {
                    self.categories.push('empty category');
                }
            }

            function updateFirstQuestionnaire() {
                var cddNotCompleteKycNotComplete = (
                    statesManager.States.CddStatus() === eCDDStatus.NotComplete &&
                    statesManager.States.KycStatus() === eKYCStatus.NotComplete
                ),
                    cddNotCompleteKycComplete = (
                        statesManager.States.CddStatus() === eCDDStatus.NotComplete &&
                        statesManager.States.KycStatus() === eKYCStatus.Complete
                    ),
                    cddAlwaysAvailable = (
                        statesManager.States.KycStatus() !== eKYCStatus.NotComplete &&
                        (
                            statesManager.States.KycReviewStatus() !== eKYCReviewStatus.Review &&
                            statesManager.States.KycReviewStatus() !== eKYCReviewStatus.Tested
                        )
                    ),
                    cddTradingBonusAfterDeposit = statesManager.States.IsTradingBonusGoingToCDDAfterDeposit() === true;

                if (cddNotCompleteKycNotComplete ||
                    cddNotCompleteKycComplete ||
                    cddAlwaysAvailable || cddTradingBonusAfterDeposit) {
                    firstQuestionnaire = cddQuestionnaire;
                } else if (kycQuestionnaire &&
                    statesManager.States.CddStatus() !== eCDDStatus.NotComplete &&
                    statesManager.States.KycStatus() === eKYCStatus.NotComplete) {
                    firstQuestionnaire = kycQuestionnaire;
                } else if (kycKnowledgeQuestionnaire) {
                    firstQuestionnaire = kycKnowledgeQuestionnaire;
                } else {
                    // invalid state
                    self.isValidResponse = false;
                    viewsManager.SwitchViewVisible(customer.prop.mainPage);
                    showGeneralErrorAlert();
                }

                return self;
            }

            function getUpdatedPages() {
                var pages;
                if (firstQuestionnaire === cddQuestionnaire && statesManager.States.IsKycStatusRequired()) {
                    pages = [cddQuestionnaire.questions[questionnairePages.cddPage1], cddQuestionnaire.questions[questionnairePages.cddPage2], kycQuestionnaire.questions[questionnairePages.kycPage1]];
                } else if (firstQuestionnaire === cddQuestionnaire && statesManager.States.IsKycReviewStatusRequired()) {
                    pages = [cddQuestionnaire.questions[questionnairePages.cddPage1], cddQuestionnaire.questions[questionnairePages.cddPage2], kycKnowledgeQuestionnaire.questions[questionnairePages.mifidPage1]];
                } else if (firstQuestionnaire === cddQuestionnaire && !statesManager.States.IsKycStatusRequired()) {
                    pages = cddQuestionnaire.questions;
                } else if (firstQuestionnaire === kycQuestionnaire) {
                    pages = kycQuestionnaire.questions;
                } else if (firstQuestionnaire === kycKnowledgeQuestionnaire) {
                    pages = kycKnowledgeQuestionnaire.questions;
                } else {
                    throw new Error('invalid questionnaire model');
                }
                return pages;

            }

            function questionnairePageHasLastQuestion(questionsArray) {
                if (typeof questionsArray === 'undefined' || questionsArray === null) {
                    return null;
                }

                var getLastChangedQuestionAnswer = storeQuestionsAnswers.GetLastChangedQuestion();

                return questionsArray.questions.find(function (question) {
                    return question.name === getLastChangedQuestionAnswer;
                });
            }

            function updateCurrentPage() {
                if (currentQuestionnaire() === cddQuestionnaire) {
                    var hasStoredAnswer = false;

                    if (questionnairePageHasLastQuestion(cddQuestionnaire.questions[questionnairePages.cddPage1])) {
                        hasStoredAnswer = true;
                    }

                    if (questionnairePageHasLastQuestion(cddQuestionnaire.questions[questionnairePages.cddPage2])) {
                        self.pager.pageNumber(2);
                        hasStoredAnswer = true;
                    }

                    if (kycQuestionnaire && questionnairePageHasLastQuestion(kycQuestionnaire.questions[questionnairePages.kycPage1])) {
                        self.pager.pageNumber(3);
                        hasStoredAnswer = true;
                    }

                    if (hasStoredAnswer) {
                        self.showWelcomePage(false);
                    }
                }

                if (currentQuestionnaire() === kycKnowledgeQuestionnaire) {
                    window.scroll(0, 0);
                    self.pager.pageNumber(self.pager.pages().length);
                }

                if (currentQuestionnaire() === kycKnowledgeQuestionnaire || currentQuestionnaire() === kycQuestionnaire) {
                    self.showWelcomePage(false);
                }
            }

            function updateFaqKey() {
                self.faqKey('');
                self.faqKey(currentQuestionnaire().faqKey);
            }

            function raiseNavigationEvent(eventData) {
                ko.postbox.publish('questionnaire-navigation', eventData);
            }

            function raisePageEvent() {
                ko.postbox.publish('questionnaire-page', {
                    category: getTrackingDataCategory(),
                    questionnaireType: self.currentQuestionnaireType()
                });
            }

            function currentQuestionnaire() {
                if (statesManager.States.IsKycStatusRequired() && kycQuestionnaire) {
                    if (firstQuestionnaire === kycQuestionnaire) {
                        return kycQuestionnaire;
                    }

                    if (self.pager.pageNumber() === 3) {
                        return kycQuestionnaire;
                    }
                }

                if (statesManager.States.IsKycReviewStatusRequired()) {
                    if (firstQuestionnaire === kycKnowledgeQuestionnaire) {
                        return kycKnowledgeQuestionnaire;
                    }

                    if (self.pager.pageNumber() === 3) {
                        return kycKnowledgeQuestionnaire;
                    }
                }

                return cddQuestionnaire;
            }

            function getTrackingDataCategory() {
                switch (currentQuestionnaire()) {
                    case cddQuestionnaire:
                        if (self.pager.pageNumber() === 1) {
                            return 'Cdd part 1';
                        }//else
                        return 'Cdd part 2';
                    case kycQuestionnaire:
                        return 'Kyc';
                    case kycKnowledgeQuestionnaire:
                        return 'Quiz';
                }
                return '';
            }

            function scrollToFirstInvalidAnswer() {
                var currentQ = self.pager.currentPage();
                var qInvalid = currentQ.questions.find(function (qi) { return !general.isNullOrUndefined(qi.isValid) && qi.isValid() === false; });
                if (!general.isNullOrUndefined(qInvalid)) {
                    scrollTo(0,
                        // position of the firs invalid questin label
                        $('#' + qInvalid.name + 'Label').offset().top -
                        // - space defined between questions in web or mobile
                        (parseInt($('.row-wrapper').css('margin-bottom')) || parseInt($('.row').css('margin-bottom'))) -
                        // - height of mobile header if on mobile.
                        ($('fx-component-dynamic-header #header').height() || 0)
                    );
                }
            }

            function buildPager() {
                self.pager = createPagerViewModel(getUpdatedPages());

                self.pager.pageNumber.subscribe(function () {
                    raisePageEvent();
                    updateFaqKey();
                });
            }

            function createNavigation() {
                self.next = function () {
                    currentQuestionnaire().questionnaireValidationOn(true);
                    var isValid = self.pager.currentPage().isValid();

                    if (!popUpManager.IsPopupOpen() && !self.pager.isLast()) {
                        window.scroll(0, 0);
                    }

                    var eventData = {
                        button: self.pager.isLast() ? 'Finish' : 'Next',
                        category: getTrackingDataCategory(),
                        isValid: isValid
                    };

                    raiseNavigationEvent(eventData);

                    if (!isValid) {
                        scrollToFirstInvalidAnswer();
                        return false;
                    }

                    currentQuestionnaire().questionnaireValidationOn(false);

                    if (self.pager.isLast()) {
                        // last page: submit
                        if (!self.isProcessing()) {
                            self.isProcessing(true);
                            if (currentQuestionnaire() === kycKnowledgeQuestionnaire) {
                                self.isProcessing(true);
                                kycKnowledgeQuestionnaire.post();
                            } else {
                                if (firstQuestionnaire === cddQuestionnaire) {
                                    self.isProcessing(true);
                                    cddQuestionnaire.post(self.cddCompleted);
                                }

                                if (kycQuestionnaire) {
                                    self.isProcessing(true);
                                    kycQuestionnaire.post(self.kycCompleted);
                                }
                            }
                        }
                    } else {
                        self.pager.next();
                    }

                    return true;
                };

                self.backText = dictionary.GetItem('btnBack', 'client_questionnaire');

                self.backBtnVisible = function () { return self.pager.hasPrevious() && currentQuestionnaire() !== kycKnowledgeQuestionnaire; }

                self.back = function () {
                    if (!popUpManager.IsPopupOpen()) {
                        window.scroll(0, 0);
                    }

                    if (self.pager.hasPrevious()) {
                        self.pager.previous();

                        return;
                    }

                    if (currentQuestionnaire() === kycKnowledgeQuestionnaire) {
                        return;
                    }
                };

                // click on progress bar step

                self.navigation = {
                    clickStepCdd1: function () {
                        //from 1
                        if (currentQuestionnaire() === cddQuestionnaire) {
                            if (self.pager.pageNumber() === 1) {
                                return;
                            }
                            // from 2
                            self.back();
                            return;
                        } //else: kyc
                        // from 3

                        if (currentQuestionnaire() === kycKnowledgeQuestionnaire) {
                            return;
                        }

                        self.pager.pageNumber(1);
                    },

                    clickStepCdd2: function () {

                        if (currentQuestionnaire() === cddQuestionnaire) {
                            // from 1
                            if (self.pager.pageNumber() === 1) {
                                return;
                            }
                            // from 2
                            if (self.pager.pageNumber() === 2) {
                                return;
                            }
                        } //else kyc
                        // from 3

                        if (currentQuestionnaire() === kycKnowledgeQuestionnaire) {
                            return;
                        }

                        self.back();
                        return;
                    },

                    clickStepKyc: function () {

                        return;
                    }
                };
                self.nextText = function () {
                    if (self.pager.isLast()) {
                        if (currentQuestionnaire() === kycKnowledgeQuestionnaire)
                            return dictionary.GetItem('btnSaveContinue', 'client_questionnaire');
                        else
                            return dictionary.GetItem('btnSave', 'client_questionnaire');
                    }

                    return dictionary.GetItem('btnNext', 'client_questionnaire');
                };

                self.closeWelcome = function () {
                    self.showWelcomePage(false);
                };
                /////////////////////
                self.isValidResponse = currentQuestionnaire().isValidResponse;
                self.faqKey(currentQuestionnaire().faqKey);
                self.validationOn = currentQuestionnaire().questionnaireValidationOn();
                self.questionnaireSubtitle = currentQuestionnaire().questionnaireSubtitle;

                self.currentQuestionnaireType = function () {
                    if (currentQuestionnaire() === kycQuestionnaire)
                        return eQuestionnaireType.KYC;

                    if (currentQuestionnaire() === kycKnowledgeQuestionnaire)
                        return eQuestionnaireType.MIFID;

                    return eQuestionnaireType.CDD;
                };
            }

            createObservables();
            createPromises();
            createSubscribers();
            if (serverModel.status === 'ServerError') {
                errorManager.onError('compliance/CddCustomerAnswers', serverModel.status, eErrorSeverity.high);
                return self;
            }
            createViewModels();

            updateFirstQuestionnaire();
            buildPager();
            createAnswerModels()
                .then(function () {
                    createNavigation();
                    buildCategories();

                    ////// which questionnaire to show: cdd + kyc or just kyc ////
                    resolveCompletedPromises();
                    updateCurrentPage();

                    raisePageEvent();

                    if (!general.isNullOrUndefined(params) && general.isFunctionType(params.isLoading)) {
                        params.isLoading(false);
                    }
                })
                .done();

            self.dispose = function () {
                self.pager.dispose();
            };

            return self;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);