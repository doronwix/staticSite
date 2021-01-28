define(
    'deviceviewmodels/BackOffice/OpenDealsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/BackOffice/Deals/OpenDealsModule',
        'managers/viewsmanager',
        'Dictionary',
        'viewmodels/dialogs/DialogViewModel',
        'managers/PrintExportManager',
        'StateObject!Positions',
        'LoadDictionaryContent!datagrids_opendeals'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            Model = require('viewmodels/BackOffice/Deals/OpenDealsModule'),
            ViewsManager = require('managers/viewsmanager'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            Dictionary = require('Dictionary'),
            printExportManager = require('managers/PrintExportManager'),
            positionsCache = require('StateObject!Positions');

        var ExtendedOpenDealsViewModel = general.extendClass(KoComponentViewModel, function ExtendedOpenDealsViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data,
                subscribers = [];

            function init(settings) {
                parent.init.call(self, settings);
                if (settings.isHeaderComponent) {
                    return;
                }

                setObservables();
                setSubscribers();
                initExport();
            }

            function setObservables() {
                var ofhPositionNumber = positionsCache.set('ofhPositionNumber', null),
                    plPositionNumber = positionsCache.set('plPositionNumber', null);

                data.selectedOFHPositionNumber = ko.observable(ofhPositionNumber);
                data.selectedPLPositionNumber = ko.observable(plPositionNumber);
            }

            function setSubscribers() {
                subscribers.push({ dispose: positionsCache.subscribe("ofhPositionNumber", selectedOFHPositionNumberUpdater) });
                subscribers.push({ dispose: positionsCache.subscribe("plPositionNumber", selectedPLPositionNumberUpdater) });
            }

            function selectedOFHPositionNumberUpdater(ofhPositionNumber) {
                data.selectedOFHPositionNumber(ofhPositionNumber);
            }

            function selectedPLPositionNumberUpdater(plPositionNumber) {
                data.selectedPLPositionNumber(plPositionNumber);
            }

            function initExport() {
                self.subscribeTo(Model.HasRecords, monitorData);

                monitorData(Model.HasRecords());
            }

            function monitorData(hasData) {
                ko.postbox.publish("printableDataAvailable", {
                    dataAvailable: hasData,
                    viewType: ViewsManager.ActiveFormType(),
                    viewModel: 'ExtendedOpenDealsViewModel'
                });
            }

            function closeDeal(position) {
                if (Model.FlagsState.isMarketClosed() ||
                    !window.componentsLoaded() ||
                    printExportManager.IsWorkingNow()) {
                    return;
                }

                DialogViewModel.open(eDialog.CloseDeal,
                    {
                        title: Dictionary.GetItem('CloseDeal','dialogsTitles',' ') + ':',
                        customTitle: 'CloseDealPosNum',
                        width: 555,
                        persistent: false,
                        dialogClass: 'deal-slip closeDeal'
                    },
                    eViewTypes.vCloseDeal,
                    {
                        orderId: position.orderID,
                        isStartNavigator: false
                    }
                );
            }

            function dispose() {
                positionsCache.unset('ofhPositionNumber');
                positionsCache.unset('plPositionNumber');

                while (subscribers.length > 0) {
                    subscribers.pop().dispose();
                }

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                model: Model,
                closeDeal: closeDeal
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ExtendedOpenDealsViewModel();

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