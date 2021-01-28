define(
    'viewmodels/questionnaire/question/search-question',
    [
        'require',
        'knockout',
        'managers/historymanager',
        'viewmodels/questionnaire/question/open-question',
        'handlers/general'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            HistoryManager = require('managers/historymanager'),
            openQuestion = require('viewmodels/questionnaire/question/open-question');

        var createViewModel = function (params) {

            var INVALID_VALUE = null;
            var rawAnswer = params.model.answer();

            if (params.model.type === "search" && typeof rawAnswer === "string" && /^\d+$/.test(rawAnswer)) {
                params.model.answer(parseInt(params.model.answer()));
            }

            var self = openQuestion.viewModel.createViewModel(params);

            if (self._searchIsInitialized) {
                return self;
            }

            self._searchIsInitialized = true;

            self.onFocus = function() {
                self.focused(true);
            };
            self.onBlur = function() {
                self.focused(false);
            };

            self.searchFocus = ko.observable(false);

            if (self.optionalAnswers) { //inherited doesn't have optional answers yet
                self.optionalAnswers.sort(function (firstItem, secondItem) {
                    return firstItem.text.trim().localeCompare(secondItem.text.trim(), { sensitivity: 'base' })
                });
                
                self.optionalAnswers.unshift({
                    answerValue: INVALID_VALUE,
                    text: self.placeholder
                });

                ko.utils.arrayForEach(self.optionalAnswers, function(item) {
                    item.id = item.answerValue;
                    item.value = item.text;
                    item.imageCode = (item.imageCode || "").toLowerCase();
                });
            }

            self.displaySearch = ko.observable(false);

            var initialHistoryStateId = HistoryManager.GetCurrentState().id;
            var silentUpdate = false;

            self.displaySearch.subscribe(function (value) {
                if (silentUpdate) {
                    return;
                }

                if (value) {
                    var serializedSubstate = "expand_" + self.name;
                    HistoryManager.PushSubState(serializedSubstate);
                } else {
                    var currentHistoryStateId = HistoryManager.GetCurrentState().id;
                    if (initialHistoryStateId !== currentHistoryStateId) {
                        HistoryManager.Back();
                    }
                }
            });
            
            HistoryManager.OnStateChanged.Add(function() {
                var currentHistoryStateId = HistoryManager.GetCurrentState().id;

                if (initialHistoryStateId === currentHistoryStateId && self.displaySearch()) {
                    silentUpdate = true;
                    self.displaySearch(false);
                    silentUpdate = false;
                }
            });
            var defaultAnswer;

            if (self.optionalAnswers) {
                defaultAnswer = ko.utils.arrayFirst(self.optionalAnswers, function(item) {
                    return item.id === params.model.answer();
                });

                if (!defaultAnswer) {
                    defaultAnswer = ko.utils.arrayFirst(self.optionalAnswers, function(item) {
                        return item.id === INVALID_VALUE;
                    });
                    self.answer(defaultAnswer.id);
                }
            }

            self.selected = ko.observable(defaultAnswer).extend({ notify: 'always' });
            self.selected.subscribe(function (newAnswer) {

                if (!newAnswer || !newAnswer.id || newAnswer.id <= -1) {
                    return;
                }

                self.displaySearch(false);
                self.focused(false);

                if (general.isFunctionType(self.answer)) {
                    self.answer(newAnswer.id);
                }
            });

            self.selectedClass = ko.pureComputed(function () {
                var selectedItem;

                if (self.optionalAnswers) {
                    selectedItem = ko.utils.arrayFirst(self.optionalAnswers,
                        function(item) {
                            return item.id === self.answer() || item.text === self.answer();
                        });
                }
                if (selectedItem && selectedItem.imageCode) {
                    return selectedItem.imageCode + " list-flag";
                }

                return "";
            });

            self.selectedText = ko.pureComputed(function () {
                var selectedItem = ko.utils.arrayFirst(self.optionalAnswers,
                    function (item) {
                        return item.id === self.answer() || item.text === self.answer();
                    });

                if (selectedItem) {
                    return selectedItem.text || "";
                }

                return "";
            });

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);