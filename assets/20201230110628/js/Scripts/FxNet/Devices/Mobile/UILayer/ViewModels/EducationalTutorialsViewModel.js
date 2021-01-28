define(
    'deviceviewmodels/EducationalTutorialsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!EducationalTutorials',
        'managers/historymanager'
    ],
    function (require) {
        var general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            HistoryManager = require('managers/historymanager'),
            state = require('StateObject!EducationalTutorials'),
            ko = require('knockout');

        var EducationalTutorialsViewModel = general.extendClass(KoComponentViewModel, function EducationalTutorialsViewModelClass(params) {
            var self = this,
                data = this.Data,
                initialHistoryStateId = HistoryManager.GetCurrentState().id,
                silentUpdate = false,
                parent = this.parent; // inherited from KoComponentViewModel

            var localStorage = StorageFactory(StorageFactory.eStorageType.local);

            function init() {
                parent.init.call(self, params);
                setObservables();
                setSubscribers();

                data.selectedTutorialsType(params.type);
                data.tutorials(params.tutorials);
            }

            function agreeDisclaimer() {
                data.disclaimerVisible(false);
                localStorage.setItem('showDisclaimer', 'false');
            }

            function setPathWithTemporaryPath() {
                data.selectedPath(data.temporaryPath());
            }

            function updateSelectedPath(id) {
                var path = data.tutorials().find((function (tutorial) {
                    return tutorial.Id === id;
                })).Path;

                var showDisclaimerValue = localStorage.getItem('showDisclaimer') || 'true';
                localStorage.setItem('showDisclaimer', showDisclaimerValue);

                if (showDisclaimerValue === 'true') {
                    data.disclaimerVisible(true);
                    data.temporaryPath(path);
                } else {
                    data.selectedPath(path);
                }
            }

            function setObservables() {
                data.selectedTutorialsType = ko.observable();
                data.tutorials = ko.observableArray([]);
                data.disclaimerVisible = ko.observable(false);
                data.tutorialPlayerVisible = ko.observable(false);
                data.temporaryPath = ko.observable('');
                data.selectedPath = ko.observable('').extend({ notify: 'always' });
                data.serviceInfoVisible = state.get("serviceInfoVisible");
            }

            var setSubscribers = function () {
                self.subscribeTo(data.disclaimerVisible, function (value) {
                    params.disclaimerVisible(!value);
                    if (silentUpdate) {
                        return;
                    }

                    if (value) {
                        var serializedSubstate = "expand_tutorialsDisclaimer";
                        HistoryManager.PushSubState(serializedSubstate);
                    } else {
                        var currentHistoryStateId = HistoryManager.GetCurrentState().id;
                        if (initialHistoryStateId !== currentHistoryStateId) {
                            HistoryManager.Back(setPathWithTemporaryPath);
                        }
                    }
                });

                self.subscribeTo(data.tutorialPlayerVisible, function (value) {
                    if (silentUpdate) {
                        return;
                    }

                    if (value) {
                        var serializedSubstate = "expand_tutorialsPlayer";
                        HistoryManager.PushSubState(serializedSubstate);
                    } else {
                        var currentHistoryStateId = HistoryManager.GetCurrentState().id;
                        if (initialHistoryStateId !== currentHistoryStateId) {
                            HistoryManager.Back();
                        }
                    }
                });

                HistoryManager.OnStateChanged.Add(function () {
                    var currentHistoryStateId = HistoryManager.GetCurrentState().id;

                    if (initialHistoryStateId === currentHistoryStateId && data.disclaimerVisible()) {
                        silentUpdate = true;
                        data.disclaimerVisible(false);
                        silentUpdate = false;
                    }

                    if (initialHistoryStateId === currentHistoryStateId && data.tutorialPlayerVisible()) {
                        silentUpdate = true;
                        data.tutorialPlayerVisible(false);
                        silentUpdate = false;
                    }
                });
            };

            return {
                init: init,
                Data: data,
                agreeDisclaimer: agreeDisclaimer,
                updateSelectedPath: updateSelectedPath
            };
        });

        var createViewModel = function (params) {
            var viewModel = new EducationalTutorialsViewModel(params);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);