define(
    'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetApprovalViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/viewsmanager',
        'dataaccess/dalWithdrawal',
        'modules/WithdrawalCommon',
        'StateObject!wizardState',
        'StateObject!withdrawal'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            viewsManager = require('managers/viewsmanager'),
            dalWithdrawal = require('dataaccess/dalWithdrawal'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            wizardState = require('StateObject!wizardState'),
            withdrawalState = require('StateObject!withdrawal');

        var BaseWithdrawalSetApprovalViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                stepData = wizardState.get('stepData'),
                isDataReady = ko.observable(false),
                withdrawalData = withdrawalState.get('withdrawal');

            function init(settings) {
                parent.init.call(self, settings);

                if (!componentReady()) {
                    return withdrawalCommon.goToDefaultPage();
                } else {
                    isDataReady(true);
                }

                setObservables();
                setSubscribers();
                loadSharedData();
                buildWizardStep();
            }

            function componentReady() {
                if (general.isEmptyValue(withdrawalData)) {
                    return false;
                }

                var noRequestedAmount = general.isEmptyValue(withdrawalData.amount) || general.isEmptyValue(withdrawalData.currency),
                    notDefaultedToBankWithdrawal = general.isEmptyValue(withdrawalData.withDrawalMethod) && general.isEmptyValue(withdrawalData.bankDetails),
                    noWithdrawalDetails = !general.isEmptyValue(withdrawalData.withDrawalMethod) &&
                        ((withdrawalData.withDrawalMethod === eWithdrawalMethods.bank && general.isEmptyValue(withdrawalData.bankDetails)) ||
                            (withdrawalData.withDrawalMethod === eWithdrawalMethods.card && general.isEmptyValue(withdrawalData.creditCardDetails)));

                if (noRequestedAmount || notDefaultedToBankWithdrawal || noWithdrawalDetails) {
                    return false;
                }

                return true;
            }

            function setObservables() {
                data.isLoading = ko.observable(true);
                data.isBankWithdrawal = ko.observable(false);
            }

            function setSubscribers() {
                self.subscribeTo(data.isLoading, function (newValue) {
                    stepData.nextStep.valid = !newValue;
                    wizardState.update('stepData', stepData);
                });
            }

            function loadSharedData() {
                var isBankWithdrawal = (!general.isEmptyValue(withdrawalData.withDrawalMethod) &&
                    withdrawalData.withDrawalMethod === eWithdrawalMethods.bank) ||
                    (!general.isEmptyValue(withdrawalData.bankDetails) &&
                        general.isEmptyValue(withdrawalData.creditCardDetails));

                data.summary = {
                    comments: withdrawalData.details
                };

                Object.assign(data.summary, isBankWithdrawal ? withdrawalData.bankDetails :
                    withdrawalData.creditCardDetails);

                data.isBankWithdrawal(isBankWithdrawal);
                data.isLoading(false);
            }

            function withdrawalReturn() {
                wizardState.update('step', eWithdrawalSteps.setMethod);
            }

            function continueWithWithdrawal() {
                saveWithdrawal();
            }

            function saveWithdrawal(agree) {
                var withdrawRaw = {
                        WithdrawalStatus: 1,
                        IsAgreeTradingBonusTakeout: typeof agree === 'boolean' ? agree : false,
                        SymbolID: withdrawalData.currency,
                        Amount: withdrawalData.amount,
                        Details: withdrawalData.details
                    },
                    saveWithdrawalRequest = withdrawalCommon.isBackOffice() ? dalWithdrawal.saveWithdrawalBackOfficeRequest : dalWithdrawal.saveWithdrawalRequest;

                if (data.isBankWithdrawal()) {
                    Object.assign(withdrawRaw, {
                        BankAccount: withdrawalData.bankDetails.BankAccount,
                        BankAddress: withdrawalData.bankDetails.BankAddress,
                        BankCountryID: withdrawalData.bankDetails.BankCountryID,
                        BankName: withdrawalData.bankDetails.BankName,
                        BankBeneficiary: withdrawalData.bankDetails.BankBeneficiary,
                        BankBranch: withdrawalData.bankDetails.BankBranch,
                        SwiftCode: withdrawalData.bankDetails.SwiftCode
                    });
                } else {
                    Object.assign(withdrawRaw, {
                        CreditCardId: withdrawalData.creditCardDetails.CreditCardId,
                        CardTypeName: withdrawalData.creditCardDetails.CardType
                    });
                }

                data.isLoading(true);
                saveWithdrawalRequest(onWithdrawalComplete, ko.toJSON(withdrawRaw));
            }

            function onWithdrawalComplete(response) {
                var result = withdrawalCommon.parseWSaveResponse(response, withdrawalData.currency, saveWithdrawal),
                    props = result.alertDetails.props || {},
                    goToFirstStep = function () {
                        var stateData = withdrawalState.get('withdrawal') || {};
                        stateData.gotoApproval = true;
                        withdrawalState.update('withdrawal', stateData);
                        wizardState.update('step', eWithdrawalSteps.setAmount);
                    },
                    goToDefaultPage = function () {
                        withdrawalState.update('withdrawal', null);
                        withdrawalCommon.goToDefaultPage();
                    };

                if (result.trackingEvent) {
                    ko.postbox.publish(result.trackingEvent.type, result.trackingEvent.value);
                }

                if (result.fail) {
                    var restartWithdrawal = !general.isEmptyValue(result.maxWAmount) && result.maxWAmount > 0;
                    Object.assign(props, {
                        overwriteNavFlow: true,
                        okButtonCallback: restartWithdrawal ? goToFirstStep : goToDefaultPage
                    });
                }
                else if (result.success) {
                    return handleWithdrawalSaveSuccess();
                }

                if (result.alertDetails.type === AlertTypes.GeneralOkCancelAlert) {
                    AlertsManager.UpdateAlert(result.alertDetails.type, result.alertDetails.title, result.alertDetails.content, null, props);
                }
                else {
                    AlertsManager.UpdateAlert(result.alertDetails.type, null, null, [result.alertDetails.content], props);
                }

                data.isLoading(false);
                AlertsManager.PopAlert(result.alertDetails.type);
            }

            function buildWizardStep() {
                params.setStepActions(continueWithWithdrawal, withdrawalReturn);
            }

            function handleWithdrawalSaveSuccess() {
                // reset withdrawal shared state when the save is done
                withdrawalState.update('withdrawal', null);
                withdrawalState.update('redirectFromWizard', true);
                viewsManager.RedirectToForm(eForms.WithdrawalThankYou);
            }

            function dispose() {
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                isDataReady: isDataReady
            };
        });

        return BaseWithdrawalSetApprovalViewModel;
    }
);
