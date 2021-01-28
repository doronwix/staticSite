/*eslint-disable no-alert, no-confirm */
define(
    'deviceviewmodels/withdrawalautomation/withdrawalsviewmodel',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalWithdrawalAutomation',
        'enums/DepositWithdrawalEnums'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalWithdrawalAutomation = require('dataaccess/dalWithdrawalAutomation');

        var createViewModel = function (params) {
            var self = {};

            function setWithdrawalStatus(status) {
                if (typeof status === 'undefined' || status === null) {
                    status = eWithdrawalStatuses.None;
                }

                return general.getKeyByValue(eWithdrawalStatuses, status);
            }

            function formatBoolian(boolVal) {
                return boolVal ? 'Yes' : 'No';
            }

            function formatDate(dateStr) {
                var date = new Date(dateStr);

                return date.ExtractDate() + ' ' + date.ExtractFullTime();
            }

            function createWithdrawalRow() {
                var withdrawalRow = {
                    withdrawalId: -1,
                    status: 0,
                    requestDate: 0,
                    amount: 0,
                    currency: 0,
                    details: 0,
                    comment: 0,
                    parentWithdrawalId: 0,
                    originalAmount: 0,
                    method: 0,
                    // cc
                    cardTypeId: 0,
                    cardTypeName: 0,
                    last4: 0,
                    isOwner: 0,
                    isApproved: 0,
                    // bank
                    swiftCode: 0,
                    bankAccount: 0,
                    beneficiary: 0,
                    // bank additional
                    bankName: 0,
                    branch: 0,
                    bankAddress: 0,
                    bankCountryName: 0
                };

                return withdrawalRow;
            }

            self.selectedWithdrawalId = ko.observable(0);

            self.withdrawals = ko.observableArray([]);

            self.selectedWithdrawal = ko.pureComputed(function () {
                return self.withdrawals().find(function (w) {
                    return w.withdrawalId === self.selectedWithdrawalId();
                });
            });

            function onGetWithdrawals(withdrawals) {
                var arr = [];

                withdrawals.forEach(function (withdrawal) {
                    var withdrawalRow = createWithdrawalRow();

                    withdrawalRow.serverModel = withdrawal;

                    withdrawalRow.withdrawalId = withdrawal.WithdrawalId;
                    withdrawalRow.status = setWithdrawalStatus(withdrawal.Status);
                    withdrawalRow.requestDate = formatDate(withdrawal.RequestDate);
                    withdrawalRow.amount = withdrawal.Amount;
                    withdrawalRow.currency = withdrawal.Currency;
                    withdrawalRow.details = withdrawal.Details;
                    withdrawalRow.comment = withdrawal.Comments;
                    withdrawalRow.method = withdrawal.Method;
                    withdrawalRow.parentWithdrawalId = withdrawal.ParentWithdrawalId;
                    withdrawalRow.originalAmount = withdrawal.OriginalAmount;
                    // cc
                    withdrawalRow.cardTypeId = withdrawal.CardTypeId;
                    withdrawalRow.cardTypeName = withdrawal.CardTypeName;
                    withdrawalRow.last4 = withdrawal.Last4;
                    withdrawalRow.isOwner = formatBoolian(withdrawal.IsOwner);
                    withdrawalRow.isApproved = formatBoolian(withdrawal.IsApproved);
                    // bank
                    withdrawalRow.swiftCode = withdrawal.SwiftCode;
                    withdrawalRow.bankAccount = withdrawal.BankAccount;
                    withdrawalRow.beneficiary = withdrawal.Beneficiary;

                    // bank additional
                    withdrawalRow.bankName = withdrawal.BankName;
                    withdrawalRow.branch = withdrawal.Branch;
                    withdrawalRow.bankAddress = withdrawal.BankAddress;
                    withdrawalRow.bankCountryName = withdrawal.BankCountryName;

                    arr.push(withdrawalRow);
                });

                self.withdrawals(arr);
                self.selectedWithdrawalId(params.withdrawalId);
            }

            dalWithdrawalAutomation.getWithdrawals(params.withdrawalId, onGetWithdrawals);

            self.refreshWithdrawals = function () {
                dalWithdrawalAutomation.getWithdrawals(params.withdrawalId, onGetWithdrawals);
            };

            self.refreshWithdrawal = function (withdrawal) {
                var item = withdrawal;

                if (ko.isObservable(withdrawal)) {
                    item = withdrawal();
                }

                var index = self.withdrawals.indexOf(item);

                if (index >= 0) {
                    self.withdrawals.splice(index, 1);
                    self.withdrawals.splice(index, 0, item);
                }
            };

            self.dispose = function () {
                self.selectedWithdrawal.dispose();
            };

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
/*eslint-enable no-alert, no-confirm */
