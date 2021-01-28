define(
    'deviceviewmodels/ContractRolloverViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/ContractRolloverBaseViewModel',
        'helpers/CustomKOBindings/InfiniteScrollBinding',
        'LoadDictionaryContent!deals_ContractRollover'
    ],
    function ContractRolloverBaseDef(require) {
        var ContractRolloverBaseViewModel = require('viewmodels/ContractRolloverBaseViewModel'),
            general = require('handlers/general');

        var ContractRolloverViewModel = general.extendClass(ContractRolloverBaseViewModel, function ContractRolloverBaseClass() {
            var parent = this.parent;

            return {
                init: parent.init,
                dispose: parent.dispose,
                Data: parent.Data,
                BalanceInfo: parent.BalanceInfo,
                DataSet: parent.DataSet,
                GetNextBalance: parent.GetNextBalance,
                VisibleShowMore: parent.VisibleShowMore
            };
        });

        // params contains all data from NewDealSlipViewModel, it has been passed from component data binding
        var createViewModel = function (params) {
            var viewModel = new ContractRolloverViewModel(params);
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
