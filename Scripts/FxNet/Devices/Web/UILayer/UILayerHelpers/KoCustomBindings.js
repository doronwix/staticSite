define(
    'devicehelpers/KoCustomBindings',
    [
        'require',
        'knockout',
        'handlers/general',
        'jquery',
        "global/UrlResolver",
        "vendor/jquery.jscrollpane",
        'vendor/jcf.selectModule',
        'vendor/jcf',
        'handlers/languageHelper'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            $ = require('jquery'),
            jcf = require('vendor/jcf'),
            UrlResolver = require('global/UrlResolver');

        ko.bindingHandlers.showSpinner = {
            init: function () { },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                $(element).css('position', 'relative');

                var isShow = ko.utils.unwrapObservable(valueAccessor()),
                    spinnerBox = document.getElementById("spinnerBox"),
                    parentBox;

                if (spinnerBox && spinnerBox.parentNode) {
                    parentBox = spinnerBox.parentNode;
                }
                if (isShow) {
                    if (spinnerBox) {
                        spinnerBox.parentNode.removeChild(spinnerBox);

                        if (!general.isNullOrUndefined(parentBox)) {
                            parentBox.appendChild(spinnerBox);
                        }

                        spinnerBox.style.display = "block";
                    }
                }
                else {
                    if (spinnerBox && parentBox) {
                        spinnerBox.parentNode.removeChild(spinnerBox);
                        parentBox.appendChild(spinnerBox);

                        spinnerBox.style.display = "none";
                    }
                }
            }
        };

        ko.bindingHandlers.setDialogPos = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).off(".setDialogPos");
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                var config = {
                    dialogPosition: null,
                    parentIsCollapsed: null,
                    parentTopElement: null,
                    topOffset: 0,
                    parentLeftElement: null,
                    leftOffset: 0,
                    RTLoffset: 0
                };

                Object.assign(config, value);

                $(element).on("click.setDialogPos", function () {
                    var topPos = -1, leftPos = -1;

                    if (!config.parentIsCollapsed()) {
                        if ($(config.parentTopElement).length > 0) {
                            topPos = $(config.parentTopElement).offset().top - $("#TradingsControls").offset().top + config.topOffset;
                        }

                        if ($(config.parentLeftElement).length > 0) {
                            leftPos = $(config.parentLeftElement).offset().left - $("#TradingsControls").offset().left + config.leftOffset;
                        }
                    }

                    var position = {
                        top: topPos,
                        left: leftPos,
                        offset: config.RTLoffset
                    };

                    config.dialogPosition(position);
                });
            }
        };

        ko.bindingHandlers.dialog = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var allBindings = allBindingsAccessor(),
                    dialogModel = ko.utils.unwrapObservable(allBindings.dialogInstance),
                    options = ko.utils.unwrapObservable(valueAccessor()) || {},
                    viewToAppend = ko.utils.unwrapObservable(dialogModel.element) || false,
                    parentElement = $(viewToAppend).parent(),
                    dialogEl = $(element).find('.dialogContainer'),
                    namespaceEvent = eAppEvents.formChangedEvent + '.' + dialogModel.name;

                //prep environment
                $(document).on(namespaceEvent, function rePosition() {
                    // {} is default: { my: "center", at: "center", of: window });
                    if ($.data(element, "ui-dialog")) {
                        dialogEl.dialog("option", "position", options.position || {});
                    }
                });

                ko.utils.extend(options, {
                    open: function dialogOpenHandler() { },
                    beforeClose: function dialogCloseHandler(jQueryEvent, data) {
                        if (dialogModel) {
                            var dialogOptions = dialogModel.getOptions();

                            if (general.isNullOrUndefined(dialogOptions) && dialogOptions.preventClose && !dialogOptions.preventClose.canClose) {
                                jQueryEvent.preventDefault();
                                jQueryEvent.stopPropagation();
                                dialogOptions.preventClose.actionOnPrevent();
                            }
                            else {
                                if (jQueryEvent.keyCode === $.ui.keyCode.ESCAPE) {
                                    jQueryEvent.preventDefault();
                                    jQueryEvent.stopPropagation();
                                    setTimeout(function () { DialogViewModel.close(); }, 10);

                                    return false;
                                }
                                else {
                                    DialogViewModel.close();
                                }
                            }
                        }
                    }
                });

                // !!! append view to dialog element
                dialogEl.append(viewToAppend);

                // !!! dialog instantiation
                dialogEl.dialog(options);

                var jqDialog = dialogEl.data("uiDialog");
                $(element).data('dialogElementId', jqDialog.element.prop('id'));

                //customizing the dialog title, which could be a string or a function. 
                jqDialog._title = function handleDialogTitle(titleElement) {
                    if (typeof this.options.title === "function") {
                        var computedCustomTitle = this.options.title();

                        fixMousedownOnSelectElement(computedCustomTitle);
                        titleElement.append(computedCustomTitle);
                    }
                    else {
                        titleElement.html(this.options.title);
                    }

                    function fixMousedownOnSelectElement(el) {
                        el.on('mousedown', function (mouseDownEvent) {
                            mouseDownEvent.stopPropagation();
                        });
                    }
                };

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(document).off(namespaceEvent);

                    parentElement.append(viewToAppend);
                    viewToAppend = null;
                    parentElement = null;

                    dialogEl.dialog("destroy");
                    dialogEl = null;
                    dialogModel = null;
                    element = null;
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var allBindings = allBindingsAccessor(),
                    dialogModel = ko.utils.unwrapObservable(allBindings.dialogInstance),
                    timeout = ko.utils.unwrapObservable(dialogModel.openTimeout),
                    options = ko.utils.unwrapObservable(dialogModel.getOptions()) || {},
                    viewToAppend = ko.utils.unwrapObservable(dialogModel.element) || false,
                    isRtlLanguage = LanguageHelper.IsRtlLanguage(),
                    dialogEl = $('#' + $(element).data('dialogElementId')),
                    dialogParent = dialogEl.parent();

                function placeDialogAtLocationFromOptions() {
                    if (options.left && options.left > 0) {
                        var left = options.left;

                        if (isRtlLanguage) {
                            left = left - dialogParent.width() + options.offset;
                        }

                        dialogParent.position({
                            my: 'left+' + left + ' top+' + (options.top + window.pageYOffset),
                            at: 'left top',
                            of: options.appendTo
                        });
                    }

                    $("body > .ui-widget-overlay").css('position', 'fixed');
                }

                function placeDialogVerticallyCentered() {
                    dialogParent.draggable({ containment: options.appendTo });
                    dialogParent.position({ my: "center", at: "center", of: options.appendTo });
                }

                function placeDialogAtTop() {
                    var isDialogTallerThanWindow = dialogParent.height() > $(window).height();

                    dialogParent.position({ my: 'top', at: 'top', of: options.appendTo });

                    if (!options.appendTo || isDialogTallerThanWindow) {
                        dialogParent.draggable({ containment: 'document' });
                        $("body > .ui-widget-overlay").css('position', 'fixed');
                    }
                    else {
                        dialogParent.draggable({ containment: options.appendTo });
                        $(".ui-widget-overlay").css('position', 'absolute');
                    }
                }

                function ensurePositioningOptionsHaveValues() {
                    if (general.isDefinedType(options.appendTo)) {
                        return;
                    }

                    options.appendTo = "body";

                    if (general.isDefinedType(options.useDialogPosition) || general.isDefinedType(options.useDefaultPosition)) {
                        return;
                    }

                    options.useDialogPosition = true;
                }

                function ensureDialogHeaderIsVisible() {
                    if (dialogParent.position().top >= 0) {
                        return;
                    }

                    dialogParent.css('top', '0');
                    dialogParent.draggable({ containment: 'document' });
                }

                function ensureDialogContentIsVisible() {
                    $(dialogModel.element).css('visibility', 'visible');
                }

                function getTitleElement(componentHtml, titleElement) {
                    return $(componentHtml).find('#' + titleElement);
                }

                options.open = function openHandler() {
                    ensureDialogContentIsVisible();
                    ensurePositioningOptionsHaveValues();

                    if (options.useDialogPosition) {
                        placeDialogAtLocationFromOptions();
                    }
                    else if (options.useDefaultPosition) {
                        placeDialogVerticallyCentered();
                    }
                    else {
                        placeDialogAtTop();
                    }

                    ensureDialogHeaderIsVisible();

                    if (options.customTitle) {
                        dialogEl.dialog("option", "title", getTitleElement.bind(null, viewToAppend, options.customTitle));

                        var existingDialogCloseHandler = dialogEl.dialog("option", "beforeClose");

                        dialogEl.dialog("option", "beforeClose", function () {
                            $('#' + options.customTitle).remove();
                            existingDialogCloseHandler.apply(null, arguments);
                        });
                    }

                    if (!dialogEl[0].contains(document.activeElement)) {
                        //some dialogs doesn't set an active element
                        $('select:visible:first, div:visible:first', dialogEl).trigger('focus');
                    }
                }; // set options for the dialog

                setTimeout(function (dialogElement, dialogOptions) {
                    if (dialogElement.hasClass('ui-dialog-content')) {
                        dialogElement.dialog("option", dialogOptions);
                        dialogElement.dialog("open");
                    }
                }, timeout, dialogEl, options);
            }
        };

        ko.bindingHandlers.componentLoaded = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ko.postbox.publish(valueAccessor().appEvent, valueAccessor().params);
            }
        };

        ko.bindingHandlers.alternateRows = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var allBindings = allBindingsAccessor(),
                    even = allBindings.evenClass,
                    odd = allBindings.oddClass,
                    everyRows = allBindings.everyRows || 1,
                    $el = $(element),
                    evenFormula = [];

                ko.utils.unwrapObservable(valueAccessor()); //creates the dependency

                //update odd rows
                $el.children("*").addClass(odd).removeClass(even);

                for (var i = everyRows; i > 0; i--) {
                    var el = (2 * everyRows) + "n";

                    if (i < everyRows) {
                        el += "-" + (everyRows - i);
                    }

                    evenFormula.push(":nth-child(" + el + ")");
                }

                $el.children(evenFormula.join(",")).addClass(even).removeClass(odd);
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var allBindings = allBindingsAccessor(),
                    even = allBindings.evenClass,
                    odd = allBindings.oddClass,
                    everyRows = allBindings.everyRows || 1,
                    $el = $(element),
                    evenFormula = [];

                ko.utils.unwrapObservable(valueAccessor()); //creates the dependency

                //update odd rows
                $el.children("*").addClass(odd).removeClass(even);

                for (var i = everyRows; i > 0; i--) {
                    var el = (2 * everyRows) + "n";

                    if (i < everyRows) {
                        el += "-" + (everyRows - i);
                    }

                    evenFormula.push(":nth-child(" + el + ")");
                }

                $el.children(evenFormula.join(",")).addClass(even).removeClass(odd);
            }
        };

        ko.bindingHandlers.datepicker = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                //initialize datepicker with some optional options
                var options = allBindingsAccessor().datepickeroptions || {};

                $.extend(options, {
                    dateFormat: "dd/mm/yy",
                    changeMonth: true,
                    changeYear: true
                });

                $(element).datepicker(options);

                //handle the field changing
                $(element).on("change.datepicker", function () {
                    var observable = valueAccessor(),
                        newDateValue = $(this).datepicker("getDate"),
                        newStrValue = $.datepicker.formatDate("dd/mm/yy", newDateValue);

                    observable(newStrValue);

                    $(this).blur();
                });

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).off(".datepicker");
                    $(elementToDispose).datepicker("destroy");
                });
            },
            update: function (element, valueAccessor) {
                var observableValue = ko.utils.unwrapObservable(valueAccessor()),
                    observableDate = $.datepicker.parseDate("dd/mm/yy", observableValue),
                    pickerDate = $(element).datepicker("getDate");

                if (observableDate - pickerDate !== 0) {
                    $(element).datepicker("setDate", observableDate);
                }
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

        ko.bindingHandlers.slideUp = {
            init: function (element, valueAccessor) {
                var visible = ko.utils.unwrapObservable(valueAccessor());

                $(element).toggle(!visible);
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var collapse = ko.utils.unwrapObservable(valueAccessor()),
                    allBindings = allBindingsAccessor(),
                    durationParam = allBindings.duration || "slow",
                    completedFn = (typeof allBindings.slideUpCompleted === "function") ? allBindings.slideUpCompleted : function () { },
                    duration = ko.utils.unwrapObservable(durationParam);

                if (!duration) {
                    duration = 0;
                }
                else if (duration === true) {
                    duration = 400;
                }

                if (collapse) {
                    $(element).slideUp(duration, completedFn);
                }
                else {
                    $(element).slideDown(duration, completedFn);
                }
            }
        };

        ko.bindingHandlers.loadBannerHtml = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var value = ko.utils.unwrapObservable(valueAccessor());

                var config = {
                    html: '',
                    applyKoBindings: false,
                    loadedHtmlHandler: function (oldContent) { return oldContent; },
                    htmlAttachedHandler: function () { }
                };

                $.extend(config, value);

                var alteredContent = config.loadedHtmlHandler(config.html);

                $(element).html(alteredContent);

                config.htmlAttachedHandler();

                if (config.applyKoBindings) {
                    //applying the bindings to the element itself reruns this binding
                    var loadedContent = $(element).children()[0];
                    ko.applyBindings($viewModelsManager, loadedContent);
                }
            }
        };

        ko.bindingHandlers.windowPopupOpen = {
            init: function (element) {
                $(element).on('click.windowPopup', function (clickEventObject) {
                    var WindowParams = "height=710px,width=1000px,scrollbars=yes,resizable=1,location=no,center=yes,titlebar=no";
                    window.open($(this).attr('href'), 'tsHelp', WindowParams);
                    return false;
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).off(".windowPopup");
                });
            }
        };

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

        ko.bindingHandlers.appendElementWhen = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = ko.unwrap(valueAccessor()),
                    shouldAppend = ko.unwrap(options.trigger()),
                    $elementToHandle,
                    $parent;

                options = options || {};

                $elementToHandle = $(options.elementSelector);
                if (!$elementToHandle.length) {
                    return;
                }

                if (options.originalCssClass) {
                    $elementToHandle.toggleClass(options.originalCssClass, !shouldAppend);
                }

                if (options.appendedCssClass) {
                    $elementToHandle.toggleClass(options.appendedCssClass, shouldAppend);
                }

                if (shouldAppend) {
                    $parent = $elementToHandle.parent();
                    $elementToHandle = $elementToHandle.detach();
                    $elementToHandle.appendTo(element);
                    $elementToHandle.data("originalParent", $parent);
                }
                else {
                    $parent = $elementToHandle.data("originalParent");

                    if ($parent && $parent.length) {
                        $elementToHandle.removeData("originalParent");
                        $elementToHandle = $elementToHandle.detach();
                        $elementToHandle.appendTo($parent);
                    }
                }
            }
        };

        ko.bindingHandlers.toggle = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = valueAccessor() || {},
                    $element = $(element),
                    $targetElement = $('#' + options.targetElement),
                    subscriber = options.observable.subscribe(function (value) {
                        if (value) {
                            $element.removeClass(options.offClass).addClass(options.onClass);
                            $targetElement.show();
                        }
                        else {
                            $element.removeClass(options.onClass).addClass(options.offClass);
                            $targetElement.hide();
                        }
                    });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    if (subscriber) {
                        subscriber.dispose();
                        subscriber = null;
                    }

                    $targetElement = null;
                    $element = null;
                });
            }
        };

        ko.bindingHandlers.timedToggle = {
            init: function (element, valueAccessor) {
                var options = valueAccessor() || {},
                    oldValue,
                    subscriber = options.observable.subscribe(function (value) {
                        if (!general.isDefinedType(oldValue)) {
                            oldValue = value;
                        }

                        if (value !== oldValue && oldValue) {
                            $(element).removeClass(options.defaultClass).addClass(options.timedClass);
                            oldValue = value;

                            setTimeout(function (elementToRemove) {
                                $(elementToRemove).removeClass(options.timedClass).addClass(options.defaultClass);
                            }, options.timeout, element);
                        }
                    });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    if (subscriber) {
                        subscriber.dispose();
                        subscriber = null;
                    }

                    options = null;
                });
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

        ko.bindingHandlers.keypressTrigger = {
            init: function (element, valueAccessor) {
                var triggerFunction = ko.utils.unwrapObservable(valueAccessor());

                if (!general.isFunctionType(triggerFunction)) {
                    return;
                }

                $(element)
                    .on("keypress.keypressTrigger", function (e) {
                        var enterPressed = e.which == cKeyCode.CtrlEnter || e.which == cKeyCode.Enter;

                        if (enterPressed) {
                            triggerFunction();
                        }
                    });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).off(".keypressTrigger");
                });
            }
        };

        ko.bindingHandlers.destroyElement = {
            init: function (element, valueAccessor) {
                var removeFromDom = ko.utils.unwrapObservable(valueAccessor());

                if (removeFromDom) {
                    $(element).remove();
                }
            }
        };

        ko.bindingHandlers.draggable = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var opts = valueAccessor() || {};
                var bindings = allBindingsAccessor();
                var options = {
                    scroll: false,
                    containment: $('.alert-overlay')
                };

                if (bindings && bindings.dragStopAutoHeight) {
                    options.stop = function () {
                        if (element.style && element.style.height && element.style.height !== 'auto') {
                            element.style.height = 'auto';
                        }
                    };
                }

                options = $.extend(options, opts);
                $(element).draggable(options);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).draggable("destroy");
                });
            }
        };

        ko.bindingHandlers.toolTip = {
            init: function (element) {
                var isRtlLanguage = LanguageHelper.IsRtlLanguage();

                $(element).tooltip({
                    autoShow: false,
                    tooltipClass: "file_filter",
                    position: {
                        my: isRtlLanguage ? "right-40 center" : "left+20 center",
                        at: "right center",
                        using: function (position, feedback) {
                            $(this).css(position);
                            $("<div>")
                                .addClass("arrow")
                                .appendTo(this);
                        }
                    }
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).tooltip("destroy");
                });
            }
        };

        ko.bindingHandlers.fadeVisible = {
            init: function (element, valueAccessor) {
                var visible = ko.unwrap(valueAccessor());

                $(element).toggle(visible);
            },
            update: function (element, valueAccessor) {
                var visible = ko.unwrap(valueAccessor());

                if (visible) {
                    $(element).fadeIn();
                }
                else {
                    $(element).fadeOut();
                }
            }
        };

        ko.bindingHandlers.tokenReplace = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var el = $(element),
                    innerText = el.text(),
                    modifiers = "g",
                    opts = ko.utils.unwrapObservable(valueAccessor()) || {},
                    options = {
                        token: '',
                        replace: '',
                        ignoreCase: false
                    };

                $.extend(options, opts);

                if (options.ignoreCase === true) {
                    modifiers += "i";
                }

                var regex = new RegExp(general.escapeRe(options.token), modifiers);

                el.text(innerText.replace(regex, options.replace));
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var el = $(element),
                    innerText = el.text(),
                    modifiers = "g",
                    opts = ko.utils.unwrapObservable(valueAccessor()) || {},
                    options = {
                        token: '',
                        replace: '',
                        ignoreCase: false
                    };

                $.extend(options, opts);

                if (options.ignoreCase === true) {
                    modifiers += "i";
                }

                var regex = new RegExp(general.escapeRe(options.token), modifiers);

                el.text(innerText.replace(regex, options.replace));
            }
        };

        ko.bindingHandlers.otmDisplay = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var val = ko.utils.unwrapObservable(valueAccessor());
                $(element).text(Math.round(val) + ' %');
            }
        };

        ko.bindingHandlers.jScrollPane = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    postBoxTopic = options.postBoxTopic,
                    postBoxTopicSubscriber,
                    reinitOnWindowResize = function () {
                        ko.postbox.publish(postBoxTopic);
                    };
                // set options
                options = $.extend({}, {
                    autoReinitialise: false,
                    autoReinitialiseDelay: 200,
                    verticalDragMinHeight: 20,
                    reinitialiseDelay: 150
                }, options);

                options.reinitialiseDelay = Math.max(options.reinitialiseDelay, 200);
                window.addEventListener('resize', reinitOnWindowResize);

                if (postBoxTopic) {
                    postBoxTopicSubscriber = ko.postbox.subscribe(postBoxTopic, function () {
                        setTimeout(function (el, logData) {
                            var jscroll = $(el).data('jsp');

                            if (jscroll) {
                                try {
                                    jscroll.reinitialise();
                                }
                                catch (e) {
                                    e.message = "ko.bindingHandlers.jScrollPane ko.postbox.subscribe setTimeout jscroll.reinitialise,  original message: " +
                                        e.message + JSON.stringify(logData, null, 4);

                                    throw e;
                                }
                            }
                        }, options.reinitialiseDelay, element, { postBoxTopic: postBoxTopic, options: options, page: location.href });
                    });
                }

                $(element).jScrollPane(options);

                function jscrollOnWheelHandler(wheelEvent) {
                    //from "jquery.jscrollpane.js" for unbind 
                    var mwEvent = $.fn.mwheelIntent ? 'mwheelIntent.jsp' : 'mousewheel.jsp';
                    $('.jspContainer', element).unbind(mwEvent);

                    //calculate delta?
                    var deltas = {
                        wheelDeltaX: (general.isDefinedType(wheelEvent.wheelDeltaX) ? wheelEvent.wheelDeltaX : wheelEvent.deltaX) * $.fn.jScrollPane.defaults.mouseWheelSpeed,
                        wheelDeltaY: (general.isDefinedType(wheelEvent.wheelDeltaY) ? -wheelEvent.wheelDeltaY : wheelEvent.deltaY) * $.fn.jScrollPane.defaults.mouseWheelSpeed
                    };

                    $(element).data('jsp').scrollBy(deltas.wheelDeltaX, deltas.wheelDeltaY, false);
                    wheelEvent.preventDefault();
                }

                element.querySelector('.jspContainer').addEventListener('wheel', jscrollOnWheelHandler,
                    Browser.isPassiveEventListenersSupported() ? { capture: true, passive: false } : true);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    window.removeEventListener('resize', reinitOnWindowResize);
                    if (postBoxTopicSubscriber) {
                        postBoxTopicSubscriber.dispose();
                        postBoxTopicSubscriber = null;
                    }

                    elementToDispose.querySelector('.jspContainer').removeEventListener('wheel', jscrollOnWheelHandler,
                        Browser.isPassiveEventListenersSupported() ? { capture: true, passive: false } : true);

                    var jscroll = $(elementToDispose).data('jsp');

                    if (jscroll) {
                        jscroll.destroy();
                    }

                    element = null;
                });
            },
            update: function (element, valueAccessor) {
                var options = valueAccessor();
                if (options.postBoxTopic) {
                    ko.postbox.publish(options.postBoxTopic);
                }
            }
        };

        ko.bindingHandlers.scrollWithFixedhead = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    targetId = $("#" + options.targetElement),
                    customWidth = targetId.width() - 16,
                    existingCssClasses = targetId.attr("class");

                if (options.showIfMoreThan && options.length <= options.showIfMoreThan) {
                    return;
                }

                targetId.find("th").each(function () {
                    $(this).css({ "width": $(this).outerWidth() + "px" });
                });

                var clone = targetId
                    .find("thead")
                    .clone()
                    .addClass("static"),

                    headTemplate =
                        "<div class='clone-wrapper'>" +
                        "<table style='width: " + customWidth + "px' class='" + existingCssClasses + " clone'>" +
                        "<thead>" +
                        clone.html() +
                        "</thead>" +
                        "</table>" +
                        "</div>";

                $(element).prepend(headTemplate);

                setTimeout(function () {
                    $(targetId).find("thead").remove();
                }, 50);


                setTimeout(function (elementToScroll) {
                    $(elementToScroll).find(".scroll").jScrollPane({
                        showArrows: true
                    });
                }, 0, element);

                function jscrollOnWheelHandler(wheelEvent) {
                    //from "jquery.jscrollpane.js" for unbind 
                    var mwEvent = $.fn.mwheelIntent ? 'mwheelIntent.jsp' : 'mousewheel.jsp';
                    $('.jspContainer', element).unbind(mwEvent);

                    //calculate delta?
                    var deltas = {
                        wheelDeltaX: (general.isDefinedType(wheelEvent.wheelDeltaX) ? wheelEvent.wheelDeltaX : wheelEvent.deltaX) * $.fn.jScrollPane.defaults.mouseWheelSpeed,
                        wheelDeltaY: (general.isDefinedType(wheelEvent.wheelDeltaY) ? -wheelEvent.wheelDeltaY : wheelEvent.deltaY) * $.fn.jScrollPane.defaults.mouseWheelSpeed
                    }

                    $('.scroll', element).data('jsp').scrollBy(deltas.wheelDeltaX, deltas.wheelDeltaY, false);
                    wheelEvent.preventDefault();
                }

                setTimeout(function (elementToScroll) {
                    elementToScroll.querySelector('.jspContainer').addEventListener('wheel', jscrollOnWheelHandler,
                        Browser.isPassiveEventListenersSupported() ? { capture: true, passive: false } : true);
                }, 0, element);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    elementToDispose.querySelector('.jspContainer').removeEventListener('wheel', jscrollOnWheelHandler,
                        Browser.isPassiveEventListenersSupported() ? { capture: true, passive: false } : true);

                    var jscroll = $('.scroll', elementToDispose).data("jsp");
                    if (jscroll) {
                        jscroll.destroy();
                    }
                });
            }
        };

        ko.bindingHandlers.ddDropdown = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var params = valueAccessor();
                var el = $(element);

                if (params.isInitDDdropdown) {
                    el.msDropdown({
                        roundedBorder: false,
                        height: 300,
                        zIndex: 99999,
                        roundedCorner: false
                    });
                }
                else {
                    var oDropdown = el.msDropdown().data("dd");
                    oDropdown.destroy();
                }
            }
        };

        ko.bindingHandlers.gridHeightCalculator = {
            init: function (element, bindingParams) {
                var params = bindingParams();
                $(element).css({
                    height: params.rowCount * params.rowHeight + 'px',
                    'background-color': 'rgba(0, 0, 0, 0)'
                });
            }
        };

        ko.bindingHandlers.tabs = {
            init: function (element) {
                $(element).find('.tabs').tabs();

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).find('.tabs').tabs("destroy");
                });
            }
        };

        ko.bindingHandlers.resetPaymentDiv = {
            update: function (element, valueAccessor) {
                var observable = valueAccessor();

                if (!observable() && observable() !== 0) {
                    return;
                }

                if ($('#concretePayments').length)
                    $('#paymentTypesContainer').appendTo("#concretePayments");
            }
        };

        ko.bindingHandlers.paymentDivWithIntercalation = {
            init: function (element, valueAccessor) {
                var options = valueAccessor();
                if (!ko.toJS(options.missingInfo)) {
                    $('#paymentTypesContainer').hide();
                }
            },
            update: function (element, valueAccessor) {
                var options = valueAccessor();
                var disableAutoScrolling = ko.utils.unwrapObservable(options.disableAutoScrolling);

                if (!options.payment()) {
                    $('#paymentTypesContainer').hide();

                    if (!disableAutoScrolling &&
                        ($("#concretePayments div.card-wrap:visible").length > 0)) {
                        window.scrollTo(0, $('#concretePayments div.card-wrap:visible').last().offset().top);
                    }

                    return;
                }

                var divId = options.getPaymentId(options.payment);
                var top = $('#' + divId).offset().top;
                var lastDivOnRow = null;

                $('#concretePayments div.card-wrap:visible')
                    .each(function (index, div) {
                        var currentDiv = $(div);
                        if (currentDiv.offset().top === top) {
                            lastDivOnRow = currentDiv;
                        }
                    });

                if (lastDivOnRow) {
                    lastDivOnRow.after($('#paymentTypesContainer'));
                }

                $('#paymentTypesContainer').show();

                if (!disableAutoScrolling) {
                    window.scrollTo(0, top);
                }
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

        ko.bindingHandlers.nonRtlOptions = {
            init: function (element) {
                var isRtlLanguage = LanguageHelper.IsRtlLanguage(),
                    options = element.options,
                    shouldSetToLtr = isRtlLanguage && element.options && element.options.length;

                if (!shouldSetToLtr) {
                    return;
                }

                for (var i = 0; i < options.length; i++) {
                    var option = options[i];

                    if (option.text && !option.text.isRtlText()) {
                        option.innerHTML = '<span class="ltr">' + option.innerHTML + '</span>';
                    }
                }
            }
        };

        ko.bindingHandlers.dealSlipToggle = {
            init: function (element, valueAccessor) {
                var options = valueAccessor(),
                    trakingEventName = options.trakingEventName;

                var isFullScreenSubscriber = options.isFullScreen.subscribe(function (isFullScreen) {
                    var $body = $(document.body),
                        $chartContainer = $(element).closest('.advinion-chart').length > 0 && $(element).closest('.advinion-chart').is(':visible')
                            ? $(element).closest('.advinion-chart')
                            : $(element).closest('.deal-slip');

                    $(document.body).off('keydown.dealSlipToggle');
                    $chartContainer.toggleClass('fullscreen').toggleClass('expanded');
                    $body.toggleClass('chartpage-fullscreen');

                    if (isFullScreen) {
                        $(document.body).on('keydown.dealSlipToggle', function (event) {
                            if (event.keyCode !== $.ui.keyCode.ESCAPE) {
                                return;
                            }

                            if (options.isFullScreen()) {
                                HistoryManager.Back();

                                event.preventDefault();
                                event.stopPropagation();
                            }
                        });
                    }
                    ko.postbox.publish(trakingEventName, { element: isFullScreen ? 'expand-button' : 'collapse-button' });
                }, options);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(element).closest('.deal-slip').off('.dealSlipToggle');
                    $(document.body).keydown = options.keydownHandler;
                    $(document.body).off('keydown.dealSlipToggle');

                    if (isFullScreenSubscriber) {
                        isFullScreenSubscriber.dispose();
                        isFullScreenSubscriber = null;
                    }
                });
            }
        };

        ko.bindingHandlers.createChartUsingCanvas = {
            update: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    risePercent = options.risePercent,
                    fallPercent = options.fallPercent,
                    isDisable = options.isDisable,
                    isRtlLanguage = LanguageHelper.IsRtlLanguage();

                var context = element.getContext('2d');
                context.clearRect(0, 0, element.width, element.height);

                var radius = 75,
                    lineWidth = 35,
                    x = (isRtlLanguage ? 1 : 0) * (lineWidth + radius),
                    y = element.height / 2,
                    startAngleRise = isRtlLanguage ? 0.5 * Math.PI : 1.5 * Math.PI,
                    endAngleRise = isRtlLanguage ? (0.5 + fallPercent) * Math.PI : (1.5 + risePercent) * Math.PI,
                    counterClockwise = false;

                context.beginPath();
                context.arc(x, y, radius, startAngleRise, endAngleRise, counterClockwise);
                context.lineWidth = lineWidth;
                context.strokeStyle = isDisable ? '#ccc' : isRtlLanguage ? 'red' : 'green';
                context.stroke();

                var startAngleFall = endAngleRise;
                var endAngleFall = isRtlLanguage ? 1.5 * Math.PI : 0.5 * Math.PI;

                context.beginPath();
                context.arc(x, y, radius, startAngleFall, endAngleFall, counterClockwise);
                context.lineWidth = lineWidth;
                context.strokeStyle = isDisable ? '#ccc' : isRtlLanguage ? '#4dac4c' : '#ec4443';
                context.stroke();
            }
        };

        ko.bindingHandlers.triggerEventOnWindowResize = {
            init: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    lastWidth = 0,
                    lastHeight = 0;

                function resizeHandler(targetElement) {
                    var trigger = false,
                        newWidth = $(targetElement).width(),
                        newHeight = $(targetElement).height();

                    if (lastWidth !== newWidth) {
                        lastWidth = newWidth;
                        trigger = true;
                    }

                    if (lastHeight !== newHeight) {
                        lastHeight = newHeight;
                        trigger = true;
                    }

                    if (trigger) {
                        ko.postbox.publish(options.eventName, { 'width': newWidth, 'height': newHeight });
                    }
                }

                $(window).on("resize.triggerEventOnWindowResize", resizeHandler.bind(window, element));

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(window).off("resize.triggerEventOnWindowResize", resizeHandler);
                });
            }
        };

        ko.bindingHandlers.toggleElement = {
            update: function (element, valueAccessor) {
                var collapse = ko.utils.unwrapObservable(valueAccessor());
                if (collapse)
                    $(element).hide();
                else
                    $(element).show();
            }
        };

        ko.bindingHandlers.tileLayoutSelector = {
            update: function (element, valueAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    clickEventKey = 'click.tileLayoutSelector.' + (options.id || '0'),
                    layoutExpandedSubscriber;

                if (!ko.isObservable(options.layoutExpanded)) {
                    return;
                }

                layoutExpandedSubscriber = options.layoutExpanded.subscribe(function (isExpanded) {
                    if (isExpanded) {
                        $(document).bind(clickEventKey, helpForSelfClose);
                    }
                    else {
                        $(document).unbind(clickEventKey);
                    }
                });

                function helpForSelfClose() {
                    if (options.layoutExpanded()) {
                        options.layoutExpanded(false);
                        $(document).unbind(clickEventKey);
                    }
                }

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (layoutExpandedSubscriber && general.isFunctionType(layoutExpandedSubscriber.dispose)) {
                        layoutExpandedSubscriber.dispose();
                        layoutExpandedSubscriber = null;
                    }

                    $(document).unbind(clickEventKey);
                });
            }
        };

        ko.bindingHandlers.addSpanToLastWord = {
            init: function (element) {
                var html = $(element).html();
                var text = $(element).text().trim();
                var lastWord = text.substring(text.lastIndexOf(" ") + 1);
                var processedText = '<span class="inline-block">' + lastWord;

                html = html.replace(lastWord, processedText) + '</span>';
                $(element).html(html);
            }
        };

        ko.bindingHandlers.disableEnterKey = {
            init: function (element) {
                var eventName = 'keypress.' + $(element).attr('id');

                function preventEnterKeypress(event) {
                    if (event.keyCode === $.ui.keyCode.ENTER) {
                        event.preventDefault();
                    }
                }

                $(element).on(eventName, preventEnterKeypress);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).off(eventName);
                });
            }
        };

        ko.bindingHandlers.hoverOnClick = {
            init: function (element) {

                $(element)
                    .on("touchstart.hoverOnClick", function () {
                        $(this).trigger("click");
                    });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
                    $(elementToDispose).off(".hoverOnClick");
                });
            }
        };

        ko.bindingHandlers.accordion = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var allBindings = allBindingsAccessor();

                function closeAccordionSection() {
                    $('.accordion-section').removeClass('active');
                    $('.accordion-section-content').slideUp(300).removeClass('open');
                }

                $(element).click(function (e) {
                    // Grab current anchor value
                    var currentAttrValue = $(this).attr('for');

                    if ($(this).is('.active')) {
                        closeAccordionSection();
                    }
                    else {
                        closeAccordionSection();

                        ko.postbox.publish(allBindings.openEventName, ko.dataFor(this.parentElement.parentElement));

                        // Add active class to section title
                        $(this).addClass('active');
                        // Open up the hidden content panel
                        $(element).find('#' + currentAttrValue).slideDown(300).addClass('open');
                    }

                    e.preventDefault();
                });
            }
        };

        ko.bindingHandlers.menu = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = ko.utils.unwrapObservable(valueAccessor()),
                    itemCss = options.css;

                function removeSelection() {
                    $('.' + itemCss).removeClass('activeMenu');
                }

                $(element).on('click', function (e) {
                    removeSelection();

                    if (!$(this).is('.activeMenu')) {
                        $(this).addClass('activeMenu');
                    }

                    e.preventDefault();
                });
            }
        };

        ko.bindingHandlers.adjustHcContainer = {
            init: function (element, va) {
                var options = ko.utils.unwrapObservable(va()),
                    offset = options.offset;

                var adjustOnScroll = function () {
                    var referenceValue;

                    if (!options.visible()) {
                        return;
                    }

                    if (window.pageYOffset == 0) {
                        element.style.height = '';
                        element.style.top = '';
                    }
                    else {
                        referenceValue = window.pageYOffset <= offset ? window.pageYOffset : offset;
                        element.style.top = (offset - referenceValue) + 'px';
                        element.style.height = "calc(100% - " + (offset - referenceValue) + "px)";
                    }
                };

                var adjustOnResize = function () {
                    if (options.visible() && window.emilyScrollContainer &&
                        general.isFunctionType(window.emilyScrollContainer)) {
                        window.emilyScrollContainer();
                    }
                };

                window.addEventListener('scroll', adjustOnScroll);
                window.addEventListener('resize', adjustOnResize);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    window.removeEventListener('scroll', adjustOnScroll);
                    window.removeEventListener('resize', adjustOnResize);
                });
            }
        };

        ko.bindingHandlers.loadOdealsOnScroll = {
            init: function (element, valueAccessor) {
                var opts = ko.utils.unwrapObservable(valueAccessor());

                var currentRenders = opts.model.CurrentRenders,
                    lazyLoadDealsData = function () {
                        var allLoaded = opts.model.LastDealPosition() === (opts.model.DealsList().length - 1);

                        if (!allLoaded) {
                            currentRenders(currentRenders() + 1);
                        }
                    };

                var callOnScroll = function () {
                    if (!element.getClientRects()[0]) {
                        return;
                    }

                    var elTop = element.getClientRects()[0].top,
                        elHeight = element.getClientRects()[0].height;
                    var diff = elTop + elHeight < window.innerHeight;

                    if (diff && !opts.model.IsRenderingData()) {
                        lazyLoadDealsData();
                    }
                };

                window.addEventListener('scroll', callOnScroll);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    window.removeEventListener('scroll', callOnScroll);
                });
            }
        };

        ko.bindingHandlers.dealSlipCenter = {
            init: function (element, va) {
                var opts = ko.utils.unwrapObservable(va()),
                    dialogEl = $('.' + opts.elementClass),
                    to,
                    flagSubscribe,
                    toDelay = 0,
                    centerSlip = function () {
                        dialogEl.center();
                    },
                    centerSlipDelay = function () {
                        if (to) {
                            clearTimeout(to);
                        }
                        to = setTimeout(function () {
                            dialogEl.center();
                        }, toDelay);
                    }, 
                    recenter = opts.recenterWithDelay ? centerSlipDelay : centerSlip;

                if (opts.chartStationPage) {
                    return;
                }

                recenter();
                if (opts.flag) {

                    flagSubscribe = opts.flag.subscribe(recenter);
                }
                window.addEventListener('resize', recenter);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (flagSubscribe) {
                        flagSubscribe.dispose();
                        flagSubscribe = null;
                    }
                    clearTimeout(to);
                    window.removeEventListener('resize', recenter);
                });
            }
        };
    }
);
