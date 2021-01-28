define([
	"require",
	"jquery",
	"vendor/jquery-ui",
	"knockout",
	"handlers/general",
	"modules/FavoriteInstrumentsManager",
	"modules/InstrumentsSearchModule",
	"initdatamanagers/InstrumentsManager",
	"vendor/latinize",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		$ = require("jquery"),
		favoriteInstrumentsManager = require("modules/FavoriteInstrumentsManager"),
		instrumentsSearchModule = require("modules/InstrumentsSearchModule"),
		latinize = require("vendor/latinize"),
		InstrumentsManager = require("initdatamanagers/InstrumentsManager");

	var fxautocomplete = $.widget("fx.fxautocomplete", $.ui.autocomplete, {
		_create: function () {
			var sourceArray = this.options.source;
			this.selectedObservable = this.options.selected;
			this.hideDelay = this.options.hideDelay || 0;
			this.customCloseButton = this.options.customCloseButton || false;
			this.contentMaxHeight = this.options.contentMaxHeight || -1;
			this.showIcons = this.options.showIcons || false;
			this.isEditFavoritesView = this.options.isEditFavoritesView;
			this.searchResultPostBoxTopic = this.options.searchResultPostBoxTopic;
			this.noResultMatch = {
				category: "",
				value: this.options.noResultText || "",
				id: -1,
			};
			this.hasCategories = !!this.options.hasCategories;
			this.itemImageClassProperty = this.options.itemImageClassProperty || false;
			this.itemImageClassPrefix = this.options.itemImageClassPrefix || "";
			this.expression = this.options.matchFromBeginning ? "^" : "";
			this.renderInstruments = !!this.options.renderInstruments;

			if (this.renderInstruments) {
				this.hasCategories = false;
				this.showIcons = true;
			}

			var sourceFn = function (request, response) {
				var not_latized = $.ui.autocomplete.escapeRegex(request.term),
					latinized = $.ui.autocomplete.escapeRegex(latinize(request.term)),
					matcher = new RegExp(this.expression + "(" + not_latized + "|" + latinized + ")", "i");

				var matches = ko.toJS(sourceArray).filter(function (item) {
					var found = false;
					if (general.isStringType(item.fullText)) {
						found = matcher.test(item.fullText);
					}

					if (general.isStringType(item.text)) {
						found = found || matcher.test(item.text);
					}

					return found;
				});

				if (!matches.length) {
					matches.push(this.noResultMatch);
				}

				response(matches);
			};

			var instrumentsSearch = function (request, response) {
				var matches = this.instrumentsSearchInstance.typingSearch(request.term);

				if (!matches.length) {
					matches.push(this.noResultMatch);
				}

				response(matches);
			};

			if (this.renderInstruments) {
				this.instrumentsSearchInstance = new instrumentsSearchModule(sourceArray);
				this._setOption("source", instrumentsSearch);
			} else {
				this._setOption("source", sourceFn);
			}

			this._setOption("focus", function (event) {
				event.preventDefault();
			});

			this._super();
			this.registerEvents();

			if (this.options.hasInitialValue && this.selectedObservable()) {
				$(this.element).val(this.selectedObservable().value);
			}
		},

		_destroy: function () {
			if (this.instrumentsSearchInstance) {
				this.instrumentsSearchInstance.dispose();
				this.instrumentsSearchInstance = null;
			}
		},

		_suggest: function (items) {
			var ul = this.menu.element.empty();
			this._renderMenu(ul, items);
			this.isNewMenu = true;
			this.menu.refresh();

			$(ul).css("top", 0);

			ul.show().removeClass("custom-autocomplete-hidden").addClass("custom-autocomplete-visible");

			this._resizeMenu();

			ul.position($.extend({ of: this.element }, this.options.position));

			if (this.options.autoFocus) {
				this.menu.next();
			}

			if (this.contentMaxHeight > 0) {
				if ($(ul).height() < this.contentMaxHeight) {
					$(this.options.appendTo).height($(ul).height());
				} else {
					$(this.options.appendTo).height(this.contentMaxHeight);
				}
			}

			$(ul).animate({ scrollTop: 0 }, 0);
		},

		_close: function (event) {
			var ctx = this;

			if (ctx.menu.element.is(":visible")) {
				//ignore efix custom close if customCloseButton exists because is trigger on blur
				ctx.menu.element.removeClass("custom-autocomplete-visible").addClass("custom-autocomplete-hidden");

				setTimeout(function () {
					ctx.menu.element.hide();
					ctx.menu.blur();
					ctx.isNewMenu = true;
					ctx._trigger("close", event);

					if (ctx.contentMaxHeight > 0) {
						$(ctx.options.appendTo).height(ctx.contentMaxHeight);
					}
				}, ctx.hideDelay);
			}

			if (this.searchResultPostBoxTopic) {
				ko.postbox.publish(this.searchResultPostBoxTopic, { hasResults: false });
			}
		},

		registerEvents: function () {
			var ctx = this,
				input = $(ctx.element);

			if (ctx.customCloseButton) {
				ctx.customCloseButton.on("click", function () {
					input.val("").trigger("change");
					ctx.menu.element.hide();
					ctx._trigger("close");

					if (this.searchResultPostBoxTopic) {
						ko.postbox.publish(this.searchResultPostBoxTopic, { hasResults: false });
					}
				});
			} else {
				//ignore blur function if customCloseButton exists
				input.on("blur", function () {
					input.val("").trigger("change");
				});
			}

			ctx._on(ctx.menu.element, {
				menuselect: function (event, ui) {
					var selectedItem = ui.item.data("ui-autocomplete-item"),
						iconStar = $(ui.item).find(".icon-star-full");

					if (!this.options.keepTextAfterSelect || selectedItem.id === this.noResultMatch.id) {
						input.val("").trigger("change");
					}

					if (!selectedItem.isGroup) {
						ctx.selectedObservable(selectedItem);
					}

					if (iconStar.length > 0) {
						$(iconStar).toggleClass("favorite");
					}
				},
			});

			ctx._on(ctx.element, {
				keydown: function (event) {
					var keyCode = $.ui.keyCode;
					var activeElement = ctx.menu.active;

					switch (event.keyCode) {
						case keyCode.UP:
							if (
								general.isNullOrUndefined(activeElement) ||
								activeElement.hasClass("autocomplete-group")
							) {
								ctx._keyEvent("previous", event);
							}
							break;

						case keyCode.DOWN:
							if (
								general.isNullOrUndefined(activeElement) ||
								activeElement.hasClass("autocomplete-group")
							) {
								ctx._keyEvent("next", event);
							}
							break;
					}
				},
				keyup: function (event) {
					var keyCode = $.ui.keyCode;

					switch (event.keyCode) {
						case keyCode.BACKSPACE:
						case keyCode.DELETE:
							if (
								ctx.options.hideDropDownWhenNotEnoughLetters &&
								$(ctx.element).val().length < ctx.options.minLength
							) {
								$(ctx.options.appendTo).hide();
							}
							break;
					}
				},
			});
		},

		options: {
			minLength: 2,
		},

		_renderMenu: function (ul, items) {
			var ctx = this;

			if (this.searchResultPostBoxTopic) {
				ko.postbox.publish(this.searchResultPostBoxTopic, { hasResults: true });
			}

			if (ctx.hasCategories) {
				ctx._renderItemsWithCategories(ul, items);
			} else {
				ctx._renderItems(ul, items);
			}
		},

		_renderItems: function (ul, items) {
			var ctx = this;

			$.each(items, function (index, item) {
				ctx._renderItemData(ul, item);
			});
		},

		_renderItemsWithCategories: function (ul, items) {
			var ctx = this;
			var categories = [];

			$.each(items, function (index, item) {
				if (categories.indexOf(item.category) === -1) {
					categories.push(item.category);
				}
			});

			$.each(categories, function (categoryIndex, category) {
				if (!(items.length === 1 && items[0].id === -1)) {
					//no result case
					var categoryItem = {
						label: category,
						isGroup: true,
						category: "",
					};

					ctx._renderItemData(ul, categoryItem);
				}

				$.each(items, function (index, item) {
					if (item.category === category) {
						ctx._renderItemData(ul, item);
					}
				});
			});
		},

		_renderItem: function (ul, item) {
			if (this.renderInstruments) {
				return this._renderInstrumentItem(ul, item);
			} else {
				return this._renderOtherItem(ul, item);
			}
		},

		_renderOtherItem: function (ul, item) {
			var re = new RegExp(this.expression + "(" + $.ui.autocomplete.escapeRegex(this.term) + ")", "gi"),
				template = "<b class='bold'>$1</b>",
				li = $("<li>"),
				label = item.label.replace(re, template);

			if (this.itemImageClassProperty && item[this.itemImageClassProperty]) {
				var classValue = "list-flag " + this.itemImageClassPrefix + item[this.itemImageClassProperty];
				$("<i/>", { class: classValue }).appendTo(li);
			}

			$("<span/>", {
				class: "text-holder",
			})
				.html(label)
				.appendTo(li);

			if (this.selectedObservable() && this.selectedObservable().id === item.id) {
				li = li.addClass("selected");
			}

			return li.appendTo(ul);
		},

		_renderInstrumentItem: function (ul, item) {
			var re = new RegExp("(" + $.ui.autocomplete.escapeRegex(this.term) + ")", "gi"),
				template = "<b class='bold'>$1</b>",
				li = $("<li>"),
				label = item.label.replace(re, template);

			if (!item.isGroup) {
				label =
					"<div class='text-holder instrument-name found-results'>" +
					label +
					'<br /><span class="category-name">' +
					item.category +
					"</span>" +
					"</div>" +
					(this.isEditFavoritesView ? "" : "<div class='text-holder'><span class='tick'></span></div>");
			}

			if (item.isGroup) {
				li.addClass("autocomplete-group");
			}

			if (item.id === -1) {
				li.addClass("noresults");
			}

			if (this.showIcons) {
				var iconWrapper = $("<div>").addClass("instr-wrapper"),
					instrSymbol = $("<div>").addClass("instr-symbol"),
					favorite = $("<span>").addClass("icon-star-full"),
					defaultIcon = $("<span>").addClass("default"),
					baseIcon = $("<i>").addClass("base currency _" + item.baseSymbolId),
					otherIcon = $("<i>").addClass("other currency _" + item.otherSymbolId);

				if (favoriteInstrumentsManager.IsFavoriteInstrument(item.id)) {
					favorite.addClass("favorite");
				}

				if (this.showIcons && !item.isGroup && item.id !== -1) {
					defaultIcon[0].innerText = InstrumentsManager.GetInstrumentFirstChar(item.id);
					label =
						iconWrapper
							.append(
								instrSymbol
									.addClass("instr-" + item.id)
									.append(baseIcon.append(defaultIcon))
									.append(otherIcon)
							)
							.prop("outerHTML") + label;

					if (this.isEditFavoritesView) {
						label += favorite.prop("outerHTML");
					}
				}
			}

			if (this.selectedObservable() && this.selectedObservable().id === item.id && !item.isGroup) {
				li = li.addClass("selected");
			}

			return li.html(label).appendTo(ul);
		},
	});

	return fxautocomplete;
});
