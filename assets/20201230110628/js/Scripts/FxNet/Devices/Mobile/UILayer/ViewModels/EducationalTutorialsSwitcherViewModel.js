define(
    'deviceviewmodels/EducationalTutorialsSwitcherViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        "dataaccess/dalcustomer",
        'helpers/KoComponentViewModel',
        'devicemanagers/ViewModelsManager',
        'StateObject!EducationalTutorials',
        'LoadDictionaryContent!EducationalTutorials'
    ],
    function EducationalTutorialsSwitcherDef(require) {
        var KoComponentViewModel = require('helpers/KoComponentViewModel'),
            ko = require('knockout'),
            general = require('handlers/general'),
            ViewModelsManager = require('devicemanagers/ViewModelsManager'),
            state = require('StateObject!EducationalTutorials'),
            dalCustomer = require("dataaccess/dalcustomer");

        var EducationalTutorialsSwitcherViewModel = general.extendClass(KoComponentViewModel, function EducationalTutorialsSwitcherClass() {
            var self = this,
                handlers = {},
                data = this.Data,
                parent = this.parent; // inherited from KoComponentViewModel

            function init(params) {
                parent.init.call(self, params);

                setObservables();
                setComputables();
                setHandlers();

                dalCustomer
                    .GetEducationalTutorials()
                    .then(function (response) {
                        data.basicTutorials(response.Tutorials.filter(function (tutorial) {
                            return tutorial.Type === eEducationalTutorialsType.Basic;
                        }));

                        data.advancedTutorials(response.Tutorials.filter(function (tutorial) {
                            return tutorial.Type === eEducationalTutorialsType.Advanced;
                        }));

                        data.endDate(response.EndDate);
                        data.retentionEmail(response.AccountTutorials.RetentionPersonEmail);
                        data.isTutorialsAllowed(response.IsTutorialsAllowed);

                        if (!response.IsTutorialsAllowed && !(state.containsKey('EducationalTutorialsInactive'))) {
                            state.set('EducationalTutorialsInactive', true);
                            ViewModelsManager.VManager.SwitchViewVisible(eForms.EducationalTutorialsAccess);
                        }
                    })
                    .done();
            }

            function setObservables() {
                data.selectedTutorialsType = ko.observable(eEducationalTutorialsType.Basic);
                data.basicTutorials = ko.observableArray([]);
                data.advancedTutorials = ko.observableArray([]);
                data.endDate = ko.observable('');
                data.isTutorialsAllowed = ko.observable(false);
                data.retentionEmail = ko.observable('');
                data.disclaimerVisible = ko.observable(true);
            }

            function setComputables() {
                data.isShowBasicTutorials = self.createComputed(function () {
                    return data.selectedTutorialsType() === eEducationalTutorialsType.Basic;
                });

                data.isShowAdvancedTutorials = self.createComputed(function () {
                    return data.selectedTutorialsType() === eEducationalTutorialsType.Advanced;
                });
            }

            function setHandlers() {
                handlers.basicBtnClick = function () {
                    data.selectedTutorialsType(eEducationalTutorialsType.Basic);
                };

                handlers.advancedBtnClick = function () {
                    data.selectedTutorialsType(eEducationalTutorialsType.Advanced);
                };
            }

            var dispose = function () {
                handlers.basicBtnClick = null;
                handlers.advancedBtnClick = null;

                parent.dispose.call(self); // inherited from KoComponentViewModel
            };

            return {
                init: init,
                Handlers: handlers,
                Data: data,
                dispose: dispose
            };
        });

        var createViewModel = function (params) {
            var viewModel = new EducationalTutorialsSwitcherViewModel();
            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
