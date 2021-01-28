/* global UrlResolver */
define("handlers/SyncRequestHelper", ["global/UrlResolver"], function (UrlResolver) {
	function SyncRequestHelper(requestUrl, params) {
		var req,
			appRelativePath = UrlResolver.getApplicationRelativePath();

		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			var versions = [
				"MSXML2.XmlHttp.6.0",
				"MSXML2.XmlHttp.5.0",
				"MSXML2.XmlHttp.4.0",
				"MSXML2.XmlHttp.3.0",
				"MSXML2.XmlHttp.2.0",
				"Microsoft.XmlHttp",
				"Microsoft.XMLHTTP", // old
			];

			for (var i = 0; i < versions.length; i++) {
				try {
					req = new ActiveXObject(versions[i]);
				} catch (e) {
					// empty
				}
			}
		}

		function getUrl(url) {
			var prefix;

			url = UrlResolver.getUrlWithRndKeyValue(url);

			prefix = url.startsWith(appRelativePath) || url.startsWith("http") ? String.empty : appRelativePath;

			return UrlResolver.combine(prefix, url);
		}

		if (req) {
			req.open("POST", getUrl(requestUrl), false);

			if (params) {
				//here we check if the user request a security token when not authenticated(initialized)
				//to prevent a call for security token that which will return an error
				var patt = /SecurityToken/i;
				var result = params.match(patt);

				if (result && !$customer.isAuthenticated()) {
					return false;
				} else {
					req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					req.send(params);
				}
			} else {
				req.send();
			}
		}

		return req;
	}

	return SyncRequestHelper;
});
