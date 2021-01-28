define(
    'viewmodels/BackOffice/Deals/OpenDealsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalTransactions',
        'deviceviewmodels/BaseOrder',
        'viewmodels/Deals/OpenDealsModule',
        'configuration/initconfiguration',
        'global/storagefactory'
    ],
    function OpenDealsDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalTransactions = require('dataaccess/dalTransactions'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            baseOrder = new BaseOrder(),
            openDealsGridSettings = require('configuration/initconfiguration').OpenDealsConfiguration,
            openDealsModule = require('viewmodels/Deals/OpenDealsModule'),
            storageFactory = require('global/storagefactory'),
            OpenDealsModule = new openDealsModule();

        var LS = storageFactory(storageFactory.eStorageType.local);

        OpenDealsModule.Init(openDealsGridSettings);

        var updateProcessingObservables = function (result, callerID, args) {
            baseOrder.OnActionReturn(result, callerID, null, args);
            OpenDealsModule.OnCloseDealsEnable(true);
        };

        var onCloseDealsReturn = function (result, callerID, requestData) {
            OpenDealsModule.Positions.IsProcessing(false);
            updateProcessingObservables(result, callerID, general.extendType({ isCloseMultipleDealsCall: true }, { requestData: requestData }));
        };

        var closeDealAfterConfirmation = function () {
            var closeDealsConfig = {
                hasUnwrappedItems: false,
                failCallback: function () {
                },
                forceRetry: true
            };

            if (OpenDealsModule.Positions.CheckedItems().length > 0) {
                return dalTransactions.CloseDeals(OpenDealsModule.Positions.CheckedItems(), onCloseDealsReturn, closeDealsConfig);
            }

            return ErrorManager.onError("closeDealAfterConfirmation", "trying to close empty list of positions", eErrorSeverity.low);
        };

        var showMultipleDealsConfirmationAlert = function () {
            var properties = {
                selectedData: OpenDealsModule.Positions.CheckedItems(),
                confirmationCloseDeal: closeDealAfterConfirmation
            };

            AlertsManager.UpdateAlert(AlertTypes.MultipleDealsClosedConfirmation, this.title, this.body, [], properties);
            AlertsManager.PopAlert(AlertTypes.MultipleDealsClosedConfirmation);
        };

        OpenDealsModule.Positions.CheckAll = ko.computed({
            read: function () {
                var firstUnchecked = ko.utils.arrayFirst(OpenDealsModule.OpenDeals(),
                    function (item) {
                        return item.isChecked() === false;
                    });

                if (general.isEmptyType(firstUnchecked) && OpenDealsModule.OpenDeals().length > 0) {
                    return true;
                }

                return false;
            },
            write: function (value) {
                ko.utils.arrayForEach(OpenDealsModule.OpenDeals(), function (item) {
                    item.isChecked(value);
                });
            },
            owner: OpenDealsModule.Positions
        });


        OpenDealsModule.Positions.CloseSelected = function () {
            if (!OpenDealsModule.Positions.HasSelections()) {
                return;
            }

            if (LS.getItem('hideConfCloseDeals') == 'true') {
                closeDealAfterConfirmation();
            }
            else {
                showMultipleDealsConfirmationAlert();
            }
        };

        return OpenDealsModule;
    }
);
