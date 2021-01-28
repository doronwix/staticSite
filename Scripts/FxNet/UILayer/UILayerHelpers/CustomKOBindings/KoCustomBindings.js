define(
    'helpers/customkobindings/KoCustomBindings',
    [
        'require',
        'knockout',
        'handlers/general',
        'jquery',
        'vendor/jquery-ui',
        'customEnums/Consts',
        'constsenums/depositconstants',
        'handlers/languageHelper'
    ],
    function (require) {
        var ko = require('knockout'),
            $ = require('jquery'),
            general = require('handlers/general');

        // Web/Mobile
        ko.bindingHandlers.balloon = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()) || {};
                var $elementTrigger = $(element);

                $elementTrigger.uniqueId();
                var elementTriggerUniqueId = $elementTrigger.attr('id');

                if (!$elementTrigger.attr('title')) {
                    $elementTrigger.attr('title', '***missingTitleAttr');
                }

                if (options.closeEvent === 'click') {
                    // should call .off(
                    $elementTrigger.on('mouseout focusout', function (event) {
                        event.stopImmediatePropagation();
                    });

                    $(document).on(
                        'click.outsideBallon.' + elementTriggerUniqueId,
                        function () {
                            if ($elementTrigger.data('uiTooltipOpen')) {
                                closeTooltip($elementTrigger);
                            }
                        }
                    );
                }

                if (Browser.getBrowserName().toLowerCase() === 'safari') {
                    options.tooltipClass += ' safari';
                }

                $.extend(options.position, {
                    using: function (position, feedback) {
                        // close all opened tooltips in a case that one its closeEvent === click
                        $('[aria-describedby]').each(function (i, el) {
                            if (element !== el) {
                                closeTooltip($(el));
                            }
                        });

                        $elementTrigger.tooltip('open');

                        if (options.closeEvent === 'click') {
                            $elementTrigger.on('tooltipopen', function (e) {
                                var self = this,
                                    $balloon = $('#' + this.getAttribute('aria-describedby'));
                                // set close on click event on tooltip
                                $balloon.on('click', function () {
                                    closeTooltip($(self));
                                });
                            });
                        }

                        $(this).css(position);

                        if (
                            feedback &&
                            feedback.target &&
                            feedback.target.element &&
                            $(feedback.target.element).hasClass('customTooltipPurpose')
                        ) {
                            var isTooltipBellowElement =
                                $(this).offset().top > $(feedback.target.element).offset().top;

                            if (isTooltipBellowElement) {
                                $(feedback.target.element).addClass('customTooltipPurposeBottom');
                            } else {
                                $(feedback.target.element).removeClass(
                                    'customTooltipPurposeBottom'
                                );
                            }
                        } else {
                            $('<div>')
                                .addClass('arrow')
                                .addClass(feedback.vertical)
                                .addClass(feedback.horizontal)
                                .appendTo(this);
                        }
                    },
                });

                var closeTooltip = function (tooltipElement) {
                    if (!general.isObjectType(tooltipElement)) {
                        return;
                    }

                    if (general.isFunctionType(tooltipElement.removeClass)) {
                        tooltipElement.removeClass('toolTipButtonTrigered');
                    }

                    if (
                        general.isFunctionType(tooltipElement.tooltip) &&
                        !general.isNullOrUndefined(tooltipElement.data('ui-tooltip'))
                    ) {
                        tooltipElement.tooltip('close');
                    }
                };

                $elementTrigger.tooltip(options, {
                    show: false,
                    hide: false,
                    content: function () {
                        if (options.contentKey) {
                            return options.resourceName
                                ? Dictionary.GetItem(options.contentKey, options.resourceName)
                                : Dictionary.GetItem(options.contentKey);
                        }

                        return $(this).attr('title');
                    },
                });

                if (options.closeEvent === 'click') {
                    $elementTrigger.on('mouseenter focusin', function () {
                        $(this).addClass('toolTipButtonTrigered');
                    });
                }

                $elementTrigger.on('click.balloon', function () {
                    $elementTrigger.blur().tooltip('open');

                    if (options.closeEvent === 'click') {
                        $elementTrigger.on('tooltipopen', function (e) {
                            var $balloon = $('#' + this.getAttribute('aria-describedby'));

                            $balloon.on('click', function () {
                                closeTooltip($elementTrigger);
                            });
                        });
                    }

                    if (options.timeout && options.timeout > 0) {
                        clearTimeout($elementTrigger._closeTooltipTimer);
                        $elementTrigger._closeTooltipTimer = setTimeout(
                            function (tooltipElement) {
                                closeTooltip(tooltipElement);
                            },
                            options.timeout,
                            $elementTrigger
                        );
                    }
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (
                    elementToDispose
                ) {
                    clearTimeout(elementToDispose._closeTooltipTimer);

                    $(elementToDispose).off('.balloon');
                    $(elementToDispose).tooltip('destroy');
                    $(document).off('click.outsideBallon.' + elementTriggerUniqueId);
                });
            },
        };
        // For getting values from the resources Dictonary based on the prefix, suffix and/or resourceName
        // Web/Mobile
        ko.bindingHandlers.dictionaryBinding = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    prefix = allBindingsAccessor.get('prefix') || '',
                    suffix = allBindingsAccessor.get('suffix') || '',
                    dictionaryKey = prefix + rawValue + suffix,
                    resourceName = allBindingsAccessor.get('resourceName'),
                    value;

                if (dictionaryKey) {
                    value = resourceName
                        ? Dictionary.GetItem(dictionaryKey, resourceName, ' ')
                        : Dictionary.GetItem(dictionaryKey);
                    element.innerHTML = value;
                }
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    prefix = allBindingsAccessor.get('prefix') || '',
                    suffix = allBindingsAccessor.get('suffix') || '',
                    dictionaryKey = prefix + rawValue + suffix,
                    resourceName = allBindingsAccessor.get('resourceName'),
                    value;

                if (dictionaryKey) {
                    value = resourceName
                        ? Dictionary.GetItem(dictionaryKey, resourceName, ' ')
                        : Dictionary.GetItem(dictionaryKey);
                    element.innerHTML = value;
                }
            },
        };

        ko.bindingHandlers.hidden = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                ko.bindingHandlers.visible.update(element, function () {
                    return !value;
                });
            },
        };

        ko.bindingHandlers.visibility = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                if (value) {
                    $(element).css('visibility', 'visible');
                } else {
                    $(element).css('visibility', 'hidden');
                }
            },
        };

        ko.bindingHandlers.instrumentName = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var instId = ko.utils.unwrapObservable(valueAccessor()),
                    longName =
                        instId === Number.MAX_SAFE_INTEGER
                            ? Dictionary.GetItem('All_Instruments', 'deals_CloseDeal')
                            : $instrumentTranslationsManager.Long(instId);

                if (longName && longName.isRtlText()) {
                    element.classList.remove('ltr');
                } else {
                    element.classList.add('ltr');
                }

                element.innerHTML = longName;
            },
        };

        ko.bindingHandlers.nonRtlText = {
            update: function (element, valueAccessor) {
                var text = ko.utils.unwrapObservable(valueAccessor());

                if (text && general.isStringType(text) && text.isRtlText()) {
                    element.classList.remove('ltr');
                } else {
                    element.classList.add('ltr');
                }

                element.innerHTML = text;
            },
        };

        ko.bindingHandlers.instrumentShortName = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var id = ko.utils.unwrapObservable(valueAccessor()),
                    shortName = $instrumentTranslationsManager.Short(id);

                if (shortName && shortName.isRtlText()) {
                    element.classList.remove('ltr');
                } else {
                    element.classList.add('ltr');
                }

                element.innerHTML = shortName;
                return { controlsDescendantBindings: true };
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var id = ko.utils.unwrapObservable(valueAccessor()),
                    shortName = $instrumentTranslationsManager.Short(id);

                if (shortName && shortName.isRtlText()) {
                    element.classList.remove('ltr');
                } else {
                    element.classList.add('ltr');
                }

                element.innerHTML = shortName;
            },
        };

        ko.bindingHandlers.symbolName = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    value = $symbolsManager.GetTranslatedSymbolById(rawValue);

                element.innerHTML = value;
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    value = $symbolsManager.GetTranslatedSymbolById(rawValue);

                element.innerHTML = value;
            },
        };

        ko.bindingHandlers.numberWithCurrencySymbol = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    amountWithSign = Format.toNumberWithCurrency(options.value, options);

                element.innerHTML = amountWithSign;
            },
            update: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    amountWithSign = Format.toNumberWithCurrency(options.value, options);

                element.innerHTML = amountWithSign;
            },
        };

        ko.bindingHandlers.roundM = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var val = ko.utils.unwrapObservable(valueAccessor());

                if (val) {
                    var str = general.formatRoundM(val.toString());
                    $(element).text(str);
                }
            },
        };

        ko.bindingHandlers.roundMBasedOnThreshold = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var val = ko.utils.unwrapObservable(valueAccessor());

                if (val) {
                    var str = general.formatRoundMBasedOnThreshold(val.toString());
                    $(element).text(str);
                }
            },
        };

        ko.bindingHandlers.roundK = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var format = 'K',
                    val = ko.utils.unwrapObservable(valueAccessor());

                if (val) {
                    var str = general.formatNumber(val.toString(), format);
                    $(element).text(str);
                }
            },
        };

        ko.bindingHandlers.kAmount = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var format = 'K',
                    val = ko.utils.unwrapObservable(valueAccessor());

                if (val) {
                    var str = Format.toKAmount(val.toString(), format);
                    $(element).text(str);
                }
            },
        };

        ko.bindingHandlers.amount = (function () {
            var handleBinding = function (element, valueAccessor) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    isInput = $(element).is('input'),
                    amount =
                        Format.toAmount(rawValue) !== 'NA'
                            ? Format.toAmount(rawValue)
                            : rawValue;

                if (isInput) {
                    $(element).val(amount);
                } else {
                    $(element).text(amount);
                }
            };

            return {
                update: handleBinding,
            };
        })();

        ko.bindingHandlers.roundAmount = (function () {
            var handleBinding = function (element, valueAccessor) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    isInput = $(element).is('input'),
                    amount = rawValue; // Format.toAmount(rawValue) !== "NA" ? Format.toAmount(rawValue) : rawValue;

                if (rawValue !== '' && rawValue !== 'NA') {
                    amount = parseFloat(rawValue);

                    if (isNaN(amount)) {
                        amount = '';
                    } else {
                        amount = Math.ceil(Math.abs(amount));
                    }
                }

                if (isInput) {
                    $(element).val(amount);
                } else {
                    $(element).text(amount);
                }
            };

            return {
                init: handleBinding,
                update: handleBinding,
            };
        })();

        ko.bindingHandlers.limitAmount = (function () {
            var handleBinding = function (element, valueAccessor) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    isInput = $(element).is('input'),
                    amount = Format.toAmount(rawValue);

                if (amount === 'NA') {
                    amount = 0;
                }

                if (isInput) {
                    $(element).val(amount);
                } else {
                    $(element).text(general.formatNumberWithThousandsSeparator(amount));
                }
            };

            return {
                init: handleBinding,
                update: handleBinding,
            };
        })();

        // Returns the given value rounded with thousands separator
        ko.bindingHandlers.toHumanReadableNumericFormat = {
            init: function (element, valueAccessor) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor());
                $(element).text(
                    general.isEmptyValue(rawValue) ? '' : Format.toFixedAmount(rawValue)
                );
            },
            update: function (element, valueAccessor) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor());
                $(element).text(
                    general.isEmptyValue(rawValue) ? '' : Format.toFixedAmount(rawValue)
                );
            },
        };

        ko.bindingHandlers.round = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                var amount = 0;

                if (!general.isEmptyValue(value)) {
                    amount = Format.toFixedAmount(value);
                }

                $(element).text(amount);
            },
        };

        ko.bindingHandlers.percentage = {
            init: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    el = $(element);
                if (el.is('input') && value) {
                    $(element).val(Format.toPercent(value));
                } else {
                    $(element).text(Format.toPercent(value));
                }
            },
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    el = $(element);
                if (el.is('input') && value) {
                    $(element).val(Format.toPercent(value));
                } else {
                    $(element).text(Format.toPercent(value));
                }
            },
        };

        // Web/Mobile
        ko.bindingHandlers.smallFont = {
            update: function (element, valueAccessor, allBindingsAccessor) {
                var valueUnr = ko.utils.unwrapObservable(valueAccessor());
                var charThreshold = allBindingsAccessor.get('smallFontThreshold') || 5;

                if (!valueUnr) {
                    return;
                }

                var str = allBindingsAccessor.get('roundM')
                    ? general.formatRoundM(valueUnr.toString())
                    : valueUnr.toString();

                if (str.length > charThreshold) {
                    $(element).addClass('small-font');
                } else {
                    $(element).removeClass('small-font');
                }
            },
        };

        ko.bindingHandlers.dateFormatShortDayAndMonth = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                var date = general.SplitDateTime(
                    general.str2Date(value, 'd/m/Y H:M').ExtractDate()
                );
                var time = general.SplitDateTime(
                    general.str2Date(value, 'd/m/Y H:M').ExtractTime()
                );
                var result =
                    date.day +
                    '/' +
                    date.month.replace(/^0+/, '') +
                    ' ' +
                    time.hour +
                    ':' +
                    time.min;

                $(element).text(result);
            },
        };

        //07/07/17 15:01
        ko.bindingHandlers.dateFormatShortDayMonthYear = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                var date = general.SplitDateTime(
                    general.str2Date(value, 'd/m/Y H:M').ExtractDate()
                );
                var time = general.SplitDateTime(
                    general.str2Date(value, 'd/m/Y H:M').ExtractTime()
                );
                var result =
                    date.day +
                    '/' +
                    date.month +
                    '/' +
                    date.year.substr(2, 2) +
                    ' ' +
                    time.hour +
                    ':' +
                    time.min;
                $(element).text(result);
            },
        };

        ko.bindingHandlers.dateFormatLongDateWithTime = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                var options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: false,
                };
                var result = general
                    .str2Date(value, 'd/m/Y H:M')
                    .toLocaleDateString('en-US', options);
                $(element).text(result);
            },
        };

        ko.bindingHandlers.addDotInRange = {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var observable = valueAccessor(),
                    valueSubscriber,
                    previousValueSubscriber,
                    previousValue;

                // Store the previous value
                previousValueSubscriber = observable.subscribe(
                    function (_previousValue) {
                        previousValue = _previousValue;
                    },
                    null,
                    'beforeChange'
                );

                valueSubscriber = observable.subscribe(function (value) {
                    if (!mobile.check.s2_default) {
                        return;
                    }

                    if (
                        !value ||
                        value.indexOf('.') != -1 ||
                        value.length >= 5 ||
                        value == 'NA'
                    ) {
                        return;
                    }

                    if (
                        previousValue &&
                        previousValue.indexOf('.') == previousValue.length - 1
                    ) {
                        if (value == previousValue.substring(0, previousValue.length - 1)) {
                            return;
                        }
                    }

                    var ranges = [];
                    var ar = $(element).attr('data-range').split(',');
                    for (var i = 0; i < ar.length; i++) {
                        var rangeField = ar[i];
                        if (rangeField && rangeField in bindingContext.$data) {
                            ranges.push(bindingContext.$data[rangeField]);
                        }
                    }

                    if (ranges.length > 0) {
                        var formattedVal = Format.addDotInRange(
                            this.target(),
                            ranges,
                            previousValue
                        );
                        this.target(formattedVal);
                    }
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (previousValueSubscriber) {
                        previousValueSubscriber.dispose();
                        previousValueSubscriber = null;
                    }

                    if (valueSubscriber) {
                        valueSubscriber.dispose();
                        valueSubscriber = null;
                    }

                    element = null;
                });
            },
        };

        ko.bindingHandlers.clearQuoteColor = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                clearTimeout(element.clearQuoteColorTimer);

                element.clearQuoteColorTimer = setTimeout(
                    function (targetElement) {
                        $(targetElement).removeClass('green red up down');
                    },
                    1000,
                    element
                );
            },
        };

        ko.bindingHandlers.timeComponent = {
            update: function (element, valueAccessor, allBindingsAccessor) {
                var valueUnr = ko.utils.unwrapObservable(valueAccessor()) || '';
                var newValueUnr = valueUnr.split(' ')[1];

                if (newValueUnr) {
                    $(element).html(newValueUnr);
                }
            },
        };

        ko.bindingHandlers.formattedText = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var formatted,
                    originalText,
                    originalFormatTextAttr = 'originalFormatText',
                    $element = $(element),
                    allBindings = allBindingsAccessor();

                var getContent = function () {
                    var content;

                    if (allBindings.contentKey) {
                        content = Dictionary.GetItem(
                            allBindings.contentKey,
                            allBindings.resourceName
                        );
                    } else {
                        content = allBindings.encodeHTML ? $element.html() : $element.text();
                    }

                    return content;
                };

                if ($element.attr(originalFormatTextAttr)) {
                    originalText = $element.attr(originalFormatTextAttr);
                } else {
                    originalText = getContent();
                    $element.attr(originalFormatTextAttr, originalText);
                }

                if (allBindings.formatPattern) {
                    formatted = originalText.replace(
                        allBindings.formatPattern,
                        ko.utils.unwrapObservable(valueAccessor())
                    );
                } else {
                    formatted = String.format(
                        originalText,
                        ko.utils.unwrapObservable(valueAccessor())
                    );
                }

                if (allBindings.name) {
                    ko.postbox.publish(allBindings.name + '-text-formatted');
                }

                if (general.isDefinedType(allBindings.useAttr)) {
                    $element.attr(allBindings.useAttr, formatted);
                    $element.html('');

                    return;
                }

                if (allBindings.encodeHTML) {
                    $element.children().each(function (idx, item) {
                        ko.removeNode(item);
                    });

                    $element.html(formatted);
                    ko.applyBindingsToDescendants(bindingContext, element);
                } else {
                    $element.text(formatted);
                }
            },
        };

        ko.bindingHandlers.injectTemplate = {
            init: function () {
                return {
                    controlsDescendantBindings: true,
                };
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var $element = $(element),
                    allBindings = allBindingsAccessor(),
                    originalText = allBindings.encodeHTML
                        ? $element.html()
                        : $element.text(),
                    formatted = originalText;

                var values = ko.utils.unwrapObservable(valueAccessor());
                for (var i = 0; i < values.length; i++) {
                    var regExpForTemplates = new RegExp('\\{%' + i + '%\\}', 'gm');
                    formatted = originalText.replace(
                        regExpForTemplates,
                        "<!-- ko template: { name: '" + values[i] + "' } --><!-- /ko -->"
                    );
                }

                if (allBindings.encodeHTML) {
                    $element.children().each(function (idx, item) {
                        ko.removeNode(item);
                    });

                    $element.html(formatted);
                    ko.applyBindingsToDescendants(bindingContext, element);
                } else {
                    $element.text(formatted);
                }
            },
        };

        ko.bindingHandlers.showDate = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()) || {},
                    el = $(element),
                    options = {
                        value: '',
                        date: true,
                        time: {
                            hour: false,
                            min: false,
                            sec: false,
                        },
                    },
                    valueToDisplay = '';

                if (general.isPrimitiveType(rawValue)) {
                    options.value = rawValue;
                }
                else if (general.isDateType(rawValue)) {
                    var dateObj = new Date(rawValue);
                    options.value =
                        dateObj.getDate() +
                        '/' +
                        (dateObj.getMonth() + 1) +
                        '/' +
                        dateObj.getFullYear() +
                        ' ' +
                        dateObj.getHours() +
                        ':' +
                        dateObj.getMinutes() +
                        ':' +
                        dateObj.getSeconds();
                }
                else {
                    options = $.extend(options, rawValue);
                }

                if (general.isEmpty(options.value)) {
                    el.html('');
                    return;
                }

                var splitDateObj = general.SplitDateTime(options.value);
                if (options.date) {
                    valueToDisplay += splitDateObj.date;
                }
                if (options.time !== false) {
                    if (options.time === true) {
                        valueToDisplay += ' ' + splitDateObj.time;
                    } else {
                        if (options.time.hour) {
                            valueToDisplay += ' ' + splitDateObj.hour;
                        }
                        if (options.time.min) {
                            valueToDisplay += ':' + splitDateObj.min;
                        }
                        if (options.time.sec) {
                            valueToDisplay += ':' + splitDateObj.sec;
                        }
                    }
                }

                el.html(valueToDisplay);
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()) || {},
                    el = $(element),
                    options = {
                        value: '',
                        date: true,
                        time: {
                            hour: false,
                            min: false,
                            sec: false,
                        },
                    },
                    valueToDisplay = '';

                if (general.isPrimitiveType(rawValue)) {
                    options.value = rawValue;
                } else if (general.isDateType(rawValue)) {
                    var dateObj = new Date(rawValue);
                    options.value =
                        dateObj.getDate() +
                        '/' +
                        (dateObj.getMonth() + 1) +
                        '/' +
                        dateObj.getFullYear() +
                        ' ' +
                        dateObj.getHours() +
                        ':' +
                        dateObj.getMinutes() +
                        ':' +
                        dateObj.getSeconds();
                } else {
                    options = $.extend(options, rawValue);
                }

                if (general.isEmpty(options.value)) {
                    el.html('');
                    return;
                }

                var splitDateObj = general.SplitDateTime(options.value);
                if (options.date) {
                    valueToDisplay += splitDateObj.date;
                }
                if (options.time !== false) {
                    if (options.time === true) {
                        valueToDisplay += ' ' + splitDateObj.time;
                    } else {
                        if (options.time.hour) {
                            valueToDisplay += ' ' + splitDateObj.hour;
                        }
                        if (options.time.min) {
                            valueToDisplay += ':' + splitDateObj.min;
                        }
                        if (options.time.sec) {
                            valueToDisplay += ':' + splitDateObj.sec;
                        }
                    }
                }

                el.html(valueToDisplay);
            },
        };

        ko.bindingHandlers.valueDateText = {
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()) || {};
                var el = $(element);
                var valueToDisplay =
                    (rawValue.valueDate.isValueDateEmpty
                        ? Dictionary.GetItem('Daily') + ' '
                        : '') +
                    (general.isEmptyValue(rawValue.valueDate.date)
                        ? ''
                        : general.SplitDateTime(rawValue.valueDate.date).date +
                        (rawValue.showHour
                            ? ' ' + general.SplitDateTime(rawValue.valueDate.date).time
                            : ''));
                el.html(valueToDisplay);
            },
        };

        ko.bindingHandlers.showFwPips = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    value = general.toNumeric(rawValue).toFixed(1),
                    el = $(element);

                if (value >= 0) {
                    value = '+' + value;
                }

                el.html(value);
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    value = general.toNumeric(rawValue).toFixed(1),
                    el = $(element);

                if (value >= 0) {
                    value = '+' + value;
                }

                el.html(value);
            },
        };

        // Web/Mobile
        ko.bindingHandlers.trendFromSignalSign = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var el = $(element);
                var params = allBindingsAccessor();
                var pre = !general.isNullOrUndefined(params.pre) ? params.pre : '(';
                var post = !general.isNullOrUndefined(params.post) ? params.post : ')';
                var sign = general.toNumeric(ko.utils.unwrapObservable(valueAccessor()));

                function signFormat(value, prefix, suffix) {
                    return prefix + (value === 0 ? '=' : applySign(value)) + suffix;
                }

                function applySign(value) {
                    return value > 0 ? '+' + value : '-' + value;
                }

                general.toNumeric(sign) !== 'NA'
                    ? el.text(signFormat(sign, pre, post))
                    : el.text('');
            },
        };

        // Web/Mobile
        ko.bindingHandlers.imageFromSignalSign = {
            init: function (element, valueAccessor) {
                var sign = ko.utils.unwrapObservable(valueAccessor());
                var el = $(element);
                switch (sign) {
                    case eSignalTrendsValues.StrongSell:
                        el.addClass(eSignalTrendsImageClasses.South);
                        break;
                    case eSignalTrendsValues.Sell:
                        el.addClass(eSignalTrendsImageClasses.SouthEast);
                        break;
                    case eSignalTrendsValues.Neutral:
                        el.addClass(eSignalTrendsImageClasses.East);
                        break;
                    case eSignalTrendsValues.Buy:
                        el.addClass(eSignalTrendsImageClasses.NorthEast);
                        break;
                    case eSignalTrendsValues.StrongBuy:
                        el.addClass(eSignalTrendsImageClasses.North);
                        break;
                    default:
                        el.addClass(eSignalTrendsImageClasses.None);
                        break;
                }
            },
        };

        ko.bindingHandlers.styleFromSignalSign = {
            init: function (element, valueAccessor) {
                var sign = ko.utils.unwrapObservable(valueAccessor());
                var el = $(element);
                switch (sign) {
                    case eSignalTrendsValues.Buy:
                    case eSignalTrendsValues.StrongBuy:
                        el.addClass(eSignalTrendsColorClasses.Green);
                        break;
                    case eSignalTrendsValues.Sell:
                    case eSignalTrendsValues.StrongSell:
                        el.addClass(eSignalTrendsColorClasses.Red);
                        break;
                    default:
                        el.addClass(eSignalTrendsColorClasses.Neutral);
                }
            },
        };

        ko.bindingHandlers.toppedPercentage = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                var amount = 0;

                if (!general.isEmptyValue(value)) {
                    if (value > 100) {
                        amount = '>100%';
                    } else {
                        amount = Format.toPercent(value);
                    }
                }

                $(element).text(amount);
            },
        };

        ko.bindingHandlers.toFixed = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    allBindings = allBindingsAccessor(),
                    decimals = allBindings.decimals || 0,
                    valueAsNum = general.toNumeric(rawValue);

                if (valueAsNum) {
                    var roundingMultiplier = Math.pow(10, decimals),
                        valueToWrite =
                            Math.round(valueAsNum * roundingMultiplier) / roundingMultiplier;

                    if (!isNaN(valueToWrite)) {
                        $(element).text(valueToWrite);
                    } else {
                        $(element).text('');
                    }
                }
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    allBindings = allBindingsAccessor(),
                    decimals = allBindings.decimals || 0,
                    value = general.toNumeric(rawValue);

                if (value) {
                    var roundingMultiplier = Math.pow(10, decimals),
                        valueToWrite =
                            Math.round(value * roundingMultiplier) / roundingMultiplier;

                    if (!isNaN(valueToWrite)) {
                        $(element).text(valueToWrite);
                    } else {
                        $(element).text('');
                    }
                }
            },
        };

        ko.bindingHandlers.toFixedAmount = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    allBindings = allBindingsAccessor(),
                    decimals = allBindings.decimals || 0,
                    value = general.toNumeric(rawValue) || 0;

                if (!isNaN(value)) {
                    var roundingMultiplier = Math.pow(10, decimals),
                        amount = Math.round(value * roundingMultiplier) / roundingMultiplier;

                    $(element).text(Format.toFixedAmount(amount));
                }
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    allBindings = allBindingsAccessor(),
                    decimals = allBindings.decimals || 0,
                    value = general.toNumeric(rawValue) || 0;

                if (!isNaN(value)) {
                    var roundingMultiplier = Math.pow(10, decimals),
                        amount = Math.round(value * roundingMultiplier) / roundingMultiplier;

                    $(element).text(Format.toFixedAmount(amount));
                }
            },
        };

        ko.bindingHandlers.toFixedAmountWithoutRounding = {
            init: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    decimals = allBindingsAccessor().decimals || 0,
                    amount = general.toNumeric(rawValue) || 0;

                if (!isNaN(amount)) {
                    if (decimals > 0) {
                        var roundingMultiplier = Math.pow(10, decimals);
                        amount = Math.round(amount * roundingMultiplier) / roundingMultiplier;
                    }

                    $(element).text(Format.toNumberWithThousandsSeparator(amount));
                }
            },
            update: function (
                element,
                valueAccessor,
                allBindingsAccessor,
                viewModel,
                bindingContext
            ) {
                var rawValue = ko.utils.unwrapObservable(valueAccessor()),
                    decimals = allBindingsAccessor().decimals || 0,
                    amount = general.toNumeric(rawValue) || 0;

                if (!isNaN(amount)) {
                    if (decimals > 0) {
                        var roundingMultiplier = Math.pow(10, decimals);
                        amount = Math.round(amount * roundingMultiplier) / roundingMultiplier;
                    }

                    $(element).text(Format.toNumberWithThousandsSeparator(amount));
                }
            },
        };

        // Web/Mobile
        ko.bindingHandlers.iframeElement = {
            init: function (element, valueAccessor) {
                var iframe = $(element)[0].contentWindow;
                valueAccessor()(iframe);
            },
        };

        ko.bindingHandlers.logger = {
            update: function (element, valueAccessor, allBindings) {
                /* eslint no-console: 0 */
                //store a counter with this element
                var count = ko.utils.domData.get(element, '_ko_logger') || 0,
                    data = ko.toJS(valueAccessor() || allBindings());

                ko.utils.domData.set(element, '_ko_logger', ++count);

                if (window.console && console.log) {
                    console.log(count, element, data);
                }
            },
        };

        ko.bindingHandlers.htmlToString = {
            update: function (element, valueAccessor) {
                $(element).text($('<div>' + valueAccessor() + '</div>').text());
            },
        };

        ko.bindingHandlers.stopBinding = {
            init: function () {
                return { controlsDescendantBindings: true };
            },
        };

        ko.virtualElements.allowedBindings.stopBinding = true;

        // Web/Mobile
        ko.bindingHandlers.isProcessing = (function () {
            return {
                init: function (element) {
                    if (!(element.tagName === 'DIV' && $(element).hasClass('button'))) {
                        element.initialText = $(element).text();
                    }
                },
                update: function (element, valueAccessor) {
                    var params = ko.unwrap(valueAccessor());

                    if (params.switchText && params.showProcessIcon) {
                        $(element).text(Dictionary.GetItem('risk_processing'));
                    } else {
                        $(element).text(element.initialText);
                    }

                    if (params.showProcessIcon) {
                        $(element).addClass('js_processing');
                    } else {
                        $(element).removeClass('js_processing');
                    }
                },
            };
        })();

        // Web/Mobile
        ko.bindingHandlers.progressBar = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor());

                var minimumValue = ko.utils.unwrapObservable(options.minimumValue),
                    maximumValue = ko.utils.unwrapObservable(options.maximumValue),
                    currentValue = ko.utils.unwrapObservable(options.currentValue),
                    currencyId = ko.utils.unwrapObservable(options.currencyId),
                    progress = general.toNumeric(
                        (currentValue / (maximumValue - minimumValue)) * 100
                    ),
                    simpleProgressBar = options.simpleProgressBar || false,
                    bubbleOrientationChangeMaxValue = 85;

                progress = Math.min(progress, 100);

                if (simpleProgressBar) {
                    var $progressBarLine = $('<div>')
                        .addClass('current-value')
                        .css({ width: progress + '%' });
                    $(element).append($progressBarLine);
                    return;
                }

                $(element).append(
                    $('<span>')
                        .addClass('minimum-value direction-ltr')
                        .html(
                            Format.toNumberWithCurrency(minimumValue, {
                                maximumFractionDigits: 0,
                                currencyId: currencyId,
                            })
                        )
                );

                var $progressBar = $('<div>').addClass('cash-progress-bar'),
                    $currentValue = $('<div>')
                        .addClass('current-value')
                        .css({ width: progress + '%' }),
                    $bubble = $('<div>')
                        .addClass('bubble direction-ltr')
                        .html(
                            Format.toNumberWithCurrency(currentValue, {
                                currencyId: currencyId,
                            })
                        );

                if (progress > bubbleOrientationChangeMaxValue)
                    $bubble.addClass('reversed');

                $currentValue.append($bubble);
                $progressBar.append($currentValue);
                $(element).append($progressBar);
                $(element).append(
                    $('<span>')
                        .addClass('maximum-value direction-ltr')
                        .html(
                            Format.toNumberWithCurrency(maximumValue, {
                                currencyId: currencyId,
                            })
                        )
                );
                $(element)
                    .find('.minimum-value')
                    .width($(element).find('.minimum-value').width());
                $(element)
                    .find('.maximum-value')
                    .width($(element).find('.maximum-value').width());
            },
            update: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor());

                var minimumValue = general.toNumeric(
                    ko.utils.unwrapObservable(options.minimumValue)
                ),
                    maximumValue = general.toNumeric(
                        ko.utils.unwrapObservable(options.maximumValue)
                    ),
                    currentValue = general.toNumeric(
                        ko.utils.unwrapObservable(options.currentValue)
                    ),
                    currencyId = ko.utils.unwrapObservable(options.currencyId),
                    progress = general.toNumeric(
                        (currentValue / (maximumValue - minimumValue)) * 100
                    ),
                    bubbleOrientationChangeMaxValue = 85;

                progress = Math.min(progress, 100);
                $(element)
                    .find('.minimum-value')
                    .html(
                        Format.toNumberWithCurrency(minimumValue, {
                            maximumFractionDigits: 0,
                            currencyId: currencyId,
                        })
                    );
                $(element)
                    .find('.maximum-value')
                    .html(
                        Format.toNumberWithCurrency(maximumValue, { currencyId: currencyId })
                    );
                $(element)
                    .find('.current-value')
                    .css({ width: progress + '%' });
                $(element)
                    .find('.bubble')
                    .html(
                        Format.toNumberWithCurrency(currentValue, { currencyId: currencyId })
                    );

                if (progress > bubbleOrientationChangeMaxValue)
                    $(element).find('.bubble').addClass('reversed');
                $(element)
                    .find('.minimum-value, .maximum-value')
                    .addClass('text-positioned');
            },
        };

        ko.bindingHandlers.html5InputsProxy = {
            init: function (element, valueAccessor) {
                var observable = valueAccessor(),
                    currentValue = ko.utils.unwrapObservable(observable),
                    observableSubscriptions = observable.subscribe(function (value) {
                        if (value !== element.value) {
                            element.value = value;
                        }
                    });

                // keyup event
                function keyupEventListener(e) {
                    if (
                        element.validity.valid &&
                        !element.validity.badInput &&
                        observable() !== element.value
                    ) {
                        observable(element.value);
                    }
                }

                element.value = currentValue;
                element.addEventListener('keyup', keyupEventListener);

                // disposes
                ko.utils.domNodeDisposal.addDisposeCallback(element, function (
                    elementToDispose
                ) {
                    if (observableSubscriptions) {
                        observableSubscriptions.dispose();
                        observableSubscriptions = null;
                    }

                    elementToDispose.removeEventListener(
                        'keyup',
                        keyupEventListener,
                        false
                    );
                });
            },
        };

        ko.bindingHandlers.ratesClasses = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()) || {};

                if (options.disabled) {
                    return;
                }

                options.rateObservable.extend({ notify: 'always' });
                options.lastClass = ko.observable('');

                var subscriber = options.rateObservable.subscribe(addCssClasses, options);

                function addCssClasses(newValue) {
                    if (general.isFunctionType(options.showInput) && options.showInput()) {
                        this.lastClass('');
                        ko.applyBindingsToNode(element, { css: options.lastClass });

                        return;
                    }

                    switch (newValue) {
                        case eQuoteStates.Up:
                            this.lastClass(
                                this.lastClass() === this.up[0] ? this.up[1] : this.up[0]
                            );
                            break;
                        case eQuoteStates.Down:
                            this.lastClass(
                                this.lastClass() === this.down[0] ? this.down[1] : this.down[0]
                            );
                            break;
                        case eQuoteStates.NotChanged:
                            this.lastClass(this.notChanged);
                            break;
                        default:
                            this.lastClass('');
                    }
                }

                ko.applyBindingsToNode(element, { css: options.lastClass });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (subscriber) {
                        subscriber.dispose();
                        subscriber = null;
                    }
                });
            },
        };

        ko.bindingHandlers.attrIf = {
            update: function (element, valueAccessor, allBindingsAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor()) || {};
                ko.utils.objectForEach(value, function (attrName, attrValue) {
                    var show = ko.utils.unwrapObservable(attrValue);
                    if (typeof show !== 'undefined' && show !== null && show !== '') {
                        ko.bindingHandlers.attr.update(
                            element,
                            valueAccessor,
                            allBindingsAccessor
                        );
                    }
                });
            },
        };

        ko.bindingHandlers['data-automation'] = {
            init: function (element, valueAccessor) {
                var key = ko.utils.unwrapObservable(valueAccessor());

                if (!key) {
                    return;
                }

                element.setAttribute('data-automation', key);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (
                    elementToDispose
                ) {
                    elementToDispose.removeAttribute('data-automation');
                });
            },
        };

        ko.bindingHandlers.progressBarAutoResize = {
            update: function (element) {
                function setProgressBarWidth() {
                    setTimeout(function () {
                        var parent = $('.progress-steps ul'),
                            initialWidth = parent.innerWidth(),
                            leftMargin =
                                parent.find('li:first-child div').innerWidth() / 2 + 20,
                            rightMargin =
                                parent.find('li:visible:last div').innerWidth() / 2 + 20,
                            offset = leftMargin + rightMargin,
                            progressBarWidth = initialWidth - offset + 'px',
                            totalMargin = LanguageHelper.IsRtlLanguage()
                                ? '0 ' + leftMargin + 'px 0 ' + rightMargin + 'px'
                                : '0 ' + rightMargin + 'px 0 ' + leftMargin + 'px';

                        $(element).css({
                            width: progressBarWidth,
                            margin: totalMargin,
                        });
                    }, 200);
                }

                setProgressBarWidth();

                $(window).on('resize.progressBarAutoResize', setProgressBarWidth);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(window).off('resize.progressBarAutoResize', setProgressBarWidth);
                });
            },
        };

        ko.bindingHandlers.placeholder = {
            init: function (element, valueAccessor) {
                var options = ko.unwrap(valueAccessor()),
                    onFocusText = options.onFocus || '',
                    onBlurText = options.onBlur || '';

                var handleElementFocusChange = function (el, isFocused) {
                    var ownerDoc = el.ownerDocument;
                    if ('activeElement' in ownerDoc) {
                        var active;
                        try {
                            active = ownerDoc.activeElement;
                        } catch (e) {
                            active = ownerDoc.body;
                        }

                        isFocused = active === el;
                    }

                    element.setAttribute(
                        'placeholder',
                        isFocused ? onFocusText : onBlurText
                    );
                };

                var handleElementFocusIn = handleElementFocusChange.bind(
                    null,
                    element,
                    true
                );
                var handleElementFocusOut = handleElementFocusChange.bind(
                    null,
                    element,
                    false
                );

                ko.utils.registerEventHandler(element, 'focus', handleElementFocusIn);
                ko.utils.registerEventHandler(element, 'blur', handleElementFocusOut);

                handleElementFocusOut();
            },
        };

        /**
         * add "className" to "classElementId" if "valueElementId" has value
         */
        ko.bindingHandlers.cssIfValue = {
            init: function (
                element,
                valueAccessor,
                allBindings,
                viewModel,
                bindingContext
            ) {
                var options = valueAccessor() || {},
                    classElementId = options.classElementId || element.id,
                    valueElementId = options.valueElementId || element.id,
                    className = options.className,
                    classElement = document.getElementById(classElementId) || element,
                    valueElement = document.getElementById(valueElementId) || element,
                    isEmpty = ko.observable(false);

                if (general.isEmptyValue(className)) {
                    return;
                }

                general.isEmpty(!general.isEmptyValue(valueElement.value));

                function onDispose(elementToDispose) {
                    $(elementToDispose).off('change keyup', onChange);
                    isEmpty = null;
                }

                function onChange() {
                    general.isEmpty(!general.isEmptyValue(valueElement.value));
                }

                $(valueElement).on('change keyup', onChange);

                var cssBind = {};
                cssBind[className] = isEmpty;

                ko.applyBindingsToNode(classElement, { css: cssBind }, bindingContext);

                ko.utils.domNodeDisposal.addDisposeCallback(valueElement, onDispose);
            },
        };

        ko.bindingHandlers.scrollHere = {
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());

                if (value) {
                    var boundRectagle = element.getBoundingClientRect();
                    if (boundRectagle.top < 0) {
                        window.scrollBy(0, boundRectagle.top);
                    }
                }
            },
        };

        ko.bindingHandlers.setFocusToId = {
            init: function (element, valueAccesor) {
                $(element).on('click', function () {
                    var elementId = '#' + valueAccesor();
                    $(elementId).trigger('focus');
                });
            },
        };

        ko.bindingHandlers.specificUploadButton = {
            init: function (element) {
                if (!(Browser.isChrome() || !Browser.isChromeOnIOS())) {
                    return;
                }

                element.parentElement.classList.add('specific');
            },
            update: function (element, valueAccessor) {
                if (!(Browser.isChrome() || !Browser.isChromeOnIOS())) {
                    return;
                }

                var isBrowseEnabled = ko.utils.unwrapObservable(valueAccessor());

                if (isBrowseEnabled) {
                    element.classList.add('enabled');
                } else {
                    element.classList.remove('enabled');
                }
            },
        };

        var ArrowList = function ArrowList(element) {
            var $rightArrowContainer = $(element).find('.right-arrow'),
                $leftArrowContainer = $(element).find('.left-arrow'),
                $scrollableContainer = $(element).find('.arrow-navigation-list'),
                $listParent = $(element),
                offset = 100,
                duration = 300,
                hiddenClass = 'hidden',
                liItemClass = '.list-item';

            function registerEvents() {
                $rightArrowContainer.on('click', function () {
                    var leftPos = $scrollableContainer.scrollLeft();

                    $scrollableContainer.animate(
                        {
                            scrollLeft: leftPos + offset,
                        },
                        duration,
                        function () {
                            if (isScrollRightEnd()) {
                                $rightArrowContainer.addClass(hiddenClass);
                            }

                            $leftArrowContainer.removeClass(hiddenClass);
                        }
                    );
                });

                $leftArrowContainer.on('click', function () {
                    var leftPos = $scrollableContainer.scrollLeft();

                    $scrollableContainer.animate(
                        {
                            scrollLeft: leftPos - offset,
                        },
                        duration,
                        function () {
                            $rightArrowContainer.removeClass(hiddenClass);

                            if (isScrollLeftEnd()) {
                                $leftArrowContainer.addClass(hiddenClass);
                            }
                        }
                    );
                });
            }

            function unregisterEvents() {
                $leftArrowContainer.off('click');
                $rightArrowContainer.off('click');
            }

            function isScrollLeftEnd() {
                var leftPos = $scrollableContainer.scrollLeft();
                return leftPos <= 0;
            }

            function isScrollRightEnd() {
                var newScrollLeft = $scrollableContainer.scrollLeft(),
                    width = $scrollableContainer.width(),
                    scrollWidth = $scrollableContainer.get(0).scrollWidth;

                return scrollWidth - newScrollLeft - width == 0;
            }

            function scrollToActiveItem() {
                var $listItems = $scrollableContainer.find(liItemClass);

                $listItems.each(function () {
                    var $activeElement = $(this).find('.active')[0];

                    if (!general.isNullOrUndefined($activeElement)) {
                        $scrollableContainer.animate(
                            {
                                scrollLeft: $(this).position().left,
                            },
                            duration,
                            function () {
                                if (isScrollRightEnd()) {
                                    $rightArrowContainer.addClass(hiddenClass);
                                } else if (isScrollLeftEnd()) {
                                    $leftArrowContainer.addClass(hiddenClass);
                                }
                            }
                        );
                    }
                });
            }

            function setListWidth() {
                var widthParent = $listParent.width();
                if (widthParent) {
                    $scrollableContainer.width(widthParent);
                }
            }

            function getTotalListWidth() {
                var $listItems = $scrollableContainer.find(liItemClass),
                    totalListWidth = 0;

                $listItems.each(function () {
                    totalListWidth += $(this).width();
                });

                return totalListWidth;
            }

            function setArrowsVisibleOnInit() {
                var widthParent = $listParent.width(),
                    totalListWidth = getTotalListWidth();

                if (widthParent < totalListWidth) {
                    $leftArrowContainer.removeClass(hiddenClass);
                    $rightArrowContainer.removeClass(hiddenClass);
                    setListWidth();
                } else {
                    $rightArrowContainer.addClass(hiddenClass);
                    $leftArrowContainer.addClass(hiddenClass);
                }
            }

            function isListWidthEmpty() {
                var widthParent = $listParent.width(),
                    totalListWidth = getTotalListWidth();

                return widthParent === 0 && totalListWidth === 0;
            }

            function setArrowsVisibleOnResize() {
                var widthParent = $listParent.width(),
                    totalListWidth = getTotalListWidth();

                if (widthParent <= totalListWidth) {
                    if (isScrollRightEnd()) {
                        $rightArrowContainer.addClass(hiddenClass);
                    } else {
                        $rightArrowContainer.removeClass(hiddenClass);
                    }

                    if (isScrollLeftEnd()) {
                        $leftArrowContainer.addClass(hiddenClass);
                    } else {
                        $leftArrowContainer.removeClass(hiddenClass);
                    }
                } else {
                    $rightArrowContainer.addClass(hiddenClass);
                    $leftArrowContainer.addClass(hiddenClass);
                }
            }

            return {
                isScrollRightEnd: isScrollRightEnd,
                setArrowsVisibleOnInit: setArrowsVisibleOnInit,
                setArrowsVisibleOnResize: setArrowsVisibleOnResize,
                setListWidth: setListWidth,
                scrollToActiveItem: scrollToActiveItem,
                registerEvents: registerEvents,
                unregisterEvents: unregisterEvents,
                isListWidthEmpty: isListWidthEmpty,
            };
        };

        ko.bindingHandlers.arrowList = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var arrowList = new ArrowList(element);

                viewModel.Data.itemsRendered = ko.observable(false);
                var intervalId;

                viewModel.Data.itemsRendered.subscribe(function (value) {
                    if (value) {
                        intervalId = setInterval(function () {
                            if (!arrowList.isListWidthEmpty()) {
                                arrowList.setArrowsVisibleOnInit();
                                arrowList.scrollToActiveItem();
                                viewModel.Data.itemsRendered(false);

                                clearInterval(intervalId);

                                setTimeout(function () {
                                    arrowList.setArrowsVisibleOnInit();
                                    arrowList.scrollToActiveItem();
                                }, 1000);
                            }
                        });
                    }
                });

                arrowList.registerEvents();

                $(window).on('resize', function () {
                    arrowList.setListWidth();
                    arrowList.setArrowsVisibleOnResize();
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    arrowList.unregisterEvents();
                    clearInterval(intervalId);
                });
            },
        };

        ko.bindingHandlers.renderArrowListItem = {
            update: function (element, valueAccessor) {
                var data = ko.unwrap(valueAccessor());
                var listLength = data.length;
                var currentIndex = data.index();

                if (currentIndex === listLength - 1) {
                    data.itemsRendered(true);
                }
            },
        };

        ko.bindingHandlers.electronicSignature = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var initTimeout,
                    setCanvasSize = function () {
                        element.setAttribute('width', element.parentElement.clientWidth);
                        element.setAttribute('height', element.parentElement.clientHeight);
                    },
                    initCanvas = function () {
                        if (initTimeout) {
                            clearTimeout(initTimeout);
                        }

                        if (
                            element.parentElement.clientWidth === 0 ||
                            element.parentElement.clientHeight === 0
                        ) {
                            initTimeout = setTimeout(function () {
                                initCanvas();
                            }, 200);
                        } else {
                            setCanvasSize();
                        }
                    },
                    resizeCallBack = function () {
                        var canvasW = element.getAttribute('width'),
                            canvasH = element.getAttribute('height');
                        if (
                            canvasW != element.parentElement.clientWidth ||
                            canvasH != element.parentElement.clientHeight
                        ) {
                            setCanvasSize();
                            viewModel.ClearSignature();
                        }
                    };

                initCanvas();
                viewModel.InitCanvas(element);

                window.addEventListener('resize', resizeCallBack);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    clearTimeout(initTimeout);
                    window.removeEventListener('resize', resizeCallBack);
                });
            },
        };

        ko.bindingHandlers.triggerClickWhen = {
            init: function (element, valueAccessor) {
                var subscribers = [],
                    options = valueAccessor(),
                    postboxTopic = options.postboxTopic;

                subscribers.push(
                    ko.postbox.subscribe(postboxTopic, function triggerClickOnce() {
                        subscribers.push(options.isActive.subscribe(isBrowseEnabledChanged));

                        isBrowseEnabledChanged(options.isActive());
                    })
                );

                function isBrowseEnabledChanged(isActive) {
                    if (!isActive) {
                        return;
                    }

                    element.click();

                    if (subscribers) {
                        general.disposeArray(subscribers);
                    }
                }

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (subscribers) {
                        general.disposeArray(subscribers);
                    }
                });
            },
        };

        ko.bindingHandlers.elementToImage = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var getPageTopoffset = function () {
                    return window.pageYOffset !== 0 ? -window.pageYOffset : 0;
                };
                viewModel.setPrintSettings(element, getPageTopoffset);
            },
        };

        ko.bindingHandlers.showIntrumentNotAvailable = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    $container = $(element);

                if (!options.isAvailable) {
                    $container.addClass('instrument-unavailable');
                } else {
                    $container.addClass('instrument-available');
                }
            },
            update: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    instrData = options.instrData,
                    $container = $(element),
                    $dealContainer = $('.' + options.dealContainerClass),
                    $instrUnavailableWrapper = $('.instrument-unavailable-wrapper'),
                    dealInstrUnavailableClass = 'deal-container-instrument-notavailable',
                    instrAvailableClass = 'instrument-available',
                    instrUnavailableClass = 'instrument-unavailable';

                $container.css({ height: 'auto' });

                if (!instrData.isAvailable) {
                    $instrUnavailableWrapper.show();
                    $dealContainer.addClass(dealInstrUnavailableClass);
                    $container.addClass(instrUnavailableClass);
                    $container.removeClass(instrAvailableClass);
                } else if (!instrData.isChanged) {
                    if (options.keepContainerHeight) {
                        $container.css({ height: $container.height() + 'px' });
                    }
                    $instrUnavailableWrapper.hide();
                } else {
                    $instrUnavailableWrapper.show();
                    $container.addClass(instrAvailableClass);
                    $container.removeClass(instrUnavailableClass);
                    $dealContainer.removeClass(dealInstrUnavailableClass);
                }
            },
        };

        ko.bindingHandlers.adjustMainContainerSize = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var options = valueAccessor() || {},
                    topOffset = options.topOffset,
                    mainWr = document.getElementsByClassName('mainWrapper')[0],
                    el = document.getElementById(options.elementId),
                    calcTimeout;

                var setBodyMinHeight = function () {
                        var elementHeight = el.offsetHeight + topOffset;

                        mainWr.style.minHeight = '';
                        if (mainWr.offsetHeight < elementHeight) {
                            mainWr.style.minHeight = elementHeight + 'px';
                        }
                    },
                    calculateHeight = function () {
                        if (calcTimeout) {
                            clearTimeout(calcTimeout);
                        }

                        calcTimeout = setTimeout(function () {
                            setBodyMinHeight();
                        }, 500);
                    };

                calculateHeight();

                viewModel.Data.userFlowToggle.subscribe(function () {
                    calculateHeight();
                });

                window.addEventListener('resize', function () {
                    calculateHeight();
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    window.removeEventListener('resize', calculateHeight);
                    mainWr.style.minHeight = '';
                    clearTimeout(calcTimeout);
                });
            },
        };

        ko.bindingHandlers.trackingEvent = {
            init: function (element, valueAccessor) {
                var trackEvent = valueAccessor();

                function f() {
                    ko.postbox.publish(trackEvent.name, trackEvent.data);
                }

                element.addEventListener('click', f, false);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (
                    elementToDispose
                ) {
                    element.removeEventListener(f);
                });
            },
        };

        ko.bindingHandlers['play-walkthroug'] = {
            init: function (element, valueAccessor) {
                var walkthrough = require('fxnet/uilayer/Modules/WalkthroughsModule'),
                    walkthroughId = valueAccessor();

                function f(e) {
                    walkthrough.walkthroughWidget.play(walkthroughId);
                }

                element.addEventListener('click', f, false);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (
                    elementToDispose
                ) {
                    element.removeEventListener(f);
                });
            },
        };

        ko.bindingHandlers.securityLogo = {
            init: function (element) {
                var logoId = $(element).attr("id");
                window.__dcid = window.__dcid || []; window.__dcid.push([logoId, "15", "s", "black", "6VaWSBzf"]);

                (function () {
                    var cid = document.createElement("script");
                    cid.async = true;
                    cid.src = "//seal.digicert.com/seals/cascade/seal.min.js";
                    var s = document.getElementsByTagName("script");
                    var ls = s[(s.length - 1)];
                    ls.parentNode.insertBefore(cid, ls.nextSibling);
                }());
            }
        };
    });
