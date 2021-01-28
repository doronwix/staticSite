/* global eStartSpinFrom eViewTypes */
define(
    'viewmodels/limits/SetLimitsViewModel',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'Dictionary',
        'helpers/ObservableHelper',
        'calculators/LimitValuesCalculator',
        'calculators/LimitRangeCalculator',
        'viewmodels/ViewModelBase',
        'viewmodels/limits/RateFieldModel',
        'customEnums/ViewsEnums',
        'global/debounce',
        'initdatamanagers/Customer',
        'cachemanagers/ClientStateFlagsManager',
        'vendor/knockout.validation'
    ],
    function SetLimitsViewModelDef(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            VmHelpers = require('helpers/ObservableHelper'),
            LimitValuesCalculator = require('calculators/LimitValuesCalculator'),
            LimitRangesCalculator = require('calculators/LimitRangeCalculator'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            RateFieldModel = require('viewmodels/limits/RateFieldModel'),
            debounce = require('global/debounce'),
            customer = require('initdatamanagers/Customer'),
            csFlagsManager = require('cachemanagers/ClientStateFlagsManager');

        function SetLimitsViewModel() {
            var self,
                observableSetLimitsObject = {
                    SLLimitLabel: {},
                    TPLimitLabel: {}
                },
                parentData,
                inheritedInstance = general.clone(ViewModelBase),
                takeProfitField = new RateFieldModel(),
                stopLossField = new RateFieldModel(),
                viewProperties = {},
                subscriptions = [],
                computables = [];

            //-------------------------------------------------------
            var eLimitField = {
                SLAmount: 1,
                SLRate: 2,
                SLPercent: 3,
                TPAmount: 4,
                TPRate: 5,
                TPPercent: 6
            };

            //-------------------------------------------------------
            function init(_parentData, customSettings) {
                self = this;

                var defaultSettings = {
                    AdvancedMode: true,
                    isAvalibleSetLimits: true,
                    defaultTab: eSetLimitsTabs.Amount,
                    defaultDataState: eViewState.Initial,
                    parentView: eViewTypes.vNewDeal
                };

                inheritedInstance.setSettings(self, customSettings, defaultSettings);

                parentData = _parentData;
                registerToParentObservable();
                setDefaults();
                setDefaultObservables();

                registerObservableStartUpEvent();
                observableSetLimitsObject.State(eViewState.Initial);

                limitsValdiationModel();
            }

            //-------------------------------------------------------
            function registerObservableStartUpEvent() {
                observableSetLimitsObject.State.subscribe(function (stateValue) {
                    switch (stateValue) {
                        case eViewState.Start:
                            onStart();
                            break;

                        case eViewState.Stop:
                            onStop();
                            break;
                    }
                });
            }

            //-------------------------------------------------------
            function onStart() {
                setValidatedExtenders();
                setComputables();
                setSubscribers();

                setInitial();
            }

            //-------------------------------------------------------
            function onStop() {
                unsetSubscribers();
                unsetComputables();
                VmHelpers.CleanKoObservableSimpleObject(observableSetLimitsObject);

                markClean();
            }

            //-------------------------------------------------------
            function limitsValdiationModel() {
                observableSetLimitsObject.stopLossAmount.extend({
                    positiveInteger: {
                        message: Dictionary.GetItem('depCC_InvalidAmount'),
                        params: true
                    }
                });
                observableSetLimitsObject.takeProfitAmount.extend({
                    positiveInteger: {
                        message: Dictionary.GetItem('depCC_InvalidAmount'),
                        params: true
                    }
                });

                observableSetLimitsObject.displaySLAmount.extend({
                    validation: {
                        validator: function () {
                            return observableSetLimitsObject.stopLossAmount.isValid();
                        },
                        params: observableSetLimitsObject.stopLossAmount
                    }
                });
                observableSetLimitsObject.displayTPAmount.extend({
                    validation: {
                        validator: function () {
                            return observableSetLimitsObject.takeProfitAmount.isValid();
                        },
                        params: observableSetLimitsObject.takeProfitAmount
                    }
                });

                observableSetLimitsObject.ccySLAmount.extend({
                    validation: {
                        validator: function () {
                            return observableSetLimitsObject.stopLossAmount.isValid();
                        },
                        params: observableSetLimitsObject.stopLossAmount
                    }
                });
                observableSetLimitsObject.ccyTPAmount.extend({
                    validation: {
                        validator: function () {
                            return observableSetLimitsObject.takeProfitAmount.isValid();
                        },
                        params: observableSetLimitsObject.takeProfitAmount
                    }
                });

                observableSetLimitsObject.stopLossRate.extend({
                    rate: {
                        message: Dictionary.GetItem('limitLevelInvalid'),
                        params: true
                    }
                });
                observableSetLimitsObject.takeProfitRate.extend({
                    rate: {
                        message: Dictionary.GetItem('limitLevelInvalid'),
                        params: true
                    }
                });

                observableSetLimitsObject.stopLossPercent.extend({
                    min: -0.001,
                    max: 1000.001
                });
                observableSetLimitsObject.takeProfitPercent.extend({
                    min: -0.001,
                    max: 1000.001
                });
            }

            //-------------------------------------------------------
            function updateFromInstrument(instrumentId) {
                var instrument = $instrumentsManager.GetInstrument(instrumentId);

                if (instrument) {
                    observableSetLimitsObject.decimalDigit(instrument.DecimalDigit);
                    setDecimalDigitsValidatorExtenders();
                }
            }

            function setDecimalDigitsValidatorExtenders() {
                observableSetLimitsObject.stopLossRate.extend({
                    toNumericLength: {
                        ranges: [
                            { from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: observableSetLimitsObject.decimalDigit() }
                        ],
                        isAllowNAValue: true
                    }
                });

                observableSetLimitsObject.takeProfitRate.extend({
                    toNumericLength: {
                        ranges: [
                            { from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: observableSetLimitsObject.decimalDigit() }
                        ],
                        isAllowNAValue: true
                    }
                });
            }

            //-------------------------------------------------------
            function setValidatedExtenders() {
                updateFromInstrument(observableSetLimitsObject.instrumentId());

                subscriptions.push(observableSetLimitsObject.displaySLLimit.subscribe(function (value) {
                    var noSignValue = value.substring(1, value.length),
                        rateValidationRule = {
                            rate: {
                                message: Dictionary.GetItem('limitLevelInvalid'),
                                params: true
                            },
                            min: stopLossField.minValidation(),
                            max: stopLossField.maxValidation()
                        };

                    // reset SL rate validation
                    observableSetLimitsObject.stopLossRate.rules.removeAll();
                    observableSetLimitsObject.stopLossRate.extend(rateValidationRule);

                    observableSetLimitsObject.stopLossAmount.rules.removeAll();
                    observableSetLimitsObject.stopLossAmount.extend({
                        validation: {
                            validator: function (slAmount) {
                                var min = observableSetLimitsObject.SLLimitLabel.MinAmount(),
                                    max = observableSetLimitsObject.SLLimitLabel.MaxAmount(),
                                    absSlAmount = Math.abs(slAmount);

                                if (!general.isEmptyValue(slAmount) && !general.isEmptyValue(min) && !general.isEmptyValue(max)) {
                                    return min <= absSlAmount && absSlAmount <= max && observableSetLimitsObject.stopLossRate.isValid();
                                }

                                return observableSetLimitsObject.stopLossRate.isValid();
                            },
                            params: observableSetLimitsObject.stopLossRate
                        }
                    });

                    observableSetLimitsObject.stopLossPercent.rules.removeAll();
                    observableSetLimitsObject.stopLossPercent.extend({
                        validation: {
                            validator: function (slPercent) {
                                var min = observableSetLimitsObject.SLLimitLabel.MinPercent(),
                                    max = observableSetLimitsObject.SLLimitLabel.MaxPercent();

                                if (!general.isEmptyValue(slPercent) && !general.isEmptyValue(min) && !general.isEmptyValue(max)) {
                                    return min <= slPercent && slPercent <= max && observableSetLimitsObject.stopLossRate.isValid();
                                }

                                return observableSetLimitsObject.stopLossRate.isValid();
                            },
                            params: observableSetLimitsObject.stopLossRate
                        }
                    });

                    // For the UI
                    var splitRate = Format.tenthOfPipSplitRate(noSignValue, observableSetLimitsObject.instrumentId());

                    observableSetLimitsObject.SLLimitLabel.First(splitRate.label.first);
                    observableSetLimitsObject.SLLimitLabel.Last(splitRate.label.last);
                }));

                subscriptions.push(observableSetLimitsObject.displayTPLimit.subscribe(function (value) {
                    var noSignValue = value.substring(1, value.length),
                        rateValidationRule = {
                            rate: {
                                message: Dictionary.GetItem('limitLevelInvalid'),
                                params: true
                            },
                            min: takeProfitField.minValidation(),
                            max: takeProfitField.maxValidation()
                        };

                    // reset TP rate validation
                    observableSetLimitsObject.takeProfitRate.rules.removeAll();
                    observableSetLimitsObject.takeProfitRate.extend(rateValidationRule);

                    observableSetLimitsObject.takeProfitAmount.rules.removeAll();
                    observableSetLimitsObject.takeProfitAmount.extend({
                        validation: {
                            validator: function (tpAmount) {
                                var min = observableSetLimitsObject.TPLimitLabel.MinAmount(),
                                    max = observableSetLimitsObject.TPLimitLabel.MaxAmount(),
                                    absTpAmount = Math.abs(tpAmount);

                                if (!general.isEmptyValue(tpAmount) && !general.isEmptyValue(min) && !general.isEmptyValue(max)) {
                                    return min <= absTpAmount && absTpAmount <= max && observableSetLimitsObject.takeProfitRate.isValid();
                                }

                                return observableSetLimitsObject.takeProfitRate.isValid();
                            },
                            params: observableSetLimitsObject.takeProfitRate
                        }
                    });

                    observableSetLimitsObject.takeProfitPercent.rules.removeAll();
                    observableSetLimitsObject.takeProfitPercent.extend({
                        validation: {
                            validator: function (tpPercent) {
                                var min = observableSetLimitsObject.TPLimitLabel.MinPercent(),
                                    max = observableSetLimitsObject.TPLimitLabel.MaxPercent();

                                if (!general.isEmptyValue(tpPercent) && !general.isEmptyValue(min) && !general.isEmptyValue(max)) {
                                    return min <= tpPercent && tpPercent <= max && observableSetLimitsObject.takeProfitRate.isValid();
                                }

                                return observableSetLimitsObject.takeProfitRate.isValid();
                            },
                            params: observableSetLimitsObject.takeProfitRate
                        }
                    });

                    // For the UI
                    var splitRate = Format.tenthOfPipSplitRate(noSignValue, observableSetLimitsObject.instrumentId());

                    observableSetLimitsObject.TPLimitLabel.First(splitRate.label.first);
                    observableSetLimitsObject.TPLimitLabel.Last(splitRate.label.last);
                }));
            }

            //-------------------------------------------------------
            function unsetComputables() {
                if (computables.length > 0) {
                    for (var i = 0; i < computables.length; i++) {
                        computables[i].dispose();
                    }
                }

                computables.length = 0;
            }

            //-------------------------------------------------------
            function setComputables() {
                observableSetLimitsObject.SLLimit = ko.computed(setCalculatedSLRange, observableSetLimitsObject).extend({
                    dirty: false
                });
                computables.push(observableSetLimitsObject.SLLimit);

                observableSetLimitsObject.TPLimit = ko.computed(setCalculatedTPRange, observableSetLimitsObject).extend({
                    dirty: false
                });
                computables.push(observableSetLimitsObject.TPLimit);

                observableSetLimitsObject.isRangeChanged = ko.computed(function () {
                    var slLimitValue = observableSetLimitsObject.SLLimit();
                    var tpLimitValue = observableSetLimitsObject.TPLimit();

                    return (!general.isEmptyType(slLimitValue) && general.toNumeric(slLimitValue.substring(1, slLimitValue.length)) > 0) ||
                        (!general.isEmptyType(tpLimitValue) && general.toNumeric(tpLimitValue.substring(1, tpLimitValue.length)) > 0);
                });
                computables.push(observableSetLimitsObject.isRangeChanged);

                observableSetLimitsObject.showsAvalibleSetLimits = ko.computed(function () {
                    if (general.isDefinedType(observableSetLimitsObject.limitCalc())) {
                        if (observableSetLimitsObject.isShowTabs() == false && inheritedInstance.getSettings(self).isAvalibleSetLimits && observableSetLimitsObject.limitCalc().isDirty())
                            return true;
                        else
                            return false;
                    } else {
                        if (observableSetLimitsObject.isShowTabs() == false && inheritedInstance.getSettings(self).isAvalibleSetLimits)
                            return true;
                        else
                            return false;
                    }
                }, observableSetLimitsObject);
                computables.push(observableSetLimitsObject.showsAvalibleSetLimits);

                observableSetLimitsObject.isSlRateDirty = ko.computed(function () {
                    var slRate = observableSetLimitsObject.stopLossRate.isDirty() && observableSetLimitsObject.stopLossRate.isValid();
                    var isSlNoneTab = observableSetLimitsObject.curSlActiveTab() == eSetLimitsTabs.None;
                    var isSlRateTab = observableSetLimitsObject.curSlActiveTab() == eSetLimitsTabs.Rate;
                    var isDirty = (isSlNoneTab || isSlRateTab) && slRate;

                    return isDirty;
                }).extend({ notify: 'always' });
                computables.push(observableSetLimitsObject.isSlRateDirty);

                observableSetLimitsObject.isSlAmountDirty = ko.computed(function () {
                    var slAmount = observableSetLimitsObject.stopLossAmount.isDirty() && observableSetLimitsObject.stopLossAmount.isValid();
                    var isSlNoneTab = observableSetLimitsObject.curSlActiveTab() == eSetLimitsTabs.None;
                    var isSlAmountTab = observableSetLimitsObject.curSlActiveTab() == eSetLimitsTabs.Amount;
                    var isDirty = (isSlNoneTab || isSlAmountTab) && slAmount;

                    return isDirty;
                }).extend({ notify: 'always' });
                computables.push(observableSetLimitsObject.isSlAmountDirty);

                observableSetLimitsObject.isSlPercentDirty = ko.computed(function () {
                    var slPercent = observableSetLimitsObject.stopLossPercent.isDirty() && observableSetLimitsObject.stopLossPercent.isValid();
                    var isSlNoneTab = observableSetLimitsObject.curSlActiveTab() == eSetLimitsTabs.None;
                    var isSlPercentTab = observableSetLimitsObject.curSlActiveTab() == eSetLimitsTabs.Percent;
                    var isDirty = (isSlNoneTab || isSlPercentTab) && slPercent;

                    return isDirty;
                }).extend({ notify: 'always' });
                computables.push(observableSetLimitsObject.isSlPercentDirty);

                observableSetLimitsObject.isTpRateDirty = ko.computed(function () {
                    var tpRate = observableSetLimitsObject.takeProfitRate.isDirty() && observableSetLimitsObject.takeProfitRate.isValid();
                    var isTpNoneTab = observableSetLimitsObject.curTpActiveTab() == eSetLimitsTabs.None;
                    var isTpRateTab = observableSetLimitsObject.curTpActiveTab() == eSetLimitsTabs.Rate;
                    var isDirty = (isTpNoneTab || isTpRateTab) && tpRate;

                    return isDirty;
                }).extend({ notify: 'always' });
                computables.push(observableSetLimitsObject.isTpRateDirty);

                observableSetLimitsObject.isTpAmountDirty = ko.computed(function () {
                    var tpAmount = observableSetLimitsObject.takeProfitAmount.isDirty() && observableSetLimitsObject.takeProfitAmount.isValid();
                    var isTpNoneTab = observableSetLimitsObject.curTpActiveTab() == eSetLimitsTabs.None;
                    var isTpAmountTab = observableSetLimitsObject.curTpActiveTab() == eSetLimitsTabs.Amount;
                    var isDirty = (isTpNoneTab || isTpAmountTab) && tpAmount;

                    return isDirty;
                }).extend({ notify: 'always' });
                computables.push(observableSetLimitsObject.isTpAmountDirty);

                observableSetLimitsObject.isTpPercentDirty = ko.computed(function () {
                    var slAmount = observableSetLimitsObject.stopLossPercent.isDirty() && observableSetLimitsObject.stopLossPercent.isValid();
                    var isTpNoneTab = observableSetLimitsObject.curTpActiveTab() == eSetLimitsTabs.None;
                    var isTpPercentTab = observableSetLimitsObject.curTpActiveTab() == eSetLimitsTabs.Percent;
                    var isDirty = (isTpNoneTab || isTpPercentTab) && slAmount;

                    return isDirty;
                }).extend({ notify: 'always' });
                computables.push(observableSetLimitsObject.isTpPercentDirty);

                observableSetLimitsObject.isDirty = ko.computed(function () {
                    var isDirty = observableSetLimitsObject.isSlRateDirty() ||
                        observableSetLimitsObject.isSlAmountDirty() ||
                        observableSetLimitsObject.isSlPercentDirty() ||
                        observableSetLimitsObject.isTpRateDirty() ||
                        observableSetLimitsObject.isTpAmountDirty() ||
                        observableSetLimitsObject.isTpPercentDirty();

                    return isDirty;
                }).extend({ notify: 'always' });
                computables.push(observableSetLimitsObject.isDirty);

                observableSetLimitsObject.isCustomerCurrency = ko.computed(function () {

                    return observableSetLimitsObject.customerCcyName() && observableSetLimitsObject.customerCcyName().toLowerCase() == observableSetLimitsObject.symbolName().toLowerCase();
                });
                computables.push(observableSetLimitsObject.isCustomerCurrency);
            }

            //-------------------------------------------------------
            function registerToParentObservable() {
                observableSetLimitsObject.instrumentId = ko.computed(function () {
                    if (parentData.selectedInstrument)
                        return parentData.selectedInstrument();
                    else if (parentData.instrumentId)
                        return parentData.instrumentId();
                    else if (parentData.instrumentID)
                        return parentData.instrumentID();
                    else
                        return;
                });

                observableSetLimitsObject.bid = ko.computed(function () {
                    return parentData.bid();
                });

                observableSetLimitsObject.ask = ko.computed(function () {
                    return parentData.ask();
                });

                observableSetLimitsObject.open = ko.computed(function () {
                    if (parentData.open)
                        return parentData.open();
                    return;
                });

                observableSetLimitsObject.close = ko.computed(function () {
                    if (parentData.close)
                        return parentData.close();
                    return;
                });

                observableSetLimitsObject.change = ko.computed(function () {
                    if (parentData.change)
                        return parentData.change();
                    return;
                });

                observableSetLimitsObject.ccyPair = ko.computed(function () {
                    if (parentData.ccyPair)
                        return parentData.ccyPair();
                    return;
                });

                observableSetLimitsObject.orderDir = ko.computed(function () {
                    if (parentData.orderDir)
                        return parentData.orderDir();
                    return;
                });

                observableSetLimitsObject.quoteForOtherCcyToAccountCcy = ko.computed(function () {
                    if (parentData.quoteForOtherCcyToAccountCcy)
                        return parentData.quoteForOtherCcyToAccountCcy();
                    return;
                }).extend({ empty: true });

                observableSetLimitsObject.symbolName = ko.computed(function () {
                    if (parentData.symbolName)
                        return parentData.symbolName();
                    if (parentData.baseSymbolName)
                        return parentData.baseSymbolName();

                    return;
                });

                observableSetLimitsObject.amountSymbol = ko.computed(function () {
                    if (parentData.amountSymbol)
                        return parentData.amountSymbol();
                    return;
                });

                observableSetLimitsObject.selectedDealAmount = ko.computed(function () {
                    if (general.isDefinedType(parentData.selectedDealAmount))
                        return general.toNumeric(parentData.selectedDealAmount());
                    else return;
                });

                observableSetLimitsObject.limitCalc = ko.computed(function () {
                    if (general.isDefinedType(parentData.limitCalc)) {
                        return parentData.limitCalc;
                    }

                    if (general.isDefinedType(parentData.openLimit)) {
                        return parentData.openLimit;
                    }

                    return;
                });

                observableSetLimitsObject.additionalPL = ko.pureComputed(function () {
                    if (general.isDefinedType(parentData.additionalPL))
                        return general.toNumeric(parentData.additionalPL());
                    else return;
                });
            }

            //-------------------------------------------------------
            function unsetSubscribers() {
                if (subscriptions.length > 0) {
                    for (var i = 0; i < subscriptions.length; i++) {
                        subscriptions[i].dispose();
                    }
                }

                subscriptions.length = 0;
            }

            //-------------------------------------------------------
            function getRatesforCalculation() {
                var curRates = {
                    bid: observableSetLimitsObject.limitCalc() ? observableSetLimitsObject.limitCalc() : observableSetLimitsObject.bid,
                    ask: observableSetLimitsObject.limitCalc() ? observableSetLimitsObject.limitCalc() : observableSetLimitsObject.ask
                };

                return curRates;
            }

            //-------------------------------------------------------
            function adjustDisplayAmountValue(value) {
                if (!general.isEmptyValue(value) && value !== 'NA') {
                    var numberValue = parseFloat(value);
                    numberValue = Math.abs(numberValue);
                    numberValue = Math.ceil(numberValue);

                    return numberValue;
                }

                return value;
            }

            //-------------------------------------------------------
            function setSubscribers() {
                ///////////////////////////
                // Bid & Ask & DealAmount
                var rates = getRatesforCalculation(),
                    bid = rates.bid,
                    ask = rates.ask;

                var debouncedRecalculate = debounce(function () {
                    recalculate();
                }, 50);

                // When bid rate has been changed
                subscriptions.push(bid.subscribe(debouncedRecalculate));

                // When ask rate has been changed
                subscriptions.push(ask.subscribe(debouncedRecalculate));

                // When instrument has been changed
                subscriptions.push(observableSetLimitsObject.selectedDealAmount.subscribe(function () {
                    recalculate();
                }));

                // When orderDir has been changed
                subscriptions.push(observableSetLimitsObject.orderDir.subscribe(debouncedRecalculate));

                // When quoteForOtherCcyToAccountCcy has been changed
                subscriptions.push(observableSetLimitsObject.quoteForOtherCcyToAccountCcy.subscribe(debouncedRecalculate));

                subscriptions.push(observableSetLimitsObject.SLLimit.subscribe(function (value) {
                    if (!general.isEmptyValue(value)) {
                        debouncedRecalculate();
                    }
                }));

                subscriptions.push(observableSetLimitsObject.TPLimit.subscribe(function (value) {
                    if (!general.isEmptyValue(value)) {
                        debouncedRecalculate();
                    }
                }));

                ///////////////////////////
                // SL Amount
                subscriptions.push(observableSetLimitsObject.stopLossAmount.subscribe(function (value) {
                    if (general.isEmptyType(value)) {
                        observableSetLimitsObject.stopLossPercent('');
                        observableSetLimitsObject.stopLossRate('');
                        observableSetLimitsObject.ccySLAmount('');
                        observableSetLimitsObject.displaySLAmount('');
                    } else if (observableSetLimitsObject.curSlActiveTab() === eSetLimitsTabs.Amount) {
                        calculate(eLimitField.SLAmount);
                        ko.postbox.publish('stop-loss-changed', 'amount');
                    } else {
                        observableSetLimitsObject.displaySLAmount(adjustDisplayAmountValue(value));
                    }
                }));

                subscriptions.push(observableSetLimitsObject.displaySLAmount.subscribe(function (value) {
                    if (observableSetLimitsObject.curSlActiveTab() === eSetLimitsTabs.Amount) {
                        observableSetLimitsObject.stopLossAmount(value);
                    }
                }));

                ///////////////////////////
                // SL Percent
                subscriptions.push(observableSetLimitsObject.stopLossPercent.subscribe(function (value) {

                    if (general.isEmptyType(value)) {
                        observableSetLimitsObject.stopLossAmount('');
                        observableSetLimitsObject.stopLossRate('');
                        observableSetLimitsObject.ccySLAmount('');
                        observableSetLimitsObject.displaySLAmount('');
                    } else if (observableSetLimitsObject.curSlActiveTab() === eSetLimitsTabs.Percent) {
                        calculate(eLimitField.SLPercent);
                        ko.postbox.publish('stop-loss-changed', 'percent');
                    }

                }));

                ///////////////////////////
                // SL Rate
                subscriptions.push(observableSetLimitsObject.stopLossRate.subscribe(function (value) {
                    if (general.isEmptyType(value)) {
                        observableSetLimitsObject.stopLossAmount('');
                        observableSetLimitsObject.stopLossPercent('');
                        observableSetLimitsObject.ccySLAmount('');
                        observableSetLimitsObject.displaySLAmount('');
                        observableSetLimitsObject.displaySLSummary(false);

                        return;
                    } else if (observableSetLimitsObject.curSlActiveTab() === eSetLimitsTabs.Rate || observableSetLimitsObject.curSlActiveTab() == observableSetLimitsObject.defaultTab) {
                        calculate(eLimitField.SLRate);
                        ko.postbox.publish('stop-loss-changed', 'rate');
                    }

                    var rate = Format.toRate(value, true, observableSetLimitsObject.instrumentId());
                    var splitRate = Format.tenthOfPipSplitRate(rate, observableSetLimitsObject.instrumentId());

                    observableSetLimitsObject.SLRateLabel.First(splitRate.label.first);
                    observableSetLimitsObject.SLRateLabel.Last(splitRate.label.last);
                    observableSetLimitsObject.displaySLSummary(true);
                }));

                ///////////////////////////
                // TP Amount
                subscriptions.push(observableSetLimitsObject.takeProfitAmount.subscribe(function (value) {
                    if (general.isEmptyType(value)) {
                        observableSetLimitsObject.takeProfitPercent('');
                        observableSetLimitsObject.takeProfitRate('');
                        observableSetLimitsObject.ccyTPAmount('');
                        observableSetLimitsObject.displayTPAmount('');
                    } else if (observableSetLimitsObject.curTpActiveTab() === eSetLimitsTabs.Amount) {
                        calculate(eLimitField.TPAmount);
                        ko.postbox.publish('take-profit-changed', 'amount');
                    } else {
                        observableSetLimitsObject.displayTPAmount(adjustDisplayAmountValue(value));
                    }
                }));

                subscriptions.push(observableSetLimitsObject.displayTPAmount.subscribe(function (value) {
                    if (observableSetLimitsObject.curTpActiveTab() === eSetLimitsTabs.Amount) {
                        observableSetLimitsObject.takeProfitAmount(value);
                    }
                }));

                ///////////////////////////
                // TP Percent
                subscriptions.push(observableSetLimitsObject.takeProfitPercent.subscribe(function (value) {

                    if (general.isEmptyType(value)) {
                        observableSetLimitsObject.takeProfitAmount('');
                        observableSetLimitsObject.takeProfitRate('');
                        observableSetLimitsObject.ccyTPAmount('');
                        observableSetLimitsObject.displayTPAmount('');
                    } else if (observableSetLimitsObject.curTpActiveTab() === eSetLimitsTabs.Percent) {
                        calculate(eLimitField.TPPercent);
                        ko.postbox.publish('take-profit-changed', 'percent');
                    }

                }));

                ///////////////////////////
                // TP Rate
                subscriptions.push(observableSetLimitsObject.takeProfitRate.subscribe(function (value) {
                    if (general.isEmptyType(value)) {
                        observableSetLimitsObject.takeProfitAmount('');
                        observableSetLimitsObject.takeProfitPercent('');
                        observableSetLimitsObject.ccyTPAmount('');
                        observableSetLimitsObject.displayTPAmount('');
                        observableSetLimitsObject.displayTPSummary(false);

                        return;
                    } else if (observableSetLimitsObject.curTpActiveTab() === eSetLimitsTabs.Rate || observableSetLimitsObject.curTpActiveTab() == observableSetLimitsObject.defaultTab) {
                        calculate(eLimitField.TPRate);
                        ko.postbox.publish('take-profit-changed', 'rate');
                    }

                    var rate = Format.toRate(value, true, observableSetLimitsObject.instrumentId());
                    var splitRate = Format.tenthOfPipSplitRate(rate, observableSetLimitsObject.instrumentId());

                    observableSetLimitsObject.TPRateLabel.First(splitRate.label.first);
                    observableSetLimitsObject.TPRateLabel.Last(splitRate.label.last);
                    observableSetLimitsObject.displayTPSummary(true);
                }));

                // isShowTabs
                subscriptions.push(observableSetLimitsObject.isShowTabs.subscribe(function (value) {
                    if (value === true) {
                        // set SL Rate for edit limit
                        if (parentData.slRate && !general.isEmptyType(parentData.slRate()) && general.toNumeric(parentData.slRate())) {
                            observableSetLimitsObject.stopLossRate(parentData.slRate());
                        } else {
                            observableSetLimitsObject.stopLossRate('');
                        }

                        // set TP Rate for edit limit
                        if (parentData.tpRate && !general.isEmptyType(parentData.tpRate()) && general.toNumeric(parentData.tpRate())) {
                            observableSetLimitsObject.takeProfitRate(parentData.tpRate());
                        } else {
                            observableSetLimitsObject.takeProfitRate('');
                        }

                        //make clean so it is not considered dirty
                        markClean();
                    }
                }));

                // Selected instrument
                subscriptions.push(observableSetLimitsObject.instrumentId.subscribe(function () {
                    updateFromInstrument(observableSetLimitsObject.instrumentId());
                }));
            }

            //-------------------------------------------------------
            function setDefaults() {
                viewProperties.isNewLimit = function isNewLimit() {
                    return inheritedInstance.getSettings(self).parentView == eViewTypes.vNewLimit;
                };
                viewProperties.isNewDeal = function isNewDeal() {
                    return inheritedInstance.getSettings(self).parentView == eViewTypes.vNewDeal || inheritedInstance.getSettings(self).parentView == eViewTypes.vNewDealSlip;
                };
            }

            //-------------------------------------------------------
            function computeAmountLimit(rateBoundary, limitType) {
                var rates = getRatesforCalculation(),
                    rateValue = ko.utils.unwrapObservable(rateBoundary),
                    sign,
                    noSignValue,
                    rateLimit,
                    limitRange;

                if (!rateValue) {
                    return '';
                }

                if (observableSetLimitsObject.quoteForOtherCcyToAccountCcy.isEmpty()) {
                    return '';
                }

                sign = rateValue.substring(0, 1);
                noSignValue = rateValue.substring(1, rateValue.length);
                rateLimit = parseFloat(noSignValue);

                if (limitType == eLimitType.StopLoss) {
                    limitRange = observableSetLimitsObject.SLRange;
                }

                if (limitType == eLimitType.TakeProfit) {
                    limitRange = observableSetLimitsObject.TPRange;
                }

                if (!general.isDefinedType(limitRange)) {
                    return '';
                }

                if (sign === '>') {
                    rateLimit += 1 / Math.pow(10, (observableSetLimitsObject.decimalDigit()));
                }

                if (sign === '<') {
                    rateLimit -= 1 / Math.pow(10, (observableSetLimitsObject.decimalDigit()));
                }

                var values = LimitValuesCalculator.CalculateValuesFromRate(
                    rates.bid(),
                    rates.ask(),
                    rateLimit,
                    observableSetLimitsObject.orderDir(),
                    limitType,
                    observableSetLimitsObject.selectedDealAmount(),
                    limitRange,
                    observableSetLimitsObject.quoteForOtherCcyToAccountCcy(),
                    observableSetLimitsObject.instrumentId()
                );

                if (!values.isValid) {
                    return '';
                }

                return values;
            }

            //-------------------------------------------------------
            function normalizeMinPercent(floatValue, precision) {
                var multiplier = Math.pow(10, precision);
                return Math.ceil(floatValue * multiplier) / multiplier;
            }

            function normalizeAbovePercent(floatValue, precision) {
                var multiplier = Math.pow(10, precision);
                return Math.round(floatValue * multiplier) / multiplier;
            }

            function normalizeMaxPercent(floatValue, precision) {
                var multiplier = Math.pow(10, precision);
                return Math.floor(floatValue * multiplier) / multiplier;
            }

            //-------------------------------------------------------
            function setDefaultObservables() {
                viewProperties.isAdvancedView = ko.observable(false);

                observableSetLimitsObject.SLRateLabel = {
                    First: ko.observable(''),
                    Last: ko.observable('')
                };

                observableSetLimitsObject.TPRateLabel = {
                    First: ko.observable(''),
                    Last: ko.observable('')
                };

                // Rate
                observableSetLimitsObject.SLLimitLabel.First = ko.observable('');
                observableSetLimitsObject.SLLimitLabel.Last = ko.observable('');

                // Base CCY Amount
                observableSetLimitsObject.SLLimitLabel.BaseCcyAboveAmount = ko.observable('').extend({ empty: true });
                observableSetLimitsObject.SLLimitLabel.BaseCcyMinAmount = ko.observable('');
                observableSetLimitsObject.SLLimitLabel.BaseCcyMaxAmount = ko.observable('');

                // Amount
                observableSetLimitsObject.SLLimitLabel.MinAmount = ko.computed(function () {
                    var limitValues = computeAmountLimit(stopLossField.near, eLimitType.StopLoss),
                        amount = '',
                        baseCcyAmount = '',
                        aboveValue = '';

                    if (!general.isEmptyValue(limitValues)) {
                        amount = Math.abs(Number(limitValues.amount)) || 0;

                        baseCcyAmount = Math.ceil(Math.abs(Number(limitValues.value))) || 1;
                        aboveValue = baseCcyAmount - 1;
                    }

                    observableSetLimitsObject.SLLimitLabel.BaseCcyMinAmount(baseCcyAmount);
                    observableSetLimitsObject.SLLimitLabel.BaseCcyAboveAmount(aboveValue);

                    return amount;
                });

                observableSetLimitsObject.SLLimitLabel.MaxAmount = ko.computed(function () {
                    var limitValues = computeAmountLimit(stopLossField.far, eLimitType.StopLoss),
                        amount,
                        baseCcyAmount;

                    if (!general.isEmptyValue(limitValues)) {
                        amount = Math.abs(Number(limitValues.amount)) || 1;
                        baseCcyAmount = Math.floor(Math.abs(Number(limitValues.value))) || 1;
                    }

                    observableSetLimitsObject.SLLimitLabel.BaseCcyMaxAmount(baseCcyAmount);

                    return amount;
                });

                // Percent
                observableSetLimitsObject.SLLimitLabel.AbovePercent = ko.observable('').extend({ empty: true });

                observableSetLimitsObject.SLLimitLabel.MinPercent = ko.pureComputed(function () {
                    var minPercent,
                        decimalDigit = ko.toJS(observableSetLimitsObject.decimalDigit),
                        orderDir = observableSetLimitsObject.orderDir(),
                        minRate = ko.toJS(stopLossField.minValidation),
                        maxRate = ko.toJS(stopLossField.maxValidation),
                        rates = getRatesforCalculation(),
                        bid = rates.bid(),
                        ask = rates.ask(),
                        aboveValue,
                        limitRate;

                    if (general.isEmptyValue(bid) || general.isEmptyValue(ask) || general.isEmptyValue(minRate) || general.isEmptyValue(maxRate)) {
                        return;
                    }

                    if (orderDir === eOrderDir.Sell) {
                        limitRate = minRate + (1 / Math.pow(10, decimalDigit));
                        minPercent = LimitValuesCalculator.CalculatePercentFromRate(bid, limitRate);
                    } else {
                        limitRate = maxRate - (1 / Math.pow(10, decimalDigit));
                        minPercent = LimitValuesCalculator.CalculatePercentFromRate(ask, limitRate);
                    }

                    minPercent = normalizeMinPercent(minPercent, 2);
                    aboveValue = normalizeAbovePercent(minPercent - (1 / Math.pow(10, 2)), 2);
                    observableSetLimitsObject.SLLimitLabel.AbovePercent(aboveValue);

                    return minPercent;
                }).extend({ empty: true });

                observableSetLimitsObject.SLLimitLabel.MaxPercent = ko.pureComputed(function () {
                    var maxPercent,
                        orderDir = observableSetLimitsObject.orderDir(),
                        minRate = ko.toJS(stopLossField.minValidation),
                        maxRate = ko.toJS(stopLossField.maxValidation),
                        rates = getRatesforCalculation(),
                        bid = rates.bid(),
                        ask = rates.ask();

                    if (general.isEmptyValue(bid) || general.isEmptyValue(ask) || general.isEmptyValue(minRate) || general.isEmptyValue(maxRate)) {
                        return;
                    }

                    if (orderDir === eOrderDir.Sell) {
                        maxPercent = LimitValuesCalculator.CalculatePercentFromRate(bid, maxRate);
                    } else {
                        maxPercent = LimitValuesCalculator.CalculatePercentFromRate(ask, minRate);
                    }

                    maxPercent = normalizeMaxPercent(maxPercent, 2);

                    return maxPercent;
                });

                // Rate
                observableSetLimitsObject.TPLimitLabel.First = ko.observable('');
                observableSetLimitsObject.TPLimitLabel.Last = ko.observable('');

                // Base CCY Amount
                observableSetLimitsObject.TPLimitLabel.BaseCcyAboveAmount = ko.observable('').extend({ empty: true });
                observableSetLimitsObject.TPLimitLabel.BaseCcyMinAmount = ko.observable('');
                observableSetLimitsObject.TPLimitLabel.BaseCcyMaxAmount = ko.observable('');

                // Amount
                observableSetLimitsObject.TPLimitLabel.MinAmount = ko.computed(function () {
                    var limitValues = computeAmountLimit(takeProfitField.near, eLimitType.TakeProfit),
                        amount = '',
                        baseCcyAmount = '',
                        aboveValue = '';

                    if (!general.isEmptyValue(limitValues)) {
                        amount = Math.abs(Number(limitValues.amount)) || 0;
                        baseCcyAmount = Math.ceil(Math.abs(Number(limitValues.value))) || 1;
                        aboveValue = baseCcyAmount - 1;
                    }

                    observableSetLimitsObject.TPLimitLabel.BaseCcyMinAmount(baseCcyAmount);
                    observableSetLimitsObject.TPLimitLabel.BaseCcyAboveAmount(aboveValue);

                    return amount;
                });

                observableSetLimitsObject.TPLimitLabel.MaxAmount = ko.computed(function () {
                    var limitValues = computeAmountLimit(takeProfitField.far, eLimitType.TakeProfit),
                        amount,
                        baseCcyAmount;

                    if (!general.isEmptyValue(limitValues)) {
                        amount = Math.abs(Number(limitValues.amount)) || 1;
                        baseCcyAmount = Math.floor(Math.abs(Number(limitValues.value))) || 1;
                    }

                    observableSetLimitsObject.TPLimitLabel.BaseCcyMaxAmount(baseCcyAmount);

                    return amount;
                });

                // Percent
                observableSetLimitsObject.TPLimitLabel.AbovePercent = ko.observable('').extend({ empty: true });

                observableSetLimitsObject.TPLimitLabel.MinPercent = ko.pureComputed(function () {
                    var minPercent,
                        decimalDigit = ko.toJS(observableSetLimitsObject.decimalDigit),
                        orderDir = observableSetLimitsObject.orderDir(),
                        minRate = ko.toJS(takeProfitField.minValidation),
                        maxRate = ko.toJS(takeProfitField.maxValidation),
                        rates = getRatesforCalculation(),
                        bid = rates.bid(),
                        ask = rates.ask(),
                        aboveValue,
                        limitRate;

                    if (general.isEmptyValue(bid) || general.isEmptyValue(ask) || general.isEmptyValue(minRate) || general.isEmptyValue(maxRate)) {
                        return;
                    }

                    if (orderDir === eOrderDir.Sell) {
                        limitRate = maxRate - (1 / Math.pow(10, decimalDigit));
                        minPercent = LimitValuesCalculator.CalculatePercentFromRate(bid, limitRate);
                    } else {
                        limitRate = minRate + (1 / Math.pow(10, decimalDigit));
                        minPercent = LimitValuesCalculator.CalculatePercentFromRate(ask, limitRate);
                    }

                    minPercent = normalizeMinPercent(minPercent, 2);
                    aboveValue = normalizeAbovePercent(minPercent - (1 / Math.pow(10, 2)), 2);
                    observableSetLimitsObject.TPLimitLabel.AbovePercent(aboveValue);

                    return minPercent;
                });

                observableSetLimitsObject.TPLimitLabel.MaxPercent = ko.pureComputed(function () {
                    var maxPercent,
                        orderDir = observableSetLimitsObject.orderDir(),
                        minRate = ko.toJS(takeProfitField.minValidation),
                        maxRate = ko.toJS(takeProfitField.maxValidation),
                        rates = getRatesforCalculation(),
                        bid = rates.bid(),
                        ask = rates.ask();

                    if (general.isEmptyValue(bid) || general.isEmptyValue(ask) || general.isEmptyValue(minRate) || general.isEmptyValue(maxRate)) {
                        return;
                    }

                    if (orderDir === eOrderDir.Sell) {
                        maxPercent = LimitValuesCalculator.CalculatePercentFromRate(bid, minRate);
                    } else {
                        maxPercent = LimitValuesCalculator.CalculatePercentFromRate(ask, maxRate);
                    }

                    maxPercent = normalizeMaxPercent(maxPercent, 2);

                    return maxPercent;
                });

                observableSetLimitsObject.stopLossAmount = ko.observable('').extend({
                    dirty: false
                });

                observableSetLimitsObject.displaySLAmount = ko.observable('').extend({
                    toNumericLength: {
                        ranges: [{
                            from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: 0
                        }],
                        isAllowNAValue: true
                    }
                });

                observableSetLimitsObject.takeProfitAmount = ko.observable('').extend({
                    dirty: false
                });

                observableSetLimitsObject.displayTPAmount = ko.observable('').extend({
                    toNumericLength: {
                        ranges: [{
                            from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: 0
                        }],
                        isAllowNAValue: true
                    }
                });

                observableSetLimitsObject.stopLossRate = ko.observable('').extend({
                    dirty: false
                });

                observableSetLimitsObject.takeProfitRate = ko.observable('').extend({
                    dirty: false
                });

                observableSetLimitsObject.stopLossPercent = ko.observable('').extend({
                    dirty: false,
                    toNumericLength: {
                        ranges: [{
                            from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: 2
                        }],
                        isForceCeil: true,
                        isAllowNAValue: true
                    },
                    incremental: {
                        ranges: [
                            { from: 0, to: 0.1, step: 0.01 },
                            { from: 0.1, to: 0.5, step: 0.05 },
                            { from: 0.5, to: 5, step: 0.1 },
                            { from: 5, to: 10, step: 0.5 },
                            { from: 10, to: Number.MAX_VALUE, step: 1 }
                        ]
                    }
                });

                observableSetLimitsObject.takeProfitPercent = ko.observable('').extend({
                    dirty: false,
                    toNumericLength: {
                        ranges: [{
                            from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: 2
                        }],
                        isForceCeil: true,
                        isAllowNAValue: true
                    },
                    incremental: {
                        ranges: [
                            { from: 0, to: 0.1, step: 0.01 },
                            { from: 0.1, to: 0.5, step: 0.05 },
                            { from: 0.5, to: 5, step: 0.1 },
                            { from: 5, to: 10, step: 0.5 },
                            { from: 10, to: Number.MAX_VALUE, step: 1 }
                        ]
                    }
                });

                observableSetLimitsObject.ccySLAmount = ko.observable('');
                observableSetLimitsObject.ccyTPAmount = ko.observable('');

                observableSetLimitsObject.customerCcyName = ko.observable('');

                observableSetLimitsObject.curSlActiveTab = ko.observable(eSetLimitsTabs.NoTabs);
                observableSetLimitsObject.curTpActiveTab = ko.observable(eSetLimitsTabs.NoTabs);
                observableSetLimitsObject.visibleTab = ko.observable(eSetLimitsTabs.NoTabs);
                observableSetLimitsObject.isShowTabs = ko.observable(false);
                observableSetLimitsObject.isAmountAvailable = general.isDefinedType(inheritedInstance.getSettings(self).showSetLimitsAmountTab) ? inheritedInstance.getSettings(self).showSetLimitsAmountTab : true;
                observableSetLimitsObject.State = ko.observable('');

                observableSetLimitsObject.displaySLLimit = ko.observable('');
                observableSetLimitsObject.displayTPLimit = ko.observable('');

                observableSetLimitsObject.SLRange = new LimitRangesCalculator.LimitRange(ko);
                observableSetLimitsObject.TPRange = new LimitRangesCalculator.LimitRange(ko);

                observableSetLimitsObject.SetActiveTab = setActiveTab;
                observableSetLimitsObject.SetSlActiveTab = setSlActiveTab;
                observableSetLimitsObject.SetTpActiveTab = setTpActiveTab;

                observableSetLimitsObject.ChangeTabVisibility = changeTabsVisibility;

                observableSetLimitsObject.decimalDigit = ko.observable(0);

                observableSetLimitsObject.displaySLSummary = ko.observable(false);
                observableSetLimitsObject.displayTPSummary = ko.observable(false);
            }

            //-------------------------------------------------------
            function markClean() {
                observableSetLimitsObject.stopLossRate.markClean();
                observableSetLimitsObject.takeProfitRate.markClean();
                observableSetLimitsObject.stopLossAmount.markClean();
                observableSetLimitsObject.takeProfitAmount.markClean();
                observableSetLimitsObject.stopLossPercent.markClean();
                observableSetLimitsObject.takeProfitPercent.markClean();
            }

            //-------------------------------------------------------
            function calculate(field) {
                if (observableSetLimitsObject.State() != eViewState.Start) {
                    return;
                }

                var rates = getRatesforCalculation(),
                    bid = rates.bid,
                    ask = rates.ask;

                switch (field) {
                    case eLimitField.SLAmount:

                        var slLimitAmount = LimitValuesCalculator.CalculateValuesFromAmount(
                            bid(),
                            ask(),
                            observableSetLimitsObject.stopLossAmount(),
                            observableSetLimitsObject.orderDir(),
                            eLimitType.StopLoss,
                            observableSetLimitsObject.selectedDealAmount(),
                            observableSetLimitsObject.SLRange,
                            observableSetLimitsObject.quoteForOtherCcyToAccountCcy(),
                            observableSetLimitsObject.instrumentId()
                        );

                        observableSetLimitsObject.stopLossRate(slLimitAmount.rate);
                        observableSetLimitsObject.stopLossPercent(slLimitAmount.percent);
                        // CCY SL Amount
                        observableSetLimitsObject.ccySLAmount(slLimitAmount.value);

                        break;
                    case eLimitField.SLRate:

                        var slLimitRate = LimitValuesCalculator.CalculateValuesFromRate(
                            bid(),
                            ask(),
                            observableSetLimitsObject.stopLossRate(),
                            observableSetLimitsObject.orderDir(),
                            eLimitType.StopLoss,
                            observableSetLimitsObject.selectedDealAmount(),
                            observableSetLimitsObject.SLRange,
                            observableSetLimitsObject.quoteForOtherCcyToAccountCcy(),
                            observableSetLimitsObject.instrumentId(),
                            observableSetLimitsObject.additionalPL()
                        );

                        observableSetLimitsObject.stopLossAmount(slLimitRate.amount);
                        observableSetLimitsObject.stopLossPercent(slLimitRate.percent);
                        // CCY SL Amount
                        observableSetLimitsObject.ccySLAmount(slLimitRate.value);

                        break;
                    case eLimitField.SLPercent:

                        var slLimitPercent = LimitValuesCalculator.CalculateValuesFromPercent(
                            bid(),
                            ask(),
                            observableSetLimitsObject.stopLossPercent(),
                            observableSetLimitsObject.orderDir(),
                            eLimitType.StopLoss,
                            observableSetLimitsObject.selectedDealAmount(),
                            observableSetLimitsObject.SLRange,
                            observableSetLimitsObject.quoteForOtherCcyToAccountCcy(),
                            observableSetLimitsObject.instrumentId()
                        );

                        observableSetLimitsObject.stopLossRate(slLimitPercent.rate);
                        observableSetLimitsObject.stopLossAmount(slLimitPercent.amount);
                        // CCY SL Amount
                        observableSetLimitsObject.ccySLAmount(slLimitPercent.value);

                        break;
                    case eLimitField.TPAmount:

                        var tpLimitAmount = LimitValuesCalculator.CalculateValuesFromAmount(
                            bid(),
                            ask(),
                            observableSetLimitsObject.takeProfitAmount(),
                            observableSetLimitsObject.orderDir(),
                            eLimitType.TakeProfit,
                            observableSetLimitsObject.selectedDealAmount(),
                            observableSetLimitsObject.TPRange,
                            observableSetLimitsObject.quoteForOtherCcyToAccountCcy(),
                            observableSetLimitsObject.instrumentId()
                        );

                        observableSetLimitsObject.takeProfitRate(tpLimitAmount.rate);
                        observableSetLimitsObject.takeProfitPercent(tpLimitAmount.percent);
                        // CCY TP Amount
                        observableSetLimitsObject.ccyTPAmount(tpLimitAmount.value);

                        break;
                    case eLimitField.TPRate:

                        var tpLimitRate = LimitValuesCalculator.CalculateValuesFromRate(
                            bid(),
                            ask(),
                            observableSetLimitsObject.takeProfitRate(),
                            observableSetLimitsObject.orderDir(),
                            eLimitType.TakeProfit,
                            observableSetLimitsObject.selectedDealAmount(),
                            observableSetLimitsObject.TPRange,
                            observableSetLimitsObject.quoteForOtherCcyToAccountCcy(),
                            observableSetLimitsObject.instrumentId(),
                            observableSetLimitsObject.additionalPL()
                        );

                        observableSetLimitsObject.takeProfitAmount(tpLimitRate.amount);
                        observableSetLimitsObject.takeProfitPercent(tpLimitRate.percent);
                        // CCY TP Amount
                        observableSetLimitsObject.ccyTPAmount(tpLimitRate.value);

                        break;
                    case eLimitField.TPPercent:

                        var tpLimitPercent = LimitValuesCalculator.CalculateValuesFromPercent(
                            bid(),
                            ask(),
                            observableSetLimitsObject.takeProfitPercent(),
                            observableSetLimitsObject.orderDir(),
                            eLimitType.TakeProfit,
                            observableSetLimitsObject.selectedDealAmount(),
                            observableSetLimitsObject.TPRange,
                            observableSetLimitsObject.quoteForOtherCcyToAccountCcy(),
                            observableSetLimitsObject.instrumentId()
                        );

                        observableSetLimitsObject.takeProfitRate(tpLimitPercent.rate);
                        observableSetLimitsObject.takeProfitAmount(tpLimitPercent.amount);
                        // CCY TP Amount
                        observableSetLimitsObject.ccyTPAmount(tpLimitPercent.value);

                        break;
                }
            }

            //-------------------------------------------------------
            function recalculate() {
                /////////////////////////////////////////
                // Amount
                // stop loss amount
                if ((observableSetLimitsObject.curSlActiveTab() === eSetLimitsTabs.Amount) && general.isNumber(observableSetLimitsObject.stopLossAmount())) {
                    calculate(eLimitField.SLAmount);
                }

                // take profit amount
                if ((observableSetLimitsObject.curTpActiveTab() === eSetLimitsTabs.Amount) && general.isNumber(observableSetLimitsObject.takeProfitAmount())) {
                    calculate(eLimitField.TPAmount);
                }

                /////////////////////////////////////////
                // Rate
                // stop loss rate
                if ((observableSetLimitsObject.curSlActiveTab() === eSetLimitsTabs.Rate) && general.isNumber(observableSetLimitsObject.stopLossRate())) {
                    calculate(eLimitField.SLRate);
                }

                // take profit rate
                if ((observableSetLimitsObject.curTpActiveTab() === eSetLimitsTabs.Rate) && general.isNumber(observableSetLimitsObject.takeProfitRate())) {
                    calculate(eLimitField.TPRate);
                }

                /////////////////////////////////////////
                // Percent
                // stop loss percent
                if ((observableSetLimitsObject.curSlActiveTab() === eSetLimitsTabs.Percent) && general.isNumber(observableSetLimitsObject.stopLossPercent())) {
                    calculate(eLimitField.SLPercent);
                }

                // take profit percent
                if ((observableSetLimitsObject.curTpActiveTab() === eSetLimitsTabs.Percent) && general.isNumber(observableSetLimitsObject.takeProfitPercent())) {
                    calculate(eLimitField.TPPercent);
                }
            }

            //-------------------------------------------------------
            function setCalculatedTPRange() {
                var bid = observableSetLimitsObject.bid();
                var ask = observableSetLimitsObject.ask();

                if (general.isEmptyValue(bid) || general.isEmptyValue(ask)) {
                    observableSetLimitsObject.displayTPLimit('');
                    return '';
                }

                var validRange = parentData.openLimit ? parentData.openLimit.isValid() : true;
                var orderDir = observableSetLimitsObject.orderDir();
                var instrument = $instrumentsManager.GetInstrument(observableSetLimitsObject.instrumentId());

                if (!instrument) {
                    return '';
                }

                if (isIfDone()) {
                    LimitRangesCalculator.CalculateIfDoneRanges(bid, ask, observableSetLimitsObject.orderDir(), observableSetLimitsObject.SLRange, observableSetLimitsObject.TPRange, parentData.openLimit(), instrument, csFlagsManager.CSFlags.limitMultiplier);
                } else {
                    LimitRangesCalculator.CalculateClosingRanges(bid, ask, observableSetLimitsObject.orderDir(), observableSetLimitsObject.SLRange, observableSetLimitsObject.TPRange, instrument, csFlagsManager.CSFlags.limitMultiplier);
                }

                observableSetLimitsObject.decimalDigit(instrument.DecimalDigit);

                var nearRate = parseFloat(Format.toRate(observableSetLimitsObject.TPRange.near(), true, instrument.id));
                var farRate = parseFloat(Format.toRate(observableSetLimitsObject.TPRange.far(), true, instrument.id));

                takeProfitField.precision(instrument.DecimalDigit);
                takeProfitField.pipDigit(instrument.PipDigit);
                takeProfitField.min(orderDir == eOrderDir.Sell ? farRate : nearRate);
                takeProfitField.max(orderDir == eOrderDir.Sell ? nearRate : farRate);

                var sign = general.addSign(observableSetLimitsObject.orderDir(), eLimitType.TakeProfit);
                var signedRange = sign + Format.toRate(observableSetLimitsObject.TPRange.near(), true, instrument.id);

                if (sign === '>') {
                    takeProfitField.startSpinFrom(eStartSpinFrom.Above);
                    takeProfitField.near('>' + nearRate);
                    takeProfitField.far('<' + farRate);
                } else {
                    takeProfitField.startSpinFrom(eStartSpinFrom.Below);
                    takeProfitField.near('<' + nearRate);
                    takeProfitField.far('>' + farRate);
                }

                if (typeof parentData.openLimit !== 'undefined') //=> limit case
                {
                    if (orderDir === eOrderDir.None || !parentData.openLimit.isValid()) {
                        takeProfitField.startSpinFrom(eStartSpinFrom.None);
                    }
                }

                if (validRange) {
                    observableSetLimitsObject.displayTPLimit(signedRange);
                    return signedRange;
                }

                observableSetLimitsObject.displayTPLimit('');
                return '';
            }

            //-------------------------------------------------------
            function setCalculatedSLRange() {
                var bid = observableSetLimitsObject.bid();
                var ask = observableSetLimitsObject.ask();

                if (general.isEmptyValue(bid) || general.isEmptyValue(ask)) {
                    observableSetLimitsObject.displaySLLimit('');
                    return '';
                }

                var validRange = parentData.openLimit ? parentData.openLimit.isValid() : true;
                var orderDir = observableSetLimitsObject.orderDir();
                var instrument = $instrumentsManager.GetInstrument(observableSetLimitsObject.instrumentId());

                if (!instrument) {
                    return '';
                }

                if (isIfDone()) {
                    LimitRangesCalculator.CalculateIfDoneRanges(bid, ask, observableSetLimitsObject.orderDir(), observableSetLimitsObject.SLRange, observableSetLimitsObject.TPRange, parentData.openLimit(), instrument, csFlagsManager.CSFlags.limitMultiplier);
                } else {
                    LimitRangesCalculator.CalculateClosingRanges(bid, ask, observableSetLimitsObject.orderDir(), observableSetLimitsObject.SLRange, observableSetLimitsObject.TPRange, instrument, csFlagsManager.CSFlags.limitMultiplier);
                }

                observableSetLimitsObject.decimalDigit(instrument.DecimalDigit);

                var nearRate = parseFloat(Format.toRate(observableSetLimitsObject.SLRange.near(), true, instrument.id));
                var farRate = parseFloat(Format.toRate(observableSetLimitsObject.SLRange.far(), true, instrument.id));

                stopLossField.precision(instrument.DecimalDigit);
                stopLossField.pipDigit(instrument.PipDigit);
                stopLossField.min(orderDir == eOrderDir.Sell ? nearRate : farRate);
                stopLossField.max(orderDir == eOrderDir.Sell ? farRate : nearRate);

                var sign = general.addSign(orderDir, eLimitType.StopLoss);
                var signedRange = sign + Format.toRate(observableSetLimitsObject.SLRange.near(), true, instrument.id);

                if (sign === '>') {
                    stopLossField.startSpinFrom(eStartSpinFrom.Above);
                    stopLossField.near('>' + nearRate);
                    stopLossField.far('<' + farRate);
                } else {
                    stopLossField.startSpinFrom(eStartSpinFrom.Below);
                    stopLossField.near('<' + nearRate);
                    stopLossField.far('>' + farRate);
                }

                if (typeof parentData.openLimit !== 'undefined') //=> limit case
                {
                    if (orderDir === eOrderDir.None || !parentData.openLimit.isValid()) {
                        stopLossField.startSpinFrom(eStartSpinFrom.None);
                    }
                }

                if (validRange) {
                    observableSetLimitsObject.displaySLLimit(signedRange);
                    return signedRange;
                }

                observableSetLimitsObject.displaySLLimit('');
                return '';
            }

            function isIfDone() {
                if (parentData.PageName === eDealPage.NewLimitViewModel ||
                    parentData.PageName === eDealPage.EditLimitViewModel ||
                    parentData.PageName === eDealPage.EditIfDoneLimit) {
                    return true;
                }

                return false;
            }

            //-------------------------------------------------------
            function validate() {
                var err = [];

                return err.concat(validateSlRate(), validateTpRate());
            }

            //-------------------------------------------------------
            function validateSlRate() {
                return !observableSetLimitsObject.stopLossRate.isValid() ?
                    [Dictionary.GetItem('slLeveInvalid')] : [];
            }

            //-------------------------------------------------------
            function validateTpRate() {
                return !observableSetLimitsObject.takeProfitRate.isValid() ?
                    [Dictionary.GetItem('tpLeveInvalid')] : [];
            }

            //-------------------------------------------------------
            function setActiveTab(activeTab) {
                setSlActiveTab(activeTab);
                setTpActiveTab(activeTab);
            }

            //-------------------------------------------------------
            function setSlActiveTab(activeTab) {
                activeTab = activeTab || eSetLimitsTabs.None;

                if (activeTab == eSetLimitsTabs.None) {
                    // Set SL
                    if (parentData.slRate && ko.isWriteableObservable(parentData.slRate)) {
                        parentData.slRate(Dictionary.GetItem('setLimit'));
                    }

                    observableSetLimitsObject.stopLossRate('');
                    observableSetLimitsObject.stopLossAmount('');
                    observableSetLimitsObject.stopLossPercent('');
                    observableSetLimitsObject.ccySLAmount('');

                    // Set TP
                    if (parentData.tpRate && ko.isWriteableObservable(parentData.tpRate)) {
                        parentData.tpRate(Dictionary.GetItem('setLimit'));
                    }

                    ko.postbox.publish('stop-loss-changed', 'none');
                }

                observableSetLimitsObject.curSlActiveTab(activeTab);
            }

            //-------------------------------------------------------
            function setTpActiveTab(activeTab) {
                activeTab = activeTab || eSetLimitsTabs.None;

                if (activeTab == eSetLimitsTabs.None) {
                    // Set TP
                    if (parentData.tpRate && ko.isWriteableObservable(parentData.tpRate)) {
                        parentData.tpRate(Dictionary.GetItem('setLimit'));
                    }

                    observableSetLimitsObject.takeProfitRate('');
                    observableSetLimitsObject.takeProfitAmount('');
                    observableSetLimitsObject.takeProfitPercent('');
                    observableSetLimitsObject.ccyTPAmount('');

                    ko.postbox.publish('take-profit-changed', 'none');
                }

                observableSetLimitsObject.curTpActiveTab(activeTab);
            }

            //-------------------------------------------------------
            function changeTabsVisibility(tab) {
                tab = tab || eSetLimitsTabs.None;

                if (tab == eSetLimitsTabs.None) {
                    setActiveTab(tab);
                    observableSetLimitsObject.isShowTabs(false);
                } else {
                    observableSetLimitsObject.isShowTabs(true);
                }

                ko.postbox.publish('deal-slip-toggle', { limit: tab === eSetLimitsTabs.None ? 'minimized' : 'maximized' });

                observableSetLimitsObject.visibleTab(tab);
            }

            //-------------------------------------------------------
            function setInitial() {
                observableSetLimitsObject.customerCcyName(customer.prop.defaultCcy());

                observableSetLimitsObject.isShowTabs(false);
                viewProperties.isAdvancedView(false);
                observableSetLimitsObject.defaultTab = inheritedInstance.getSettings(self).defaultTab;

                setActiveTab(observableSetLimitsObject.defaultTab);

                // Set SL
                observableSetLimitsObject.stopLossAmount('');
                observableSetLimitsObject.stopLossPercent('');
                observableSetLimitsObject.ccySLAmount('');
                observableSetLimitsObject.displaySLSummary(false);

                // Set TP
                observableSetLimitsObject.takeProfitAmount('');
                observableSetLimitsObject.takeProfitPercent('');
                observableSetLimitsObject.ccyTPAmount('');
                observableSetLimitsObject.displayTPSummary(false);

                // Set SL Rate for edit limit
                if (parentData.slRate && !general.isEmptyType(parentData.slRate()) && general.toNumeric(parentData.slRate())) {
                    observableSetLimitsObject.stopLossRate(parentData.slRate());
                } else {
                    observableSetLimitsObject.stopLossRate('');
                }

                // Set TP Rate for edit limit
                if (parentData.tpRate && !general.isEmptyType(parentData.tpRate()) && general.toNumeric(parentData.tpRate())) {
                    observableSetLimitsObject.takeProfitRate(parentData.tpRate());
                } else {
                    observableSetLimitsObject.takeProfitRate('');
                }

                //make clean so it is not considered dirty
                markClean();

                ko.postbox.publish('stop-loss-changed', 'none');
                ko.postbox.publish('take-profit-changed', 'none');
            }

            //-------------------------------------------------------
            function state() {
                return observableSetLimitsObject.State();
            }

            //-------------------------------------------------------
            function start(callback) {
                observableSetLimitsObject.State(eViewState.Start);

                if (general.isFunctionType(callback)) {
                    callback();
                }
            }

            //-------------------------------------------------------
            function stop() {
                observableSetLimitsObject.State(eViewState.Stop);
            }

            //-------------------------------------------------------
            return {
                TPField: takeProfitField,
                SLField: stopLossField,
                Data: observableSetLimitsObject,
                ObservableSetLimitsObject: observableSetLimitsObject,
                ViewProperties: viewProperties,
                Init: init,
                Validate: validate,
                ValidateSlRate: validateSlRate,
                ValidateTpRate: validateTpRate,
                SetInitial: setInitial,
                MarkClean: markClean,
                SetActiveTab: setActiveTab,
                SetSlActiveTab: setSlActiveTab,
                SetTpActiveTab: setTpActiveTab,
                ChangeTabVisibility: changeTabsVisibility,
                State: state,
                Start: start,
                Stop: stop
            };
        }

        return SetLimitsViewModel;
    }
);