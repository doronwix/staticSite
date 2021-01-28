define(
    'viewmodels/Withdrawal/Wizard/BaseWithdrawalSetAmountViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'initdatamanagers/Customer',
        'devicemanagers/StatesManager',
        'devicemanagers/AlertsManager',
        'JSONHelper',
        'initdatamanagers/SymbolsManager',
        'dataaccess/dalWithdrawal',
        'dataaccess/dalCompliance',
        'FxNet/LogicLayer/Withdrawals/LastWithdrawalRequest',
        'modules/systeminfo',
        'configuration/initconfiguration',
        'modules/WithdrawalCommon',
        'viewmodels/UploadDocumentsComponentViewModel',
        'StateObject!wizardState',
        'StateObject!withdrawal',
        'StateObject!withdrawalCCDeposits'
    ],
    function (require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            JSONHelper = require('JSONHelper'),
            dalWithdrawal = require('dataaccess/dalWithdrawal'),
            dalCompliance = require('dataaccess/dalCompliance'),
            customer = require('initdatamanagers/Customer'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            statesManager = require('devicemanagers/StatesManager'),
            Dictionary = require('Dictionary'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            initConfiguration = require('configuration/initconfiguration'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            UploadDocumentsComponentViewModel = require('viewmodels/UploadDocumentsComponentViewModel'),
            wizardState = require('StateObject!wizardState'),
            withdrawalState = require('StateObject!withdrawal'),
            withdrawalCCDeposits = require('StateObject!withdrawalCCDeposits');

        var BaseWithdrawalSetAmountViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                stepData = wizardState.get('stepData'),
                wizardActive = wizardState.get('wizardActive'),
                withdrawalData = withdrawalState.get('withdrawal'),
                dcUploadMessages = params.dcUploadMessages || {},
                dcHandlers = {};

            data.withdrawalInfo = {};
            data.withdrawalForm = {};

            function init() {
                setwithdrawalObject();
                setComputables();
                setSubscribers();
                setUploadContext();
                start();
                buildWizardStep();
            }

            function setwithdrawalObject() {
                data.notAllowedMsg = ko.observable(!customer.prop.isPending ? 'msg_notAllowed' : 'msg_notAllowedPending');
                data.hasCcWithdrawal = false;
                data.lastBankWithdrawal = null;
                data.isLoading = ko.observable(true);
                data.checkedForDc = false;
                data.dcRequired = false;
                data.dcUploadErrorMsg = '';
                data.withdrawalOptions = ko.observableArray([]);
                data.depositCurrencies = ko.observableArray([]);
                data.baseSymbol = ko.observable();

                Object.assign(data.withdrawalInfo, {
                    hasAmount: ko.observable(false),
                    MaxWithdrawalAmount: ko.observable(),
                    defaultCcy: customer.prop.defaultCcy(),
                    defaultCcyId: customer.prop.baseCcyId()
                });

                Object.assign(data.withdrawalForm, {
                    ccyList: ko.observableArray([]),
                    SymbolId: ko.observable(),
                    Details: ko.observable(''),
                    enableValidation: ko.observable(false)
                });

                data.withdrawalForm.Amount = ko.observable().extend({
                    dirty: false,
                    positiveInteger: { params: { rejectDecimals: true }, message: Dictionary.GetItem("wRequest_InvalidAmount") },
                    required: { value: true, message: Dictionary.GetItem("wRequest_reqAmount") },
                    min: { params: 0.99999999, message: Dictionary.GetItem("wRequest_InvalidAmount") },
                    max: { params: 1000000000, message: Dictionary.GetItem("wRequest_InvalidAmount") }
                });
            }

            function setComputables() {
                data.withdrawalInfo.canWithdrawal = self.createComputed(function () {
                    return (!statesManager.States.IsPortfolioInactive() || initConfiguration.WithdrawalConfiguration.overrideCanWithdrawal === true) && data.withdrawalInfo.hasAmount();
                }, self, false);

                data.isValidStep = self.createComputed(function () {
                    return !general.isEmptyValue(data.withdrawalForm.Amount()) && !isNaN(data.withdrawalForm.Amount()) && (
                        data.withdrawalForm.SymbolId() === data.withdrawalInfo.defaultCcyId ?
                            parseFloat(data.withdrawalForm.Amount()) <= parseFloat(data.withdrawalInfo.MaxWithdrawalAmount()) && (
                                data.withdrawalForm.Amount().indexOf(".") == -1)
                            : true
                    );
                }, self, false);
            }

            function setSubscribers() {
                self.subscribeTo(data.withdrawalInfo.canWithdrawal, function (value) {
                    stepData.nextStep.visible = value;
                    wizardState.update('stepData', stepData);
                });

                self.subscribeTo(data.isValidStep, function (value) {
                    stepData.nextStep.valid = value;
                    wizardState.update('stepData', stepData);
                });
            }

            function loadSharedData() {
                if (general.isEmptyValue(wizardActive)) {
                    wizardState.set('wizardActive', true);
                    return withdrawalState.update('withdrawal', null);
                }

                if (withdrawalData) {
                    data.withdrawalForm.Amount(withdrawalData.amount);
                    data.withdrawalForm.SymbolId(withdrawalData.currency);
                    data.withdrawalForm.Details(withdrawalData.details);
                }
            }

            function setUploadContext() {
                data.uploadVm = UploadDocumentsComponentViewModel.viewModel.createViewModel({
                    recordType: eUploadDocumentType.DepositConfirmation,
                    autoUpload: true,
                    id: 'upload',
                    hashTag: 1,
                    customSuccessMessage: dcUploadMessages.additionalSuccess,
                    uploadResponseCallback: function () { dcUploadHandler(); }
                });
            }

            function dcUploadHandler() {
                var files = data.uploadVm.Form.files(),
                    fileErrorTypes = ['noFileToUpload', 'uploadError', 'fileTypeError', 'fileNumberError',
                        'invalidFileName', 'maxSize'];

                if (files.length) {
                    if (fileErrorTypes.contains(files[0].errorType)) {
                        AlertsManager.UpdateAlert(AlertTypes.GeneralOkAlert, '', dcUploadMessages.fail, null, null);
                        AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
                    } else {
                        dcHandlers.dcUploadSuccess();
                    }
                }
            }

            function start() {
                if (customer.prop.isDemo) {
                    data.notAllowedMsg = ko.observable('msg_notAllowedDemo');
                    withdrawalCommon.goToDefaultPage();
                    return;
                }

                updateWithrawal();

                ko.postbox.publish('trading-event', 'witdrawal-view');
            }

            function updateWithrawal() {
                Q.all([dalWithdrawal.getWithdrawalInfo(), dalWithdrawal.getCCDeposits()])
                    .then(processData)
                    .then(hideSpinner)
                    .done();
            }

            function hideSpinner() {
                data.isLoading(false);
            }

            function processData(response) {
                var withdrawalResponseText = response[0],
                    ccDepositsResponseText = response[1];

                onLoadWithdrawalInfoComplete(withdrawalResponseText);
                onLoadCCDepositsComplete(ccDepositsResponseText);
            }

            function onLoadWithdrawalInfoComplete(responseText) {
                var response = JSONHelper.STR2JSON('WithdrawalViewModel/onLoadWithdrawalInfoComplete', responseText, eErrorSeverity.medium) || {};

                if (response.status === 'ServerError' || response.result === 'SecurityError') {
                    AlertsManager.ShowAlert(
                        AlertTypes.ServerResponseAlert,
                        Dictionary.GetItem('GenericAlert', 'dialogsTitles', ' '),
                        Dictionary.GetItem('ServerError'),
                        null
                    );

                    return;
                }

                data.lastBankWithdrawal = response.LastBankWithdrawal;
                data.withdrawalOptions(response.WithdrawalTiles);

                var allowedWithdrawalInfo = response.AllowedWithdrawalInfo || {};

                if (!general.isNullOrUndefined(allowedWithdrawalInfo.AllowedWithdrawalAmount)) {
                    data.withdrawalInfo.MaxWithdrawalAmount(allowedWithdrawalInfo.AllowedWithdrawalAmount);
                    data.withdrawalInfo.hasAmount(allowedWithdrawalInfo.AllowedWithdrawalAmount.sign() > 0);
                }

                var symbolsList = allowedWithdrawalInfo.Symbols;
                var currencyIndex;

                if (symbolsList) {
                    translateSymbolNames(symbolsList);
                    populateCcyListFrom(symbolsList);
                    currencyIndex = getCustomerCcyIndexFromSymbolList(symbolsList);

                    if (currencyIndex !== -1) {
                        data.baseSymbol(data.depositCurrencies()[currencyIndex]);
                    }

                    data.withdrawalForm.SymbolId(withdrawalCommon.getSymbolIdOrDefault(getSelectedSymbolId(), data.depositCurrencies()));
                }

                loadSharedData();
            }

            function getSelectedSymbolId() {
                var lastWithdrawal = data.lastBankWithdrawal;
                var symbolId = '';

                if (!general.isNullOrUndefined(lastWithdrawal) && lastWithdrawal.SymbolID) {
                    symbolId = lastWithdrawal.SymbolID;
                } else {
                    symbolId = general.isNullOrUndefined(data.baseSymbol()) ? '' : data.baseSymbol().SymbolID.toString();
                }

                return symbolId;
            }

            function onLoadCCDepositsComplete(responseText) {
                var ccDepositsResponse = JSONHelper.STR2JSON("ViewAndPrintWithdrawalViewModel/onLoadCCDepositsComplete", responseText, eErrorSeverity.medium);

                withdrawalCCDeposits.set('ccDeposits', ccDepositsResponse);
            }

            function buildWizardStep() {
                params.setStepActions(continueAction, general.emptyFn);
            }

            function continueAction() {
                withdrawalCommon
                    .getConvertedAmmount(
                        data.withdrawalForm.Amount(),
                        data.withdrawalInfo.MaxWithdrawalAmount(),
                        data.withdrawalInfo.defaultCcyId,
                        data.withdrawalForm.SymbolId()
                    )
                    .then(function (convertedAmount) {
                        if (!convertedAmount) return;
                        if (convertedAmount.amount && convertedAmount.amount <= parseFloat(data.withdrawalInfo.MaxWithdrawalAmount())) {
                            continueWithWithdrawal();
                        } else {
                            preventContinueAlert(convertedAmount.maxAmount);
                        }
                    })
                    .finally(function () {
                        data.isLoading(false);
                    })
                    .done();
            }

            function continueWithWithdrawal() {
                if (withdrawalCommon.isBackOffice() || (data.checkedForDc && !data.dcRequired)) {
                    return updateNextStep();
                }

                if (data.checkedForDc) {
                    return continueWithDc();
                }

                dalCompliance.getwithdrawalrequeststatus(handleDcStatus);
            }

            function handleDcStatus(response) {
                var requiredDcStatuses = [eUploadDocumentStatus.AwaitingSignature];

                data.checkedForDc = true;
                data.dcRequired = requiredDcStatuses.contains(response.DocumentStatus);
                continueWithDc();
            }

            function continueWithDc() {
                var ccDepositsState = withdrawalCCDeposits.get('ccDeposits') || {},
                    deposits = ccDepositsState.Deposits || [],
                    hasCCDeposits = deposits.length > 0,
                    continueCallBack = (data.dcRequired && hasCCDeposits) ? dcHandlers.dcShowAlert : updateNextStep;

                return continueCallBack();
            }

            function updateNextStep() {
                var ccOptionAvailable = data.withdrawalOptions().find(function (opt) { return !general.isEmptyValue(opt.CCId); }),
                    hasCcWithdrawal = data.withdrawalInfo.canWithdrawal() && !general.isEmptyValue(ccOptionAvailable),
                    nextStep = hasCcWithdrawal ? eWithdrawalSteps.setMethod : eWithdrawalSteps.setBankDetails;

                if (!general.isEmptyValue(withdrawalData) && withdrawalData.gotoApproval) {
                    nextStep = eWithdrawalSteps.setApproval;
                }

                updateSharedState(hasCcWithdrawal);
                wizardState.update('step', nextStep);
            }

            function getSelectedCurrency() {
                return data.depositCurrencies().find(function (currency) {
                    return currency.SymbolID === data.withdrawalForm.SymbolId();
                });
            }

            function updateSharedState(hasCcWithdrawal) {
                var stateData = withdrawalState.get('withdrawal') || {},
                    selectedCurrency = getSelectedCurrency(),
                    newData = {
                        gotoApproval: false,
                        hasCcWithdrawal: hasCcWithdrawal,
                        lastBankWithdrawal: data.lastBankWithdrawal,
                        withdrawalOptions: data.withdrawalOptions(),
                        currency: data.withdrawalForm.SymbolId(),
                        currencyLabel: selectedCurrency && selectedCurrency.SymbolName,
                        amount: data.withdrawalForm.Amount(),
                        details: data.withdrawalForm.Details()
                    };

                withdrawalState.update('withdrawal', Object.assign(stateData, newData));
            }

            function preventContinueAlert(maxAmountConverted) {
                var selectedCurrency = getSelectedCurrency();
                var alertMessage = Dictionary.GetItem('withdAmountLimit') + " " + general.formatRoundM(maxAmountConverted.toString()) + ' ' + (selectedCurrency && selectedCurrency.SymbolName);

                AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, null, [alertMessage]);
                AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
            }

            function translateSymbolNames(ccyList) {
                for (var i = 0; i < ccyList.length; i++) {
                    ccyList[i].SymbolName = symbolsManager.GetTranslatedSymbolById(ccyList[i].SymbolID);
                }

                return ccyList;
            }

            function populateCcyListFrom(symbolsList) {
                data.depositCurrencies.removeAll();
                ko.utils.arrayPushAll(data.depositCurrencies, symbolsList);
            }

            function getCustomerCcyIndexFromSymbolList(ccyList) {
                for (var i = 0; i < ccyList.length; i++) {
                    if (ccyList[i].SymbolID === customer.prop.selectedCcyId()) {
                        return i;
                    }
                }

                return -1;
            }

            function dispose() {
                data.uploadVm.dispose();
                withdrawalCCDeposits.clear();

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                WithdrawalInfo: data.withdrawalInfo,
                Data: data,
                UpdateNextStep: updateNextStep,
                DcHandlers: dcHandlers
            };
        });

        return BaseWithdrawalSetAmountViewModel;
    }
);
