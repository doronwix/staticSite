define(
    'deviceviewmodels/BackOffice/CloseDealViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalTransactions',
        'configuration/initconfiguration',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/StatesManager',
        'StateObject!Transaction',
        'viewmodels/Deals/CloseDealBaseViewModel',
        'LoadDictionaryContent!deals_CloseDeal',
        'calculators/LimitValuesCalculator'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalTransactions = require('dataaccess/dalTransactions'),
            settings = require('configuration/initconfiguration').ExtendedCloseDealSettingsConfiguration,
            CloseDealBaseViewModel = require('viewmodels/Deals/CloseDealBaseViewModel'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),

            StatesManager = require('devicemanagers/StatesManager'),
            stateObject = require('StateObject!Transaction'),
            LimitValuesCalculator = require('calculators/LimitValuesCalculator');

        var ExtendedCloseDealViewModel = general.extendClass(
            CloseDealBaseViewModel,
            function ExtendedCloseDealViewModelClass() {
                var self = this,
                    parent = this.parent, // inherited from CloseDealBaseViewModel
                    data = this.Data, // inherited from CloseDealBaseViewModel
                    baseOrder = parent.BaseOrder;

                function init(customSettings) {
                    if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                        stateObject.set('stateObjectIsReadyDefer', Q.defer());
                    }

                    parent.init.call(self, customSettings);

                    setObservables();
                    setComputables();
                    setSubscribers();
                    setValidators();

                    stateObject.get('stateObjectIsReadyDefer').resolve();
                }

                function setObservables() {
                    data.extendedTradingEnabled = ko.observable(false);
                    data.extendedTradingRate = ko.observable(0);
                    data.extendedTradingPL = ko.observable(0);
                }

                function setComputables() {

                    data.CloseDealReady = self.createComputed(function () {
                        var isGuiContextAvailable = !data.isProcessing(),
                            isMarketClosed = general.isDefinedType(StatesManager.States.IsMarketClosed()) ? StatesManager.States.IsMarketClosed() : false,
                            isExtendedTradingRateValid = data.extendedTradingEnabled() ? data.extendedTradingRate() > 0 : true;

                        return !isMarketClosed && isGuiContextAvailable && data.HasPosition() && isExtendedTradingRateValid;
                    });
                }

                function setSubscribers() {
                    self.subscribeTo(data.SelectedPosition, function () {
                        enableExtendedTrading(false);
                    });

                    self.subscribeTo(data.extendedTradingRate, function () {
                        calculatePL();
                    });
                }

                function setValidators() {
                    data.extendedTradingRate.extend({
                        toNumericLength: {
                            ranges: [
                                { from: 0, to: Number.MAX_SAFE_INTEGER }
                            ],
                            isAllowNAValue: true
                        }
                    });
                }

                function closeDeal() {
                    if (!data.CloseDealReady()) {
                        return;
                    }

                    data.isProcessing(true);

                    var closeDealItem = [{
                        positionNumber: data.SelectedPosition().positionNumber,
                        spotRate: !data.extendedTradingEnabled() ?
                            data.SelectedPosition().spotRate : data.extendedTradingRate(),
                        fwPips: data.SelectedPosition().fwPips,
                        dealRate: data.SelectedPosition().dealRate,
                        instrumentID: data.SelectedPosition().instrumentID
                    }];

                    if (!data.quoteIsActive()) {
                        return closeDealRetry(closeDealItem, true);
                    }

                    dalTransactions.CloseDeals(closeDealItem, onCloseDealReturn, { failCallback: onCloseDealFail });
                }

                function closeDealRetry(requestData, rawData) {
                    data.isProcessing(true);

                    var closeDealsConfig = {
                        failCallback: onCloseDealFail,
                        hasUnwrappedItems: !rawData,
                        forceRetry: true
                    };

                    dalTransactions.CloseDeals(requestData, onCloseDealReturn, closeDealsConfig);
                }

                function onCloseDealReturn(result, callerId, requestData) {
                    data.isProcessing(false);
                    var instrument = instrumentsManager.GetInstrument(data.selectedInstrument());
                    var onActionReturnArgs = {
                        requestData: requestData,
                        tradingEnabledRetry: closeDealRetry
                    };

                    if (instrument) {
                        baseOrder.OnActionReturn(result, callerId, instrument, onActionReturnArgs);
                    }
                }

                function onCloseDealFail() {
                    data.isProcessing(false);
                }

                function enableExtendedTrading(enable) {
                    enable = enable ? enable : false;
                    data.extendedTradingEnabled(enable);
                    data.extendedTradingRate(enable ? Number(data.SelectedPosition().spotRate()) : 0);
                }

                function calculatePL() {
                    if (!data.extendedTradingEnabled()) {
                        return;
                    }

                    var customPL = LimitValuesCalculator.CalculateValuesFromRate(
                        data.SelectedPosition().dealRate,
                        data.SelectedPosition().dealRate,
                        data.extendedTradingRate(),
                        data.SelectedPosition().orderDir,
                        null,
                        data.SelectedPosition().dealAmount,
                        settings.rangeForPLCalculation,
                        data.quoteForOtherCcyToAccountCcy(),
                        data.SelectedPosition().instrumentID
                    );
                    data.extendedTradingPL(
                        customPL.hasOwnProperty('value') &&
                            typeof customPL.value === 'number' && customPL.value !== 0 ?
                            customPL.value.toFixed(2) : 0
                    );
                }

                return {
                    init: init,
                    Data: data,
                    CloseDeal: closeDeal,
                    EnableExtendedTrading: enableExtendedTrading
                };
            });

        var createViewModel = function () {
            var viewModel = new ExtendedCloseDealViewModel();
            viewModel.init(settings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);