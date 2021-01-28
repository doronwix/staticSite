/**
 *
 * Use it as dependency for other require modules to load content for specific resources.
 * The loaded content will be automatically loaded and added to Dictionary
 *
 * Example:
 * define('MyAwesomeViewModel', ['LoadDictionaryContent!MyAwesomeContentResourceName'], function() {
 *
 * });
 *
 */
define("LoadDictionaryContent", [
	"require",
	"Dictionary",
	"global/UrlResolver",
	"JSONHelper",
	"handlers/Ajaxer",
], function (require) {
	var Dictionary = require("Dictionary"),
		UrlResolver = require("global/UrlResolver"),
		JSONHelper = require("JSONHelper");

	return {
		load: function (resourceName, localRequire, onloadCallback, config) {
			if (config && config.isBuild) {
				onloadCallback(null);

				return;
			}

			var cachedValue = Dictionary.GetAllItemsForResource(resourceName);

			if (cachedValue) {
				onloadCallback(cachedValue);
			} else {
				var callerName = "LoadDictionaryContent!" + resourceName;
				var contentToLoadUrl = UrlResolver.getContentPath(resourceName);

				var ajaxer = new TAjaxer();
				ajaxer.get(
					callerName,
					contentToLoadUrl,
					"",
					function (responseText) {
						var content = JSONHelper.STR2JSON(callerName, responseText) || {};

						if (resourceName === "contentdata") {
							Object.keys(content).forEach(function (key, index) {
								Dictionary.AddResource(key, content[key]);
							});
						} else {
							Dictionary.AddResource(resourceName, content);
						}

						onloadCallback(content);
					},
					null,
					null,
					null,
					null,
					false
				);
			}
		},
	};
});
