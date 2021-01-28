define(
    'devicehelpers/KoCustomBindings',
    [
        'require',
        'knockout',
        'handlers/general',
        'jquery',
        "global/UrlResolver",
        "vendor/jquery.jscrollpane.js",
        'vendor/jcf.selectModule',
        'vendor/jcf',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            $ = require('jquery'),
            jcf = require('vendor/jcf'),
            UrlResolver = require('global/UrlResolver');

        ko.bindingHandlers.loadHtml = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var $element = $(element),
                    value = ko.utils.unwrapObservable(valueAccessor());

                var config = {
                    url: null,
                    applyKoBindings: false,
                    loadedHtmlHandler: function (oldContent) { return oldContent; },
                    htmlAttachedHandler: function () { },
                    noCache: false,
                    isStaticFile: false
                };

                $.extend(config, value);

                if (config.noCache) {
                    config.url += (config.url.indexOf('?') > -1) ? '&' : '?';
                    config.url += (new Date()).getTime();
                }

                if (config.isStaticFile === true) {
                    config.url = UrlResolver.combine(UrlResolver.getStaticFilePath(), config.url);
                }
                else {
                    config.url = UrlResolver.combine(UrlResolver.getApplicationRelativePath(), config.url);
                }

                $.get(config.url, function (content) {
                    //if response arrived after domNodeDisposal config and $element must be checked
                    if (general.isNullOrUndefined(config) || general.isNullOrUndefined($element)) {
                        return false;
                    }

                    var alteredContent = config.loadedHtmlHandler(content);

                    $element.html(alteredContent);

                    config.htmlAttachedHandler();

                    if (config.applyKoBindings) {
                        //applying the bindings to the element itself reruns this binding
                        var loadedContent = $element.children()[0];
                        ko.applyBindings($viewModelsManager, loadedContent);
                    }
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    config = null;
                    $element = null;
                });
            }
        };

        ko.bindingHandlers.datepickerbutton = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var allBindings = allBindingsAccessor(),
                    fieldID = allBindings.field || "",
                    customClass = allBindings.customClass || "",
                    customLabel = allBindings.customLabel || "",
                    field = null,
                    dateFormat = "dd/mm/yy",
                    datePickerOptions = allBindings.datepickeroptions || {};

                if (!general.isEmptyValue(fieldID)) {
                    field = document.getElementById(fieldID);
                }

                if (!field || $(field).hasClass('hasDatepicker'))
                    return; // execute only once

                var timeLastClosed = new Date(0);
                var IEDoubleDisplayFix = {
                    beforeShow: function () {
                        return new Date() - timeLastClosed >= 500;
                    },
                    onClose: function () {
                        timeLastClosed = new Date();
                    }
                };

                datePickerOptions = $.extend({
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: dateFormat,
                    firstDay: 1
                }, IEDoubleDisplayFix, datePickerOptions);

                $(field).datepicker(datePickerOptions);

                $(field).datepicker("option", "onSelect", function () {
                    var observable = valueAccessor(),
                        newDateValue = $(this).datepicker("getDate"),
                        newStrValue = $.datepicker.formatDate(dateFormat, newDateValue);

                    observable(newStrValue);

                    $(this).datepicker("hide");
                });

                $(field).datepicker("option", {
                    "onChangeMonthYear": function (year, month, inst) {
                        addWrappers(inst.input, $("#ui-datepicker-div"));
                    },
                    "beforeShow": function (input, inst) {
                        addWrappers(inst.input, $("#ui-datepicker-div"));
                    },
                    "orientation": "bottom"
                });

                // Attach click event
                $(element).on("click.datepickerbutton", function () {
                    if (!$(field).datepicker("widget").is(":visible")) {
                        $(field).datepicker("show");
                    }
                });

                setTimeout(function (contentElement, uiElement) {
                    addWrappers(contentElement, uiElement);
                }, 0, element, $("#ui-datepicker-div"));

                function addWrappers(contentElements, uiElement) {

                    uiElement.removeClass("positioned");

                    setTimeout(function (item, innerUiElement) {
                        if (customClass && $("#ui-datepicker-div .content-wrapper").length === 0) {
                            innerUiElement.addClass(customClass).wrapInner($("<div>").addClass("content-wrapper"));
                        }

                        if (customLabel && $("#ui-datepicker-div label").length === 0) {
                            innerUiElement.prepend($("<label>").html(customLabel));
                        }

                        innerUiElement.wrapInner($("<div>").addClass("wrapper"));
                        innerUiElement.addClass("positioned");

                        if ($(item).offset().top >= innerUiElement.offset().top) {
                            innerUiElement.removeClass("above-input below-input").addClass("above-input");
                            $("#ui-datepicker-div .wrapper").removeClass("above-input below-input").addClass("above-input");

                        }
                        else {
                            innerUiElement.removeClass("above-input below-input").addClass("below-input");
                            $("#ui-datepicker-div .wrapper").removeClass("above-input below-input").addClass("below-input");
                        }
                    }, 0, contentElements, uiElement);
                }

                // Handle the field changings
                $(field).on("change.datepickerbutton", function () {
                    var observable = valueAccessor(),
                        newDateValue = $(this).datepicker("getDate"),
                        newStrValue = $.datepicker.formatDate(dateFormat, newDateValue);

                    observable(newStrValue);
                    $(this).blur();
                });

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(field, function (elementToDispose) {
                    $(elementToDispose).off(".datepickerbutton");
                    $(field).off(".datepickerbutton");
                    $(field).datepicker("destroy");
                    field = null;
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var allBindings = allBindingsAccessor(),
                    fieldID = allBindings.field || "",
                    field = null,
                    dateFormat = "dd/mm/yy",
                    datePickerOptions = allBindings.datepickeroptions || {};

                if (!general.isEmptyValue(fieldID)) {
                    field = document.getElementById(fieldID);
                }
                //update min/max date
                $(field).datepicker(datePickerOptions);

                if (field && $(field).hasClass('hasDatepicker')) {
                    var observableValue = ko.utils.unwrapObservable(valueAccessor()),
                        pickerDate = $(field).datepicker("getDate"),
                        observableDate = observableValue && $.datepicker.parseDate(dateFormat, observableValue);

                    if (observableDate - pickerDate !== 0) {
                        $(field).datepicker("setDate", observableDate);
                    }
                }
            }
        };

        ko.bindingHandlers.trigger = {
            init: function (element, valueAccessor) {
                var triggerFunction = ko.utils.unwrapObservable(valueAccessor());

                if (!general.isFunctionType(triggerFunction)) {
                    throw new TypeError("Please provide a function to execute when the element is triggered!");
                }

                $(element)
                    .on("click.trigger", triggerFunction)
                    .on("keypress.trigger", function (e) {
                        var enterPressed = e.which == cKeyCode.CtrlEnter || e.which == cKeyCode.Enter;

                        if (enterPressed) {
                            triggerFunction();
                        }
                    });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).off(".trigger");
                });
            }
        };

        ko.bindingHandlers.customSelect = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var $element = $(element),
                    options = ko.utils.unwrapObservable(valueAccessor()) || {},
                    observableValue = allBindingsAccessor().value,
                    jcfOptions = allBindingsAccessor().customSelectOptions || {},
                    onReadySubscriber,
                    observableValueSubscriber,
                    disableSubscriber;

                var childrenCompleteSubscriber = ko.bindingEvent.subscribe(element, 'childrenComplete', function () {
                    jcf.refresh($element);
                });

                if (jcfOptions.refreshWhenObservableValueChanges &&
                    observableValue &&
                    ko.isObservable(observableValue)) {
                    observableValueSubscriber = observableValue.subscribe(function () {
                        setTimeout(function () {
                            jcf.refresh($element);
                        }, 0);
                    });
                }

                if (options.onReady && ko.isObservable(options.onReady)) {
                    onReadySubscriber = options.onReady.subscribe(function (isRendered) {
                        if (isRendered) {
                            jcf.refresh($element);
                        }
                    });
                }

                jcf.replace($element, "Select", jcfOptions);

                var allBindings = allBindingsAccessor() || {};
                if (allBindings.disable && ko.isObservable(allBindings.disable)) {
                    disableSubscriber = allBindings.disable.subscribe(function () {
                        jcf.refresh($element);
                    });
                }

                ko.utils.domNodeDisposal.addDisposeCallback(element,
                    function (elementToDispose) {
                        if (onReadySubscriber) {
                            onReadySubscriber.dispose();
                            onReadySubscriber = null;
                        }

                        if (observableValueSubscriber) {
                            observableValueSubscriber.dispose();
                            observableValueSubscriber = null;
                        }

                        if (disableSubscriber) {
                            disableSubscriber.dispose();
                            disableSubscriber = null;
                        }

                        if (childrenCompleteSubscriber) {
                            childrenCompleteSubscriber.dispose();
                            childrenCompleteSubscriber = null;
                        }

                        jcf.destroy($(elementToDispose));
                        $element = null;
                    }
                );
            }
        };
    }
);
