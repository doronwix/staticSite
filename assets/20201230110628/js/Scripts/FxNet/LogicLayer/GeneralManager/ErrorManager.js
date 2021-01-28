/* eslint no-extend-native: 0 */
define("generalmanagers/ErrorManager", [
	"require",
	"handlers/Logger",
	"handlers/general",
	"devicemanagers/StatesManager",
	"initdatamanagers/Customer",
	"modules/permissionsmodule",
	"global/UrlResolver",
	"handlers/RequireError",
	"StateObject!ViewsManager",
], function (require) {
	var Logger = require("handlers/Logger"),
		general = require("handlers/general"),
		StatesManager = require("devicemanagers/StatesManager"),
		Customer = require("initdatamanagers/Customer"),
		permissionsModule = require("modules/permissionsmodule"),
		UrlResolver = require("global/UrlResolver"),
		RequireError = require("handlers/RequireError"),
		StateObject = require("StateObject!ViewsManager");

	function ErrorManager() {
		// Extend Error prototype
		Error.prototype.getFullExceptionMessage = function () {
			var self = this;

			var messageObj = {
				Message: self.message,
				StackTrace: (self.stack || "")
					.replace(self.message, "")
					.replace(/\n|\r\n/g, " ")
					.replace(/\s\s+/g, " "),
				Form: "",
				Views: [],
				AccountNumber: Customer.prop.accountNumber,
				UserAgent: window.navigator.userAgent,
			};

			if (window.trackingData) {
				var errorTrackingData = window.trackingData.getErrorTrackingData();

				for (var trakingProperty in errorTrackingData) {
					if (errorTrackingData.hasOwnProperty(trakingProperty)) {
						messageObj[trakingProperty] = errorTrackingData[trakingProperty];
					}
				}
			}

			try {
				messageObj.Form = general.urlDecode(window.location.search)["view"] || "";

				if (StateObject) {
					messageObj.Views = StateObject.get("ActiveViews");
				}
			} catch (e) {
				// empty
			}

			return JSON.stringify(messageObj);
		};

		function redirectTologin() {
			window.location.replace(
				UrlResolver.combine(
					UrlResolver.getApplicationRelativePath(),
					"account/login?reason=" + eLoginLogoutReason.errorManager_httpError
				)
			);
		}

		function handleHttpError(error) {
			if (error && (error.httpStatus === 403 || error.httpStatus === 401 || error.httpStatus === 420)) {
				if (permissionsModule.IsRestrictedUser()) {
					return true;
				}

				redirectTologin();

				return true;
			}

			return false;
		}

		function onException(msg, url, lineNumber, columnNumber, error) {
			if (general.isNullOrUndefined(error)) {
				return true;
			}

			if (handleHttpError(error)) {
				return true;
			}

			if (error && typeof error.handler === "function") {
				// This is a custom error
				error.handler();

				return true;
			}

			handleUnknownException(msg, error);

			throw error;
		}

		function handleUnknownException(msg, error) {
			if (typeof systemInfo !== "undefined" && typeof Logger !== "undefined") {
				var blackList = systemInfo.clientApplicationParams
					? systemInfo.clientApplicationParams[eClientParams.JsErrorBlacklistRegex] || ""
					: "";

				var blacklistReObj = new RegExp(blackList, "i");

				var shouldIgnoreMessageLog =
					blackList.length > 0 &&
					((msg.length > 0 && blacklistReObj.test(msg)) ||
						(error && error.message.length > 0 && blacklistReObj.test(error.message)));

				// log the UnknownError if the error is not in the blacklist
				if (!shouldIgnoreMessageLog) {
					var loggedMessage = (error && error.getFullExceptionMessage()) || msg;
					Logger.log("UnknownError", loggedMessage);
				}
			}
		}

		function onError(functionName, strError, severityLevel) {
			severityLevel = severityLevel || eErrorSeverity.low;

			/*if (strError === "http403") {
				StatesManager.PushState(
					StatesManager.StatePropertiesEnum.Forbidden,
					eErrorSeverity.medium,
					StatesManager.StatePropertiesEnum["Forbidden"]
				);
			} else {
				switch (severityLevel) {
					case eErrorSeverity.critical:
						StatesManager.PushState(
							StatesManager.StatePropertiesEnum.ServerErrorStatus,
							eErrorSeverity.critical,
							StatesManager.StatePropertiesEnum["ServerErrorStatus"]
						);
						break;

					case eErrorSeverity.high:
						StatesManager.PushState(
							StatesManager.StatePropertiesEnum.ServerErrorStatus,
							eErrorSeverity.high,
							StatesManager.StatePropertiesEnum["ServerErrorStatus"]
						);
						break;

					case eErrorSeverity.medium:
						StatesManager.PushState(
							StatesManager.StatePropertiesEnum.ServerErrorStatus,
							eErrorSeverity.medium,
							StatesManager.StatePropertiesEnum["ServerErrorStatus"]
						);
						break;

					case eErrorSeverity.low:
						StatesManager.PushState(
							StatesManager.StatePropertiesEnum.ServerErrorStatus,
							eErrorSeverity.low,
							StatesManager.StatePropertiesEnum["ServerErrorStatus"]
						);
						break;
				}

				var error = {
					Message: strError,
					AccountNumber: Customer.prop.accountNumber,
					UserAgent: window.navigator.userAgent,
				};

				Logger.error(functionName, JSON.stringify(error), general.emptyFn, severityLevel);
			}*/
		}

		function onWarning(source, warningMessage) {
			var warning = {
				Message: warningMessage,
				AccountNumber: Customer.prop.accountNumber,
				UserAgent: window.navigator.userAgent,
			};

			Logger.warn(source, JSON.stringify(warning));
		}

		function getFullExceptionMessage(ex) {
			return ex.getFullExceptionMessage();
		}

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
		function createErrorType(name, handler) {
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
		}

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
