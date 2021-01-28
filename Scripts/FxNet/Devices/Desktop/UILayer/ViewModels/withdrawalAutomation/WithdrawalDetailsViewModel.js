define(
    'deviceviewmodels/withdrawalautomation/withdrawaldetailsviewmodel',
    [
        'require',
        'knockout'
    ],
    function (require) {
        var ko = require('knockout');

        var createViewModel = function (params) {
            var self = {};

            self.selectedWithdrawal = params.selectedWithdrawal;

            self.expanded = ko.observable(false);

            self.clickExpand = function () {
                self.expanded(true);
            };

            self.clickLess = function () {
                self.expanded(false);
            };

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);