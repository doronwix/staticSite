/*eslint-disable no-alert, no-confirm */
/* eslint no-extend-native: 0 */
define(["require", "handlers/Logger", "initdatamanagers/Customer", "handlers/RequireError"], function (require) {
	var Logger = require("handlers/Logger"),
		Customer = require("initdatamanagers/Customer"),
		RequireError = require("handlers/RequireError");

	function ErrorManager() {
		// Extend Error prototype
		Error.prototype.getFullExceptionMessage = function () {
			return this.message + "\nStackTrace: " + (this.stack ? this.stack : "");
		};

		var onException = function (msg, url, lineNumber, columnNumber, error) {
			// forbidden access are handled by the application
			if (error && error.httpStatus === 403) {
				return true;
			}

			if (error && typeof error.handler === "function") {
				// This is a custom error
				error.handler();

				return true;
			}

			handleUnknownException(msg, error);

			throw error;
		};

		var handleUnknownException = function (msg, error) {
			if (typeof systemInfo !== "undefined" && typeof Logger !== "undefined") {
				var blackList = systemInfo.clientApplicationParams
					? systemInfo.clientApplicationParams[eClientParams.JsErrorBlacklistRegex] || ""
					: "";

				var hasBlackList = Boolean(blackList);
				var blacklistReObj = new RegExp(blackList);

				// log the UnknownError if the error is not in the blacklist
				if (hasBlackList && !blacklistReObj.test(msg) && !blacklistReObj.test(error.message)) {
					Logger.log("UnknownError", error.getFullExceptionMessage());
				}
			}
		};

		var onError = function (functionName, errMsg, severityLevel) {
			if (errMsg === "http403") {
				window.alert("Access forbidden!");
			} else {
				var error = {
					Message: errMsg,
					AccountNumber: Customer.prop.accountNumber,
					UserAgent: window.navigator.userAgent,
				};

				Logger.error(functionName, JSON.stringify(error), function () {}, severityLevel);
			}
		};

		function onWarning(source, warningMessage) {
			var warning = {
				Message: warningMessage,
				AccountNumber: Customer.prop.accountNumber,
				UserAgent: window.navigator.userAgent,
			};

			Logger.warn(source, JSON.stringify(warning));
		}

		var getFullExceptionMessage = function (ex) {
			return ex.getFullExceptionMessage();
		};

		/*
		 * Utility function to create custom Error types
		 *
		 * To create a custom error type, derived from Error JS object
		 *
		 * @param {string} name an unique name for the newly custom error type
		 * @param {function} handler a function used to handle the created type of error
		 *
		 * var myCustomError = ErrorManager.createErrorType("CustomError", function() {
		 *     // this keyword refers to the current error instance
		 *     console.log(this.message);
		 * });
		 *
		 * throw new myCustomError("This is a custom error");
		 *
		 */
		var createErrorType = function (name, handler) {
			function BaseError(message) {
				this.name = name;
				this.message = message;

				if (!Error.captureStackTrace) {
					this.stack = new Error().stack;
				} else {
					Error.captureStackTrace(this, this.constructor);
				}
			}

			BaseError.prototype = Object.create(Error.prototype);
			BaseError.prototype.name = name;
			BaseError.prototype.constructor = BaseError;
			BaseError.prototype.handler = typeof handler === "function" ? handler : function () {};

			return BaseError;
		};

		function onRequireError(error) {
			if (error.requireType === "mismatch") {
				throw new RequireError("Mismatched anonymous define() module", error);
			}

			throw error;
		}

		return {
			getFullExceptionMessage: getFullExceptionMessage,
			onRequireError: onRequireError,
			onError: onError,
			onWarning: onWarning,
			onException: onException,
			createErrorType: createErrorType,
		};
	}

	var module = (window.ErrorManager = new ErrorManager());

	return module;
});
/*eslint-enable no-alert, no-confirm */
