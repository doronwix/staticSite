define(
    'deviceviewmodels/ContractRolloverViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/ContractRolloverBaseViewModel',
        'configuration/initconfiguration',
        'LoadDictionaryContent!deals_ContractRollover'
    ],
    function ContractRolloverViewModelDef(require) {
        var general = require('handlers/general'),
            contractRolloverBaseViewModel = require('viewmodels/ContractRolloverBaseViewModel'),
            initConfiguration = require("configuration/initconfiguration").ContractRolloverConfiguration;

        var ContractRolloverViewModel = general.extendClass(contractRolloverBaseViewModel, function ContractRolloverViewModelClass() {
            var parent = this.parent;

            return {
                init: parent.init,
                dispose: parent.dispose,
                Handlers: parent.handlers,
                Data: parent.Data,
                BalanceInfo: parent.BalanceInfo,
                DataSet: parent.DataSet,
                GetNextBalance: parent.GetNextBalance,
                VisibleShowMore: parent.VisibleShowMore,
                ScrollMaxVisible: initConfiguration.scrollMaxVisible
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
            },
            ContractRolloverViewModel: ContractRolloverViewModel
        };
    }
);
