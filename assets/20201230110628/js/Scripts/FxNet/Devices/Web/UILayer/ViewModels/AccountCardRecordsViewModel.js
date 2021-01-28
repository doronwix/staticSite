define(
    'deviceviewmodels/AccountCardRecordsViewModel',
    [
        'handlers/general',
        'viewmodels/AccountCardRecordsBaseViewModel'
    ],
    function AccountCardRecordsDef(general, AccountCardRecordsBaseViewModel) {
        var AccountCardRecordsViewModel = general.extendClass(AccountCardRecordsBaseViewModel, function AccountCardRecordsClass() {
            var parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                handlers = {};

            return {
                init: parent.init,
                dispose: parent.dispose,
                Data: data,
                BalanceInfo: parent.BalanceInfo,
                Handlers: handlers,
                GetNextBalance: parent.GetNextBalance,
                VisibleShowMore: parent.VisibleShowMore,
                DataSet: parent.DataSet,
                Filter: parent.Filter,
                EnableApplyButton: parent.enableApplyButton,
                HasRecords: parent.HasRecords,
                DsColumns: parent.DsColumns
            };
        });

        var createViewModel = function () {
            var viewModel = new AccountCardRecordsViewModel();

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
