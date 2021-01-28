define(
    'Fxnet/LogicLayer/Questionnaire/StoreQuestionsAnswers',
    [
        'require',
        'JSONHelper',
        'handlers/HashTable',
        'generalmanagers/EncryptDecryptManager',
        'initdatamanagers/Customer',
        'global/storagefactory'
    ],
    function StoreQuestionsAnswers(require) {
        var JSONHelper = require('JSONHelper'),
            hashTable = require('handlers/HashTable'),
            EncryptDecryptManager = require('generalmanagers/EncryptDecryptManager'),
            Customer = require('initdatamanagers/Customer'),
            storageFactory = require('global/storagefactory'),
            lastStoredQuestionAnswerKey = 'lastQ',
            localStorage = storageFactory(storageFactory.eStorageType.local);

        var eQuestion = {
            Id: 0,
            Answer: 1
        };

        function addQuestionAnswer(localStorageKey, questionId, answer) {
            var currentAnswersEncrypt = getFromLocalStorage(localStorageKey),
                currentAnswers,
                answersArray = [];

            if (currentAnswersEncrypt) {
                currentAnswers = EncryptDecryptManager.Decrypt(currentAnswersEncrypt);

                if (currentAnswers) {
                    answersArray = JSONHelper.STR2JSON('StoreQuestionsAnswers:addQuestionAnswer', currentAnswers);
                }
            }

            var currentQuestion = answersArray.find(function (item) {
                return item[eQuestion.Id] === questionId;
            });

            //don't store empty answer if it does not replace other answer (key was not exist)
            if (!currentQuestion && answer === '')
                return;

            if (!currentQuestion) {
                currentQuestion = [questionId, answer];
                answersArray.push(currentQuestion);
            } else {
                currentQuestion[eQuestion.Answer] = answer;
            }

            currentAnswers = JSON.stringify(answersArray);

            saveInLocalStorage(localStorageKey, EncryptDecryptManager.Encrypt(currentAnswers));
            saveInLocalStorage(lastStoredQuestionAnswerKey, EncryptDecryptManager.Encrypt(questionId));
        }

        function getQuestionsAnswers(localStorageKey) {
            var currentAnswersEncrypt = getFromLocalStorage(localStorageKey),
                answersArray = [],
                answersHashTable = new hashTable();

            if (currentAnswersEncrypt) {
                var currentAnswers = EncryptDecryptManager.Decrypt(currentAnswersEncrypt);

                if (currentAnswers) {
                    answersArray = JSONHelper.STR2JSON('StoreQuestionsAnswers:getQuestionsAnswers', currentAnswers);
                }
            }

            answersArray.forEach(function (item) {
                answersHashTable.SetItem(item[eQuestion.Id], item[eQuestion.Answer]);
            });

            return answersHashTable;
        }

        function getLastChangedQuestion() {
            var encryptedValue = getFromLocalStorage(lastStoredQuestionAnswerKey);

            return encryptedValue ? EncryptDecryptManager.Decrypt(encryptedValue) : null;
        }

        function saveInLocalStorage(localStorageKey, value) {
            localStorage.setItem(Customer.prop.accountNumber + localStorageKey, value);
        }

        function getFromLocalStorage(localStorageKey) {
            return localStorage.getItem(Customer.prop.accountNumber + localStorageKey);
        }

        function deleteFromLocalStorage(localStorageKey) {
            localStorage.removeItem(Customer.prop.accountNumber + localStorageKey);
            localStorage.removeItem(Customer.prop.accountNumber + lastStoredQuestionAnswerKey);
        }

        return {
            AddQuestionAnswer: addQuestionAnswer,
            GetQuestionsAnswers: getQuestionsAnswers,
            GetLastChangedQuestion: getLastChangedQuestion,
            DeleteFromLocalStorage: deleteFromLocalStorage
        }
    }
);
