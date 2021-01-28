function AjaxError(httpStatus, message, requestUrl, responseSnippet) {
	this.httpStatus = httpStatus;
	this.message = message;
	this.requestUrl = requestUrl;
	this.responseSnippet = encodeURI(responseSnippet);

	if (!Error.captureStackTrace) {
		this.stack = new Error().stack;
	} else {
		Error.captureStackTrace(this, this.constructor);
	}
}

AjaxError.prototype = Object.create(Error.prototype);
AjaxError.prototype.constructor = AjaxError;
AjaxError.prototype.toString = function () {
	return (
		this.httpStatus +
		" " +
		this.message +
		(this.requestUrl ? " " + this.requestUrl : "") +
		(this.responseSnippet ? " " + this.responseSnippet : "")
	);
};

AjaxError.fromXHR = function (xhr, message, requestUrl) {
	message +=
		"; xhr (statusText: " +
		xhr.statusText +
		", responseType: " +
		(xhr.responseType === "" ? "text" : xhr.responseType) +
		", status:" +
		xhr.status +
		")";
	return new AjaxError(xhr.status, message, requestUrl);
};

define([], function () {
	return AjaxError;
});
