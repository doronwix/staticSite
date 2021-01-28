define('helpers/KoComponentViewModel',["knockout"], function (ko) {
	function KoComponentViewModel() {
		this._settings = {};
		this._disposables = [];
		this.Data = {};
		this._valid = true;
	}

	/**
	 * Creates a computable and adds it to the _disposables array
	 * @param {Function/Object} handler the definition of the computable (same signature as ko.computed | ko.pureComputed)
	 * @param {Object} context The context of the computed (reference for this)
	 * @param {Boolean} isPure Indicates if the returned computable is ko.pureComputed or ko.computed
	 * @returns {ko.computed}
	 */
	KoComponentViewModel.prototype.createComputed = function (
		handler,
		context,
		isPure /* default/undefined is true */
	) {
		var computed,
			config = {
				owner: context || this,
			};

		if (typeof handler === "function") {
			config.read = handler;
		} else if (typeof handler === "object") {
			ko.utils.extend(config, handler);
		} else {
			throw new Error("Argument mismatch, object literal was expected");
		}

		if (isPure === false) {
			computed = ko.computed(config);
		} else {
			// default
			computed = ko.pureComputed(config);
		}

		this._disposables.push(computed);

		return computed;
	};

	/**
	 * Subscribe to a subscriable object, adds its reference to _disposables array
	 * @param {ko.susbscriable} observable
	 * @param {Function} handler
	 * @param {Object} context
	 * @param {String} event
	 * @returns {ko.subscription}
	 */
	KoComponentViewModel.prototype.subscribeTo = function (observable, handler, context, event) {
		var subscriber = observable.subscribe(handler, context || this, event);
		this._disposables.push(subscriber);

		return subscriber;
	};

	/**
	 * Subscribe to a subscriable object, adds its reference to _disposables array and notify
	 * @param {ko.susbscriable} observable
	 * @param {Function} handler
	 * @param {Object} context
	 * @param {String} event
	 * @returns {ko.subscription}
	 */
	KoComponentViewModel.prototype.subscribeAndNotify = function (observable, handler, context, event) {
		var subscriber = this.subscribeTo(observable, handler, context, event);

		observable.notifySubscribers(observable());

		return subscriber;
	};

	/**
	 * Subscribe for previous and current values
	 * @param {} observable
	 * @param {} handler
	 * @returns {}
	 */
	KoComponentViewModel.prototype.subscribeChanged = function (observable, handler) {
		var previousValue,
			subscriberBeforeChange = observable.subscribe(
				function (_previousValue) {
					previousValue = _previousValue;
				},
				null,
				"beforeChange"
			);

		this._disposables.push(subscriberBeforeChange);

		var subscriber = observable.subscribe(function (latestValue) {
			handler(latestValue, previousValue);
		});

		this._disposables.push(subscriber);

		return subscriber;
	};

	/**
	 * Save settings to current instance
	 * @param {Object} customSettings
	 * @param {Object} defaultSettings
	 * @returns {void}
	 */
	KoComponentViewModel.prototype.setSettings = function (customSettings, defaultSettings) {
		var _customSettings = customSettings || {};
		var _defaultSettings = defaultSettings || {};

		ko.utils.extend(this._settings, _defaultSettings);
		ko.utils.extend(this._settings, _customSettings);
	};

	/**
	 * Get settings
	 * @returns {Object}
	 */
	KoComponentViewModel.prototype.getSettings = function () {
		// return a copy of settings object
		return ko.utils.extend({}, this._settings);
	};

	/**
	 * Abstract: Initialize the view model instance
	 *
	 * Usually this method should be overriden
	 * @param {Object} settings
	 * @returns {void}
	 */
	KoComponentViewModel.prototype.init = function (settings) {
		this.setSettings(settings);
	};

	/**
	 * Adds a "disposable" object to _disposables array
	 * @param {Object} disposable
	 * @returns {void}
	 */
	KoComponentViewModel.prototype.addDisposable = function (disposable) {
		if (disposable && typeof disposable.dispose === "function") {
			this._disposables.push(disposable);
		}
	};

	/**
	 * Dispose all disposable objects associated to current instance:
	 * from _disposables array
	 * and disposables members of current instance
	 *
	 * This method can be overriden, in the extended class DO NOT FORGET to call parent.dispose.call(this);
	 * @returns {void}
	 */
	KoComponentViewModel.prototype.dispose = function () {
		var dispose = function (disposable) {
			if (disposable && typeof disposable.dispose === "function") {
				disposable.dispose();
			}
		};

		ko.utils.arrayForEach(this._disposables, function (object) {
			dispose(object);
		});

		this._disposables.length = 0;

		ko.utils.objectForEach(this, function (propName, object) {
			dispose(object);
		});
	};

	return KoComponentViewModel;
});

define('deviceviewmodels/PresetDropdownListViewModel',["require", "knockout", "handlers/general", "helpers/KoComponentViewModel"], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel");

	var PresetDropdownListViewModel = general.extendClass(KoComponentViewModel, function PresetDropdownListViewModel() {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = parent.Data;

		function init(settings) {
			parent.init.call(self, settings);

			setObservables();
			setInitialData(settings);
		}

		function setInitialData(presetData) {
			data.category = presetData.data();
			data.selectedPreset = presetData.selected();
			data.key = presetData.data().Key.toLowerCase();
		}

		function setObservables() {
			data.isVisible = ko.observable(false);
		}

		function toggleVisibility() {
			data.isVisible(!data.isVisible());
		}

		function selectPreset(groupedPreset) {
			data.isVisible(false);
			groupedPreset.Select(groupedPreset.Id);
			ko.postbox.publish("sub-tab-click");
		}

		function hide() {
			data.isVisible(false);
		}

		function dispose() {
			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			ToggleVisibility: toggleVisibility,
			SelectPreset: selectPreset,
			Hide: hide,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new PresetDropdownListViewModel();

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

define('managers/SpinnerManager',[
	"require",
	"knockout",
	"enums/enums",
	"helpers/KoComponentViewModel",
	"handlers/general",
], function SpinnerBoxDef(require) {
	var ko = require("knockout"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		general = require("handlers/general");

	var SpinnerBox = general.extendClass(KoComponentViewModel, function spinnerBoxViewModel() {
		return {
			isSpinnerVisible: ko.observable().subscribeTo(ePostboxTopic.SetSpinnerVisibility),
		};
	});

	var createViewModel = function () {
		var viewModel = new SpinnerBox();

		viewModel.init();

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

define(
    'modules/InstrumentsSearchModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'vendor/latinize'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            latinize = require('vendor/latinize'),
            binaryEnum = {
                bx10000000: parseInt('10000000', 2),
                bx01000000: parseInt('01000000', 2),
                bx00100000: parseInt('00100000', 2),
                bx00010000: parseInt('00010000', 2),

                bx00001000: parseInt('00001000', 2),
                bx00000100: parseInt('00000100', 2),
                bx00000010: parseInt('00000010', 2),
                bx00000001: parseInt('00000001', 2)
            },
            scoresConfig = [
                {
                    field: 'instrumentName',
                    startWithScore: binaryEnum.bx10000000,
                    middleOfScore: binaryEnum.bx00001000
                },
                {
                    field: 'symbolName',
                    startWithScore: binaryEnum.bx01000000,
                    middleOfScore: binaryEnum.bx00000100
                }, {
                    field: 'fullName',
                    startWithScore: binaryEnum.bx00100000,
                    middleOfScore: binaryEnum.bx00000010
                }, {
                    field: 'fullText',
                    startWithScore: binaryEnum.bx00010000,
                    middleOfScore: binaryEnum.bx00000001
                }
            ],
            charactersToEscapeRegex = /[-[\]{}()*+?.,\\/^$|#\s]/g;

        function InstrumentsSearchModuleClass(instruments) {
            var allInstruments = instruments || ko.observableArray([]),
                prevSearchString = "",
                searchResult = ko.observableArray();

            function getInstrumentIndex(instrument) {
                var index = allInstruments().findIndex(function (item) {
                    return item.id === instrument.id;
                });

                return index;
            }

            function buildScores(arrayToSearchFor, searchString) {
                var latinizedSearchString = latinize(searchString)
                    .replace(charactersToEscapeRegex, '\\$&');

                var matchRegex = new RegExp('(' + latinizedSearchString + ')', 'im');

                var scores = arrayToSearchFor.map(function (instrument) {
                    var index = getInstrumentIndex(instrument),
                        score = 0;

                    scoresConfig.forEach(function (scoreConfig) {
                        if (!instrument[scoreConfig.field]) {
                            return;
                        }

                        var match = latinize(instrument[scoreConfig.field]).match(matchRegex);

                        if (!general.isNullOrUndefined(match)) {
                            if (match.index === 0) {
                                score = scoreConfig.startWithScore | score;
                            }

                            if (match.index > 0) {
                                score = scoreConfig.middleOfScore | score;
                            }
                        }
                    });

                    return {
                        idx: index,
                        ccyOrder: instrument.ccyOrder,
                        score: score
                    };
                });

                return scores;
            }

            function getResultsFromScores(scores) {
                return scores.map(function (element) {
                    return allInstruments()[element.idx];
                });
            }

            function searchInternal(arrayToSearchFor, searchString) {
                var scores = buildScores(arrayToSearchFor, searchString);

                scores = scores.filter(function (element) {
                    return element.score && element.score > 0;
                });

                scores.sort(function (elementA, elementB) {
                    var dif = elementB.score - elementA.score;

                    if (dif === 0) {
                        dif = elementA.ccyOrder - elementB.ccyOrder;
                    }

                    return dif;
                });

                var results = getResultsFromScores(scores);

                searchResult(results);
                prevSearchString = searchString;

                return results;
            }

            function canReusePreviousSearch(searchString) {
                return ("" === prevSearchString) || (0 !== searchString.toLowerCase().indexOf(prevSearchString.toLowerCase())) || (0 >= searchResult().length);
            }

            function typingSearch(searchString) {
                if (searchString.term) {
                    searchString = searchString.term;
                }

                if (canReusePreviousSearch(searchString)) {
                    return searchInternal(allInstruments(), searchString);
                } else {
                    return searchInternal(searchResult(), searchString);
                }
            }

            function search(searchString) {
                return searchInternal(allInstruments(), searchString);
            }

            function dispose() {
                allInstruments = null;
                searchResult.removeAll();
                prevSearchString = "";
            }

            return {
                dispose: dispose,
                search: search,
                typingSearch: typingSearch,
                searchResult: searchResult
            };
        }

        return InstrumentsSearchModuleClass;
    }
);
define('widgets/AutocompleteWidget',[
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

define('helpers/CustomKOBindings/AutocompleteBinding',[
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

define('viewmodels/InstrumentPriceAlertViewModel',[
	"require",
	"handlers/general",
	"cachemanagers/activelimitsmanager",
	"helpers/KoComponentViewModel",
	"knockout",
], function (require) {
	var activeLimitsManager = require("cachemanagers/activelimitsmanager"),
		ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel");

	var InstrumentPriceAlertViewModel = general.extendClass(KoComponentViewModel, function (params) {
		var self = this,
			parent = this.parent,
			Data = this.Data;

		if (!params.instrumentId) {
			throw new Error("Missing instrument id paramerter");
		}

		Data.isOn = params.isOnObservable || ko.observable();
		Data.isOn(activeLimitsManager.HasPriceAlerts(ko.unwrap(params.instrumentId)));

		function onChange() {
			Data.isOn(activeLimitsManager.HasPriceAlerts(ko.unwrap(params.instrumentId)));
		}

		activeLimitsManager.OnChange.Add(onChange);
		if (ko.isObservable(params.instrumentId)) {
			params.instrumentId.subscribe(function () {
				onChange();
			});
		}

		function dispose() {
			parent.dispose.call(self);
			activeLimitsManager.OnChange.Remove(onChange);
		}

		function onPriceAlertClick() {
			if (params.hasOwnProperty("onPriceAlertClick") && general.isFunctionType(params.onPriceAlertClick)) {
				params.onPriceAlertClick({ instrumentId: params.instrumentId });
			}
		}

		return {
			dispose: dispose,
			Data: Data,
			OnPriceAlertClick: onPriceAlertClick,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new InstrumentPriceAlertViewModel(params);
		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});




define(
    'viewmodels/accounthub/AccountHubCardViewModel',[
        "require",
        "knockout",
        "handlers/general",
        "helpers/KoComponentViewModel",
        "StateObject!AccountHub",
        "StateObject!userFlow",
        "managers/viewsmanager",
        "modules/permissionsmodule",
        "devicemanagers/AlertsManager",
        "initdatamanagers/Customer",
        "dataaccess/dalCommon",
        "managers/CustomerProfileManager",
        "devicemanagers/StatesManager",
        "StateObject!Setting",
        "Dictionary",
    ],
    function (require) {
        var KoComponentViewModel = require("helpers/KoComponentViewModel"),
            ko = require("knockout"),
            general = require("handlers/general"),
            stateObjectAccountHub = require("StateObject!AccountHub"),
            ViewsManager = require("managers/viewsmanager"),
            permissionsModule = require("modules/permissionsmodule"),
            AlertsManager = require("devicemanagers/AlertsManager"),
            Customer = require("initdatamanagers/Customer"),
            dalCommon = require("dataaccess/dalCommon"),
            customerProfileManager = require("managers/CustomerProfileManager"),
            statesManager = require("devicemanagers/StatesManager"),
            settingStateObject = require("StateObject!Setting"),
            stateObjectUserFlow = require("StateObject!userFlow"),
            dictionary = require("Dictionary");

        var AccountHubCardViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                Data = this.Data,
                stateObjectAccountHubUnsubscribe,
                stateObjectAccountHubUnsubscribeDisplay,
                visibilitySet = 0,
                stateObjectUserFlowUnsubscribe;

            function updateVisibilityOnLogin(userStatus) {
                if (visibilitySet) {
                    return;
                }

                visibilitySet = 1;

                if (Customer.prop.isDemo === true) {
                    return;
                }

                if (userStatus !== eUserStatus.Active) {
                    stateObjectAccountHub.update("visible", true);
                }
                else {
                    var profileCustomer = customerProfileManager.ProfileCustomer();

                    if (!profileCustomer.activeFirstLogin) {
                        profileCustomer.activeFirstLogin = 1;
                        stateObjectAccountHub.update("visible", true);
                        customerProfileManager.ProfileCustomer(profileCustomer);
                    }
                    else {
                        if (profileCustomer.activeFirstLogin === 1) {
                            profileCustomer.activeFirstLogin = -1;
                            customerProfileManager.ProfileCustomer(profileCustomer);
                        }
                    }
                }

            }

            function tryUpdateVisibilityOnLogin(userStatus) {
                if (userStatus !== eUserStatus.NA) {
                    updateVisibilityOnLogin(userStatus);
                }
            }

            function init() {
                if (!settingStateObject.get("AccountHubSetting")) {
                    settingStateObject.set("AccountHubSetting", null);
                }

                setObservables();
                setStates();

                var userFlow = stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged);

                setSubscribers();

                tryUpdateVisibilityOnLogin(userFlow ? userFlow.userStatus : eUserStatus.NA);
            }

            function setObservables() {
                Data.visible = ko.observable(false);
                Data.none = ko.observable(false);
            }

            function setStates() {
                stateObjectAccountHub.set('visible', false);
                stateObjectAccountHub.set('displayNone', true);
            }

            function setSubscribers() {
                stateObjectAccountHubUnsubscribe = stateObjectAccountHub.subscribe("visible", function (value) {
                    Data.visible(value);
                });

                stateObjectAccountHubUnsubscribeDisplay = stateObjectAccountHub.subscribe("displayNone", function (value) {
                    Data.none(value);
                });

                stateObjectUserFlowUnsubscribe = stateObjectUserFlow.subscribe(
                    eStateObjectTopics.UserFlowChanged,
                    function (newModel) {
                        tryUpdateVisibilityOnLogin(newModel.userStatus);
                    }
                );
            }

            function switchView(view, args) {
                ViewsManager.RedirectToForm(view, args);
                settingStateObject.update("AccountHubSetting", args);
                hideAccountHub();
            }

            function register() {
                permissionsModule.RegisterLeadType();
            }

            function hideAccountHub() {
                Data.visible(false);
                stateObjectAccountHub.update("visible", false);
            }

            function logOut() {
                hideAccountHub();

                if (!permissionsModule.CheckPermissions("commonLogout")) {
                    return;
                }

                AlertsManager.UpdateAlert(AlertTypes.ExitAlert);
                AlertsManager.PopAlert(AlertTypes.ExitAlert);
            }

            function switchFromDemoToReal() {
                if (Customer.prop.isDemo) {
                    dalCommon.SwitchAccount();
                }
            }

            function switchFromRealToDemo() {
                if (!Customer.prop.isDemo) {
                    dalCommon.SwitchAccount();
                }
            }

            function close() {
                ko.postbox.publish("hub-menu-close");
                stateObjectAccountHub.update("visible", false);
            }

            function dispose() {
                if (stateObjectAccountHubUnsubscribe) {
                    stateObjectAccountHubUnsubscribe();
                }

                if (stateObjectUserFlowUnsubscribe) {
                    stateObjectUserFlowUnsubscribe();
                }

                if (stateObjectAccountHubUnsubscribeDisplay) {
                    stateObjectAccountHubUnsubscribeDisplay();
                }

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            function hasDemoBlock() {
                return Customer.prop.hasActiveDemo || Customer.prop.isDemo;
            }

            function showLogoutButton() {
                return permissionsModule.CheckActionAllowed("logout");
            }

            function changePassword() {
                if (permissionsModule.CheckPermissions("changePassword")) {
                    switchView(eForms.Settings, eViewTypes.vChangePassword);
                }
                else {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, dictionary.GetItem("GenericAlert"), dictionary.GetItem("Forbidden"), null);
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            }

            return {
                init: init,
                dispose: dispose,
                Data: Data,
                Close: close,
                SwitchView: switchView,
                Logout: logOut,
                Register: register,
                permissionsModule: permissionsModule,
                switchFromDemoToReal: switchFromDemoToReal,
                switchFromRealToDemo: switchFromRealToDemo,
                IsDemo: statesManager.States.IsDemo,
                hasDemoBlock: hasDemoBlock,
                showLogoutButton: showLogoutButton,
                ChangePassword: changePassword
            };
        });

        function createViewModel(params) {
            var viewModel = new AccountHubCardViewModel(params || {});
            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel,
            },
        };
    }
);


/* globals eUserStatus */
define('viewmodels/accounthub/AccountHeaderViewModel',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"StateObject!userFlow",
	"StateObject!AccountHub",
	"StateObject!HelpcHub",
	"StateObject!IM",
	"modules/permissionsmodule",
	"vendor/knockout-postbox",
	"enums/enums",
], function AccountHeaderDef(require) {
	var KoComponentViewModel = require("helpers/KoComponentViewModel"),
		ko = require("knockout"),
		general = require("handlers/general"),
		Customer = require("initdatamanagers/Customer"),
		stateObjectUserFlow = require("StateObject!userFlow"),
		stateObjectAccountHub = require("StateObject!AccountHub"),
		stateObjectHelpc = require("StateObject!HelpcHub"),
		stateObjectIM = require("StateObject!IM"),
		permissionsModule = require("modules/permissionsmodule");

	var AccountHeaderViewModel = general.extendClass(KoComponentViewModel, function AccountHeaderClass(params) {
		var self = this,
			parent = this.parent,
			data = this.Data, // inherited from KoComponentViewModel
			stateObjectSubscriptions = [],
			accountButtonSelected = ko.observable(false),
			maxNameLength = 20;

		function init() {
			setObservables();
			data.onClose = params.onClose;

			updateFromStateObject(stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged));

			data.userName = calculateName();

			if (!stateObjectIM.get("message")) {
				stateObjectIM.set("message", "empty");
			}

			data.MessageCSS = ko.observable(stateObjectIM.get("message"));

			if (!stateObjectAccountHub.get("visible")) {
				stateObjectAccountHub.set("visible", false);
			}

			accountButtonSelected(stateObjectAccountHub.get("visible"));

			stateObjectSubscriptions.push(
				{
					unsubscribe: stateObjectIM.subscribe("message", function (value) {
						data.MessageCSS(value);
					}),
				},
				{
					unsubscribe: stateObjectAccountHub.subscribe("visible", function (value) {
						accountButtonSelected(value);
					}),
				},
				{
					unsubscribe: stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
						updateFromStateObject(model);
					}),
				},
				{
					unsubscribe: stateObjectHelpc.subscribe("visible", function (value) {
						if (value === true) {
							toggleAccountHub(value);
						}
					}),
				}
			);
		}

		function setObservables() {
			data.generalStatusColor = ko.observable("");
			data.userStatusName = ko.observable(general.getKeyByValue(eUserStatus, eUserStatus.Active));
			data.generalStatusName = ko.observable("");
		}

		function calculateName() {
			if (!Customer.prop.firstName && !Customer.prop.lastName) return "";

			var firstName = Customer.prop.firstName ? Customer.prop.firstName : "",
				lastName = Customer.prop.lastName ? Customer.prop.lastName.charAt(0) : "",
				fullName = (firstName + " " + lastName + ".").trim();

			if (fullName.length > maxNameLength) {
				fullName = firstName;

				if (fullName.length > 0) {
					fullName = "";

					if (firstName.length > maxNameLength) {
						fullName = firstName.substr(0, maxNameLength).trim() + "...";
					} else {
						var names = firstName.split(" ");

						for (var i = 0; i < names.length; i++) {
							if ((fullName + names[i]).length <= maxNameLength) fullName += names[i] + " ";
						}
					}
				}
			}

			fullName = fullName.trim();

			return fullName;
		}

		function dispose() {
			while (stateObjectSubscriptions.length > 0) {
				stateObjectSubscriptions.pop().unsubscribe();
			}

			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		function toggleAccountHub(closeIfOpen) {
			var hubVisible = stateObjectAccountHub.get("visible");

			if (closeIfOpen === true) {
				if (hubVisible) {
					stateObjectAccountHub.update("visible", false);
					ko.postbox.publish("hub-menu-close");
				}
			} else {
				stateObjectAccountHub.update("visible", !hubVisible);

				if (!hubVisible) {
					ko.postbox.publish("hub-menu-open");
					stateObjectHelpc.update("visible", false);
				} else {
					ko.postbox.publish("hub-menu-close");
				}
			}
		}

		function updateFromStateObject(model) {
			if (!model) {
				return;
			}

      var userStatus = Customer.prop.isDemo ? eUserStatus.Active : model.userStatus;
      data.userStatusName(general.getKeyByValue(eUserStatus, userStatus));


			data.generalStatusName("flow_" + general.getKeyByValue(eUserStatus, model.userStatus));

			switch (model.userStatus) {
				case eUserStatus.ReadyToTrade:
				case eUserStatus.ActiveLimited:
					data.generalStatusColor("yellow");
					break;

				case eUserStatus.Active:
					data.generalStatusColor("green");
					break;

				case eUserStatus.Locked:
				case eUserStatus.NotActivated:
				case eUserStatus.Restricted:
					data.generalStatusColor("red");
					break;

				default:
					data.generalStatusColor("blue");
					break;
			}
		}

		function generalStatusClick() {
			ko.postbox.publish("action-source", "StatusRow");
			$viewModelsManager.VManager.SwitchViewVisible(eForms.UserFlowMap);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			toggleAccountHub: toggleAccountHub,
			AccountButtonSelected: accountButtonSelected,
			Customer: Customer,
			permissionsModule: permissionsModule,
			generalStatusClick: generalStatusClick,
		};
	});

	function createViewModel(params) {
		var viewModel = new AccountHeaderViewModel(params || {});

		viewModel.init();

		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

define('viewmodels/WalletModuleBase', [
    'require',
    'knockout',
    'handlers/general',
    'viewmodels/ViewModelBase',
    'configuration/initconfiguration',
    'initdatamanagers/Customer',
    'managers/CustomerProfileManager',
    'cachemanagers/ClientStateHolderManager',
    'cachemanagers/PortfolioStaticManager',
    'viewmodels/dialogs/DialogViewModel',
    'Dictionary',
    'StateObject!DealerParams',
    'cachemanagers/bonusmanager'
], function (require) {
    var ko = require('knockout'),
        general = require('handlers/general'),
        DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
        walletSettings = require('configuration/initconfiguration').WalletConfiguration,
        customer = require('initdatamanagers/Customer'),
        customerProfileManager = require('managers/CustomerProfileManager'),
        csHolderManager = require('cachemanagers/ClientStateHolderManager'),
        portfolioManager = require('cachemanagers/PortfolioStaticManager'),
        Dictionary = require('Dictionary'),
        bonusManager = require('cachemanagers/bonusmanager');

    function WalletModule() {
        var observableCustomerObject = {},
            viewProperties = {},
            openInDialogDelegate = new TDelegate();

        function init() {
            setObservableViewProperties();

            setObservableCustomerObject();

            setComputables();

            if (DialogViewModel) {
                openInDialogDelegate.Add(function (name, options, eView, args) {
                    DialogViewModel.open(name, options, eView, args);
                });
            }

            registerToDispatcher();

            updateObservableObject();
        }

        //-------------------------------------------------------

        function updateObservableObject() {
            onClientStateChange();
            onClientPortfolioStateChange();
        }

        //-------------------------------------------------------

        function dispose() {
            unregisterFromDispatcher();
        }

        //-------------------------------------------------------

        function registerToDispatcher() {
            csHolderManager.OnChange.Add(onClientStateChange);
            portfolioManager.OnChange.Add(onClientPortfolioStateChange);
        }

        //-------------------------------------------------------

        function unregisterFromDispatcher() {
            csHolderManager.OnChange.Remove(onClientStateChange);
            portfolioManager.OnChange.Remove(onClientPortfolioStateChange);
        }

        //-------------------------------------------------------

        function setObservableCustomerObject() {
            observableCustomerObject.isMaintenanceMargin =
                customer.prop.maintenanceMarginPercentage > 0;
            observableCustomerObject.userName = customer.prop.userName;
            observableCustomerObject.accountNumber = customer.prop.accountNumber;

            var csHolder = csHolderManager.CSHolder;
            observableCustomerObject.maintenanceMargin = toObservable(
                csHolder.maintenanceMargin,
                function () {
                    return observableCustomerObject.isMaintenanceMargin;
                }
            );
            observableCustomerObject.openPLSign = ko.observable();

            observableCustomerObject.equity = toObservable(
                csHolder.equity,
                function () {
                    return true;
                }
            );
            observableCustomerObject.accountBalance = toObservable(
                csHolder.accountBalance,
                function () {
                    return true;
                }
            );
            observableCustomerObject.openPL = toObservable(
                csHolder.openPL,
                function () {
                    return true;
                }
            );

            observableCustomerObject.netExposure = toObservable(
                csHolder.netExposure,
                function () {
                    return true;
                }
            );
            observableCustomerObject.exposureCoverage = toObservable(
                csHolder.exposureCoverage,
                function () {
                    return true;
                }
            );
            observableCustomerObject.totalEquity = ko.observable(
                csHolder.totalEquity
            );

            observableCustomerObject.isValidExposureCoverage = ko.observable(
                isExposureCoverageValid(csHolder.exposureCoverage)
            );

            observableCustomerObject.usedMargin = toObservable(
                csHolder.usedMargin,
                function () {
                    return (
                        viewProperties.isAdvancedView() ||
                        (!general.isNullOrUndefined(walletSettings) &&
                            walletSettings.isVisibleUsedMargin)
                    );
                }
            );

            observableCustomerObject.availableMargin = toObservable(
                csHolder.availableMargin,
                function () {
                    return true;
                }
            );
            observableCustomerObject.availableMarginNoComma = ko.observable();

            observableCustomerObject.marginUtilizationPercentage = toObservable(
                csHolder.marginUtilizationPercentage,
                function () {
                    return viewProperties.isAdvancedView();
                }
            );
            observableCustomerObject.marginUtilizationStatus = ko.observable(
                csHolder.marginUtilizationStatus
            );

            var portfolio = portfolioManager.Portfolio;
            observableCustomerObject.maxExposure = toObservable(
                portfolio.maxExposure,
                function () {
                    return viewProperties.isAdvancedView();
                }
            );
            observableCustomerObject.securities = toObservable(
                portfolio.securities,
                function (observed) {
                    return general.toNumeric(observed) > 0 && viewProperties.isAdvancedView();
                }
            );
            observableCustomerObject.tradingBonus = toObservable(
                portfolio.tradingBonus,
                function (observed) {
                    return general.toNumeric(observed) > 0;
                }
            );
            observableCustomerObject.pendingBonus = toObservable(
                portfolio.pendingBonus,
                function (observed) {
                    return general.toNumeric(observed) > 0;
                }
            );
            observableCustomerObject.pendingWithdrawals = toObservable(
                portfolio.pendingWithdrawals,
                function (observed) {
                    return general.toNumeric(observed) > 0;
                }
            );

            // BONUS
            observableCustomerObject.pendingBonusType = ko.observable(
                portfolio.pendingBonusType
            );

            observableCustomerObject.showCashBack = showCashBack;

            // exposure
            observableCustomerObject.showExposureSummary = showExposureSummary;
            observableCustomerObject.showExposureSummary.disabled = ko.observable(
                false
            );

            observableCustomerObject.showDetailedMarginStatus = showDetailedMarginStatus;

            observableCustomerObject.isAdvancedView = viewProperties.isAdvancedView;

            observableCustomerObject.showFinancialSummaryDetails = ko.observable(
                $statesManager.States.IsActive() ||
                customer.prop.customerType === eCustomerType.TradingBonus
            );
        }

        function isExposureCoverageValid(exposureCoverage) {
            if (
                !general.isNullOrUndefined(customer) &&
                !general.isNullOrUndefined(customer.prop) &&
                !general.isNullOrUndefined(customer.prop.minPctEQXP) &&
                !general.isNullOrUndefined(exposureCoverage)
            ) {
                return (
                    general.toNumeric(exposureCoverage) > general.toNumeric(customer.prop.minPctEQXP)
                );
            }
            return true;
        }

        //-------------------------------------------------------
        function setComputables() {
            observableCustomerObject.bonusAmount = ko.computed(function () {
                return bonusManager.bonus().amountBase
                    ? bonusManager.bonus().amountBase
                    : 0;
            });
        }

        //-------------------------------------------------------
        function toObservable(value, visibilityFunc) {
            var valueObs = ko.observable(value);
            return {
                value: valueObs,
                toNumeric: ko.computed(function () {
                    return general.toNumeric(valueObs());
                }),
                visibility: ko
                    .computed(function () {
                        return visibilityFunc(valueObs());
                    })
                    .extend({ notify: 'always' }),
            };
        }

        //-------------------------------------------------------

        function setObservableViewProperties() {
            viewProperties.isAdvancedView = ko.observable();
            viewProperties.setAdvancedView = setAdvancedView;
        }

        //-------------------------------------------------------

        function setAdvancedView(newValue) {
            viewProperties.isAdvancedView(newValue);
            var profileCustomer = customerProfileManager.ProfileCustomer();
            profileCustomer.advancedWalletView = newValue ? 1 : 0;
            customerProfileManager.ProfileCustomer(profileCustomer);
        }

        //-------------------------------------------------------

        function onClientStateChange() {
            var csHolder = csHolderManager.CSHolder;
            observableCustomerObject.maintenanceMargin.value(
                csHolder.maintenanceMargin
            );

            observableCustomerObject.openPLSign(csHolder.openPL.sign());
            observableCustomerObject.openPL.value(csHolder.openPL);
            observableCustomerObject.equity.value(csHolder.equity);
            observableCustomerObject.accountBalance.value(csHolder.accountBalance);
            observableCustomerObject.netExposure.value(csHolder.netExposure);
            observableCustomerObject.exposureCoverage.value(
                csHolder.exposureCoverage
            );
            observableCustomerObject.totalEquity(csHolder.totalEquity);

            observableCustomerObject.isValidExposureCoverage(
                isExposureCoverageValid(csHolder.exposureCoverage)
            );

            observableCustomerObject.usedMargin.value(csHolder.usedMargin);
            observableCustomerObject.availableMargin.value(csHolder.availableMargin);
            observableCustomerObject.availableMarginNoComma(
                csHolder.availableMargin.sign()
            );

            observableCustomerObject.marginUtilizationPercentage.value(
                csHolder.marginUtilizationPercentage
            );
            observableCustomerObject.marginUtilizationStatus(
                csHolder.marginUtilizationStatus
            );

            observableCustomerObject.showFinancialSummaryDetails(
                $statesManager.States.IsActive() ||
                customer.prop.customerType === eCustomerType.TradingBonus
            );
        }

        //-------------------------------------------------------

        function canCloseDialog() {
            return (
                observableCustomerObject.pendingBonusType() !==
                ePendingBonusType.cashBack &&
                !general.isNullOrUndefined(walletSettings) &&
                !walletSettings.supressDialogs &&
                !general.isNullOrUndefined(DialogViewModel) &&
                DialogViewModel.isOpen() &&
                DialogViewModel.getCurrentView() === eViewTypes.vCashBack
            );
        }

        function onClientPortfolioStateChange() {
            var portfolio = portfolioManager.Portfolio;
            observableCustomerObject.maxExposure.value(portfolio.maxExposure);
            observableCustomerObject.securities.value(portfolio.securities);
            observableCustomerObject.tradingBonus.value(portfolio.tradingBonus);
            observableCustomerObject.pendingBonus.value(portfolio.pendingBonus);
            observableCustomerObject.pendingWithdrawals.value(
                portfolio.pendingWithdrawals
            );
            observableCustomerObject.pendingBonusType(portfolio.pendingBonusType);

            // if coming from deep link and no cash back pending bonus and dialog already pop up

            if (canCloseDialog()) {
                DialogViewModel.close();
            }
        }
        //-------------------------------------------------------

        function showCashBack(arg) {
            // if coming from deep link and no cash back pending bonus
            if (observableCustomerObject.pendingBonusType() !== ePendingBonusType.cashBack ||
                observableCustomerObject.bonusAmount() <= 0) {
                return;
            }

            if (arg && arg.tradingEvent) {
                ko.postbox.publish('trading-event', arg.tradingEvent);
            }

            openInDialogDelegate.Invoke(
                eDialog.CashBackDialog,
                {
                    title: Dictionary.GetItem('lblCashBackTitle', 'deals_CashBack'),
                    dialogClass: 'cashback fx-dialog',
                    width: 850,
                },
                eViewTypes.vCashBack,
                observableCustomerObject.bonusAmount()
            );
        }

        function showExposureSummary(arg) {
            openInDialogDelegate.Invoke(
                eDialog.NetExposuresSummaryDialog,
                { title: arg.title, dialogClass: 'netexposure fx-dialog' },
                eViewTypes.vNetExposure
            );
        }

        //-------------------------------------------------------
        function showDetailedMarginStatus(tradingEvent) {
            openInDialogDelegate.Invoke(
                eDialog.MarginStatus,
                { title: Dictionary.GetItem('MarginStatus', 'dialogsTitles', ' '), width: 800 },
                eViewTypes.vMarginStatus
            );

            if (tradingEvent) {
                ko.postbox.publish('trading-event', tradingEvent);
            }
        }

        return {
            Init: init,
            WalletInfo: observableCustomerObject,
            ViewProperties: viewProperties,
            OpenInDialog: openInDialogDelegate,
            Dispose: dispose,
            util: { toObservable: toObservable }
        };
    }

    return WalletModule;
});

define('deviceviewmodels/WalletModule',[
	"require",
	"handlers/general",
	"viewmodels/WalletModuleBase",
	"managers/CustomerProfileManager",
	"StateObject!DealerParams",
	"cachemanagers/ClientStateHolderManager",
], function (require) {
	var general = require("handlers/general"),
		WalletModuleBase = require("viewmodels/WalletModuleBase"),
		customerProfileManager = require("managers/CustomerProfileManager"),
		stateObjectDealerParams = require("StateObject!DealerParams"),
		csHolderManager = require("cachemanagers/ClientStateHolderManager");

	var WalletModule = general.extendClass(WalletModuleBase, function NewWalletModuleClass(_params) {
		var self = this,
			parent = self.parent;

		function init() {
			parent.Init();

			setObservableCustomerObject();

			registerToDispatcher();

			setInitialAdvancedViewMode();
		}

		function setInitialAdvancedViewMode() {
			parent.ViewProperties.isAdvancedView(
				!!(
					stateObjectDealerParams.get(eDealerParams.DealerAdvancedWalletView) ||
					customerProfileManager.ProfileCustomer().advancedWalletView
				)
			);
		}

		function setObservableCustomerObject() {
			var csHolder = csHolderManager.CSHolder;
			parent.WalletInfo.marginLevel = parent.util.toObservable(calculateMarginLevel(csHolder), function (val) {
				var naVal = general.toNumeric("NA");
				return parent.ViewProperties.isAdvancedView() && naVal !== val && 0 < val;
			});
		}

		function dispose() {
			parent.Dispose();
			unregisterFromDispatcher();
		}

		function registerToDispatcher() {
			csHolderManager.OnChange.Add(onClientStateChange);
		}

		function unregisterFromDispatcher() {
			csHolderManager.OnChange.Remove(onClientStateChange);
		}
		//-------------------------------------------------------
		function calculateMarginLevel(csHolder) {
			var usedMargin = general.toNumeric(csHolder.usedMargin);
			var totalEquity = general.toNumeric(csHolder.totalEquity);
			var naVal = general.toNumeric("NA");

			if (naVal === usedMargin || naVal === totalEquity || 0 === usedMargin || 0 === totalEquity) {
				return naVal;
			}

			return general.toNumeric(totalEquity / usedMargin);
		}

		function onClientStateChange() {
			var csHolder = csHolderManager.CSHolder;
			parent.WalletInfo.marginLevel.value(calculateMarginLevel(csHolder));
		}
		return {
			Init: init,
			WalletInfo: parent.WalletInfo,
			ViewProperties: parent.ViewProperties,
			OpenInDialog: parent.OpenInDialog,
			Dispose: dispose,
		};
	});

	return new WalletModule();
});

/* global eStartSpinFrom */
define('viewmodels/WalletViewModel',["require", "handlers/general", "helpers/KoComponentViewModel", "deviceviewmodels/WalletModule"], function (
	require
) {
	var general = require("handlers/general"),
		WalletModule = require("deviceviewmodels/WalletModule"),
		KoComponentViewModel = require("helpers/KoComponentViewModel");

	var WalletViewModel = general.extendClass(KoComponentViewModel, function WalletViewModel() {
		var self = this,
			parent = this.parent,
			data = this.Data;

		function init() {
			parent.init.call(self);

			data.WalletInfo = WalletModule.WalletInfo;
			data.ViewProperties = WalletModule.ViewProperties;

			WalletModule.Init();
		}

		function dispose() {
			WalletModule.Dispose();
			parent.dispose.call(self);
		}

		return {
			Data: data,
			Init: init,
			dispose: dispose,
		};
	});

	var createViewModel = function () {
		var viewModel = new WalletViewModel();

		viewModel.Init();

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});


define('viewmodels/TabsViewModel',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"devicemanagers/ViewModelsManager",
	"Dictionary",
	"StateObject!DealsTabs",
	"configuration/initconfiguration",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		viewModelsManager = require("devicemanagers/ViewModelsManager"),
		Dictionary = require("Dictionary"),
		state = require("StateObject!DealsTabs"),
		dealTabsConfiguration = require("configuration/initconfiguration").DealTabsConfiguration;

	var TabsViewModel = general.extendClass(KoComponentViewModel, function () {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data, // inherited from KoComponentViewModel
			stateKey = "selectedTabView" + dealTabsConfiguration.view;

		function init(settings) {
			parent.init.call(self, settings); // inherited from KoComponentViewModel

			setObservables();
		}

		function setObservables() {
			var viewArgs = viewModelsManager.VManager.GetViewArgs(dealTabsConfiguration.view),
				selectedTab = viewArgs ? viewArgs.selectedTab : null,
				defaultTab =
					selectedTab ||
					(state.containsKey(stateKey) && state.get(stateKey)) ||
					dealTabsConfiguration.tabs[0].type;

			data.tabs = dealTabsConfiguration.tabs.map(function (tab) {
				return Object.assign(tab, {
					componentReady: ko.observable(false),
					tabTitleText: Dictionary.GetItem(tab.tabTitle, "static_controlTitle"),
				});
			});

			data.selectedTab = state.set(stateKey, ko.observable(defaultTab));
		}

		function setComponentReady(componentType) {
			var componentItem = data.tabs.filter(function (tab) {
				return tab.type === componentType;
			});
			componentItem[0].componentReady(true);
		}

		return {
			init: init,
			SetComponentReady: setComponentReady,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new TabsViewModel();

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: { createViewModel: createViewModel },
	};
});



define('managers/HelpCenterContentManager',
    [
        'require',
        'devicemanagers/StatesManager',
        'Dictionary',
        'initdatamanagers/Customer',
        'LoadDictionaryContent!HelpCenterWalkthroughs',
        'LoadDictionaryContent!HelpCenterTradingGuide',
    ],
    function (require) {
        var StatesManager = require('devicemanagers/StatesManager'),
            dictionary = require('Dictionary'),
            customer = require('initdatamanagers/Customer'),
            HELPCENTER_WALKTHROUGHS_RESOURCE_NAME = 'HelpCenterWalkthroughs',
            HELPCENTER_GUIDES_RESOURCE_NAME = 'HelpCenterTradingGuide',
            trackElements = {
                'QuickPlatformTour': 'PlatformTour',
                'HowToFoundYourAccount': 'DepositTour',
                'HowToOpenADeal': 'DealTour',
                'HowToUploadADocument': 'UploadTour',
            };

        function setWthroughLabels() {
            var result = {};

            result[eHowtoWthrough.quickTour] = 'QuickPlatformTour';
            result[eHowtoWthrough.foundAccount] = 'HowToFoundYourAccount';
            result[eHowtoWthrough.openDeal] = 'HowToOpenADeal';
            result[eHowtoWthrough.uploadDocument] = 'HowToUploadADocument';

            return result;
        }

        function getContentOrNullIfIsEmpty(contentKey, resourceName) {
            if (dictionary.ValueIsEmpty(contentKey, resourceName)) {
                return null;
            }

            return dictionary.GetItem(contentKey, resourceName);
        }

        function getWalkthKeySuffix() {
            if (customer.prop.isSeamless || customer.prop.isPending) {
                return eCustomerStateSuffix.pending;
            }

            if (customer.prop.isLive ||
                customer.prop.customerType === eCustomerType.TradingBonus ||
                StatesManager.States.Folder() === eFolder.GameFolder) {
                return eCustomerStateSuffix.live;
            }

            if (customer.prop.isDemo) {
                return eCustomerStateSuffix.demo;
            }

            return '';
        }

        function buildWalkthroughsList() {
            var result = [],
                WTHROUGH_LABELS = setWthroughLabels(),
                suffix = getWalkthKeySuffix();

            Object.keys(eHowtoWthrough)
                .forEach(function processKey(key) {
                    var prop = eHowtoWthrough[key],
                        wid = getContentOrNullIfIsEmpty(prop + suffix, HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);

                    if (wid) {
                        result.push({
                            type: prop,
                            text: getContentOrNullIfIsEmpty(WTHROUGH_LABELS[prop], HELPCENTER_WALKTHROUGHS_RESOURCE_NAME),
                            walkthrougId: wid,
                            trackElement: trackElements[WTHROUGH_LABELS[prop]]
                        });
                    }
                });

            return result;
        }

        function buildTradingGuidLink() {
            return getContentOrNullIfIsEmpty('tradingGuideLink',  HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);// HELPCENTER_GUIDES_RESOURCE_NAME);
        }

        function buildWireTransferGuideLink() {
            return getContentOrNullIfIsEmpty('wireTransferGuideLink', HELPCENTER_GUIDES_RESOURCE_NAME);
        }

        function buildSecureTradingGuideLink() {
            return getContentOrNullIfIsEmpty('secureTradingLink',  HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);
        }

        function buildUploadDocsGuideLink() {
            return getContentOrNullIfIsEmpty('uploadDocsVideoLink', HELPCENTER_WALKTHROUGHS_RESOURCE_NAME);
        }

        function getData() {
            return {
                walkthroughList: buildWalkthroughsList(),
                tradingGuideLink: buildTradingGuidLink(),
                wireTransferGuideLink: buildWireTransferGuideLink(),
                secureTradingLink: buildSecureTradingGuideLink(),
                uploadDocsLink: buildUploadDocsGuideLink()
            };
        }

        return {
            GetData: getData
        }
    }
);

define(
    'fxnet/uilayer/Modules/WalkthroughsModule',
    [
        'require',
        'Q',
        'handlers/general',
        'global/UrlResolver'
    ],
    function (require) {
        var Q = require('Q'),
            general = require('handlers/general'),
            urlResolver = require('global/UrlResolver');

        var deferer = Q.defer(),
            language = urlResolver.getLanguage(),
            inlineManuallanguage = {
                Arabic: 'ar',
                Chinese: 'zh',
                Czech: 'cs',
                Dutch: 'nl',
                English: 'en',
                Francais: 'fr',
                German: 'de',
                Greek: 'el',
                Hindi: 'hi',
                Hungarian: 'hu',
                Indonesian: 'id',
                Italian: 'it',
                Korean: 'ko',
                Japanese: 'ja',
                Polish: 'pl',
                Romanian: 'ro',
                Russian: 'ru',
                Spanish: 'es',
                Thai: 'th'
            };

        function loadPlayer() {
            window.inlineManualOptions = { language: inlineManuallanguage[language] || 'en' };

            var sc = document.createElement('script');

            sc.type = 'text/javascript';
            sc.async = true;
            sc.src = 'https://inlinemanual.com/embed/player.dad7f32ce6cc61cea346bf8ae2c7216e.js';

            var done = false;

            sc.onload = sc.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    deferer.resolve();
                }
            };

            var s = document.getElementsByTagName('script')[0];

            s.parentNode.insertBefore(sc, s);
        }

        function playWalkthrough(id, title) {
            deferer.promise
                .then(function () {
                    window.inline_manual_player.activateTopic(id);
                })
                .done();
        }

        function hideFlowAvailable() {
            var wPlayer = window.inline_manual_player;

            return wPlayer &&
                wPlayer.hasOwnProperty('ui_elements') &&
                wPlayer.ui_elements.hasOwnProperty('popover_close_button') &&
                wPlayer.ui_elements.popover_close_button.hasOwnProperty('attributes') &&
                wPlayer.ui_elements.popover_close_button.attributes.hasOwnProperty('class') &&
                wPlayer.ui_elements.popover_close_button.hasOwnProperty('events') &&
                wPlayer.ui_elements.popover_close_button.events.hasOwnProperty('click');
        }

        function hideWalkthrough() {
            if (!hideFlowAvailable()) {
                return;
            }

            var hideActionClass, hideEls;

            hideActionClass = window.inline_manual_player.ui_elements.popover_close_button.attributes.class;
            hideEls = document.getElementsByClassName(hideActionClass);

            if (!general.isEmptyValue(hideActionClass) && hideEls && hideEls.length > 0) {
                window.inline_manual_player.ui_elements.popover_close_button.events.click();
            }
        }

        function initModule() {
            loadPlayer();

            deferer.promise
                .then(function () {
                    window.addEventListener('popstate', function () {
                        hideWalkthrough();
                    });
                })
                .done();
        }

        initModule();

        return {
            walkthroughWidget: {
                play: playWalkthrough,
            }
        };
    }
);


define("FxNet/UILayer/ChatBot/PersonalGuideManager", [
    "require",
    "Q",
    "knockout",
    "handlers/general",
    "handlers/Logger",
    "tracking/loggers/datalayer",
    "initdatamanagers/Customer",
    "Dictionary",
    "tracking/loggers/hotjareventslogger",
    "handlers/languageHelper",
    "global/UrlResolver",
    "StateObject!HelpcHub",
    "trackingIntExt/TrackingData",
    "LoadDictionaryContent!fx_personal_guide",
    "configuration/initconfiguration",
], function PersonalGuideManager(require) {
    var ko = require("knockout"),
        Q = require("Q"),
        general = require("handlers/general"),
        logger = require("handlers/Logger"),
        dataLayer = require("tracking/loggers/datalayer"),
        customer = require("initdatamanagers/Customer"),
        dictionary = require("Dictionary"),
        hotjar = require("tracking/loggers/hotjareventslogger"),
        trackingData = require("trackingIntExt/TrackingData"),
        languageHelper = require("handlers/languageHelper"),
        stateObjectHelpc = require("StateObject!HelpcHub"),
        urlResolver = require("global/UrlResolver"),
        configuration = require('configuration/initconfiguration').PersonalGuideConfiguration,
        template_data = null,
        refElementId = "personalGuideHelpcenterContainer",
        _chatBot = null,
        chatBotInstance = null,
        isEnabled = Q.defer(),
        config = null,
        isAcceptedSAProcessType = customer.prop.SAProcess === 1,
        storageFactory = StorageFactory(StorageFactory.eStorageType.local),
        helpCenterStorageKey = "help-center-states",
        personalGuideResourceName = "fx_personal_guide",
        isPersonalGuideEnabled = dictionary.GetItem("fx-personal-guide", personalGuideResourceName, "NA") !== "NA",
        personalGuideName = customer.prop.abTestings.configuration["fx-personal-guide"],
        PersonalAssistants = {
            Max: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    title: dictionary.GetItem("fx-personal-guide-max-bubble-title", personalGuideResourceName),
                    message: dictionary.GetItem("fx-personal-guide-max-bubble-message", personalGuideResourceName),
                },
            }, configuration.PersonalAssistants.Max),

            Lexi: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    title: dictionary.GetItem("fx-personal-guide-lexi-bubble-title", personalGuideResourceName),
                    message: dictionary.GetItem("fx-personal-guide-lexi-bubble-message", personalGuideResourceName),
                },
            }, configuration.PersonalAssistants.Lexi),

            MaxSA: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    title: dictionary.GetItem("fx-personal-guide-max-bubble-title", personalGuideResourceName),
                    message: dictionary.GetItem("fx-personal-guide-max-bubble-message", personalGuideResourceName),
                },
            }, configuration.PersonalAssistants.MaxSA),

            LexiTestVariation4: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    message: dictionary.GetItem("fx-personal-guide-lexi-bubble-v4-message", personalGuideResourceName),
                    text: dictionary.GetItem("fx-personal-guide-bubble-v4-common-message", personalGuideResourceName),
                    ctaAbort: dictionary.GetItem("fx-personal-guide-bubble-abort-button", personalGuideResourceName),
                    ctaChatbot: dictionary.GetItem(
                        "fx-personal-guide-bubble-chatbot-button",
                        personalGuideResourceName
                    ),
                }
            }, configuration.PersonalAssistants.LexiTestVariation4),

            MaxTestVariation4: Object.assign({
                language: customer.prop.language,
                bubbleMessage: {
                    message: dictionary.GetItem("fx-personal-guide-max-bubble-v4-message", personalGuideResourceName),
                    text: dictionary.GetItem("fx-personal-guide-bubble-v4-common-message", personalGuideResourceName),
                    ctaAbort: dictionary.GetItem("fx-personal-guide-bubble-abort-button", personalGuideResourceName),
                    ctaChatbot: dictionary.GetItem(
                        "fx-personal-guide-bubble-chatbot-button",
                        personalGuideResourceName
                    ),
                },
            }, configuration.PersonalAssistants.MaxTestVariation4),
        },
        selectedAssistant = null,
        SiteTriggerNameExcluded = ["ib", "cashback", "cashbackaff", "finalcashback", "sageneral", "welcomebonus100_sa"];

    function getPGInteractedStatus() {
        var obj = JSONHelper.STR2JSON(
            "HelpCenterViewModel:getPGInteractedStatus",
            storageFactory.getItem(helpCenterStorageKey)
        ) || { pgInteracted: false };
        return obj.pgInteracted;
    }

    function buildChatBotConfig(chatBotConfig) {
        config = {
            name: chatBotConfig.name.replace(/SA$/, ""),
            onError: function (data) {
                logger.warn("Chatbot-PersonalGuide", data);
            },
            onLoad: function () {
                var eventObj = { event: "personalguide4helpcenter-ready" };

                eventObj.agentName = chatBotConfig.name;
                eventObj.agentVersion = chatBotConfig.version;
                eventObj.agentLanguage = chatBotConfig.language;
                dataLayer.push(eventObj);
            },
            onClose: function () { },
            onTrack: function (type, name, _data) {
                var eventObj = { event: name, eventType: type };

                if (type == "click" && !getPGInteractedStatus()) {
                    stateObjectHelpc.update("pg-interacted", true);
                }

                for (var i = 1; i < _data.length; i++) {
                    var property = _data[i].split("=");
                    if (property.length > 1) eventObj[property[0]] = property[1];
                }
                eventObj.agentName = chatBotConfig.name;
                eventObj.agentVersion = chatBotConfig.version;
                eventObj.agentLanguage = chatBotConfig.language;

                window.emilyCurrentBlock = eventObj.block_id;
                dataLayer.push(eventObj);
            },
            onCallback: function (_data) {
                switch (_data[0]) {
                    case "deposit": {
                        $viewModelsManager.VManager.RedirectToURL("/webpl3/Account/Redirect/Deposit");
                        break;
                    }
                    case "walkthrough": {
                        dataLayer.push({ event: "personalguide4helpcenter-play", walkthroughToPlay: _data[1] });
                        break;
                    }
                    default: {
                        dataLayer.push({
                            event: "personalguide-callback-error",
                            data: (_data[0] || {}).toString(),
                        });
                    }
                }
            },
            defaultStatus: "hide",
            history: true,
        };

        if (languageHelper.IsRtlLanguage()) {
            config.direction = "rtl";
        }

        config.base_url = urlResolver.getStaticJSPath() + "/fx-chatbot";
    }

    function _initChatBot() {
        var assistantName = isAcceptedSAProcessType ? "MaxSA" : personalGuideName;

        if (isPersonalGuideEnabled && assistantName) {
            selectedAssistant = PersonalAssistants[assistantName];
        } else {
            isEnabled.reject(false);
            return;
        }

        require([
            "assets/js/fx-chatbot/main",
            "text!assets/js/fx-chatbot/data/PersonalGuide/" +
            selectedAssistant.name +
            "_" +
            selectedAssistant.version +
            "_" +
            selectedAssistant.language +
            ".js",
        ], function (chatBot, data_txt) {
            _chatBot = chatBot;

            hotjar.init(true)
                .fin(function () {
                    dataLayer.push({ "event": "part-of-test", "variation": selectedAssistant.variation });

                    template_data = JSON.parse(data_txt);

                    buildChatBotConfig(selectedAssistant);

                    isEnabled.resolve(true);
                });
        });
    }

    function startChatBoot() {
        isEnabled.promise.then(function (enabled) {
            if (enabled && _chatBot && general.isFunctionType(_chatBot.ChatBot)) {
                chatBotInstance = _chatBot.ChatBot(template_data, config, document.getElementById(refElementId));
            }
        });
    }

    function showChatBot() {
        isEnabled.promise.then(function (enabled) {
            if (enabled) {
                chatBotInstance.changeStatus("show");
            }
        });
    }

    function dispose() {
        isEnabled.promise.then(function (enabled) {
            if (enabled) {
                chatBotInstance.dispose();
            }
        });

        biCustomerUnsubscribe();
    }

    function _initPersonalGuide(scmmDataLOaded) {
        if (scmmDataLOaded === true) {
            biCustomerUnsubscribe();

            var _trackingData = trackingData.getProperties(),
                _nonTrackingData = trackingData.getNonTrackingProperties();

            if (
                !general.objectContainsKey(_nonTrackingData, "SiteTriggerName") ||
                SiteTriggerNameExcluded.indexOf(_nonTrackingData.SiteTriggerName.toLowerCase()) >= 0 ||
                parseInt(_trackingData.NumberOfDeposits) > 0
            ) {
                isEnabled.reject(false);
                return;
            }

            _initChatBot();
        }
    }

    var sccmDataLoaded, sccmDataLoadedSubscriber;
    function _init() {
        sccmDataLoaded = ko.observable();
        sccmDataLoadedSubscriber = sccmDataLoaded.subscribe(_initPersonalGuide);
        sccmDataLoaded.subscribeTo("scmm-data-loaded", true);
    }

    function biCustomerUnsubscribe() {
        if (sccmDataLoadedSubscriber) {
            sccmDataLoadedSubscriber.dispose();
            sccmDataLoaded.unsubscribeFrom("scmm-data-loaded");
        }
    }

    _init();

    return {
        enabled: isEnabled.promise,
        start: startChatBoot,
        show: showChatBot,
        dispose: dispose,
        getBubbleNessage: function getBubbleNessage() {
            return selectedAssistant.bubbleMessage;
        },
    };
});

define("devicemanagers/HelpCenterMenuPersonalGuideManager", [
	"require",
	"handlers/general",
	"tracking/loggers/datalayer",
	"StateObject!HelpcHub",
	"devicemanagers/StatesManager",
	"fxnet/uilayer/Modules/WalkthroughsModule",
	"managers/viewsmanager",
	"managers/HelpCenterContentManager",
	"generalmanagers/ErrorManager",
	"StateObject!IM",
	"FxNet/UILayer/ChatBot/PersonalGuideManager",
	"LoadDictionaryContent!fx_personal_guide",
	"configuration/initconfiguration",
], function (require) {
	var general = require("handlers/general"),
		dataLayer = require("tracking/loggers/datalayer"),
		stateObjectHelpc = require("StateObject!HelpcHub"),
		statesManager = require("devicemanagers/StatesManager"),
		walkthrough = require("fxnet/uilayer/Modules/WalkthroughsModule"),
		viewsManager = require("managers/viewsmanager"),
		contentManager = require("managers/HelpCenterContentManager"),
		ErrorManager = require("generalmanagers/ErrorManager"),
		stateObjectIM = require("StateObject!IM"),
		personalGuideManager = require("FxNet/UILayer/ChatBot/PersonalGuideManager"),
		userIsActive = statesManager.States.IsActive,
		storageFactory = StorageFactory(StorageFactory.eStorageType.local),
		helpCenterStorageKey = "help-center-states",
		usubscribeRewardClose = null,
		configuration = require("configuration/initconfiguration").PersonalGuideConfiguration;

	function getPGSeenStatus() {
		var obj = JSON.parse(storageFactory.getItem(helpCenterStorageKey)) || { pgSeen: false };
		return obj.pgSeen;
	}

	function getPGInteractedStatus() {
		var obj = JSON.parse(storageFactory.getItem(helpCenterStorageKey)) || { pgInteracted: false };
		return obj.pgInteracted;
	}

	function _start() {
		if (userIsActive() || stateObjectHelpc.get("pg-present")) {
			return;
		}

		setSubscriptions();

		setHidePersonalGuideStatus();

		var bubbleMessages = null;

		enablePersonalGuide(bubbleMessages);
	}

	function enablePersonalGuide(bubbleMessages, hidePersonalGuide) {
		if (hidePersonalGuide || stateObjectHelpc.get("pg-present")) {
			return;
		}

		stateObjectHelpc.update("pg-present", true);
		if (bubbleMessages !== null && !(getPGSeenStatus() || getPGInteractedStatus())) {
			stateObjectHelpc.update("showBubble", bubbleMessages);
		}

		if (!(getPGSeenStatus() || getPGInteractedStatus()) && !stateObjectHelpc.get("HidePersonalGuide")) {
			stateObjectHelpc.update("visible", true);
		}
	}

	function disablePersonalGuideWhenBecameActive(mustDisable) {
		if (mustDisable === true) {
			stateObjectHelpc.update("pg-present", false);
		}
	}

	function walkthroughPlay(data) {
		var qptContent,
			wtPlay,
			INTRO = "introduction";

		if (userIsActive() || data.event !== "personalguide4helpcenter-play") {
			return;
		}

		qptContent =
			contentManager.GetData().walkthroughList.find(function (item) {
				return item.type === eHowtoWthrough.quickTour;
			}) || {};
		wtPlay = data.walkthroughToPlay !== INTRO ? data.walkthroughToPlay : qptContent.walkthrougId;
		stateObjectHelpc.update("visible", false);

		if (wtPlay) {
			walkthrough.walkthroughWidget.play(wtPlay);
		} else if (data.walkthroughToPlay === INTRO && !qptContent) {
			ErrorManager.onError(
				"HelpCenterMenuPersonalGuideManager/WalkthroughPlay",
				"Invalid walkthrough id: " + data.walkthroughToPlay,
				eErrorSeverity.low
			);
		}
	}

	function showPersonalGuideOnRewardClose() {
		if (!usubscribeRewardClose) {
			return;
		}

		usubscribeRewardClose();
		usubscribeRewardClose = null;

		if (!stateObjectHelpc.get("pg-present")) {
			return;
		}

		stateObjectHelpc.update("visible", true);
	}

	function setHidePersonalGuideStatus() {
		var mustHide =
			0 <= configuration.DoNotShowForms.indexOf(viewsManager.ActiveFormType()) ||
			(stateObjectIM.get("IMPopUpVisible") || {}).MessageType === 17;

		if (stateObjectHelpc.get("HidePersonalGuide") !== mustHide) {
			stateObjectHelpc.update("HidePersonalGuide", mustHide);
		}

		if (mustHide && stateObjectHelpc.get("visible")) {
			stateObjectHelpc.update("visible", false);
			if ((stateObjectIM.get("IMPopUpVisible") || {}).MessageType === 17) {
				usubscribeRewardClose = stateObjectIM.subscribe("IMPopUpVisible", showPersonalGuideOnRewardClose);
			}
		}
	}

	function setBubblePersonalGuideStatus(interacted) {
		if (interacted == true) {
			stateObjectHelpc.update("showNotification", false);
		}
	}

	function setSubscriptions() {
		userIsActive.subscribe(disablePersonalGuideWhenBecameActive);
		dataLayer.subscribers.push(walkthroughPlay);
		viewsManager.ActiveFormType.subscribe(setHidePersonalGuideStatus);
		stateObjectIM.subscribe("IMPopUpVisible", setHidePersonalGuideStatus);

		stateObjectHelpc.set("pg-interacted", false);
		stateObjectHelpc.subscribe("pg-interacted", setBubblePersonalGuideStatus);
	}

	function init() {
		personalGuideManager.enabled.then(function (isEnabled) {
			if (isEnabled) {
				personalGuideManager.start({});
				_start();
			}
		});
	}

	function scroll() {
		if (window.emilyScrollContainer && general.isFunctionType(window.emilyScrollContainer)) {
			window.emilyScrollContainer();
		}
	}

	return {
		Init: init,
		Show: personalGuideManager.show,
		Scroll: scroll,
	};
});

define('deviceviewmodels/HelpCenterViewModel',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"StateObject!HelpcHub",
	"managers/HelpCenterContentManager",
	"devicemanagers/HelpCenterMenuPersonalGuideManager",
	"managers/viewsmanager",
	"JSONHelper",
	"global/storagefactory",
], function HelpCenterDef(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		stateObjectHelpc = require("StateObject!HelpcHub"),
		contentManager = require("managers/HelpCenterContentManager"),
		personalGuideManger = require("devicemanagers/HelpCenterMenuPersonalGuideManager"),
		VManager = require("managers/viewsmanager"),
		JSONHelper = require("JSONHelper"),
		StorageFactory = require("global/storagefactory"),
		storageFactory = StorageFactory(StorageFactory.eStorageType.local),
		helpCenterStorageKey = "help-center-states",
		showPersonalGuideOnNextOpen = false;

	function getPGSeenStatus() {
		var obj = JSONHelper.STR2JSON(
			"HelpCenterViewModel:getPGSeenStatus",
			storageFactory.getItem(helpCenterStorageKey)
		) || { pgSeen: false };

		return obj.pgSeen;
	}

	function getPGInteractedStatus() {
		var obj = JSONHelper.STR2JSON(
			"HelpCenterViewModel:getPGInteractedStatus",
			storageFactory.getItem(helpCenterStorageKey)
		) || { pgInteracted: false };

		return obj.pgInteracted;
	}

	function savePGInteractedStatus(statusSeen, statusInteracted) {
		var obj =
			JSONHelper.STR2JSON(
				"HelpCenterViewModel:savePGInteractedStatus",
				storageFactory.getItem(helpCenterStorageKey)
			) || {};

		obj.pgSeen = statusSeen;
		obj.pgInteracted = statusInteracted;
		storageFactory.setItem(helpCenterStorageKey, JSON.stringify(obj));
	}

	function getHelpCenterSeenStatus() {
		var obj = JSONHelper.STR2JSON(
			"HelpCenterViewModel:getHelpCenterSeenStatus",
			storageFactory.getItem(helpCenterStorageKey)
		) || { helpCenterSeen: false };

		return obj.helpCenterSeen;
	}

	function saveHelpCenterSeenStatus(status) {
		var obj =
			JSONHelper.STR2JSON(
				"HelpCenterViewModel:saveHelpCenterSeenStatus",
				storageFactory.getItem(helpCenterStorageKey)
			) || {};

		obj.helpCenterSeen = status;
		storageFactory.setItem(helpCenterStorageKey, JSON.stringify(obj));
	}

	var HelpCenterViewModel = general.extendClass(KoComponentViewModel, function HelpCenterClass(params) {
		var self = this,
			parent = this.parent,
			data = this.Data,
			soSubscriptions = [];

		function getLastSectionActive() {
			if (!data.pgPresent()) {
				return eHelpcSections.default;
			}

			var obj =
				JSONHelper.STR2JSON(
					"HelpCenterViewModel:getLastSectionActive",
					storageFactory.getItem(helpCenterStorageKey)
				) || {};

			return obj.lastActiveSection || eHelpcSections.personalguide;
		}

		function saveLastSectionActive(section) {
			if (!data.pgPresent()) {
				return;
			}

			var obj =
				JSONHelper.STR2JSON(
					"HelpCenterViewModel:saveLastSectionActive",
					storageFactory.getItem(helpCenterStorageKey)
				) || {};

			obj.lastActiveSection = section;
			storageFactory.setItem(helpCenterStorageKey, JSON.stringify(obj));
		}

		function init() {
			personalGuideManger.Init();
			setObservables();
			setSubscriptions();
			loadResources();
		}

		function loadResources() {
			var content = contentManager.GetData();

			data.listData(content.walkthroughList);
			data.tradingGuideLink(content.tradingGuideLink);
			data.wireTransferGuideLink(content.wireTransferGuideLink);
			data.secureTradingLink(content.secureTradingLink);
		}

		function setObservables() {
			data.personalGuideLoaded = false;
			data.tradingGuideLink = ko.observable(null);
			data.wireTransferGuideLink = ko.observable(null);
			data.secureTradingLink = ko.observable(null);
			data.pcLoading = ko.observable(false);

			data.visible = ko.observable(false);
			stateObjectHelpc.update("visible", false);

			data.hidePersonalGuide = ko.observable(stateObjectHelpc.get("HidePersonalGuide") || false);
			data.pgPresent = ko.observable();

			data.activeSection = ko.observable(data.pgPresent() ? getLastSectionActive() : eHelpcSections.default);
			data.listData = ko.observable({});

			data.pgSeen = ko.observable(getPGSeenStatus());
			data.visibleFirstTime = ko.observable(!(getPGSeenStatus() || getPGInteractedStatus()));

			ko.computed(function () {
				if (
					data.visible() &&
					data.activeSection() === eHelpcSections.personalguide &&
					!data.personalGuideLoaded
				) {
					data.personalGuideLoaded = true;
					personalGuideManger.Show();
				}
			});
		}

		function setSubscriptions() {
			stateObjectHelpc.set("pg-interacted", getPGInteractedStatus());
			stateObjectHelpc.subscribe("pg-interacted", function (interacted) {
				savePGInteractedStatus(data.pgSeen(), interacted);
			});
			soSubscriptions.push(
				{
					unsubscribe: stateObjectHelpc.subscribe("visible", function (willBeVisible) {
						if (!data.visible()) {
							if (stateObjectHelpc.get("pg-present") && !data.pgPresent()) {
								data.pgPresent(true);

								if (!(getPGSeenStatus() || getPGInteractedStatus())) {
									data.activeSection(eHelpcSections.personalguide);
								}
							}
						} else if (!willBeVisible && data.pgPresent()) {
							if (!(getPGSeenStatus() || getPGInteractedStatus())) {
								saveLastSectionActive(eHelpcSections.personalguide);
								showPersonalGuideOnNextOpen = true;
							} else {
								saveLastSectionActive(data.activeSection());
							}
						}

						if (willBeVisible) {
							if (data.pgPresent()) {
								if (!(getPGSeenStatus() || getPGInteractedStatus())) {
									stateObjectHelpc.update("showNotification", true);
								} else {
									data.visibleFirstTime(false);
								}
							} else {
								if (!getHelpCenterSeenStatus()) {
									saveHelpCenterSeenStatus(true);
									data.visibleFirstTime(true);
								} else {
									data.visibleFirstTime(false);
								}
							}

							data.activeSection(getLastSectionActive());
						}
						data.visible(willBeVisible);
					}),
				},
				{
					unsubscribe: stateObjectHelpc.subscribe("pg-present", function (isPresent) {
						if (isPresent === false) {
							stateObjectHelpc.update("showNotification", false);
							stateObjectHelpc.update("visible", false);

							data.pgPresent(false);
							return;
						}

						if (!data.visible()) {
							if (!(getPGSeenStatus() || getPGInteractedStatus()) && !data.pgPresent() && isPresent) {
								data.activeSection(eHelpcSections.personalguide);
							}
							if (
								stateObjectHelpc.get("HidePersonalGuide") &&
								!(data.pgSeen() || getPGInteractedStatus())
							) {
								showPersonalGuideOnNextOpen = true;
							} else {
								data.pgPresent(isPresent);
							}
						} else {
							if (!(data.pgSeen() || getPGInteractedStatus())) {
								stateObjectHelpc.update("showNotification", true);
								showPersonalGuideOnNextOpen = true;
							}
						}
					}),
				},
				{
					unsubscribe: stateObjectHelpc.subscribe("HidePersonalGuide", function (mustHide) {
						data.hidePersonalGuide(mustHide);
						if (!mustHide && showPersonalGuideOnNextOpen) {
							showPersonalGuideOnNextOpen = false;
							stateObjectHelpc.update("visible", true);
						}
					}),
				}
			);

			self.subscribeTo(data.visible, function (visible) {
				ko.postbox.publish("help-center", {
					event: visible ? "open" : "close",
					tab: data.activeSection() === eHelpcSections.personalguide ? "guide" : "help",
				});
			});

			var lastForm = VManager.ActiveFormName();
			self.subscribeTo(VManager.ActiveFormName, function (currentForm) {
				if (data.visible() && lastForm !== currentForm) {
					stateObjectHelpc.update("visible", false);
				}
				lastForm = currentForm;
			});

			self.subscribeTo(data.activeSection, function (value) {
				if (value === eHelpcSections.personalguide && data.personalGuideLoaded) {
					personalGuideManger.Scroll();
				}
			});

			self.subscribeTo(data.visible, function (value) {
				if (value && data.personalGuideLoaded) {
					personalGuideManger.Scroll();
				}
			});
		}

		function closeHub() {
			stateObjectHelpc.update("visible", false);

			if (showPersonalGuideOnNextOpen === true) {
				data.activeSection(eHelpcSections.personalguide);
				data.pgPresent(true);
				showPersonalGuideOnNextOpen = false;
			} else {
				stateObjectHelpc.update("showBubble", false);
			}

			saveLastSectionActive(data.activeSection());
		}

		function save() {
			saveLastSectionActive(data.activeSection());
		}

		function dispose() {
			save();

			while (soSubscriptions.length > 0) {
				soSubscriptions.pop().unsubscribe();
			}

			parent.dispose.call(self);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			CloseHub: closeHub,
		};
	});

	function createViewModel(params) {
		var viewModel = new HelpCenterViewModel(params || {});
		viewModel.init();

		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

define('viewmodels/HelpCenter/HelpCenterActionViewModel',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"StateObject!HelpcHub",
], function HelpCenterActionDef(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		stateObjectHelpc = require("StateObject!HelpcHub");

	var HelpCenterActionViewModel = general.extendClass(KoComponentViewModel, function HelpCenterActionClass(params) {
		var self = this,
			parent = this.parent,
			data = this.Data,
			soSubscriptions = [];

		function init() {
			parent.init.call(self, params);

			if (general.isNullOrUndefined(stateObjectHelpc.get("visible"))) {
				stateObjectHelpc.update("visible", false);
			}
			data.activeMenu = ko.observable(stateObjectHelpc.get("visible"));
			data.showNotification = ko.observable(stateObjectHelpc.get("showNotification"));
			setSubscriptions();
		}

		function setSubscriptions() {
			soSubscriptions.push({
				unsubscribe: stateObjectHelpc.subscribe("showNotification", function (value) {
					data.showNotification(value);
				}),
			});

			soSubscriptions.push({
				unsubscribe: stateObjectHelpc.subscribe("visible", function (value) {
					data.activeMenu(value);
				}),
			});
		}

		function toggleHelpCenter() {
			var newValue = !stateObjectHelpc.get("visible");
			if (data.showNotification() && true !== stateObjectHelpc.get("visible")) {
				stateObjectHelpc.update("showNotification", false);
			}
			data.activeMenu(newValue);
			stateObjectHelpc.update("visible", newValue);
		}

		function dispose() {
			while (soSubscriptions.length > 0) {
				soSubscriptions.pop().unsubscribe();
			}

			parent.dispose.call(self);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			toggleHelpCenter: toggleHelpCenter,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new HelpCenterActionViewModel(params);
		viewModel.init();

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

define(
    'viewmodels/BaseInstrumentSearchViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/ViewModelsManager',
        'Dictionary'
    ],
    function BaseInstrumentSearchDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            vmQuotesPreset = viewModelsManager.VmQuotesPreset;

        var BaseInstrumentSearchViewModel = general.extendClass(koComponentViewModel, function BaseInstrumentSearchClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                defaultMinLenght = 2;

            function init(settings) {
                parent.init.call(self, settings);

                setObservables();
                setValues(settings);
                setSubscribers();
            }

            function setObservables() {
                data.list = vmQuotesPreset.SearchInstrumentsObservable;
                data.searchMinLength = ko.observable(vmQuotesPreset.SingleCharSearch() ? 1 : defaultMinLenght);
                data.selected = ko.observable({});
                data.instrumentsList = ko.observableArray([]);
                data.favouritePreset = ko.observable(false);
            }

            function setValues(settings) {
                setDefaultInstruments();

                data.selectedInstrumentId = settings.selectedInstrumentId;
                data.suffixId = settings.suffixId;
                data.searchPostBoxTopic = settings.searchPostBoxTopic;
            }

            function setSubscribers() {
                self.subscribeTo(data.selected, onSelectedInstrumentChanged);

                instrumentsManager.OnFavoritesPresetChanged.Add(setDefaultInstruments);
            }

            function onSelectedInstrumentChanged(instrument) {
                if (!instrument || !instrument.id || instrument.id <= -1) {
                    return;
                }

                if (general.isFunctionType(data.selectedInstrumentId)) {
                    data.selectedInstrumentId(instrument.id);
                }
            }

            function setDefaultInstruments() {
                var quotesUIorder,
                    instruments = instrumentsManager.GetFavoriteInstruments();

                if (instruments.length === 0) {
                    instruments = instrumentsManager.GetMainMostPopularInstruments();
                    quotesUIorder = instrumentsManager.GetPresetInstruments(instrumentsManager.GetMainMostPopularPresetId());
                } else {
                    quotesUIorder = instrumentsManager.GetCustomizedUiOrder();
                    data.favouritePreset(true);
                }
                instrumentsManager.SetQuotesUIOrder(quotesUIorder, false, eRegistrationListName.Search);
                data.instrumentsList(addPresetInfo(instruments));
            }

            function addPresetInfo(instruments) {
                for (var idxInstrument = 0; idxInstrument < instruments.length; idxInstrument++) {
                    var instrument = instruments[idxInstrument];
                    var presets = instrumentsManager.GetPresetsForInstrument(instrument.id);

                    var presetId;
                    var presetFound = presets.some(function (id) {
                        if (vmQuotesPreset.IsSearchPreset(id)) {
                            presetId = parseInt(id);
                            return true;
                        }
                    });

                    presetId = presetFound ? presetId : instrument.presetId;
                    instrument.presetLabel = vmQuotesPreset.GetPreset(presetId).Label;
                }

                return instruments;
            }

            function dispose() {
                instrumentsManager.OnFavoritesPresetChanged.Remove(setDefaultInstruments);

                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose
            };
        });

        return BaseInstrumentSearchViewModel;
    }
);

define('deviceviewmodels/PresetInstrumentSearchViewModel',[
	"require",
	"handlers/general",
	"devicemanagers/ViewModelsManager",
	"viewmodels/BaseInstrumentSearchViewModel",
], function PresetInstrumentSearchDef(require) {
	var general = require("handlers/general"),
		viewModelsManager = require("devicemanagers/ViewModelsManager"),
		baseViewModel = require("viewmodels/BaseInstrumentSearchViewModel");

	var PresetInstrumentSearchViewModel = general.extendClass(baseViewModel, function PresetInstrumentSearchClass() {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data; // inherited from KoComponentViewModel

		function init(settings) {
			parent.init.call(self, settings);

			setSubscribers();
		}

		function setSubscribers() {
			self.subscribeTo(data.selected, function onSelectedInstrumentChanged(instrument) {
				viewModelsManager.VmQuotesPreset.SelectPreset(instrument.presetId);
			});
		}

		return {
			init: init,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new PresetInstrumentSearchViewModel();
		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});



var TDALDemoAccount = function () {
    var dataAjaxer = new TAjaxer();

    var processDemoDeposit = function (onComplete) {
        dataAjaxer.get(
            "TDALDemoAccount/processDemoDeposit",
			"DemoAccount/ProcessDemoDeposit",
			"",
			onComplete,
            function (error) {
                ErrorManager.onError("TDALDemoAccount/processDemoDeposit", error.message, eErrorSeverity.low);
            },
            0, null, null, false
       );
    };

    return {
        processDemoDeposit: processDemoDeposit
    }
};
define("dataaccess/dalDemoAccount", ["handlers/Ajaxer","JSONHelper"], (function (global) {
    return function () {
        var ret, fn;
       fn = function (Ajaxer, jsonhelper) {
				return this.TDALDemoAccount(jsonhelper);
			};
        ret = fn.apply(global, arguments);
        return ret || global.TDALDemoAccount;
    };
}(this)));

define('handlers/AmountConverter',
    [
        'require',
        'handlers/general'
    ],
    function (require) {
        var general = require('handlers/general');

        var AmountConverter = {
            Convert: function (amount, inBetweenQuote, useMidRate) {
                var bid, ask;

                if (general.isNullOrUndefined(inBetweenQuote)) {
                    return;
                }

                if (typeof inBetweenQuote.bid == 'function') {
                    bid = inBetweenQuote.bid();

                } else {
                    bid = inBetweenQuote.bid;
                }

                if (typeof inBetweenQuote.ask == 'function') {
                    ask = inBetweenQuote.ask();

                } else {
                    ask = inBetweenQuote.ask;
                }

                if (useMidRate === true) {
                    ask = bid = Format.toMidRate(bid, ask);
                }

                if (inBetweenQuote.isOppositeInstrumentFound) {
                    if (amount < 0) {
                        return amount * inBetweenQuote.instrumentFactor / bid;
                    } else {
                        return amount * inBetweenQuote.instrumentFactor / ask;
                    }
                } else {
                    if (amount < 0) {
                        return amount * ask / inBetweenQuote.instrumentFactor;
                    } else {
                        return amount * bid / inBetweenQuote.instrumentFactor;
                    }
                }
            }
        };

        return AmountConverter;
    }
);
define("dataaccess/dalConversion",
    [
        "require",
        "JSONHelper",
        'generalmanagers/ErrorManager'
    ],
    function (require) {
        var baseUrl = "api/conversion",
            jsonhelper = require("JSONHelper"),
            errorManager = require('generalmanagers/ErrorManager');

        function getInBetweenQuote(fromSymbolId, toSymbolId) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .get("dalConversion/getInBetweenQuote",
                    String.format("{0}/GetInBetweenQuote/{1}/{2}", baseUrl, fromSymbolId, toSymbolId),
                    "")
                .then(function onResponse(responseText) {
                    var response = jsonhelper.STR2JSON("getInBetweenQuote/onLoadComplete", responseText);

                    return response;
                })
                .fail(function onError(error) {
                    errorManager.onError("dalConversion/getInBetweenQuote", "", eErrorSeverity.medium);

                    throw error;
                });
        }

        function getConversionRateFormated(fromSymbolId, toSymbolId, fromSymbolName, toSymbolName) {
            var ajaxer = new TAjaxer();

            return ajaxer.promises
                .get("dalConversion/getConversionRateFormated",
                    String.format("{0}/GetConversionRateFormated/{1}/{2}/{3}/{4}", baseUrl, fromSymbolId, toSymbolId, fromSymbolName, toSymbolName),
                    "")
                .then(function onResponse(responseText) {
                    var response = jsonhelper.STR2JSON("getConversionRateFormated/onLoadComplete", responseText);

                    return response;
                })
                .fail(function onError(error) {
                    errorManager.onError("dalConversion/getConversionRateFormated", "", eErrorSeverity.medium);

                    throw error;
                });
        }

        return {
            getInBetweenQuote: getInBetweenQuote,
            getConversionRateFormated: getConversionRateFormated
        };
    }
);
define(
    'modules/BuilderForInBetweenQuote',
    [
        'require',
        'knockout',
        'Q',
        'handlers/general',
        'initdatamanagers/InstrumentsManager',
        'generalmanagers/RegistrationManager',
        'cachemanagers/QuotesManager',
        'dataaccess/dalConversion'
    ],
    function BuilderForInBetweenQuote(require) {
        var ko = require('knockout'),
            Q = require('Q'),
            general = require('handlers/general'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            RegistrationManager = require('generalmanagers/RegistrationManager'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            dalConversion = require('dataaccess/dalConversion');

        function getInBetweenQuote(fromSymbolId, toSymbolId) {
            if (fromSymbolId == toSymbolId) {
                return Q({
                    ask: ko.observable(1),
                    bid: ko.observable(1),
                    instrumentFactor: 1,
                    isOppositeInstrumentFound: false
                });
            }

            var instrumentProp = InstrumentsManager.GetInstrumentPropUsedForConversion(fromSymbolId, toSymbolId);

            if (!general.isNullOrUndefined(instrumentProp)) {
                return registerInstrument(instrumentProp.id)
                    .then(function (quote) {
                        return {
                            ask: quote.ask,
                            bid: quote.bid,
                            instrumentFactor: instrumentProp.factor,
                            isOppositeInstrumentFound: instrumentProp.isOppositeInstrumentFound
                        };
                    });
            }
            else {
                return dalConversion
                    .getInBetweenQuote(fromSymbolId, toSymbolId)
                    .then(function (response) {
                        var result = response.result;
                        var inBetweenQuote = null;

                        if (result) {
                            inBetweenQuote = {
                                ask: ko.observable(result.ask),
                                bid: ko.observable(result.bid),
                                instrumentFactor: result.instrumentFactor,
                                isOppositeInstrumentFound: result.isOppositeInstrumentFound
                            };
                        }

                        return inBetweenQuote;
                    });
            }
        }

        function registerInstrument(instrumentId) {
            var defer = Q.defer(),
                quote = {
                    ask: ko.observable(),
                    bid: ko.observable()
                };

            var updateQuote = function () {
                var quoteForInstrument = QuotesManager.Quotes.GetItem(instrumentId);

                if (quoteForInstrument) {
                    quote.bid(quoteForInstrument.bid);
                    quote.ask(quoteForInstrument.ask);

                    defer.resolve(quote);

                    return true;
                }

                return false;
            };

            QuotesManager.OnChange.Add(updateQuote);

            if (updateQuote() === false) {
                RegistrationManager.Update(eRegistrationListName.InBetweenQuote, instrumentId);
            }

            return defer.promise;
        }

        return {
            GetInBetweenQuote: getInBetweenQuote
        };
    }
);

define('viewmodels/demoDeposit/demo-deposit-icon',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"managers/CustomerProfileManager",
	"dataaccess/dalDemoAccount",
	"dataaccess/dalCommon",
	"handlers/AmountConverter",
	"Dictionary",
	"modules/BuilderForInBetweenQuote",
	"modules/systeminfo",
	"JSONHelper",
], function (require) {
	var ko = require("knockout"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		general = require("handlers/general"),
		Customer = require("initdatamanagers/Customer"),
		CustomerProfileManager = require("managers/CustomerProfileManager"),
		dalDemoAccount = require("dataaccess/dalDemoAccount"),
		AmountConverter = require("handlers/AmountConverter"),
		Dictionary = require("Dictionary"),
		BuilderForInBetweenQuote = require("modules/BuilderForInBetweenQuote"),
		JSONHelper = require("JSONHelper"),
		systemInfo = require("modules/systeminfo");

	var DemoDepositIconViewModel = general.extendClass(KoComponentViewModel, function DemoDepositIconViewModelClass(
		_params
	) {
		var self = this,
			parent = this.parent,
			params = _params,
			obs = {
				quoteForUSDCcyToSelectedAccuntCcy: ko.observable(""),
				isProcessing: ko.observable(false),
				shouldWaitForInBetweenQuote: ko.observable(false),
			};

		var usdCcy = 47,
			firstAmoutToDeposit;

		var amoutToDeposit = self
			.createComputed(function () {
				if (general.isNullOrUndefined(firstAmoutToDeposit) && obs.quoteForUSDCcyToSelectedAccuntCcy() != "") {
					firstAmoutToDeposit = AmountConverter.Convert(
						CustomerProfileManager.ProfileCustomer().demoDepositAmount,
						obs.quoteForUSDCcyToSelectedAccuntCcy()
					);
				}

				return firstAmoutToDeposit;
			})
			.extend({ deferred: true });

		var getFormattedMessage = function (key) {
			return String.format(
				Dictionary.GetItem(key),
				Format.toNumberWithCurrency(amoutToDeposit(), { currencyId: Customer.prop.selectedCcyId() })
			);
		};

		var tooltipMessage = self.createComputed(function () {
			return getFormattedMessage("demoDepositToolTip");
		});

		var isCustomerDemo = Customer.prop.isDemo;

		var isAlreadyDisplayed = false,
			wasDepositMade = false,
			isInBetweenQuoteChanging = false,
			waitForInBetweenQuoteInterval;

		var getMaxAmount = function () {
			if (isInBetweenQuoteChanging === true) {
				obs.shouldWaitForInBetweenQuote(true);
				waitForInBetweenQuoteInterval = setInterval(waitForInBetweenQuote, 500);

				return 0;
			}

			return AmountConverter.Convert(
				systemInfo.get("config").MaxEquityForDemoDepositInUsd,
				obs.quoteForUSDCcyToSelectedAccuntCcy.peek()
			);
		};

		var waitForInBetweenQuote = function () {
			if (!isInBetweenQuoteChanging) {
				if (waitForInBetweenQuoteInterval) clearInterval(waitForInBetweenQuoteInterval);
				obs.shouldWaitForInBetweenQuote(false);
			}
		};

		var getEquity = function () {
			return Number.fromStr(params.equity());
		};

		var isEligableToDemoDeposit = self
			.createComputed(function () {
				if (wasDepositMade === true) {
					return false;
				}

				if (isAlreadyDisplayed === true && !obs.isProcessing()) {
					return true;
				}

				if (!isCustomerDemo || obs.isProcessing()) {
					return false;
				}

				if (obs.shouldWaitForInBetweenQuote() === true) {
					return false;
				}

				isAlreadyDisplayed = getEquity() < getMaxAmount();

				return isAlreadyDisplayed;
			})
			.extend({ deferred: true });

		var onComplete = function (response) {
			var result = JSONHelper.STR2JSON("demo-deposit-icon:onComplete", response);
			if (result.isSuccessful === true) {
				wasDepositMade = true;
			}
			obs.isProcessing(false);
		};

		var onClick = function () {
			obs.isProcessing(true);
			dalDemoAccount.processDemoDeposit(onComplete);
		};

		var saveInBetweenQuote = function (response) {
			if (response) {
				obs.quoteForUSDCcyToSelectedAccuntCcy(response);
				isInBetweenQuoteChanging = false;
			}
		};

		var setInBetweenQuote = function () {
			isInBetweenQuoteChanging = true;

			BuilderForInBetweenQuote.GetInBetweenQuote(usdCcy, Customer.prop.selectedCcyId())
				.then(saveInBetweenQuote)
				.done();
		};

		var setSubscribers = function () {
			self.subscribeTo(Customer.prop.selectedCcyId, function () {
				setInBetweenQuote();
			});
		};

		var dispose = function () {
			parent.dispose.call(self);
		};

		var init = function (settings) {
			parent.init.call(self, settings);
			setInBetweenQuote();
			setSubscribers();
		};

		return {
			init: init,
			dispose: dispose,
			tooltipMessage: tooltipMessage,
			isCustomerDemo: isCustomerDemo,
			isEligableToDemoDeposit: isEligableToDemoDeposit,
			onClick: onClick,
			obs: obs,
		};
	});

	var createViewModel = function (_params) {
		var params = _params || {};

		var viewModel = new DemoDepositIconViewModel(params);
		viewModel.init();

		return viewModel;
	};

	return {
		createViewModel: createViewModel,
	};
});

define("devicealerts/MinEquityAlert", ["require", 'handlers/general', "Dictionary", "cachemanagers/PortfolioStaticManager","initdatamanagers/Customer"], function (require) {
    var Dictionary = require("Dictionary"),
        general = require('handlers/general'),
        portfolioManager = require("cachemanagers/PortfolioStaticManager"),
        customer = require("initdatamanagers/Customer");

    var MinEquityAlert = (function () {
        var hasPendingWithdrawals = function() {
            return portfolioManager.Portfolio.pendingWithdrawals.sign() > 0;
        };

        var show = function(result, instrumentCcyPair) {
            var properties = getContentPieces(result, instrumentCcyPair);

            AlertsManager.UpdateAlert(AlertTypes.MinEquityAlert, '', '', '', properties, true);
            AlertsManager.PopAlert(AlertTypes.MinEquityAlert);
        };

        var getAlertContent = function (result, instrumentCcyPair, ignorePendingWithdrawals) {
            var msgKeys = ['alertText', 'infoMaxSizeText', 'infoFundText'],
                messages = '',
                alertMsgs = getContentPieces(result, instrumentCcyPair, ignorePendingWithdrawals),
                isMessageAvailable = function (key) {
                    return alertMsgs && alertMsgs.hasOwnProperty(key) && alertMsgs[key] && alertMsgs[key].length;
                };
            for (var i = 0; i < msgKeys.length; i++) {
                messages += isMessageAvailable(msgKeys[i]) ? alertMsgs[msgKeys[i]] + '\n' : '';
            }
            return messages;
        };

        var isDealMaxSizeApplicable = function(instrumentCcyPair, amountToDeposit) {
            return !general.isEmptyValue(instrumentCcyPair) && amountToDeposit > 0;
        };

        var getContentPieces = function(result, instrumentCcyPair, ignorePendingWithdrawals) {
            var alertContentKey, infoMaxSizeContentKey, infoFundContentKey, infoFundWithdrawalContentKey, maxAllowedAmount, amountToDeposit;

            alertContentKey = 'MarginTipAlertContent';
            infoMaxSizeContentKey = 'MarginTipInfoContent_MaxSize';
            infoFundContentKey = 'MarginTipInfoContent_Fund';
            infoFundWithdrawalContentKey = 'MarginTipInfoContent_Fund_Withdrawal';
            maxAllowedAmount = result.maxAllowedAmount;
            amountToDeposit = result.amountToDeposit;

            var alertContent = Dictionary.GetItem(alertContentKey),
                infoMaxSizeContent = Dictionary.GetItem(infoMaxSizeContentKey),
                infoFundContent = Dictionary.GetItem(hasPendingWithdrawals() && !ignorePendingWithdrawals ? infoFundWithdrawalContentKey : infoFundContentKey),
                infoMaxSizeText = null;

            if (isDealMaxSizeApplicable(instrumentCcyPair, maxAllowedAmount)) {
                infoMaxSizeText = String.format(infoMaxSizeContent, maxAllowedAmount, instrumentCcyPair);
            }

            return {
                alertText: alertContent,
                infoMaxSizeText: infoMaxSizeText,
                infoFundText: String.format(infoFundContent, "", "", amountToDeposit, customer.prop.defaultCcy())
            };
        };

        return {
            Show: show,
            GetAlertContent: getAlertContent
        };
    })();
    return MinEquityAlert;
});

define(
    'deviceviewmodels/BaseOrder',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        'initdatamanagers/Customer',
        'cachemanagers/QuotesManager',
        'devicemanagers/StatesManager',
        'initdatamanagers/InstrumentsManager',
        'managers/instrumentTranslationsManager',
        'managers/viewsmanager',
        "devicealerts/MinEquityAlert",
        'viewmodels/dialogs/DialogViewModel',
        'StateObject!TradingEnabled'
    ],
    function BaseOrderDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            Customer = require('initdatamanagers/Customer'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            StatesManager = require('devicemanagers/StatesManager'),
            InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            InstrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            ViewsManager = require('managers/viewsmanager'),
            MinEquityAlert = require("devicealerts/MinEquityAlert"),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            stateTradingEnabled = require('StateObject!TradingEnabled');

        function BaseOrder() {
            var settings = {},
                _observableObject,
                viewProperties = {};

            //-------------------------------------------------------
            function init(customSettings, observableObject) {
                _observableObject = observableObject;

                setViewProperties();
                setSettings(customSettings);
            }

            //-------------------------------------------------------
            function setViewProperties() {
                viewProperties.InactiveInstrumentAlert = inactiveInstrumentAlert;
                viewProperties.popUpAmlAlert = openAmlStatusAlert;
            }

            //-------------------------------------------------------
            function openAmlStatusAlert() {
                closeDialog();

                setTimeout(function () {
                    DialogViewModel.openAsync(
                        eAppEvents.amlStatusLoadedEvent,
                        eDialog.AmlStatus,
                        {
                            title: Dictionary.GetItem('AMLStatus', 'dialogsTitles', ''),
                            closeOnEscape: false,
                            dialogClass: 'fx-dialog amlPopup',
                            width: 620
                        },
                        eViewTypes.vAmlStatus,
                        null
                    );
                });
            }

            //-------------------------------------------------------
            function openClientQuestionnaire() {
                var viewArgs = {};
                var dealModel = ko.toJS(_observableObject);

                if (dealModel) {
                    viewArgs.instrumentId = dealModel.selectedInstrument;
                    viewArgs.tab = dealModel.initialToolTab;

                    viewArgs.transactionType = dealModel.PageName && dealModel.PageName === eDealPage.NewLimitViewModel
                        ? eTransactionSwitcher.NewLimit
                        : eTransactionSwitcher.NewDeal;

                    viewArgs.orderDir = dealModel.orderDir;
                    viewArgs.showTools = dealModel.showTools;
                    viewArgs.selectedDealAmount = dealModel.selectedDealAmount;

                    ViewsManager.RedirectToForm(eForms.ClientQuestionnaire, {
                        from: {
                            form: ViewsManager.ActiveFormType(),
                            viewArgs: viewArgs
                        }
                    });
                }
                else {
                    ViewsManager.RedirectToForm(eForms.ClientQuestionnaire, {});
                }
            }

            //-------------------------------------------------------
            function inactiveInstrumentAlert(instrumentId) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId),
                    body;

                if (instrument) {
                    body = String.format("{0} - " + Dictionary.GetItem("InstrumentInactive"), instrument.ccyPair);
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, body, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            }

            //-------------------------------------------------------
            function checkTradingAgreement(instrument) {
                if (instrument) {
                    if (instrument.isFuture == true) {
                        if (Customer.prop.futureStatus == eTradingPermissions.Required) {
                            return eTradingAgreement.Needed;
                        }
                    }
                }

                return eTradingAgreement.NotNeeded;
            }

            //-------------------------------------------------------
            function showAlert(alert, title, messages, properties) {
                AlertsManager.UpdateAlert(alert, title, '', messages, properties);
                AlertsManager.PopAlert(alert);
            }

            //-------------------------------------------------------
            function showServerAlert(alert, serverResults, properties) {
                properties = general.extendType(properties, { serverResponses: serverResults });
                AlertsManager.UpdateAlert(alert, '', '', [], properties);
                AlertsManager.PopAlert(alert);
            }

            //-------------------------------------------------------
            function showMessageResult(results, callerId, instrument, prop) {
                var title = !general.isEmptyValue(callerId) ? Dictionary.GetItem(callerId, 'dialogsTitles', ' ') : null,
                    messages = [],
                    i = 0,
                    properties = prop || {},
                    alert = AlertTypes.ServerResponseAlert,
                    isTradingEnabled = stateTradingEnabled.containsKey('TradingEnabled')
                        ? stateTradingEnabled.get('TradingEnabled')
                        : false;

                general.extendType(prop, { callerId: callerId, instrument: instrument });

                for (var j = 0, jj = results.length; j < jj; j++) {
                    switch (results[j].msgKey) {
                        case "SuccessPriceAlertAdd":
                        case "OrderError20":
                        case "OrderError22":
                            showServerAlert(AlertTypes.PriceAlertServerResponseAlert, results, prop);
                            return;

                        case "SuccessLimitAdd":
                        case "SuccessLimitEdit":
                        case "SuccessLimitDelete":
                            showServerAlert(AlertTypes.LimitsServerResponseAlert, results, prop);

                            return;
                        case "SuccessPriceAlertDelete":
                        case "OrderError23":
                            showServerAlert(AlertTypes.PriceAlertClosedServerResponseAlert, results, prop);
                            return;

                        case "SuccessDealAdd":
                            showServerAlert(AlertTypes.DealAddServerResponseAlert, results, prop);
                            return;

                        case "SuccessDealClose":
                            ko.postbox.publish('trading-event', 'close-deal-success');
                            showServerAlert(AlertTypes.DealsClosedServerResponseAlert, results, prop);
                            return;

                        case "OrderError2":
                        case "OrderError3":
                        case "OrderError12":
                            messages[i++] = String.format("{0} \n", Dictionary.GetItem(results[j].msgKey));

                            if (isTradingEnabled) {
                                alert = AlertTypes.TradingConfirmationRetryAlert;
                            }
                            break;

                        case "OrderError13":
                            if (isTradingEnabled) {
                                alert = AlertTypes.TradingConfirmationRetryAlert;
                                messages[i++] = MinEquityAlert.GetAlertContent(results[j], instrument ? InstrumentTranslationsManager.Long(instrument.id) : null, true);
                            }
                            else {
                                MinEquityAlert.Show(results[j], instrument ? InstrumentTranslationsManager.Long(instrument.id) : null, false);
                                return;
                            }
                            break;

                        // OrderError105 - Please deposit money first  
                        case "OrderError105":
                            AlertsManager.PopAlert(PostPortfoliosLoginsAlerts.IsActive);
                            return;

                        //121- cdd compliance issue  
                        case "OrderError121":
                            openClientQuestionnaire();
                            return;

                        // OrderError107 - AML Statuses 
                        case "OrderError107": // cdd or aml compliance issue
                        case "OrderError115":
                            openAmlStatusAlert();
                            return;

                        // 106 - kyc compliance issue
                        case "OrderError106":
                            // show 'Failed aware' alert
                            if (StatesManager.States.KycStatus() === eKYCStatus.Failed && StatesManager.States.KycReviewStatus() === eKYCReviewStatus.Appropriate) {
                                alert = AlertTypes.ClientQuestionnaire;
                                var questionnaireAlertManager = AlertsManager.GetAlert(AlertTypes.ClientQuestionnaire);
                                questionnaireAlertManager.popAlert().done();
                            }
                            else {
                                openClientQuestionnaire();
                            }
                            return;

                        case "OrderError116": // instrument max exposure exceed
                        case "OrderError120":
                            var instrumentId = results[j].arguments.pop(),
                                translatedInstrument = InstrumentTranslationsManager.Long(instrumentId);

                            if (translatedInstrument) {
                                results[j].arguments[0] = translatedInstrument;
                            }

                            messages[i++] = translateResult(results[j]);
                            properties = {};
                            break;

                        case "SuccessCancelPendingWithdrawal":
                        case "CancelProcessWithdrawal":
                            messages[i++] = String.format(Dictionary.GetItem(results[j].msgKey), results[j].itemId, results[j].amount, results[j].ccy);
                            title = Dictionary.GetItem('CancelProcessWithdrawalTitle');
                            break;

                        case "FaildCancelPendingWithdrawal":
                            messages[i++] = Dictionary.GetItem(results[j].msgKey);
                            break;

                        default:
                            if (eOrderActionType[callerId] === eOrderActionType.CloseDeal &&
                                results[j].msgKey !== "ServerError" &&
                                results[j].status !== "ServerError") {

                                showServerAlert(AlertTypes.DealsClosedServerResponseAlert, results, prop);

                                return;
                            }

                            if (isTradingEnabled) {
                                switch (results[j].msgKey) {
                                    case 'OrderError103':
                                    case 'OrderError9':
                                        alert = AlertTypes.TradingConfirmationRetryAlert;
                                        messages[i++] = String.format("{0} \n", Dictionary.GetItem(results[j].msgKey));
                                        break;

                                    default:
                                        messages[i++] = String.format("{0} \n", translateResult(results[j]));
                                        properties = {};
                                        title = Dictionary.GetItem('GenericAlert', 'dialogsTitles', ' ');
                                        break;
                                }
                            }
                            else {
                                messages[i++] = String.format("{0} \n", translateResult(results[j]));
                                properties = {};
                                title = Dictionary.GetItem('GenericAlert', 'dialogsTitles', ' ');
                            }
                            break;
                    }
                }

                showAlert(alert, title, messages, properties);
            }

            //-------------------------------------------------------
            function validateOnlineTradingUser() {
                if (StatesManager.States.fxDenied() === true) {

                    if (Customer.prop.isDemo === true) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("DemoExpiredMessage"), '');
                    }
                    else {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("OrderError102"), '');
                    }

                    if (StatesManager.States.ExposureCoverageAlert() == 1) {
                        AlertsManager.GetAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
                        AlertsManager.UpdateAlert(PostClientStatesLoginsAlerts.ExposureCoverageAlert);
                    }

                    if (Customer.prop.isPending === true || Customer.prop.isLive) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("OrderError102"), '');
                    }

                    if (StatesManager.States.FolderTypeId() === parseInt(eFolderType.TradingBonus)) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("TradingBonusMessage"), '');
                    }

                    if (StatesManager.States.isIntDebit() === true) {
                        AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, Dictionary.GetItem("OnlineTradingDisabled"), '');
                    }

                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                }
            }

            //-------------------------------------------------------
            function translateResult(result) {
                var msg = Dictionary.GetItem(result.msgKey || "InternalError"),
                    args = result.arguments;

                if (general.isNullOrUndefined(args)) {
                    return msg;
                }

                return String.format(msg, args);
            }

            //-------------------------------------------------------
            function limitValidateQuote(instrumentId) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId);
                var alertBody;
                var quote = QuotesManager.Quotes.GetItem(instrumentId);
                var brokerAllowLimitsOnNoRates = Customer.prop.brokerAllowLimitsOnNoRates;

                if (!brokerAllowLimitsOnNoRates && quote && !quote.isActive()) {
                    alertBody = String.format("{0} - " + Dictionary.GetItem("InstrumentInactive"), instrument.ccyPair);

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                return true;
            }

            //-------------------------------------------------------
            function limitValidate(instrumentId, nestedValidation) {
                if (StatesManager.States.fxDenied() == true) {
                    validateOnlineTradingUser();

                    return false;
                }

                return limitValidateWithoutTradingStatus(instrumentId, nestedValidation);
            }

            //-------------------------------------------------------
            function limitValidateWithoutTradingStatus(instrumentId, nestedValidation) {
                var instrument = InstrumentsManager.GetInstrument(instrumentId);
                var res = checkTradingAgreement(instrument);
                var alertBody;

                if (res != eTradingAgreement.NotNeeded) {
                    alertBody = String.format(Dictionary.GetItem("rcFuturesRedirect"), instrument.ccyPair);

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (_observableObject.orderDir() == eOrderDir.None) {
                    alertBody = Dictionary.GetItem("limitOrderDirEmpty");

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (!_observableObject.openLimit()) {
                    alertBody = Dictionary.GetItem("limitLevelEmpty");

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (!general.isNumber(_observableObject.openLimit())) {
                    alertBody = Dictionary.GetItem("limitLevelInvalid");

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody, '');
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                if (!general.isEmptyValue(nestedValidation)) {
                    alertBody = nestedValidation.join();

                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, alertBody);
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return false;
                }

                //-------------------------------------------

                return true;
            }

            //-------------------------------------------------------
            function setSettings(customSettings) {
                for (var key in customSettings) {
                    if (customSettings.hasOwnProperty(key)) {
                        settings[key] = customSettings[key];
                    }
                }
            }

            //-------------------------------------------------------
            function onActionReturn(result, callerId, instrument, args) {
                var prop = {};

                if (args && ('redirectToView' in args)) {
                    prop.redirectToView = args.redirectToView;
                }

                if (result[0].result === eResult.Success) {
                    closeDialog();
                }

                if (args && ('valueDate' in args)) {
                    prop.valueDate = args.valueDate;
                }

                if (args && ('requestData' in args)) {
                    prop.requestData = args.requestData;
                }

                if (args && ('tradingEnabledRetry' in args)) {
                    prop.tradingEnabledRetry = args.tradingEnabledRetry;
                }

                showMessageResult(result, callerId, instrument, prop);
            }

            //-------------------------------------------------------
            function closeDialog() {
                DialogViewModel.close();
            }

            //-------------------------------------------------------
            function resultStatusSuccess(result) {
                for (var i = 0, length = result.length; i < length; i++) {
                    if (isResultStatusError(result[i])) {
                        return false;
                    }
                }

                return true;
            }

            //-------------------------------------------------------
            function raiseErrorEvent(result, eventToPublish, additionalProperties) {
                for (var i = 0; i < result.length; i++) {
                    if (isResultStatusError(result[i])) {
                        additionalProperties.type = 'server';
                        additionalProperties.reason = result[i].msgKey;

                        if (!general.isEmptyValue(eventToPublish)) {
                            ko.postbox.publish(eventToPublish, additionalProperties);
                        }
                    }
                }
            }

            //-------------------------------------------------------
            function isResultStatusError(result) {
                return result.status == eResult.Error || result.status === "ServerError";
            }

            //-------------------------------------------------------
            return {
                Init: init,
                CheckTradingAgreement: checkTradingAgreement,
                ShowAlert: showAlert,
                ShowMessageResult: showMessageResult,
                OnActionReturn: onActionReturn,
                ValidateOnlineTradingUser: validateOnlineTradingUser,
                LimitValidate: limitValidate,
                LimitValidateQuote: limitValidateQuote,
                LimitValidateWithoutTradingStatus: limitValidateWithoutTradingStatus,
                ViewProperties: viewProperties,
                CloseDialog: closeDialog,
                ResultStatusSuccess: resultStatusSuccess,
                RaiseErrorEvent: raiseErrorEvent
            };
        }

        return BaseOrder;
    }
);
define(
    'viewmodels/Limits/ActiveLimitsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        "helpers/ObservableHashTable",
        'devicemanagers/ViewModelsManager',
        'cachemanagers/activelimitsmanager',
        'managers/instrumentTranslationsManager',
        'dataaccess/dalorder',
        'configuration/initconfiguration',
        'viewmodels/QuotesSubscriber',
        'deviceviewmodels/BaseOrder',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dictionary = require('Dictionary'),
            observableHashTable = require("helpers/ObservableHashTable"),
            activeLimitsManager = require('cachemanagers/activelimitsmanager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            dalOrders = require('dataaccess/dalorder'),
            activeLimitsConfiguration = require('configuration/initconfiguration').ActiveLimitsConfiguration,
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            ViewModelBase = require('viewmodels/ViewModelBase');

        function ActiveLimitsModule() {
            var self,
                observableActiveLimitsCollection = new observableHashTable(ko, general, 'orderID', { enabled: true, sortProperty: 'orderID', asc: false }),
                quotesVM = new QuotesSubscriber(),
                baseOrder = new BaseOrder(),
                inheritedInstance = general.clone(ViewModelBase),
                dataInfo = {},
                dataInfoExp = {},
                isLoadingData = ko.observable(true);

            var init = function (customSettings) {
                self = this;
                inheritedInstance.setSettings(self, customSettings);
                baseOrder.Init({}, observableActiveLimitsCollection);
                dataInfo.Data = observableActiveLimitsCollection.Values;
                dataInfo.ShowPager = ko.observable(false);

                registerToDispatcher();
                populateObservableCollection();
                quotesVM.Start();
            };

            var registerToDispatcher = function () {
                activeLimitsManager.OnChange.Add(onChange);
            };

            var populateObservableCollection = function () {
                isLoadingData(true);

                var defaultLimitMode = inheritedInstance.getSettings(self).defaultLimitMode;

                activeLimitsManager.limits.ForEach(function iterator(orderId, limit) {
                    if (defaultLimitMode === eLimitMode.None || defaultLimitMode == limit.mode) { //List of open limits only      
                        var row = toObservableRow(limit);
                        observableActiveLimitsCollection.Add(row);
                    }
                });

                isLoadingData(false);
            };

            var onChange = function (items) {
                if (items) {
                    removeItems(items.removedLimits);
                    updateItems(items.editedLimits);
                    addNewItems(items.newLimits);
                }
            };

            var removeItems = function (removedLimits) {
                for (var i = 0; i < removedLimits.length; i++) {
                    observableActiveLimitsCollection.Remove(removedLimits[i]);
                }
            };

            var updateItems = function (updatedItems) {
                var defaultLimitMode = inheritedInstance.getSettings(self).defaultLimitMode;

                for (var i = 0, length = updatedItems.length; i < length; i++) {
                    var limit = toObservableRow(activeLimitsManager.limits.GetItem(updatedItems[i]));
                    if (defaultLimitMode === eLimitMode.None || defaultLimitMode == limit.mode) {

                        observableActiveLimitsCollection.Update(limit.orderID, limit);
                    }
                }
            };

            var addNewItems = function (newItems) {
                if (newItems && newItems.length) {
                    for (var i = 0, length = newItems.length; i < length; i++) {
                        var limit = toObservableRow(activeLimitsManager.limits.GetItem(newItems[i]));
                        if (inheritedInstance.getSettings(self).defaultLimitMode === eLimitMode.None || inheritedInstance.getSettings(self).defaultLimitMode == limit.mode) {
                            observableActiveLimitsCollection.Add(limit);
                        }
                    }
                }
            };

            var onRemoveLimit = function (data) {
                var limit = activeLimitsManager.limits.GetItem(data.orderID);
                if (limit) {
                    data.isRemoving(true);
                    dalOrders.DeleteLimit(limit, onRemoveLimitReturn);
                }
            };

            //------------------------------------------------------------

            var onRemoveLimitReturn = function (result, callerId, requestData) {
                baseOrder.ShowMessageResult(result, callerId, null, requestData);

                if (general.isDefinedType(observableActiveLimitsCollection.Get(result[0].itemId).isRemoving)) {
                    observableActiveLimitsCollection.Get(result[0].itemId).isRemoving(false);
                }
            };

            var toObservableRow = function (limit) {
                return {
                    instrumentName: ko.observable(instrumentTranslationsManager.Long(limit.instrumentID)),
                    instrumentID: limit.instrumentID,
                    isInactiveQuote: quotesVM.GetQuote(limit.instrumentID).isInactive,
                    baseSymbol: limit.baseSymbol,
                    otherSymbol: limit.otherSymbol,
                    orderID: limit.orderID,
                    positionNumber: limit.positionNumber == 0 ? "" : limit.positionNumber,
                    accountNumber: limit.accountNumber,
                    orderDir: limit.orderDir,
                    orderRate: limit.orderRate,
                    orderRateNumeric: general.toNumeric(limit.orderRate),
                    buySymbolID: limit.buySymbolID,
                    buyAmount: limit.buyAmount,
                    sellSymbolID: limit.sellSymbolID,
                    sellAmount: limit.sellAmount,
                    limitAmount: limit.orderDir == eOrderDir.Sell ? limit.sellAmount : limit.buyAmount,
                    type: limit.type,
                    mode: limit.mode,
                    expirationDate: general.isEmptyValue(limit.expirationDate) ? dictionary.GetItem("GoodTillCancel") : limit.expirationDate,
                    entryTime: limit.entryTime,
                    slRate: limit.slRate,  // to do remove toRate function
                    tpRate: limit.tpRate,
                    otherLimitID: limit.otherLimitID,
                    ThisDealSwipe: ko.observable(true),
                    typeTP_abrv: dictionary.GetItem("limtype2_short"),
                    typeTP: dictionary.GetItem("limtype2"),
                    typeSL_abrv: dictionary.GetItem("limtype1_short"),
                    typeSL: dictionary.GetItem("limtype1"),
                    rateDirIsUp: quotesVM.GetQuote(limit.instrumentID).rateDirIsUp,
                    rateDirIsDown: quotesVM.GetQuote(limit.instrumentID).rateDirIsDown,
                    isEditable: limit.mode === eLimitMode.OpenDeal,
                    isRemoving: ko.observable(false)
                };
            };

            var applyFilter = function () { };

            var hasRecords = ko.pureComputed(function () {
                return 0 < dataInfo.Data().length;
            });

            return {
                init: init,
                DataInfo: dataInfo,
                DataInfoExp: dataInfoExp,
                RemoveLimit: onRemoveLimit,
                SetSorting: observableActiveLimitsCollection.SetSorting,
                SortProperties: observableActiveLimitsCollection.SortProperties,
                Refresh: populateObservableCollection,
                IsLoadingData: isLoadingData,
                ApplyFilter: applyFilter,
                HasRecords: hasRecords
            };
        }

        var instance = new ActiveLimitsModule();
        instance.init(activeLimitsConfiguration);

        return instance;
    }
);

define('deviceviewmodels/LimitsViewModel',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"viewmodels/Limits/ActiveLimitsModule",
	"managers/viewsmanager",
	"Dictionary",
	"viewmodels/dialogs/DialogViewModel",
	"managers/PrintExportManager",
	"initdatamanagers/Customer",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		ActiveLimitsModule = require("viewmodels/Limits/ActiveLimitsModule"),
		ViewsManager = require("managers/viewsmanager"),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel"),
		Dictionary = require("Dictionary"),
		customer = require("initdatamanagers/Customer"),
		printExportManager = require("managers/PrintExportManager");

	var LimitsViewModel = general.extendClass(KoComponentViewModel, function LimitsViewModelClass() {
		var self = this,
			parent = this.parent; // inherited from KoComponentViewModelz,

		function init(params) {
			parent.init.call(self, params);

			if (!params.isHeaderComponent) {
				initExport();
			}
		}

		function dispose() {
			parent.dispose.call(self);
		}

		function initExport() {
			self.subscribeAndNotify(ActiveLimitsModule.HasRecords, monitorData);
		}

		function monitorData(hasData) {
			ko.postbox.publish("printableDataAvailable", {
				dataAvailable: hasData,
				viewType: ViewsManager.ActiveFormType(),
				viewModel: "LimitsViewModel",
			});
		}

		function updateRemoveLimit(limit) {
			if (printExportManager.IsWorkingNow()) {
				return;
			}

			var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
				dialogClass = "deal-slip" + (revisedSlip ? " revised-slip" : ""),
				dialogTitle = !revisedSlip
					? Dictionary.GetItem("EditDeleteOpeningLimit", "dialogsTitles", " ") + " " + limit.orderID
					: "";

			DialogViewModel.open(
				eDialog.EditLimit,
				{
					title: dialogTitle,
					width: 700,
					customTitle: "EditLimitHeader",
					persistent: false,
					dialogClass: dialogClass,
				},
				eViewTypes.vEditLimit,
				{
					orderId: limit.orderID,
					pageName: eDealPage.EditLimitViewModel,
					chart: {
						direction: eChartDirection.Same,
						allowDragLine: true,
						keys: {
							stopLoss: "chartline_IfDoneStopLoss",
							takeProfit: "chartline_IfDoneTakeProfit",
							currentRate: "chartline_CurrentRate",
							limitLevel: "chartline_LimitLevel",
						},
					},
				}
			);
		}
 
        function getSlTpDialogTitle(limitType, limit, revisedDealSlip) {
            if (revisedDealSlip) {
                return  '';
            }

            var contentKey = limitType === eLimitType.StopLoss ? 'UpdateRemoveStopLossTitle' : 'UpdateRemoveTakeProfitTitle',
                suffix = ' ' + limit.orderID;
            
            if (limitType === eLimitType.StopLoss && Number(limit.slRate) == 0) {
                contentKey = 'AddStopLossTitle';
                suffix = '';
            } else if (limitType === eLimitType.TakeProfit && Number(limit.tpRate) == 0) {
                contentKey = 'AddTakeProfitTitle';
                suffix = '';
            }
            
            return Dictionary.GetItem(contentKey, 'dialogsTitles', ' ') + suffix;
        }

        function addEditSlTp(limitType, limit) {
			var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
				dialogClass = "deal-slip" + (revisedSlip ? " revised-slip" : ""),
                dialogTitle = getSlTpDialogTitle(limitType, limit, revisedSlip),
                chartProperties = {
                    direction: eChartDirection.Opposite,
                    allowDragLine: true,
                    keys: {
                        stopLoss: 'chartline_IfDoneStopLoss',
                        takeProfit: 'chartline_IfDoneTakeProfit',
                        currentRate: 'chartline_IfDoneClosingRate',
                        limitLevel: 'chartline_LimitLevel'
                    }
                };

            DialogViewModel.open(eDialog.EditLimit,
                {
                    title: dialogTitle,
                    width: 700,
                    persistent: false,
                    customTitle: 'EditLimitHeader',
					dialogClass: dialogClass
                },
                eViewTypes.vEditLimit,
                {
                    chart: chartProperties,
                    currentRateDirectionSwitch: true,
                    isStartNavigator: false,
                    limitType: limitType,
                    orderId: limit.orderID,
                    pageName: eDealPage.EditIfDoneLimit,
                });
        }

		return {
			init: init,
			dispose: dispose,
			model: ActiveLimitsModule,
            updateRemoveLimit: updateRemoveLimit,
            addEditSlTp: addEditSlTp
		};
	});

	var createViewModel = function (params) {
		var viewModel = new LimitsViewModel();
		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel
		},
	};
});

define(
    'deviceviewmodels/account/UserFlowCTA',
    [
        'require',
        'modules/permissionsmodule',
        'managers/viewsmanager',
        'devicemanagers/AlertsManager'
    ],
    function (require) {
        var permissionsModule = require('modules/permissionsmodule'),
            ViewsManager = require('managers/viewsmanager'),
            AlertsManager = require('devicemanagers/AlertsManager');

        function getUserFlowAction(action) {
            switch (action) {
                case eCta.Seamless:
                    return permissionsModule.RegisterLeadType;

                case eCta.ContactUs:
                    return AlertsManager.PopAlert.bind(null, AlertTypes.ContactUsCTAAlert);

                case eCta.ClientQuestionnaire:
                    return ViewsManager.SwitchViewVisible.bind(null, eForms.ClientQuestionnaire);

                case eCta.Deposit:
                    return ViewsManager.SwitchViewVisible.bind(null, eForms.Deposit);

                case eCta.UploadDocuments:
                    return ViewsManager.SwitchViewVisible.bind(null, eForms.UploadDocuments);

                case eCta.None:
                default:
                    return function () { };
            }
        }

        var module = {
            getUserFlowAction: getUserFlowAction
        };

        return module;
    }
);

define('userflow/UserFlowManager',
    [
        'require',
        'knockout',
        'devicemanagers/StatesManager',
        'StateObject!userFlow',
        "global/UrlResolver",
    ],
    function (require) {
        var ko = require('knockout'),
            statesManager = require('devicemanagers/StatesManager'),
            stateObjectUserFlow = require('StateObject!userFlow'),
            urlResolver = require('global/UrlResolver');

        stateObjectUserFlow.set(eStateObjectTopics.UserFlowChanged, null);
        stateObjectUserFlow.set(eStateObjectTopics.ScmmFddLoaded, false);

        statesManager.StartGetCustomerData();

        require(['userflow/UserFlowBroker' + urlResolver.getBroker()], function (ufb) {
            ko.computed(function () {
                var model = ufb();
                stateObjectUserFlow.update(eStateObjectTopics.UserFlowChanged, model);

                ko.postbox.publish('account-state', model.userStatus);
            });
        });
    }
);

define('viewmodels/AccountSummaryNotActiveViewModel',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"devicemanagers/StatesManager",
	"StateObject!userFlow",
	"deviceviewmodels/account/UserFlowCTA",
	"userflow/UserFlowManager",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		Customer = require("initdatamanagers/Customer"),
		StatesManager = require("devicemanagers/StatesManager"),
		stateObjectUserFlow = require("StateObject!userFlow"),
		UserFlowCTA = require("deviceviewmodels/account/UserFlowCTA");

	var AccountSummaryNotActiveViewModel = general.extendClass(KoComponentViewModel, function (params) {
		var self = this,
			parent = this.parent,
			Data = this.Data,
			userFlowUnsubscribe;

		var ctaText = ko.observable("");
		var cta = null;
		var isVisible = ko.observable(false);

		function updateFromStateObject(model) {
			if (model) {
				ctaText(model.ctaText);
				cta = model.cta;
			}
		}

		function init() {
			updateFromStateObject(stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged));
			userFlowUnsubscribe = stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
				updateFromStateObject(model);
			});
			setDefaultObservables();
			isVisible(!(StatesManager.States.IsActive() || Customer.prop.customerType === eCustomerType.TradingBonus));
		}

		function setDefaultObservables() {
			Data.ctaClick = ctaClick;
		}

		function dispose() {
			if (userFlowUnsubscribe) userFlowUnsubscribe();
			parent.dispose.call(self);
		}

		self.subscribeTo(StatesManager.States.IsActive, function (value) {
			isVisible(!(value || Customer.prop.customerType === eCustomerType.TradingBonus));
		});

		function ctaClick() {
			if (cta !== eCta.ContactUs) {
				ko.postbox.publish("action-source", "FinancialSummaryCTA");
			}
			UserFlowCTA.getUserFlowAction(cta)();
		}

		return {
			init: init,
			dispose: dispose,
			Data: Data,
			isVisible: isVisible,
			ctaText: ctaText,
			statesManager: StatesManager,
			customer: Customer,
		};
	});

	function createViewModel(params) {
		var viewModel = new AccountSummaryNotActiveViewModel(params || {});
		viewModel.init();
		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

define(
    'FxNet/LogicLayer/Deal/DealPermissions',
    [
        'require',
        'initdatamanagers/Customer',
        'cachemanagers/PortfolioStaticManager',
        'cachemanagers/bonusmanager'
    ],
    function (require) {
        var customer = require('initdatamanagers/Customer'),
            portfolioManager = require('cachemanagers/PortfolioStaticManager'),
            bonusManager = require('cachemanagers/bonusmanager');

        function customerDealPermit() {
            return customer.prop.dealPermit;
        }

        function hasSpreadDiscount() {
            return portfolioManager.Portfolio.pendingBonusType === ePendingBonusType.spreadDiscount && bonusManager.bonus().amountBase > 0;
        }

        return {
            CustomerDealPermit: customerDealPermit,
            HasSpreadDiscount: hasSpreadDiscount
        };
    }
);
define(
    'viewmodels/OpenDealsViewModelBase',
    [
        'require',
        'handlers/general',
        'initdatamanagers/InstrumentsManager',
    ],
    function OpenDealsVMBaseDef() {
        var general = require('handlers/general'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager')

        function OpenDealsViewModelBase() {
            function getValueDate(deal) {
                var instrument = instrumentsManager.GetInstrument(deal.instrumentID);

                if (instrument.isShare) {
                    var corporateActionDate = instrument.getCorporateActionDate();

                    if (corporateActionDate) {
                        if (deal.valueDate) {
                            return {
                                isValueDateEmpty: false,
                                date: general.str2Date(deal.valueDate, 'd/m/y H:M') < general.str2Date(corporateActionDate, 'd/m/y H:M') ? deal.valueDate : corporateActionDate
                            };
                        }

                        return {
                            isValueDateEmpty: true,
                            date: corporateActionDate
                        };
                    }
                }

                if (deal.valueDate) {
                    return {
                        isValueDateEmpty: false,
                        date: deal.valueDate
                    };
                } else {
                    return {
                        isValueDateEmpty: true,
                        date: null
                    };
                }
            }

            return {
                getValueDate: getValueDate
            };
        }

        return OpenDealsViewModelBase;
    }
);


define(
    'deviceviewmodels/OpenDealsModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'initdatamanagers/Customer',
        'devicemanagers/AlertsManager',
        'Dictionary',
        'cachemanagers/ClientStateHolderManager',
        'cachemanagers/dealsmanager',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/StatesManager',
        'helpers/ObservableHelper',
        'dataaccess/dalorder',
        'deviceviewmodels/BaseOrder',
        'viewmodels/QuotesSubscriber',
        'viewmodels/ViewModelBase',
        "modules/BuilderForInBetweenQuote",
        'FxNet/LogicLayer/Deal/DealPermissions',
        'viewmodels/OpenDealsViewModelBase',
        'global/storagefactory',
        'StateObject!OpenedDeals',
        'handlers/AmountConverter'
    ],
    function OpenDealsDef(require) {
        var ko = require('knockout'),
            customer = require('initdatamanagers/Customer'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require('Dictionary'),
            csHolderManager = require('cachemanagers/ClientStateHolderManager'),
            dealsManager = require('cachemanagers/dealsmanager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            statesManager = require('devicemanagers/StatesManager'),
            vmHelpers = require('helpers/ObservableHelper'),
            dalOrders = require('dataaccess/dalorder'),
            BaseOrder = require('deviceviewmodels/BaseOrder'),
            QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            BuilderForInBetweenQuote = require("modules/BuilderForInBetweenQuote"),
            dealPermissions = require('FxNet/LogicLayer/Deal/DealPermissions'),
            general = require('handlers/general'),
            OpenDealsViewModelBase = require('viewmodels/OpenDealsViewModelBase'),
            storageFactory = require('global/storagefactory'),
            stateObject = require('StateObject!OpenedDeals'),
            amountConverter = require('handlers/AmountConverter');

        var OpenDealsModule = general.extendClass(OpenDealsViewModelBase, function OpenDealsClass() {
            var self = this, // REBUILD_COLLECTION_SIZE = 2,
                itemsPerRender = 50,
                USD_ID = 47,
                quotesVM = new QuotesSubscriber(),
                baseOrder = new BaseOrder(),
                inheritedInstance = general.clone(ViewModelBase),
                LS = storageFactory(storageFactory.eStorageType.local),
                selectionKey = 'selection',
                availableSelectionKey = 'availableSelection',
                // module data
                data = {},
                subscribers = [];

            var init = function (customSettings) {
                itemsPerRender = customSettings.itemsPerRender || itemsPerRender;

                inheritedInstance.setSettings(self, customSettings);
                setFlagsState();

                registerToDispatcher();
                loadOpenedDeals();

                setSubscribers();

                quotesVM.Start();
            };

            var _prepareData = function () {
                data.dealsList = ko.observableArray([]);

                // prepare data
                Object.assign(data, {
                    dealsData: null,
                    isSorting: ko.observable(false),
                    isLoadingData: ko.observable(true),
                    isRenderingData: ko.observable(true),
                    onCloseDealsEnable: ko.observable(true),
                    quoteForAccountCcyToUsdCcy: ko.observable(null),
                    totalEquity: ko.observable(0),
                    hasValueDateColumn: ko.observable(false),
                    sortConfig: ko.observable({
                        sortProperty: 'positionNumber',
                        asc: false
                    }),
                    selection: stateObject.set(selectionKey, ko.observableArray([])),
                    availableSelection: stateObject.set(availableSelectionKey, ko.observableArray([])),
                    selectedDeals: ko.observableArray([]),
                    allSelected: ko.observable(false),
                    totalOpenedDeals: ko.observable(0),
                    flagsState: {},
                    positions: {}
                });

                data.currentRenders = ko.observable(1);
                data.lastDealPosition = ko.computed(function () {
                    return getLastDealPosition();
                });

            };

            var getLastDealPosition = function () {
                var lastDealPosition = dealsManager.Deals.count(),
                    limitedPosition = (data.currentRenders() * itemsPerRender),
                    lastPosition;

                lastPosition = lastDealPosition >= 0 ? lastDealPosition : 0;
                data.totalOpenedDeals(dealsManager.Deals.count());

                return limitedPosition <= lastPosition ? limitedPosition : lastPosition;
            };

            var updateDealsToClose = function (reset) {
                data.selectedDeals([]);
                if (reset) {
                    return;
                }

                data.selection().forEach(function (orderID) {
                    var deal = dealsManager.Deals.Container[orderID];
                    data.selectedDeals.push(toObservableRow(deal));
                });
            };

            var closeDealAfterConfirmation = function () {
                var closeDealsConfig = {
                    failCallback: function () {
                        data.onCloseDealsEnable(true);
                    }
                };

                if (data.selection().length > 0) {
                    data.onCloseDealsEnable(false);
                    return dalOrders.CloseDeals(data.selectedDeals(), onCloseDealsReturn, closeDealsConfig);
                }

                return ErrorManager.onError("closeDealAfterConfirmation", "trying to close empty list of positions", eErrorSeverity.low);
            };

            var showMultipleDealsConfirmationAlert = function () {
                var properties = {
                    selectedData: data.selectedDeals(),
                    confirmationCloseDeal: closeDealAfterConfirmation
                };

                AlertsManager.UpdateAlert(AlertTypes.MultipleDealsClosedConfirmation, this.title, this.body, [], properties);
                AlertsManager.PopAlert(AlertTypes.MultipleDealsClosedConfirmation);
            };


            var closeMultipleDeals = function () {
                if (!inheritedInstance.getSettings(self).closeSelected) {
                    return;
                }

                if (statesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    return;
                }

                if (data.selection().length === 0) {
                    return;
                }

                updateDealsToClose();
                if (LS.getItem('hideConfCloseDeals') == 'true') {
                    closeDealAfterConfirmation();
                } else {
                    showMultipleDealsConfirmationAlert();
                }
            };

            var setFlagsState = function () {
                data.flagsState.isMarketClosed = statesManager.States.IsMarketClosed;
            };

            var registerToDispatcher = function () {
                dealsManager.OnDealsChange.Add(onDealsChange);
                dealsManager.OnDealsPLChange.Add(onDealsPLChange);
                csHolderManager.OnChange.Add(onClientStateChange);
            };

            var loadOpenedDeals = function () {
                var accountCcyId = customer.prop.baseCcyId();

                if (accountCcyId !== USD_ID) {
                    BuilderForInBetweenQuote.GetInBetweenQuote(accountCcyId, USD_ID).then(function (response) {
                        data.quoteForAccountCcyToUsdCcy(response);
                        firstDealsLoad();
                    }).done();
                } else {
                    firstDealsLoad();
                }
            };

            var firstDealsLoad = function () {
                data.isLoadingData(true);
                renderDeals();
                data.isLoadingData(false);
            };

            var renderDeals = function () {
                data.isRenderingData(true);
                data.dealsList(getCurrentDealData());
                data.isRenderingData(false);
            };

            var setSubscribers = function () {
                subscribers.push(
                    data.lastDealPosition.subscribe(function () {
                        renderDeals();
                    })
                );

                subscribers.push(
                    data.dealsList.subscribe(function () {
                        checkListSelection();
                    })
                );

                subscribers.push(
                    data.allSelected.subscribe(function (newValue) {
                        if (newValue) {
                            if (data.selection().length !== data.availableSelection().length) {
                                data.selection(ko.toJS(data.availableSelection()));
                            }
                        } else {
                            if (data.selection().length === data.availableSelection().length) {
                                data.selection([]);
                            }
                        }
                    })
                );

                subscribers.push(
                    data.selection.subscribe(function (newValue) {
                        checkListSelection();
                    })
                );
            };

            var onDealsPLChange = function (changes) {
                if (data.isSorting() || data.isRenderingData()) {
                    return;
                }

                data.dealsList(getCurrentDealData());

                if (data.selectedDeals().length) {
                    var deals = changes.dealsObj;
                    for (var i = 0; i < data.selectedDeals().length; i++) {
                        var _deal = deals[data.selectedDeals()[i].orderID];
                        if (_deal) {
                            data.selectedDeals()[i].closingRate(_deal.closingRate);
                            data.selectedDeals()[i].fwPips(_deal.fwPips);
                            data.selectedDeals()[i].spotRate(_deal.spotRate);
                        }
                    }
                }

            };

            var onDealsChange = function (changes) {
                data.dealsList(getCurrentDealData());

                if (!general.isNullOrUndefined(changes.removedItems) && changes.removedItems.length) {
                    var ri = changes.removedItems;
                    for (var i = 0; i < ri.length; i++) {
                        if (data.availableSelection.indexOf(ri[i]) !== -1) {
                            data.availableSelection.remove(ri[i]);
                        }

                        if (data.selection.indexOf(ri[i]) !== -1) {
                            data.selection.remove(ri[i]);
                        }
                    }
                    checkListSelection();
                }

                if (!general.isNullOrUndefined(changes.newItems) && changes.newItems.length) {
                    checkListSelection();
                }
            };

            var checkListSelection = function () {
                data.allSelected(data.selection().length && data.selection().length === data.availableSelection().length);
            };

            var onClientStateChange = function () {
                data.totalEquity(general.toNumeric(csHolderManager.CSHolder.equity));
            };

            var getCurrentDealData = function () {
                data.dealsData = dealsManager.Deals.Sort(data.sortConfig().sortProperty, data.sortConfig().asc);
                var lastDealPos = getLastDealPosition();
                return data.dealsData && data.dealsData.length ? data.dealsData.slice(0, lastDealPos) : [];
            };

            var setSorting = function (enabled, sortBy, ascending) {
                var asc = ascending;
                data.isSorting(true);
                if (data.sortConfig().sortProperty === sortBy) {
                    asc = !data.sortConfig().asc;
                }
                data.sortConfig({
                    sortProperty: sortBy,
                    asc: asc
                });
                data.isSorting(false);
                data.currentRenders(1);
            };

            var onCloseThisDeal = function (deal) {
                var alert = alertsManager.GetAlert(AlertTypes.CloseDealAlert);

                if (alert.DisableThisAlertByCookie()) {
                    var arr = generateArrayForDal([]); // data.deals.Get(deal.orderID)

                    if (arr) {
                        deal.OnCloseDealEnable(false);
                        dalOrders.CloseDeals([arr], onCloseDealReturn);
                    }
                } else {
                    // should come from DB!
                    alertsManager.UpdateAlert(AlertTypes.CloseDealAlert, null,
                        dictionary.GetItem('closeDealConfirmationAlert'),
                        [],
                        {
                            positionNumber: deal.positionNumber,
                            orderDir: deal.orderDir,
                            dealAmount: deal.dealAmount,
                            instrumentID: deal.instrumentID,
                            closingRate: deal.closingRate,
                            deal: deal,
                            caller: publicAPI
                        }
                    );

                    alertsManager.PopAlert(AlertTypes.CloseDealAlert);
                }
            };

            var generateArrayForDal = function (observable) {
                var arr = null;

                if (observable) {
                    var tmpDealObj = ko.toJS(observable);
                    arr = vmHelpers.GeneratePrimitiveTypeArray(tmpDealObj);
                }

                return arr;
            };

            var onCloseDealReturn = function (result, callerID, requestData) {
                updateProcessingObservables(result, callerID, { requestData: requestData });
            };

            var onCloseDealsReturn = function (result, callerID, requestData) {
                updateProcessingObservables(result, callerID, general.extendType({ isCloseMultipleDealsCall: true }, { requestData: requestData }));
            };

            var updateProcessingObservables = function (result, callerID, args) {
                baseOrder.OnActionReturn(result, callerID, null, args);
                data.selectedDeals([]);
                data.onCloseDealsEnable(true);
            };

            var getSelectedInstrument = function () {
                return instrumentsManager.GetUserDefaultInstrumentId();
            };

            var isActiveQuote = function () {
                var quote = quotesVM.GetQuote(getSelectedInstrument());
                return !general.isNullOrUndefined(quote) && quote.isActiveQuote();
            };

            var hasRecords = ko.pureComputed(function () {
                return 0 < data.dealsList().length;
            });

            var updateVdColumnVisibility = function (value) {
                data.hasValueDateColumn(value);
            };


            var toObservableRow = function (_deal) {
                var row = {};

                row.positionNumber = _deal.positionNumber;
                row.exeTime = _deal.exeTime;
                row.instrumentID = _deal.instrumentID;
                row.orderDir = _deal.orderDir;
                row.dealAmount = _deal.orderDir == eOrderDir.Sell ? _deal.sellAmount : _deal.buyAmount;
                row.dealType = _deal.dealType;

                row.buyAmount = _deal.buyAmount;
                row.buySymbolID = _deal.buySymbolID;

                row.sellAmount = _deal.sellAmount;
                row.sellSymbolID = _deal.sellSymbolID;

                row.orderRate = _deal.orderRate;
                row.orderRateNumeric = general.toNumeric(_deal.orderRate);
                row.valueDate = self.getValueDate(_deal);

                row.slRate = ko.observable(_deal.slRate == 0 ? cEmptyRate : _deal.slRate);
                row.typeSL = dictionary.GetItem("limtype1_short");

                row.tpRate = ko.observable(_deal.tpRate == 0 ? cEmptyRate : _deal.tpRate);
                row.typeTP = dictionary.GetItem("limtype2_short");

                row.orderID = _deal.orderID;
                row.prevSpotRate = ko.observable(_deal.spotRate);
                row.spotRate = ko.observable(_deal.spotRate);
                row.fwPips = ko.observable(_deal.fwPips);
                row.hasAdditionalPL = ko.observable(_deal.hasAdditionalPL);
                row.prevClosingRate = ko.observable(_deal.closingRate);
                row.closingRate = ko.observable(_deal.closingRate);
                row.closeDealRate = ko.computed(function () {
                    return row.closingRate() ? row.closingRate().substring(0, row.closingRate().length - 2) : '0.';
                });
                row.closeDealRatePips = ko.computed(function () {
                    return row.closingRate() ? row.closingRate().substring(row.closingRate().length - 2, row.closingRate().length) : '00';
                });
                row.dialogTitleSLDealLimit = ko.computed(function () {
                    return (!general.isNumber(row.slRate()) || row.slRate() == 0) ? dictionary.GetItem('AddStopLossTitle', 'dialogsTitles', '') : dictionary.GetItem('UpdateRemoveStopLossTitle', 'dialogsTitles', '');
                });
                row.dialogTitleTpDealLimit = ko.computed(function () {
                    return (!general.isNumber(row.tpRate()) || row.tpRate() == 0) ? dictionary.GetItem('AddTakeProfitTitle', 'dialogsTitles', '') : dictionary.GetItem('UpdateRemoveTakeProfitTitle', 'dialogsTitles', '');
                });

                row.pl = ko.observable(!general.isStringType(_deal.pl) ? Number.toStr(_deal.pl) : _deal.pl);
                row.plNumeric = general.toNumeric(_deal.pl);
                row.plSign = ko.observable(Math.floor(general.toNumeric(_deal.pl)).sign());

                row.commission = ko.observable(!general.isStringType(_deal.commission) ? Number.toStr(_deal.commission) : _deal.commission);
                row.spreadDiscount = ko.observable(!general.isStringType(_deal.spreadDiscount) ? Number.toStr(_deal.spreadDiscount) : _deal.spreadDiscount);
                row.spreadDiscountConverted = ko.observable(!general.isStringType(_deal.spreadDiscount) ? Number.toStr(_deal.spreadDiscount) : _deal.spreadDiscount);
                row.grosspl = ko.computed(function () {
                    if (data.quoteForAccountCcyToUsdCcy() && customer.prop.selectedCcyId() !== customer.prop.baseCcyId()) {
                        var spreadDiscount = amountConverter.Convert(
                            general.toNumeric(row.spreadDiscount()),
                            data.quoteForAccountCcyToUsdCcy()
                        );

                        row.spreadDiscountConverted(!general.isStringType(spreadDiscount) ? Number.toStr(spreadDiscount.toFixed(2))
                            : spreadDiscount);
                    }
                    var discount = general.toNumeric(row.spreadDiscountConverted()) === 0 ? general.toNumeric(row.commission()) : -general.toNumeric(row.spreadDiscountConverted());

                    var grossPl = general.toNumeric(row.pl()) + discount;
                    return grossPl.toFixed(2);
                });

                row.OnCloseDealEnable = ko.observable(true);
                row.OnCloseDealClick = onCloseThisDeal;
                row.ThisDealSwipe = ko.observable(true);
                row.lastUpdate = ko.observable(quotesVM.GetQuote(_deal.instrumentID).dataTime());
                row.quoteIsActive = ko.observable(false);
                row.isStock = ko.observable(instrumentsManager.IsInstrumentStock(_deal.instrumentID));

                row.adj = ko.computed(function () {
                    if (customer.prop.dealPermit == eDealPermit.Islamic) {
                        return false;
                    }

                    if (_deal.valueDate.length === 0) {
                        return true;
                    }

                    return _deal.positionNumber != _deal.orderID;
                });

                row.isChecked = ko.observable(false);
                row.hasAdditionalPL = ko.observable(Number(_deal.additionalPL) !== 0);

                return row;
            };

            _prepareData();

            var publicAPI = {
                Init: init,
                OnCloseDealsEnable: data.onCloseDealsEnable,
                IsLoadingData: data.isLoadingData,
                IsRenderingData: data.isRenderingData,
                LastDealPosition: data.lastDealPosition,
                CurrentRenders: data.currentRenders,
                TotalEquity: data.totalEquity,
                SortProperties: data.sortConfig,
                SetSorting: setSorting,
                FlagsState: data.flagsState,
                HasValueDateColumn: data.hasValueDateColumn,
                HasRecords: hasRecords,
                Selection: data.selection,
                AvailableSelection: data.availableSelection,
                AllSelected: data.allSelected,
                QuoteForAccountCcyToUsdCcy: data.quoteForAccountCcyToUsdCcy,
                CloseMultipleDeals: closeMultipleDeals,
                CloseThisDeal: onCloseThisDeal,
                OnCloseDealReturn: onCloseDealReturn,
                Positions: data.positions,
                GetSelectedInstrument: getSelectedInstrument,
                IsActiveQuote: isActiveQuote,
                DealPermissions: dealPermissions,
                DealsList: data.dealsList,
                UpdateVdColumnVisibility: updateVdColumnVisibility,
                TotalOpenedDeals: data.totalOpenedDeals
            };

            return publicAPI;
        });

        return OpenDealsModule;
    }
);


define('deviceviewmodels/OpenDealsViewModel',[
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"deviceviewmodels/OpenDealsModule",
	"deviceviewmodels/OpenDealsModule",
	"managers/viewsmanager",
	"Dictionary",
	"viewmodels/dialogs/DialogViewModel",
	"managers/PrintExportManager",
	"StateObject!Positions",
	"StateObject!DealsTabs",
	"configuration/initconfiguration",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		openDealsModule = require("deviceviewmodels/OpenDealsModule"),
		customer = require("initdatamanagers/Customer"),
		ViewsManager = require("managers/viewsmanager"),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel"),
		Dictionary = require("Dictionary"),
		printExportManager = require("managers/PrintExportManager"),
		positionsCache = require("StateObject!Positions"),
		openDealsGridSettings = require("configuration/initconfiguration").OpenDealsConfiguration;

	var Model = new openDealsModule();
	Model.Init(openDealsGridSettings);
	var OpenDealsViewModel = general.extendClass(KoComponentViewModel, function OpenDealsViewModelClass(params) {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = parent.Data,
			subscribers = [];

		function init(settings) {
			parent.init.call(self, settings);

			if (settings.isHeaderComponent) {
				return;
			}

			setObservables();
			setSubscribers();
			initExport();
		}

		function setObservables() {
			var ofhPositionNumber = positionsCache.set("ofhPositionNumber", null),
				plPositionNumber = positionsCache.set("plPositionNumber", null);

			data.selectedOFHPositionNumber = ko.observable(ofhPositionNumber);
			data.selectedPLPositionNumber = ko.observable(plPositionNumber);
		}

		function setSubscribers() {
			subscribers.push({
				dispose: positionsCache.subscribe("ofhPositionNumber", selectedOFHPositionNumberUpdater),
			});
			subscribers.push({
				dispose: positionsCache.subscribe("plPositionNumber", selectedPLPositionNumberUpdater),
			});
		}

		function selectedOFHPositionNumberUpdater(ofhPositionNumber) {
			data.selectedOFHPositionNumber(ofhPositionNumber);
		}

		function selectedPLPositionNumberUpdater(plPositionNumber) {
			data.selectedPLPositionNumber(plPositionNumber);
		}

		function initExport() {
			self.subscribeTo(Model.HasRecords, monitorData);

			monitorData(Model.HasRecords());
		}

		function monitorData(hasData) {
			ko.postbox.publish("printableDataAvailable", {
				dataAvailable: hasData,
				viewType: ViewsManager.ActiveFormType(),
				viewModel: "OpenDealsViewModel",
			});
		}

		function closeDeal(position) {
			if (
				!position.quoteIsActive() ||
				Model.FlagsState.isMarketClosed() ||
				!window.componentsLoaded() ||
				printExportManager.IsWorkingNow()
			) {
				return;
			}
			var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
				dialogClass = "deal-slip" + (revisedSlip ? " revised-slip" : " closeDeal"),
				dialogTitle = !revisedSlip ? Dictionary.GetItem("CloseDealRequest", "dialogsTitles", " ") + ":" : "";

			DialogViewModel.open(
				eDialog.CloseDeal,
				{
					title: dialogTitle,
					customTitle: "CloseDealPosNum",
					width: 555,
					persistent: false,
					dialogClass: dialogClass,
				},
				eViewTypes.vCloseDeal,
				{
					orderId: position.orderID,
					isStartNavigator: false,
				}
			);
		}

		function setComponentReady() {
			if (general.isFunctionType(params.SetComponentReady)) {
				params.SetComponentReady(eViewTypes.vOpenDeals);
			}
		}

		function dispose() {
			positionsCache.unset("ofhPositionNumber");
			positionsCache.unset("plPositionNumber");

			while (subscribers.length > 0) {
				subscribers.pop().dispose();
			}

			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			model: Model,
			closeDeal: closeDeal,
			SetComponentReady: setComponentReady,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new OpenDealsViewModel(params);

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

/// menus_mainmenu prereqs

define('viewmodels/menuviewmodel',[
	"knockout",
	"modules/permissionsmodule",
	"handlers/general",
	"devicemanagers/ViewModelsManager",
	"generalmanagers/StatesManager",
	"initdatamanagers/Customer",
	"Dictionary",
	"configuration/initconfiguration",
	"cachemanagers/PortfolioStaticManager",
	"customEnums/ViewsEnums",
	"enums/enums",
], function (
	ko,
	permissionsModule,
	general,
	viewModelsManager,
	statesManager,
	customer,
	Dictionary,
	InitConfiguration,
	portfolioManager
) {
	var SubMenuModel = function () {
		var isActive = ko.observable(false);

		return {
			isActive: isActive,
			show: function () {
				isActive(true);
			},
			hide: function () {
				isActive(false);
			},
		};
	};

	var tradingPermissions = {},
		customerProperties = {},
		forexCfdMenu = new SubMenuModel(),
		toolsMenu = new SubMenuModel(),
		educationMenu = new SubMenuModel(),
		fundsMenu = new SubMenuModel(),
		reportsMenu = new SubMenuModel(),
		tradingMenu = new SubMenuModel();

	var pendingWithdrawals = ko.observable(portfolioManager.Portfolio.pendingWithdrawals);

	var goToMainPage = function () {
		viewModelsManager.VManager.SwitchViewVisible(customer.prop.mainPage, {});
	};

	var init = function () {
		registerObservableStartUpEvent();
		registerOnPendingWithdrawalsChange();
		customerProperties = {
			mainPage: customer.prop.mainPage,
			isOnlyForexCustomer: customer.prop.tradingPermissions.isOnlyForexCustomer,
			hasTransactionsReport: customer.prop.tradingPermissions.hasTransactionsReport,
			isDemo: customer.prop.isDemo,
		};

		tradingMenu.tradingClick = function () {
			switchView(customerProperties.mainPage, null, "HeaderMenu");
		};
		tradingMenu.activeCss = ko.pureComputed(function () {
			return viewModelsManager.VManager.ActiveFormType() === customerProperties.mainPage;
		});

		toolsMenu.activeCss = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.AdvinionChart ||
				viewModelsManager.VManager.ActiveFormType() == eForms.TradingSignals
			);
		});

		reportsMenu.reportsVisible = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.Statement ||
				viewModelsManager.VManager.ActiveFormType() == eForms.ActivityLog ||
				viewModelsManager.VManager.ActiveFormType() == eForms.TransactionsReport
			);
		});

		reportsMenu.accountStatementClick = function () {
			switchView(eForms.Statement, null, "HeaderMenu");
		};

		reportsMenu.activityLogClick = function () {
			switchView(eForms.ActivityLog, null, "HeaderMenu");
		};

		reportsMenu.transactionsClick = function () {
			switchView(eForms.TransactionsReport, null, "HeaderMenu");
		};

		toolsMenu.chartClick = function () {
			switchView(eForms.AdvinionChart, null, "HeaderMenu");
		};

		toolsMenu.tradingSignalsClick = function () {
			switchView(eForms.TradingSignals, null, "HeaderMenu");
		};

		toolsMenu.priceAlertMenuClick = function () {
			ko.postbox.publish("price-alerts-menu-view");
			switchView(eForms.PriceAlerts, null, "HeaderMenu");
		};

		educationMenu.educationVisible = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.Tutorials ||
				viewModelsManager.VManager.ActiveFormType() == eForms.EducationalTutorials
			);
		});

		educationMenu.tutorialsClick = function () {
			switchView(eForms.Tutorials, null, "HeaderMenu");
		};

		educationMenu.educationTutorialsClick = function () {
			switchView(eForms.EducationalTutorials, null, "HeaderMenu");
		};

		educationMenu.eduSubVisible = function () {
			// this is a bug with default value, so we abuse the bug
			return Dictionary.GetItem("liForexTutorial2", "menus_mainmenu", "0") !== "";
		};

		educationMenu.tutorialsVisible = function () {
			// this is a bug with default value, so we abuse the bug
			return Dictionary.GetItem("liEducationalForexTutorial2", "menus_mainmenu", "0") !== "";
		};

		educationMenu.allVisible = function () {
			return educationMenu.eduSubVisible() && educationMenu.tutorialsVisible();
		};

		fundsMenu.fundsVisible = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.Deposit ||
				viewModelsManager.VManager.ActiveFormType() == eForms.Withdrawal
			);
		});

		fundsMenu.depositsClick = function () {
			switchView(eForms.Deposit, null, "HeaderMenu");
		};

		fundsMenu.withdrawalsClick = function () {
			switchView(
				eForms.Withdrawal,
				InitConfiguration.WithdrawalConfiguration.wizardConfig.useBrowserHistory
					? { step: eWithdrawalSteps.setAmount }
					: null,
				"HeaderMenu"
			);
		};

		fundsMenu.pendingWithdrawalsClick = function () {
			switchView(eForms.PendingWithdrawal, null, "HeaderMenu");
		};
	};

	var tradesVisbile = function () {
		return ko.computed(function () {
			return (
				viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vOpenDeals).visible() ||
				viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vClosedDealsSummaries).visible() ||
				viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vLimits).visible()
			);
		});
	};

	function simpleVisible(viewType) {
		if (general.isDefinedType(window.DialogViewModel) && window.DialogViewModel.getCurrentView() == viewType) {
			return false;
		}

		return viewModelsManager.VManager.GetActiveFormViewProperties(viewType).visible;
	}

	var registerObservableStartUpEvent = function () {
		viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vMenu).visible.subscribe(function (
			isVisible
		) {
			if (!isVisible) {
				stop();
			} else {
				start();
			}
		});
	};

	var start = function () {};

	var stop = function () {
		unRegisterOnPendingWithdrawalsChange();
	};

	var clientQuestionnaireVisible = ko.pureComputed(function () {
		return statesManager.States.CddStatus() !== eCDDStatus.NotRequired && !customer.prop.isDemo;
	});

	var forexAndCfdVisible = function () {
		return ko.computed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == customer.prop.mainPage ||
				viewModelsManager.VManager.ActiveFormType() == eForms.Deals
			);
		});
	};

	var onClientPortfolioStateChange = function () {
		pendingWithdrawals(parseInt(portfolioManager.Portfolio.pendingWithdrawals));
	};

	var registerOnPendingWithdrawalsChange = function () {
		portfolioManager.OnChange.Add(onClientPortfolioStateChange);
	};

	var unRegisterOnPendingWithdrawalsChange = function () {
		portfolioManager.OnChange.Remove(onClientPortfolioStateChange);
	};

	var switchView = function (viewType, viewArgs, actionSourceTracking) {
		if (actionSourceTracking) {
			ko.postbox.publish("action-source", actionSourceTracking);
		}
		viewModelsManager.VManager.RedirectToForm(viewType, viewArgs || {});
		hide();
	};

	var educationMenuClick = function () {
		var hasForexTutorial = educationMenu.eduSubVisible();
		var hasEducationalForexTutorial = educationMenu.tutorialsVisible();
		if (hasForexTutorial && hasEducationalForexTutorial) return;

		if (hasForexTutorial) switchView(eForms.Tutorials);

		if (hasEducationalForexTutorial) switchView(eForms.EducationalTutorials);
	};

	function hide() {
		forexCfdMenu.hide();
		toolsMenu.hide();
		educationMenu.hide();
		fundsMenu.hide();
		reportsMenu.hide();
		tradingMenu.hide();
	}

	function createViewModel() {
		init();
		return {
			tradingPermissions: tradingPermissions,

			forexAndCfdVisible: forexAndCfdVisible,
			simpleVisible: simpleVisible,
			pendingWithdrawals: pendingWithdrawals,

			clientQuestionnaireVisible: clientQuestionnaireVisible,
			forexCfdMenu: forexCfdMenu,
			toolsMenu: toolsMenu,
			educationMenu: educationMenu,
			fundsMenu: fundsMenu,
			reportsMenu: reportsMenu,
			tradingMenu: tradingMenu,
			EducationMenuClick: educationMenuClick,

			SwitchView: switchView,
			IsDemo: statesManager.States.IsDemo,
			GoToMainPage: goToMainPage,
			customerProperties: customerProperties,
			tradesVisbile: tradesVisbile,
		};
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});

function TDALClosedDeals(ErrorManager, general) {
    function ensurePositionNumber(params) {
        if (general.isEmptyType(params['positionNumber'])) {
            params['positionNumber'] = 0;
        }
    }

    function ensureInstrumentId(params) {
        if (general.isEmptyType(params['instrumentId']) || params['instrumentId'] == Number.MAX_SAFE_INTEGER || params['instrumentId'] === -1) {
            params['instrumentId'] = 0;
        }
    }

    function loadClosedDeals(params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};

        ensurePositionNumber(params);
        ensureInstrumentId(params);

        ajaxer.get(
            "dalClosedDeals/LoadClosedDeals",
            "api/closeddeals/LoadClosedDeals",
            general.urlEncode(params),
            onLoadComplete,
            function () {
                ErrorManager.onError("dalClosedDeals/loadClosedDealsSummaries", "", eErrorSeverity.medium);
            }
        );
    }

    function loadClosedDealsSummaries(params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};

        ensurePositionNumber(params);
        ensureInstrumentId(params);

        ajaxer.get(
            "dalClosedDeals/loadClosedDealsSummaries",
            "api/closeddeals/LoadClosedDealsSummaries",
            general.urlEncode(params),
            onLoadComplete,
            function () {
                ErrorManager.onError("dalClosedDeals/loadClosedDealsSummaries", "", eErrorSeverity.medium);
            }
        );
    }

    function loadClosedDealsSummariesWithThreshold(params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};

        ensurePositionNumber(params);
        ensureInstrumentId(params);

        ajaxer.get(
            "dalClosedDeals/loadClosedDealsSummariesWithThreshold",
            "api/closeddeals/LoadClosedDealsSummariesWithThreshold",
            general.urlEncode(params),
            onLoadComplete,
            function () {
                ErrorManager.onError("dalClosedDeals/loadClosedDealsSummaries", "", eErrorSeverity.medium);
            }
        );
    }

    function loadRolledOverHistory(filter, onLoadComplete) {
        var ajaxer = new TAjaxer(),
            positionNumber = filter.PositionNumber,
            page = filter.Page,
            pageSize = filter.PageSize,
            params = "positionNumber=" + positionNumber + "&" +
                "page=" + page + "&" +
                "pageSize=" + pageSize;

        ajaxer.get(
            "TDALHistoricalData/loadRolledOverHistory",
            "api/closeddeals/LoadRolledOverHistory",
            params,
            onLoadComplete,
            function () {
                ErrorManager.onError("TDALHistoricalData/loadRolledOverHistory", "", eErrorSeverity.medium);
            }
        );
    }

    return {
        LoadClosedDeals: loadClosedDeals,
        LoadRolledOverHistory: loadRolledOverHistory,
        LoadClosedDealsSummaries: loadClosedDealsSummaries,
        LoadClosedDealsSummariesWithThreshold: loadClosedDealsSummariesWithThreshold
    };
}
;
define("dataaccess/dalClosedDeals", ["generalmanagers/ErrorManager","handlers/general"], (function (global) {
    return function () {
        var ret, fn;
       fn = function (em, general) {
				return this.TDALClosedDeals(em, general);
			};
        ret = fn.apply(global, arguments);
        return ret || global.TDALClosedDeals;
    };
}(this)));

define(
    'viewmodels/Deals/ClosedDealsModule',
    [
        'require',
        'knockout',
        'initdatamanagers/Customer',
        'configuration/initconfiguration',
        'managers/instrumentTranslationsManager',
        'initdatamanagers/SymbolsManager',
        'viewmodels/ViewModelBase',
        'dataaccess/dalClosedDeals',
        'FxNet/LogicLayer/Deal/DealPermissions',
        'initdatamanagers/InstrumentsManager',
        'handlers/general'
    ],
    function ClosedDealsModuleDef(require) {
        var ko = require('knockout'),
            customer = require('initdatamanagers/Customer'),
            closedDealsGridSettings = require('configuration/initconfiguration').ClosedDealsConfiguration,
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            ViewModelBase = require('viewmodels/ViewModelBase'),
            dalClosedDeals = require("dataaccess/dalClosedDeals"),
            dealPermissions = require('FxNet/LogicLayer/Deal/DealPermissions'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            general = require('handlers/general');

        function ClosedDealsModule() {
            var self,
                defaultPageSize = 40,
                inheritedInstance = general.clone(ViewModelBase),
                viewData = {},
                filter = {
                    positionNumber: ko.observable(),
                    instrumentId: ko.observable(),
                    instrument: ko.observable(),
                    from: ko.observable(),
                    to: ko.observable(),
                    page: ko.observable(1),
                    pagesize: defaultPageSize
                },
                dsColumns = {
                    idField: "positionNumber",
                    columns: [
                        {
                            name: "rowNumber",
                            transform: function (value, rIndex) {
                                return rIndex;
                            }
                        },
                        {
                            name: "positionNumber",
                            dataIndex: eClosedDealsBase.positionNumber
                        },
                        {
                            name: "orderID",
                            dataIndex: eClosedDealsBase.orderID
                        },
                        {
                            name: "instrumentID",
                            dataIndex: eClosedDealsBase.instrumentID
                        },
                        {
                            name: "instrumentName",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID],
                                    dbEnglishName = rawRecord[eClosedDealsBase.instrumentEnglishName];

                                var instrumentName = instrumentTranslationsManager.Short(instrumentId);
                                if (!general.isEmptyValue(instrumentName)) {
                                    return instrumentName;
                                } else {
                                    return dbEnglishName;
                                }
                            }
                        },
                        {
                            name: "specialFontStart",
                            dataIndex: eClosedDealsBase.specialFontStart
                        },
                        {
                            name: "specialFontLength",
                            dataIndex: eClosedDealsBase.specialFontLength
                        },
                        {
                            name: "buyAmount",
                            dataIndex: eClosedDealsBase.buyAmount
                        },
                        {
                            name: "buySymbol",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var symbol = symbolsManager.ExtractSymbolsNames(rawRecord[eClosedDealsBase.instrumentID]);

                                if (symbol) {
                                    if (rawRecord[eClosedDealsBase.orderDir] == eOrderDir.Buy) {
                                        return symbol.base;
                                    } else {
                                        return symbol.other;
                                    }
                                }

                                return "";
                            }
                        },
                        {
                            name: "sellAmount",
                            dataIndex: eClosedDealsBase.sellAmount
                        },
                        {
                            name: "sellSymbol",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var symbol = symbolsManager.ExtractSymbolsNames(rawRecord[eClosedDealsBase.instrumentID]);

                                if (symbol) {
                                    if (rawRecord[eClosedDealsBase.orderDir] == eOrderDir.Buy) {
                                        return symbol.other;
                                    } else {
                                        return symbol.base;
                                    }
                                }

                                return "";
                            }
                        },
                        {
                            name: "orderDir",
                            dataIndex: eClosedDealsBase.orderDir
                        },
                        {
                            name: "dealAmount",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                if (rawRecord[eClosedDealsBase.orderDir] == eOrderDir.Sell) {
                                    return rawRecord[eClosedDealsBase.sellAmount];
                                } else {
                                    return rawRecord[eClosedDealsBase.buyAmount];
                                }
                            }
                        },
                        {
                            name: "dealType",
                            dataIndex: eClosedDealsBase.dealType
                        },
                        {
                            name: "valueDate",
                            dataIndex: eClosedDealsBase.valueDate
                        },
                        {
                            name: "positionStart",
                            dataIndex: eClosedDealsSummaries.positionStart
                        },
                        {
                            name: "positionStartFormatted",
                            dataIndex: eClosedDealsSummaries.positionStart,
                            transform: function (value) {
                                return formatDateString(value);
                            }
                        },
                        {
                            name: "positionStartNormalized",
                            dataIndex: eClosedDealsSummaries.positionStart,
                            transform: function (value) {
                                return normalizeShortDateString(value);
                            }
                        },
                        {
                            name: "executionTime",
                            dataIndex: eClosedDealsBase.executionTime
                        },
                        {
                            name: "executionTimeFormatted",
                            dataIndex: eClosedDealsBase.executionTime,
                            transform: function (value) {
                                return formatDateString(value);
                            }
                        },
                        {
                            name: "executionTimeNormalized",
                            dataIndex: eClosedDealsBase.executionTime,
                            transform: function (value) {
                                return normalizeShortDateString(value);
                            }
                        },
                        {
                            name: "forwardPips",
                            dataIndex: eClosedDealsBase.forwardPips
                        },
                        {
                            name: "originalPosNum",
                            dataIndex: eClosedDealsSummaries.originalPosNum
                        },
                        {
                            name: "orderRateOpen",
                            dataIndex: eClosedDealsSummaries.orderRateOpen,
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID],
                                    decimals = rawRecord[eClosedDealsBase.decimalDigit];

                                return Format.toRate(value, true, instrumentId, decimals);
                            }
                        },
                        {
                            name: "orderRateOpenNumeric",
                            dataIndex: eClosedDealsSummaries.orderRateOpen,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "orderRateClosed",
                            dataIndex: eClosedDealsSummaries.orderRateClosed,
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID],
                                    decimals = rawRecord[eClosedDealsBase.decimalDigit];

                                return Format.toRate(value, true, instrumentId, decimals);
                            }
                        },
                        {
                            name: "orderRateClosedNumeric",
                            dataIndex: eClosedDealsSummaries.orderRateClosed,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "pl",
                            dataIndex: eClosedDealsSummaries.pl
                        },
                        {
                            name: "plAsNumber",
                            dataIndex: eClosedDealsSummaries.pl,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "plCCY",
                            dataIndex: eClosedDealsSummaries.plCCY
                        },
                        {
                            name: "plCCYAsNumber",
                            dataIndex: eClosedDealsSummaries.plCCY,
                            transform: function (value) {
                                return general.toNumeric(value);
                            }
                        },
                        {
                            name: "plSymbol",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var symbol = symbolsManager.ExtractSymbolsNames(rawRecord[eClosedDealsBase.instrumentID]);

                                if (symbol) {
                                    return symbol.other;
                                }

                                return "";
                            }
                        },
                        {
                            name: "hasAdditionalPL",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                return Number(rawRecord[eClosedDealsSummaries.additionalPL]) !== 0;
                            }
                        },
                        {
                            name: "plSign",
                            dataIndex: eClosedDealsSummaries.pl,
                            transform: function (value) {
                                return value.sign();
                            }
                        },
                        {
                            name: "adj",
                            dataIndex: eClosedDealsSummaries.originalPosNum,
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                if (customer.prop.dealPermit == eDealPermit.Islamic) {
                                    return false;
                                }

                                if (!rawRecord[eClosedDealsBase.valueDate]) {
                                    return true;
                                }

                                return general.isPos(value);
                            }
                        },
                        {
                            name: "instrumentShortName",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                return instrumentTranslationsManager.Short(rawRecord[eClosedDealsBase.instrumentID]);
                            }
                        },
                        {
                            name: "spreadDiscount",
                            dataIndex: eClosedDealsSummaries.spreadDiscount
                        },
                        {
                            name: "commission",
                            dataIndex: eClosedDealsSummaries.commission
                        },
                        {
                            name: "grossPL",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                if (dealPermissions.CustomerDealPermit() === eDealPermit.ZeroSpread) {
                                    return (general.toNumeric(rawRecord[eClosedDealsSummaries.pl]) + general.toNumeric(rawRecord[eClosedDealsSummaries.commission])).toFixed(2).toString();
                                }

                                if (dealPermissions.HasSpreadDiscount()) {
                                    return (general.toNumeric(rawRecord[eClosedDealsSummaries.pl]) - general.toNumeric(rawRecord[eClosedDealsSummaries.spreadDiscount])).toFixed(2).toString();
                                }

                                return rawRecord[eClosedDealsSummaries.pl];
                            }
                        },
                        {
                            name: "isStock",
                            transform: function (value, rIndex, cIndex, rawRecord) {
                                var instrumentId = rawRecord[eClosedDealsBase.instrumentID];

                                return instrumentsManager.IsInstrumentStock(instrumentId);
                            }
                        }
                    ],
                    statusField: "status",
                    totalField: "totalItems",
                    dataField: "closedDealSummary",
                    pagination: {
                        pagesPerPage: 5,
                        pageIndexField: "page",
                        pageSizeField: "pagesize"
                    },
                    Filter: filter,
                    DAL: {
                        reference: dalClosedDeals.LoadClosedDealsSummariesWithThreshold,
                        callerName: "ClosedDealsViewModel/getLastClosedDeals",
                        errorSeverity: eErrorSeverity.medium
                    }
                };

            var dataSet = new ObservableDataSet(ko, general, dsColumns, { enabled: true, sortProperty: 'executionTimeNormalized', asc: false });

            function init(customSettings) {
                self = this;
                inheritedInstance.setSettings(self, customSettings);

                setObservables();
                setComputables();
                setExtenders();

                setFilterDefaults();

                dataSet.Init();
            }

            function setObservables() {
                viewData.isOpenedInDialog = ko.observable(false);
                viewData.ccyPairs = ko.observableArray([]);
            }

            function setComputables() {
                viewData.isApplyButtonEnabled = ko.computed(function () {
                    return !dataSet.IsLoadingData();
                }, self);
            }

            function setExtenders() {
                filter.positionNumber = filter.positionNumber.extend({
                    toNumericLength: {
                        ranges: [{
                            from: 0, to: Number.MAX_SAFE_INTEGER, decimalDigits: 0
                        }]
                    }
                });

                filter.from.extend({
                    validation: {
                        validator: function (v) {
                            return general.str2Date(v) <= general.str2Date(filter.to());
                        }
                    }
                });

                filter.to.extend({
                    validation: {
                        validator: function (v) {
                            return general.str2Date(v) >= general.str2Date(filter.from());
                        }
                    }
                });
            }

            function setFilterDefaults() {
                filter.positionNumber("");
                filter.instrumentId(Number.MAX_SAFE_INTEGER);
                filter.instrument();
                filter.from((new Date()).AddWeeks(-1).ExtractDateUTC());
                filter.to((new Date()).ExtractDateUTC());
                filter.page(1);

                filter.pagesize = inheritedInstance.getSettings(self).pageSize || filter.pagesize;

                if (inheritedInstance.getSettings(self).threshold) {
                    filter.threshold = inheritedInstance.getSettings(self).threshold;
                }
            }

            function filterIsValid() {
                return filter.from.isValid() && filter.to.isValid();
            }

            function applyFilter(useDefault) {
                if (viewData.isApplyButtonEnabled()) {
                    if (useDefault || !filterIsValid()) {
                        setFilterDefaults()
                    }

                    dataSet.ApplyFilter();
                }
            }

            function normalizeShortDateString(value) {
                var arr = value.split(' ');
                var datePartArray = arr[0].split('/');

                arr[0] = datePartArray[2] + datePartArray[1] + datePartArray[0];

                var retString = arr.join('').replace(/[/\|:| ]/g, '');
                return retString;
            }

            function formatDateString(dateString) {
                var splitDate = general.SplitDateTime(dateString);

                return splitDate.date + " " + splitDate.time;
            }

            return {
                init: init,
                DataSet: dataSet,
                HasRecords: dataSet.HasRecords,
                ViewData: viewData,
                ClosedDeals: dataSet.DataRows,
                Filter: {
                    Position: filter.positionNumber,
                    InstrumentId: filter.instrumentId,
                    Instrument: filter.instrument,
                    From: filter.from,
                    To: filter.to
                },
                ApplyFilter: applyFilter,
                DsColumns: dsColumns,
                SetSorting: dataSet.SetSorting,
                SortProperties: dataSet.SortProperties,
                DealPermissions: dealPermissions
            };
        }

        var instance = new ClosedDealsModule();

        instance.init(closedDealsGridSettings);

        return instance;
    }
);

define(
    'deviceviewmodels/AccountClosedDealsViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'viewmodels/Deals/ClosedDealsModule',
        'devicemanagers/ViewModelsManager',
        'configuration/initconfiguration'
    ],
    function AccountClosedDealsDef(require) {
        var general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            closedDealsModule = require('viewmodels/Deals/ClosedDealsModule'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            initConfiguration = require("configuration/initconfiguration").ClosedDealsConfiguration;

        var AccountClosedDealsViewModel = general.extendClass(koComponentViewModel, function AccountClosedDealsClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                originalFilter;

            function init() {
                parent.init.call(self);

                initFilter();

                closedDealsModule.ApplyFilter();
            }

            function initFilter() {
                var posNum = viewModelsManager.VManager.GetViewArgsByKeyName(eViewTypes.vClosedDealsDialog, 'posNum'),
                    closedDealsModuleFilter = closedDealsModule.Filter;

                if (general.isDefinedType(posNum)) {
                    originalFilter = {
                        position: closedDealsModuleFilter.Position(),
                        instrument: closedDealsModuleFilter.Instrument(),
                        from: closedDealsModuleFilter.From(),
                        to: closedDealsModuleFilter.To()
                    }

                    closedDealsModule.ViewData.isOpenedInDialog(true);
                    closedDealsModuleFilter.Position(posNum);
                    closedDealsModuleFilter.InstrumentId(Number.MAX_SAFE_INTEGER);
                    closedDealsModuleFilter.Instrument();
                    closedDealsModuleFilter.From("");
                    closedDealsModuleFilter.To("");
                }
            }

            function dispose() {
                if (originalFilter) {
                    closedDealsModule.Filter.Position(originalFilter.position);
                    closedDealsModule.Filter.Instrument(originalFilter.instrument);
                    closedDealsModule.Filter.From(originalFilter.from);
                    closedDealsModule.Filter.To(originalFilter.to);

                    closedDealsModule.ViewData.isOpenedInDialog(false);
                }

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                model: closedDealsModule,
                scrollMaxVisible: initConfiguration.scrollMaxVisible,
                IsPrintingNow: function () { return false; }
            };
        });

        var createViewModel = function (params) {
            var viewModel = new AccountClosedDealsViewModel(params);
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


define("fp-web", function(){});

//# sourceMappingURL=fp-web.js.map