define(
    'deviceviewmodels/AccountCardRecordsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/AccountCardRecordsBaseViewModel',
        'helpers/CustomKOBindings/InfiniteScrollBinding'
    ],
    function AccountCardRecordsDef(require) {
        var general = require('handlers/general'),
            AccountCardRecordsBaseViewModel = require('viewmodels/AccountCardRecordsBaseViewModel');

        var AccountCardRecordsViewModel = general.extendClass(AccountCardRecordsBaseViewModel, function AccountCardRecordsClass() {
            var self = this,
                parent = this.parent; // inherited from KoComponentViewModel

            function init(customSettings) {
                parent.init.call(self, customSettings);
            }

            function getNextBalance() {
                parent.GetNextBalance.call(self);
            }

            return {
                init: init,
                BalanceInfo: parent.BalanceInfo,
                GetNextBalance: getNextBalance,
                VisibleShowMore: parent.VisibleShowMore,
                DataSet: parent.DataSet,
                Filter: parent.Filter,
                EnableApplyButton: parent.enableApplyButton,
                HasRecords: parent.HasRecords,
                DsColumns: parent.DsColumns
            };
        });

        var createViewModel = function (params) {
            var viewModel = new AccountCardRecordsViewModel();

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
