/*eslint-disable no-alert, no-confirm */
define(
    "deviceviewmodels/withdrawalautomation/withdrawalmethodviewmodel",
    [
        "require",
        "knockout",
        'handlers/general',
        "dataaccess/dalWithdrawalAutomation"
    ],
    function (require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            dalWithdrawalAutomation = require("dataaccess/dalWithdrawalAutomation");

        var createViewModel = function (params) {
            var self = {};

            self.isSpinnerOn = ko.observable(false);
            self.spinnerText = ko.observable('');
            self.selectedWithdrawal = params.selectedWithdrawal;
            self.selectedMethod = ko.observable();

            var selectedMethodInit = ko.computed(function () {
                if (self.selectedWithdrawal() && self.selectedWithdrawal().withdrawalId > 0) {
                    self.selectedMethod(self.selectedWithdrawal().method);
                }
            });

            self.methods = [
                { method: "Reset", value: 0 },
                { method: "Refundable", value: 1 },
                { method: "BankTransfer", value: 2 },
                { method: "CCTransfer", value: 3 },
                { method: "Ewallet", value: 4 }
            ];

            self.applyMethodClick = function () {
                turnSpinner(true);

                dalWithdrawalAutomation.saveWithdrawalMethod({
                    WithdrawalId: self.selectedWithdrawal().withdrawalId,
                    Method: self.selectedMethod()
                }, onSaveMethodComplete);
            };

            function turnSpinner(on) {
                self.isSpinnerOn(on);
                self.spinnerText(on ? "Processing your request..." : "");
            }

            function onSaveMethodComplete(response) {
                turnSpinner(false);

                if (response.Status !== 1) {
                    window.alert("Internal Server Error Occurred, Please try again");
                    return;
                }

                if (!general.isEmptyValue(response.Result)) {
                    if (response.Result) {
                        window.alert("Method saved!");
                    }
                    else {
                        window.alert("Could not save method! Please try again..");
                    }
                }

                params.refreshWithdrawals();
            }

            self.dispose = function () {
                selectedMethodInit.dispose();
            };

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
/*eslint-enable no-alert, no-confirm */
