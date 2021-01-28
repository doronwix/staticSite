define(
    'viewmodels/Deals/InstrumentInfoViewModel',
    [
        'require',
        'knockout',
        'Q',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'initdatamanagers/InstrumentsManager',
        'initdatamanagers/Customer',
        'dataaccess/dalInstruments',
        'dataaccess/dalorder',
        'modules/BuilderForInBetweenQuote',
        'StateObject!Transaction',
        'StateObject!ScheduleGroup',
        'FxNet/LogicLayer/Deal/DealMarginCalculator',
        'FxNet/LogicLayer/Deal/DealAmountLabel',
        'FxNet/LogicLayer/Deal/InstrumentInfoLines'
    ],
    function InstrumentInfoDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Q = require('Q'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            customer = require('initdatamanagers/Customer'),
            dalInstruments = require('dataaccess/dalInstruments'),
            dalOrders = require('dataaccess/dalorder'),
            BuilderForInBetweenQuote = require('modules/BuilderForInBetweenQuote'),
            stateObject = require('StateObject!Transaction'),
            scheduleGroupStateObject = require('StateObject!ScheduleGroup'),
            dealMarginCalculator = require('FxNet/LogicLayer/Deal/DealMarginCalculator'),
            DealAmountLabel = require('FxNet/LogicLayer/Deal/DealAmountLabel'),
            instrumentInfoLines = require('FxNet/LogicLayer/Deal/InstrumentInfoLines');

        var InstrumentInfoViewModel = general.extendClass(KoComponentViewModel, function InstrumentInfoClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                usdId = 47,
                cachedOvernightFinancingKey = 'cachedOvernightFinancing',
                newDealData = stateObject.getAll(),
                minDealAmountPrefixKey = 'minDealAmountLabel_',
                maxDealAmountPrefixKey = 'maxDealAmountLabel_';

            function init() {
                data.isNotIslamicDealPermit = customer.prop.dealPermit != eDealPermit.Islamic;

                setObservables();
                setComputables();
                setSubscribers();

                setInBetweenRate();
                getDealMarginDetails();

                var currentInstrumentId = ko.utils.unwrapObservable(newDealData.selectedInstrument);
                updateObservables(currentInstrumentId);
            }

            function setObservables() {
                data.principalOfLong = ko.observable();
                data.principalOfShort = ko.observable();
                data.conversionRate = ko.observable();

                var symbolName = ko.utils.unwrapObservable(newDealData.customerSymbolName);
                data.currencySymbol = ko.observable(symbolName);
                data.customerSymbolId = ko.observable(customer.prop.baseCcyId());

                data.dividendDate = ko.observable('');
                data.dividendAmount = ko.observable('');
                data.displayToleranceInSecondTable = ko.observable(false);
                data.otherInstrumentSymbol = ko.observable();
                data.rolloverDate = ko.observable('');
                data.marketPriceTolerance = ko.observable('');
                data.overnightFinancingPercentageSell = ko.observable();
                data.overnightFinancingPercentageBuy = ko.observable();
                data.principalOfLongPercentage = ko.observable();
                data.principalOfShortPercentage = ko.observable();
                data.overnightFinancingTimeGMT = ko.observable('');
                data.weekendFinancingType = ko.observable(eWeekendFinancingTypes.None);
                data.maxDealAmountLabel = ko.observable('');
                data.minDealAmountLabel = ko.observable('');

                data.requiredMargin = ko.observable('');
                data.offHoursRequiredMargin = ko.observable('');
                data.maximumLeverage = ko.observable('');
                data.pipValue = ko.observable('');
                data.maxAmount = ko.observable('');
                data.minAmount = ko.observable('');
                data.displayOffHoursRequiredMargin = ko.observable(false);
                data.isStock = ko.observable(false);
            }

            function setInBetweenRate() {
                BuilderForInBetweenQuote
                    .GetInBetweenQuote(usdId, customer.prop.baseCcyId())
                    .then(function onInBetweenQuoteReceived(response) {
                        data.conversionRate(response.bid());
                    })
                    .done();
            }

            function updateObservables(instrumentId) {
                var instrument = instrumentsManager.GetInstrument(instrumentId);

                if (instrument) {
                    data.dividendDate(instrument.getInstrumentDividendDate());
                    data.dividendAmount(instrument.getInstrumentDividendAmount());
                    data.otherInstrumentSymbol(instrument.otherSymbol);
                    data.rolloverDate(instrument.getInstrumentRolloverDate());
                    data.pipValue(1 / Math.pow(10, instrument.PipDigit));
                    data.isStock(instrument.isStock);

                    var priceTolerance = instrument.marketPriceTolerance * data.pipValue();
                    data.marketPriceTolerance(priceTolerance == 0 ? 0 : Format.toRate(priceTolerance, true, instrumentId));

                    updatePositionsInTable();

                    instrumentsManager
                        .GetUpdatedInstrumentWithDealMinMaxAmounts(instrumentId)
                        .then(function onUpdatedInstrumentsReceived(response) {
                            data.minAmount(Format.formatDealAmount(response.dealMinMaxAmounts[0]));
                            data.maxAmount(Format.formatDealAmount(response.dealMinMaxAmounts[1]));
                        })
                        .done();

                    var maxResult = DealAmountLabel.Translate(instrument, maxDealAmountPrefixKey);
                    data.maxDealAmountLabel(maxResult.label);

                    var minResult = DealAmountLabel.Translate(instrument, minDealAmountPrefixKey);
                    data.minDealAmountLabel(minResult.label);
                }
            }

            function setSubscribers() {
                self.subscribeTo(newDealData.selectedInstrument, function onInstrumentChanged(instrumentId) {
                    updateObservables(instrumentId);
                    getDealMarginDetails();
                });
            }

            function hasValuesOverNightFinancing(cachedOvernightFinancing) {
                return (
                    cachedOvernightFinancing &&
                    cachedOvernightFinancing.long &&
                    cachedOvernightFinancing.short &&
                    cachedOvernightFinancing.longPercentage &&
                    cachedOvernightFinancing.shortPercentage &&
                    (cachedOvernightFinancing.time - new Date().getTime() <= 3600000)
                );
            }

            function setCachedOverNightFinancing(overnightFinancingItem, instrumentKey) {
                if (general.isNullOrUndefined(overnightFinancingItem)) {
                    return;
                }

                var cachedOvernightFinancing = null;

                if (!stateObject.containsKey(cachedOvernightFinancingKey)) {
                    cachedOvernightFinancing = {};
                    cachedOvernightFinancing[instrumentKey] = overnightFinancingItem;
                    stateObject.set(cachedOvernightFinancingKey, cachedOvernightFinancing);
                } else {
                    cachedOvernightFinancing = stateObject.get(cachedOvernightFinancingKey);
                    cachedOvernightFinancing[instrumentKey] = overnightFinancingItem;
                    stateObject.update(cachedOvernightFinancingKey, cachedOvernightFinancing);
                }
            }

            function getOvernightFinancingPrincipal(dealAmount, instrumentId) {
                var defer = Q.defer();
                var cachedOvernightFinancingItem = null;
                var instrumentKey = instrumentId + '_' + dealAmount;

                if (stateObject.containsKey(cachedOvernightFinancingKey)) {
                    var cachedOvernightFinancing = stateObject.get(cachedOvernightFinancingKey);
                    cachedOvernightFinancingItem = cachedOvernightFinancing && cachedOvernightFinancing[instrumentKey];
                }

                if (hasValuesOverNightFinancing(cachedOvernightFinancingItem)) {
                    defer.resolve(cachedOvernightFinancingItem);
                }
                else {
                    dalOrders
                        .GetOvernightFinancing(instrumentId, dealAmount)
                        .then(function onOvernightFinancingReceived(result) {
                            // update cache
                            var overnightFinancing = {
                                long: result[0].Result.LongOvernightFinancing,
                                short: result[0].Result.ShortOvernightFinancing,
                                longPercentage: result[0].Result.LongOvernightFinancingPercentage,
                                shortPercentage: result[0].Result.ShortOvernightFinancingPercentage,
                                time: new Date().getTime()
                            }

                            setCachedOverNightFinancing(overnightFinancing, instrumentKey);
                            defer.resolve(overnightFinancing);
                        })
                        .done();
                }

                return defer.promise;
            }

            var setComputables = function () {
                data.principal = self.createComputed(function computePrincipal() {
                    var instrument = instrumentsManager.GetInstrument(newDealData.selectedInstrument()),
                        dealAmount = general.toNumeric(newDealData.selectedDealAmount());

                    if (!general.isDefinedType(instrument) || !(data.isNotIslamicDealPermit && instrument.isOvernightFinancing()) || !general.isDefinedType(dealAmount) || isNaN(dealAmount)) {
                        return;
                    }

                    getOvernightFinancingPrincipal(dealAmount, instrument.id)
                        .then(function onOvernightFinancingPrincipalReceived(result) {
                            data.principalOfLong(result.long);
                            data.principalOfShort(result.short);
                            data.principalOfLongPercentage(result.longPercentage);
                            data.principalOfShortPercentage(result.shortPercentage);
                        })
                        .done();
                }, self, false);

                data.overnightFinancingLong = self.createComputed(function computeOvernightFinancingLong() {
                    var value;

                    if (!general.isDefinedType(data.principalOfLong())) {
                        return '';
                    }

                    value = data.principalOfLong();

                    if (data.conversionRate() > 10) {
                        value = parseFloat(value.toFixed(0)) === -0 ? 0 : parseFloat(value.toFixed(0));
                    } else {
                        value = parseFloat(value.toFixed(2)) === -0 ? 0 : parseFloat(value.toFixed(2));
                    }

                    return value;
                });

                data.overnightFinancingShort = self.createComputed(function computeOvernightFinancingShort() {
                    var value;

                    if (!general.isDefinedType(data.principalOfShort())) {
                        return '';
                    }

                    value = data.principalOfShort();

                    if (data.conversionRate() > 10) {
                        value = parseFloat(value.toFixed(0)) === -0 ? 0 : parseFloat(value.toFixed(0));
                    } else {
                        value = parseFloat(value.toFixed(2)) === -0 ? 0 : parseFloat(value.toFixed(2));
                    }

                    return value;
                });

                data.overnightFinancingPercentageSell = self.createComputed(function computeOvernightFinancingPercentageSell() {
                    var instrument = instrumentsManager.GetInstrument(newDealData.selectedInstrument()),
                        dealAmount = general.toNumeric(newDealData.selectedDealAmount());

                    if (!general.isDefinedType(instrument) || !general.isDefinedType(dealAmount)) {
                        return;
                    }

                    return Format.toPercentWithPrecision(data.principalOfShortPercentage(), 5);
                });

                data.overnightFinancingPercentageBuy = self.createComputed(function computeOvernightFinancingPercentageBuy() {
                    var instrument = instrumentsManager.GetInstrument(newDealData.selectedInstrument()),
                        dealAmount = general.toNumeric(newDealData.selectedDealAmount());

                    if (!general.isDefinedType(instrument) || !general.isDefinedType(dealAmount)) {
                        return;
                    }

                    return Format.toPercentWithPrecision(data.principalOfLongPercentage(), 5);
                });

                data.OfCalculationTimeGMT = self.createComputed(function computeOfCalculationTimeGMT() {
                    var instrument = instrumentsManager.GetInstrument(newDealData.selectedInstrument()),
                        scheduleGroupGMTCloseTime,
                        GMTCloseTime;

                    dalInstruments.GetScheduleGroup(instrument.id)
                        .then(function onGetScheduleGroupReceived(result) {
                            scheduleGroupGMTCloseTime = result[0].GMTCloseTime;
                            GMTCloseTime = scheduleGroupGMTCloseTime.split(' ')[1];
                            data.overnightFinancingTimeGMT(GMTCloseTime);
                            data.weekendFinancingType(result[0].WeekendFinancingType);
                            updatePositionsInTable();
                            setScheduleGroupData(result[0]);
                        })
                        .done();
                }, self, false);

                data.pipWorth = self.createComputed(function computePipWorth() {
                    var instrument = instrumentsManager.GetInstrument(newDealData.selectedInstrument());
                    var value = dealMarginCalculator.PipWorth(general.toNumeric(newDealData.selectedDealAmount()),
                        instrument.PipDigit, newDealData.quoteForOtherCcyToAccountCcy(), data.conversionRate());

                    return value;
                }).extend({ empty: true });

                data.infoLines = self.createComputed(function computeInfoLines() {
                    var instrument = instrumentsManager.GetInstrument(newDealData.selectedInstrument());

                    return instrumentInfoLines.GetInfoLines(instrument, data);
                });
            };

            function setScheduleGroupData(receivedData) {
                scheduleGroupStateObject.update('ScheduleGroupData', receivedData);
            }

            function updatePositionsInTable() {
                if (!general.isNullOrUndefined(customer.prop.maintenanceMarginPercentage) && customer.prop.maintenanceMarginPercentage > 0) {
                    data.displayOffHoursRequiredMargin(false);
                } else {
                    data.displayOffHoursRequiredMargin(true);
                }
            }

            function getDealMarginDetails() {
                var offHoursRequiredMarginResult,
                    maximumLeverageResult = 0,
                    maxNormalMargin,
                    requiredMarginResult;

                dalOrders
                    .GetDealMarginDetails(newDealData.selectedInstrument())
                    .then(function onDealMarginDetailsReceived(result) {
                        maxNormalMargin = result[0].Result.MaxNormalMargin;
                        requiredMarginResult = maxNormalMargin * 100;
                        offHoursRequiredMarginResult = result[0].Result.MaxOffHoursMargin * 100;

                        if (maxNormalMargin != 0) {
                            maximumLeverageResult = 1 / maxNormalMargin;
                        }

                        data.requiredMargin(parseFloat(requiredMarginResult.toFixed(2)) + '%');
                        data.offHoursRequiredMargin(parseFloat(offHoursRequiredMarginResult.toFixed(2)) + '%');
                        data.maximumLeverage('1:' + maximumLeverageResult.toFixed(0));
                    })
                    .done();
            }

            function dispose() {
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                NewDealData: newDealData
            };
        });

        var createViewModel = function (params) {
            var viewModel = new InstrumentInfoViewModel(params);
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