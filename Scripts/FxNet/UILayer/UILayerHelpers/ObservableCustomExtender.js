define(
    'helpers/ObservableCustomExtender',
    [
        'knockout',
        'handlers/general',
        'vendor/knockout.validation'
    ],
    function (ko, general) {
        ko.extenders.dirty = function dirtyKoExtender(target, startDirty) {
            target.cleanValue = ko.observable(ko.toJS(target)); // the cleanValue is normalized
            target.originalValue = target.cleanValue;
            target.dirtyOverride = ko.observable(ko.utils.unwrapObservable(startDirty));

            target.isDirty = ko.computed(function isDirtyHandler() {
                // get normalized observable value
                var currentValue = ko.toJS(this),
                    cleanValue = this.cleanValue(),
                    dirtyOverride = this.dirtyOverride(),
                    result;

                if (typeof currentValue == 'object') {
                    result = dirtyOverride || !general.equals(currentValue, cleanValue);
                }
                else if (isNaN(currentValue) || isNaN(cleanValue)) {
                    result = dirtyOverride || currentValue !== cleanValue;
                }
                else {
                    result = dirtyOverride || Number(currentValue) != Number(cleanValue);
                }

                return result;
            }, target);

            target.markClean = function markClean() {
                this.cleanValue(ko.toJS(this));
                this.dirtyOverride(false);
            };

            target.markDirty = function markDirty() {
                this.dirtyOverride(true);
            };

            return target;
        };

        ko.extenders.toNumericLength = function toNumericLengthKoExtender(target, options) {
            if (options !== false && target) {
                if (target.toNumericLengthSubscriber &&
                    general.isFunctionType(target.toNumericLengthSubscriber.dispose)) {
                    target.toNumericLengthSubscriber.dispose();
                }

                target.toNumericLengthSubscriber = target.subscribe(function (value) {
                    var observable = this,
                        maxValue = Number.MAX_SAFE_INTEGER,
                        ranges = options.ranges,
                        isAllowNAValue = ko.utils.unwrapObservable(options.isAllowNAValue),
                        isForceCeil = ko.utils.unwrapObservable(options.isForceCeil),
                        valueAsNumber = general.toNumeric(value);

                    if (value === '') {
                        return;
                    }

                    if (isAllowNAValue && value === 'NA') {
                        return;
                    }

                    if (valueAsNumber != 'NA' && valueAsNumber <= maxValue) {
                        valueAsNumber = Math.abs(valueAsNumber);
                        var decimalDigits = getDecimalDigits(valueAsNumber, ranges),
                            currentNumberOfDecimalDigits = general.lenAfterDelimeter(valueAsNumber);

                        if (currentNumberOfDecimalDigits > decimalDigits) {
                            var multiplier = Math.pow(10, decimalDigits);

                            if (isForceCeil) {
                                valueAsNumber = Math.ceil(valueAsNumber * multiplier) / multiplier;
                            } else {
                                valueAsNumber = Math.floor(valueAsNumber * multiplier) / multiplier;
                            }
                        }

                        if (valueAsNumber != value) {
                            observable(valueAsNumber);
                        }
                    }
                    else {
                        observable('');
                    }
                }, target);

            }
            else if (target && target.toNumericLengthSubscriber) {
                target.toNumericLengthSubscriber.dispose();
                target.toNumericLengthSubscriber = null;
            }

            function getDecimalDigits(value, ranges) {
                var range = ranges.find(function (item) {
                    return (value >= item.from && value < item.to);
                });

                return range.decimalDigits;
            }

            return target;
        }

        ko.extenders.amountValidation = function amountValidationKoExtender(target, options) {
            if (options !== false && target) {
                var dealsAmounts = ko.utils.unwrapObservable(options);
                target.minAmount = ko.observable();
                target.maxAmount = ko.observable();

                target.minAmount(dealsAmounts.reduce(function (accumulator, value) {
                    return Math.min(accumulator, value);
                },
                    dealsAmounts[0] || 0));

                target.maxAmount(dealsAmounts.reduce(function (accumulator, value) {
                    return Math.max(accumulator, value);
                },
                    dealsAmounts[dealsAmounts.length - 1] || 10000000000));

                removeAmountValidation();

                target.validationRule = ko.validation.addAnonymousRule(target, {
                    validator: function (value) {
                        var valueToCheck = general.toNumeric(value);
                        if (isNaN(valueToCheck)) {
                            valueToCheck = -1; // Invalid value for all possible cases
                        }
                        return target.minAmount() <= valueToCheck && valueToCheck <= target.maxAmount();
                    },
                    params: true
                });
            }
            else if (options === false && target) {
                removeAmountValidation();
            }

            function removeAmountValidation() {
                if (general.isDefinedType(target.rules) && !general.isEmptyValue(target.validationRule)) {
                    var prevValidationRule = target.rules().find(function (item) {
                        return item.rule === target.validationRule;
                    });

                    if (prevValidationRule) {
                        target.rules.remove(prevValidationRule);
                    }
                }
            }
        };

        ko.extenders.empty = function emptyKoExtender(target, enable) {
            if (enable && !target.isEmpty) {
                target.isEmpty = ko.computed(function isEmptyHandler() {
                    var value = ko.utils.unwrapObservable(this);
                    return general.isEmptyValue(value);
                }, target);
            }
            else if (target.isEmpty) {
                target.isEmpty.dispose();
            }

            return target;
        };

        ko.extenders.triggerValidation = function triggerValidationKoExtender(target, enable) {
            if (enable && ko.validation.utils.isValidatable(target)) {
                target.triggerValidation = function triggerValidation() {
                    var value = ko.utils.unwrapObservable(this);
                    this.notifySubscribers(value);
                };
            }
            else if (!enable && target.triggerValidation) {
                target.triggerValidation = null;
            }

            return target;
        };

        // Tooltip validation can be added only for observable who extend ko validation 
        // The message for tooltip validation can be set in observable extend with a new value
        ko.extenders.tooltipValidation = function tooltipValidationKoExtender(target, options) {
            if (options !== false) {
                target.tooltipClosed = ko.observable(false);
                target.dummyObservable = ko.observable('');
                target.tooltipVisible = ko.pureComputed(function tooltipVisibleHandler() {
                    var showTooltip = this.showTooltip(),
                        isValid = this.isValid(),
                        isClosed = this.tooltipClosed();

                    this.dummyObservable.notifySubscribers();

                    return !isClosed && !isValid && showTooltip;
                }, target);

                target.showTooltip = ko.pureComputed(typeof options.showTooltip === 'function' ? options.showTooltip : function () { return true; });

                target.closeTooltip = function closeTooltip() {
                    this.tooltipClosed(true);
                };

                target.resetTooltip = function resetTooltip() {
                    this.tooltipClosed(false);
                };

                target._selfSubscriber = target.subscribe(function () {
                    this.tooltipClosed(false);
                }, target);

                target.tooltipMessage = ko.pureComputed(function tooltipMessageHandler() {
                    this.dummyObservable();

                    if (options.message) {
                        return options.message;
                    }

                    return this.error;
                }, target);

                if (ko.validation.utils.isValidatable(target)) {
                    if (options.notify === 'always') {
                        target.__valid__ = target.__valid__.extend({ notify: 'always' });
                        target.isValid = target.isValid.extend({ notify: 'always' });
                    }
                }
            }
            else {
                var disposableProps = ['tooltipMessage', '_selfSubscriber', 'showTooltip', 'tooltipVisible'],
                    nullableProps = ['resetTooltip', 'closeTooltip', 'dummyObservable', 'tooltipClosed'];
                disposableProps.forEach(function (prop) {
                    if (target[prop]) {
                        target[prop].dispose();
                        delete target[prop];
                    }
                });

                nullableProps.forEach(function (prop) {
                    if (target[prop]) {
                        target[prop] = null;
                        delete target[prop];
                    }
                });
            }

            return target;
        };

        /**
         * Extend an observable to support incremental value update, 
         * adding increment and decrement methods on target observable
         * 
         * For more details, see {@link ObservableExtenderTest.js}
         * 
         * If options === false, then the incremental logic is removed from observable 
         * @param {ko.observable} target observable to extend
         * @param {Object} options incremental values: units, tenths, hundreds, thousands
         * @returns {ko.observable}  target
         */
        ko.extenders.incremental = function incrementalKoExtender(target, options) {
            if (options !== false) {
                options = options || {};

                var defaults = {
                    precision: 4,
                    ranges: [
                        { from: 0, to: 10, step: 1 }, // units
                        { from: 10, to: 100, step: 5 }, // tens
                        { from: 100, to: 1000, step: 50 }, // hundreds
                        { from: 1000, to: Number.MAX_VALUE, step: 500 } // thousands
                    ]
                };

                options = ko.utils.extend(defaults, options);

                var getStepValue = function (currentValue) {
                    var foundRange = options.ranges.find(function (item) {
                        return currentValue >= item.from && currentValue < item.to;
                    });

                    if (!foundRange) {
                        return 1;
                    }

                    return foundRange.step;
                };

                var normalizeValue = function (direction, value, precision) {
                    value = Number(value);

                    var multiplier = Math.pow(10, precision),
                        currentStep = getStepValue(value),
                        multipliedCurrentStep = Math.floor(currentStep * multiplier),
                        multipliedValue = Math.floor(value * multiplier),
                        valueToReturn = multipliedValue,
                        newValue,
                        mod;

                    if (direction === 'up') {
                        newValue = multipliedValue + multipliedCurrentStep;
                        mod = newValue % multipliedCurrentStep;

                        valueToReturn = newValue - mod;

                    }
                    else if (direction === 'down') {
                        newValue = multipliedValue - multipliedCurrentStep;
                        mod = newValue % multipliedCurrentStep;

                        if (mod !== 0) {
                            valueToReturn = multipliedValue - mod;
                        }
                        else {
                            var nextStep = getStepValue(value - currentStep);
                            var multipliedNextStep = nextStep * multiplier;

                            valueToReturn = multipliedValue - multipliedNextStep;
                        }
                    }

                    return valueToReturn / multiplier;
                };

                target.increment = function increment(doNotUpdate) {
                    var newValue = normalizeValue('up', this(), options.precision);

                    if (!doNotUpdate) {
                        this(newValue);
                    }

                    return newValue;
                };

                target.decrement = function decrement(doNotUpdate) {
                    var newValue = normalizeValue('down', this(), options.precision);

                    if (!doNotUpdate) {
                        this(newValue);
                    }

                    return newValue;
                };

                target.step = ko.computed(function () {
                    return getStepValue(target());
                });

                // Extend ko.observable
                ko.subscribable.fn.isIncremental = function isIncremental() {
                    var observable = this;

                    return (typeof observable.increment === 'function') && (typeof observable.decrement === 'function');
                };
            }
            else {
                if (target.step) {
                    target.step.dispose();
                }

                target.step = null;
                target.increment = null;
                target.decrement = null;
            }

            return target;
        }

        return ko;
    }
);
