define(
    'helpers/CustomKOBindings/SpinnerFieldBinding',
    [
        'require',
        'knockout',
        'handlers/general',
        'jquery',
        'devicewidgets/spinner'

    ],
    function SpinnerFieldBinding(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            $ = require('jquery');

        ko.bindingHandlers.closingLimitSpinner = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var options = allBindingsAccessor().spinnerOptions || {},
                    $spinner,
                    btnId,
                    target = valueAccessor(),
                    startSpinFromObservable = allBindingsAccessor().spinnerOptions.startSpinFrom,
                    $increment,
                    $decrement,
                    subscriber,
                    minSubscriber,
                    maxSubscriber,
                    startSpinFromSubscriber;

                if (!options.input) {
                    $spinner = $(element);
                } else if (options.input.indexOf('#') === 0) {
                    $spinner = $(options.input);
                } else {
                    $spinner = $(element).find(options.input);
                }

                if (!$spinner.length) {
                    return;
                }

                btnId = $spinner.attr("id") || $spinner.attr("name") || "";

                var handleDecrementButton = function () {
                    if (!$decrement) {
                        return;
                    }

                    var startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom();
                    var targetValue = parseFloat(target());

                    if (target() === "NA" && startSpinFrom === eStartSpinFrom.Above) {
                        $decrement.toggleClass("active", false);
                        return;
                    }

                    if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                        $decrement.toggleClass("active", true);
                        return;
                    }

                    var value = Number(target()),
                        minValue = allBindingsAccessor().spinnerOptions.min();

                    if (value <= minValue) {
                        $decrement.toggleClass("active", false);
                    } else {
                        $decrement.toggleClass("active", true);
                    }
                };

                var handleIncrementButton = function () {
                    if (!$increment) {
                        return;
                    }

                    var startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom();
                    var targetValue = parseFloat(target());
                    if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                        $increment.toggleClass("active", false);
                        return;
                    }

                    var value = Number(target()),
                        maxValue = allBindingsAccessor().spinnerOptions.max();

                    if (value >= maxValue) {
                        $increment.toggleClass("active", false);
                    } else {
                        $increment.toggleClass("active", true);
                    }
                };

                var handleButtons = function () {
                    handleIncrementButton();
                    handleDecrementButton();
                };

                $spinner.fxspinner({
                    step: ko.toJS(options.step),
                    page: ko.toJS(options.page),
                    numberFormat: ko.toJS(options.numberFormat),
                    culture: ko.toJS(options.culture),
                    incremental: true,
                    create: function () {
                        var minObservable = allBindingsAccessor().spinnerOptions.min,
                            maxObservable = allBindingsAccessor().spinnerOptions.max;

                        $increment = $(element).find(".ui-spinner-button.ui-spinner-up");
                        if ($increment.length) {
                            $increment.addClass("increment active");
                            if (btnId) {
                                $increment.attr("id", btnId.concat("BtnIncrement"));
                            }
                        }

                        $decrement = $(element).find(".ui-spinner-button.ui-spinner-down");
                        if ($decrement.length) {
                            $decrement.addClass("decrement active");
                            if (btnId) {
                                $decrement.attr("id", btnId.concat("BtnDecrement"));
                            }
                        }

                        handleButtons();

                        subscriber = target.subscribe(function () {
                            handleButtons();
                        });

                        minSubscriber = minObservable.subscribe(handleDecrementButton);
                        maxSubscriber = maxObservable.subscribe(handleIncrementButton);
                        startSpinFromSubscriber = startSpinFromObservable.subscribe(handleButtons);
                    },
                    spin: function (e, ui) {
                        if (general.isNullOrUndefined($spinner)) {
                            return false;
                        }

                        e.preventDefault();

                        var value = $spinner.fxspinner("value"),
                            minValue = allBindingsAccessor().spinnerOptions.min(),
                            maxValue = allBindingsAccessor().spinnerOptions.max(),
                            startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom(),
                            direction = ui.value > value ? "up" : "down";

                        var targetValue = parseFloat(target());

                        if (startSpinFrom === eStartSpinFrom.None) {
                            target('');
                            return false;
                        }

                        if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                            target(maxValue);
                            $spinner.fxspinner("value", maxValue);

                            return false;
                        }

                        if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Above) {
                            target(minValue);
                            $spinner.fxspinner("value", minValue);

                            return false;
                        }

                        if (direction === "up" && ui.value < minValue) {
                            target(minValue);
                            $spinner.fxspinner("value", minValue);

                            return false;
                        }

                        if (direction === "down" && ui.value > maxValue) {
                            target(maxValue);
                            $spinner.fxspinner("value", maxValue);

                            return false;
                        }

                        if (typeof target.isIncremental === "function" && target.isIncremental()) {
                            // handle observables extended with incremental custom extender
                            var newValue;

                            if (direction === "up") {
                                newValue = target.increment(true);
                            }

                            if (direction === "down") {
                                newValue = target.decrement(true);
                            }

                            if (!isNaN(newValue) && newValue < minValue) {
                                newValue = minValue;
                            }

                            if (!isNaN(newValue) && newValue > maxValue) {
                                newValue = maxValue;
                            }

                            if (!isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
                                target(newValue);
                                $spinner.fxspinner("value", newValue);
                            }
                        } else if (ui.value >= minValue && ui.value <= maxValue) {
                            if (value != ui.value) {
                                // update only when the value has been changed
                                target(ui.value);
                                $spinner.fxspinner("value", ui.value);
                            }
                        }

                        return false;
                    }
                });

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (subscriber) {
                        subscriber.dispose();
                    }

                    if (minSubscriber) {
                        minSubscriber.dispose();
                    }

                    if (maxSubscriber) {
                        maxSubscriber.dispose();
                    }

                    if (startSpinFromSubscriber) {
                        startSpinFromSubscriber.dispose();
                    }

                    if (!general.isNullOrUndefined($spinner) && $spinner.length) {
                        $spinner.fxspinner("destroy");
                        $spinner = null;
                    }

                    $decrement = null;
                    $increment = null;
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var options = ko.toJS(allBindingsAccessor().spinnerOptions) || {},
                    $spinner;

                if (!options.input) {
                    $spinner = $(element);
                } else if (options.input.indexOf('#') === 0) {
                    $spinner = $(options.input);
                } else {
                    $spinner = $(element).find(options.input);
                }

                if (!$spinner.length) {
                    return;
                }

                var delta = {},
                    currentStep = $spinner.fxspinner("option", "step"),
                    currentFormat = $spinner.fxspinner("option", "numberFormat"),
                    changeOptions = false;

                if (currentStep != options.step) {
                    changeOptions = true;
                    delta.step = options.step;
                }

                if (currentFormat != options.numberFormat) {
                    changeOptions = true;
                    delta.numberFormat = options.numberFormat;
                }

                if (changeOptions) {
                    $spinner.fxspinner("option", delta);
                }
            }
        };

        ko.bindingHandlers.openLimitSpinner = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var options = allBindingsAccessor().spinnerOptions || {},
                    $spinner = options.input.indexOf("#") === 0 ? $(options.input) : $(element).find(options.input),
                    btnId = $spinner.attr("id"),
                    target = valueAccessor(),
                    $increment,
                    $decrement,
                    subscriber,
                    min1Subscriber,
                    max2Subscriber;

                if (!$spinner.length) {
                    return;
                }

                var handleDecrementButton = function () {
                    if (!$decrement) {
                        return;
                    }

                    var targetValue = parseFloat(target());

                    if (isNaN(targetValue)) {
                        $decrement.toggleClass("active", true);
                        return;
                    }

                    var value = Number(target()),
                        minValue = allBindingsAccessor().spinnerOptions.min1();

                    if (value <= minValue) {
                        $decrement.toggleClass("active", false);
                    } else {
                        $decrement.toggleClass("active", true);
                    }
                };

                var handleIncrementButton = function () {
                    if (!$increment) {
                        return;
                    }

                    var value = Number(target()),
                        maxValue = allBindingsAccessor().spinnerOptions.max2();

                    if (value >= maxValue) {
                        $increment.toggleClass("active", false);
                    } else {
                        $increment.toggleClass("active", true);
                    }
                };

                $spinner.fxspinner({
                    step: ko.toJS(options.step),
                    page: ko.toJS(options.page),
                    numberFormat: ko.toJS(options.numberFormat),
                    incremental: true,
                    culture: ko.toJS(options.culture),
                    create: function () {
                        var min1Observable = allBindingsAccessor().spinnerOptions.min1,
                            max2Observable = allBindingsAccessor().spinnerOptions.max2;

                        $increment = $(element).find(".ui-spinner-button.ui-spinner-up");
                        if ($increment.length) {
                            $increment.addClass("increment active");
                            $increment.attr("id", btnId.concat("BtnIncrement"));
                        }

                        $decrement = $(element).find(".ui-spinner-button.ui-spinner-down");
                        if ($decrement.length) {
                            $decrement.addClass("decrement active");
                            $decrement.attr("id", btnId.concat("BtnDecrement"));
                        }

                        subscriber = target.subscribe(function () {
                            handleIncrementButton();
                            handleDecrementButton();
                        });

                        min1Subscriber = min1Observable.subscribe(handleDecrementButton);
                        max2Subscriber = max2Observable.subscribe(handleIncrementButton);
                    },
                    spin: function (e, ui) {

                        if (general.isNullOrUndefined($spinner)) {
                            return false;
                        }

                        e.preventDefault();
                        var value = $spinner.fxspinner("value"),
                            allBindings = allBindingsAccessor(),
                            minValue1 = allBindings.spinnerOptions.min1(),
                            maxValue1 = allBindings.spinnerOptions.max1(),
                            minValue2 = allBindings.spinnerOptions.min2(),
                            maxValue2 = allBindings.spinnerOptions.max2(),
                            direction = ui.value > value ? "up" : "down",
                            targetValue = parseFloat(target());

                        if (direction === "up" && (isNaN(targetValue) || ui.value < minValue1)) {
                            target(minValue2);
                            $spinner.fxspinner("value", minValue2);

                            return false;
                        }

                        if (direction === "up" && ui.value > maxValue1 && ui.value < minValue2) {
                            target(minValue2);
                            $spinner.fxspinner("value", minValue2);

                            return false;
                        }

                        if (direction === "down" && (isNaN(targetValue) || ui.value > maxValue2)) {
                            target(maxValue1);
                            $spinner.fxspinner("value", maxValue1);

                            return false;
                        }

                        if (direction === "down" && ui.value > maxValue1 && ui.value < minValue2) {
                            target(maxValue1);
                            $spinner.fxspinner("value", maxValue1);

                            return false;
                        }

                        if (ui.value >= minValue1 && ui.value <= maxValue2) {
                            if (value != ui.value) {
                                // update only when the value has been changed
                                target(ui.value);
                                $spinner.fxspinner("value", ui.value);
                            }
                        }

                        return false;
                    }
                });

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (subscriber) {
                        subscriber.dispose();
                    }

                    if (min1Subscriber) {
                        min1Subscriber.dispose();
                    }

                    if (max2Subscriber) {
                        max2Subscriber.dispose();
                    }

                    if (!general.isNullOrUndefined($spinner) && $spinner.length) {
                        $spinner.fxspinner("destroy");
                        $spinner = null;
                    }

                    $decrement = null;
                    $increment = null;
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var options = ko.toJS(allBindingsAccessor().spinnerOptions) || {},
                    $spinner;

                if (!options.input) {
                    $spinner = $(element);
                } else if (options.input.indexOf('#') === 0) {
                    $spinner = $(options.input);
                } else {
                    $spinner = $(element).find(options.input);
                }

                if (!$spinner.length) {
                    return;
                }

                var delta = {},
                    currentStep = $spinner.fxspinner("option", "step"),
                    currentFormat = $spinner.fxspinner("option", "numberFormat"),
                    changeOptions = false;

                if (currentStep != options.step) {
                    changeOptions = true;
                    delta.step = options.step;
                }

                if (currentFormat != options.numberFormat) {
                    changeOptions = true;
                    delta.numberFormat = options.numberFormat;
                }

                if (changeOptions) {
                    $spinner.fxspinner("option", delta);
                }
            }
        };

        ko.bindingHandlers.amountSpinner = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var options = allBindingsAccessor().spinnerOptions || {},
                    $spinner,
                    btnId,
                    target = valueAccessor(),
                    startSpinFromObservable = allBindingsAccessor().spinnerOptions.startSpinFrom,
                    $increment,
                    $decrement,
                    subscriber,
                    minSubscriber,
                    maxSubscriber,
                    startSpinFromSubscriber;

                if (!options.input) {
                    $spinner = $(element);
                } else if (options.input.indexOf('#') === 0) {
                    $spinner = $(options.input);
                } else {
                    $spinner = $(element).find(options.input);
                }

                if (!$spinner.length) {
                    return;
                }

                btnId = $spinner.attr("id") || $spinner.attr("name") || "";

                var handleDecrementButton = function () {
                    if (!$decrement) {
                        return;
                    }

                    var startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom();
                    var targetValue = parseFloat(target());

                    if (target() === "NA" && startSpinFrom === eStartSpinFrom.Above) {
                        $decrement.toggleClass("active", false);
                        return;
                    }

                    if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                        $decrement.toggleClass("active", true);
                        return;
                    }

                    var value = Number(target()),
                        minValue = allBindingsAccessor().spinnerOptions.min();

                    if (value <= minValue) {
                        $decrement.toggleClass("active", false);
                    } else {
                        $decrement.toggleClass("active", true);
                    }
                };

                var handleIncrementButton = function () {
                    if (!$increment) {
                        return;
                    }

                    var startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom();
                    var targetValue = parseFloat(target());
                    if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                        $increment.toggleClass("active", false);
                        return;
                    }

                    var value = Number(target()),
                        maxValue = allBindingsAccessor().spinnerOptions.max();

                    if (value >= maxValue) {
                        $increment.toggleClass("active", false);
                    } else {
                        $increment.toggleClass("active", true);
                    }
                };

                var handleButtons = function () {
                    handleIncrementButton();
                    handleDecrementButton();
                };

                $spinner.fxspinner({
                    step: ko.toJS(options.step),
                    page: ko.toJS(options.page),
                    numberFormat: ko.toJS(options.numberFormat),
                    incremental: true,
                    create: function () {
                        var minObservable = allBindingsAccessor().spinnerOptions.min,
                            maxObservable = allBindingsAccessor().spinnerOptions.max;

                        $increment = $(element).find(".ui-spinner-button.ui-spinner-up");
                        if ($increment.length) {
                            $increment.addClass("increment active");
                            if (btnId) {
                                $increment.attr("id", btnId.concat("BtnIncrement"));
                            }
                        }

                        $decrement = $(element).find(".ui-spinner-button.ui-spinner-down");
                        if ($decrement.length) {
                            $decrement.addClass("decrement active");
                            if (btnId) {
                                $decrement.attr("id", btnId.concat("BtnDecrement"));
                            }
                        }

                        handleButtons();

                        subscriber = target.subscribe(function () {
                            handleButtons();
                        });

                        minSubscriber = minObservable.subscribe(handleDecrementButton);
                        maxSubscriber = maxObservable.subscribe(handleIncrementButton);
                        startSpinFromSubscriber = startSpinFromObservable.subscribe(handleButtons);
                    },
                    spin: function (e, ui) {

                        if (general.isNullOrUndefined($spinner)) {
                            return false;
                        }
                        e.preventDefault();

                        var value = $spinner.fxspinner("value"),
                            minValue = allBindingsAccessor().spinnerOptions.min(),
                            maxValue = allBindingsAccessor().spinnerOptions.max(),
                            startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom(),
                            direction = ui.value > value ? "up" : "down";

                        var targetValue = parseFloat(target());
                        if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                            target(maxValue);
                            $spinner.fxspinner("value", maxValue);

                            return false;
                        }

                        if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Above) {
                            target(minValue);
                            $spinner.fxspinner("value", minValue);

                            return false;
                        }

                        if (direction === "up" && ui.value < minValue) {
                            target(minValue);
                            $spinner.fxspinner("value", minValue);

                            return false;
                        }

                        if (direction === "down" && ui.value > maxValue) {
                            target(maxValue);
                            $spinner.fxspinner("value", maxValue);

                            return false;
                        }

                        if (typeof target.isIncremental === "function" && target.isIncremental()) {
                            // handle observables extended with incremental custom extender
                            var newValue;

                            if (direction === "up") {
                                newValue = target.increment(true);
                            }

                            if (direction === "down") {
                                newValue = target.decrement(true);
                            }

                            if (!isNaN(newValue) && newValue < minValue) {
                                newValue = minValue;
                            }

                            if (!isNaN(newValue) && newValue > maxValue) {
                                newValue = maxValue;
                            }

                            if (!isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
                                target(newValue);
                                $spinner.fxspinner("value", newValue);
                            }
                        } else if (ui.value >= minValue && ui.value <= maxValue) {
                            if (value != ui.value) {
                                // update only when the value has been changed
                                target(ui.value);
                                $spinner.fxspinner("value", ui.value);
                            }
                        }

                        return false;
                    }
                });

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (subscriber) {
                        subscriber.dispose();
                    }

                    if (minSubscriber) {
                        minSubscriber.dispose();
                    }

                    if (maxSubscriber) {
                        maxSubscriber.dispose();
                    }

                    if (startSpinFromSubscriber) {
                        startSpinFromSubscriber.dispose();
                    }

                    if (!general.isNullOrUndefined($spinner) && $spinner.length) {
                        $spinner.fxspinner("destroy");
                        $spinner = null;
                    }

                    $decrement = null;
                    $increment = null;
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    value = general.isStringType(rawValue) && rawValue !== ""
                        ? Globalize.parseFloat(rawValue)
                        : rawValue;

                var options = ko.toJS(allBindingsAccessor().spinnerOptions) || {},
                    $spinner;

                if (!options.input) {
                    $spinner = $(element);
                } else if (options.input.indexOf('#') === 0) {
                    $spinner = $(options.input);
                } else {
                    $spinner = $(element).find(options.input);
                }

                if (!$spinner.length) {
                    return;
                }

                var delta = {},
                    currentStep = $spinner.fxspinner("option", "step"),
                    currentFormat = $spinner.fxspinner("option", "numberFormat"),
                    changeOptions = false;

                if (currentStep != options.step) {
                    changeOptions = true;
                    delta.step = options.step;
                }

                if (currentFormat != options.numberFormat) {
                    changeOptions = true;
                    delta.numberFormat = options.numberFormat;
                }

                if (changeOptions) {
                    $spinner.fxspinner("option", delta);
                }

                // update value
                if (!general.isEmptyValue(value)) {
                    var spinnerNumberFormat = $spinner.fxspinner("option", "numberFormat"),
                        currentValue = $spinner.val(),
                        formattedValue = Globalize.format(value, spinnerNumberFormat);

                    if (currentValue !== formattedValue && $spinner.get(0) !== document.activeElement) {
                        clearTimeout($spinner.updateValueTimer);

                        $spinner.updateValueTimer = setTimeout(function ($field, valueToSet) {
                            var instance = $field.fxspinner("instance");
                            if (!instance) {
                                return;
                            }

                            $field.fxspinner("value", valueToSet);
                            if (isNaN(parseFloat(valueToSet))) {
                                $field.val('');
                            }
                            else {
                                $field.val(valueToSet);
                            }
                            if ($field.is(":focus")) {
                                $field.trigger("blur");
                            }

                        }, 10, $spinner, formattedValue);
                    }
                }
            }
        };

        ko.bindingHandlers.lowMarginSpinner = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var options = allBindingsAccessor().spinnerOptions || {},
                    $spinner,
                    btnId,
                    target = valueAccessor(),
                    startSpinFromObservable = allBindingsAccessor().spinnerOptions.startSpinFrom,
                    $increment,
                    $decrement,
                    subscriber,
                    minSubscriber,
                    maxSubscriber,
                    startSpinFromSubscriber,
                    enabledSubscriber;

                if (!options.input) {
                    $spinner = $(element);
                } else if (options.input.indexOf('#') === 0) {
                    $spinner = $(options.input);
                } else {
                    $spinner = $(element).find(options.input);
                }

                if (!$spinner.length) {
                    return;
                }

                btnId = $spinner.attr("id") || $spinner.attr("name") || "";

                var handleDecrementButton = function () {
                    if (!$decrement) {
                        return;
                    }

                    var enabled = allBindingsAccessor().spinnerOptions.enabled();
                    if (!enabled)
                        return;

                    var startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom();
                    var targetValue = parseFloat(target());

                    if (target() === "NA" && startSpinFrom === eStartSpinFrom.Above) {
                        $decrement.toggleClass("active", false);
                        return;
                    }

                    if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                        $decrement.toggleClass("active", true);
                        return;
                    }

                    var value = Number(target()),
                        minValue = allBindingsAccessor().spinnerOptions.min();

                    if (value <= minValue) {
                        $decrement.toggleClass("active", false);
                    } else {
                        $decrement.toggleClass("active", true);
                    }
                };

                var handleIncrementButton = function () {
                    if (!$increment) {
                        return;
                    }
                    var enabled = allBindingsAccessor().spinnerOptions.enabled();
                    if (!enabled)
                        return;

                    var startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom();
                    var targetValue = parseFloat(target());
                    if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                        $increment.toggleClass("active", false);
                        return;
                    }

                    var value = Number(target()),
                        maxValue = allBindingsAccessor().spinnerOptions.max();

                    if (value >= maxValue) {
                        $increment.toggleClass("active", false);
                    } else {
                        $increment.toggleClass("active", true);
                    }
                };

                var handleButtons = function () {
                    handleIncrementButton();
                    handleDecrementButton();
                };

                var enableChanged = function (value) {
                    if ($increment) {
                        $increment.toggleClass("active", value);
                        $increment.toggleClass("disabled", !value);
                    }
                    if ($decrement) {
                        $decrement.toggleClass("active", value);
                        $decrement.toggleClass("disabled", !value);
                    }

                }
                $spinner.fxspinner({
                    step: ko.toJS(options.step),
                    page: ko.toJS(options.page),
                    numberFormat: ko.toJS(options.numberFormat),
                    incremental: true,
                    create: function () {
                        var minObservable = allBindingsAccessor().spinnerOptions.min,
                            maxObservable = allBindingsAccessor().spinnerOptions.max,
                            enabledObservable = allBindingsAccessor().spinnerOptions.enabled;

                        $increment = $(element).find(".ui-spinner-button.ui-spinner-up");
                        if ($increment.length) {
                            $increment.addClass("increment");
                            if (btnId) {
                                $increment.attr("id", btnId.concat("BtnIncrement"));
                            }
                            if (enabledObservable())
                                $increment.addClass("active");
                            else
                                $increment.addClass("disabled");
                        }

                        $decrement = $(element).find(".ui-spinner-button.ui-spinner-down");
                        if ($decrement.length) {
                            $decrement.addClass("decrement");
                            if (btnId) {
                                $decrement.attr("id", btnId.concat("BtnDecrement"));
                            }
                            if (enabledObservable())
                                $decrement.addClass("active");
                            else
                                $decrement.addClass("disabled");
                        }

                        handleButtons();

                        subscriber = target.subscribe(function () {
                            handleButtons();
                        });

                        minSubscriber = minObservable.subscribe(handleDecrementButton);
                        maxSubscriber = maxObservable.subscribe(handleIncrementButton);
                        startSpinFromSubscriber = startSpinFromObservable.subscribe(handleButtons);
                        enabledSubscriber = enabledObservable.subscribe(enableChanged);
                    },
                    spin: function (e, ui) {

                        if (general.isNullOrUndefined($spinner)) {
                            return false;
                        }
                        e.preventDefault();

                        var value = $spinner.fxspinner("value"),
                            minValue = allBindingsAccessor().spinnerOptions.min(),
                            maxValue = allBindingsAccessor().spinnerOptions.max(),
                            startSpinFrom = allBindingsAccessor().spinnerOptions.startSpinFrom(),
                            direction = ui.value > value ? "up" : "down";

                        var targetValue = parseFloat(target());
                        if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Below) {
                            target(maxValue);
                            $spinner.fxspinner("value", maxValue);

                            return false;
                        }

                        if (isNaN(targetValue) && startSpinFrom === eStartSpinFrom.Above) {
                            target(minValue);
                            $spinner.fxspinner("value", minValue);

                            return false;
                        }

                        if (direction === "up" && ui.value < minValue) {
                            target(minValue);
                            $spinner.fxspinner("value", minValue);

                            return false;
                        }

                        if (direction === "down" && ui.value > maxValue) {
                            target(maxValue);
                            $spinner.fxspinner("value", maxValue);

                            return false;
                        }

                        if (typeof target.isIncremental === "function" && target.isIncremental()) {
                            // handle observables extended with incremental custom extender
                            var newValue;

                            if (direction === "up") {
                                newValue = target.increment(true);
                            }

                            if (direction === "down") {
                                newValue = target.decrement(true);
                            }

                            if (!isNaN(newValue) && newValue < minValue) {
                                newValue = minValue;
                            }

                            if (!isNaN(newValue) && newValue > maxValue) {
                                newValue = maxValue;
                            }

                            if (!isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
                                target(newValue);
                                $spinner.fxspinner("value", newValue);
                            }
                        } else if (ui.value >= minValue && ui.value <= maxValue) {
                            if (value != ui.value) {
                                // update only when the value has been changed
                                target(ui.value);
                                $spinner.fxspinner("value", ui.value);
                            }
                        }

                        return false;
                    }
                });

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (subscriber) {
                        subscriber.dispose();
                    }

                    if (minSubscriber) {
                        minSubscriber.dispose();
                    }

                    if (maxSubscriber) {
                        maxSubscriber.dispose();
                    }

                    if (startSpinFromSubscriber) {
                        startSpinFromSubscriber.dispose();
                    }

                    if (!general.isNullOrUndefined($spinner) && $spinner.length) {
                        $spinner.fxspinner("destroy");
                        $spinner = null;
                    }

                    if (enabledSubscriber)
                        enabledSubscriber.dispose();

                    $decrement = null;
                    $increment = null;
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    value = general.isStringType(rawValue) && rawValue !== ""
                        ? Globalize.parseFloat(rawValue)
                        : rawValue;

                var options = ko.toJS(allBindingsAccessor().spinnerOptions) || {},
                    $spinner;

                if (!options.input) {
                    $spinner = $(element);
                } else if (options.input.indexOf('#') === 0) {
                    $spinner = $(options.input);
                } else {
                    $spinner = $(element).find(options.input);
                }

                if (!$spinner.length) {
                    return;
                }

                var delta = {},
                    currentStep = $spinner.fxspinner("option", "step"),
                    currentFormat = $spinner.fxspinner("option", "numberFormat"),
                    changeOptions = false;

                if (currentStep != options.step) {
                    changeOptions = true;
                    delta.step = options.step;
                }

                if (currentFormat != options.numberFormat) {
                    changeOptions = true;
                    delta.numberFormat = options.numberFormat;
                }

                if (changeOptions) {
                    $spinner.fxspinner("option", delta);
                }

                // update value
                if (!general.isEmptyValue(value)) {
                    var spinnerNumberFormat = $spinner.fxspinner("option", "numberFormat"),
                        currentValue = $spinner.val(),
                        formattedValue = Globalize.format(value, spinnerNumberFormat);

                    if (currentValue !== formattedValue && $spinner.get(0) !== document.activeElement) {
                        clearTimeout($spinner.updateValueTimer);

                        $spinner.updateValueTimer = setTimeout(function ($field, valueToSet) {
                            var instance = $field.fxspinner("instance");
                            if (!instance) {
                                return;
                            }

                            $field.fxspinner("value", valueToSet);
                            $field.val(valueToSet);
                            $field.trigger("blur");
                        }, 10, $spinner, formattedValue);
                    }
                }
            }
        };
    }
);
