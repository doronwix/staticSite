define(
    'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetCCDetailsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'modules/WithdrawalCommon',
        'StateObject!wizardState',
        'StateObject!withdrawal',
        'devicemanagers/AlertsManager',
        'Dictionary',
        'dataaccess/dalDeposit',
        'JSONHelper'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            wizardState = require('StateObject!wizardState'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            Dictionary = require('Dictionary'),
            dalDeposit = require('dataaccess/dalDeposit'),
            JSONHelper = require('JSONHelper'),
            withdrawalState = require('StateObject!withdrawal');

        var BaseWithdrawalSetCCDetailsViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                notApprovedCcMessages = params.notApprovedCcMessages || [],
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
                setComputables();
                setSubscribers();
                loadSharedData();
                buildWizardStep();
            }

            function componentReady() {
                if (general.isEmptyValue(withdrawalData) || general.isEmptyValue(withdrawalData.amount) || general.isEmptyValue(withdrawalData.currencyLabel)) {
                    return false;
                }
                return true;
            }

            function setObservables() {
                data.ccTiles = ko.observableArray();
                data.selectedCC = ko.observable();
            }

            function setComputables() {
                data.isValidStep = self.createComputed(function () {
                    return !general.isNullOrUndefined(data.selectedCC());
                }, self, true);
            }

            function setSubscribers() {
                self.subscribeTo(data.isValidStep, function (value) {
                    stepData.nextStep.valid = value;
                    wizardState.update('stepData', stepData);
                });

                self.subscribeTo(data.ccTiles, function (newValue) {
                    if (newValue.length === 0) {
                        data.selectedCC(null);
                    } else if (data.selectedCC()) {
                        var selectedAvailable = newValue.find(function (tile) { return tile.CCId === data.selectedCC().CCId; });
                        if (!selectedAvailable) {
                            data.selectedCC(null);
                        }
                    }
                });
            }

            function loadSharedData() {
                data.ccTiles(withdrawalData.withdrawalOptions.filter(function (wOpt) {
                    return !general.isEmptyValue(wOpt.CCId);
                }));
            }

            function continueWithWithdrawal() {
                if (!data.selectedCC().IsApproved) {
                    showNotApprovedAlert();
                } else {
                    updateNextStep();
                }
            }

            function updateNextStep() {
                updateSharedState();
                wizardState.update('step', eWithdrawalSteps.setApproval);
            }

            function buildWizardStep() {
                params.setStepActions(continueWithWithdrawal);
            }

            function updateSharedState() {
                var stateData = withdrawalState.get('withdrawal');

                stateData.creditCardDetails = {
                    CreditCardId: data.selectedCC().CCId,
                    CardHolderName: data.selectedCC().CardHolder,
                    LastFourDigits: data.selectedCC().Last4,
                    CardType: getCCName(data.selectedCC()),
                    CardExpiryDate: data.selectedCC().CCExpiry
                };
                withdrawalState.update('withdrawal', stateData);
            }

            function showNotApprovedAlert() {
                var props = {
                        overwriteNavFlow: true,
                        okButtonCallback: updateNextStep,
                        okButtonCaption: Dictionary.GetItem("ok"),
                        cancelButtonCaption: Dictionary.GetItem("cancel"),
                        btnOkClass: 'small-okBtn',
                        btnCancelClass: 'small-cancelBtn'
                    },
                    messages = [].concat(notApprovedCcMessages);

                AlertsManager.UpdateAlert(
                    AlertTypes.CreditCardNotApprovedAlert,
                    getCCName(data.selectedCC()) + " " + data.selectedCC().Last4,
                    null,
                    messages,
                    props
                );
                AlertsManager.PopAlert(AlertTypes.CreditCardNotApprovedAlert);
            }

            function getLast4(card) {
                var mask = 'xxxx';

                if (card.Last4) {
                    return mask + card.Last4;
                }

                var iban = card.IBAN;

                if (general.isEmptyValue(iban)) {
                    return "XXXX";
                }

                if (iban.length < 4) {
                    return iban;
                }

                var startIndex = iban.length - 4;

                return mask + iban.substring(startIndex);
            }

            function onClickRemoveCard(card) {
                var removeCcProps = {
                    okButtonCallback: function () {
                        removeCreditCard(card);
                    },
                    okButtonCaption: 'depConfirmRemoveCC',
                    cancelButtonCaption: 'depCancelRemoveCC'
                };

                var confirmationMessage = String.format(Dictionary.GetItem(cDepositMessageKeys.removeCCMessage), card.Last4);

                AlertsManager.UpdateAlert(AlertTypes.RemoveCreditCardConfirmationAlert, '', confirmationMessage, null, removeCcProps);
                AlertsManager.PopAlert(AlertTypes.RemoveCreditCardConfirmationAlert);
            }

            function removeCreditCard(card) {
                dalDeposit.removeUsedCard(card.CCId)
                    .then(function (responseText) {
                        var response = JSONHelper.STR2JSON('WithdrawalViewModel/onRemoveCreditCard', responseText, eErrorSeverity.low) || {};

                        if (response.result === 'success') {
                            data.ccTiles.remove(card);
                        }
                    })
                    .fail(general.emptyFn)
                    .done();
            }

            function onSelectCC(card) {
                data.selectedCC(card);
            }

            function getCCName(card) {
                if (Dictionary.ValueIsEmpty(card.TextContentKey, 'payments_concreteNames')) {
                    return card.Name;
                }

                return Dictionary.GetItem(card.TextContentKey, 'payments_concreteNames');
            }

            function dispose() {
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                GetLast4: getLast4,
                GetCCName: getCCName,
                OnSelectCC: onSelectCC,
                OnClickRemoveCard: onClickRemoveCard,
                isDataReady: isDataReady
            };
        });

        return BaseWithdrawalSetCCDetailsViewModel;
    }
);
