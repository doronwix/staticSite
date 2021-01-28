define(
    'deviceviewmodels/PriceAlertsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Limits/PriceAlertsModule',
        'managers/viewsmanager',
        'viewmodels/dialogs/DialogViewModel',
        'managers/PrintExportManager',
        'configuration/initconfiguration',
        'initdatamanagers/InstrumentsManager',
        'initdatamanagers/Customer',
        'Dictionary',
        'devicemanagers/AlertsManager',
        'modules/permissionsmodule'
    ],
    function PriceAlertsDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            priceAlertsModule = require('viewmodels/Limits/PriceAlertsModule'),
            ViewsManager = require('managers/viewsmanager'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            customer = require('initdatamanagers/Customer'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary'),
            permissionsModule = require('modules/permissionsmodule');

        var PriceAlertsViewModel = general.extendClass(KoComponentViewModel, function PriceAlertsClass() {
            var self = this,
                parent = this.parent; // inherited from KoComponentViewModelz,

            function init(params) {
                parent.init.call(self, params);

                if (!params.isHeaderComponent) {
                    initExport();
                }
            }

            function dispose() {
                parent.dispose.call(self);
            }

            function initExport() {
                self.subscribeAndNotify(priceAlertsModule.HasRecords, monitorData);
            }

            function monitorData(hasData) {
                ko.postbox.publish('printableDataAvailable', {
                    dataAvailable: hasData,
                    viewType: ViewsManager.ActiveFormType(),
                    viewModel: 'PriceAlertsViewModel'
                });
            }

            var openTransactionSwitcherDialog = function (transactionParameters) {
                var dialogClass = 'deal-slip' + (customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised) ? ' revised-slip' : '');

                DialogViewModel.open(eDialog.TransactionSwitcher, {
                    title: '',
                    customTitle: 'TransactionDropDown',
                    width: 700,
                    persistent: false,
                    dialogClass: dialogClass
                }, eViewTypes.vTransactionSwitcher, transactionParameters);
            };

            var openNewDeal = function (instrumentId, orderDir, tab) {
                if (!permissionsModule.CheckPermissions('addEditRemovePriceAlert')) {
                    alertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, dictionary.GetItem('Forbidden'), null);
                    alertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                    return;
                }

                var isStock = instrumentsManager.IsInstrumentStock(instrumentId);

                if (isStock) {
                    orderDir = eOrderDir.None;
                }

                var newDealParameters = {
                    'instrumentId': instrumentId,
                    'orderDir': orderDir,
                    'tab': tab,
                    'transactionType': eTransactionSwitcher.NewDeal
                };

                openTransactionSwitcherDialog(newDealParameters);
            };

            var openNewPriceAlert = function (instrumentId, orderDir, tab) {
                if (!permissionsModule.CheckPermissions('addEditRemovePriceAlert')) {
                    alertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, dictionary.GetItem('Forbidden'), null);
                    alertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                    return;
                }

                if (general.isNullOrUndefined(instrumentId)) {
                    instrumentId = instrumentsManager.GetUserDefaultInstrumentId();
                }

                var dialogClass = 'deal-slip' + (customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised) ? ' revised-slip' : ''),
                    newPriceAlertParameters = {
                        'instrumentId': instrumentId,
                        'orderDir': orderDir,
                        'tab': tab,
                        'transactionType': eTransactionSwitcher.NewPriceAlert
                    };

                DialogViewModel.open(eDialog.NewPriceAlert, {
                    title: '',
                    customTitle: 'TransactionDropDown',
                    width: 700,
                    persistent: false,
                    dialogClass: dialogClass
                }, eViewTypes.vNewPriceAlert, newPriceAlertParameters);
            };

            return {
                init: init,
                dispose: dispose,
                model: priceAlertsModule,
                openNewDeal: openNewDeal,
                openNewPriceAlert: openNewPriceAlert
            };
        });

        var createViewModel = function (params) {
            var viewModel = new PriceAlertsViewModel();
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
