/* global mobilePatches */
define("devicehelpers/KoCustomBindings", [
	"require",
	"knockout",
	"handlers/general",
	"jquery",
	"vendor/jquery-ui",
	"devicehelpers/keyboard-status",
	"global/swipe",
	"vendor/normalize-scroll-left",
	"handlers/languageHelper",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		scrollLeftNormalizer = require("vendor/normalize-scroll-left"),
		$ = require("jquery"),
		languageHelper = require("handlers/languageHelper");

	ko.bindingHandlers.setArrows = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());

			function handleArrowsVisibility(domElement) {
				var containerWidth = domElement.clientWidth,
					scrollWidth = domElement.scrollWidth,
					sideOffset = scrollLeftNormalizer.getNormalizedScrollLeft(
						domElement,
						languageHelper.IsRtlLanguage() ? "rtl" : "ltr"
					),
					remainingScroll = scrollWidth - (containerWidth + sideOffset),
					rightArrowContainer = languageHelper.IsRtlLanguage()
						? $(domElement).find(".left-arrow")
						: $(domElement).find(".right-arrow"),
					leftArrowContainer = languageHelper.IsRtlLanguage()
						? $(domElement).find(".right-arrow")
						: $(domElement).find(".left-arrow"),
					arrowHeight = $(domElement).height(),
					compareScroll = Math.floor(leftArrowContainer.width() / 2);

				if (containerWidth < scrollWidth) {
					rightArrowContainer.height(arrowHeight);
					leftArrowContainer.height(arrowHeight);

					rightArrowContainer.removeClass("arrow-hidden");
					if (sideOffset > 0) {
						leftArrowContainer.removeClass("arrow-hidden");
					}

					if (sideOffset < compareScroll && !leftArrowContainer.hasClass("arrow-hidden")) {
						leftArrowContainer.addClass("arrow-hidden");
					}

					if (
						sideOffset !== 0 &&
						remainingScroll <= compareScroll &&
						!rightArrowContainer.hasClass("arrow-hidden")
					) {
						rightArrowContainer.addClass("arrow-hidden");
					}
				} else {
					leftArrowContainer.addClass("arrow-hidden");
					rightArrowContainer.addClass("arrow-hidden");
				}
			}

			function handleOrientationChange(domElement) {
				switch (window.orientation) {
					case 90:
						var rightArrowContainer = $(domElement).find(".right-arrow"),
							leftArrowContainer = $(domElement).find(".left-arrow");

						if (!leftArrowContainer.hasClass("arrow-hidden")) {
							leftArrowContainer.addClass("arrow-hidden");
						}

						if (!rightArrowContainer.hasClass("arrow-hidden")) {
							rightArrowContainer.addClass("arrow-hidden");
						}
						break;

					default:
						setTimeout(handleArrowsVisibility, 0, domElement);
						break;
				}
			}

			function setArrowClickBehavior(domElement) {
				var rightArrowContainer = $(domElement).find(".right-arrow"),
					leftArrowContainer = $(domElement).find(".left-arrow");

				rightArrowContainer.on("click", function () {
					var nextPresetItem = $(domElement).find(".list-item.active").next(".list-item").find("a");
					nextPresetItem.click();
				});

				leftArrowContainer.on("click", function () {
					var previousPresetItem = $(domElement).find(".list-item.active").prev(".list-item").find("a");
					previousPresetItem.click();
				});
			}

			// bind the function to element
			var orientationChangeHandler = handleOrientationChange.bind(this, element),
				subscriber = null;

			if (options && options.elementsObservable) {
				subscriber = options.elementsObservable.subscribe(function (value) {
					setTimeout(handleArrowsVisibility, 0, element);
				});
			}

			$(window).on("orientationchange.setArrows", orientationChangeHandler);

			$(element).on("scroll.setArrows", function scrollHandler() {
				handleArrowsVisibility(this);
			});

			setTimeout(handleArrowsVisibility, 0, element);
			setTimeout(setArrowClickBehavior, 0, element);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".setArrows");
				$(window).off("orientationchange.setArrows", orientationChangeHandler);
				$(elementToDispose).find(".right-arrow, .left-arrow").off("click");

				if (subscriber) {
					subscriber.dispose();
					subscriber = null;
				}

				orientationChangeHandler = null;
			});
		},
	};

	ko.bindingHandlers.ScrollToElement = {
		init: function (element) {
			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				clearTimeout(elementToDispose.ScrollToElementTimer);
			});
		},
		update: function (element, valueAccessor) {
			var isActive = ko.utils.unwrapObservable(valueAccessor());

			if (isActive) {
				clearTimeout(element.ScrollToElementTimer);

				element.ScrollToElementTimer = setTimeout(
					function scrollToElementHandler(elementToScroll) {
						var parent = elementToScroll.parentNode,
							leftArrowWidth = $(parent).find(".left-arrow").outerWidth() || 0,
							rightArrowWidth = $(parent).find(".right-arrow").outerWidth() || 0,
							parentScrollLeft = $(parent).scrollLeft(),
							parentOffsetWidth = $(parent).outerWidth(),
							elementWidth = $(element).outerWidth(true),
							elementLeftPosition = $(elementToScroll).position().left,
							elementRightPosition = elementLeftPosition + elementWidth,
							isPartialRightInvisible = elementRightPosition > parentOffsetWidth - rightArrowWidth,
							isPartialLeftInvisible = elementLeftPosition < parentScrollLeft + leftArrowWidth;

						if (isPartialRightInvisible) {
							$(parent).animate({
								scrollLeft:
									parentScrollLeft + (elementRightPosition - (parentOffsetWidth - rightArrowWidth)), // + rightArrowWidth,
								duration: 200,
							});
						} else if (isPartialLeftInvisible) {
							$(parent).animate({
								scrollLeft: parentScrollLeft + elementLeftPosition - leftArrowWidth,
								duration: 200,
							});
						}
					},
					100,
					element
				);
			}
		},
	};

	ko.bindingHandlers.toogleChartViewMode = {
		init: function (element, valueAccessor) {
			$(element).on("click.toogleChartViewMode", function toogleChartViewModeClick() {
				var options = ko.utils.unwrapObservable(valueAccessor()),
					dsChart = $("#dealChartMobileContainer"),
					fsCssClass = options.canTransact ? "fsTransact" : "fullscreen",
					fullScreenOn = dsChart.hasClass(fsCssClass),
					interactEl = "expand-button";

				$(element).toggleClass("collapse-button");

				if (fullScreenOn) {
					dsChart.removeClass(fsCssClass);
					interactEl = "collapse-button";
				} else {
					dsChart.addClass(fsCssClass);
				}

				ko.postbox.publish("deal-slip-chart-interaction", { element: interactEl });
				ko.postbox.publish("chart-container-resized");

				if (general.isFunctionType(options.callBack)) {
					options.callBack(!fullScreenOn);
				}
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".toogleChartViewMode");
			});
		},
	};

	ko.bindingHandlers.resetScroll = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var resetScrolling = valueAccessor();
			if (resetScrolling) {
				// TODO: do something with this
			}

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				clearTimeout(elementToDispose.resetScrollTimer);
			});
		},
		update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			window.scrollTo(0, 1);

			if (mobile && mobile.browser.opera && mobilePatches && typeof mobilePatches.delayedFooter == "function") {
				clearTimeout(element.resetScrollTimer);

				element.resetScrollTimer = setTimeout(mobilePatches.delayedFooter, 400);
			}
		},
	};

	// AML tooltip Fade In
	ko.bindingHandlers.ttFadeIn = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor()),
				ttDataId = options.tt_data_id,
				hasTooltipOverlay = options.hasTooltipOverlay,
				noflip = options.noflip;

			$(element).on("click.ttFadeIn", function (event) {
				event.stopPropagation();

				$(".tooltips").css("display", "none");
				$(".tActive").removeClass("tActive");
				$(element).addClass("tActive");
				$("#" + ttDataId).fadeIn();

				var scrollTop = $(window).scrollTop(),
					triggerOffeset = $(element).offset().top - scrollTop,
					tooltipHeight = $("#" + ttDataId).outerHeight();

				var isVisible = triggerOffeset + tooltipHeight + 20 < $(window).height();

				if (!isVisible && !!noflip) {
					$(element).addClass("flippedTrigger");
					$("#" + ttDataId).addClass("flipped");
				} else {
					$(element).removeClass("flippedTrigger");
					$("#" + ttDataId).removeClass("flipped");
				}

				if (hasTooltipOverlay) {
					$("body").addClass("mobilePopupVisible");
					$(".tooltip-overlay").addClass("visible");
				}
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".ttFadeIn");
			});
		},
	};

	// AML tooltip Fade Out
	ko.bindingHandlers.ttFadeOut = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor()),
				ttIconId = options.tt_icon_id,
				ttDataId = options.tt_data_id,
				hasTooltipOverlay = options.hasTooltipOverlay;

			$(element).on("click.ttFadeOut", function (event) {
				event.stopPropagation();

				$("#" + ttIconId).removeClass("active");
				$($("#" + ttDataId)[0])
					.prev()
					.removeClass("tActive");
				$("#" + ttDataId).fadeOut();

				if (hasTooltipOverlay) {
					$("body").removeClass("mobilePopupVisible");
					$(".tooltip-overlay").removeClass("visible");
				}
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".ttFadeOut");
			});
		},
	};

	//trigger ttFadeOut on all childs selected by targetSelector
	ko.bindingHandlers.ttTriggerFadeOut = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor()),
				targetSelector = options.targetSelector || "i.close";

			$(element).on("click.ttTriggerFadeOut", function (event) {
				$(targetSelector, element).trigger("click.ttFadeOut");
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".ttTriggerFadeOut");
			});
		},
	};

	ko.bindingHandlers.tooltipHandle = {
		init: function (element, valueAccessor) {
			var tooltipId = ko.utils.unwrapObservable(valueAccessor()),
				indicatorClass = "tooltip-indicator";

			$(element).on("click", function () {
				var el = $(element),
					tooltipContent = $("#" + tooltipId),
					indicators = $("." + indicatorClass),
					tooltips = $(".tooltip-content"),
					isIndicator = el[0].className.indexOf(indicatorClass) !== -1,
					visible = tooltipContent.css("display") !== "none";

				indicators.removeClass("opened");
				tooltips.hide();

				if (isIndicator && !visible) {
					el.addClass("opened");
					tooltipContent.show();
				}
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".tooltipHandle");
			});
		},
	};

	// this binding is to be used only for mobile because of hardcoded media
	// and it is not supported by i.e 8
	ko.bindingHandlers.ajustMobileFontSize = {
		init: function (element) {
			var value = element.textContent;
			var el = $(element);

			if (!general.isFunctionType(window.matchMedia)) {
				return;
			}

			var mql = window.matchMedia("screen and (max-width: 360px)");

			if (mql.matches) {
				// if media query matches
				var elW = el.parent().width();
				var simW = general.simulatedContentStringLegth(value, el.css("font"));

				if (elW > simW) {
					// in this case = el.parent().width() => "#quotesPage .thelist div {width: 130px;}" must be defined in css file so the script is able to perform calculation !!!!!
					ko.utils.toggleDomNodeCssClass(element, "medium_font", true);
				}

				if (simW / elW > 1.0) {
					// in this case = el.parent().width() => "#quotesPage .thelist div {width: 130px;}" must be defined in css file so the script is able to perform calculation !!!!!
					ko.utils.toggleDomNodeCssClass(element, "small_font", true);
				}
			}
		},
	};

	ko.bindingHandlers.AlertCustomHeightAdjustments = {
		update: function (element) {
			var el = $(element);
			var articleHeight =
				$(window).height() -
				el.find(".alert-box .heading").outerHeight(true) -
				el.find(".alert-box footer").outerHeight(true);

			el.find("article").css({ "min-height": articleHeight + "px" });
		},
	};

	ko.bindingHandlers.triggerEventOnOrientationChange = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());

			function orientationChangeHandler() {
				ko.postbox.publish("orientation-change", options);
			}

			window.addEventListener("orientationchange", orientationChangeHandler);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				window.removeEventListener("orientationchange", orientationChangeHandler);
			});
		},
	};

	ko.bindingHandlers.toggleMobileMenu = {
		init: function (element) {
			var tout, tout2;
			function menuClickEventHandler() {
				var elementClickEventhandler = function (event) {
						$(event.data).trigger("click");
					},
					$menuVisibleContentHover = $("<div>")
						.addClass("menu-visible-content-hover")
						.on("click", element, elementClickEventhandler),
					$header = $("#header"),
					$footer = $("#footer"),
					$mainMenu = $("#main-menu"),
					$mainContent = $("#main"),
					$mainMenuScrollableList = $("#main-menu .menu-list"),
					pgBubble = $("#pgWrap");

				var togglePgBubble = function (visible) {
					if (pgBubble) {
						pgBubble.css("visibility", visible ? "visible" : "hidden");
					}
				};

				$mainContent.css({ position: "fixed" });

				$mainMenu.toggleClass("menu-expanded");
				$mainContent.toggleClass("content-unslided content-slided");
				$header.toggleClass("content-slided");
				$footer.toggleClass("content-slided");
				$mainMenuScrollableList.animate({ scrollTop: 0 }, 0);

				if ($mainContent.hasClass("content-slided")) {
					togglePgBubble(false);
					$mainContent.append($menuVisibleContentHover);
					if (pgBubble) {
						pgBubble.css("visibility", "hidden");
					}
				} else {
					clearTimeout(tout);
					clearTimeout(tout2);
					tout = setTimeout(function () {
						togglePgBubble(true);
					}, 250);
					$(".menu-visible-content-hover").remove();
					tout2 = setTimeout(
						function ($main) {
							$main.css({ position: "absolute" });
						},
						250,
						$mainContent
					);
				}
			}

			$(element).on("click.toggleMobileMenu", menuClickEventHandler);
			$(window).on("orientationchange.toggleMobileMenu", function () {
				if ($("#main").hasClass("content-slided")) {
					menuClickEventHandler();
				}
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".toggleMobileMenu");
				$(window).off("orientationchange.toggleMobileMenu");
				clearTimeout(tout);
				clearTimeout(tout2);
			});
		},
	};

	ko.bindingHandlers.virtualKeyboardBehavior = {
		init: function (element) {
			function hideFooter() {
				$("#footer").css({ display: "none" });
			}

			function showFooter() {
				$("#footer").css({ display: "block" });
			}

			$(element).on("focus.virtualKeyboardBehavior", hideFooter).on("blur.virtualKeyboardBehavior", showFooter);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off("focus.virtualKeyboardBehavior", "blur.virtualKeyboardBehavior");
				showFooter();
			});
		},
	};

	ko.bindingHandlers.hideFooter = {
		init: function (element, valueAccessor) {
			var options = valueAccessor(),
				hideFooterOnLastPayment = ko.computed(function () {
					if (options.isPaymentButtonVisible()) {
						$("#footer").hide();
					} else {
						$("#footer").show();
					}
				});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				hideFooterOnLastPayment.dispose();
				$("#footer").show();
			});
		},
	};

	ko.bindingHandlers.menuSwipe = {
		init: function (element) {
			swipe(element, 65, function (currentX, startX) {
				var isRtl = languageHelper.IsRtlLanguage();

				if ((isRtl && currentX > startX) || (!isRtl && currentX < startX)) {
					$("#main-menu .close-button").trigger("click");
				}
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				swipeDestroy(elementToDispose);
			});
		},
	};

	ko.bindingHandlers.mainGridSticky = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor()),
				referenceHeight = $(options.referenceElementId).outerHeight(),
				scrolling,
				iosDevices = Browser.getiosDevices(),
				targetedDevices =
					Browser.isSafariMobile() &&
					(iosDevices.older.iphSeSimilar ||
						iosDevices.notch.iphXSimilar ||
						iosDevices.notch.iphXr ||
						iosDevices.notch.iphXsMax),
				setVisible = function (value) {
					$(element)
						.find(".fixed-wrap, .head-bg")
						.css("visibility", value ? "visible" : "hidden");
				};

			function setStickyHeader(enabled) {
				if (enabled) {
					$(element).addClass("fixed-to").find(".fixed-wrap, .head-bg").css("top", referenceHeight);
				} else {
					$(element).removeClass("fixed-to");
				}
			}

			function scrollHandler() {
				var scroll = $(window).scrollTop(),
					initialCoords = Math.floor($(element).offset().top);

				if (scroll >= initialCoords - referenceHeight) {
					setStickyHeader(true);
				} else {
					setStickyHeader(false);
				}
			}

			$(window).on("scroll.mainGridSticky touchmove.mainGridSticky", function () {
				referenceHeight = $(options.referenceElementId).outerHeight();
				scrollHandler();
				if (targetedDevices) {
					if (!scrolling) {
						setVisible(false);
					}

					clearTimeout(scrolling);
					scrolling = setTimeout(function () {
						scrolling = null;
						setVisible(true);
					});
				}
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				clearTimeout(scrolling);
				$(window).off(".mainGridSticky");
			});
		},
	};

	ko.bindingHandlers.stickyElement = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor()),
				referenceHeight = $(options.referenceElementId).outerHeight(),
				parentHeight;

			function doBindings() {
				var elementInitialPosition = $(element).offset(),
					didScroll = false;

				function setTableWidths(reference) {
					var $referenceRowCells = $(reference).find("th");

					$.each($referenceRowCells, function (key) {
						$($referenceRowCells[key]).width($($referenceRowCells[key]).width());
					});
				}

				function fixParentHeight(enable) {
					if (!options.usePlaceHolder) {
						$(element)
							.closest("table")
							.css("margin-top", enable ? $(element).css("height") : "");
					} else {
						$(element)
							.parent()
							.css("height", enable ? parentHeight : "");
					}
				}

				$(window)
					.on("scroll.stickyElement touchmove.stickyElement", function scrollHandler() {
						var $elementToFix = $(element),
							scroll = $(window).scrollTop();

						if (!didScroll) {
							parentHeight = $(element).parent().css("height");
							elementInitialPosition = $(element).offset();
							referenceHeight = $(options.referenceElementId).outerHeight();
							didScroll = true;
						}

						if (scroll >= Math.ceil(elementInitialPosition.top) - referenceHeight) {
							if (options.preserveTableSize) {
								setTableWidths($elementToFix);
							}

							$elementToFix.addClass("fixed header-clone").css("top", referenceHeight);
							fixParentHeight(true);
						} else {
							$elementToFix.removeClass("fixed header-clone").css("top", "");
							fixParentHeight();
						}
					})
					.on("orientationchange.stickyElement", function () {
						referenceHeight = $(options.referenceElementId).outerHeight();
					});
			}

			doBindings();

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(window).off(".stickyElement");
				$(elementToDispose).removeClass("fixed header-clone").css("top", "");
				$(elementToDispose).closest("table").css("margin-top", "");
			});
		},
	};

	ko.bindingHandlers.scrollToTab = {
		init: function (element) {
			$(element).on("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				var offset = $(this).offset().top - $("#header").height();

				setTimeout(function () {
					$("body").animate({ scrollTop: offset }, 500);
				}, 50);
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off("click");
			});
		},
	};

	ko.bindingHandlers.scrollToItem = {
		init: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (value) {
				setTimeout(
					function (el) {
						el.scrollIntoView({ inline: "center" });
					},
					50,
					element
				);
			}
		},
	};

	ko.bindingHandlers.tel = {
		init: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			$(element).attr("href", "tel:" + value);
		},
	};

	ko.bindingHandlers.removeOnClick = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor()),
				callback = options.callback,
				$target,
				removeTimerId;

			if (options.parent) {
				$target = $(element).closest(options.parent);
			} else if (options.child) {
				$target = $(element).find(options.child);
			} else {
				$target = $(element);
			}

			$(element).on("click.removeOnClick", function () {
				$target.addClass("remove");

				clearTimeout(removeTimerId);
				removeTimerId = setTimeout(
					function ($elementToRemove, removeCallback) {
						$elementToRemove.remove();

						if (general.isFunctionType(removeCallback)) {
							removeCallback();
						}
					},
					300,
					$target,
					callback
				);
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function (elementToDispose) {
				$(elementToDispose).off(".removeOnClick");

				clearTimeout(removeTimerId);
				options = null;
				$target = null;
			});
		},
	};

	ko.bindingHandlers.addWindowFocusEventListener = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());

			$(window).on("focus.addWindowFocusEventListener", options.onFocus);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				$(window).off("focus.addWindowFocusEventListener");
				options = null;
			});
		},
	};

	ko.bindingHandlers.accordion = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var allBindings = allBindingsAccessor();

			function closeAccordionSection() {
				$(".accordion-section").removeClass("active");
				$(".accordion-section-content").slideUp(300).removeClass("open");
			}

			$(element).on("click", function (e) {
				// Grab current anchor value
				var currentAttrValue = $(this).attr("for");

				if ($(this).is(".active")) {
					closeAccordionSection();
				} else {
					closeAccordionSection();

					ko.postbox.publish(allBindings.openEventName, ko.dataFor(this.parentElement.parentElement));

					// Add active class to section title
					$(this).addClass("active");
					// Open up the hidden content panel
					$(element)
						.find("#" + currentAttrValue)
						.slideDown(300)
						.addClass("open");
				}

				e.preventDefault();
			});
		},
	};

	ko.bindingHandlers.expand = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var allBindings = allBindingsAccessor();
			var isOpen = allBindings.isOpen;
			var toggleHandler = allBindings.toggleHandler;
			var $expandableHeader = $(element).find(".accordion-section-faq").first();
			var $expandableContainer = $(element);

			if (isOpen) {
				expand();
			} else {
				collapse();
			}

			function expand() {
				var currentAttrValue = $expandableContainer.attr("for");
				// Add active class to section title
				$expandableContainer.addClass("active");
				// Open up the hidden content panel
				$expandableContainer
					.find("#" + currentAttrValue)
					.slideDown(300)
					.addClass("open");
			}

			function collapse() {
				var currentAttrValue = $expandableContainer.attr("for");
				// Add active class to section title
				$expandableContainer.removeClass("active");
				// Open up the hidden content panel
				$expandableContainer
					.find("#" + currentAttrValue)
					.slideUp(300)
					.removeClass("open");
			}

			$expandableHeader.on("click", function (e) {
				// Grab current anchor value

				if (!general.isNullOrUndefined(toggleHandler) && general.isFunctionType(toggleHandler)) {
					var value = !$expandableContainer.is(".active");

					toggleHandler(value);
				}

				if ($expandableContainer.is(".active")) {
					collapse();
				} else {
					expand();
				}

				e.preventDefault();
			});
		},
	};

	ko.bindingHandlers.tutorialPlayer = {
		init: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());

			var subscriber = options.playerVisible.subscribe(function (value) {
				if (!value) {
					document.body.classList.remove("mobilePopupVisible");
					element.querySelector("iframe").remove();
				}
			});

			element.querySelector(".close").addEventListener("click", function () {
				options.playerVisible(false);
			});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				document.body.classList.remove("mobilePopupVisible");

				if (subscriber) {
					subscriber.dispose();
					subscriber = null;
				}
			});
		},
		update: function (element, valueAccessor) {
			var options = ko.utils.unwrapObservable(valueAccessor());

			if (options.path() === "") {
				return;
			}

			var ifrm = document.createElement("iframe");
			ifrm.setAttribute("src", options.path());
			ifrm.classList.add("no-border");
			ifrm.setAttribute("id", "EducationalTutorialsIframe");

			element.appendChild(ifrm);

			options.playerVisible(true);

			window.scrollTo(0, 1);
			document.body.classList.add("mobilePopupVisible");
		},
	};

	ko.bindingHandlers.nonRtlOptions = {
		init: function (element) {
			var isRtlLanguage = languageHelper.IsRtlLanguage(),
				options = element.options,
				shouldSetToLtr = isRtlLanguage && element.options && element.options.length;

			if (!shouldSetToLtr) {
				return;
			}

			for (var i = 0; i < options.length; i++) {
				var option = options[i];

				if (option.text && !option.text.isRtlText()) {
					option.classList.add("ltr");
				} else {
					option.classList.remove("ltr");
				}
			}
		},
	};

	ko.bindingHandlers.animatePgbubbleHide = {
		init: function (element) {
			var to,
				parent = document.getElementById("pgWrap");

			element.onclick = function () {
				parent.classList.toggle("animate");
				clearTimeout(to);
				to = setTimeout(function () {
					parent.classList.toggle("animatehide");
				}, 600);
			};

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				clearTimeout(to);
			});
		},
	};

	ko.bindingHandlers.unchainMainScroll = {
		init: function (e, va) {
			var bodyEl = document.getElementsByTagName("body")[0],
				options = ko.utils.unwrapObservable(va()),
				subscription = options.dependOn.subscribe(function (value) {
					bodyEl.style.position = value ? "fixed" : "";
				});

			ko.utils.domNodeDisposal.addDisposeCallback(e, function () {
				subscription.dispose();
			});
		},
	};
});
