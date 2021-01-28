/*eslint-disable no-alert, no-confirm */
define(
    "deviceviewmodels/withdrawalautomation/withdrawallinesviewmodel",
    [
        "require",
        "knockout",
        'handlers/general',
        "dataaccess/dalWithdrawalAutomation",
        'devicemanagers/StatesManager',
        'Dictionary',
        'LoadDictionaryContent!payments_concreteNames'
    ],
    function (require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            dalWithdrawalAutomation = require("dataaccess/dalWithdrawalAutomation"),
            StatesManager = require('devicemanagers/StatesManager'),
            dictionary = require('Dictionary'),
            ResendLineStatusCandidates = ['NotSent', 'Failed', 'Error'],
            ResendLineTypesCandidates = [0, 3];

        var createViewModel = function (params) {
            var self = {};
            self.selectedWithdrawal = params.selectedWithdrawal;
            self.withdrawalLines = ko.observableArray().extend({ deferred: true });
            self.spinnerText = ko.observable("");
            var isSpinnerOn = false;

            function turnSpinner(on) {
                isSpinnerOn = on;
                self.spinnerText(on ? "Processing your request..." : "");
            }

            // nostro banks
            self.selectedNostroBank = ko.observable();
            self.nostroBanks = ko.observableArray();

            self.anySelectedWithdrawalLines = ko.pureComputed(function () {
                return self.withdrawalLines().findIndex(function (withdrawalLine) {
                    return withdrawalLine.isSelected();
                }) !== -1;
            });

            self.selectedWithdrawalLinesWithSuccessfulClearerState = ko.pureComputed(function () {
                return self.withdrawalLines().findIndex(function (withdrawalLine) {
                    return withdrawalLine.clearerState() === "Successful";
                }) !== -1;
            });

            self.allWithdrawalLinesAreSelected = ko.pureComputed(function () {
                var result = self.withdrawalLines().findIndex(
                    function (withdrawalLine) {
                        return withdrawalLine.isSelected() === false;
                    }) === -1;

                return result;
            });

            function onGetNostroBanks(nostroBanks) {
                if (!general.isNullOrUndefined(nostroBanks)) {
                    nostroBanks.sort(function (l, r) { return l.BankName > r.BankName ? 1 : -1; });
                    self.nostroBanks(nostroBanks);
                }
            }

            dalWithdrawalAutomation.getNostroBanks(onGetNostroBanks);

            function formatDate(dateStr) {
                if (dateStr === null) {
                    return "";
                }

                var date = new Date(dateStr);
                return date.ExtractDate() + " " + date.ExtractFullTime();
            }

            function formatExpirationDate(dateStr) {
                if (dateStr === null) {
                    return "";
                }

                var date = new Date(dateStr);
                return date.getMonth() + 1 + "/" + date.getFullYear();
            }

            function createWithdrawalLineRow() {
                var withdrawalLineRow = {
                    dateOfDeposit: 0,
                    lineType: 0,
                    last4: 0,
                    expirationDate: 0,
                    isApproved: 0,
                    isOwner: 0,

                    cardTypeId: 0,
                    cardTypeName: 0,
                    clearerName: 0,
                    depositCurrency: 0,
                    clearerState: ko.observable(0),

                    depositAmount: 0,
                    remainingAmount: 0,
                    withdrawalAmount: ko.observable(0),
                    isSelected: ko.observable(false),
                    isExpanded: ko.observable(false),
                    expand: function () {
                        withdrawalLineRow.isExpanded(!withdrawalLineRow.isExpanded());
                    },
                    expandLabel: ko.pureComputed(function () {
                        return withdrawalLineRow.isExpanded() ? "-" : "+";
                    }, withdrawalLineRow),


                    withdrawalConvertRate: 1,

                    shouldMultiplyForConversion: true,

                    isSigned: 0,

                    withdrawalResponseLogs: []
                };

                withdrawalLineRow.convertedAmount = ko.pureComputed(function () {
                    var result;

                    if (!general.isNullOrUndefined(withdrawalLineRow.calculatedAmountFromServer)) {
                        return withdrawalLineRow.calculatedAmountFromServer;
                    }

                    if (withdrawalLineRow.shouldMultiplyForConversion) {
                        result = withdrawalLineRow.withdrawalAmount() * withdrawalLineRow.withdrawalConvertRate;
                    }
                    else {
                        result = withdrawalLineRow.withdrawalAmount() / withdrawalLineRow.withdrawalConvertRate;
                    }

                    return result;
                });

                return withdrawalLineRow;
            }

            function createWithdrawalResponseLogs(responseLogs) {
                var withdrawalResponseLogs = [];

                responseLogs.forEach(function (responseLog) {
                    var withdrawalResponseLog = {
                        responseCode: responseLog.ResponseCode,
                        responseMessage: responseLog.ResponseText,
                        providerName: responseLog.Provider,
                        responseTime: formatDate(responseLog.ResponseTime)
                    }

                    withdrawalResponseLogs.push(withdrawalResponseLog);
                });

                return withdrawalResponseLogs;
            }

            self.withdrawalLineType = {
                CreditCardRefund: 0,
                WireTransfer: 1,
                WireTransferFee: 2,
                CreditCardTransfer: 3
            };

            function nameLineType(lineType) {
                switch (lineType) {
                    case 0:
                        return "CCRefund";
                    case 1:
                        return "Bank Wire";
                    case 2:
                        return "Bank Fee";
                    case 3:
                        return "CCTransfer";
                    default:
                        return "CCRefund";
                }
            }

            function formatBoolian(boolVal) {
                if (boolVal === null) {
                    return "";
                }

                return boolVal ? "Yes" : "No";
            }

            function translateConcretePaymentName(concretePaymentName) {
                if (concretePaymentName && concretePaymentName.indexOf('@@') >= 0) {
                    var contentKey = concretePaymentName.replaceAll('@@', '');

                    return dictionary.GetItem(contentKey, 'payments_concreteNames', ' ');
                }

                return concretePaymentName;
            }

            var onGetWithdrawalLines = function (response) {
                if (response.Status !== 1) {
                    window.alert("Internal Server Error Occurred, Please try again");
                    return;
                }

                var withdrawalLines = response.Result;
                var arr = [];
                withdrawalLines.forEach(function (withdrawalLine) {
                    var withdrawalLineRow = createWithdrawalLineRow();
                    //model only: data for submit to approve
                    withdrawalLineRow.BankId = withdrawalLine.BankId;
                    withdrawalLineRow.BaseConvertRate = withdrawalLine.BaseConvertRate;
                    withdrawalLineRow.LineId = withdrawalLine.LineId;
                    withdrawalLineRow.TransId = withdrawalLine.TransId;
                    withdrawalLineRow.CardId = withdrawalLine.CardId === 0 ? "" : withdrawalLine.CardId;
                    withdrawalLineRow.BankName = withdrawalLine.BankName;
                    withdrawalLineRow.ConcretePaymentName = translateConcretePaymentName(withdrawalLine.ConcretePaymentName);
                    ///
                    withdrawalLineRow.dateOfDeposit = formatDate(withdrawalLine.DateOfDeposit);

                    withdrawalLineRow.lineType = withdrawalLine.LineType;
                    withdrawalLineRow.lineTypeName = nameLineType(withdrawalLine.LineType);

                    withdrawalLineRow.last4 = withdrawalLine.Last4;
                    withdrawalLineRow.withdrawalResponseLogs = createWithdrawalResponseLogs(withdrawalLine.WithdrawalResponseLogs);


                    withdrawalLineRow.expirationDate = formatExpirationDate(withdrawalLine.ExpirationDate);

                    withdrawalLineRow.isApproved = withdrawalLine.IsApproved;
                    withdrawalLineRow.isApprovedFormatted = formatBoolian(withdrawalLine.IsApproved);

                    withdrawalLineRow.isOwner = withdrawalLine.IsOwner;
                    withdrawalLineRow.isOwnerFormatted = formatBoolian(withdrawalLine.IsOwner);

                    withdrawalLineRow.cardTypeId = withdrawalLine.CardTypeId;
                    withdrawalLineRow.cardTypeName = withdrawalLine.CardTypeName;
                    withdrawalLineRow.clearerName = withdrawalLine.ClearerName;
                    withdrawalLineRow.depositCurrency = withdrawalLine.DepositCurrency;
                    withdrawalLineRow.clearerState(withdrawalLine.ClearerState);

                    withdrawalLineRow.depositAmount = withdrawalLine.DepositAmount;
                    withdrawalLineRow.remainingAmount = withdrawalLine.RemainingAmount;
                    withdrawalLineRow.withdrawalAmount(withdrawalLine.WithdrawalAmount);

                    withdrawalLineRow.withdrawalConvertRate = withdrawalLine.WithdrawalConvertRate;
                    withdrawalLineRow.shouldMultiplyForConversion = withdrawalLine.ShouldMultiplyForConversion;

                    withdrawalLineRow.isSigned = withdrawalLine.IsSigned;
                    withdrawalLineRow.isSignedFormatted = formatBoolian(withdrawalLine.IsSigned);

                    if (!general.isNullOrUndefined(withdrawalLine.ConvertedAmount)) {
                        withdrawalLineRow.calculatedAmountFromServer = withdrawalLine.ConvertedAmount;
                    }

                    // set selected nostro bank
                    if (withdrawalLine.LineType === self.withdrawalLineType.WireTransfer) {
                        self.selectedNostroBank(withdrawalLine.BankId !== 0 ? withdrawalLine.BankId : "");
                    }

                    arr.push(withdrawalLineRow);
                });

                self.withdrawalLines(arr);
            }

            var onSelectedWithdrawalChanged = ko.computed(function () {
                if (self.selectedWithdrawal() && self.selectedWithdrawal().withdrawalId > 0) {
                    dalWithdrawalAutomation.getWithdrawalLines(self.selectedWithdrawal().withdrawalId, onGetWithdrawalLines);
                }
            });

            self.totalConvertedAmount = ko.pureComputed(function () {
                var total = 0;

                for (var i = 0, len = self.withdrawalLines().length; i < len; i += 1) {
                    total += self.withdrawalLines()[i].convertedAmount();
                }

                return total;
            });

            self.totalConvertedAmountValid = ko.pureComputed(function () {
                // validation only relevant to processing line
                if (self.selectedWithdrawal() && self.selectedWithdrawal().status !== "Processing") {
                    return true;
                }

                return self.selectedWithdrawal() &&
                    Math.abs(self.totalConvertedAmount() - self.selectedWithdrawal().amount) < 0.5;
            });

            self.comment = ko.observable("");

            self.showWithdrawalLines = ko.pureComputed(function () {
                return self.selectedWithdrawal() && self.withdrawalLines().length > 0 && (self.selectedWithdrawal().status === "Processing" ||
                    self.selectedWithdrawal().status === "Approved");
            });

            /// buttons visibility
            self.showCancelButton = ko.pureComputed(function () {
                return self.selectedWithdrawal() && (self.selectedWithdrawal().status === "Processing" ||
                    self.selectedWithdrawal().status === "Pending");
            });

            self.showProcessButton = ko.pureComputed(function () {
                return self.selectedWithdrawal() && self.selectedWithdrawal().status === "Pending";
            });

            self.showClearAmountsButton = ko.pureComputed(function () {
                return self.selectedWithdrawal() && self.selectedWithdrawal().status === "Processing";
            });

            self.showApproveButton = ko.pureComputed(function () {
                return self.selectedWithdrawal() && self.selectedWithdrawal().status === "Processing";
            });

            self.showRependingButton = ko.pureComputed(function () {
                return self.selectedWithdrawal() && (self.selectedWithdrawal().status === "Canceled" ||
                    self.selectedWithdrawal().status === "Approved");
            });

            self.showFailedAndSuccessButton = ko.pureComputed(function () {
                return self.selectedWithdrawal() && self.selectedWithdrawal().status === "Approved" && self.anySelectedWithdrawalLines();
            });

            self.failedClick = function () {
                if (isSpinnerOn) {
                    return;
                }
                if (!self.anySelectedWithdrawalLines()) {
                    window.alert("Please select which transfers failed.");
                    return;
                }

                if (self.comment() === "") {
                    window.alert("Please provide a comment.");
                    return;
                }

                var confirmMsg = "Are you sure?";

                if (self.selectedWithdrawalLinesWithSuccessfulClearerState()) {
                    confirmMsg = "One or more of selected transaction has succeeded. Are you sure?";
                }

                if (!window.confirm(confirmMsg)) {
                    return;
                }

                var getSelectedWithdrawalLinesIds = function (result, withdrawalLine) {
                    if (withdrawalLine.isSelected() === true) {
                        result.push(withdrawalLine.LineId);
                    }

                    return result;
                };

                var request = {
                    FailingWithdrwalLinesIds: self.withdrawalLines().reduce(getSelectedWithdrawalLinesIds, []),
                    Comment: self.comment()
                };

                turnSpinner(true);
                dalWithdrawalAutomation.failWithdrawalLines(self.selectedWithdrawal().withdrawalId, request, onWithdrawalActionResult);
            };

            self.successClick = function () {
                if (isSpinnerOn) {
                    return;
                }

                if (!self.anySelectedWithdrawalLines()) {
                    window.alert("Please select which transfers succeeded.");
                    return;
                }

                if (!window.confirm("Are you sure?")) {
                    return;
                }

                var getSelectedWithdrawalLinesIds = function (result, withdrawalLine) {
                    if (withdrawalLine.isSelected() === true) {
                        result.push(withdrawalLine.LineId);
                    }

                    return result;
                };

                var request = {
                    SucceededWithdrawalLinesIds: self.withdrawalLines().reduce(getSelectedWithdrawalLinesIds, [])
                };

                turnSpinner(true);
                dalWithdrawalAutomation.succeedWithdrawalLines(self.selectedWithdrawal().withdrawalId, request, onWithdrawalActionResult);
            };

            self.resendClick = function () {
                if (isSpinnerOn) {
                    return;
                }

                if (!self.anySelectedWithdrawalLines()) {
                    window.alert("Please select which transfers resend.");
                    return;
                }

                var selectedLines = {
                    validForResendLineIds: [],
                    validForResendLines: [],
                    count: 0
                };

                selectedLines = self.withdrawalLines().reduce(function (_selectedLines, withdrawalLine) {
                    if (withdrawalLine.isSelected()) {
                        _selectedLines.count++;
                        if (ResendLineStatusCandidates.indexOf(withdrawalLine.clearerState() >= 0) && ResendLineTypesCandidates.indexOf(withdrawalLine.lineType) >= 0) {
                            _selectedLines.validForResendLines.push(withdrawalLine);
                            _selectedLines.validForResendLineIds.push(withdrawalLine.LineId);
                        }
                    }

                    return _selectedLines;
                }, {
                    validForResendLineIds: [],
                    validForResendLines: [],
                    count: 0
                });

                //1.	Check that the line selected have type CC transfer or CC refund and one of the following states: NotSent, Failed, and Error

                //2.	If none of the line selected comply with condition above, then show the following error message and stop:
                if (selectedLines.validForResendLineIds.length < 1) {
                    window.alert('None of the line selected can be moved to state “Resend”. Line with status success or sent cannot be sent again.');
                    return;
                }

                //3.	If only part of the line selected comply with the condition, then show the following confirmation request and proceed only if confirmed:
                if (selectedLines.validForResendLines.length < selectedLines.count
                    && !window.confirm('Are you sure you want to send again the CCRefund and CCTransfer lines selected? Line already in state “Success” or “Sent” will not be changed.')) {
                    return;
                }

                //4.	If all the line selected comply with condition, then show the following confirmation request and proceed only if confirmed:
                if (selectedLines.validForResendLines.length === selectedLines.count
                    && !window.confirm("Are you sure you want to send again the CCRefund and CCTransfer lines selected?")) {
                    return;
                }

                var request = {
                    ResendWithdrawalLinesIds: selectedLines.validForResendLineIds
                };

                //5.	Upon confirmation, change the state of selected lines to state “Resent” if that are of type CC Transfer or CC Refund and their current state is one of the following: NotSent, Sent, Failed, or Error
                selectedLines.validForResendLines.forEach(function (line) {
                    line.clearerState('Resent');
                });

                turnSpinner(true);

                window.alert('The lines in status Resent will be sent at the usual schedule.');

                dalWithdrawalAutomation.resendWithdrawalLines(self.selectedWithdrawal().withdrawalId, request, onWithdrawalActionResult);
            };

            /// buttons action
            ///////////////////

            var cancelWithdrawalResult = {
                /// <summary>
                /// Indicates that an error occurred trying to cancel the withdrawal.
                /// </summary>
                Error: 0,
                /// <summary>
                /// Indicates that the withdrawal was successfully cancelled.
                /// </summary>
                Success: 1,
                /// <summary>
                /// Indicates that the request failed because the withdrawal is in a status that cannot be cancelled.
                /// </summary>
                Uncancelable: 99
            }

            function onCancelWithdrawalResult(response) {
                turnSpinner(false);
                if (response.Status !== 1) {
                    window.alert("Internal Server Error Occurred, Please try again");
                    return;
                }
                if (response.Result.Result !== cancelWithdrawalResult.Success) {
                    var msg = "Cancel withdrawal failed: ";

                    switch (response.Result.Result) {
                        case cancelWithdrawalResult.Error:
                            msg += "An error occurred trying to cancel the withdrawal.";
                            break;

                        case cancelWithdrawalResult.Uncancelable:
                            msg += "withdrawal is in a status that cannot be cancelled.";
                            break;
                    }

                    window.alert(msg);
                    return;
                }
                params.refreshWithdrawals();
            }

            self.saveCommentClick = function () {
                if (isSpinnerOn) {
                    return;
                }

                var selectedWithdrawal = self.selectedWithdrawal();

                if (general.isNullOrUndefined(selectedWithdrawal)) {
                    window.alert("Please select a withdrawal");
                    return;
                }

                if (general.isEmptyValue(selectedWithdrawal.withdrawalId)) {
                    window.alert("Missing withdrawal id. Please try again");
                    return;
                }

                var comment = self.comment();

                if (general.isEmptyValue(comment)) {
                    window.alert("Please provide a comment.");
                    return;
                }

                var saveCommentRequest = {
                    WithdrawalId: selectedWithdrawal.withdrawalId,
                    Comment: comment
                };

                turnSpinner(true);
                dalWithdrawalAutomation.saveComment(saveCommentRequest, onSaveCommentResponse);
            };

            function onSaveCommentResponse(response, savedCommentValue) {
                turnSpinner(false);

                if (response.Status !== 1) {
                    window.alert("Internal Server Error Occurred, Please try again");
                    return;
                }

                if (!general.isEmptyValue(response.Result)) {
                    if (self.selectedWithdrawal()) {
                        self.selectedWithdrawal().comment = savedCommentValue;
                        params.refreshWithdrawal(self.selectedWithdrawal);
                    }

                    if (response.Result) {
                        window.alert("Comment saved!");
                    }
                    else {
                        window.alert("Could not save comment! Please try again..");
                    }

                    self.comment("");
                }

                params.refreshWithdrawals();
            }

            self.cancelClick = function () {
                if (isSpinnerOn) {
                    return;
                }

                if (self.comment() === "") {
                    window.alert("Please provide a comment.");
                    return;
                }

                if (!window.confirm("Are you sure?")) {
                    return;
                }

                turnSpinner(true);
                var dto = {
                    Withdrawal: self.selectedWithdrawal().serverModel,
                    Comment: self.comment()
                };

                dalWithdrawalAutomation.cancelPendingProcessingWithdrawal(self.selectedWithdrawal().withdrawalId,
                    dto, self.selectedWithdrawal().status, onCancelWithdrawalResult);
            };

            var withdrawalActionResult = {
                Success: 0,
                NoPermission: 1,
                OperationFailedCheckCanceled: 2,
                OperationFailed: 3
            };

            function onWithdrawalActionResult(response) {
                turnSpinner(false);

                if (response.Status !== 1) {
                    window.alert("Internal Server Error Occurred, Please try again");
                    return;
                }

                if (response.Result !== withdrawalActionResult.Success) {
                    var msg = "Withdrawal action failed: ";

                    switch (response.Result) {
                        case withdrawalActionResult.NoPermission:
                            msg += "No permission.";
                            break;

                        case withdrawalActionResult.OperationFailedCheckCanceled:
                            msg += "Operation failed. Check Canceled";
                            break;

                        case withdrawalActionResult.OperationFailed:
                            msg += "Operation failed";
                            break;
                    }

                    window.alert(msg);
                    return;
                }

                params.refreshWithdrawals();
            }

            self.rependingClick = function () {
                if (isSpinnerOn) {
                    return;
                }

                if (self.comment() === "") {
                    window.alert("Please provide a comment.");
                    return;
                }

                if (!window.confirm("Are you sure?")) {
                    return;
                }

                turnSpinner(true);

                var dto = {
                    Withdrawal: self.selectedWithdrawal().serverModel,
                    Comment: self.comment()
                };

                if (self.selectedWithdrawal().status === "Canceled") {
                    dalWithdrawalAutomation.rependCanceledWithdrawal(self.selectedWithdrawal().withdrawalId, dto, onWithdrawalActionResult);
                }
                else if (self.selectedWithdrawal().status === "Approved") {
                    dalWithdrawalAutomation.rependApprovedWithdrawal(self.selectedWithdrawal().withdrawalId, dto, onWithdrawalActionResult);
                }
            };

            self.processClick = function () {
                if (isSpinnerOn) {
                    return;
                }

                var dto = {
                    Withdrawal: self.selectedWithdrawal().serverModel,
                    Comment: self.comment()
                };

                turnSpinner(true);
                dalWithdrawalAutomation.processWithdrawal(self.selectedWithdrawal().withdrawalId, dto, onWithdrawalActionResult);
            };

            self.clearAmountsClick = function () {
                self.withdrawalLines().forEach(function (wl) {
                    if (wl.withdrawalAmount() !== null) {
                        wl.withdrawalAmount("");
                    }
                });
            };

            self.newClick = function () {
                window.open("../withdrawal/withdrawalForm");
            };

            var approveWithdrawalValidationResult = {
                None: 0,
                NoBankSelected: 1,
                CreditCardNotOwnedByUser: 2,
                CreditCardNotApproved: 3,
                AmountExceedRequestedWithdrawal: 4,
                ZeroCumulativeAmount: 5,
                InvalidWithdrawalStatus: 6,
                NeedConfirmation: 7,
                AccountEquityTooLow: 8
            };

            function onApproveResponse(response) {
                if (!response.Result.IsWithdrawalApproved) {
                    var msg = "Withdrawal was not approved: ";

                    switch (response.Result.WithdrawalValidationResult) {
                        case approveWithdrawalValidationResult.NoBankSelected:
                            msg += "No bank selected.";
                            break;

                        case approveWithdrawalValidationResult.CreditCardNotOwnedByUser:
                            msg += "Credit card not owned by user.";
                            break;

                        case approveWithdrawalValidationResult.CreditCardNotApproved:
                            msg += "Credit card not approved.";
                            break;

                        case approveWithdrawalValidationResult.AmountExceedRequestedWithdrawal:
                            msg += "Amount exceed requested withdrawal.";
                            break;

                        case approveWithdrawalValidationResult.ZeroCumulativeAmount:
                            msg += "Please select amount to refund and/or transfer.";
                            break;

                        case approveWithdrawalValidationResult.InvalidWithdrawalStatus:
                            msg += "The withdrawal status has changed. Please reload data.";
                            break;

                        case approveWithdrawalValidationResult.AccountEquityTooLow:
                            msg = "Withdrawal was not approved. Account equity too low for bank fee required.";
                            break;

                        case approveWithdrawalValidationResult.NeedConfirmation:
                            var message = 'Transfer fee will be taken from customer equity.'
                                + '\r\nLookout: customer has open positon and his equity might change unexpectedly.'
                                + '\r\nPlease confirm to proceed.';

                            if (window.confirm(message)) {
                                approveWithdrawalWithEquityConfirmation();
                            }
                            return;

                        default:
                            msg += "The operation has failed";
                            break;
                    }

                    window.alert(msg);

                    return;
                }

                params.refreshWithdrawals();
            }

            function shouldShowAMLConfirmation(status) {
                if (status == eAMLStatus.Pending || status == eAMLStatus.Denied || status == eAMLStatus.Unverified || status == eAMLStatus.Restricted)
                    return true;

                return false;
            }

            self.approveClick = function () {
                if (isSpinnerOn) {
                    return;
                }

                // validation: AML
                if (shouldShowAMLConfirmation(StatesManager.States.AmlStatus())) {
                    if (!window.confirm("AML = " + general.getKeyByValue(eAMLStatus, StatesManager.States.AmlStatus()) + ", Do you want to continue?")) {
                        return;
                    }
                }

                // validation: bank fee is not empty
                var emptyBankFeeLines = self.withdrawalLines().filter(function (wl) {
                    return wl.lineType === self.withdrawalLineType.WireTransferFee && (general.isEmptyValue(wl.withdrawalAmount()));
                });

                if (emptyBankFeeLines.length > 0) {
                    window.alert("Bank fee is empty!");
                    return;
                }

                // validation: on bank transfer
                var bankTransferLines = self.withdrawalLines().filter(function (wl) {
                    return wl.lineType === self.withdrawalLineType.WireTransfer && wl.withdrawalAmount() > 0;
                });

                if (bankTransferLines.length > 0 && general.isEmptyValue(self.selectedNostroBank())) {
                    window.alert("Please select bank wire destination!");
                    return;
                }

                // validation: is owner
                var isNotOwnerTransferLines = self.withdrawalLines().filter(function (wl) {
                    return wl.lineType === self.withdrawalLineType.CreditCardTransfer && wl.withdrawalAmount() > 0 && wl.isOwner === false;
                });

                if (isNotOwnerTransferLines.length > 0) {
                    window.alert("Card owner for transfer is different from account owner!");
                    return;
                }

                // validation: is approved
                var isApprovedTransferLines = self.withdrawalLines().filter(function (wl) {
                    return wl.lineType === self.withdrawalLineType.CreditCardTransfer && wl.withdrawalAmount() > 0 && wl.isApproved === false;
                });

                if (isApprovedTransferLines.length > 0) {
                    window.alert("Card for transfer is not verified!");
                    return;
                }

                // validation: total is lower than requested refund
                if (self.totalConvertedAmount() < self.selectedWithdrawal().amount) {

                    if (!window.confirm("Cumulative amount is lower than requested amount. Are you sure?")) {
                        return;
                    }
                }

                // validation: amount are positive integer lower then remaining amount
                var negativeNonIntegerAmountLines = self.withdrawalLines().filter(function (wl) {
                    var wAmount = wl.withdrawalAmount();

                    // ignore empty values
                    if (general.isEmptyValue(wAmount)) {
                        return false;
                    }

                    var wAmountInt = parseInt(wAmount);

                    // is not number
                    if (isNaN(wAmountInt)) {
                        return true;
                    }

                    // is not integer
                    if (wAmountInt !== parseFloat(wAmount)) {
                        return true;
                    }

                    // is not positive
                    if (wAmountInt < 0) {
                        return true;
                    }

                    // lower then remaining amount
                    if (wl.remainingAmount !== null && wAmountInt > wl.remainingAmount) {
                        return true;
                    }

                    return false;
                });

                if (negativeNonIntegerAmountLines.length > 0) {
                    window.alert("Please enter only integer non negative values in withdrawal amounts that are lower than remaining amount!");
                    return;
                }

                var validWithdrawalLines = self.withdrawalLines().filter(function (wl) {
                    return wl.withdrawalAmount() > 0;
                });

                var sumOfWithdrawalLinesConvertedAmount = function (currentSum, currentWithdrawalLine) { return currentSum + currentWithdrawalLine.convertedAmount() };
                var cumulativeWithdrawalAmount = validWithdrawalLines.reduce(sumOfWithdrawalLinesConvertedAmount, 0);

                var deltaThreshold = 0;
                var deltaOfRequestedAndApprovedAmounts = self.selectedWithdrawal().amount - Math.ceil(cumulativeWithdrawalAmount);

                var confirmedSplitWithdrawal = false;

                if (deltaOfRequestedAndApprovedAmounts > deltaThreshold) {
                    var message = "The withdrawal approved amount is lower than the withdrawal requested amount by " + Math.floor(deltaOfRequestedAndApprovedAmounts) + " " + self.selectedWithdrawal().currency + "."
                        + "\nDo you want to create a new withdrawal to handle residual amount?"
                        + "\r\nPress Cancel, if you want to approve the withdrawal with the existing lower amount, without creating a new withdrawal for residual amount.";

                    confirmedSplitWithdrawal = window.confirm(message);

                    approveWithdrawal(confirmedSplitWithdrawal);
                    return;
                }

                approveWithdrawal(confirmedSplitWithdrawal);
            };

            function buildApproveWithdrawalDto(confirmedSplitWithdrawal) {
                var withdrawalLines = ko.toJS(self.withdrawalLines);
                withdrawalLines = withdrawalLines.filter(function (wl) {
                    return wl.withdrawalAmount > 0;
                });

                // set nostro bank if needed
                withdrawalLines.forEach(function (wl) {
                    if (wl.lineType === self.withdrawalLineType.WireTransfer) {
                        wl.BankId = self.selectedNostroBank();
                        wl.BankName = general.objectFirst(self.nostroBanks(), function (b) { return b.BankId === wl.BankId; }).TraderFullName;
                        wl.IsRealBank = general.objectFirst(self.nostroBanks(), function (b) { return b.BankId === wl.BankId; }).IsRealBank;
                    }
                });

                return {
                    Withdrawal: self.selectedWithdrawal().serverModel,
                    Comment: self.comment(),
                    WithdrawalLines: withdrawalLines,
                    MustSplitWithdrawal: confirmedSplitWithdrawal
                };
            }

            function approveWithdrawal(confirmedSplitWithdrawal) {
                // submit dto
                var dto = buildApproveWithdrawalDto(confirmedSplitWithdrawal);

                dalWithdrawalAutomation
                    .approveWithdrawal(self.selectedWithdrawal().withdrawalId, dto)
                    .then(onApproveResponse)
                    .finally(function (response) {
                        turnSpinner(false);

                        if (response && response.Status !== 1) {
                            window.alert("Internal Server Error Occurred, Please try again");
                        }
                    });
            }

            function approveWithdrawalWithEquityConfirmation() {
                // submit dto
                var dto = buildApproveWithdrawalDto(false);

                turnSpinner(true);
                dalWithdrawalAutomation
                    .approveWithdrawalWithEquityConfirmation(self.selectedWithdrawal().withdrawalId, dto)
                    .then(onApproveResponse)
                    .finally(function (response) {
                        turnSpinner(false);

                        if (response && response.Status !== 1) {
                            window.alert("Internal Server Error Occurred, Please try again");
                        }
                    });
            }

            ///
            self.dispose = function () {
                onSelectedWithdrawalChanged.dispose();
                self.totalConvertedAmount.dispose();
                self.totalConvertedAmountValid.dispose();
            };

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
/*eslint-enable no-alert, no-confirm */