define(
    'deviceviewmodels/ClosedDealsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Deals/ClosedDealsModule',
        'devicemanagers/ViewModelsManager',
        'configuration/initconfiguration',
        'Dictionary',
        'StateObject!Positions',
        'managers/PrintExportManager'
    ],
    function (require) {
        var koComponentViewModel = require('helpers/KoComponentViewModel'),
            ko = require('knockout'),
            general = require('handlers/general'),
            closedDealsModule = require('viewmodels/Deals/ClosedDealsModule'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            initConfiguration = require('configuration/initconfiguration').ClosedDealsConfiguration,
            dictionary = require('Dictionary'),
            positionsCache = require('StateObject!Positions'),
            printExportManager = require('managers/PrintExportManager');

        var ClosedDealsViewModel = general.extendClass(koComponentViewModel, function ClosedDealsViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data, // inherited from KoComponentViewModel
                subscribers = [];

            function init(settings) {
                parent.init.call(self, settings);

                if (!settings.isHeaderComponent) {
                    setObservables();
                    setSubscribers();
                    initExport();
                }

                closedDealsModule.ApplyFilter();
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
                self.subscribeTo(closedDealsModule.DataSet.HasRecords, monitorData);

                monitorData(closedDealsModule.DataSet.HasRecords());
            }

            function monitorData(hasData) {
                ko.postbox.publish("printableDataAvailable", {
                    dataAvailable: hasData,
                    viewType: viewModelsManager.VManager.ActiveFormType(),
                    viewModel: 'ClosedDealsViewModel'
                });
            }

            function getOFHParams(closedDeal) {
                var titleKey = dictionary.ValueIsEmpty('FinanceAdjustHistoryCosts', 'dialogsTitles') ? 'FinanceAdjustHistory' : 'FinanceAdjustHistoryCosts',
                    options = {
                        title: String.format(dictionary.GetItem(titleKey, 'dialogsTitles', ' '), closedDeal.positionNumber)
                    },
                    args = {
                        posNum: closedDeal.positionNumber
                    };

                if (general.isEmptyValue(closedDeal.valueDate)) {
                    args.fromDate = closedDeal.positionStart;
                    args.instrumentId = closedDeal.instrumentID;
                    args.closedDate = closedDeal.executionTime;
                    args.showCosts = true;
                }

                return {
                    options: options,
                    args: args
                }
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
                model: closedDealsModule,
                scrollMaxVisible: initConfiguration.scrollMaxVisible,
                GetOvernightFinancingHistoryParams: getOFHParams,
                IsPrintingNow: printExportManager.IsWorkingNow
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ClosedDealsViewModel();

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