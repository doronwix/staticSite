define(["knockout"], function (ko) {
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
