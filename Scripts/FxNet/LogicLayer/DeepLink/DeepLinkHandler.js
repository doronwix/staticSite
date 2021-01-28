define("deepLinks/DeepLinkHandler", [
	"require",
	"knockout",
	"Q",
	"handlers/general",
	"deepLinks/DeepLinkParameterValidator",
	"deepLinks/DeepLinkParameterConverter",
	"global/UrlResolver",
	"generalmanagers/ErrorManager",
	"modules/permissionsmodule",
	"fxnet/fxnet",
	"generalmanagers/locationWrapper",
	"customEnums/routes",
], function DeepLinkHandler(require) {
	var urlResolver = require("global/UrlResolver"),
		ko = require("knockout"),
		q = require("Q"),
		general = require("handlers/general"),
		deepLinkParameterValidator = require("deepLinks/DeepLinkParameterValidator"),
		deepLinkParameterConverter = require("deepLinks/DeepLinkParameterConverter"),
		errorManager = require("generalmanagers/ErrorManager"),
		permissionsModule = require("modules/permissionsmodule"),
		locationWrapper = require("generalmanagers/locationWrapper"),
		eFormsDeepLinkMap = require("customEnums/routes"),
		regirectPattern = new RegExp("(.*)/" + urlResolver.getRedirectPath() + "/(.*)", "i");

	return function DeepLinkHandlerImplementation() {
		var isDeepLinkRedirect = false,
			processActionsDefer = q.defer(),
			redirectResult = null,
			params = null,
			actions = null,
			_deepLinkLogName = "";

		//------------------------------------------
		function resetRedirectProperties(startUpForm, args) {
			isDeepLinkRedirect = false;
			redirectResult = { startUpForm: startUpForm, args: args, isDeepLink: false, mode: null };
		}

		//------------------------------------------
		function initializeRedirectProperties() {
			resetRedirectProperties(null, null);
		}

		//------------------------------------------
		function getParameterValue(mappingParameter, requestParameter) {
			if (!mappingParameter.ValueFromRequest) {
				return mappingParameter.Value;
			}

			if (
				!general.isEmptyType(requestParameter) &&
				deepLinkParameterValidator.IsValid(mappingParameter, requestParameter)
			) {
				return deepLinkParameterConverter.Convert(mappingParameter, requestParameter);
			}

			if (mappingParameter.Optional) {
				return null;
			}

			return mappingParameter.DefaultValue;
		}

		//------------------------------------------
		function parseParams(mappingParams, deepLinkParams) {
			params = {};

			if (general.isEmptyType(mappingParams)) {
				return;
			}

			for (var param in mappingParams) {
				if (!mappingParams.hasOwnProperty(param)) {
					continue;
				}

				var paramValue = getParameterValue(mappingParams[param], getValueFromObject(deepLinkParams, param));

				if (general.isEmptyType(paramValue)) {
					continue;
				}

				params[param] = paramValue;
			}
		}

		//------------------------------------------
		function getValueFromObject(obj, propertyName) {
			if (!obj || !propertyName) {
				return null;
			}

			var key = Object.keys(obj).find(function (property) {
				return property.toLowerCase() === propertyName.toLowerCase();
			});

			if (!key) {
				return null;
			}

			return obj[key];
		}

		//------------------------------------------
		function isDeepLinkDataValid(deepLinkData) {
			return (
				!general.isEmptyType(deepLinkData) &&
				!general.isNullOrUndefined(getValueFromObject(eFormsDeepLinkMap, deepLinkData.Name))
			);
		}

		//------------------------------------------
		function setRedirectData(mapping, deepLinkData) {
			isDeepLinkRedirect = true;

			redirectResult.startUpForm = getParameterValue(mapping.Form, getValueFromObject(deepLinkData, "Form"));
			redirectResult.args = mapping.PassParametersToViews === true ? params : {};
			redirectResult.isDeepLink = true;
			redirectResult.mode = deepLinkData.mode;
		}

		//------------------------------------------
		function parseRedirectUrl(url) {
			var redirectMatch = url.match(regirectPattern);

			if (!redirectMatch || redirectMatch.length != 3) {
				return null;
			}

			url = redirectMatch[1] + "?Name=" + redirectMatch[2].replace("?", "&");

			return general.urlDecode(url);
		}

		//------------------------------------------
		function getDeepLinkDataFromUrl(url) {
			var urlProcessors = [general.urlDecode, parseRedirectUrl];

			for (var i = 0; i < urlProcessors.length; i++) {
				var deepLinkData = urlProcessors[i](url);

				if (isDeepLinkDataValid(deepLinkData)) {
					return deepLinkData;
				}
			}

			return null;
		}

		//------------------------------------------
		function processDeepLinkData(url) {
			var deepLinkData = getDeepLinkDataFromUrl(url);

			if (!deepLinkData) {
				return;
			}

			_deepLinkLogName = deepLinkData.Name;
			var mapping = getValueFromObject(eFormsDeepLinkMap, deepLinkData.Name);

			if (!mapping) {
				return;
			}

			if (!permissionsModule.CheckFormPermissions(mapping.Form.Value || mapping.Form.DefaultValue, true)) {
				return;
			}

			actions = mapping.Actions;
			parseParams(mapping.Parameters, deepLinkData);

			setRedirectData(mapping, deepLinkData);
		}

		//------------------------------------------
		function processActions() {
			if (!actions) {
				return;
			}

			var fxNet = require("fxnet/fxnet");

			q.when(fxNet.UiRenderedPromise)
				.then(function () {
					require(actions, function processResolvedActions() {
						var handlers = actions.map(function getHandler(handlerName) {
							var handler = require(handlerName);

							if (handler && handler.HandleDeepLink) {
								return q.fcall(handler.HandleDeepLink, params);
							}

							errorManager.onWarning(
								"DeepLinkHandler:processActions",
								"HandleDeepLink name:" + _deepLinkLogName + " params:" + JSON.stringify(params)
							);
							return null;
						});

						q.all(handlers)
							.then(function resolveProcessActionsPromise() {
								processActionsDefer.resolve();
							})
							.done();
					});
				})
				.done();
		}

		//------------------------------------------
		function shouldRedirect() {
			return isDeepLinkRedirect === true;
		}

		//------------------------------------------
		function init() {
			initializeRedirectProperties();

			var url = locationWrapper.GetAbsoluteLocation();

			processDeepLinkData(url);
			publishEvent(url);
		}

		function publishEvent(url) {
			var deepLinkData = getDeepLinkDataFromUrl(url);

			if (general.isNullOrUndefined(deepLinkData)) {
				return;
			}

			var eventData = {};

			if (!general.isNullOrUndefined(deepLinkData.evt)) {
				eventData.evt = deepLinkData.evt;
			}

			if (!general.isNullOrUndefined(deepLinkData.dcid)) {
				eventData.dcid = deepLinkData.dcid;
			}

			if (!general.isNullOrUndefined(eventData.evt) || !general.isNullOrUndefined(eventData.dcid)) {
				ko.postbox.publish("redirect-link-tracking", eventData);
			}
		}

		//------------------------------------------
		function handle(startUpForm, args) {
			if (!shouldRedirect()) {
				resetRedirectProperties(startUpForm, args);

				return Object.assign(
					{
						processActions: general.emptyFn,
					},
					redirectResult
				);
			}

			isDeepLinkRedirect = false;

			return Object.assign(
				{
					processActions: processActions,
				},
				redirectResult
			);
		}

		//------------------------------------------
		function internalRedirect(url) {
			processDeepLinkData(url);

			if (!shouldRedirect()) {
				resetRedirectProperties(null, null);

				return Object.assign(
					{
						processActions: general.emptyFn,
					},
					redirectResult
				);
			}

			isDeepLinkRedirect = false;

			return Object.assign(
				{
					processActions: processActions,
				},
				redirectResult
			);
		}

		return {
			Init: init,
			InternalRedirect: internalRedirect,
			Handle: handle,
			ProcessActionsCompleted: processActionsDefer.promise,
		};
	};
});
