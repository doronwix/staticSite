define(
    'deviceviewmodels/CloseDealViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalorder',
        'configuration/initconfiguration',
        'cachemanagers/dealsmanager',
        'devicemanagers/AlertsManager',
        'Dictionary',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'viewmodels/Deals/CloseDealBaseViewModel',
        'StateObject!Transaction'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalOrders = require('dataaccess/dalorder'),
            settings = require('configuration/initconfiguration').CloseDealSettingsConfiguration,
            AlertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            CloseDealBaseViewModel = require('viewmodels/Deals/CloseDealBaseViewModel'),
            stateObject = require('StateObject!Transaction'),
            StatesManager = require('devicemanagers/StatesManager'),
            dealsManager = require('cachemanagers/dealsmanager'),
            viewsManager = require('managers/viewsmanager');

        var CloseDealViewModel = general.extendClass(CloseDealBaseViewModel, function CloseDealViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from CloseDealBaseViewModel
                data = this.Data, // inherited from CloseDealBaseViewModel
                baseOrder = parent.BaseOrder,
                LS = StorageFactory(StorageFactory.eStorageType.local);

            function init(customSettings) {
                stateObject.update(eStateObjectTopics.ReadyForUse, false);
                parent.init.call(self, customSettings);
                data.chartTransactionEnabled(true);

                setObservables();
                stateObject.update(eStateObjectTopics.ReadyForUse, true);
                stateObject.update('PageName', data.PageName);
            }

            function setObservables() {
                data.showTools = ko.observable(true);
                data.isAdditionalInfoExpanded = ko.observable(false);
                data.isChartFullScrn = stateObject.set('isChartFullScrn', ko.observable(false));
            }

            function onCancelCloseDealReturn() {
                data.isProcessing(false);
            }

            function closeDealAfterConfirmation() {
                data.isProcessing(true);
                return dalOrders.CloseDeals([data.SelectedPosition()], onCloseDealReturn);
            }

            function closeDeal() {
                if (!data.CloseDealReady()) {
                    return;
                }

                if (StatesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    return;
                }

                function showConfirmationAlert() {
                    var properties = {
                        selectedData: [data.SelectedPosition()],
                        confirmationCloseDeal: closeDealAfterConfirmation
                    };

                    AlertsManager.UpdateAlert(AlertTypes.MultipleDealsClosedConfirmation,
                        dictionary.GetItem('CloseDealRequest'),
                        dictionary.GetItem('closeSingleDealAlert'),
                        [], properties);

                    AlertsManager.PopAlert(AlertTypes.MultipleDealsClosedConfirmation);
                }

                if (LS.getItem('hideConfCloseDeals') == 'true') {
                    closeDealAfterConfirmation();
                } else {
                    showConfirmationAlert();
                }
            }

            function onCloseDealReturn(result, callerId, requestData) {
                data.isProcessing(false);
                var instrument = InstrumentsManager.GetInstrument(data.selectedInstrument());

                if (instrument) {
                    baseOrder.OnActionReturn(result, callerId, instrument, { redirectToView: eForms.OpenDeals, requestData: requestData });
                }
            }

            function toggleAdditionalInfoExpanded() {
                data.isAdditionalInfoExpanded(!data.isAdditionalInfoExpanded());
            }

            function dispose() {
                data.chartTransactionEnabled(false);

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                CloseDeal: closeDeal,
                OnCloseDealReturn: onCloseDealReturn,
                OnCancelCloseDealReturn: onCancelCloseDealReturn,
                ToggleAdditionalInfoExpanded: toggleAdditionalInfoExpanded
            };
        });

        function handleInvalidViewModel() {
            AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert,
                dictionary.GetItem("GenericAlert"),
                dictionary.GetItem('OrderError8'),
                null,
                { redirectToView: eForms.OpenDeals });
            AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
        }

        function validateViewModel() {
            var selectedPosition = dealsManager.Deals.GetItem(viewsManager.GetViewArgsByKeyName(eViewTypes.vCloseDeal, 'orderId'));
            return selectedPosition !== null && typeof selectedPosition !== 'undefined';
        }

        function createViewModel() {
            if (!validateViewModel()) {
                handleInvalidViewModel();
                return { _valid: false };
            }

            var viewModel = new CloseDealViewModel();

            viewModel.init(settings);

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
