define(
    'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetMethodViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'modules/WithdrawalCommon',
        'StateObject!wizardState',
        'StateObject!withdrawal',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            wizardState = require('StateObject!wizardState'),
            withdrawalState = require('StateObject!withdrawal');

        var BaseWithdrawalSetMethodViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                stepData = wizardState.get('stepData'),
                withdrawalData = withdrawalState.get('withdrawal');

            function init(settings) {
                parent.init.call(self, settings);
                setObservables();

                if (!componentReady()) {
                    return withdrawalCommon.goToDefaultPage();
                }

                setSubscribers();
                loadSharedData();
                buildWizardStep();
            }

            function componentReady() {
                if (general.isEmptyValue(withdrawalData) || general.isEmptyValue(withdrawalData.amount) || !withdrawalData.hasCcWithdrawal) {
                    return false;
                }

                return true;
            }

            function setObservables() {
                data.methods = Object.keys(eWithdrawalMethods).sort(function (a, b) { return eWithdrawalMethods[a] - eWithdrawalMethods[b]; });
                data.isValidStep = ko.observable(false);
                data.Amount = ko.observable();
                data.CurrencyLabel = ko.observable();
                data.selectedMethod = ko.observable();
            }

            function loadSharedData() {
                if (withdrawalData && !general.isEmptyValue(withdrawalData.withDrawalMethod)) {
                    data.selectedMethod(withdrawalData.withDrawalMethod);
                }
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedMethod, function (newValue) {
                    data.isValidStep(!general.isNullOrUndefined(newValue));
                });

                self.subscribeTo(data.isValidStep, function (value) {
                    stepData.nextStep.valid = value;
                    wizardState.update('stepData', stepData);
                });
            }

            function continueWithWithdrawal() {
                if (general.isEmptyValue(data.selectedMethod())) {
                    return;
                }

                var nextStep = data.selectedMethod() === eWithdrawalMethods.card ? eWithdrawalSteps.setCreditCard : eWithdrawalSteps.setBankDetails;
                updateSharedState();
                wizardState.update('step', nextStep);
            }

            function buildWizardStep() {
                params.setStepActions(continueWithWithdrawal);
            }

            function updateSharedState() {
                var stateData = withdrawalState.get('withdrawal');
                stateData.withDrawalMethod = data.selectedMethod();
                withdrawalState.update('withdrawal', stateData);
            }

            function dispose() {
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        return BaseWithdrawalSetMethodViewModel;
    }
);