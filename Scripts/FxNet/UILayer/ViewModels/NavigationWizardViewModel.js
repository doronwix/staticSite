define(
    'viewmodels/NavigationWizardViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/historymanager',
        'StateObject!wizardState',
        'configuration/initconfiguration'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            initConfiguration = require('configuration/initconfiguration'),
            historyManager = require('managers/historymanager'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            wizardState = require('StateObject!wizardState'),
            wizardStateStepSubscribe,
            wizardStateStepDataSubscribe;

        var NavigationWizardViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                config = initConfiguration.WithdrawalConfiguration.wizardConfig,
                useHistory = config.useBrowserHistory || false;

            data.stepData = {
                previousStep: {},
                nextStep: {}
            };

            function init(settings) {
                parent.init.call(self, settings);
                initWizard();
            }

            function initWizard() {
                setWizardStateObject();

                initStepActions();
                setObservables();
                setSubscribers();
                validateStep();
            }

            function setWizardStateObject() {
                if (!wizardState.containsKey('step')) {
                    wizardState.set('step', config.defaultStep);
                }
            }

            function validateStep() {
                if (useHistory && data.step() !== getStepFromUrl()) {
                    navigateToStep(config.defaultStep);
                }
            }

            function setObservables() {
                var firstStep = config.defaultStep || 1,
                    stepConfig = config.steps[firstStep];

                data.step = ko.observable(firstStep);
                data.renderedComponent = ko.observable(stepConfig.component);

                Object.assign(data.stepData.previousStep, {
                    label: ko.observable(stepConfig.previousStep.label),
                    valid: ko.observable(stepConfig.previousStep.valid),
                    visible: ko.observable(stepConfig.previousStep.visible)
                });

                Object.assign(data.stepData.nextStep, {
                    label: ko.observable(stepConfig.nextStep.label),
                    valid: ko.observable(stepConfig.nextStep.valid),
                    visible: ko.observable(stepConfig.nextStep.visible)
                });
                setWizardStateStepData(stepConfig);
            }

            function setWizardStateStepData(stepConfig) {
                wizardState.update('stepData', {
                    previousStep: {
                        valid: stepConfig.previousStep.valid,
                        visible: stepConfig.previousStep.visible
                    },
                    nextStep: {
                        valid: stepConfig.nextStep.valid,
                        visible: stepConfig.nextStep.visible
                    }
                });
            }

            function setSubscribers() {
                wizardStateStepSubscribe = wizardState.subscribe('step', function (newStep) {
                    navigateToStep(newStep);
                });

                if (useHistory) {
                    historyManager.OnStateChanged.Add(handleHistoryChange);
                }

                data.step.subscribe(function (currentStep) {
                    resetStep(currentStep);
                });

                wizardStateStepDataSubscribe = wizardState.subscribe('stepData', function (newValue) {
                    data.stepData.previousStep.valid(newValue.previousStep.valid);
                    data.stepData.previousStep.visible(newValue.previousStep.visible);

                    data.stepData.nextStep.valid(newValue.nextStep.valid);
                    data.stepData.nextStep.visible(newValue.nextStep.visible);
                });
            }

            function handleHistoryChange(state) {
                if (state.view === config.defaultForm && state.type === eHistoryStateType.Wizard) {
                    return data.step(!general.isEmptyValue(state.step) ? state.step : config.defaultStep);
                }
            }

            function navigateToStep(step) {
                if (useHistory) {
                    historyManager.PushWizardState(config.defaultForm, step);
                } else {
                    data.step(step);
                }
            }

            function getStepFromUrl() {
                var currentStateData = historyManager.GetCurrentState().data;
                return currentStateData.step ? currentStateData.step : config.defaultStep;
            }

            function initStepActions() {
                data.currentStep = {
                    next: general.emptyFn,
                    prev: general.emptyFn
                };
            }

            function resetStep(currentStep) {
                updateStepData(currentStep);
                Object.assign(data.currentStep, {
                    next: general.emptyFn,
                    prev: general.emptyFn
                });
                data.renderedComponent(config.steps[currentStep].component);
            }

            function updateStepData(currentStep) {
                var currentConfig = config.steps[currentStep];

                data.stepData.previousStep.label(currentConfig.previousStep.label);
                data.stepData.nextStep.label(currentConfig.nextStep.label);

                setWizardStateStepData(currentConfig);
            }

            function updateStepActions(nextAction, prevAction) {
                if (general.isFunctionType(nextAction)) {
                    Object.assign(data.currentStep, {
                        next: nextAction
                    });
                }

                if (general.isFunctionType(prevAction)) {
                    Object.assign(data.currentStep, {
                        prev: prevAction
                    });
                }
            }

            function prev() {
                if (data.stepData.previousStep.valid()) {
                    data.currentStep.prev();
                }
            }

            function next() {
                if (data.stepData.nextStep.valid()) {
                    data.currentStep.next();
                }
            }

            function dispose() {
                wizardState.unset('wizardActive');
                wizardState.unset('step');
                wizardState.unset('stepData');
                wizardStateStepSubscribe();
                wizardStateStepDataSubscribe();
                if (useHistory) {
                    historyManager.OnStateChanged.Remove(handleHistoryChange);
                }
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                UpdateStepActions: updateStepActions,
                previousStep: data.stepData.previousStep,
                nextStep: data.stepData.nextStep,
                next: next,
                prev: prev
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NavigationWizardViewModel(params);
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
