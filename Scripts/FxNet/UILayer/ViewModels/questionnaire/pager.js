define(
    'viewmodels/questionnaire/pager',
    [
        'require',
        'knockout',
        'managers/historymanager'
    ],
    function (require) {
        var ko = require('knockout');
        var historyManager = require('managers/historymanager');

        var createPagerViewModel = function (pagesArray) {
            pagesArray = pagesArray || [];

            var self = {};

            var _pagesObsArray = ko.isObservableArray(pagesArray) ?
                pagesArray : ko.observableArray(pagesArray);

            self.pageNumber = ko.observable();

            self.pages = ko.computed({
                read: function () {
                    // filter pages on visible pages only
                    return ko.utils.arrayFilter(_pagesObsArray(), function (page) {
                        return page.visible ? ko.unwrap(page.visible) : true;
                    });

                },
                write: function (pagesArrayValue) {
                    _pagesObsArray(ko.isObservableArray(pagesArrayValue) ?
                        pagesArrayValue() : pagesArrayValue);
                }
            });

            self.pageNumber.subscribe(function (value) {
                historyManager.PushQuestionnaireState(value);
            });

            self.pageNumber(1);

            function historyOnStateChanged(state) {
                if (state.type === eHistoryStateType.Questionnaire && state.pageNumber) {
                    self.pageNumber(state.pageNumber);
                } 
            }

            historyManager.OnStateChanged.Add(historyOnStateChanged);

            self.progress = ko.computed(function () {
                return (((self.pageNumber() - 1) / self.pages().length) * 100).toFixed() + '%';
            });

            self.currentPage = ko.computed(function () {
                return self.pages()[self.pageNumber() - 1];
            });

            self.isFirst = ko.computed(function () {
                return self.pageNumber() === 1;
            });

            self.hasPrevious = ko.computed(function () {
                return !self.isFirst();
            });

            self.isLast = ko.computed(function () {
                return self.pageNumber() === self.pages().length;
            });

            self.hasNext = ko.computed(function () {
                return !self.isLast();
            });

            self.next = function () {
                if (self.pageNumber() < self.pages().length) {
                    self.pageNumber(self.pageNumber() + 1);
                }
            };

            self.previous = function () {
                if (self.pageNumber() !== 1) {
                    self.pageNumber(self.pageNumber() - 1);
                }
            };

            self.dispose = function dispose() {
                historyManager.OnStateChanged.Remove(historyOnStateChanged);
            }

            return self;
        };

        return createPagerViewModel;
    }
);
