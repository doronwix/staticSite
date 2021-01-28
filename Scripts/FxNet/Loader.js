define(["global/UrlResolver", "handlers/AjaxError"], function Loader(UrlResolver, AjaxError) {
	var snippetLenghtThreshold = 20; // done to avoid waff responses and not to limit the response length

	function get(url, callback, contentType, nocache) {
		callback = callback || function () {};

		var xhr = new XMLHttpRequest();

		if (nocache) {
			url += url.indexOf("?") < 0 ? "?" : "&";
			url += UrlResolver.getRndKeyValue();
		}

		xhr.onreadystatechange = function () {
			if (this.readyState !== 4) {
				return;
			}
			var headers = xhr.getAllResponseHeaders ? xhr.getAllResponseHeaders() : "";
			if (this.status >= 200 && this.status < 400) {
				callback(null, this.responseText || "");
			} else if (this.status === 401) {
				callback(
					new AjaxError(
						this.status,
						"unauthorized",
						url,
						this.responseText.substring(0, snippetLenghtThreshold)
					)
				);
			} else if (this.status === 403) {
				callback(
					new AjaxError(this.status, "forbidden", url, this.responseText.substring(0, snippetLenghtThreshold))
				);
			} else if (this.status === 420) {
				callback(
					new AjaxError(
						this.status,
						"invalid_version",
						url,
						this.responseText.substring(0, snippetLenghtThreshold)
					)
				);
			} else if (this.status === 417) {
				callback(
					new AjaxError(
						this.status,
						"double_request",
						url,
						this.responseText.substring(0, snippetLenghtThreshold)
					)
				);
			} else if (this.status === 0) {
				callback(new AjaxError(0, "abort" + "response headers: " + headers, url));
			} else {
				callback(
					new AjaxError(this.status, "unknown", url, this.responseText.substring(0, snippetLenghtThreshold))
				);
			}
		};

		xhr.open("GET", url, true);

		if (!UrlResolver.isCors(url)) {
			if (contentType) {
				xhr.setRequestHeader("Content-Type", contentType);
			}
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		}

		xhr.send();
	}

	return {
		get: get,
	};
});
