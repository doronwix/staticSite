define([
	"require",
	"jquery",
	"knockout",
	"handlers/general",
	"widgets/AutocompleteWidget",
	"configuration/initconfiguration",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		initConfiguration = require("configuration/initconfiguration"),
		$ = require("jquery");

	ko.bindingHandlers.autocomplete = {
		init: function (element, valueAccessor) {
			var options = valueAccessor(),
				domElement = options.elementType,
				selectedSubscriber,
				sourceSubscriber,
				minLength = options.minLength,
				$autocompleteWrapper = $("." + options.autocompleteWrapperClass),
				$predefinedOptionsList = $autocompleteWrapper.find("." + options.predefinedOptionsListClass),
				searchPostBoxTopic = options.searchPostBoxTopic,
				selectPostBoxTopic = options.selectPostBoxTopic,
				firstSearch = true;

			selectedSubscriber = options.selected.subscribe(function selectedInstrumentChanged(item) {
				if (!item || !general.isDefinedType(item.id)) {
					return;
				}

				if (Browser.isInternetExplorer() && firstSearch) {
					firstSearch = false;
					setTimeout(
						function (elementToFocus) {
							$(elementToFocus).trigger("focus");
						},
						initConfiguration.AutoCompleteConfiguration.IEFirstSearchTimeOut,
						options.elementToFocusOnChange + item.id
					);
				} else if (options.elementToFocusOnChange) {
					setTimeout(
						function (elementToFocus) {
							$(elementToFocus).trigger("focus");
						},
						100,
						options.elementToFocusOnChange + item.id
					);
				}

				if (item.hideDropDown) {
					return;
				}

				if (domElement !== "input.mobile") {
					$autocompleteWrapper.toggle();
				}

				$(options.triggerFrom).toggleClass("focus");
			});

			function adjustListHeight() {
				var listHeight = $(options.appendTo).find("ul:visible").outerHeight();
				var containerHeight = Math.min(listHeight, options.contentMaxHeight || 180) + 1;

				$(options.appendTo).css("height", containerHeight + "px");
			}

			function resetTopPosition() {
				var listContainer = $(options.appendTo).closest("div:visible").find(".jspPane");

				listContainer.css("top", 0);
			}

			function adjustPosition() {
				var windowHeight = $(window).height(),
					windowScrollTop = $(window).scrollTop(),
					autocompleteWrapperHeight = $autocompleteWrapper.outerHeight(),
					inputOffsetTop = $(element).offset().top,
					inputHeight = $("#" + options.relativeFieldId).outerHeight();

				var $searchBoxElement = $autocompleteWrapper.find(".ui-autocomplete-input");

				if (inputOffsetTop + inputHeight + autocompleteWrapperHeight > windowHeight + windowScrollTop) {
					$autocompleteWrapper.css("bottom", inputHeight + "px");
					$searchBoxElement.appendTo($autocompleteWrapper);
				} else {
					$autocompleteWrapper.css("bottom", "");
					$searchBoxElement.prependTo($autocompleteWrapper);
				}
			}

			function buildForMobile() {
				var customized = $autocompleteWrapper.parent().find(".customized"),
					closeButton = $autocompleteWrapper.find(".closeButton");

				$(element).fxautocomplete({
					source: options.source,
					selected: options.selected,
					appendTo: options.appendTo,
					showIcons: options.showIcons,
					hasInitialValue: options.hasInitialValue,
					keepTextAfterSelect: options.keepTextAfterSelect,
					hideDropDownWhenNotEnoughLetters: options.hideDropDownWhenNotEnoughLetters,
					customCloseButton: closeButton,
					isEditFavoritesView: options.isEditFavoritesView,
					hasCategories: options.hasCategories,
					itemImageClassProperty: options.itemImageClassProperty,
					itemImageClassPrefix: options.itemImageClassPrefix,
					matchFromBeginning: options.matchFromBeginning,
					renderInstruments: options.renderInstruments,
					noResultText: options.noResultText,
					searchResultPostBoxTopic: options.searchResultPostBoxTopic,
					minLength: minLength,
					open: function () {
						customized.hide();
						$(options.appendTo).show();
					},
					select: function (event, ui) {
						ko.postbox.publish("search-interaction", { Instrument: { id: ui.item.id } });

						if (options.hideDropDownAfterSelect) {
							$(options.appendTo).hide();
						}
					},
					close: function () {
						customized.show();
					},
					search: function (event, ui) {
						ko.postbox.publish("search", { Characters: event.target.value });
					},
				});
			}

			switch (domElement) {
				case "select":
					$(element).fxautocomplete({
						source: options.source,
						selected: options.selected,
						appendTo: options.appendTo,
						contentMaxHeight: options.contentMaxHeight,
						hasCategories: options.hasCategories,
						itemImageClassProperty: options.itemImageClassProperty,
						itemImageClassPrefix: options.itemImageClassPrefix,
						renderInstruments: options.renderInstruments,
						noResultText: options.noResultText,
						matchFromBeginning: options.matchFromBeginning,
						select: function (event, ui) {
							ko.postbox.publish("deal-slip-search-interaction", { Instrument: { id: ui.item.id } });
							if (selectPostBoxTopic) {
								ko.postbox.publish(selectPostBoxTopic, ui.item.id);
							}
						},
						search: function (event, ui) {
							ko.postbox.publish("deal-slip-search", { Characters: event.target.value });

							adjustListHeight();
						},
						open: function () {
							$(".ui-autocomplete").off("menufocus hover mouseover mouseenter");
							$predefinedOptionsList.hide();

							if (searchPostBoxTopic) {
								ko.postbox.publish(searchPostBoxTopic);
							}
						},
						close: function (event, ui) {
							$predefinedOptionsList.show();

							if (searchPostBoxTopic) {
								ko.postbox.publish(searchPostBoxTopic);
							}
						},
						minLength: minLength,
					});

					// close when clicking elsewhere of the autocompletewrapper
					$autocompleteWrapper.uniqueId();

					$(document).on("click." + $autocompleteWrapper.attr("id"), function (event) {
						if (
							!$(event.target).closest($autocompleteWrapper).length &&
							!$(event.target).is($autocompleteWrapper) &&
							!$(event.target).is($(options.triggerFrom)) &&
							!$(event.target).is($(options.triggerFrom).find("span")) &&
							$autocompleteWrapper.is(":visible")
						) {
							$autocompleteWrapper.hide();
							$(options.triggerFrom).toggleClass("focus");
						}
					});

					$(options.triggerFrom)
						.on("mousedown", function (e) {
							e.preventDefault();

							$autocompleteWrapper.toggle();

							if (minLength === 0) {
								$(element).fxautocomplete("instance").search("");
							}

							$(options.triggerFrom).triggerHandler("focus");
							$(options.triggerFrom).toggleClass("focus");
						})
						.on("focus", function () {
							adjustListHeight();
							adjustPosition();

							if (searchPostBoxTopic) {
								ko.postbox.publish(searchPostBoxTopic);
							}
						});

					break;

				case "input":
					$(element).fxautocomplete({
						source: options.source,
						selected: options.selected,
						appendTo: options.appendTo,
						contentMaxHeight: options.contentMaxHeight,
						hasCategories: options.hasCategories,
						itemImageClassProperty: options.itemImageClassProperty,
						itemImageClassPrefix: options.itemImageClassPrefix,
						renderInstruments: options.renderInstruments,
						noResultText: options.noResultText,
						matchFromBeginning: options.matchFromBeginning,
						minLength: options.minLength,
						select: function (event, ui) {
							ko.postbox.publish("search-interaction", { Instrument: { id: ui.item.id } });
						},
						close: function (event, ui) {
							$(options.appendTo).hide();
						},
						search: function (event, ui) {
							$(options.appendTo).show();
							resetTopPosition();
							ko.postbox.publish("search", { Characters: event.target.value });
						},
						open: function () {
							if (searchPostBoxTopic) {
								ko.postbox.publish(searchPostBoxTopic);
							}
						},
					});

					break;

				case "input.mobile":
					buildForMobile();

					if (typeof options.source === "function") {
						sourceSubscriber = options.source.subscribe(function () {
							//rebuild for customize quotes, the ko binding is done faster than the VM
							//updates the source of the autocomplete
							$(element).fxautocomplete("destroy");
							buildForMobile();
						});
					}

					break;

				default:
					$(element).fxautocomplete({
						source: options.source,
						selected: options.selected,
					});

					break;
			}

			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				$(document).off("click." + $autocompleteWrapper.attr("id"));
				if (typeof $(element).fxautocomplete("instance") !== "undefined") {
					$(element).fxautocomplete("destroy");
				}

				if (selectedSubscriber) {
					selectedSubscriber.dispose();
				}

				if (sourceSubscriber) {
					sourceSubscriber.dispose();
				}
			});
		},
	};
});
